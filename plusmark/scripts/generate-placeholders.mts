/**
 * Generates neutral placeholder product images (WebP) for every product that does
 * not yet have catalog photography. File names match products.ts (`/images/products/<slug>.webp`),
 * so real photos can be dropped in without code changes.
 *
 * Existing files are NOT overwritten unless --force is passed.
 * Run: npm run assets:placeholders
 */
import sharp from "sharp";
import { access, mkdir } from "node:fs/promises";
import path from "node:path";
import { products } from "../data/products.ts";
import { visuals } from "../data/visuals.ts";

const W = 1600;
const H = 1200;
const force = process.argv.includes("--force");

function svg(seed: number) {
  const rot = (seed % 7) * 3 - 9;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <radialGradient id="bg" cx="50%" cy="42%" r="75%">
      <stop offset="0" stop-color="#fbfbfa"/>
      <stop offset="0.7" stop-color="#eeeeeb"/>
      <stop offset="1" stop-color="#e3e4e1"/>
    </radialGradient>
    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M40 0H0V40" fill="none" stroke="#1c1f23" stroke-opacity="0.045" stroke-width="1"/>
    </pattern>
    <linearGradient id="alu" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#e3e6e9"/>
      <stop offset="0.5" stop-color="#b8bdc3"/>
      <stop offset="1" stop-color="#d9dde1"/>
    </linearGradient>
  </defs>
  <ellipse cx="800" cy="930" rx="420" ry="34" fill="#1c1f23" fill-opacity="0.08"/>
  <g transform="translate(800 560) rotate(${rot})">
    <rect x="-150" y="-150" width="300" height="300" rx="28" fill="url(#alu)" stroke="#9aa0a6" stroke-width="2"/>
    <rect x="-22" y="-100" width="44" height="200" rx="6" fill="#1c1f23" fill-opacity="0.82"/>
    <rect x="-100" y="-22" width="200" height="44" rx="6" fill="#1c1f23" fill-opacity="0.82"/>
  </g>
</svg>`;
}

async function exists(p: string) {
  try {
    await access(p);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  const dir = path.resolve("public/images/products");
  await mkdir(dir, { recursive: true });
  let made = 0;
  for (const [k, p] of products.entries()) {
    const file = path.join(dir, `${p.slug}.webp`);
    if (visuals[p.slug]) continue; // rendered from the GLB by render-products
    if (!force && (await exists(file))) continue;
    await sharp(Buffer.from(svg(k))).webp({ quality: 80 }).toFile(file);
    made++;
  }
  console.log(`Generated ${made} placeholder images in ${dir}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
