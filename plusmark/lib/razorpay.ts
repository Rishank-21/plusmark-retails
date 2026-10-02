/**
 * Minimal server-side Razorpay REST client (Orders + Payments), authenticated with the key id and
 * secret from the environment. The secret never leaves the server; only the key id is sent to the
 * browser for Checkout.
 */
import "server-only";

const API = "https://api.razorpay.com/v1";

export interface RazorpayConfig {
  keyId: string;
  keySecret: string;
}

/** Keys from RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET, or null when online payment isn't set up. */
export function razorpayConfig(): RazorpayConfig | null {
  const keyId = process.env.RAZORPAY_KEY_ID?.trim();
  const keySecret = process.env.RAZORPAY_KEY_SECRET?.trim();
  return keyId && keySecret ? { keyId, keySecret } : null;
}

export class RazorpayError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "RazorpayError";
    this.status = status;
  }
}

export interface RazorpayOrder {
  id: string;
  amount: number;
  amount_paid: number;
  currency: string;
  receipt: string | null;
  status: "created" | "attempted" | "paid";
  /** Razorpay returns [] instead of {} when an order has no notes. */
  notes: Record<string, string> | [];
}

export interface RazorpayPayment {
  id: string;
  order_id: string | null;
  amount: number;
  currency: string;
  status: "created" | "authorized" | "captured" | "refunded" | "failed";
}

async function call<T>(cfg: RazorpayConfig, path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    method: body === undefined ? "GET" : "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${cfg.keyId}:${cfg.keySecret}`).toString("base64")}`,
      ...(body === undefined ? {} : { "Content-Type": "application/json" }),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
    cache: "no-store",
    signal: AbortSignal.timeout(15_000),
  });
  const data = (await res.json().catch(() => null)) as { error?: { description?: string } } | null;
  if (!res.ok) throw new RazorpayError(data?.error?.description || `Razorpay responded ${res.status}`, res.status);
  return data as T;
}

export const createOrder = (
  cfg: RazorpayConfig,
  order: { amount: number; currency: "INR"; receipt: string; notes: Record<string, string> },
) => call<RazorpayOrder>(cfg, "/orders", order);

export const fetchOrder = (cfg: RazorpayConfig, id: string) => call<RazorpayOrder>(cfg, `/orders/${encodeURIComponent(id)}`);

export const fetchPayment = (cfg: RazorpayConfig, id: string) =>
  call<RazorpayPayment>(cfg, `/payments/${encodeURIComponent(id)}`);

/** Captures an authorized payment (accounts without automatic capture). */
export const capturePayment = (cfg: RazorpayConfig, id: string, amount: number, currency: string) =>
  call<RazorpayPayment>(cfg, `/payments/${encodeURIComponent(id)}/capture`, { amount, currency });

/** Order notes as a plain object (see RazorpayOrder.notes). */
export const orderNotes = (o: RazorpayOrder): Record<string, string> => (Array.isArray(o.notes) ? {} : o.notes);
