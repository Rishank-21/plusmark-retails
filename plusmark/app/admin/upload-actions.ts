"use server";

import { createHash } from "node:crypto";
import { requireAdmin } from "@/lib/admin-auth";

export type UploadSignature =
  | { ok: true; cloudName: string; apiKey: string; timestamp: number; signature: string; folder: string }
  | { ok: false; error: string };

const FOLDERS = { image: "plusmark-admin", video: "plusmark-videos" } as const;

/**
 * Signs a direct browser → Cloudinary upload. The file itself never passes through the Next.js
 * server, so large photos and videos are not limited by the server-action body size, and the
 * browser can show real upload progress. The API secret stays on the server.
 */
export async function getUploadSignature(kind: "image" | "video"): Promise<UploadSignature> {
  await requireAdmin();
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!cloudName || !apiKey || !apiSecret) {
    return { ok: false, error: "Cloudinary is not configured on the server, so files can't be uploaded. Paste a link instead." };
  }
  const folder = FOLDERS[kind] ?? FOLDERS.image;
  const timestamp = Math.floor(Date.now() / 1000);
  // Cloudinary signs the alphabetically sorted params followed by the secret.
  const signature = createHash("sha1").update(`folder=${folder}&timestamp=${timestamp}${apiSecret}`).digest("hex");
  return { ok: true, cloudName, apiKey, timestamp, signature, folder };
}
