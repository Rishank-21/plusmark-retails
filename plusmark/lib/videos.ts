/**
 * Videos for the public website, managed in /admin/videos (Firebase `videos`).
 * Cached under the "videos" tag; the admin video actions invalidate it on every save.
 * Falls back to the built-in list in data/media.ts when the database is empty or unavailable.
 */
import "server-only";
import { unstable_cache } from "next/cache";
import { allVideos, type Video } from "@/data/media";
import { adminDb, firebaseAdminConfigured } from "@/lib/firebase-admin";
import { videoEmbed } from "@/lib/video-embed";

export const VIDEOS_TAG = "videos";

type SiteVideo = Video & { productSlugs: string[] };

async function load(): Promise<SiteVideo[] | null> {
  if (!firebaseAdminConfigured()) return null;
  try {
    const snap = await adminDb().ref("videos").once("value");
    if (!snap.exists()) return null;
    const rows: (SiteVideo & { order: number })[] = [];
    snap.forEach((child) => {
      const d = child.val() ?? {};
      if (typeof d.src !== "string" || !d.src) return;
      rows.push({
        src: d.src,
        // YouTube links get their own thumbnail when no poster was set.
        poster: (typeof d.poster === "string" && d.poster) || videoEmbed(d.src).thumb || "",
        title: typeof d.title === "string" && d.title ? d.title : "Plusmark video",
        caption: typeof d.caption === "string" ? d.caption : "",
        productSlugs: Array.isArray(d.productSlugs) ? d.productSlugs.filter((s: unknown) => typeof s === "string") : [],
        order: typeof d.order === "number" ? d.order : Number.MAX_SAFE_INTEGER,
      });
    });
    rows.sort((a, b) => a.order - b.order);
    return rows.map((r) => ({ src: r.src, poster: r.poster, title: r.title, caption: r.caption, productSlugs: r.productSlugs }));
  } catch (err) {
    console.error("[videos] could not load videos from the database, using built-in list", err);
    return null;
  }
}

const getStored = unstable_cache(load, ["plusmark-videos-v1"], { tags: [VIDEOS_TAG], revalidate: 3600 });

/** Every video for the home page "film reel" (and the showroom / experience pages). */
export async function getSiteVideos(): Promise<Video[]> {
  const stored = await getStored();
  if (!stored?.length) return allVideos;
  return stored.map(toVideo);
}

/** Videos linked to a product in the admin ("Show on product pages"). */
export async function getVideosForProduct(slug: string): Promise<Video[]> {
  const stored = await getStored();
  return (stored ?? []).filter((v) => v.productSlugs.includes(slug)).map(toVideo);
}

const toVideo = (v: SiteVideo): Video => ({ src: v.src, poster: v.poster, title: v.title, caption: v.caption });
