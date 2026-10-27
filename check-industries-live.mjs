const ORIGIN = "https://plusmarkboards.com";
const pages = ["/", "/industries", "/showroom", "/experience", "/products/eco-premium-white-board", "/products/metallic-premium-white-board"];
for (const p of pages) {
  const res = await fetch(ORIGIN + p);
  const html = await res.text();
  const local = [...new Set([...html.matchAll(/["'(](\/images\/[^"')?\s]+)/g)].map((m) => m[1]))];
  const cloud = [...new Set([...html.matchAll(/https:\/\/res\.cloudinary\.com\/[^"'\s)]+/g)].map((m) => m[0]))];
  const ind = cloud.filter((u) => /\/plusmark\/industries\//.test(u));
  console.log(`\n${p}  [${res.status}]  cloudinary=${cloud.length} industries=${ind.length} local=/images refs=${local.length}`);
  if (local.length) console.log("   LOCAL:", local.slice(0, 8).join(" "));
  for (const u of ind) console.log("   IND :", u);
}
