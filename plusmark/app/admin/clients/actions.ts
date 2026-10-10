"use server";

import { adminDb } from "@/lib/firebase-admin";
import { revalidatePath } from "next/cache";
import type { TrustedClient } from "@/data/clients";
import { trustedClients } from "@/data/clients";

export async function getClients(): Promise<TrustedClient[]> {
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
    
    // If database has clients, return them; otherwise return static data
    return clients.length > 0 ? clients : trustedClients;
  } catch (error) {
    console.error("Error fetching clients, returning static data:", error);
    return trustedClients;
  }
}

export async function addClient(client: Omit<TrustedClient, "id">, order: number) {
  const db = adminDb();
  const newRef = db.ref("clients").push();
  
  await newRef.set({
    ...client,
    order,
    createdAt: new Date().toISOString(),
  });
  
  revalidatePath("/");
  return { success: true, id: newRef.key };
}

export async function updateClient(id: string, client: Partial<TrustedClient>) {
  const db = adminDb();
  await db.ref(`clients/${id}`).update({
    ...client,
    updatedAt: new Date().toISOString(),
  });
  
  revalidatePath("/");
  return { success: true };
}

export async function deleteClient(id: string) {
  const db = adminDb();
  await db.ref(`clients/${id}`).remove();
  
  revalidatePath("/");
  return { success: true };
}

export async function reorderClients(clientIds: string[]) {
  const db = adminDb();
  const updates: Record<string, number> = {};
  
  clientIds.forEach((id, index) => {
    updates[`clients/${id}/order`] = index;
  });
  
  await db.ref().update(updates);
  
  revalidatePath("/");
  return { success: true };
}

export async function uploadClientLogo(id: string, formData: FormData) {
  // For now, we'll handle logo uploads as base64 or external URLs
  // In a production system, you'd upload to Firebase Storage or another CDN
  const file = formData.get("logo") as File;
  if (!file) throw new Error("No file provided");
  
  // For simplicity, we'll store the logo URL in the database
  // In production, upload to storage and get URL
  const logoUrl = `/images/clients/${id}.png`; // Placeholder
  
  return { success: true, url: logoUrl };
}
