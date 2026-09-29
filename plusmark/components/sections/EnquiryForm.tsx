"use client";

import { useEffect, useId, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, CheckCircle2, Loader2, MessageCircle, AlertCircle } from "lucide-react";
import { requirementOptions } from "@/lib/enquiry-options";
import { cn } from "@/lib/utils";

interface Option {
  slug: string;
  name: string;
  group: string;
  /** Selectable sizes; the Size field only appears when there is more than one. */
  sizes: string[];
}

/** Extra choice in the Size field for sizes not in the list. */
const OTHER_SIZE = "Other / custom size";

type Values = {
  name: string;
  company: string;
  phone: string;
  email: string;
  product: string;
  size: string;
  quantity: string;
  requirement: string;
  message: string;
  website: string;
};

const initial: Values = {
  name: "",
  company: "",
  phone: "",
  email: "",
  product: "",
  size: "",
  quantity: "",
  requirement: "",
  message: "",
  website: "",
};

/** Lightweight client validation mirroring the server zod schema. */
function validate(v: Values) {
  const e: Partial<Record<keyof Values, string>> = {};
  if (v.name.trim().length < 2) e.name = "Please enter your name";
  if (!/^[+()\-\s\d]{8,20}$/.test(v.phone.trim())) e.phone = "Please enter a valid phone number";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.email.trim())) e.email = "Please enter a valid email address";
  if (v.message.length > 3000) e.message = "Please keep the message under 3000 characters";
  return e;
}

export function EnquiryForm({ products, whatsapp }: { products: Option[]; whatsapp?: string }) {
  const [values, setValues] = useState<Values>(initial);
  const [errors, setErrors] = useState<Partial<Record<keyof Values, string>>>({});
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [formError, setFormError] = useState("");
  const uid = useId();

  // Pre-fill product from ?product=<slug> and size from ?size=<label> (only if that product offers it)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const match = products.find((p) => p.slug === params.get("product"));
    if (!match) return;
    const size = params.get("size") ?? "";
    setValues((v) => ({ ...v, product: match.name, size: match.sizes.includes(size) ? size : "" }));
  }, [products]);

  const sizes = products.find((p) => p.name === values.product)?.sizes ?? [];

  const set = (k: keyof Values) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const value = e.target.value;
    // A new product has its own size list, so clear the previous size.
    setValues((v) => ({ ...v, [k]: value, ...(k === "product" ? { size: "" } : {}) }));
    if (errors[k]) setErrors((er) => ({ ...er, [k]: undefined }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate(values);
    setErrors(errs);
    if (Object.keys(errs).length) {
      setFormError("Please check the highlighted fields.");
      document.getElementById(`${uid}-${Object.keys(errs)[0]}`)?.focus();
      return;
    }
    setStatus("sending");
    setFormError("");
    try {
      const res = await fetch("/api/enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string; fieldErrors?: Record<string, string> };
      if (!res.ok || !data.ok) {
        if (data.fieldErrors) setErrors(data.fieldErrors as typeof errors);
        setFormError(data.error || "Something went wrong. Please try again.");
        setStatus("error");
        return;
      }
      setStatus("sent");
      setValues(initial);
    } catch {
      setFormError("Network error — please check your connection and try again.");
      setStatus("error");
    }
  };

  const waHref = whatsapp
    ? `https://wa.me/${whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(
        `Hello Plusmark, I would like to enquire about ${values.product || "your products"}.${values.size ? ` Size: ${values.size}.` : ""}${values.quantity ? ` Quantity: ${values.quantity}.` : ""}${values.name ? ` — ${values.name}` : ""}`,
      )}`
    : null;

  const field = (k: keyof Values) => ({
    id: `${uid}-${k}`,
    name: k,
    value: values[k],
    onChange: set(k),
    "aria-invalid": errors[k] ? true : undefined,
    "aria-describedby": errors[k] ? `${uid}-${k}-err` : undefined,
  });

  const groups = Array.from(new Set(products.map((p) => p.group)));

  return (
    <div className="relative">
      <AnimatePresence mode="wait" initial={false}>
        {status === "sent" ? (
          <motion.div
            key="sent"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex min-h-[28rem] flex-col items-start justify-center bg-white p-8 ring-1 ring-fog md:p-12"
            role="status"
          >
            <CheckCircle2 aria-hidden className="size-8 text-verdant" />
            <h3 className="mt-6 font-display text-3xl font-semibold">Thank you — enquiry received.</h3>
            <p className="mt-3 max-w-md text-steel">The Plusmark team will get back to you shortly with details for your requirement.</p>
            <button type="button" onClick={() => setStatus("idle")} className="mt-8 text-sm font-semibold text-accent hover:text-graphite">
              Send another enquiry →
            </button>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onSubmit={onSubmit}
            noValidate
            className="bg-white p-6 ring-1 ring-fog md:p-10"
            aria-describedby={formError ? `${uid}-form-err` : undefined}
          >
            <div className="grid gap-x-6 gap-y-5 md:grid-cols-2">
              <Field label="Name" required error={errors.name} htmlFor={`${uid}-name`} errId={`${uid}-name-err`}>
                <input {...field("name")} autoComplete="name" required className={inputCls(!!errors.name)} />
              </Field>
              <Field label="Company / Institution" htmlFor={`${uid}-company`}>
                <input {...field("company")} autoComplete="organization" className={inputCls(false)} />
              </Field>
              <Field label="Phone" required error={errors.phone} htmlFor={`${uid}-phone`} errId={`${uid}-phone-err`}>
                <input {...field("phone")} type="tel" autoComplete="tel" inputMode="tel" required className={inputCls(!!errors.phone)} />
              </Field>
              <Field label="Email" required error={errors.email} htmlFor={`${uid}-email`} errId={`${uid}-email-err`}>
                <input {...field("email")} type="email" autoComplete="email" required className={inputCls(!!errors.email)} />
              </Field>
              <Field label="Product" htmlFor={`${uid}-product`}>
                <select {...field("product")} className={inputCls(false)}>
                  <option value="">Select a product (optional)</option>
                  {groups.map((g) => (
                    <optgroup key={g} label={g}>
                      {products
                        .filter((p) => p.group === g)
                        .map((p) => (
                          <option key={p.slug} value={p.name}>
                            {p.name}
                          </option>
                        ))}
                    </optgroup>
                  ))}
                </select>
              </Field>
              {sizes.length > 0 && (
                <Field label="Size" htmlFor={`${uid}-size`}>
                  <select {...field("size")} className={inputCls(false)}>
                    <option value="">Select a size (optional)</option>
                    {sizes.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                    <option>{OTHER_SIZE}</option>
                  </select>
                </Field>
              )}
              <Field label="Quantity" htmlFor={`${uid}-quantity`}>
                <input {...field("quantity")} inputMode="numeric" placeholder="e.g. 25" className={inputCls(false)} />
              </Field>
              <Field label="Requirement" htmlFor={`${uid}-requirement`} className={sizes.length > 0 ? undefined : "md:col-span-2"}>
                <select {...field("requirement")} className={inputCls(false)}>
                  <option value="">Select requirement (optional)</option>
                  {requirementOptions.map((r) => (
                    <option key={r}>{r}</option>
                  ))}
                </select>
              </Field>
              <Field label="Message" error={errors.message} htmlFor={`${uid}-message`} errId={`${uid}-message-err`} className="md:col-span-2">
                <textarea {...field("message")} rows={4} placeholder="Sizes, colours, delivery location or any other details" className={cn(inputCls(!!errors.message), "h-auto py-3")} />
              </Field>
              {/* honeypot */}
              <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
                <label>
                  Website
                  <input tabIndex={-1} autoComplete="off" {...field("website")} />
                </label>
              </div>
            </div>

            {formError && (
              <p id={`${uid}-form-err`} role="alert" className="mt-6 flex items-center gap-2 text-sm text-[#a3222a]">
                <AlertCircle aria-hidden className="size-4" /> {formError}
              </p>
            )}

            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
              <button
                type="submit"
                disabled={status === "sending"}
                className="group inline-flex h-12 items-center justify-center gap-3 bg-graphite px-7 text-sm font-semibold text-white transition-colors hover:bg-ink disabled:opacity-70"
              >
                {status === "sending" ? (
                  <>
                    <Loader2 aria-hidden className="size-4 animate-spin" /> Sending…
                  </>
                ) : (
                  <>
                    Request Enquiry
                    <ArrowRight aria-hidden className="size-4 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </button>
              {waHref && (
                <a
                  href={waHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-12 items-center justify-center gap-2 px-5 text-sm font-semibold text-verdant ring-1 ring-line transition-colors hover:ring-verdant"
                >
                  <MessageCircle aria-hidden className="size-4" /> WhatsApp Enquiry
                </a>
              )}
              <p className="text-xs text-steel sm:ml-auto">
                <span aria-hidden className="text-accent">*</span> Required fields
              </p>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}

const inputCls = (err: boolean) =>
  cn(
    "h-12 w-full bg-mist px-4 text-sm text-graphite ring-1 transition-[box-shadow,background-color] placeholder:text-alu-dark focus:bg-white focus:outline-none focus:ring-2",
    err ? "ring-[#a3222a] focus:ring-[#a3222a]" : "ring-transparent focus:ring-graphite",
  );

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
  errId?: string;
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
