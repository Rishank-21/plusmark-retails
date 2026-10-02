import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Razorpay Checkout signature: hex HMAC-SHA256 of "<order_id>|<payment_id>" keyed with the API key
 * secret. Only Razorpay (and this server) can produce it, so a match proves the payment was made for
 * that order. Kept free of other imports so it can be tested with plain Node.
 */
export function checkoutSignature(orderId: string, paymentId: string, secret: string) {
  return createHmac("sha256", secret).update(`${orderId}|${paymentId}`).digest("hex");
}

/** Constant-time check of the signature Checkout returned. */
export function isValidCheckoutSignature(orderId: string, paymentId: string, signature: string, secret: string) {
  const expected = Buffer.from(checkoutSignature(orderId, paymentId, secret), "utf8");
  const given = Buffer.from(signature, "utf8");
  return expected.length === given.length && timingSafeEqual(expected, given);
}
