/**
 * Sweeps every page of a running site and HEAD-checks every image it references.
 *   node check-all-images.mjs http://127.0.0.1:4888
 */
const ORIGIN = process.argv[2] ?? "http://127.0.0.1:4888";

const sitemap = await (await fetch(`${ORIGIN}/sitemap.xml`)).text();
// the deployed build still lists www locs, which has no DNS — probe the origin we were given
const pages = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)]
  .map((m) => m[1].trim().replace(/^(https?:\/\/[^/]+)/, ORIGIN.replace(/\/$/, "")));
console.log(`origin ${ORIGIN} | sitemap pages ${pages.length}`);

const refs = new Map(); // absolute url -> Set(page)
const add = (url, page) => {
  if (!url || url.startsWith("data:")) return;
  const abs = url.startsWith("http") ? url : new URL(url, ORIGIN).href;
  if (!refs.has(abs)) refs.set(abs, new Set());
  refs.get(abs).add(page);
};

let htmls = 0;
for (const page of pages) {
  let html;
  try {
    const r = await fetch(page);
    if (!r.ok) { console.log(`PAGE ${r.status} ${page}`); continue; }
    html = await r.text();
    htmls++;
  } catch (e) { console.log(`PAGE ERR ${page} ${e.message}`); continue; }

  for (const m of html.matchAll(/\/_next\/image\?url=[^"'\s\\]+/g)) add("/" + m[0].replace(/&amp;/g, "&"), page);
  for (const m of html.matchAll(/\bsrc="([^"]+)"/g)) add(m[1].replace(/&amp;/g, "&"), page);
  for (const m of html.matchAll(/\bcontent="([^"]+\.(?:png|jpe?g|webp|avif|svg)[^"]*)"/g)) add(m[1], page);
  for (const m of html.matchAll(/"(https:\/\/(?:res\.cloudinary\.com|firebasestorage|storage\.googleapis)[^"\\]+)"/g)) add(m[1], page);
  for (const m of html.matchAll(/poster="([^"]+)"/g)) add(m[1], page);
}
console.log(`fetched ${htmls} pages | distinct image urls ${refs.size}`);

const bad = [];
const list = [...refs.keys()];
let i = 0;
async function worker() {
  while (i < list.length) {
    const u = list[i++];
    try {
      const r = await fetch(u, { method: "HEAD" });
      if (!r.ok) bad.push([r.status, u, [...refs.get(u)]]);
    } catch (e) {
      try {
        const r = await fetch(u); // some CDNs reject HEAD
        if (!r.ok) bad.push([r.status, u, [...refs.get(u)]]);
      } catch { bad.push(["ERR " + e.message.slice(0, 30), u, [...refs.get(u)]]); }
    }
  }
}
await Promise.all(Array.from({ length: 12 }, worker));

console.log(`\n== non-200 image urls: ${bad.length} ==`);
for (const [s, u, p] of bad.sort()) console.log(`  ${s}  ${u}\n        on ${p.length} page(s): ${p.slice(0, 3).join(", ")}`);
if (!bad.length) console.log("  none");
