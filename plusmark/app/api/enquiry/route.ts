import { NextResponse } from "next/server";
import { enquirySchema, type Enquiry } from "@/lib/enquiry";
import { insertEnquiry } from "@/lib/db";

/**
 * Enquiry endpoint. Every valid enquiry is stored in Firebase Realtime Database and shown in /admin.
 * Optional notifications, configured with environment variables:
 *   ENQUIRY_WEBHOOK_URL            → POST JSON to any webhook (CRM, Zapier, Make, Slack…)
 *   RESEND_API_KEY + ENQUIRY_TO_EMAIL (+ ENQUIRY_FROM_EMAIL) → email via Resend
 * If the enquiry could neither be stored nor delivered, an error is returned
 * so leads are never silently dropped.
 */

const hits = new Map<string, number[]>();
const WINDOW = 10 * 60 * 1000;
const LIMIT = 5;

function rateLimited(ip: string) {
  const now = Date.now();
  const list = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW);
  list.push(now);
  hits.set(ip, list);
  return list.length > LIMIT;
}

function asText(e: Enquiry) {
  return [
    `Name: ${e.name}`,
    `Company / Institution: ${e.company || "-"}`,
    `Phone: ${e.phone}`,
    `Email: ${e.email}`,
    `Product: ${e.product || "-"}`,
    `Size: ${e.size || "-"}`,
    `Quantity: ${e.quantity || "-"}`,
    `Requirement: ${e.requirement || "-"}`,
    "",
    e.message || "",
  ].join("\n");
}

async function deliver(e: Enquiry): Promise<"sent" | "unconfigured"> {
  const webhook = process.env.ENQUIRY_WEBHOOK_URL;
  const resendKey = process.env.RESEND_API_KEY;
  const to = process.env.ENQUIRY_TO_EMAIL;
  let sent = false;

  if (webhook) {
    const res = await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "enquiry", source: "plusmarkboards.com", submittedAt: new Date().toISOString(), ...e }),
    });
    if (!res.ok) throw new Error(`Webhook responded ${res.status}`);
    sent = true;
  }

  if (resendKey && to) {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.ENQUIRY_FROM_EMAIL || "Plusmark Website <onboarding@resend.dev>",
        to: to.split(",").map((s) => s.trim()),
        reply_to: e.email,
        subject: `Website enquiry — ${e.product || "General"} — ${e.name}`,
        text: asText(e),
      }),
    });
    if (!res.ok) throw new Error(`Email provider responded ${res.status}`);
    sent = true;
  }

  return sent ? "sent" : "unconfigured";
}

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (rateLimited(ip)) {
    return NextResponse.json({ ok: false, error: "Too many requests. Please try again in a few minutes." }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  const parsed = enquirySchema.safeParse(body);
  if (!parsed.success) {
    const fieldErrors = Object.fromEntries(
      parsed.error.issues.map((i) => [String(i.path[0] ?? "form"), i.message]),
    );
    return NextResponse.json({ ok: false, error: "Please check the highlighted fields.", fieldErrors }, { status: 422 });
  }

  // Honeypot filled → pretend success, drop silently.
  if (parsed.data.website) return NextResponse.json({ ok: true });

  // 1) Persist for the admin panel.
  let stored = false;
  try {
    await insertEnquiry(parsed.data, ip);
    stored = true;
  } catch (err) {
    console.error("[enquiry] database insert failed", err);
  }

  // 2) Optional notifications (webhook / email). A failure here doesn't lose the lead if it was stored.
  let delivered: "sent" | "unconfigured" | "failed" = "unconfigured";
  try {
    delivered = await deliver(parsed.data);
  } catch (err) {
    delivered = "failed";
    console.error("[enquiry] delivery failed", err);
  }

  if (stored || delivered === "sent") return NextResponse.json({ ok: true });

  if (delivered === "failed") {
    return NextResponse.json({ ok: false, error: "We couldn't send your enquiry. Please try again." }, { status: 502 });
  }
  console.error("[enquiry] Not stored and no delivery channel configured — enquiry lost:\n" + asText(parsed.data));
  return NextResponse.json(
    { ok: false, error: "Online enquiries are temporarily unavailable. Please try again later." },
    { status: 503 },
  );
}
