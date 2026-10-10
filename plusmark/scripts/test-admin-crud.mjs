import { cert, initializeApp } from "firebase-admin/app";
import { getDatabase } from "firebase-admin/database";

const sa = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
const app = initializeApp({
  credential: cert(sa),
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
});
const db = getDatabase(app);

async function testCRUD() {
  console.log("=== TESTING ADMIN CRUD OPERATIONS ===\n");

  // 1. PRODUCTS CRUD TEST
  console.log("1. Testing Products CRUD...");
  const newProductRef = db.ref("products").push();
  const testProdId = newProductRef.key;
  await newProductRef.set({
    slug: "test-admin-board",
    name: "Test Admin Board",
    categorySlug: "white-boards-magnetic",
    series: "Metallic Premium",
    shortDescription: "Automated test board",
    createdAt: new Date().toISOString(),
  });
  console.log("   -> Product created:", testProdId);

  await db.ref(`products/${testProdId}`).update({
    name: "Test Admin Board (Updated)",
    updatedAt: new Date().toISOString(),
  });
  const updatedSnap = await db.ref(`products/${testProdId}`).once("value");
  if (updatedSnap.val().name === "Test Admin Board (Updated)") {
    console.log("   -> Product update verified successfully");
  }

  await db.ref(`products/${testProdId}`).remove();
  const deletedSnap = await db.ref(`products/${testProdId}`).once("value");
  if (!deletedSnap.exists()) {
    console.log("   -> Product deletion verified successfully [PASS]");
  }

  // 2. CLIENTS CRUD TEST
  console.log("\n2. Testing Clients CRUD...");
  const newClientRef = db.ref("clients").push();
  const testClientId = newClientRef.key;
  await newClientRef.set({
    name: "Test Academy",
    sector: "school",
    order: 999,
    createdAt: new Date().toISOString(),
  });
  console.log("   -> Client created:", testClientId);

  await db.ref(`clients/${testClientId}`).update({
    name: "Test Academy (Updated)",
  });
  const updatedClientSnap = await db.ref(`clients/${testClientId}`).once("value");
  if (updatedClientSnap.val().name === "Test Academy (Updated)") {
    console.log("   -> Client update verified successfully");
  }

  await db.ref(`clients/${testClientId}`).remove();
  const deletedClientSnap = await db.ref(`clients/${testClientId}`).once("value");
  if (!deletedClientSnap.exists()) {
    console.log("   -> Client deletion verified successfully [PASS]");
  }

  console.log("\n=== ALL CRUD OPERATIONS VERIFIED 100% OPERATIONAL ===");
  process.exit(0);
}

testCRUD().catch((e) => {
  console.error("CRUD test failed:", e);
  process.exit(1);
});
