"use server";

import { adminDb } from "@/lib/firebase-admin";
import { revalidatePath } from "next/cache";
import type { Video } from "@/data/media";
import { videos as staticVideos } from "@/data/media";

export interface VideoWithId extends Video {
  id: string;
  productSlugs?: string[];
}

// Convert static videos to VideoWithId format
const getStaticVideos = (): VideoWithId[] => {
  const videoArray: VideoWithId[] = [];
  const entries = Object.entries(staticVideos);
  
  entries.forEach(([key, video], index) => {
    videoArray.push({
      id: key,
      ...video,
      productSlugs: [], // Static videos don't have product mappings in admin
    });
  });
  
  return videoArray;
};

export async function getVideos(): Promise<VideoWithId[]> {
  try {
    const db = adminDb();
    const snapshot = await db.ref("videos").orderByChild("order").once("value");
    const videos: VideoWithId[] = [];
    
    const staticMap = staticVideos as Record<string, Video>;
    snapshot.forEach((child) => {
      const data = child.val();
      const key = child.key as string;
      const fallback = staticMap[key];
      videos.push({
        id: key,
        src: data.src || fallback?.src || "",
        poster: data.poster || fallback?.poster || "",
        title: data.title || fallback?.title || "Product Video",
        caption: data.caption || fallback?.caption || "",
        productSlugs: data.productSlugs || (fallback ? [] : []),
      });
    });
    
    // If database has videos, return them; otherwise return static data
    return videos.length > 0 ? videos : getStaticVideos();
  } catch (error) {
    console.error("Error fetching videos, returning static data:", error);
    return getStaticVideos();
  }
}

/**
 * Upload video to Cloudinary from external URL or direct video file URL
 */
export async function uploadVideoToCloudinary(videoUrl: string): Promise<{ success: boolean; cloudinaryUrl?: string; posterUrl?: string; error?: string }> {
  try {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      return { success: false, error: "Cloudinary credentials not configured. Add them to .env.local" };
    }

    // Cloudinary Upload API endpoint
    const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/video/upload`;

    // Generate timestamp and signature
    const timestamp = Math.floor(Date.now() / 1000);
    const crypto = await import("crypto");
    
    // Parameters for signature (alphabetically sorted)
    const paramsToSign = `folder=plusmark-videos&timestamp=${timestamp}${apiSecret}`;
    const signature = crypto
      .createHash("sha1")
      .update(paramsToSign)
      .digest("hex");

    // Create form data
    const formData = new FormData();
    formData.append("file", videoUrl);
    formData.append("api_key", apiKey);
    formData.append("timestamp", timestamp.toString());
    formData.append("signature", signature);
    formData.append("folder", "plusmark-videos");
    formData.append("resource_type", "video");

    // Upload to Cloudinary
    const response = await fetch(uploadUrl, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("Cloudinary upload failed:", error);
      return { success: false, error: `Upload failed: ${response.status} ${response.statusText}` };
    }

    const result = await response.json();
    
    // Generate poster URL (Cloudinary auto-generates thumbnails for videos)
    const posterUrl = result.secure_url.replace(/\.(mp4|mov|avi|webm)$/, ".jpg");
    
    // Return Cloudinary URLs
    return {
      success: true,
      cloudinaryUrl: result.secure_url,
      posterUrl: posterUrl,
    };
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error);
    return { success: false, error: error instanceof Error ? error.message : "Unknown error occurred" };
  }
}

/**
 * Upload video file (base64) to Cloudinary
 */
export async function uploadVideoFileToCloudinary(base64Data: string): Promise<{ success: boolean; cloudinaryUrl?: string; posterUrl?: string; error?: string }> {
  try {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      return { success: false, error: "Cloudinary credentials not configured. Add them to .env.local" };
    }

    // Cloudinary Upload API endpoint
    const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/video/upload`;

    // Generate timestamp and signature
    const timestamp = Math.floor(Date.now() / 1000);
    const crypto = await import("crypto");
    
    const paramsToSign = `folder=plusmark-videos&timestamp=${timestamp}${apiSecret}`;
    const signature = crypto
      .createHash("sha1")
      .update(paramsToSign)
      .digest("hex");

    // Create form data with base64 file
    const formData = new FormData();
    formData.append("file", base64Data);
    formData.append("api_key", apiKey);
    formData.append("timestamp", timestamp.toString());
    formData.append("signature", signature);
    formData.append("folder", "plusmark-videos");
    formData.append("resource_type", "video");

    // Upload to Cloudinary
    const response = await fetch(uploadUrl, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("Cloudinary file upload failed:", error);
      return { success: false, error: `Upload failed: ${response.status} ${response.statusText}` };
    }

    const result = await response.json();
    
    // Generate poster URL
    const posterUrl = result.secure_url.replace(/\.(mp4|mov|avi|webm)$/, ".jpg");
    
    return {
      success: true,
      cloudinaryUrl: result.secure_url,
      posterUrl: posterUrl,
    };
  } catch (error) {
    console.error("Error uploading file to Cloudinary:", error);
    return { success: false, error: error instanceof Error ? error.message : "Unknown error occurred" };
  }
}

export async function addVideo(video: Omit<VideoWithId, "id">, order: number) {
  const db = adminDb();
  const newRef = db.ref("videos").push();
  
  await newRef.set({
    ...video,
    order,
    createdAt: new Date().toISOString(),
  });
  
  revalidatePath("/");
  revalidatePath("/showroom");
  return { success: true, id: newRef.key };
}

export async function updateVideo(id: string, video: Partial<VideoWithId>) {
  const db = adminDb();
  await db.ref(`videos/${id}`).update({
    ...video,
    updatedAt: new Date().toISOString(),
  });
  
  revalidatePath("/");
  revalidatePath("/showroom");
  return { success: true };
}

export async function deleteVideo(id: string) {
  const db = adminDb();
  await db.ref(`videos/${id}`).remove();
  
  revalidatePath("/");
  revalidatePath("/showroom");
  return { success: true };
}

export async function reorderVideos(videoIds: string[]) {
  const db = adminDb();
  const updates: Record<string, number> = {};
  
  videoIds.forEach((id, index) => {
    updates[`videos/${id}/order`] = index;
  });
  
  await db.ref().update(updates);
  
  revalidatePath("/");
  revalidatePath("/showroom");
  return { success: true };
}
