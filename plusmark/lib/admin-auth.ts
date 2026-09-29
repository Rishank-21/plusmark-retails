/**
 * Minimal single-admin auth: password from ADMIN_PASSWORD, session in an
 * httpOnly cookie signed with HMAC-SHA256 (ADMIN_SESSION_SECRET).
 * Server-only — never import this from a client component.
 */
import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { connection } from "next/server";

const COOKIE = "pm_admin";
const MAX_AGE = 60 * 60 * 12; // 12 hours

function secret(): string | null {
  const s = process.env.ADMIN_SESSION_SECRET;
  return s && s.length >= 32 ? s : null;
}

export function adminConfigured() {
  return Boolean(process.env.ADMIN_PASSWORD && secret());
}

const sign = (payload: string, key: string) => createHmac("sha256", key).update(payload).digest("base64url");

function safeEqual(a: string, b: string) {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && timingSafeEqual(ab, bb);
}

/** Constant-time password check (hashing both sides equalises length). */
export function checkPassword(input: string) {
  const expected = process.env.ADMIN_PASSWORD;
  const key = secret();
  if (!expected || !key) return false;
  return safeEqual(sign(input, key), sign(expected, key));
}

export async function createSession() {
  const key = secret();
  if (!key) throw new Error("ADMIN_SESSION_SECRET is not configured");
  const exp = String(Math.floor(Date.now() / 1000) + MAX_AGE);
  const store = await cookies();
  store.set(COOKIE, `${exp}.${sign(exp, key)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function destroySession() {
  (await cookies()).delete(COOKIE);
}

export async function isAdmin(): Promise<boolean> {
  // Always evaluate per request — never let an admin page be prerendered at build time
  // (env vars may be absent during the build and present at runtime).
  await connection();
  const key = secret();
  if (!key || !process.env.ADMIN_PASSWORD) return false;
  const raw = (await cookies()).get(COOKIE)?.value;
  if (!raw) return false;
  const [exp, sig] = raw.split(".");
  if (!exp || !sig || !safeEqual(sig, sign(exp, key))) return false;
  return Number(exp) * 1000 > Date.now();
}

/** Use at the top of every admin page, action and route handler. */
export async function requireAdmin() {
  if (!(await isAdmin())) redirect("/admin/login");
}
