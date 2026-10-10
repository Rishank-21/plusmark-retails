import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import type { TrustedClient } from "@/data/clients";

export async function GET() {
  try {
    const db = adminDb();
    const snapshot = await db.ref("clients").orderByChild("order").once("value");
    const clients: TrustedClient[] = [];
    
    snapshot.forEach((child) => {
      const data = child.val();
      clients.push({
        id: child.key as string,
        name: data.name,
        sector: data.sector,
        logo: data.logo,
      });
    });
    
    return NextResponse.json(clients);
  } catch (error) {
    console.error("Error fetching clients:", error);
    // Fallback to static data if database fails
    const { trustedClients } = await import("@/data/clients");
    return NextResponse.json(trustedClients);
  }
}
