/**
 * Multi-channel delivery for website enquiries:
 * 
 * 1. SMS (Text Message to Admin):
 *    - Twilio SMS: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER, ADMIN_SMS_PHONE
 *    - Fast2SMS (India): FAST2SMS_API_KEY, ADMIN_SMS_PHONE
 *    - Generic SMS Gateway: SMS_GATEWAY_URL (with {phone} and {message} placeholders)
 * 
 * 2. WhatsApp (Message to Admin):
 *    - Twilio WhatsApp: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_WHATSAPP_FROM, ADMIN_WHATSAPP_NUMBER
 *    - WhatsApp Cloud API: WHATSAPP_API_TOKEN, WHATSAPP_PHONE_NUMBER_ID, ADMIN_WHATSAPP_NUMBER
 *    - CallMeBot WhatsApp (Free instant gateway): CALLMEBOT_PHONE, CALLMEBOT_API_KEY
 * 
 * 3. Webhook (Zapier, Make, Pabbly, CRM, Slack):
 *    - ENQUIRY_WEBHOOK_URL
 * 
 * 4. Email (Resend):
 *    - RESEND_API_KEY, ENQUIRY_TO_EMAIL, ENQUIRY_FROM_EMAIL
 */
import "server-only";
import type { Enquiry } from "./enquiry";

const DEFAULT_ADMIN_PHONE = "+919913967888";

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

export function enquirySmsText(e: Enquiry) {
  const parts = [
    `Plusmark Enquiry:`,
    `Name: ${e.name}`,
    `Phone: ${e.phone}`,
    e.product ? `Product: ${e.product}` : null,
    e.size ? `Size: ${e.size}` : null,
    e.quantity ? `Qty: ${e.quantity}` : null,
    e.requirement ? `Req: ${e.requirement}` : null,
    e.company ? `Company: ${e.company}` : null,
    e.message ? `Msg: ${e.message.slice(0, 100)}` : null,
  ].filter(Boolean);
  return parts.join("\n");
}

export function enquiryWhatsappText(e: Enquiry) {
  return `🔔 *New Website Enquiry — Plusmark Boards*

👤 *Name:* ${e.name}
📞 *Phone:* ${e.phone}
✉️ *Email:* ${e.email}
🏢 *Company:* ${e.company || "N/A"}
📦 *Product:* ${e.product || "General"}
📐 *Size:* ${e.size || "N/A"}
🔢 *Quantity:* ${e.quantity || "N/A"}
📋 *Requirement:* ${e.requirement || "N/A"}

💬 *Message:*
${e.message || "No additional message"}`.trim();
}

/** Sends SMS to Admin via configured providers (Twilio / Fast2SMS / Gateway) */
async function sendSmsNotification(e: Enquiry): Promise<boolean> {
  const adminPhone = process.env.ADMIN_SMS_PHONE || process.env.NEXT_PUBLIC_CONTACT_PHONE || DEFAULT_ADMIN_PHONE;
  const message = enquirySmsText(e);
  let sent = false;

  // 1. Fast2SMS (Indian SMS API)
  const fast2smsKey = process.env.FAST2SMS_API_KEY;
  if (fast2smsKey) {
    try {
      const cleanPhone = adminPhone.replace(/\D/g, "").slice(-10);
      const res = await fetch("https://www.fast2sms.com/dev/bulkV2", {
        method: "POST",
        headers: {
          authorization: fast2smsKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          route: "q",
          message,
          language: "english",
          flash: 0,
          numbers: cleanPhone,
        }),
      });
      if (res.ok) sent = true;
      else {
        const errText = await res.text();
        console.error("[enquiry-sms] Fast2SMS error:", res.status, errText);
      }
    } catch (err) {
      console.error("[enquiry-sms] Fast2SMS request failed:", err);
    }
  }

  // 2. Twilio SMS
  const twilioSid = process.env.TWILIO_ACCOUNT_SID;
  const twilioToken = process.env.TWILIO_AUTH_TOKEN;
  const twilioFrom = process.env.TWILIO_PHONE_NUMBER;
  if (twilioSid && twilioToken && twilioFrom) {
    try {
      const formattedPhone = adminPhone.startsWith("+") ? adminPhone : `+91${adminPhone.replace(/\D/g, "").slice(-10)}`;
      const auth = Buffer.from(`${twilioSid}:${twilioToken}`).toString("base64");
      const body = new URLSearchParams({
        From: twilioFrom,
        To: formattedPhone,
        Body: message,
      });
      const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`, {
        method: "POST",
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: body.toString(),
      });
      if (res.ok) sent = true;
      else {
        const errText = await res.text();
        console.error("[enquiry-sms] Twilio SMS error:", res.status, errText);
      }
    } catch (err) {
      console.error("[enquiry-sms] Twilio SMS request failed:", err);
    }
  }

  // 3. Generic SMS Gateway URL
  const smsGatewayUrl = process.env.SMS_GATEWAY_URL;
  if (smsGatewayUrl) {
    try {
      const targetUrl = smsGatewayUrl
        .replace("{phone}", encodeURIComponent(adminPhone.replace(/\D/g, "").slice(-10)))
        .replace("{message}", encodeURIComponent(message));
      const res = await fetch(targetUrl);
      if (res.ok) sent = true;
    } catch (err) {
      console.error("[enquiry-sms] SMS Gateway error:", err);
    }
  }

  return sent;
}

/** Sends WhatsApp notification to Admin */
async function sendWhatsAppNotification(e: Enquiry): Promise<boolean> {
  const adminWhatsApp = process.env.ADMIN_WHATSAPP_NUMBER || process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || DEFAULT_ADMIN_PHONE;
  const message = enquiryWhatsappText(e);
  let sent = false;

  // 1. Twilio WhatsApp
  const twilioSid = process.env.TWILIO_ACCOUNT_SID;
  const twilioToken = process.env.TWILIO_AUTH_TOKEN;
  const twilioWaFrom = process.env.TWILIO_WHATSAPP_FROM; // e.g. "whatsapp:+14155238886"
  if (twilioSid && twilioToken && twilioWaFrom) {
    try {
      const cleanNum = adminWhatsApp.replace(/\D/g, "").slice(-10);
      const toWa = adminWhatsApp.startsWith("whatsapp:") ? adminWhatsApp : `whatsapp:+91${cleanNum}`;
      const auth = Buffer.from(`${twilioSid}:${twilioToken}`).toString("base64");
      const body = new URLSearchParams({
        From: twilioWaFrom.startsWith("whatsapp:") ? twilioWaFrom : `whatsapp:${twilioWaFrom}`,
        To: toWa,
        Body: message,
      });
      const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`, {
        method: "POST",
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: body.toString(),
      });
      if (res.ok) sent = true;
      else {
        const errText = await res.text();
        console.error("[enquiry-whatsapp] Twilio WhatsApp error:", res.status, errText);
      }
    } catch (err) {
      console.error("[enquiry-whatsapp] Twilio WhatsApp request failed:", err);
    }
  }

  // 2. Official WhatsApp Cloud API (Meta)
  const metaToken = process.env.WHATSAPP_API_TOKEN;
  const metaPhoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  if (metaToken && metaPhoneId) {
    try {
      const cleanNum = adminWhatsApp.replace(/\D/g, "").slice(-10);
      const res = await fetch(`https://graph.facebook.com/v18.0/${metaPhoneId}/messages`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${metaToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          recipient_type: "individual",
          to: `91${cleanNum}`,
          type: "text",
          text: { preview_url: false, body: message },
        }),
      });
      if (res.ok) sent = true;
      else {
        const errText = await res.text();
        console.error("[enquiry-whatsapp] Meta WhatsApp Cloud API error:", res.status, errText);
      }
    } catch (err) {
      console.error("[enquiry-whatsapp] Meta WhatsApp request failed:", err);
    }
  }

  // 3. CallMeBot WhatsApp API (Quick personal bot for WhatsApp)
  const callmebotApiKey = process.env.CALLMEBOT_API_KEY;
  const callmebotPhone = process.env.CALLMEBOT_PHONE || adminWhatsApp.replace(/\D/g, "");
  if (callmebotApiKey && callmebotPhone) {
    try {
      const url = `https://api.callmebot.com/whatsapp.php?phone=${encodeURIComponent(callmebotPhone)}&text=${encodeURIComponent(message)}&apikey=${encodeURIComponent(callmebotApiKey)}`;
      const res = await fetch(url);
      if (res.ok) sent = true;
      else {
        console.error("[enquiry-whatsapp] CallMeBot error:", res.status);
      }
    } catch (err) {
      console.error("[enquiry-whatsapp] CallMeBot request failed:", err);
    }
  }

  return sent;
}

/** Sends the enquiry to every configured channel. */
export async function deliverEnquiry(
  e: Enquiry,
  opts: { type?: string; subject?: string } = {},
): Promise<"sent" | "unconfigured"> {
  const webhook = process.env.ENQUIRY_WEBHOOK_URL;
  const resendKey = process.env.RESEND_API_KEY;
  const to = process.env.ENQUIRY_TO_EMAIL;
  let anyChannelConfigured = false;
  let atLeastOneSent = false;

  // 1. Webhook delivery (e.g. Zapier / Make / Pabbly / Slack / CRM)
  if (webhook) {
    anyChannelConfigured = true;
    try {
      const res = await fetch(webhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: opts.type ?? "enquiry",
          source: "plusmarkboards.com",
          submittedAt: new Date().toISOString(),
          ...e,
        }),
      });
      if (res.ok) atLeastOneSent = true;
      else console.error(`[enquiry-webhook] responded ${res.status}`);
    } catch (err) {
      console.error("[enquiry-webhook] delivery failed:", err);
    }
  }

  // 2. Email delivery (Resend)
  if (resendKey && to) {
    anyChannelConfigured = true;
    try {
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
      if (res.ok) atLeastOneSent = true;
      else console.error(`[enquiry-email] Resend responded ${res.status}`);
    } catch (err) {
      console.error("[enquiry-email] delivery failed:", err);
    }
  }

  // 3. SMS Notification to Admin
  const isSmsConfigured = Boolean(
    process.env.FAST2SMS_API_KEY ||
    (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER) ||
    process.env.SMS_GATEWAY_URL
  );
  if (isSmsConfigured) {
    anyChannelConfigured = true;
    const smsSent = await sendSmsNotification(e);
    if (smsSent) atLeastOneSent = true;
  }

  // 4. WhatsApp Notification to Admin
  const isWhatsAppConfigured = Boolean(
    (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_WHATSAPP_FROM) ||
    (process.env.WHATSAPP_API_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID) ||
    (process.env.CALLMEBOT_API_KEY && process.env.CALLMEBOT_PHONE)
  );
  if (isWhatsAppConfigured) {
    anyChannelConfigured = true;
    const waSent = await sendWhatsAppNotification(e);
    if (waSent) atLeastOneSent = true;
  }

  if (!anyChannelConfigured) return "unconfigured";
  return atLeastOneSent ? "sent" : "unconfigured";
}
