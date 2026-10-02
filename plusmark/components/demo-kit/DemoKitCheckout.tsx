"use client";

import Link from "next/link";
import { useId, useState } from "react";
import { ArrowRight, CheckCircle2, Loader2, Lock, MessageCircle, Phone } from "lucide-react";
import { DEMO_KIT_AMOUNT_INR } from "@/lib/demo-kit";
import { cn } from "@/lib/utils";

type Values = {
  name: string;
  phone: string;
  email: string;
  company: string;
  address: string;
  city: string;
  pincode: string;
  /** Honeypot. */
  website: string;
};
const EMPTY: Values = { name: "", phone: "", email: "", company: "", address: "", city: "", pincode: "", website: "" };

interface CheckoutResult {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}
interface RazorpayCheckout {
  open: () => void;
  on: (event: "payment.failed", cb: (r: { error?: { description?: string } }) => void) => void;
}
declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => RazorpayCheckout;
  }
}

/** Razorpay's hosted Checkout script, loaded only when the visitor starts a payment. */
const CHECKOUT_SRC = "https://checkout.razorpay.com/v1/checkout.js";
let checkoutScript: Promise<void> | null = null;
function loadCheckout() {
  if (window.Razorpay) return Promise.resolve();
  checkoutScript ??= new Promise<void>((resolve, reject) => {
    const s = document.createElement("script");
    s.src = CHECKOUT_SRC;
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => {
      checkoutScript = null;
      s.remove();
      reject(new Error("Razorpay Checkout failed to load"));
    };
    document.head.appendChild(s);
  });
  return checkoutScript;
}

type Phase = "form" | "starting" | "paying" | "verifying" | "done";

const inputCls = (err: boolean) =>
  cn(
    "w-full bg-mist px-4 text-sm text-graphite ring-1 transition-[box-shadow,background-color] placeholder:text-alu-dark focus:bg-white focus:outline-none focus:ring-2 disabled:opacity-60",
    err ? "ring-[#a3222a] focus:ring-[#a3222a]" : "ring-transparent focus:ring-graphite",
  );

interface Props {
  product: string;
  productName: string;
  /** Razorpay keys are configured on the server. */
  enabled: boolean;
  phoneLabel: string;
  phoneHref: string;
  whatsappHref: string;
}

/**
 * Demo kit checkout: delivery details → server creates a ₹600 Razorpay order → Razorpay Checkout
 * (UPI, cards, netbanking… as enabled on the account) → server verifies and confirms.
 */
export function DemoKitCheckout({ product, productName, enabled, phoneLabel, phoneHref, whatsappHref }: Props) {
  const uid = useId();
  const [values, setValues] = useState<Values>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof Values, string>>>({});
  const [phase, setPhase] = useState<Phase>("form");
  const [message, setMessage] = useState<string | null>(null);
  const [paymentId, setPaymentId] = useState("");
  const busy = phase !== "form";

  const field = (k: keyof Values) => ({
    id: `${uid}-${k}`,
    name: k,
    value: values[k],
    disabled: busy,
    "aria-invalid": errors[k] ? true : undefined,
    "aria-describedby": errors[k] ? `${uid}-${k}-err` : undefined,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const v = e.target.value;
      setValues((s) => ({ ...s, [k]: v }));
      if (errors[k]) {
        setErrors((s) => {
          const next = { ...s };
          delete next[k];
          return next;
        });
      }
    },
  });

  async function verify(r: CheckoutResult) {
    setPhase("verifying");
    const fallback = `We couldn't confirm the payment. Please contact us and quote payment ID ${r.razorpay_payment_id}.`;
    try {
      const res = await fetch("/api/demo-kit/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(r),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok) {
        setPaymentId(data.paymentId);
        setPhase("done");
        return;
      }
      setMessage(data.error ?? fallback);
    } catch {
      setMessage(fallback);
    }
    setPhase("form");
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setMessage(null);
    setPhase("starting");
    try {
      const res = await fetch("/api/demo-kit/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, product }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        if (data.fieldErrors) setErrors(data.fieldErrors);
        setMessage(data.error ?? "We couldn't start the payment. Please try again.");
        setPhase("form");
        return;
      }
      await loadCheckout();
      if (!window.Razorpay) throw new Error("Razorpay Checkout unavailable");
      const brand = getComputedStyle(document.documentElement).getPropertyValue("--color-brand").trim() || "#1a3587";
      const checkout = new window.Razorpay({
        key: data.keyId,
        order_id: data.orderId,
        amount: data.amount,
        currency: data.currency,
        name: "Plusmark Display System",
        description: `Demo kit — ${productName}`,
        prefill: { name: values.name, email: values.email, contact: values.phone },
        theme: { color: brand },
        modal: {
          confirm_close: true,
          ondismiss: () => setPhase((p) => (p === "paying" ? "form" : p)),
        },
        handler: (r: CheckoutResult) => void verify(r),
      });
      checkout.on("payment.failed", (r) =>
        setMessage(r.error?.description ? `Payment failed: ${r.error.description}` : "The payment failed. Please try again."),
      );
      setPhase("paying");
      checkout.open();
    } catch {
      setMessage("We couldn't open the secure payment window. Please check your connection and try again.");
      setPhase("form");
    }
  }

  const card = "rounded-[var(--card-radius,0px)] bg-white p-6 ring-1 ring-fog sm:p-8";

  if (phase === "done") {
    return (
      <div role="status" className={card}>
        <CheckCircle2 aria-hidden className="size-9 text-verdant" />
        <h2 className="mt-5 font-display text-2xl font-semibold md:text-3xl">Payment received</h2>
        <p className="mt-4 max-w-lg text-[1.0625rem] leading-relaxed text-steel">
          Thank you{values.name ? `, ${values.name.split(" ")[0]}` : ""}. Your ₹{DEMO_KIT_AMOUNT_INR} demo kit deposit for the{" "}
          {productName} is paid. The Plusmark team will contact you on {values.phone} to arrange the demo kit.
        </p>
        <p className="mt-3 max-w-lg text-[1.0625rem] leading-relaxed text-steel">
          The ₹{DEMO_KIT_AMOUNT_INR} is refunded once your order is confirmed.
        </p>
        <p className="mt-6 font-mono text-xs text-alu-dark">Payment ID · {paymentId}</p>
        <Link href={`/products/${product}`} className="group mt-8 inline-flex items-center gap-2 text-sm font-semibold">
          <span className="link-underline">Back to the {productName}</span>
          <ArrowRight aria-hidden className="size-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    );
  }

  if (!enabled) {
    return (
      <div className={card}>
        <h2 className="font-display text-2xl font-semibold">Online payment is coming soon</h2>
        <p className="mt-4 max-w-lg leading-relaxed text-steel">
          To get a demo kit of the {productName} now, call or WhatsApp the Plusmark team and they will arrange the
          deposit and delivery with you.
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <a href={phoneHref} className="inline-flex h-12 items-center gap-2 rounded-full bg-graphite px-6 text-sm font-semibold text-white hover:bg-ink">
            <Phone aria-hidden className="size-4" /> Call {phoneLabel}
          </a>
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-12 items-center gap-2 rounded-full px-6 text-sm font-semibold text-verdant ring-1 ring-line hover:ring-verdant"
          >
            <MessageCircle aria-hidden className="size-4" /> WhatsApp<span className="sr-only"> (opens in a new tab)</span>
          </a>
        </div>
      </div>
    );
  }

  const busyLabel = phase === "starting" ? "Starting payment…" : phase === "paying" ? "Complete the payment…" : "Confirming payment…";

  return (
    <form onSubmit={submit} noValidate aria-labelledby={`${uid}-title`} className={card}>
      <h2 id={`${uid}-title`} className="font-display text-2xl font-semibold">
        Delivery details
      </h2>
      <p className="mt-2 text-sm text-steel">Where should the Plusmark team send your demo kit?</p>

      <div className="mt-7 grid gap-5 sm:grid-cols-2">
        <Field label="Full name" required error={errors.name} htmlFor={`${uid}-name`} errId={`${uid}-name-err`}>
          <input {...field("name")} autoComplete="name" required className={cn(inputCls(!!errors.name), "h-12")} />
        </Field>
        <Field label="Phone" required error={errors.phone} htmlFor={`${uid}-phone`} errId={`${uid}-phone-err`}>
          <input {...field("phone")} type="tel" inputMode="tel" autoComplete="tel" required className={cn(inputCls(!!errors.phone), "h-12")} />
        </Field>
        <Field label="Email" required error={errors.email} htmlFor={`${uid}-email`} errId={`${uid}-email-err`}>
          <input {...field("email")} type="email" autoComplete="email" required className={cn(inputCls(!!errors.email), "h-12")} />
        </Field>
        <Field label="School / Company" error={errors.company} htmlFor={`${uid}-company`} errId={`${uid}-company-err`}>
          <input {...field("company")} autoComplete="organization" className={cn(inputCls(!!errors.company), "h-12")} />
        </Field>
        <Field label="Delivery address" required error={errors.address} htmlFor={`${uid}-address`} errId={`${uid}-address-err`} className="sm:col-span-2">
          <textarea {...field("address")} rows={3} autoComplete="street-address" required className={cn(inputCls(!!errors.address), "min-h-24 py-3")} />
        </Field>
        <Field label="City" required error={errors.city} htmlFor={`${uid}-city`} errId={`${uid}-city-err`}>
          <input {...field("city")} autoComplete="address-level2" required className={cn(inputCls(!!errors.city), "h-12")} />
        </Field>
        <Field label="PIN code" required error={errors.pincode} htmlFor={`${uid}-pincode`} errId={`${uid}-pincode-err`}>
          <input
            {...field("pincode")}
            inputMode="numeric"
            autoComplete="postal-code"
            maxLength={6}
            required
            className={cn(inputCls(!!errors.pincode), "h-12")}
          />
        </Field>
      </div>

      {/* Honeypot: hidden from people and assistive tech; bots tend to fill it. */}
      <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor={`${uid}-website`}>Website</label>
        <input {...field("website")} tabIndex={-1} autoComplete="off" />
      </div>

      <div aria-live="polite" className="min-h-0">
        {message && (
          <p role="alert" className="mt-6 border-l-2 border-[#a3222a] bg-[#a3222a]/[0.06] px-4 py-3 text-sm leading-relaxed text-graphite">
            {message}
          </p>
        )}
      </div>

      <div className="mt-8 flex flex-col gap-4 border-t border-fog pt-6 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="submit"
          disabled={busy}
          className="group inline-flex h-12 items-center justify-center gap-2.5 rounded-full bg-graphite px-7 text-sm font-semibold text-white shadow-[0_10px_30px_-10px_rgb(15_17_19/0.55)] transition-[background-color,box-shadow] hover:bg-ink disabled:cursor-wait disabled:opacity-80"
        >
          {busy ? (
            <>
              <Loader2 aria-hidden className="size-4 animate-spin" /> {busyLabel}
            </>
          ) : (
            <>
              <Lock aria-hidden className="size-4" /> Pay ₹{DEMO_KIT_AMOUNT_INR} securely
            </>
          )}
        </button>
        <p className="text-xs leading-relaxed text-steel sm:max-w-[16rem] sm:text-right">
          Processed by Razorpay; Plusmark never sees your card or UPI details. By paying you agree to the{" "}
          <Link href="/terms" className="link-underline font-medium text-graphite">
            terms
          </Link>
          .
        </p>
      </div>
    </form>
  );
}

function Field({
  label,
  required,
  error,
  htmlFor,
  errId,
  className,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  htmlFor: string;
  errId: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className="mb-2 block font-mono text-[0.64rem] uppercase tracking-[0.14em] text-steel">
        {label}
        {required && <span aria-hidden className="text-accent"> *</span>}
      </label>
      {children}
      {error && (
        <p id={errId} className="mt-1.5 text-xs text-[#a3222a]">
          {error}
        </p>
      )}
    </div>
  );
}
