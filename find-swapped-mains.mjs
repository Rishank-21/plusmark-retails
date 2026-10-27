const ORIGIN = "https://plusmarkboards.com";
const xml = await (await fetch(`${ORIGIN}/sitemap.xml`)).text();
const slugs = [...new Set([...xml.matchAll(/<loc>[^<]*\/products\/([a-z0-9-]+)<\/loc>/g)].map((m) => m[1]))];
const bad = [];
for (const s of slugs) {
  const html = await (await fetch(`${ORIGIN}/products/${s}`)).text();
  const og = html.match(/property="og:image" content="([^"]+)"/)?.[1] ?? "";
  const tail = og.split("/plusmark/products/")[1] ?? "(none)";
  // bare slug = main product shot; any /N suffix means another photo leads
  if (tail !== s) bad.push(`${s.padEnd(44)} leads with "${tail}"`);
  await new Promise((r) => setTimeout(r, 80));
}
console.log(`checked ${slugs.length} product pages`);
console.log(bad.length ? bad.join("\n") : "all main images lead with the bare product shot");
