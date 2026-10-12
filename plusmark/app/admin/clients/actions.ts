"use server";

import { adminDb } from "@/lib/firebase-admin";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin-auth";
import type { TrustedClient } from "@/data/clients";
import { trustedClients } from "@/data/clients";

export async function getClients(): Promise<TrustedClient[]> {
  await requireAdmin();
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
  await requireAdmin();
  const db = adminDb();
  const newRef = db.ref("clients").push();

  await newRef.set({
    ...client,
    // Firebase rejects `undefined`, so drop an empty logo explicitly.
    logo: client.logo ?? null,
    order,
    createdAt: new Date().toISOString(),
  });

  revalidatePath("/");
  return { success: true, id: newRef.key };
}

export async function updateClient(id: string, client: Partial<TrustedClient>) {
  await requireAdmin();
  const db = adminDb();
  await db.ref(`clients/${id}`).update({
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
  const db = adminDb();
  await db.ref(`clients/${id}`).remove();

  revalidatePath("/");
  return { success: true };
}

export async function reorderClients(clientIds: string[]) {
  await requireAdmin();
  const db = adminDb();
  const updates: Record<string, number> = {};

  clientIds.forEach((id, index) => {
    updates[`clients/${id}/order`] = index;
  });

  await db.ref().update(updates);

  revalidatePath("/");
  return { success: true };
}
