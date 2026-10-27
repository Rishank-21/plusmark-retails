import { writeFileSync } from "node:fs";
import sharp from "sharp";

const fs = await import("node:fs");
const src = fs.readFileSync("data/gallery.ts", "utf8");
const re = /"([a-z0-9-]+)": \[([\s\S]*?)\n  \],/g;
const items = [];
let m;
while ((m = re.exec(src))) {
  const urls = [...m[2].matchAll(/https:\/\/[^"]+/g)].map((x) => x[0]);
  items.push({ slug: m[1], url: urls[0], count: urls.length });
}

const COLS = 6, CELL = 220, LABEL = 26, PAD = 6;
const rows = Math.ceil(items.length / COLS);
const composites = [];
const log = [];
for (const [i, p] of items.entries()) {
  const x = (i % COLS) * (CELL + PAD), y = Math.floor(i / COLS) * (CELL + LABEL + PAD);
  let tile = null;
  try {
    const r = await fetch(p.url.replace(/\/upload\/[^/]+\//, `/upload/f_png,q_70,w_${CELL}/`));
    const buf = Buffer.from(await r.arrayBuffer());
    const meta = await sharp(buf).metadata();
    tile = await sharp(buf).resize(CELL, CELL, { fit: "contain", background: { r: 250, g: 250, b: 250, alpha: 1 } }).png().toBuffer();
    log.push(`${i + 1}. ${p.slug}  gallery:${p.count}  ${meta.width}x${meta.height} ${buf.length}B`);
  } catch (e) {
    log.push(`${i + 1}. ${p.slug}  gallery:${p.count}  ERR ${e.message}`);
  }
  const label = `<svg width="${CELL}" height="${LABEL}"><text x="2" y="16" font-family="DejaVu Sans, monospace" font-size="12" fill="#000">${i + 1}. ${p.slug}</text></svg>`;
  composites.push({ input: tile ?? Buffer.from(label), left: x, top: y });
  composites.push({ input: Buffer.from(label), left: x, top: y + CELL });
}
await sharp({ create: { width: COLS * (CELL + PAD), height: rows * (CELL + LABEL + PAD), channels: 3, background: { r: 255, g: 255, b: 255 } } })
  .composite(composites).jpeg({ quality: 80 }).toFile("_audit/contact-sheet.jpg");
writeFileSync("_audit/products.txt", log.join("\n"));
console.log(log.filter((l) => l.includes("ERR")).join("\n") || "all images fetched ok");
console.log(`sheet: ${items.length} products -> _audit/contact-sheet.jpg`);
