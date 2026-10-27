"use server";

import { websiteFirestore } from "@/lib/firebase-admin";
import { revalidateTag } from "next/cache";
import { requireAdmin } from "@/lib/admin-auth";
import { VIDEOS_TAG } from "@/lib/videos";
import type { Video } from "@/data/media";
import { videos as staticVideos } from "@/data/media";

export interface VideoWithId extends Video {
  id: string;
  productSlugs?: string[];
}

// Convert static videos to VideoWithId format
const getStaticVideos = (): VideoWithId[] =>
  Object.entries(staticVideos).map(([key, video]) => ({
    id: key,
    ...video,
    productSlugs: [], // Static videos don't have product mappings in admin
  }));

export async function getVideos(): Promise<VideoWithId[]> {
  await requireAdmin();
  try {
    const snapshot = await websiteFirestore().collection("website_videos").get();
    const videos: VideoWithId[] = [];

    const staticMap = staticVideos as Record<string, Video>;
    snapshot.forEach((child) => {
      const data = child.data();
      const key = child.id;
      const fallback = staticMap[key];
      videos.push({
        id: key,
        src: data.src || fallback?.src || "",
        poster: data.poster || fallback?.poster || "",
        title: data.title || fallback?.title || "Product Video",
        caption: data.caption || fallback?.caption || "",
        productSlugs: data.productSlugs || [],
      });
    });

    // If database has videos, return them; otherwise return static data
    return videos.length > 0 ? videos : getStaticVideos();
  } catch (error) {
    console.error("Error fetching videos, returning static data:", error);
    return getStaticVideos();
  }
}

/** Only the fields we store; never trust extra keys sent from the browser. */
function clean(video: Partial<VideoWithId>) {
  const out: Record<string, unknown> = {};
  if (video.src !== undefined) out.src = String(video.src).trim();
  if (video.poster !== undefined) out.poster = String(video.poster).trim();
  if (video.title !== undefined) out.title = String(video.title).trim();
  if (video.caption !== undefined) out.caption = String(video.caption).trim();
  if (video.productSlugs !== undefined) out.productSlugs = (video.productSlugs ?? []).map(String);
  return out;
}

/** Videos show on the home page, showroom, experience and product pages, so refresh them all. */
function revalidate() {
  revalidateTag(VIDEOS_TAG, { expire: 0 });
}

export async function addVideo(video: Omit<VideoWithId, "id">, order: number) {
  await requireAdmin();
  const newRef = websiteFirestore().collection("website_videos").doc();
  await newRef.set({
    ...clean(video),
    order,
    createdAt: new Date().toISOString(),
  });

  revalidate();
  return { success: true, id: newRef.id };
}

export async function updateVideo(id: string, video: Partial<VideoWithId>) {
  await requireAdmin();
  await websiteFirestore().collection("website_videos").doc(id).set({
    ...clean(video),
    updatedAt: new Date().toISOString(),
  });

  revalidate();
  return { success: true };
}

export async function deleteVideo(id: string) {
  await requireAdmin();
  await websiteFirestore().collection("website_videos").doc(id).delete();

  revalidate();
  return { success: true };
}

export async function reorderVideos(videoIds: string[]) {
  await requireAdmin();
  const batch = websiteFirestore().batch();
  videoIds.forEach((id, index) => {
    batch.set(websiteFirestore().collection("website_videos").doc(id), { order: index }, { merge: true });
  });
  await batch.commit();

  revalidate();
  return { success: true };
}
