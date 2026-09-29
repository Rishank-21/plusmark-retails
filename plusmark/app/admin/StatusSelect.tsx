"use client";

import { useFormStatus } from "react-dom";
import { ENQUIRY_STATUSES, type EnquiryStatus } from "@/lib/db-shared";
import { setStatus } from "./actions";

const labels: Record<EnquiryStatus, string> = { new: "New", contacted: "Contacted", closed: "Closed" };

function Select({ value, label }: { value: EnquiryStatus; label: string }) {
  const { pending } = useFormStatus();
  return (
    <select
      name="status"
      defaultValue={value}
      aria-label={label}
      disabled={pending}
      onChange={(e) => e.currentTarget.form?.requestSubmit()}
      className="h-9 bg-white px-2 text-sm ring-1 ring-line focus:outline-none focus:ring-2 focus:ring-graphite disabled:opacity-60"
    >
      {ENQUIRY_STATUSES.map((s) => (
        <option key={s} value={s}>
          {labels[s]}
        </option>
      ))}
    </select>
  );
}

/** Status dropdown that saves immediately on change (falls back to a Save button without JS). */
export function StatusSelect({ id, value, label = "Change status" }: { id: string; value: EnquiryStatus; label?: string }) {
  return (
    <form action={setStatus} className="flex items-center gap-2">
      <input type="hidden" name="id" value={id} />
      <Select value={value} label={label} />
      <noscript>
        <button type="submit" className="h-9 px-3 text-sm ring-1 ring-line">
          Save
        </button>
      </noscript>
    </form>
  );
}
