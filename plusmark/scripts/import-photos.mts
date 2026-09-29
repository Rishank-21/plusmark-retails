/**
 * Imports real product photography into the site.
 *
 *   node scripts/import-photos.mts
 *
 * Sources
 *   local:<name>   → <PHOTOS_DIR>/<name>.jpg  (default: ~/Downloads/AA Images-01)
 *   drive:<folder> → every image inside that Google Drive folder path, resolved via
 *                    <DRIVE_LIST> (default: ../drive-tmp/drive_list.tsv, produced by crawl.ps1)
 *
 * Output
 *   public/images/products/<slug>.webp        main image (first source), trimmed + centred 1600×1200
 *   public/images/products/<slug>/<n>.webp    gallery images (all sources)
 *   data/gallery.ts                            slug → gallery image paths
 *   public/images/products/<slug>/size-<w>x<h>.webp + data/sizes.ts   per-size photos (SIZE_SOURCES)
 *
 *   node scripts/import-photos.mts --sizes     only refresh the per-size photos
 *
 * Products not listed in SOURCES keep their existing rendered/placeholder image.
 */
import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import sharp from "sharp";

const root = path.resolve(".");
const PHOTOS_DIR = process.env.PHOTOS_DIR ?? path.join(os.homedir(), "Downloads", "AA Images-01");
const DRIVE_LIST = process.env.DRIVE_LIST ?? path.resolve(root, "..", "drive-tmp", "drive_list.tsv");
const CACHE = process.env.DRIVE_CACHE ?? path.resolve(root, "..", "drive-tmp", "cache");
const OUT = path.join(root, "public", "images", "products");

const W = 1600;
const H = 1200;

const MT = "IMG/Metallic";
const ECO = "IMG/ECO/ECO";

/** slug → ordered image sources. The first source becomes the main product image. */
const SOURCES: Record<string, string[]> = {
  // Where Drive photography exists, its branded angled shot (plusmark logo on the frame)
  // is the main image; the local studio shot follows, then Amazon A+ lifestyle banners.
  // White boards
  "metallic-premium-white-board": [`drive:${MT}/Metallic WB/2 X 3 WB - P-1`, "local:Images-01"],
  "eco-premium-white-board": [
    `drive:${ECO}/ECO White board/2 X 3 WB - P-1`,
    "local:Images-02",
    `drive:${ECO}/A+/Non. Mag. WB|1_2x3 Feet.jpg,2.jpg,3.jpg,4.jpg,5.jpg,6.jpg,7.jpg,8.jpg`,
  ],
  "deluxe-standard-white-board": ["local:Images-03"],
  "eco-regular-white-board": ["local:Images-04"],
  // Chalk boards
  "metallic-premium-chalk-board": [`drive:${MT}/Metallic CB/2 X 3 CB - P-1`, "local:Images-05"],
  "eco-premium-chalk-board": [
    `drive:${ECO}/ECO Chalk board/2 X 3 CB - P-1`,
    "local:Images-06",
    `drive:${ECO}/A+/Non. Mag. CB|1.jpg,2.jpg,3.jpg,4.jpg,5.jpg,6.jpg,7.jpg,8.jpg`,
  ],
  "deluxe-standard-chalk-board": ["local:Images-07"],
  // Notice boards
  "metallic-premium-notice-board": [
    `drive:${MT}/Metallic Notice board/NAVY BLUE/2 X 3  NB - NAVY BLUE - P-1`,
    "local:Images-08",
    `drive1:${MT}/Metallic Notice board/RED/2 X 3  NB - RED - P-1`,
    `drive1:${MT}/Metallic Notice board/MAROON/2 X 3  NB - MAROON - P-1`,
    `drive1:${MT}/Metallic Notice board/GREEN/2 X 3  NB - GREEN - P-1`,
    `drive1:${MT}/Metallic Notice board/GREY/2 X 3  NB - GREY - P-1`,
    `drive1:${MT}/Metallic Notice board/BLUE/2 X 3  NB - BLUE - P-1`,
  ],
  "eco-premium-notice-board": [
    `drive:${ECO}/ECO Notice Board/GREEN/2 X 3 NB - GREEN - P-1`,
    "local:Images-09",
    `drive1:${ECO}/ECO Notice Board/MAROON/2 X 3 NB - MAROON - P-1`,
    `drive1:${ECO}/ECO Notice Board/BLUE/2 X 3  NB - BLUE - P-1`,
    `drive:${ECO}/A+/Notice Board|1.jpg,2.jpg,3.jpg,4.jpg,5.jpg,6.jpg,7.jpg,8.jpg`,
  ],
  "deluxe-standard-notice-board": ["local:Images-10"],
  "eco-regular-notice-board": ["local:Images-11"],
  // Magnetic boards
  "metallic-premium-magnetic-board": [
    `drive:${MT}/Metallic magnetic WB/2 X 3  Magnetic WB - P-1`,
    "local:Images-12",
    `drive1:${MT}/Metallic Magnetic CB/2 X 3  Magnetic CB - P-1`,
  ],
  "deluxe-standard-magnetic-board": ["local:Images-13"],
  "eco-regular-magnetic-board": ["local:Images-14"],
  // Ceramic boards
  "metallic-premium-ceramic-board": [
    `drive:${MT}/Metallic Ceramic WB/2 X 3  Ceramic CB - P-1`,
    "local:Images-15",
    `drive1:${MT}/Metallic Ceramic CB/2 X 3  Ceramic CB - P-1`,
  ],
  "deluxe-standard-ceramic-board": ["local:Images-16"],
  // Specialty
  "acrylic-folder-display-board": ["local:Images-17"],
  "cork-notice-board": ["local:Images-18"],
  "combination-board": ["local:Images-19"],
  "fabric-notice-board": ["local:Images-20"],
  // Acrylic door cover
  "deluxe-45mm-adc-notice-board-double-door": ["local:Images-21"],
  "deluxe-45mm-adc-notice-board-single-door": ["local:Images-22"],
  "eco-adc-notice-board-single-door": ["local:Images-23"],
  // Essentials
  "four-line-square-line-practice-board": ["local:Images-24"],
  "key-hanger-board": ["local:Images-25"],
  "student-study-table": ["local:Images-26"],
  // Display
  "grooved-boards": ["local:Images-27", "local:Images-28"],
  "perforated-board": ["local:Images-29"],
  // Stands & storage
  "three-leg-stand": ["local:Images-30"],
  "four-leg-stand": ["local:Images-31"],
  "telescopic-stand": ["local:Images-32"],
  "newspaper-stand": ["local:Images-33", "local:Images-35"],
  "revolving-stand": ["local:Images-34"],
  "zig-zag-stand": ["local:Images-36"],
  "magazine-stand": ["local:Images-37"],
  "first-aid-box": ["local:Images-38"],
  "letter-box": ["local:Images-39"],
  "file-rack": ["local:Images-40"],
  // Clipboards
  "graphic-mdf-base-clipboard": ["local:Images-41", "local:Images-42", "local:Images-43", "local:Images-44", "local:Images-45"],
  "laminate-mdf-base-clipboard": ["local:Images-46", "local:Images-47"],
  "pre-lam-mdf-base-clipboard": ["local:Wood-1", "local:Wood-2", "local:Wood-3", "local:Wood-4", "local:Wood-5"],
  "crystal-clear-base-clipboard": ["local:Images-48"],
  "crystal-colour-base-clipboard": ["local:Images-49"],
  // School benches (model number printed on each photo)
  "pds-sb-807": ["local:Images-50"],
  "pds-sb-810": ["local:Images-51"],
  "pds-sb-804": ["local:Images-52"],
  "pds-sb-812": ["local:Images-53"],
  "pds-sb-801": ["local:Images-54"],
  "pds-sb-802": ["local:Images-55"],
  "pds-sb-803": ["local:Images-56"],
  "pds-sb-805": ["local:Images-57"],
  "pds-sb-806": ["local:Images-58"],
  "pds-sb-808": ["local:Images-59"],
  "pds-sb-809": ["local:Images-60"],
  "pds-sb-811": ["local:Images-61"],
  "pds-sb-813": ["local:Images-62"],
  "pds-sb-814": ["local:Images-63"],
  "pds-sb-815": ["local:Images-64"],
  // Schedule board
  "dry-wipe-schedule-board": ["local:Images-65"],
};

/**
 * slug → Drive folder whose sub-folders are per-size shoots, named like
 * "2 X 3 WB - P-1" (size in feet, P-1 / P-2 / P-4 = pack of 1 / 2 / 4).
 * The first P-1 photo of every size becomes that size's image.
 * Notice boards use one colour (the same colour as the product's main image).
 */
const SIZE_SOURCES: Record<string, string> = {
  "metallic-premium-white-board": `${MT}/Metallic WB`,
  "metallic-premium-chalk-board": `${MT}/Metallic CB`,
  "metallic-premium-notice-board": `${MT}/Metallic Notice board/NAVY BLUE`,
  "metallic-premium-magnetic-board": `${MT}/Metallic magnetic WB`,
  "metallic-premium-ceramic-board": `${MT}/Metallic Ceramic WB`,
  "eco-premium-white-board": `${ECO}/ECO White board`,
  "eco-premium-chalk-board": `${ECO}/ECO Chalk board`,
  "eco-premium-notice-board": `${ECO}/ECO Notice Board/GREEN`,
};

type DriveFile = { id: string; path: string };

async function loadDrive(): Promise<DriveFile[]> {
  if (!existsSync(DRIVE_LIST)) return [];
  const text = (await readFile(DRIVE_LIST, "utf8")).replace(/^\uFEFF/, "");
  return text
    .split(/\r?\n/)
    .map((l) => l.split("\t"))
    .filter((p) => p[0] === "FILE" && /\.(jpe?g|png|webp)$/i.test(p[2] ?? ""))
    .map(([, id, p]) => ({ id, path: p }));
}

const natural = new Intl.Collator("en", { numeric: true, sensitivity: "base" });

async function download(f: DriveFile): Promise<string> {
  const file = path.join(CACHE, `${f.id}${path.extname(f.path).toLowerCase()}`);
  if (existsSync(file)) return file;
  const url = `https://drive.usercontent.google.com/download?id=${encodeURIComponent(f.id)}&export=download&confirm=t`;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const type = res.headers.get("content-type") ?? "";
      if (type.includes("text/html")) throw new Error("got HTML instead of an image");
      await writeFile(file, Buffer.from(await res.arrayBuffer()));
      return file;
    } catch (e) {
      if (attempt === 3) throw new Error(`Download failed for ${f.path}: ${(e as Error).message}`);
      await new Promise((r) => setTimeout(r, 1000 * attempt));
    }
  }
  throw new Error("unreachable");
}

async function resolve(src: string, drive: DriveFile[]): Promise<string[]> {
  const [kind, ...rest] = src.split(":");
  const ref = rest.join(":");
  if (kind === "local") {
    const file = path.join(PHOTOS_DIR, `${ref}.jpg`);
    if (!existsSync(file)) throw new Error(`Missing local photo: ${file}`);
    return [file];
  }
  // Optional "|a.jpg,b.jpg" picks specific files (in that order) from the folder.
  const [folder, only] = ref.split("|");
  const prefix = `${folder}/`;
  const inFolder = drive.filter((f) => f.path.startsWith(prefix) && !f.path.slice(prefix.length).includes("/"));
  const matches = only
    ? only.split(",").map((name) => {
        const hit = inFolder.find((f) => f.path.slice(prefix.length) === name);
        if (!hit) throw new Error(`No Drive image ${name} under: ${folder}`);
        return hit;
      })
    : inFolder.sort((a, b) => natural.compare(a.path, b.path));
  if (matches.length === 0) throw new Error(`No Drive images under: ${folder}`);
  const picked = kind === "drive1" ? matches.slice(0, 1) : matches;
  const files: string[] = [];
  for (const f of picked) files.push(await download(f));
  return files;
}

/**
 * Studio-style main image: trim the white margin, centre on a 1600×1200 white canvas, with a
 * light sharpen and contrast lift so the frame and the plusmark stickers read clearly at card size.
 */
async function writeMain(input: string, out: string) {
  const trimmed = await sharp(input, { failOn: "none" })
    .rotate()
    .flatten({ background: "#ffffff" })
    .trim({ background: "#ffffff", threshold: 12 })
    .toBuffer();
  const fitted = await sharp(trimmed)
    .resize(Math.round(W * 0.88), Math.round(H * 0.88), { fit: "inside", withoutEnlargement: false, kernel: "lanczos3" })
    .toBuffer();
  await sharp(fitted)
    .extend({ top: 200, bottom: 200, left: 200, right: 200, background: "#ffffff" })
    .resize(W, H, { fit: "contain", background: "#ffffff" })
    .linear(1.04, -4)
    .sharpen({ sigma: 0.7, m1: 0.6, m2: 1.4 })
    .webp({ quality: 86 })
    .toFile(out);
}

/** Gallery image: keep composition (lifestyle / infographic shots), cap the size. */
async function writeGallery(input: string, out: string) {
  await sharp(input, { failOn: "none" })
    .rotate()
    .flatten({ background: "#ffffff" })
    .resize(1600, 1600, { fit: "inside", withoutEnlargement: true })
    .webp({ quality: 80 })
    .toFile(out);
}

/**
 * Appends a content hash (`?v=<hash>`) to a public URL. Photos are overwritten in place,
 * and the Next image optimizer + browsers cache by URL, so without this a replaced photo
 * keeps serving the old (placeholder) version.
 */
async function versioned(publicPath: string): Promise<string> {
  const buf = await readFile(path.join(root, "public", publicPath));
  return `${publicPath}?v=${createHash("sha1").update(buf).digest("hex").slice(0, 10)}`;
}

const fmt = (n: number) => String(n);

/** Per-size images → public/images/products/<slug>/size-<w>x<h>.webp and data/sizes.ts. */
async function importSizes(drive: DriveFile[]) {
  const out: Record<string, { label: string; image: string }[]> = {};
  for (const [slug, folder] of Object.entries(SIZE_SOURCES)) {
    const prefix = `${folder}/`;
    const bySize = new Map<string, { w: number; h: number; files: DriveFile[] }>();
    for (const f of drive) {
      if (!f.path.startsWith(prefix)) continue;
      const parts = f.path.slice(prefix.length).split("/");
      if (parts.length !== 2) continue;
      const m = parts[0].match(/^\s*(\d+(?:\.\d+)?)\s*X\s*(\d+(?:\.\d+)?)\b.*P-1\s*$/i);
      if (!m) continue;
      const w = Number(m[1]);
      const h = Number(m[2]);
      const key = `${fmt(w)}x${fmt(h)}`;
      const entry = bySize.get(key) ?? { w, h, files: [] };
      entry.files.push(f);
      bySize.set(key, entry);
    }
    if (bySize.size === 0) throw new Error(`No size folders under: ${folder}`);

    const dir = path.join(OUT, slug);
    await mkdir(dir, { recursive: true });
    const list = [...bySize.entries()].sort(([, a], [, b]) => a.w - b.w || a.h - b.h);
    out[slug] = [];
    for (const [key, { w, h, files }] of list) {
      const first = files.sort((a, b) => natural.compare(a.path, b.path))[0];
      const file = await download(first);
      await writeMain(file, path.join(dir, `size-${key}.webp`));
      out[slug].push({
        label: `${fmt(w)} × ${fmt(h)} ft`,
        image: await versioned(`/images/products/${slug}/size-${key}.webp`),
      });
    }
    console.log(`✓ sizes ${slug}: ${out[slug].map((s) => s.label).join(", ")}`);
  }

  const body = Object.entries(out)
    .map(
      ([slug, list]) =>
        `  ${JSON.stringify(slug)}: [\n${list.map((s) => `    { label: ${JSON.stringify(s.label)}, image: ${JSON.stringify(s.image)} },`).join("\n")}\n  ],`,
    )
    .join("\n");
  await writeFile(
    path.join(root, "data", "sizes.ts"),
    `/**\n * Board sizes with a photo per size. GENERATED by scripts/import-photos.mts — do not edit by hand.\n * Source: size folders in the Plusmark Drive (e.g. "2 X 3 WB - P-1").\n */\nexport interface SizeOption {\n  label: string;\n  image: string;\n}\n\nexport const sizeOptions: Record<string, SizeOption[]> = {\n${body}\n};\n`,
  );
}

async function importMain(drive: DriveFile[]) {
  const galleryFile = path.join(root, "data", "gallery.ts");
  let src = await readFile(galleryFile, "utf8");
  for (const [slug, sources] of Object.entries(SOURCES)) {
    const [first] = await resolve(sources[0], drive);
    await writeMain(first, path.join(OUT, `${slug}.webp`));
    const url = await versioned(`/images/products/${slug}.webp`);
    const escaped = `/images/products/${slug}.webp`.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&");
    src = src.replace(new RegExp(`"${escaped}(\\?v=[0-9a-f]+)?"`, "g"), JSON.stringify(url));
    console.log(`✓ main ${slug}`);
  }
  await writeFile(galleryFile, src);
}

async function main() {
  const drive = await loadDrive();
  await mkdir(CACHE, { recursive: true });
  await mkdir(OUT, { recursive: true });

  // `--sizes` only refreshes the per-size images (data/sizes.ts), leaving galleries untouched.
  if (process.argv.includes("--sizes")) {
    await importSizes(drive);
    return;
  }
  // `--main` only rewrites each product's main card image (<slug>.webp) from its first real
  // photo source and refreshes that URL's hash in data/gallery.ts. Use it after
  // `assets:renders`, which overwrites the same files with 3D renders.
  if (process.argv.includes("--main")) {
    await importMain(drive);
    return;
  }

  const gallery: Record<string, string[]> = {};
  for (const [slug, sources] of Object.entries(SOURCES)) {
    const files: string[] = [];
    for (const s of sources) files.push(...(await resolve(s, drive)));

    await writeMain(files[0], path.join(OUT, `${slug}.webp`));

    const dir = path.join(OUT, slug);
    await rm(dir, { recursive: true, force: true });
    const paths = [await versioned(`/images/products/${slug}.webp`)];
    if (files.length > 1) {
      await mkdir(dir, { recursive: true });
      for (let i = 1; i < files.length; i++) {
        // Local extras are studio shots too — present them like the main image.
        const out = path.join(dir, `${i}.webp`);
        if (files[i].startsWith(PHOTOS_DIR)) await writeMain(files[i], out);
        else await writeGallery(files[i], out);
        paths.push(await versioned(`/images/products/${slug}/${i}.webp`));
      }
    }
    gallery[slug] = paths;
    console.log(`✓ ${slug} (${paths.length})`);
  }

  const body = Object.entries(gallery)
    .map(([slug, list]) => `  ${JSON.stringify(slug)}: [\n${list.map((p) => `    ${JSON.stringify(p)},`).join("\n")}\n  ],`)
    .join("\n");
  await writeFile(
    path.join(root, "data", "gallery.ts"),
    `/**\n * Product photo galleries. GENERATED by scripts/import-photos.mts — do not edit by hand.\n * The first entry is always the main product image.\n */\nexport const gallery: Record<string, string[]> = {\n${body}\n};\n`,
  );
  console.log(`Done — ${Object.keys(gallery).length} products.`);

  // Gallery step wipes <slug>/ folders, so sizes are written afterwards.
  await importSizes(drive);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
