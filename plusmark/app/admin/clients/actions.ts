"use server";

import { websiteFirestore } from "@/lib/firebase-admin";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin-auth";
import type { TrustedClient } from "@/data/clients";
import { trustedClients } from "@/data/clients";

export async function getClients(): Promise<TrustedClient[]> {
  await requireAdmin();
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

    // If database has clients, return them; otherwise return static data
    return clients.length > 0 ? clients : trustedClients;
  } catch (error) {
    console.error("Error fetching clients, returning static data:", error);
    return trustedClients;
  }
}

export async function addClient(client: Omit<TrustedClient, "id">, order: number) {
  await requireAdmin();
  const newRef = websiteFirestore().collection("website_clients").doc();
  await newRef.set({
    ...client,
    // Firebase rejects `undefined`, so drop an empty logo explicitly.
    logo: client.logo ?? null,
    order,
    createdAt: new Date().toISOString(),
  });

  revalidatePath("/");
  return { success: true, id: newRef.id };
}

export async function updateClient(id: string, client: Partial<TrustedClient>) {
  await requireAdmin();
  await websiteFirestore().collection("website_clients").doc(id).set({
    ...(client.name !== undefined && { name: client.name }),
    ...(client.sector !== undefined && { sector: client.sector }),
    logo: client.logo ?? null,
    updatedAt: new Date().toISOString(),
  });

  revalidatePath("/");
  return { success: true };
}

export async function deleteClient(id: string) {
  await requireAdmin();
  await websiteFirestore().collection("website_clients").doc(id).delete();

  revalidatePath("/");
  return { success: true };
}

export async function reorderClients(clientIds: string[]) {
  await requireAdmin();
  const batch = websiteFirestore().batch();
  clientIds.forEach((id, index) => {
    batch.set(websiteFirestore().collection("website_clients").doc(id), { order: index }, { merge: true });
  });
  await batch.commit();

  revalidatePath("/");
  return { success: true };
}
