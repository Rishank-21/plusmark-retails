import "server-only";
import { unstable_cache } from "next/cache";
import { websiteFirebaseConfigured, websiteFirestore } from "@/lib/firebase-admin";
import type { DesignId } from "@/lib/design";

export type VideoMode = "scroll" | "normal";

export type SiteSettings = {
  publicDesign: DesignId;
  videoMode: VideoMode;
};

const defaults: SiteSettings = { publicDesign: "a", videoMode: "scroll" };
const validDesigns = new Set<DesignId>(["a", "b", "c", "d", "e"]);

async function loadSiteSettings(): Promise<SiteSettings> {
  if (!websiteFirebaseConfigured()) return defaults;
  try {
    const snapshot = await websiteFirestore().collection("website_config").doc("site").get();
    const data = snapshot.data() as { publicDesign?: unknown; videoMode?: unknown } | null;
    return {
      publicDesign: validDesigns.has(data?.publicDesign as DesignId) ? data?.publicDesign as DesignId : defaults.publicDesign,
      videoMode: data?.videoMode === "normal" ? "normal" : defaults.videoMode,
    };
  } catch (error) {
    console.error("[site-settings] Could not load public website settings.", error);
    return defaults;
  }
}

/**
 * The root layout reads this, so its window becomes every page's edge-cache lifetime. A short
 * window made the CDN revalidate constantly and the extra Worker renders hit Cloudflare's CPU
 * limit (error 1102 → 503); a long one also keeps Workers KV writes (Free tier: 1k/day) down,
 * since each revalidation is a KV write. Admin edits still force a refresh via tag revalidation.
 */
export const getSiteSettings = unstable_cache(loadSiteSettings, ["plusmark-site-settings"], {
  revalidate: 86400,
});
