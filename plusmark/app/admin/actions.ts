"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { checkPassword, createSession, destroySession, requireAdmin, adminConfigured } from "@/lib/admin-auth";
import { deleteEnquiry, isEnquiryId, isEnquiryStatus, updateEnquiryStatus } from "@/lib/db";

export type LoginState = { error?: string };

/* Brute-force guard: max 8 failed attempts per IP per 15 minutes. */
const failures = new Map<string, number[]>();
const WINDOW = 15 * 60 * 1000;
const MAX_FAILS = 8;

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  if (!adminConfigured()) return { error: "Admin panel is not configured on the server." };

  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const now = Date.now();
  const recent = (failures.get(ip) ?? []).filter((t) => now - t < WINDOW);
  if (recent.length >= MAX_FAILS) return { error: "Too many attempts. Please try again in 15 minutes." };

  const password = String(formData.get("password") ?? "");
  if (!checkPassword(password)) {
    recent.push(now);
    failures.set(ip, recent);
    return { error: "Incorrect password." };
  }

  failures.delete(ip);
  await createSession();
  redirect("/admin");
}

export async function logout() {
  await destroySession();
  redirect("/admin/login");
}

function parseId(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!isEnquiryId(id)) throw new Error("Invalid enquiry id");
  return id;
}

export async function setStatus(formData: FormData) {
  await requireAdmin();
  const id = parseId(formData);
  const status = formData.get("status");
  if (!isEnquiryStatus(status)) throw new Error("Invalid status");
  await updateEnquiryStatus(id, status);
  revalidatePath("/admin", "layout");
}

export async function removeEnquiry(formData: FormData) {
  await requireAdmin();
  await deleteEnquiry(parseId(formData));
  revalidatePath("/admin", "layout");
  redirect("/admin");
}
