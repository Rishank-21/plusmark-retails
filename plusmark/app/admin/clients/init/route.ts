import { NextResponse } from "next/server";
import { websiteFirestore } from "@/lib/firebase-admin";
import { isAdmin } from "@/lib/admin-auth";
import { trustedClients } from "@/data/clients";

/**
 * One-time initialization endpoint to populate the database with the static clients data.
 * Only run this once to migrate from static data to database.
 */
export async function POST() {
  if (!(await isAdmin())) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  try {
    const collection = websiteFirestore().collection("website_clients");
    const snapshot = await collection.get();
    
    // Check if data already exists
    if (!snapshot.empty) {
      return NextResponse.json({ 
        success: false, 
        message: "Clients already exist in database. Use the admin panel to manage them." 
      });
    }

    // Initialize with static data
    const batch = websiteFirestore().batch();
    trustedClients.forEach((client, index) => {
      const newRef = collection.doc();
      batch.set(newRef, {
        name: client.name,
        sector: client.sector,
        logo: client.logo,
        order: index,
        createdAt: new Date().toISOString(),
      });
    });
    await batch.commit();

    return NextResponse.json({ 
      success: true, 
      message: `Initialized ${trustedClients.length} clients successfully.` 
    });
  } catch (error) {
    console.error("Error initializing clients:", error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error" 
    }, { status: 500 });
  }
}
