"use client";

import { Trash2 } from "lucide-react";
import { removeEnquiry } from "./actions";

export function DeleteButton({ id }: { id: string }) {
  return (
    <form
      action={removeEnquiry}
      onSubmit={(e) => {
        if (!window.confirm("Delete this enquiry permanently? This cannot be undone.")) e.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        className="inline-flex h-10 items-center gap-2 px-4 text-sm font-semibold text-[#a3222a] ring-1 ring-line transition-colors hover:ring-[#a3222a]"
      >
        <Trash2 aria-hidden className="size-4" /> Delete
      </button>
    </form>
  );
}
