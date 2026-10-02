// Faces for the D/E "One board. Two writing experiences." flip: the Eco Premium white board
// and chalk board studio photos (same frame, same camera) from the Drive "AA Images-01" set,
// trimmed to the board, keyed off their white backdrop (flood fill from the edges only, so
// the white writing surface inside the frame is untouched) and exported at the same size.
// Output: public/images/both-side/{white,chalk}.webp
// Run: node scripts/both-side-faces.mjs "<path to AA Images-01>"
import { mkdirSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

const sharp = createRequire(import.meta.url)("sharp");
const SRC = process.argv[2] ?? "C:/Users/Rishank/Downloads/AA Images-01";
const OUT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "public", "images", "both-side");
mkdirSync(OUT, { recursive: true });

const W = 1800;
const H = 1200;
const faces = [
  ["white", "Images-01.jpg"],
  ["chalk", "Images-05.jpg"],
];

/** Backdrop pixels = near-white and connected to the image border. */
function keyBackdrop(data, w, h) {
  const N = w * h;
  const bg = new Uint8Array(N);
  const light = (i) => {
    const o = i * 4;
    return Math.min(data[o], data[o + 1], data[o + 2]) >= 226;
  };
  const q = new Int32Array(N);
  let head = 0;
  let tail = 0;
  const push = (i) => {
    if (!bg[i] && light(i)) {
      bg[i] = 1;
      q[tail++] = i;
    }
  };
  for (let x = 0; x < w; x++) {
    push(x);
    push((h - 1) * w + x);
  }
  for (let y = 0; y < h; y++) {
    push(y * w);
    push(y * w + w - 1);
  }
  while (head < tail) {
    const i = q[head++];
    const x = i % w;
    if (x > 0) push(i - 1);
    if (x < w - 1) push(i + 1);
    if (i >= w) push(i - w);
    if (i < N - w) push(i + w);
  }
  for (let i = 0; i < N; i++) if (bg[i]) data[i * 4 + 3] = 0;
}

/** Opaque pixels touching the keyed backdrop get half alpha, so the cut edge is not jagged. */
function featherEdge(data, w, h) {
  const a = new Uint8Array(w * h);
  for (let i = 0; i < w * h; i++) a[i] = data[i * 4 + 3];
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const i = y * w + x;
      if (a[i] && (!a[i - 1] || !a[i + 1] || !a[i - w] || !a[i + w])) data[i * 4 + 3] = 140;
    }
  }
}

for (const [name, file] of faces) {
  const trimmed = await sharp(path.join(SRC, file)).rotate().trim({ threshold: 30 }).toBuffer();
  const { data, info } = await sharp(trimmed)
    .resize(W, H, { fit: "fill" })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  keyBackdrop(data, info.width, info.height);
  featherEdge(data, info.width, info.height);
  await sharp(data, { raw: { width: W, height: H, channels: 4 } })
    .webp({ quality: 86, alphaQuality: 90, effort: 5 })
    .toFile(path.join(OUT, `${name}.webp`));
  console.log(name, `${W}×${H}`);
}
