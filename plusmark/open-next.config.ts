import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import kvIncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/kv-incremental-cache";
import kvTagCache from "@opennextjs/cloudflare/overrides/tag-cache/kv-next-tag-cache";

/**
 * The default (`dummy`) incremental cache only lives inside one Worker isolate, so after every
 * cold start Next.js re-renders the page during the request. That exceeds the Workers Free plan's
 * 10 ms CPU limit (startup alone measures 16 ms) and Cloudflare answers with error 1102 → 503.
 *
 * KV keeps rendered pages and tag revalidations (admin saves) across isolates, so a page renders
 * once per revalidation window instead of once per page view.
 *
 * Do NOT pre-populate KV from a local build (`opennextjs-cloudflare populate-cache`): local builds
 * have no Firestore access, so their HTML is missing admin data and would be served as a cache hit.
 */
export default defineCloudflareConfig({
  incrementalCache: kvIncrementalCache,
  tagCache: kvTagCache,
  queue: "direct",
});
