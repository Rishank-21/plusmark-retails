/**
 * Optional notifications for website enquiries (and paid demo kits), configured with environment
 * variables:
 *   ENQUIRY_WEBHOOK_URL            → POST JSON to any webhook (CRM, Zapier, Make, Slack…)
 *   RESEND_API_KEY + ENQUIRY_TO_EMAIL (+ ENQUIRY_FROM_EMAIL) → email via Resend
 */
import "server-only";
import type { Enquiry } from "./enquiry";

export function enquiryText(e: Enquiry) {
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

/** Sends the enquiry to every configured channel. Throws if one fails; "unconfigured" if none is set. */
export async function deliverEnquiry(
  e: Enquiry,
  opts: { type?: string; subject?: string } = {},
): Promise<"sent" | "unconfigured"> {
  const webhook = process.env.ENQUIRY_WEBHOOK_URL;
  const resendKey = process.env.RESEND_API_KEY;
  const to = process.env.ENQUIRY_TO_EMAIL;
  let sent = false;

  if (webhook) {
    const res = await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: opts.type ?? "enquiry", source: "plusmarkboards.com", submittedAt: new Date().toISOString(), ...e }),
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
        subject: opts.subject ?? `Website enquiry — ${e.product || "General"} — ${e.name}`,
        text: enquiryText(e),
      }),
    });
    if (!res.ok) throw new Error(`Email provider responded ${res.status}`);
    sent = true;
  }

  return sent ? "sent" : "unconfigured";
}
