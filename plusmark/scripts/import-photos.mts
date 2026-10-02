/**
 * Imports real product photography into the site.
 *
 *   node scripts/import-photos.mts                every product in SOURCES, then every size photo
 *   node scripts/import-photos.mts --only=a,b     just those products (gallery + size photos); all
 *                                                 other entries in data/gallery.ts / data/sizes.ts stay
 *   node scripts/import-photos.mts --sizes        only refresh the per-size photos (respects --only)
 *   node scripts/import-photos.mts --main         only rewrite the main card images (respects --only)
 *   node scripts/import-photos.mts --plan         print the resolved photos / size folders, write nothing
 *
 * Sources
 *   local:<name>          → <PHOTOS_DIR>/<name>.jpg  (default: ~/Downloads/AA Images-01)
 *   drive:<folder>        → every image inside that Google Drive folder path, resolved via
 *                           <DRIVE_LIST> (default: ../drive-tmp/drive_list.tsv, produced by crawl.ps1)
 *   mt:<folder>|<shots>   → Metallic HQ listing photos, <METALLIC_DIR>/<folder>
 *   eco:<folder>|<shots>  → ECO HQ listing photos, <ECO_DIR>/<folder>
 *   hw:<folder>|<shots>   → Homework Table photos, <HOMEWORK_DIR>/<folder>
 *   <shots> picks files in that order, by shot number (the part after "P1_" / "P1-" in names like
 *   "MT-WB-23-P1_4.jpg" or "BS-23-P1_7-1.jpg", or the bare name "4.jpg") or by file name without
 *   extension. Without <shots> every image in the folder is used, in natural order. Folder names
 *   match case- and whitespace-insensitively ("Metallic Mag. WB" finds "Metallic  Mag. WB").
 *
 * Output
 *   public/images/products/<slug>.webp        main image (first source), trimmed + centred 1600×1200
 *   public/images/products/<slug>/<n>.webp    gallery images (all sources)
 *   data/gallery.ts                            slug → gallery image paths
 *   public/images/products/<slug>/size-<w>x<h>.webp + data/sizes.ts   per-size photos (SIZE_SOURCES)
 *
 * Products not listed in SOURCES keep their existing rendered/placeholder image.
 */
import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import sharp from "sharp";

const root = path.resolve(".");
const DOWNLOADS = path.join(os.homedir(), "Downloads");
const PHOTOS_DIR = process.env.PHOTOS_DIR ?? path.join(DOWNLOADS, "AA Images-01");
const DRIVE_LIST = process.env.DRIVE_LIST ?? path.resolve(root, "..", "drive-tmp", "drive_list.tsv");
const CACHE = process.env.DRIVE_CACHE ?? path.resolve(root, "..", "drive-tmp", "cache");
const OUT = path.join(root, "public", "images", "products");

/** Local HQ photo folders (as downloaded from the Plusmark Drive). */
const LOCAL_DIRS: Record<string, string> = {
  mt: process.env.METALLIC_DIR ?? path.join(DOWNLOADS, "metallic-20261001T064519Z-1-001", "metallic"),
  eco: process.env.ECO_DIR ?? path.join(DOWNLOADS, "ECO-20261001T064521Z-1-001", "ECO"),
  hw:
    process.env.HOMEWORK_DIR ??
    path.join(DOWNLOADS, "Plus Mark Home work table-20261001T064517Z-1-001", "Plus Mark Home work table"),
};

const W = 1600;
const H = 1200;

/*
 * Shots in the HQ listing folders (same numbering in every size folder):
 *   Metallic  1 main · 2 pack of 2 · 3 pack of 4 · 4 dimensions · 5 held to scale ·
 *             6 portrait / landscape · 7 features · 8 mounting options · 9 in use
 *   ECO       1 main · 2 pack of 2 · 3 pack of 4 · 4 dimensions · 5 held to scale ·
 *             6 portrait / landscape · 7-1 straight-on · 7 features · 8 in use
 * Galleries follow that (Amazon) order but skip the pack-of-2 / pack-of-4 shots: the site does not
 * sell packs. A second variant (the chalk version of a magnetic / ceramic board, other notice
 * board colours) only adds the shots that differ.
 */
const MT_SHOTS = "1,4,5,6,7,8,9";
const MT_VARIANT = "1,4,5,9";
const ECO_SHOTS = "1,4,5,6,7-1,7,8";
const ECO_VARIANT = "1,4,5,8";

/** slug → ordered image sources. The first source becomes the main product image. */
const SOURCES: Record<string, string[]> = {
  // White boards
  "metallic-premium-white-board": [`mt:Non. Mag. WB/2x3 Feet|${MT_SHOTS}`],
  "eco-premium-white-board": [`eco:ECO WB/2x3 Feet|${ECO_SHOTS}`],
  "eco-premium-both-side-board": [`eco:ECO Both side/2x3 Feet|${ECO_SHOTS}`],
  "deluxe-standard-white-board": ["local:Images-03"],
  "eco-regular-white-board": ["local:Images-04"],
  // Chalk boards
  "metallic-premium-chalk-board": [`mt:Non. Mag. CB/2x3 Feet|${MT_SHOTS}`],
  "eco-premium-chalk-board": [`eco:ECO CB/2x3 Feet|${ECO_SHOTS}`],
  "deluxe-standard-chalk-board": ["local:Images-07"],
  // Notice boards: full set in one colour, then the main shot of every other colour.
  "metallic-premium-notice-board": [
    `mt:Notice Board/Navy Blue/2x3 Feet|${MT_SHOTS}`,
    "mt:Notice Board/Red/2x3 Feet|1",
    "mt:Notice Board/Maroon/2x3 Feet|1",
    "mt:Notice Board/Green/2x3 Feet|1",
    "mt:Notice Board/Grey/2x3 Feet|1",
    "mt:Notice Board/Blue/2x3 Feet|1",
  ],
  "eco-premium-notice-board": [
    `eco:ECO Notice Board/Eco NB Green/2x3 Feet|${ECO_SHOTS}`,
    "eco:ECO Notice Board/Eco NB Maroon/2x3 Feet|1",
    "eco:ECO Notice Board/Eco N-B Blue/2x3 Feet|1",
  ],
  "deluxe-standard-notice-board": ["local:Images-10"],
  "eco-regular-notice-board": ["local:Images-11"],
  // Magnetic boards: white (marker) set, then the green (chalk) variant.
  "metallic-premium-magnetic-board": [
    `mt:Metallic Mag. WB/2x3 Feet|${MT_SHOTS}`,
    `mt:Metallic Mag. CB/2x3 Feet|${MT_VARIANT}`,
  ],
  "deluxe-standard-magnetic-board": ["local:Images-13"],
  // The Amazon "Eco Magnetic" listings (white + chalk) are shown on this product page (see data/aplus.ts).
  "eco-regular-magnetic-board": [
    `eco:ECO Magnetic W-B/2x3 Feet|${ECO_SHOTS}`,
    `eco:ECO Magnetic C-B/2x3 Feet|${ECO_VARIANT}`,
  ],
  // Ceramic boards
  "metallic-premium-ceramic-board": [
    `mt:Metallic Ceramic WB/2x3 Feet|${MT_SHOTS}`,
    `mt:Metallic Ceramic CB/2x3 Feet|${MT_VARIANT}`,
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
  // Homework Table: branded shot (tilted top, written on), dimensions, clip + height callouts,
  // flat / tilted / back views, laptop set-ups, then the children-at-home shots.
  "student-study-table": [
    "hw:|067A8762-1,067A8712_4,067A8712_3,067A8712,067A8762,067A8786,067A8712_1,067A8712_2,067A8819,067A8820,067A8821,067A8794,067A8818",
  ],
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
 * slug → HQ folder whose sub-folders are per-size shoots, named like "2x3 Feet" (also "2x4",
 * "1.5.x2 Feet", "1X1 Feer"). The main shot of every size becomes that size's image.
 * Notice boards use one colour (the same colour as the product's main image).
 */
const SIZE_SOURCES: Record<string, string> = {
  "metallic-premium-white-board": "mt:Non. Mag. WB",
  "metallic-premium-chalk-board": "mt:Non. Mag. CB",
  "metallic-premium-notice-board": "mt:Notice Board/Navy Blue",
  "metallic-premium-magnetic-board": "mt:Metallic Mag. WB",
  "metallic-premium-ceramic-board": "mt:Metallic Ceramic WB",
  "eco-premium-white-board": "eco:ECO WB",
  "eco-premium-both-side-board": "eco:ECO Both side",
  "eco-premium-chalk-board": "eco:ECO CB",
  "eco-premium-notice-board": "eco:ECO Notice Board/Eco NB Green",
  "eco-regular-magnetic-board": "eco:ECO Magnetic W-B",
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
const IMAGE = /\.(jpe?g|png|webp)$/i;

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

/** Folder name comparison that ignores case and repeated / trailing whitespace. */
const norm = (s: string) => s.toLowerCase().replace(/\s+/g, " ").trim();

/** Resolves "<kind>:<a>/<b>" to a real directory, matching each segment with norm(). */
async function localDir(kind: string, rel: string): Promise<string> {
  const base = LOCAL_DIRS[kind];
  if (!base) throw new Error(`Unknown photo source kind: ${kind}`);
  if (!existsSync(base)) throw new Error(`Missing photo folder: ${base} (set the ${kind.toUpperCase()} folder env var)`);
  let dir = base;
  for (const seg of rel.split("/").filter(Boolean)) {
    const entries = await readdir(dir, { withFileTypes: true });
    const hit = entries.find((e) => e.isDirectory() && norm(e.name) === norm(seg));
    if (!hit) throw new Error(`No folder "${seg}" in ${dir}`);
    dir = path.join(dir, hit.name);
  }
  return dir;
}

async function listImages(dir: string): Promise<string[]> {
  return (await readdir(dir)).filter((f) => IMAGE.test(f)).sort(natural.compare).map((f) => path.join(dir, f));
}

/** Shot id of a listing photo: "MT-WB-23-P1_7.jpg" → "7", "BS-23-P1_7-1.jpg" → "7-1", "4.jpg" → "4". */
const shotId = (file: string) =>
  path
    .parse(file)
    .name.replace(/^.*?P1[_-]/i, "")
    .replace(/_/g, "-");

async function resolveLocal(kind: string, ref: string): Promise<string[]> {
  const [folder, only] = ref.split("|");
  const dir = await localDir(kind, folder);
  const files = await listImages(dir);
  if (files.length === 0) throw new Error(`No images in ${dir}`);
  if (!only) return files;
  return only.split(",").map((sel) => {
    const hit = files.find((f) => shotId(f) === sel) ?? files.find((f) => path.parse(f).name === sel);
    if (!hit) throw new Error(`No photo "${sel}" in ${dir}`);
    return hit;
  });
}

async function resolve(src: string, drive: DriveFile[]): Promise<string[]> {
  const [kind, ...rest] = src.split(":");
  const ref = rest.join(":");
  if (kind === "local") {
    const file = path.join(PHOTOS_DIR, `${ref}.jpg`);
    if (!existsSync(file)) throw new Error(`Missing local photo: ${file}`);
    return [file];
  }
  if (LOCAL_DIRS[kind]) return resolveLocal(kind, ref);
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

/**
 * Gallery image: keep the composition (infographic / lifestyle shots), cap at 2000 px — the
 * native size of the HQ listing photos, so the hover magnifier still has real detail.
 */
async function writeGallery(input: string, out: string) {
  await sharp(input, { failOn: "none" })
    .rotate()
    .flatten({ background: "#ffffff" })
    .resize(2000, 2000, { fit: "inside", withoutEnlargement: true })
    .webp({ quality: 84 })
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

/** "2x3 Feet" → [2, 3]; tolerates "2x4", "3x4 feet", "1.5.x2 Feet", "1X1 Feer". */
function parseSize(name: string): [number, number] | undefined {
  const m = name.match(/^\s*(\d+(?:\.\d+)?)\.?\s*x\s*(\d+(?:\.\d+)?)/i);
  return m ? [Number(m[1]), Number(m[2])] : undefined;
}

type SizeEntry = { label: string; image: string };
type SizePlan = Array<{ w: number; h: number; photo: string }>;

/** Size folders of one product and the photo used for each (smallest size first). */
async function planSizes(source: string): Promise<SizePlan> {
  const [kind, ...rest] = source.split(":");
  const base = await localDir(kind, rest.join(":"));
  const plan: SizePlan = [];
  for (const e of await readdir(base, { withFileTypes: true })) {
    const wh = e.isDirectory() ? parseSize(e.name) : undefined;
    if (!wh) continue;
    const files = await listImages(path.join(base, e.name));
    // the main shot ("…P1_1"), else the first photo ("P1.jpg" in the 1 × 1 ft folders)
    const photo = files.find((f) => shotId(f) === "1") ?? files[0];
    if (!photo) throw new Error(`No images in ${path.join(base, e.name)}`);
    plan.push({ w: wh[0], h: wh[1], photo });
  }
  if (plan.length === 0) throw new Error(`No size folders under: ${base}`);
  return plan.sort((a, b) => a.w - b.w || a.h - b.h);
}

/** Per-size images for one product → public/images/products/<slug>/size-<w>x<h>.webp. */
async function importSizesFor(slug: string, plan: SizePlan): Promise<SizeEntry[]> {
  const dir = path.join(OUT, slug);
  await mkdir(dir, { recursive: true });
  const list: SizeEntry[] = [];
  for (const { w, h, photo } of plan) {
    const key = `${fmt(w)}x${fmt(h)}`;
    await writeMain(photo, path.join(dir, `size-${key}.webp`));
    list.push({ label: `${fmt(w)} × ${fmt(h)} ft`, image: await versioned(`/images/products/${slug}/size-${key}.webp`) });
  }
  console.log(`✓ sizes ${slug}: ${list.map((s) => s.label).join(", ")}`);
  return list;
}

/** Existing generated data, so a partial (--only) run can keep every entry it doesn't touch. */
async function loadGenerated<T>(file: string, name: string): Promise<Record<string, T>> {
  const full = path.join(root, "data", file);
  if (!existsSync(full)) return {};
  const mod = await import(pathToFileURL(full).href);
  return (mod[name] ?? {}) as Record<string, T>;
}

/** Ordered merge: keys in `order` first (fresh value, else the old one), then any other old keys. */
function merge<T>(order: string[], fresh: Record<string, T>, old: Record<string, T>, drop: Set<string>): Record<string, T> {
  const out: Record<string, T> = {};
  for (const k of order) {
    if (k in fresh) out[k] = fresh[k];
    else if (k in old && !drop.has(k)) out[k] = old[k];
  }
  for (const [k, v] of Object.entries(old)) if (!(k in out) && !drop.has(k)) out[k] = v;
  return out;
}

async function writeSizes(entries: Record<string, SizeEntry[]>) {
  const body = Object.entries(entries)
    .map(
      ([slug, list]) =>
        `  ${JSON.stringify(slug)}: [\n${list.map((s) => `    { label: ${JSON.stringify(s.label)}, image: ${JSON.stringify(s.image)} },`).join("\n")}\n  ],`,
    )
    .join("\n");
  await writeFile(
    path.join(root, "data", "sizes.ts"),
    `/**\n * Board sizes with a photo per size. GENERATED by scripts/import-photos.mts — do not edit by hand.\n * Source: per-size folders of the HQ listing photos (e.g. "ECO WB/2x3 Feet").\n */\nexport interface SizeOption {\n  label: string;\n  image: string;\n}\n\nexport const sizeOptions: Record<string, SizeOption[]> = {\n${body}\n};\n`,
  );
}

async function writeGalleryFile(entries: Record<string, string[]>) {
  const body = Object.entries(entries)
    .map(([slug, list]) => `  ${JSON.stringify(slug)}: [\n${list.map((p) => `    ${JSON.stringify(p)},`).join("\n")}\n  ],`)
    .join("\n");
  await writeFile(
    path.join(root, "data", "gallery.ts"),
    `/**\n * Product photo galleries. GENERATED by scripts/import-photos.mts — do not edit by hand.\n * The first entry is always the main product image.\n */\nexport const gallery: Record<string, string[]> = {\n${body}\n};\n`,
  );
}

/** Resolves every size folder first, so a bad path fails before any file is written. */
async function planAllSizes(slugs: string[]): Promise<Map<string, SizePlan>> {
  const plans = new Map<string, SizePlan>();
  for (const slug of slugs) if (SIZE_SOURCES[slug]) plans.set(slug, await planSizes(SIZE_SOURCES[slug]));
  return plans;
}

/** Writes the planned size photos and merges them into data/sizes.ts. */
async function importSizes(plans: Map<string, SizePlan>, dropped: Set<string> = new Set()) {
  const old = await loadGenerated<SizeEntry[]>("sizes.ts", "sizeOptions");
  const fresh: Record<string, SizeEntry[]> = {};
  for (const [slug, plan] of plans) fresh[slug] = await importSizesFor(slug, plan);
  await writeSizes(merge(Object.keys(SIZE_SOURCES), fresh, old, dropped));
}

async function importMain(slugs: string[], drive: DriveFile[]) {
  const galleryFile = path.join(root, "data", "gallery.ts");
  let src = await readFile(galleryFile, "utf8");
  for (const slug of slugs) {
    const [first] = await resolve(SOURCES[slug][0], drive);
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

  const onlyArg = process.argv.find((a) => a.startsWith("--only="));
  const only = onlyArg ? onlyArg.slice("--only=".length).split(",").map((s) => s.trim()).filter(Boolean) : undefined;
  for (const s of only ?? []) if (!SOURCES[s]) throw new Error(`--only: "${s}" is not in SOURCES`);
  const slugs = only ?? Object.keys(SOURCES);

  // `--sizes` only refreshes the per-size images (data/sizes.ts), leaving galleries untouched.
  if (process.argv.includes("--sizes")) {
    await importSizes(await planAllSizes(only ?? Object.keys(SIZE_SOURCES)));
    return;
  }
  // `--main` only rewrites each product's main card image (<slug>.webp) from its first real
  // photo source and refreshes that URL's hash in data/gallery.ts. Use it after
  // `assets:renders`, which overwrites the same files with 3D renders.
  if (process.argv.includes("--main")) {
    await importMain(slugs, drive);
    return;
  }

  // Resolve every photo and size folder up front: a missing file aborts before anything is
  // overwritten or deleted.
  const resolved = new Map<string, string[]>();
  for (const slug of slugs) {
    const files: string[] = [];
    for (const s of SOURCES[slug]) files.push(...(await resolve(s, drive)));
    resolved.set(slug, files);
  }
  const sizePlans = await planAllSizes(only ? slugs : Object.keys(SIZE_SOURCES));

  // `--plan` prints what would be imported and stops (nothing is written).
  if (process.argv.includes("--plan")) {
    const short = (f: string) => path.relative(DOWNLOADS, f);
    for (const [slug, files] of resolved) console.log(`${slug}\n${files.map((f, i) => `  ${i}: ${short(f)}`).join("\n")}`);
    for (const [slug, plan] of sizePlans) console.log(`${slug} sizes\n${plan.map((p) => `  ${p.w}x${p.h}: ${short(p.photo)}`).join("\n")}`);
    return;
  }

  const fresh: Record<string, string[]> = {};
  for (const [slug, files] of resolved) {
    await writeMain(files[0], path.join(OUT, `${slug}.webp`));

    const dir = path.join(OUT, slug);
    await rm(dir, { recursive: true, force: true });
    const paths = [await versioned(`/images/products/${slug}.webp`)];
    if (files.length > 1) {
      await mkdir(dir, { recursive: true });
      for (let i = 1; i < files.length; i++) {
        // AA studio extras are white-background product shots — present them like the main image.
        const out = path.join(dir, `${i}.webp`);
        if (files[i].startsWith(PHOTOS_DIR)) await writeMain(files[i], out);
        else await writeGallery(files[i], out);
        paths.push(await versioned(`/images/products/${slug}/${i}.webp`));
      }
    }
    fresh[slug] = paths;
    console.log(`✓ ${slug} (${paths.length})`);
  }

  const old = only ? await loadGenerated<string[]>("gallery.ts", "gallery") : {};
  await writeGalleryFile(merge(Object.keys(SOURCES), fresh, old, new Set()));
  console.log(`Done — ${slugs.length} product${slugs.length === 1 ? "" : "s"}.`);

  // The gallery step wipes <slug>/ folders (size photos included), so sizes are written
  // afterwards; processed products without SIZE_SOURCES lose their (now deleted) size entries.
  await importSizes(sizePlans, new Set(slugs.filter((s) => !SIZE_SOURCES[s])));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
