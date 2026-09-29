// Temporary: contact sheet of every image in a directory. Usage: node .sheet-dir.mjs <dir> <out.jpg>
import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";

const [src, outFile] = process.argv.slice(2);
const files = fs.readdirSync(src).filter((f) => /\.(jpe?g|png|webp)$/i.test(f)).sort();
const T = 300, L = 40, COLS = 5;
const rows = Math.ceil(files.length / COLS);
const parts = [];
for (let i = 0; i < files.length; i++) {
  const x = (i % COLS) * T;
  const y = Math.floor(i / COLS) * (T + L);
  const thumb = await sharp(path.join(src, files[i]), { failOn: "none" })
    .rotate()
    .resize(T - 10, T - 10, { fit: "contain", background: "#ffffff" })
    .toBuffer();
  parts.push({ input: thumb, left: x + 5, top: y + 5 });
  const name = files[i].slice(-34).replace(/&/g, "&amp;").replace(/</g, "&lt;");
  parts.push({
    input: Buffer.from(`<svg width="${T}" height="${L}"><text x="4" y="16" font-family="Arial" font-size="12" font-weight="bold" fill="red">${i + 1}: ${name}</text></svg>`),
    left: x,
    top: y + T,
  });
}
await sharp({ create: { width: COLS * T, height: rows * (T + L), channels: 3, background: "#ffffff" } })
  .composite(parts)
  .jpeg({ quality: 80 })
  .toFile(outFile);
console.log("done", outFile);
