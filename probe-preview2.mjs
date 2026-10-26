const ORIGIN = process.argv[2];
const xml = await (await fetch(`${ORIGIN}/sitemap.xml`)).text();
const pages = [...new Set(
  [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)]
    .map((m) => m[1].replace(/^(https?:\/\/[^/]+)/, ORIGIN))
    .filter((u) => u.startsWith(ORIGIN))
)];
const bad = [];
for (const u of pages) {
  const t = Date.now();
  try {
    const ac = new AbortController();
    const to = setTimeout(() => ac.abort(), 30000);
    const r = await fetch(u, { signal: ac.signal });
    const body = await r.text();
    clearTimeout(to);
    const ms = Date.now() - t;
    if (!r.ok || ms > 6000) {
      const flat = body.replace(/\s+/g, " ").slice(0, 500);
      bad.push(`${r.status} ${ms}ms ${u}\n      ${flat}`);
    }
  } catch (e) {
    bad.push(`ERR ${e.name} ${Date.now() - t}ms ${u}`);
  }
  await new Promise((res) => setTimeout(res, 400));
}
console.log(`pages ${pages.length} | failing/slow ${bad.length}`);
for (const b of bad) console.log("  " + b);
