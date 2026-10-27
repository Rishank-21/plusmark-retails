const ORIGIN = "https://plusmarkboards.com";
const xml = await (await fetch(`${ORIGIN}/sitemap.xml`)).text();
const urls = [...new Set([...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]))];
const products = urls.filter((u) => /\/products\/(eco|metallic|deluxe)/.test(u));
const out = [];
for (const u of products) {
  const html = await (await fetch(u)).text();
  const og = html.match(/property="og:image" content="([^"]+)"/)?.[1] ?? "";
  // gallery thumbs + hero: every cloudinary plusmark image in DOM order
  const imgs = [...html.matchAll(/https:\/\/res\.cloudinary\.com\/drt0rpkn2\/image\/upload\/[^"'\\ )]+/g)].map((m) => m[0]);
  const uniq = [...new Set(imgs)];
  out.push({ url: u.replace(ORIGIN, ""), og, first: uniq.slice(0, 6) });
  await new Promise((s) => setTimeout(s, 100));
}
console.log(JSON.stringify(out, null, 1));
