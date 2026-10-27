const ORIGIN = "https://plusmarkboards.com";
const xml = await (await fetch(`${ORIGIN}/sitemap.xml`)).text();
const pages = [...new Set([...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].replace(/^(https?:\/\/[^/]+)/, ORIGIN)))];
const picks = [ORIGIN + "/", ...pages.filter((u) => u !== ORIGIN + "/")].slice(0, 8);
const byColo = {};
const errs = [];
for (const u of picks) {
  const r = await fetch(u);
  const html = await r.text();
  const colo = (r.headers.get("cf-ray") || "").split("-").pop()?.toUpperCase();
  const cache = r.headers.get("x-nextjs-cache");
  const key = `${colo}:${cache ?? "none"}`;
  byColo[key] = (byColo[key] || 0) + 1;
  if (r.status >= 500) errs.push(`${r.status} ${u}`);
  await new Promise((s) => setTimeout(s, 120));
}
console.log("colo|cache -> count");
for (const [k, v] of Object.entries(byColo).sort()) console.log(`  ${k} = ${v}`);
console.log("distinct colos:", new Set(Object.keys(byColo).map((k) => k.split(":")[0])).size);
console.log("5xx:", errs.length, errs.join(" "));
