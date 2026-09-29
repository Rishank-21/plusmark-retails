/** Enquiry status values — safe to import from client components (no node:sqlite). */
export const ENQUIRY_STATUSES = ["new", "contacted", "closed"] as const;
export type EnquiryStatus = (typeof ENQUIRY_STATUSES)[number];

export const isEnquiryStatus = (v: unknown): v is EnquiryStatus =>
  typeof v === "string" && (ENQUIRY_STATUSES as readonly string[]).includes(v);
