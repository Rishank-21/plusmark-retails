/**
 * Enquiry storage on the website Firestore database (server-side, Admin SDK).
 *
 * Data layout:  /enquiries/{pushId} = { createdAt: <ms>, status, name, company, phone, email,
 *                                       product, size, quantity, requirement, message, ip }
 * Public access is denied by database.rules.json; only this server code reads/writes.
 */
import "server-only";
import type { Enquiry } from "./enquiry";
import { isEnquiryStatus, type EnquiryStatus } from "./db-shared";
import { websiteFirestore, websiteFirebaseConfigured } from "./firebase-admin";

export { ENQUIRY_STATUSES, isEnquiryStatus, type EnquiryStatus } from "./db-shared";

const COLLECTION = "website_enquiries";
/** Upper bound of records loaded for listing/search. Plenty for an enquiry inbox. */
const MAX_SCAN = 5000;

export interface EnquiryRecord {
  id: string;
  /** ISO timestamp. */
  createdAt: string;
  status: EnquiryStatus;
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
  ip: string;
}

type Stored = Omit<EnquiryRecord, "id" | "createdAt"> & { createdAt: number };

const str = (v: unknown) => (typeof v === "string" ? v : "");

function toRecord(id: string, v: Partial<Stored> | null): EnquiryRecord | undefined {
  if (!v || typeof v !== "object") return undefined;
  return {
    id,
    createdAt: new Date(typeof v.createdAt === "number" ? v.createdAt : 0).toISOString(),
    status: isEnquiryStatus(v.status) ? v.status : "new",
    name: str(v.name),
    company: str(v.company),
    phone: str(v.phone),
    email: str(v.email),
    product: str(v.product),
    size: str(v.size),
    customSize: str(v.customSize),
    quantity: str(v.quantity),
    requirement: str(v.requirement),
    message: str(v.message),
    ip: str(v.ip),
  };
}

/** Push keys are 20 chars of [-0-9A-Za-z_]; reject anything else before it reaches a DB path. */
export const isEnquiryId = (id: string) => /^[-0-9A-Za-z_]{1,64}$/.test(id);

export async function insertEnquiry(e: Enquiry, ip = ""): Promise<string> {
  const data: Stored = {
    createdAt: Date.now(),
    status: "new",
    name: e.name,
    company: e.company,
    phone: e.phone,
    email: e.email,
    product: e.product,
    size: e.size,
    customSize: e.customSize,
    quantity: e.quantity,
    requirement: e.requirement,
    message: e.message,
    ip,
  };
  if (!websiteFirebaseConfigured()) throw new Error("Website Firebase credentials are not configured.");
  const ref = websiteFirestore().collection(COLLECTION).doc();
  await ref.set(data);
  return ref.id;
}

/**
 * All enquiries, newest first. We read the node without orderByChild and sort in
 * memory, so it works whether or not the `.indexOn` rule has been published.
 * (An enquiry inbox is small; the MAX_SCAN cap keeps this bounded.)
 */
async function loadAll(): Promise<EnquiryRecord[]> {
  if (!websiteFirebaseConfigured()) return [];
  const snap = await websiteFirestore().collection(COLLECTION).get();
  const out: EnquiryRecord[] = [];
  snap.forEach((child) => {
    const r = toRecord(child.id, child.data() as Partial<Stored>);
    if (r) out.push(r);
  });
  out.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return out.slice(0, MAX_SCAN);
}

export interface ListOptions {
  q?: string;
  status?: EnquiryStatus;
  limit?: number;
  offset?: number;
}

export async function listEnquiries(opts: ListOptions = {}): Promise<{ rows: EnquiryRecord[]; total: number }> {
  const q = opts.q?.toLowerCase();
  const filtered = (await loadAll()).filter(
    (r) =>
      (!opts.status || r.status === opts.status) &&
      (!q ||
        [r.name, r.company, r.phone, r.email, r.product, r.message].some((f) => f.toLowerCase().includes(q))),
  );
  const limit = Math.min(Math.max(opts.limit ?? 25, 1), MAX_SCAN);
  const offset = Math.max(opts.offset ?? 0, 0);
  return { rows: filtered.slice(offset, offset + limit), total: filtered.length };
}

export async function getEnquiry(id: string): Promise<EnquiryRecord | undefined> {
  if (!isEnquiryId(id)) return undefined;
  if (!websiteFirebaseConfigured()) return undefined;
  const snap = await websiteFirestore().collection(COLLECTION).doc(id).get();
  return snap.exists ? toRecord(id, snap.data() as Partial<Stored>) : undefined;
}

export async function updateEnquiryStatus(id: string, status: EnquiryStatus) {
  if (!isEnquiryId(id)) throw new Error("Invalid enquiry id");
  if (!websiteFirebaseConfigured()) throw new Error("Website Firebase credentials are not configured.");
  const ref = websiteFirestore().collection(COLLECTION).doc(id);
  if (!(await ref.get()).exists) return;
  await ref.update({ status });
}

export async function deleteEnquiry(id: string) {
  if (!isEnquiryId(id)) throw new Error("Invalid enquiry id");
  if (!websiteFirebaseConfigured()) throw new Error("Website Firebase credentials are not configured.");
  await websiteFirestore().collection(COLLECTION).doc(id).delete();
}

export async function enquiryStats(): Promise<Record<EnquiryStatus | "total" | "last7", number>> {
  const all = await loadAll();
  const since = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const out = { total: all.length, new: 0, contacted: 0, closed: 0, last7: 0 };
  for (const r of all) {
    out[r.status] += 1;
    if (Date.parse(r.createdAt) >= since) out.last7 += 1;
  }
  return out;
}
