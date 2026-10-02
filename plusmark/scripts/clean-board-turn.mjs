/**
 * Cleans the scroll-scrubbed film frames (public/sequence/board-turn) into
 * public/sequence/board-turn-clean:
 *  - drops frames 1–5 (animated "plusmark" intro logo over the board) and 116–120
 *    (hard cut to an opaque writing shot),
 *  - erases the semi-transparent "plusmark" watermark in the top-left corner. The watermark
 *    never exceeds alpha 192 while the board is fully opaque, so only low-alpha pixels in the
 *    watermark box are cleared and the board's corner is left intact,
 *  - refills the dark corner pockets the background key made transparent (see fillHoles).
 * Run: node scripts/clean-board-turn.mjs
 */
import sharp from "sharp";
import { mkdir } from "node:fs/promises";

const SRC = "public/sequence/board-turn";
const OUT = "public/sequence/board-turn-clean";
const FIRST = 6;
const LAST = 115;
// watermark box in 1280×720 source pixels (measured: 66–224 × 35–72), padded
const BOX = { x0: 50, y0: 22, x1: 240, y1: 86 };

// The background key also removed the dark inner corner pockets (between each red corner cap
// and the writing surface), so the stage colour showed through them. Any transparent area
// that is enclosed by the board is refilled with that pocket colour, composited under the
// existing pixels so anti-aliased edges blend onto it.
const POCKET = [20, 20, 23];
/** gaps up to ~2·SEAL px in the silhouette are treated as closed */
const SEAL = 5;

/** Square dilation of a 0/1 mask (separable running max). */
function dilate(mask, W, H, r) {
  const tmp = new Uint8Array(W * H);
  const out = new Uint8Array(W * H);
  for (let y = 0; y < H; y++) {
    let count = 0;
    const row = y * W;
    for (let x = 0; x < Math.min(W, r); x++) count += mask[row + x];
    for (let x = 0; x < W; x++) {
      if (x + r < W) count += mask[row + x + r];
      if (x - r - 1 >= 0) count -= mask[row + x - r - 1];
      tmp[row + x] = count > 0 ? 1 : 0;
    }
  }
  for (let x = 0; x < W; x++) {
    let count = 0;
    for (let y = 0; y < Math.min(H, r); y++) count += tmp[y * W + x];
    for (let y = 0; y < H; y++) {
      if (y + r < H) count += tmp[(y + r) * W + x];
      if (y - r - 1 >= 0) count -= tmp[(y - r - 1) * W + x];
      out[y * W + x] = count > 0 ? 1 : 0;
    }
  }
  return out;
}

function fillHoles(data, W, H) {
  const N = W * H;
  const solid = new Uint8Array(N);
  for (let i = 0; i < N; i++) solid[i] = data[i * 4 + 3] >= 96 ? 1 : 0;
  const sealed = dilate(solid, W, H, SEAL);
  // flood the outside from the image border through non-sealed pixels
  const outside = new Uint8Array(N);
  const queue = new Int32Array(N);
  let head = 0;
  let tail = 0;
  const push = (i) => {
    if (!outside[i] && !sealed[i]) {
      outside[i] = 1;
      queue[tail++] = i;
    }
  };
  for (let x = 0; x < W; x++) {
    push(x);
    push((H - 1) * W + x);
  }
  for (let y = 0; y < H; y++) {
    push(y * W);
    push(y * W + W - 1);
  }
  while (head < tail) {
    const i = queue[head++];
    const x = i % W;
    if (x > 0) push(i - 1);
    if (x < W - 1) push(i + 1);
    if (i >= W) push(i - W);
    if (i < N - W) push(i + W);
  }
  // give the outside back the band the seal took from it
  const reach = dilate(outside, W, H, SEAL + 1);
  for (let i = 0; i < N; i++) {
    if (reach[i]) continue;
    const o = i * 4;
    const a = data[o + 3] / 255;
    if (a >= 1) continue;
    // "over" composite: existing pixel over an opaque pocket colour
    for (let c = 0; c < 3; c++) data[o + c] = Math.round(data[o + c] * a + POCKET[c] * (1 - a));
    data[o + 3] = 255;
  }
}

await mkdir(OUT, { recursive: true });
let n = 0;
for (let i = FIRST; i <= LAST; i++) {
  const src = `${SRC}/${String(i).padStart(3, "0")}.webp`;
  const { data, info } = await sharp(src).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const W = info.width;
  const sx = W / 1280;
  const sy = info.height / 720;
  for (let y = Math.floor(BOX.y0 * sy); y < Math.ceil(BOX.y1 * sy); y++) {
    for (let x = Math.floor(BOX.x0 * sx); x < Math.ceil(BOX.x1 * sx); x++) {
      const o = (y * W + x) * 4 + 3;
      if (data[o] < 235) data[o] = 0;
    }
  }
  fillHoles(data, W, info.height);
  n++;
  await sharp(data, { raw: { width: W, height: info.height, channels: 4 } })
    .webp({ quality: 82, alphaQuality: 90, effort: 5 })
    .toFile(`${OUT}/${String(n).padStart(3, "0")}.webp`);
}
console.log(`wrote ${n} frames to ${OUT}`);
