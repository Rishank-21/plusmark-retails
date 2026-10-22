import { NextResponse } from "next/server";
import { websiteFirestore } from "@/lib/firebase-admin";
import type { TrustedClient } from "@/data/clients";

export async function GET() {
  try {
    const snapshot = await websiteFirestore().collection("website_clients").get();
    const clients: TrustedClient[] = [];
    
    snapshot.forEach((child) => {
      const data = child.data();
      clients.push({
        id: child.id,
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
