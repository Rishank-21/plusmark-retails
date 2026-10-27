const ORIGIN = "https://plusmarkboards.com";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const xml = await (await fetch(`${ORIGIN}/sitemap.xml`)).text();
const pages = [...new Set([...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].replace(/^(https?:\/\/[^/]+)/, ORIGIN)))];
const local = new Map();
const cdnDirs = new Map();
async function worker() {
  while (pages.length) {
    const u = pages.pop();
    try {
      const ac = new AbortController();
      const to = setTimeout(() => ac.abort(), 20000);
      const r = await fetch(u, { signal: ac.signal });
      const html = await r.text();
      clearTimeout(to);
      for (const m of html.matchAll(/["'(](\/images\/[^"'?)\s]+)/g)) {
        const dir = "/" + m[1].split("/").slice(1, 3).join("/");
        local.set(dir, (local.get(dir) || new Set()).add(m[1].split("?")[0]));
      }
      for (const m of html.matchAll(/res\.cloudinary\.com\/[^"'()\s]+?\/plusmark\/([a-z-]+)\//g)) {
        cdnDirs.set(m[1], (cdnDirs.get(m[1]) || 0) + 1);
      }
    } catch (e) { console.log("ERR", u, e.name); }
    await sleep(120);
  }
}
await Promise.all([worker(), worker(), worker()]);
console.log("pages crawled:", pages.length === 0 ? "all" : "partial");
console.log("\n=== local /images/* paths ACTUALLY REFERENCED by live HTML ===");
for (const [dir, set] of [...local].sort()) console.log(`${dir}  ->  ${set.size} unique file(s)`);
console.log("\n=== Cloudinary plusmark/<dir>/ refs in live HTML ===");
for (const [d, n] of [...cdnDirs].sort((a, b) => b[1] - a[1])) console.log(`${d} -> ${n}`);
