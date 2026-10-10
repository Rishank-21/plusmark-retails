import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { trustedClients } from "@/data/clients";

/**
 * One-time initialization endpoint to populate the database with the static clients data.
 * Only run this once to migrate from static data to database.
 */
export async function POST() {
  try {
    const db = adminDb();
    const snapshot = await db.ref("clients").once("value");
    
    // Check if data already exists
    if (snapshot.exists()) {
      return NextResponse.json({ 
        success: false, 
        message: "Clients already exist in database. Use the admin panel to manage them." 
      });
    }

    // Initialize with static data
    const updates: Record<string, any> = {};
    trustedClients.forEach((client, index) => {
      const newRef = db.ref("clients").push();
      updates[`clients/${newRef.key}`] = {
        name: client.name,
        sector: client.sector,
        logo: client.logo,
        order: index,
        createdAt: new Date().toISOString(),
      };
    });

    await db.ref().update(updates);

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
