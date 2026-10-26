/**
 * Collects every image a site's pages reference, collapses them to distinct source URLs
 * (Next's /_next/image wrapper only adds a resize), and checks each one.
 *   node check-sources.mjs http://127.0.0.1:4888
 */
const ORIGIN = process.argv[2] ?? "http://127.0.0.1:4888";
const xml = await (await fetch(`${ORIGIN}/sitemap.xml`)).text();
const pages = [...new Set([...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].replace(/^(https?:\/\/[^/]+)/, ORIGIN)))];
console.log(`origin ${ORIGIN} | pages ${pages.length}`);

const sources = new Map(); // source url -> Set(page)
const add = (raw, page) => {
  if (!raw || raw.startsWith("data:")) return;
  let u = raw.replace(/&amp;/g, "&");
  const m = u.match(/[?&]url=([^&]+)/);
  if (m) u = decodeURIComponent(m[1]);
  const abs = u.startsWith("http") ? u : new URL(u, ORIGIN).href;
  if (!sources.has(abs)) sources.set(abs, new Set());
  sources.get(abs).add(page);
};

let n = 0;
for (const page of pages) {
  try {
    const html = await (await fetch(page)).text();
    n++;
    for (const m of html.matchAll(/\/_next\/image\?url=[^"'\s\\]+/g)) add(m[0], page);
    for (const m of html.matchAll(/\bsrc="([^"]+)"/g)) add(m[1], page);
    for (const m of html.matchAll(/content="([^"]+\.(?:png|jpe?g|webp|avif)[^"]*)"/g)) add(m[1], page);
    for (const m of html.matchAll(/"(https:\/\/res\.cloudinary\.com[^"\\]+)"/g)) add(m[1], page);
    for (const m of html.matchAll(/poster="([^"]+)"/g)) add(m[1], page);
  } catch (e) {
    console.log(`PAGE FAIL ${page} ${e.name}`);
  }
  if (n % 30 === 0) console.log(`  ...pages ${n}/${pages.length}, sources so far ${sources.size}`);
}
console.log(`pages ok ${n}/${pages.length} | distinct image sources ${sources.size}`);

const bad = [];
const list = [...sources.keys()];
let i = 0;
async function w() {
  while (i < list.length) {
    const u = list[i++];
    try {
      const r = await fetch(u);
      if (!r.ok) bad.push(`${r.status} ${u} <- ${[...sources.get(u)].slice(0, 2).join(", ")}`);
    } catch (e) {
      bad.push(`ERR ${e.name} ${u} <- ${[...sources.get(u)].slice(0, 2).join(", ")}`);
    }
  }
}
await Promise.all(Array.from({ length: 10 }, w));
console.log(`\n== broken image sources: ${bad.length} ==`);
for (const b of bad.sort()) console.log("  " + b.slice(0, 220));
