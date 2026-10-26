// Warm the production CDN cache one page at a time.
// The Worker render is CPU heavy, and hitting a fully cold cache concurrently trips Cloudflare's
// CPU limit (error 1102 -> 503), which is not what a real visitor flow looks like.
const ORIGIN = process.argv[2] || "https://plusmarkboards.com";
const SLEEP = Number(process.argv[3] || 400);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const xml = await (await fetch(`${ORIGIN}/sitemap.xml`, { signal: AbortSignal.timeout(60000) })).text();
const pages = [...new Set([...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].replace(/^(https?:\/\/[^/]+)/, ORIGIN)))];
console.log(`warming ${pages.length} pages from ${ORIGIN}`);

const failed = [];
for (const u of pages) {
  let status = 0, ms = 0;
  for (let t = 0; t < 2; t++) {
    const s = Date.now();
    try {
      const r = await fetch(u, { headers: { "user-agent": "plusmark-warm/1.0" }, signal: AbortSignal.timeout(60000) });
      status = r.status; ms = Date.now() - s;
      await r.text();
      if (status === 200) break;
    } catch { status = 0; ms = Date.now() - s; }
    await sleep(1500);
  }
  if (status !== 200) failed.push(`${status} ${u}`);
}
console.log(`done | failed ${failed.length}`);
for (const f of failed) console.log("  " + f);
