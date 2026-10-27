const SLUGS = [
  "eco-premium-white-board", "eco-premium-both-side-board", "eco-premium-chalk-board",
  "eco-premium-notice-board", "eco-regular-white-board", "eco-regular-chalk-board",
  "eco-regular-magnetic-chalk-board", "metallic-premium-white-board", "metallic-premium-magnetic-board",
  "deluxe-standard-white-board", "key-hanger-board",
];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let total = 0, broken = 0;
for (const s of SLUGS) {
  const url = `https://plusmarkboards.com/products/${s}`;
  const r = await fetch(url);
  const html = await r.text();
  const srcs = [...new Set([...html.matchAll(/src="([^"]+)"/g)].map((m) => m[1]))]
    .filter((x) => x.startsWith("/images/") || x.includes("res.cloudinary.com"))
    .map((x) => (x.startsWith("/") ? "https://plusmarkboards.com" + x : x));
  const bad = [];
  for (const src of srcs) {
    total++;
    try {
      const h = await fetch(src, { method: "GET", headers: { Range: "bytes=0-64" } });
      if (!h.ok) { bad.push(`${h.status} ${src}`); broken++; }
      await h.body?.cancel();
    } catch (e) { bad.push(`ERR ${e.name} ${src}`); broken++; }
    await sleep(120);
  }
  console.log(`${s}: ${srcs.length} imgs, ${bad.length ? "BROKEN ->\n  " + bad.join("\n  ") : "all load OK"}`);
  await sleep(400);
}
console.log(`\ntotal image urls ${total} | broken ${broken}`);
