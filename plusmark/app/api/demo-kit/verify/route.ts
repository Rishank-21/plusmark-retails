import { NextResponse } from "next/server";
import { DEMO_KIT_AMOUNT_PAISE, DEMO_KIT_PURPOSE, demoKitVerifySchema } from "@/lib/demo-kit";
import type { Enquiry } from "@/lib/enquiry";
import { insertEnquiry, recordDemoKitPayment } from "@/lib/db";
import { deliverEnquiry } from "@/lib/enquiry-delivery";
import { capturePayment, fetchOrder, fetchPayment, orderNotes, razorpayConfig } from "@/lib/razorpay";
import { isValidCheckoutSignature } from "@/lib/razorpay-signature";

/**
 * Confirms a demo kit payment after Razorpay Checkout succeeds:
 *  1. the Checkout signature must match (proves Razorpay issued this payment for this order);
 *  2. the order, read back from Razorpay, must be a ₹600 demo kit order and the payment must belong
 *     to it;
 *  3. an authorized payment is captured (accounts without automatic capture);
 * then the request is stored once (admin panel + optional email / webhook).
 */
export async function POST(req: Request) {
  const cfg = razorpayConfig();
  if (!cfg) return NextResponse.json({ ok: false, error: "Online payment isn't available right now." }, { status: 503 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }
  const parsed = demoKitVerifySchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  const { razorpay_order_id: orderId, razorpay_payment_id: paymentId, razorpay_signature: signature } = parsed.data;

  if (!isValidCheckoutSignature(orderId, paymentId, signature, cfg.keySecret)) {
    return NextResponse.json({ ok: false, error: "We couldn't verify this payment." }, { status: 400 });
  }

  try {
    const [order, payment] = await Promise.all([fetchOrder(cfg, orderId), fetchPayment(cfg, paymentId)]);
    const notes = orderNotes(order);
    if (
      notes.purpose !== DEMO_KIT_PURPOSE ||
      order.amount !== DEMO_KIT_AMOUNT_PAISE ||
      order.currency !== "INR" ||
      payment.order_id !== order.id ||
      payment.amount !== order.amount
    ) {
      return NextResponse.json({ ok: false, error: "This payment doesn't match a demo kit order." }, { status: 400 });
    }

    let status = payment.status;
    if (status === "authorized") {
      try {
        status = (await capturePayment(cfg, payment.id, payment.amount, payment.currency)).status;
      } catch {
        // Captured in the meantime (automatic capture) or a transient error: read the real state.
        status = (await fetchPayment(cfg, payment.id)).status;
      }
    }
    if (status !== "captured") {
      return NextResponse.json(
        { ok: false, error: "The payment didn't complete. If money was deducted, your bank will return it automatically." },
        { status: 402 },
      );
    }

    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "";
    await announce(orderId, paymentId, notes, ip);
    return NextResponse.json({ ok: true, paymentId });
  } catch (err) {
    console.error("[demo-kit] verification failed", orderId, paymentId, err);
    return NextResponse.json(
      {
        ok: false,
        error: `We couldn't confirm the payment right now. If money was deducted, please contact us and quote payment ID ${paymentId}.`,
      },
      { status: 502 },
    );
  }
}

/** Stores the paid request once per order and tells the team. Best effort: the payment itself is safe in Razorpay. */
async function announce(orderId: string, paymentId: string, n: Record<string, string>, ip: string) {
  let fresh = true;
  try {
    fresh = await recordDemoKitPayment({ ...n, orderId, paymentId });
  } catch (err) {
    console.error("[demo-kit] could not store the payment", orderId, err);
  }
  if (!fresh) return;

  const enquiry: Enquiry = {
    name: n.name ?? "",
    company: n.company ?? "",
    phone: n.phone ?? "",
    email: n.email ?? "",
    product: n.productName || n.product || "",
    size: "",
    quantity: "1 demo kit",
    requirement: "Demo kit (₹600 paid, refundable)",
    message: [
      "Demo kit deposit of ₹600 paid online through Razorpay.",
      `Payment ${paymentId} · Order ${orderId}`,
      "Refund the ₹600 once the order is confirmed.",
      "",
      `Deliver to: ${n.address ?? ""}, ${n.city ?? ""} ${n.pincode ?? ""}`,
    ].join("\n"),
    website: "",
  };
  try {
    await insertEnquiry(enquiry, ip);
  } catch (err) {
    console.error("[demo-kit] could not add the admin enquiry", orderId, err);
  }
  try {
    await deliverEnquiry(enquiry, { type: "demo-kit", subject: `Demo kit paid (₹600) — ${enquiry.product} — ${enquiry.name}` });
  } catch (err) {
    console.error("[demo-kit] notification failed", orderId, err);
  }
}
