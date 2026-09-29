import { z } from "zod";

export const enquirySchema = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(120),
  company: z.string().trim().max(160).optional().default(""),
  phone: z
    .string()
    .trim()
    .regex(/^[+()\-\s\d]{8,20}$/, "Please enter a valid phone number"),
  email: z.string().trim().email("Please enter a valid email address").max(160),
  product: z.string().trim().max(160).optional().default(""),
  size: z.string().trim().max(80).optional().default(""),
  quantity: z.string().trim().max(60).optional().default(""),
  requirement: z.string().trim().max(160).optional().default(""),
  message: z.string().trim().max(3000).optional().default(""),
  /** Honeypot — must stay empty. */
  website: z.string().max(0).optional().default(""),
});

export type Enquiry = z.infer<typeof enquirySchema>;

export { requirementOptions } from "./enquiry-options";
