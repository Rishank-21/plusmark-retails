/**
 * Cloudflare-compatible Firebase server adapter.
 *
 * Firebase Admin SDK relies on Node code generation APIs that Workers disallow.
 * This module uses the Google service-account OAuth JWT flow and Firebase REST
 * APIs instead. The service-account JSON is read only from Worker secrets.
 */
import "server-only";
import { firebaseConfig } from "./firebase-config";

type ServiceAccount = { project_id: string; client_email: string; private_key: string };
type FirestoreValue = Record<string, unknown>;

const enc = new TextEncoder();
const base64url = (bytes: ArrayBuffer | Uint8Array) =>
  btoa(String.fromCharCode(...new Uint8Array(bytes))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

function parseServiceAccount(): ServiceAccount | null {
  const raw = process.env.FIREBASE_TARGET_SERVICE_ACCOUNT;
  if (!raw) return null;
  const value = JSON.parse(raw) as Partial<ServiceAccount>;
  if (!value.project_id || !value.client_email || !value.private_key) throw new Error("Firebase service-account secret is incomplete.");
  return { project_id: value.project_id, client_email: value.client_email, private_key: value.private_key.replace(/\\n/g, "\n") };
}

let tokenCache: { token: string; expiresAt: number } | undefined;
async function accessToken(): Promise<string> {
  if (tokenCache && tokenCache.expiresAt > Date.now() + 60_000) return tokenCache.token;
  const account = parseServiceAccount();
  if (!account) throw new Error("Firebase target service-account secret is not configured.");
  const header = base64url(enc.encode(JSON.stringify({ alg: "RS256", typ: "JWT" })));
  const now = Math.floor(Date.now() / 1000);
  const claim = base64url(enc.encode(JSON.stringify({
    iss: account.client_email,
    scope: "https://www.googleapis.com/auth/datastore https://www.googleapis.com/auth/firebase.database",
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  })));
  const pem = account.private_key.replace(/-----BEGIN PRIVATE KEY-----|-----END PRIVATE KEY-----|\s/g, "");
  const key = await crypto.subtle.importKey("pkcs8", Uint8Array.from(atob(pem), (c) => c.charCodeAt(0)), { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["sign"]);
  const signature = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", key, enc.encode(`${header}.${claim}`));
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${header}.${claim}.${base64url(signature)}`,
  });
  if (!response.ok) throw new Error(`Firebase OAuth token request failed (${response.status}).`);
  const body = await response.json() as { access_token?: string; expires_in?: number };
  if (!body.access_token) throw new Error("Firebase OAuth response did not contain an access token.");
  tokenCache = { token: body.access_token, expiresAt: Date.now() + (body.expires_in ?? 3600) * 1000 };
  return body.access_token;
}

function valueToFirestore(value: unknown): FirestoreValue {
  if (value === null) return { nullValue: null };
  if (typeof value === "string") return { stringValue: value };
  if (typeof value === "boolean") return { booleanValue: value };
  if (typeof value === "number") return Number.isInteger(value) ? { integerValue: String(value) } : { doubleValue: value };
  if (Array.isArray(value)) return { arrayValue: { values: value.map(valueToFirestore) } };
  if (typeof value === "object") return { mapValue: { fields: Object.fromEntries(Object.entries(value).map(([k, v]) => [k, valueToFirestore(v)])) } };
  return { nullValue: null };
}

function firestoreToValue(value: FirestoreValue | undefined): unknown {
  if (!value) return undefined;
  if ("nullValue" in value) return null;
  if ("stringValue" in value) return value.stringValue;
  if ("booleanValue" in value) return value.booleanValue;
  if ("integerValue" in value) return Number(value.integerValue);
  if ("doubleValue" in value) return value.doubleValue;
  if ("timestampValue" in value) return value.timestampValue;
  if ("arrayValue" in value) return ((value.arrayValue as { values?: FirestoreValue[] })?.values ?? []).map(firestoreToValue);
  if ("mapValue" in value) return Object.fromEntries(Object.entries((value.mapValue as { fields?: Record<string, FirestoreValue> })?.fields ?? {}).map(([k, v]) => [k, firestoreToValue(v)]));
  return undefined;
}

function documentData(document: { fields?: Record<string, FirestoreValue> } | null | undefined) {
  return Object.fromEntries(Object.entries(document?.fields ?? {}).map(([key, value]) => [key, firestoreToValue(value)]));
}

class DocumentSnapshot {
  constructor(public readonly id: string, private readonly document: { fields?: Record<string, FirestoreValue> } | null) {}
  get exists() { return Boolean(this.document); }
  data(): any { return documentData(this.document); }
}

class QuerySnapshot {
  constructor(public readonly docs: DocumentSnapshot[]) {}
  get empty() { return this.docs.length === 0; }
  forEach(callback: (snapshot: DocumentSnapshot) => void) { this.docs.forEach(callback); }
}

class RestDocument {
  constructor(private readonly path: string, public readonly id: string) {}
  async get() {
    const response = await firestoreFetch(this.path);
    if (response.status === 404) return new DocumentSnapshot(this.id, null);
    return new DocumentSnapshot(this.id, await response.json());
  }
  async set(data: Record<string, unknown>, options?: { merge?: boolean }) {
    let payload = data;
    if (options?.merge) payload = { ...(await this.get()).data(), ...data };
    await firestoreWrite(this.path, "PUT", payload);
  }
  async update(data: Record<string, unknown>) { await this.set(data, { merge: true }); }
  async delete() { const response = await firestoreFetch(this.path, { method: "DELETE" }); if (!response.ok && response.status !== 404) throw new Error(`Firestore delete failed (${response.status}).`); }
}

class RestCollection {
  constructor(private readonly path: string) {}
  doc(id = crypto.randomUUID().replace(/-/g, "")) { return new RestDocument(`${this.path}/${id}`, id); }
  async get() {
    const response = await firestoreFetch(this.path);
    if (!response.ok) throw new Error(`Firestore collection read failed (${response.status}).`);
    const body = await response.json() as { documents?: Array<{ name: string; fields?: Record<string, FirestoreValue> }> };
    return new QuerySnapshot((body.documents ?? []).map((document) => new DocumentSnapshot(document.name.split("/").pop()!, document)));
  }
}

class RestBatch {
  private writes: Array<{ path: string; data: Record<string, unknown> }> = [];
  set(document: RestDocument, data: Record<string, unknown>, _options?: { merge?: boolean }) { this.writes.push({ path: (document as unknown as { path: string }).path, data }); return this; }
  async commit() { await Promise.all(this.writes.map(({ path, data }) => firestoreWrite(path, "PATCH", data))); }
}

async function firestoreFetch(path: string, init: RequestInit = {}) {
  const account = parseServiceAccount();
  if (!account) throw new Error("Firebase target service-account secret is not configured.");
  const response = await fetch(`https://firestore.googleapis.com/v1/projects/${account.project_id}/databases/(default)/documents/${path}`, {
    ...init,
    headers: { authorization: `Bearer ${await accessToken()}`, ...(init.body ? { "content-type": "application/json" } : {}), ...init.headers },
  });
  return response;
}

async function firestoreWrite(path: string, method: "PUT" | "PATCH", data: Record<string, unknown>) {
  const response = await firestoreFetch(path, { method, body: JSON.stringify({ fields: Object.fromEntries(Object.entries(data).map(([key, value]) => [key, valueToFirestore(value)])) }) });
  if (!response.ok) throw new Error(`Firestore write failed (${response.status}).`);
}

class RestFirestore {
  collection(name: string) { return new RestCollection(name); }
  batch() { return new RestBatch(); }
}

export function websiteFirebaseConfigured() { return Boolean(process.env.FIREBASE_TARGET_SERVICE_ACCOUNT || (process.env.FIREBASE_TARGET_CLIENT_EMAIL && process.env.FIREBASE_TARGET_PRIVATE_KEY)); }
export function websiteFirestore() { return new RestFirestore(); }
export function websiteStorage(): never { throw new Error("Server-side Storage uploads are not supported in Cloudflare Workers."); }

class RestDatabase {
  ref(path: string) {
    return {
      get: async () => {
        const account = parseServiceAccount();
        if (!account) throw new Error("Firebase target service-account secret is not configured.");
        const databaseURL = process.env.FIREBASE_TARGET_DATABASE_URL || firebaseConfig.databaseURL;
        const response = await fetch(`${databaseURL.replace(/\/$/, "")}/${path}.json?access_token=${encodeURIComponent(await accessToken())}`);
        if (!response.ok) throw new Error(`Realtime Database read failed (${response.status}).`);
        const value = await response.json();
        return {
          val: () => value,
          forEach: (callback: (child: { key: string; val: () => unknown }) => void) => {
            if (value && typeof value === "object" && !Array.isArray(value)) {
              Object.entries(value).forEach(([key, child]) => callback({ key, val: () => child }));
            }
          },
        };
      },
    };
  }
}
export function leadsDb() { return new RestDatabase(); }
