// Industry card photos: real lifestyle scenes cropped out of Plusmark's Amazon A+ "use" banners
// (public/images/aplus/<line>/NN.webp, 2400 × 983). The crop starts right of the banner's
// caption box so no baked-in text ends up on the card. Output: public/images/industries/<slug>.webp
// Run: node scripts/industry-scenes.mjs
import { mkdirSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

const sharp = createRequire(import.meta.url)("sharp");
const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "public", "images");
const out = path.join(root, "industries");
mkdirSync(out, { recursive: true });

// [industry slug, A+ source, left edge of the crop as a fraction of the banner width]
const scenes = [
  ["schools", "eco-premium-chalk-board/06", 0.44],
  ["colleges-universities", "eco-premium-white-board/06", 0.452],
  ["dealers-distributors", "eco-regular-magnetic-board/05", 0.45],
  ["factories-industrial-units", "eco-premium-chalk-board/05", 0.45],
  ["training-coaching-centers", "eco-premium-white-board/05", 0.45],
  ["government-private-institutions", "eco-premium-notice-board/05", 0.46],
];

const W = 2400;
const H = 983;
for (const [slug, src, from] of scenes) {
  const left = Math.round(W * from);
  const width = Math.min(Math.round(H * 1.5), W - left); // 3:2 at most
  await sharp(path.join(root, "aplus", `${src}.webp`))
    .extract({ left, top: 0, width, height: H })
    .resize({ width: 1200 })
    .webp({ quality: 82 })
    .toFile(path.join(out, `${slug}.webp`));
  console.log(slug, `${width}×${H} from x=${left}`);
}
