/*
 * Sequential (concurrency 1) probe of an isolated Worker version preview.
 * Never run this against the live custom domain: cold-cache concurrency triggered
 * Cloudflare error 1102 last time.
 */
const ORIGIN = process.argv[2];
if (!ORIGIN) throw new Error("usage: node probe-preview.mjs <origin>");

const xml = await (await fetch(`${ORIGIN}/sitemap.xml`)).text();
const pages = [...new Set(
  [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)]
    .map((m) => m[1].replace(/^(https?:\/\/[^/]+)/, ORIGIN))
    .filter((u) => u.startsWith(ORIGIN))
)];

const bad = [];
for (const [n, u] of pages.entries()) {
  const t = Date.now();
  try {
    const ac = new AbortController();
    const to = setTimeout(() => ac.abort(), 30000);
    const r = await fetch(u, { signal: ac.signal, redirect: "manual" });
    const body = await r.text();
    clearTimeout(to);
    const ms = Date.now() - t;
    const code1102 = /error code: 1102/.test(body);
    if (!r.ok || ms > 6000 || code1102) bad.push(`${r.status}${code1102 ? "/1102" : ""} ${ms}ms ${u}`);
  } catch (e) {
    bad.push(`ERR ${e.name} ${Date.now() - t}ms ${u}`);
  }
  await new Promise((res) => setTimeout(res, 400));
}

console.log(`pages ${pages.length} | failing/slow(>6s)/1102 ${bad.length}`);
for (const b of bad) console.log("  " + b);
