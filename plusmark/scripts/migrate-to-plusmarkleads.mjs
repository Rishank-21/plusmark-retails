import { readdir } from "node:fs/promises";
import { readFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";
import { cert, initializeApp } from "firebase-admin/app";
import { getDatabase } from "firebase-admin/database";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

const root = process.cwd();
const sourceServiceAccount = parseJsonEnv("FIREBASE_SERVICE_ACCOUNT");
const targetServiceAccount = parseJsonEnv("FIREBASE_TARGET_SERVICE_ACCOUNT");

if (!sourceServiceAccount) {
  throw new Error("FIREBASE_SERVICE_ACCOUNT is required for the source retail RTDB.");
}
if (!targetServiceAccount) {
  throw new Error("FIREBASE_TARGET_SERVICE_ACCOUNT is required for the plusmarkleads target.");
}

const source = initializeApp(
  {
    credential: cert(sourceServiceAccount),
    databaseURL: process.env.FIREBASE_DATABASE_URL,
  },
  "plusmark-migration-source",
);
const target = initializeApp(
  {
    credential: cert(targetServiceAccount),
    projectId: process.env.FIREBASE_TARGET_PROJECT_ID || "plusmarkleads",
    storageBucket: process.env.FIREBASE_TARGET_STORAGE_BUCKET || "plusmarkleads.firebasestorage.app",
  },
  "plusmark-migration-target",
);

const sourceDb = getDatabase(source);
const targetDb = getFirestore(target);
const bucket = getStorage(target).bucket();

function parseJsonEnv(name) {
  const raw = process.env[name] ??
    (name === "FIREBASE_TARGET_SERVICE_ACCOUNT" && process.env.FIREBASE_TARGET_SERVICE_ACCOUNT_FILE
      ? readFileSync(process.env.FIREBASE_TARGET_SERVICE_ACCOUNT_FILE, "utf8")
      : undefined);
  if (!raw) return null;
  const value = JSON.parse(raw);
  value.private_key = value.private_key?.replace(/\\n/g, "\n");
  return value;
}

function docId(value) {
  return String(value).replace(/[\/#?[\]]/g, "_").slice(0, 1_500) || "item";
}

async function copyNode(node) {
  const snapshot = await sourceDb.ref(node).get();
  if (!snapshot.exists()) {
    console.log(`[skip] RTDB/${node} does not exist`);
    return 0;
  }

  const value = snapshot.val();
  const collection = `website_${node}`;
  const entries = Array.isArray(value)
    ? value.map((item, index) => [String(index), item])
    : Object.entries(value ?? {});
  let count = 0;
  for (const [id, data] of entries) {
    await targetDb.collection(collection).doc(docId(id)).set(
      { ...(data && typeof data === "object" ? data : { value: data }), migratedFrom: `rtdb/${node}/${id}` },
      { merge: true },
    );
    count += 1;
  }
  console.log(`[ok] RTDB/${node} -> Firestore/${collection}: ${count} docs`);
  return count;
}

async function uploadDirectory(relativeDir, storagePrefix, extensions) {
  const directory = path.join(root, relativeDir);
  let names = [];
  try {
    names = await readdir(directory);
  } catch {
    console.log(`[skip] ${relativeDir} does not exist`);
    return 0;
  }

  let count = 0;
  for (const name of names) {
    if (!extensions.some((extension) => name.toLowerCase().endsWith(extension))) continue;
    const filePath = path.join(directory, name);
    const destination = `${storagePrefix}/${name}`;
    await new Promise((resolve, reject) => {
      bucket.upload(filePath, {
        destination,
        resumable: false,
        metadata: { metadata: { migratedFrom: `${relativeDir}/${name}` } },
      }).then(resolve, reject);
    });
    const [metadata] = await bucket.file(destination).getMetadata();
    await targetDb.collection("websiteAssets").doc(docId(destination)).set(
      {
        path: destination,
        source: `${relativeDir}/${name}`,
        contentType: metadata.contentType || "application/octet-stream",
        size: Number(metadata.size || 0),
      },
      { merge: true },
    );
    count += 1;
  }
  console.log(`[ok] ${relativeDir} -> Storage/${storagePrefix}: ${count} files`);
  return count;
}

const nodes = ["enquiries", "products", "clients", "videos", "hero"];
for (const node of nodes) await copyNode(node);
await uploadDirectory("public/images", "website/images", [".jpg", ".jpeg", ".png", ".webp", ".svg"]);
await uploadDirectory("public/models", "website/models", [".glb"]);

console.log("Migration completed additively. Existing plusmarkleads RTDB data was not modified.");
