"use client";

import { useEffect, useId, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, CheckCircle2, ChevronDown, Loader2, MessageCircle, AlertCircle } from "lucide-react";
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
  customSize: string;
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
  customSize: "",
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
    setValues((v) => ({ ...v, [k]: value, ...(k === "product" ? { size: "", customSize: "" } : k === "size" && value !== OTHER_SIZE ? { customSize: "" } : {}) }));
    if (errors[k]) setErrors((er) => ({ ...er, [k]: undefined }));
  };

  const [lastSubmitted, setLastSubmitted] = useState<Values | null>(null);

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
      setLastSubmitted(values);
      setStatus("sent");
      setValues(initial);
    } catch {
      setFormError("Network error — please check your connection and try again.");
      setStatus("error");
    }
  };

  const submittedWaHref = whatsapp && lastSubmitted
    ? `https://wa.me/${whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(
        `Hello Plusmark, I have submitted an enquiry on your website.\n*Name:* ${lastSubmitted.name}\n*Phone:* ${lastSubmitted.phone}\n*Product:* ${lastSubmitted.product || "General"}\n${lastSubmitted.size ? `*Size:* ${lastSubmitted.size === OTHER_SIZE ? lastSubmitted.customSize : lastSubmitted.size}\n` : ""}${lastSubmitted.quantity ? `*Qty:* ${lastSubmitted.quantity}\n` : ""}${lastSubmitted.requirement ? `*Requirement:* ${lastSubmitted.requirement}\n` : ""}${lastSubmitted.message ? `*Message:* ${lastSubmitted.message}` : ""}`,
      )}`
    : null;

  const waHref = whatsapp
    ? `https://wa.me/${whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(
        `Hello Plusmark, I would like to enquire about ${values.product || "your products"}.${values.size ? ` Size: ${values.size === OTHER_SIZE ? values.customSize : values.size}.` : ""}${values.quantity ? ` Quantity: ${values.quantity}.` : ""}${values.name ? ` — ${values.name}` : ""}`,
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
            className={cn(cardCls, "flex min-h-[28rem] flex-col items-start justify-center")}
            role="status"
          >
            <CheckCircle2 aria-hidden className="size-8 text-verdant" />
            <h3 className="mt-6 font-display text-3xl font-semibold">Thank you — enquiry received.</h3>
            <p className="mt-3 max-w-md text-steel">The Plusmark team will get back to you shortly with details for your requirement.</p>
            
            {submittedWaHref && (
              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
                <a
                  href={submittedWaHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[#25D366] px-6 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90"
                >
                  <MessageCircle aria-hidden className="size-4" />
                  Chat on WhatsApp with Admin
                </a>
              </div>
            )}

            <button type="button" onClick={() => { setStatus("idle"); setLastSubmitted(null); }} className="mt-8 text-sm font-semibold text-accent hover:text-graphite">
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
            className={cardCls}
            aria-describedby={formError ? `${uid}-form-err` : undefined}
          >
            <div className="mb-7 flex items-start justify-between gap-4 border-b border-fog pb-6">
              <div>
                <h3 className="font-display text-xl font-semibold text-graphite md:text-2xl">Send us your requirement</h3>
                <p className="mt-1 text-sm text-steel">We usually reply within one working day.</p>
              </div>
              <span className="hidden shrink-0 rounded-full bg-verdant-soft px-3 py-1 text-xs font-semibold text-verdant sm:inline-flex">Free quote</span>
            </div>
            <div className="grid gap-x-6 gap-y-5 md:grid-cols-2">
              <Field label="Name" required error={errors.name} htmlFor={`${uid}-name`} errId={`${uid}-name-err`}>
                <input {...field("name")} autoComplete="name" required placeholder="Your full name" className={inputCls(!!errors.name)} />
              </Field>
              <Field label="Company / Institution" htmlFor={`${uid}-company`}>
                <input {...field("company")} autoComplete="organization" placeholder="School, office or company" className={inputCls(false)} />
              </Field>
              <Field label="Phone" required error={errors.phone} htmlFor={`${uid}-phone`} errId={`${uid}-phone-err`}>
                <input {...field("phone")} type="tel" autoComplete="tel" inputMode="tel" required placeholder="+91 98765 43210" className={inputCls(!!errors.phone)} />
              </Field>
              <Field label="Email" required error={errors.email} htmlFor={`${uid}-email`} errId={`${uid}-email-err`}>
                <input {...field("email")} type="email" autoComplete="email" required placeholder="you@example.com" className={inputCls(!!errors.email)} />
              </Field>
              <Field label="Product" htmlFor={`${uid}-product`}>
                <Select {...field("product")}>
                  <option value="">Select a product</option>
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
                </Select>
              </Field>
              {sizes.length > 0 && (
                <Field label="Size" htmlFor={`${uid}-size`}>
                  <Select {...field("size")}>
                    <option value="">Select a size</option>
                    {sizes.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                    <option>{OTHER_SIZE}</option>
                  </Select>
                </Field>
              )}
              {values.size === OTHER_SIZE && (
                <Field label="Custom Size" htmlFor={`${uid}-customSize`}>
                  <input {...field("customSize")} placeholder="Enter your custom size" className={inputCls(false)} />
                </Field>
              )}
              <Field label="Quantity" htmlFor={`${uid}-quantity`}>
                <input {...field("quantity")} inputMode="numeric" placeholder="e.g. 25" className={inputCls(false)} />
              </Field>
              <Field label="Requirement" htmlFor={`${uid}-requirement`} className={sizes.length > 0 ? undefined : "md:col-span-2"}>
                <Select {...field("requirement")}>
                  <option value="">Select a requirement</option>
                  {requirementOptions.map((r) => (
                    <option key={r}>{r}</option>
                  ))}
                </Select>
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
                className="group inline-flex h-12 items-center justify-center gap-3 rounded-full bg-graphite px-8 text-sm font-semibold text-white shadow-[0_10px_24px_-12px_rgb(15_17_19/0.6)] transition-[background-color,transform] hover:-translate-y-0.5 hover:bg-ink disabled:translate-y-0 disabled:opacity-70"
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
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#25D366] px-6 text-sm font-semibold text-white shadow-[0_10px_24px_-12px_rgb(37_211_102/0.8)] transition-[filter,transform] hover:-translate-y-0.5 hover:brightness-105"
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

/** Borderless card with a soft shadow. */
const cardCls = "rounded-3xl bg-white p-6 shadow-[0_1px_2px_rgb(15_17_19/0.04),0_30px_70px_-34px_rgb(15_17_19/0.3)] md:p-10";

/** Borderless filled inputs; a soft brand ring appears on focus, red on error. */
const inputCls = (err: boolean) =>
  cn(
    "h-12 w-full rounded-xl border-0 bg-mist px-4 text-sm text-graphite outline-none ring-2 transition-[box-shadow,background-color] placeholder:text-alu-dark hover:bg-fog/70 focus:bg-white",
    err ? "bg-[#fdf0f0] ring-[#a3222a]/60 focus:ring-[#a3222a]/70" : "ring-transparent focus:ring-brand/25",
  );

/** Native select with the browser arrow replaced by a chevron that matches the inputs. */
function Select({ children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="relative">
      <select {...props} className={cn(inputCls(false), "cursor-pointer appearance-none pr-10")}>
        {children}
      </select>
      <ChevronDown aria-hidden className="pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-steel" />
    </div>
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
  errId?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className="mb-2 block text-sm font-medium text-graphite">
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
