// Live audit: what photos does the DEPLOYED catalog actually serve?
// The Cloudflare Worker overlays Firestore `website_products` edits on the built-in catalog, so the
// live gallery order/URLs can differ from data/gallery.ts. This reads the JSON-LD ImageList on every
// live product page (raw Cloudinary URLs, not /_next/image proxies) and HEAD-checks each one.
const ORIGIN = process.argv[2] || "https://plusmarkboards.com";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function getText(url, tries = 4) {
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(url, { headers: { "user-agent": "plusmark-audit/1.0" }, signal: AbortSignal.timeout(45000) });
      if (res.status === 503 || res.status === 429) { await sleep(1500 * (i + 1)); continue; }
      return { status: res.status, body: await res.text() };
    } catch (e) { await sleep(1200 * (i + 1)); }
  }
  return { status: 0, body: "" };
}

const sitemap = await getText(`${ORIGIN}/sitemap.xml`);
const locs = [...sitemap.body.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
const productUrls = locs.filter((u) => new URL(u).pathname.startsWith("/products/")).map((u) => u.replace(new URL(u).origin, ORIGIN));
console.log(`${ORIGIN} | sitemap ${locs.length} urls, ${productUrls.length} product pages`);

const perPage = [];
for (const url of productUrls) {
  const { status, body } = await getText(url);
  const slug = new URL(url).pathname.split("/").pop();
  if (status !== 200) { perPage.push({ slug, status, images: [] }); console.log(`  ${status} ${slug}`); continue; }
  const m = /"image":\[([^\]]*)\]/.exec(body);
  const images = m ? [...m[1].matchAll(/"(https:[^"]+)"/g)].map((x) => x[1].replace(/\\\//g, "/")) : [];
  perPage.push({ slug, status, images });
}

const all = new Set();
for (const p of perPage) for (const u of p.images) all.add(u);
console.log(`pages captured ${perPage.filter((p) => p.status === 200).length}/${perPage.length} | distinct gallery urls ${all.size}`);

const broken = [];
let n = 0;
for (const u of [...all].sort()) {
  n++;
  let status = 0;
  for (let t = 0; t < 3; t++) {
    try {
      const r = await fetch(u, { method: "HEAD", signal: AbortSignal.timeout(30000) });
      status = r.status; break;
    } catch (e) { await sleep(1500 * (t + 1)); }
  }
  if (status !== 200) broken.push([status || "ERR", u]);
  if (n % 40 === 0) console.log(`  checked ${n}/${all.size}`);
}

console.log(`\nbroken live gallery urls: ${broken.length}`);
for (const [s, u] of broken) console.log(`  ${s} ${u}`);

// Show the lead photo per product so the reorder can be confirmed (or disproved) on the live data.
console.log("\nlive lead photo per product:");
for (const p of perPage.filter((x) => x.images.length)) {
  const lead = p.images[0].split("/plusmark/").pop();
  console.log(`  ${p.slug.padEnd(38)} ${lead}`);
}
console.log("\npage status histogram:", JSON.stringify(perPage.reduce((a, p) => ((a[p.status] = (a[p.status] || 0) + 1), a), {})));
