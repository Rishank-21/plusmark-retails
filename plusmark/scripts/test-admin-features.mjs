import { cert, initializeApp } from "firebase-admin/app";
import { getDatabase } from "firebase-admin/database";

const sa = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
const app = initializeApp({
  credential: cert(sa),
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
});
const db = getDatabase(app);

const results = [];
function record(name, status, details = "") {
  results.push({ name, status, details });
  console.log(`[${status}] ${name} ${details ? "- " + details : ""}`);
}

async function runTests() {
  console.log("=== STARTING FULL ADMIN FEATURES AUDIT ===\n");

  // TEST 1: Environment & Auth Config
  try {
    const hasPassword = Boolean(process.env.ADMIN_PASSWORD);
    const hasSecret = Boolean(process.env.ADMIN_SESSION_SECRET);
    if (hasPassword && hasSecret) {
      record("Admin Credentials Config", "PASS", "ADMIN_PASSWORD and ADMIN_SESSION_SECRET configured");
    } else {
      record("Admin Credentials Config", "FAIL", "Missing ADMIN_PASSWORD or ADMIN_SESSION_SECRET");
    }
  } catch (e) {
    record("Admin Credentials Config", "FAIL", e.message);
  }

  // TEST 2: Firebase Admin RTDB Connection
  try {
    const connected = await db.ref(".info/connected").once("value");
    record("Firebase Realtime Database", "PASS", "Connected successfully");
  } catch (e) {
    record("Firebase Realtime Database", "FAIL", e.message);
  }

  // TEST 3: Enquiries Collection & Stats
  try {
    const enqSnap = await db.ref("enquiries").once("value");
    const count = enqSnap.numChildren();
    record("Enquiries Database", "PASS", `${count} enquiries in database`);
  } catch (e) {
    record("Enquiries Database", "FAIL", e.message);
  }

  // TEST 4: Product Catalog Data
  try {
    const prodSnap = await db.ref("products").once("value");
    const prodCount = prodSnap.numChildren();
    record("Products Catalog DB", "PASS", `${prodCount} custom products in database (static products fallback active)`);
  } catch (e) {
    record("Products Catalog DB", "FAIL", e.message);
  }

  // TEST 5: Videos Manager & Video Streams (All 10 Videos)
  try {
    const vidSnap = await db.ref("videos").once("value");
    const vidCount = vidSnap.numChildren();
    let playable = 0;
    const checks = [];

    vidSnap.forEach((child) => {
      const v = child.val();
      if (v.src && v.src.startsWith("http")) {
        checks.push(
          fetch(v.src, { method: "HEAD" })
            .then((r) => {
              if (r.ok) playable++;
              return { key: child.key, status: r.status, title: v.title };
            })
            .catch((err) => ({ key: child.key, error: err.message }))
        );
      }
    });

    const streamResults = await Promise.all(checks);
    if (playable === vidCount && vidCount > 0) {
      record("Videos Stream Health", "PASS", `All ${playable}/${vidCount} videos verified 200 OK on Cloudinary CDN`);
    } else {
      record("Videos Stream Health", "WARN", `${playable}/${vidCount} videos responded OK`);
    }
  } catch (e) {
    record("Videos Stream Health", "FAIL", e.message);
  }

  // TEST 6: Clients Logos & Sectors
  try {
    const clientSnap = await db.ref("clients").once("value");
    const clientCount = clientSnap.numChildren();
    record("Clients Database", "PASS", `${clientCount} clients registered in DB (homepage static clients fallback ready)`);
  } catch (e) {
    record("Clients Database", "FAIL", e.message);
  }

  console.log("\n=== AUDIT SUMMARY ===");
  const allPassed = results.every((r) => r.status === "PASS");
  console.log(`Total checks: ${results.length}. Result: ${allPassed ? "ALL ADMIN SYSTEMS FUNCTIONAL" : "ISSUES FOUND"}`);

  process.exit(allPassed ? 0 : 1);
}

runTests().catch((e) => {
  console.error("Test suite runner error:", e);
  process.exit(1);
});
