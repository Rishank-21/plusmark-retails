const O = "https://plusmarkboards.com";
const xml = await (await fetch(`${O}/sitemap.xml`)).text();
const pages = [...new Set([...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].replace(/^(https?:\/\/[^/]+)/, O)))];
const dirs = ["aplus", "products", "industries", "both-side", "clients"];
const found = Object.fromEntries(dirs.map((d) => [d, new Set()]));
let i = 0;
async function w() {
  while (i < pages.length) {
    const u = pages[i++];
    try {
      const h = await (await fetch(u)).text();
      for (const d of dirs) {
        const re = new RegExp("/images/" + d + "/[^\"\\s\\\\)<>]+", "g");
        for (const m of h.matchAll(re)) {
          found[d].add(u.replace(O, "") + "  " + m[0].replace(/^https?:\/\/plusmarkboards\.com/, ""));
        }
      }
    } catch (e) { /* ignore */ }
  }
}
await Promise.all([w(), w(), w(), w()]);
console.log("crawled", pages.length, "pages\n");
for (const d of dirs) {
  console.log("=== /images/" + d + " ===");
  if (found[d].size === 0) console.log("   NONE referenced in live HTML");
  else [...found[d]].slice(0, 10).forEach((x) => console.log("   " + x));
  console.log();
}
