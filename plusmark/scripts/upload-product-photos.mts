#!/usr/bin/env node
/**
 * Publish processed product photos to Cloudinary and point data/gallery.ts at the CDN copy.
 *
 *   node scripts/upload-product-photos.mts <slug>[,<slug>...]
 *
 * Reads public/images/products/<slug>.webp and public/images/products/<slug>/<n>.webp (the
 * output of `assets:photos --only=<slug>`), uploads them as plusmark/products/<slug>[/<n>] with
 * overwrite, then rewrites that slug's data/gallery.ts entry to the f_auto,q_auto CDN URL.
 *
 * The local files are deliberately NOT deleted — public/ ships to Cloudflare Assets on every
 * deploy, so remove them by hand once the CDN copy is confirmed.
 */
import { v2 as cloudinary } from "cloudinary";
import { existsSync, readFileSync } from "node:fs";
import { readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const env = readFileSync(path.join(root, ".env"), "utf8");
const secret = (key) => env.match(new RegExp(`^${key}=(.*)$`, "m"))?.[1].trim().replace(/^["']|["']$/g, "");

cloudinary.config({
  cloud_name: secret("NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME") ?? "drt0rpkn2",
  api_key: secret("CLOUDINARY_API_KEY"),
  api_secret: secret("CLOUDINARY_API_SECRET"),
});

const slugs = (process.argv[2] ?? "").split(",").map((s) => s.trim()).filter(Boolean);
if (!slugs.length) throw new Error("usage: upload-product-photos.mts <slug>[,<slug>...]");

const base = path.join(root, "public", "images", "products");
// Cloudinary serves delivered assets with a one-year immutable Cache-Control, so an overwrite at
// the same public_id never reaches a browser that already has the old copy. The asset version in
// the path is what busts that cache.
const cdn = (publicId, version) =>
  `https://res.cloudinary.com/${cloudinary.config().cloud_name}/image/upload/f_auto,q_auto/v${version}/${publicId}`;

const galleryFile = path.join(root, "data", "gallery.ts");
let src = readFileSync(galleryFile, "utf8");

for (const slug of slugs) {
  const main = path.join(base, `${slug}.webp`);
  if (!existsSync(main)) throw new Error(`Missing ${path.relative(root, main)} — run assets:photos --only=${slug} first`);
  const extras = (await readdir(path.join(base, slug)).catch(() => []))
    .filter((f) => /^\d+\.webp$/.test(f))
    .sort((a, b) => Number(a) - Number(b))
    .map((f) => path.join(base, slug, f));

  const urls = [];
  for (const [i, file] of [main, ...extras].entries()) {
    const publicId = `plusmark/products/${slug}${i ? `/${i}` : ""}`;
    const r = await cloudinary.uploader.upload(file, { public_id: publicId, overwrite: true, resource_type: "image" });
    if (r.bytes === undefined) throw new Error(`Upload of ${publicId} did not report bytes`);
    console.log(`✓ ${publicId}  ${r.bytes} bytes`);
    urls.push(cdn(publicId, r.version));
  }

  const body = urls.map((u) => `    "${u}",`).join("\n");
  const block = new RegExp(`  "${slug}": \\[[\\s\\S]*?\\],`);
  if (!block.test(src)) throw new Error(`No "${slug}" entry in data/gallery.ts`);
  src = src.replace(block, `  "${slug}": [\n${body}\n  ],`);
}

await writeFile(galleryFile, src);
console.log(`Done — ${slugs.length} slug(s) published and linked in data/gallery.ts.`);
