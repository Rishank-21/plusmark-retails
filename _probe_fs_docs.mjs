/** Scratch: read the website_products Firestore docs for two slugs (REST + service-account JWT). */
import { createSign } from "node:crypto";
import { readFileSync } from "node:fs";

const env = readFileSync(".env", "utf8");
const get = (k) => env.match(new RegExp(`^${k}=(.*)$`, "m"))?.[1].trim().replace(/^["']|["']$/g, "");
const sa = JSON.parse(get("FIREBASE_SERVICE_ACCOUNT"));

const b64 = (s) => Buffer.from(s).toString("base64url");
const now = Math.floor(Date.now() / 1000);
const claims = {
  iss: sa.client_email,
  scope: "https://www.googleapis.com/auth/datastore",
  aud: sa.token_uri,
  iat: now,
  exp: now + 3600,
};
const unsigned = `${b64(JSON.stringify({ alg: "RS256", typ: "JWT" }))}.${b64(JSON.stringify(claims))}`;
const jwt = `${unsigned}.${createSign("sha256").update(unsigned).sign(sa.private_key).toString("base64url")}`;

const tok = await (
  await fetch(sa.token_uri, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion: jwt }),
  })
).json();
if (!tok.access_token) throw new Error(`token mint failed: ${JSON.stringify(tok)}`);

const val = (v) => {
  if (!v) return undefined;
  if ("stringValue" in v) return v.stringValue;
  if ("booleanValue" in v) return v.booleanValue;
  if ("integerValue" in v) return Number(v.integerValue);
  if ("arrayValue" in v) return v.arrayValue.values.map(val);
  if ("mapValue" in v) return Object.fromEntries(Object.entries(v.mapValue.fields).map(([k, x]) => [k, val(x)]));
  return null;
};

for (const slug of ["eco-regular-chalk-board", "eco-regular-magnetic-chalk-board"]) {
  const r = await fetch(
    `https://firestore.googleapis.com/v1/projects/${sa.project_id}/databases/(default)/documents/website_products/${slug}`,
    { headers: { authorization: `Bearer ${tok.access_token}` } },
  );
  if (r.status === 404) {
    console.log(`${slug}: NO Firestore doc`);
    continue;
  }
  const doc = await r.json();
  const f = doc.fields ?? {};
  console.log(`${slug}: fields=${Object.keys(f).join(",")}`);
  console.log(`  image=${JSON.stringify(val(f.image))}`);
  console.log(`  gallery=${JSON.stringify(val(f.gallery))}`);
}
