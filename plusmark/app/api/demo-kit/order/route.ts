import { NextResponse } from "next/server";
import { getProduct } from "@/data/products";
import { DEMO_KIT_AMOUNT_PAISE, DEMO_KIT_PURPOSE, demoKitSchema } from "@/lib/demo-kit";
import { createOrder, razorpayConfig, RazorpayError } from "@/lib/razorpay";

/**
 * Starts a demo kit payment: validates the delivery details and creates a Razorpay order for the
 * fixed ₹600 deposit. The amount is set here, never taken from the browser. The details travel in
 * the order's notes, so verification reads them back from Razorpay instead of trusting the client.
 */

const hits = new Map<string, number[]>();
const WINDOW = 10 * 60 * 1000;
const LIMIT = 8;

function rateLimited(ip: string) {
  const now = Date.now();
  const list = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW);
  list.push(now);
  hits.set(ip, list);
  return list.length > LIMIT;
}

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (rateLimited(ip)) {
    return NextResponse.json({ ok: false, error: "Too many attempts. Please try again in a few minutes." }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  const parsed = demoKitSchema.safeParse(body);
  if (!parsed.success) {
    const fieldErrors = Object.fromEntries(parsed.error.issues.map((i) => [String(i.path[0] ?? "form"), i.message]));
    return NextResponse.json({ ok: false, error: "Please check the highlighted fields.", fieldErrors }, { status: 422 });
  }
  const d = parsed.data;
  // Honeypot filled: a bot. Refuse without detail.
  if (d.website) return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });

  const product = getProduct(d.product);
  if (!product) return NextResponse.json({ ok: false, error: "Unknown product." }, { status: 404 });

  const cfg = razorpayConfig();
  if (!cfg) {
    return NextResponse.json(
      { ok: false, error: "Online payment isn't available right now. Please call or WhatsApp us to order a demo kit." },
      { status: 503 },
    );
  }

  try {
    const order = await createOrder(cfg, {
      amount: DEMO_KIT_AMOUNT_PAISE,
      currency: "INR",
      receipt: `demokit_${Date.now().toString(36)}`,
      // Razorpay notes: up to 15 keys, 256 characters each (the schema keeps every field shorter).
      notes: {
        purpose: DEMO_KIT_PURPOSE,
        product: product.slug,
        productName: product.name.slice(0, 250),
        name: d.name,
        phone: d.phone,
        email: d.email,
        company: d.company,
        address: d.address,
        city: d.city,
        pincode: d.pincode,
      },
    });
    return NextResponse.json({ ok: true, orderId: order.id, amount: order.amount, currency: order.currency, keyId: cfg.keyId });
  } catch (err) {
    console.error("[demo-kit] order creation failed", err instanceof RazorpayError ? `${err.status} ${err.message}` : err);
    return NextResponse.json({ ok: false, error: "We couldn't start the payment. Please try again." }, { status: 502 });
  }
}
