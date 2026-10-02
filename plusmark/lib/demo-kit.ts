import { z } from "zod";

/** Demo kit deposit: ₹600, fixed on the server and refunded once the customer's order is confirmed. */
export const DEMO_KIT_AMOUNT_INR = 600;
export const DEMO_KIT_AMOUNT_PAISE = DEMO_KIT_AMOUNT_INR * 100;
/** Tag on every order this flow creates; verification accepts no other payment. */
export const DEMO_KIT_PURPOSE = "demo-kit";

/** Request a demo kit: who it is for and where to deliver it. */
export const demoKitSchema = z.object({
  product: z.string().trim().regex(/^[a-z0-9-]{2,80}$/, "Unknown product"),
  name: z.string().trim().min(2, "Please enter your name").max(80),
  phone: z
    .string()
    .trim()
    .regex(/^[+()\-\s\d]{8,20}$/, "Please enter a valid phone number"),
  email: z.string().trim().email("Please enter a valid email address").max(120),
  company: z.string().trim().max(120).optional().default(""),
  address: z.string().trim().min(8, "Please enter the delivery address").max(200),
  city: z.string().trim().min(2, "Please enter the city").max(60),
  pincode: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "Please enter a 6-digit PIN code"),
  /** Honeypot — must stay empty. */
  website: z.string().max(0).optional().default(""),
});

export type DemoKitRequest = z.infer<typeof demoKitSchema>;

/** What Razorpay Checkout hands back after a successful payment. */
export const demoKitVerifySchema = z.object({
  razorpay_order_id: z.string().regex(/^order_[A-Za-z0-9]{6,40}$/),
  razorpay_payment_id: z.string().regex(/^pay_[A-Za-z0-9]{6,40}$/),
  razorpay_signature: z.string().regex(/^[a-f0-9]{64}$/),
});
