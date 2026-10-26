/** Tiles a product's current photos into one review sheet: node scripts/photo-sheet.mjs <slug> */
import sharp from "sharp";
import fs from "node:fs";

const slug = process.argv[2];
const files = [`public/images/products/${slug}.webp`, ...[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
  .filter((n) => fs.existsSync(`public/images/products/${slug}/${n}.webp`))
  .map((n) => `public/images/products/${slug}/${n}.webp`)];
const labels = ["main", ...files.slice(1).map((f) => f.match(/(\d+)\.webp$/)[1])];

const CELL = 300;
const COLS = 4;
const rows = Math.ceil(files.length / COLS);
const tiles = [];
for (let i = 0; i < files.length; i++) {
  const img = await sharp(files[i]).resize(CELL, CELL - 30, { fit: "contain", background: "#ffffff" }).png().toBuffer();
  const badge = await sharp(Buffer.from(`<svg width="${CELL}" height="30"><rect width="30" height="30" fill="#111"/><text x="6" y="20" font-family="monospace" font-size="15" fill="#fff">${labels[i]}</text></svg>`))
    .png().toBuffer();
  const tile = await sharp({ create: { width: CELL, height: CELL, channels: 3, background: "#d8d8d8" } })
    .composite([{ input: badge, top: 0, left: 0 }, { input: img, top: 30, left: 0 }])
    .png().toBuffer();
  tiles.push({ input: tile, left: (i % COLS) * CELL, top: Math.floor(i / COLS) * CELL });
}
const out = `sheets/${slug}.jpg`;
fs.mkdirSync("sheets", { recursive: true });
await sharp({ create: { width: COLS * CELL, height: rows * CELL, channels: 3, background: "#d8d8d8" } })
  .composite(tiles).jpeg({ quality: 78 }).toFile(out);
console.log(`${out}  (${files.length} photos: ${labels.join(", ")})`);
