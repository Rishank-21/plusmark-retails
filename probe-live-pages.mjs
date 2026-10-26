const ORIGIN = "https://plusmarkboards.com";
const xml = await (await fetch(`${ORIGIN}/sitemap.xml`)).text();
const pages = [...new Set([...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].replace(/^(https?:\/\/[^/]+)/, ORIGIN)))];
const bad = [];
let i = 0;
let ok = 0;
async function w() {
  while (i < pages.length) {
    const u = pages[i++];
    const t = Date.now();
    try {
      const ac = new AbortController();
      const to = setTimeout(() => ac.abort(), 20000);
      const r = await fetch(u, { signal: ac.signal });
      clearTimeout(to);
      await r.text();
      const ms = Date.now() - t;
      ok++;
      if (!r.ok || ms > 4000) bad.push(`${r.status} ${ms}ms ${u}`);
    } catch (e) {
      bad.push(`ERR ${e.name} ${Date.now() - t}ms ${u}`);
    }
  }
}
await Promise.all(Array.from({ length: 4 }, w));
console.log(`live pages ${pages.length} | answered ${ok} | slow(>4s) or failing ${bad.length}`);
for (const b of bad) console.log("  " + b);
