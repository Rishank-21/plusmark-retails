/**
 * Generates Draco-compressed GLB models for products that have an entry in data/visuals.ts.
 *
 * Boards are built to match the real Plusmark product photos (public/images/products):
 *  - Metallic Premium ("signature"): two-lobe tubular aluminium rail with a side channel, red
 *    moulded caps (PLUSMARK embossed) over the black corner connector, whose arms and Phillips
 *    screws show in the channel (corner, rail and edge close-up photos).
 *  - Eco Premium ("abs"): flat grooved profile, grey ABS caps with a black insert, raised wire hangers.
 *  - Deluxe Standard ("chrome"): two-groove aluminium profile, moulded grey elbow corners with a
 *    double-ridge collar near each seam, Phillips pan-head screws on the rail sides (corner photos).
 *  - Eco Regular ("plastic"): light flat profile with grey plastic corners, raised wire hangers.
 * Surface grain (chalk, blazer cloth) is cropped from the real photos and tinted with the sampled
 * photo colour. The back (every board except double-sided) uses the real back-panel photo in
 * scripts/assets/board-back.jpg plus the grey L-shaped corner plates, screws and wire hangers.
 *
 * Proportions use a nominal 4 × 3 ft board; frame/corner sizes are estimated from photos, not CAD.
 * Real CAD/photogrammetry GLBs can replace these files 1:1 at /public/models/<slug>.glb.
 *
 * Run: npm run assets:models
 */
import { Document, NodeIO, TextureInfo, type Material, type Texture } from "@gltf-transform/core";
import { KHRONOS_EXTENSIONS, KHRMaterialsClearcoat, KHRMaterialsSheen } from "@gltf-transform/extensions";
import { dedup, draco, prune } from "@gltf-transform/functions";
import draco3d from "draco3dgltf";
import sharp from "sharp";
import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";
import { visuals, type Visual, type Surface, type Corner, type FrameTier } from "../data/visuals.ts";

/* ------------------------------------------------------------------ */
/* Geometry primitives                                                  */
/* ------------------------------------------------------------------ */
type Vec3 = [number, number, number];
interface Geo {
  p: number[];
  n: number[];
  uv: number[];
  i: number[];
}
const empty = (): Geo => ({ p: [], n: [], uv: [], i: [] });

function box(w: number, h: number, d: number): Geo {
  const g = empty();
  const hw = w / 2, hh = h / 2, hd = d / 2;
  const faces: Array<{ n: Vec3; v: Vec3[] }> = [
    { n: [0, 0, 1], v: [[-hw, -hh, hd], [hw, -hh, hd], [hw, hh, hd], [-hw, hh, hd]] },
    { n: [0, 0, -1], v: [[hw, -hh, -hd], [-hw, -hh, -hd], [-hw, hh, -hd], [hw, hh, -hd]] },
    { n: [1, 0, 0], v: [[hw, -hh, hd], [hw, -hh, -hd], [hw, hh, -hd], [hw, hh, hd]] },
    { n: [-1, 0, 0], v: [[-hw, -hh, -hd], [-hw, -hh, hd], [-hw, hh, hd], [-hw, hh, -hd]] },
    { n: [0, 1, 0], v: [[-hw, hh, hd], [hw, hh, hd], [hw, hh, -hd], [-hw, hh, -hd]] },
    { n: [0, -1, 0], v: [[-hw, -hh, -hd], [hw, -hh, -hd], [hw, -hh, hd], [-hw, -hh, hd]] },
  ];
  for (const f of faces) {
    const base = g.p.length / 3;
    f.v.forEach((v, k) => {
      g.p.push(...v);
      g.n.push(...f.n);
      g.uv.push(k === 1 || k === 2 ? 1 : 0, k >= 2 ? 1 : 0);
    });
    g.i.push(base, base + 1, base + 2, base, base + 2, base + 3);
  }
  return g;
}

/**
 * Single quad in XY facing +Z (facing = 1) or -Z (facing = -1). UVs span 0..u × 0..v and are
 * mirrored for back-facing quads so a photo reads correctly when the board is turned around.
 */
function quad(w: number, h: number, facing: 1 | -1 = 1, u = 1, v = 1): Geo {
  const hw = w / 2, hh = h / 2;
  const xs = facing === 1 ? [-hw, hw, hw, -hw] : [hw, -hw, -hw, hw];
  const g = empty();
  const ys = [-hh, -hh, hh, hh];
  for (let k = 0; k < 4; k++) {
    g.p.push(xs[k], ys[k], 0);
    g.n.push(0, 0, facing);
    g.uv.push(k === 1 || k === 2 ? u : 0, k >= 2 ? 0 : v); // glTF UV origin is top-left
  }
  g.i.push(0, 1, 2, 0, 2, 3);
  return g;
}

/** Rounded rectangle in XY, extruded along Z, centred at origin. */
function roundedRect(w: number, h: number, d: number, r: number, seg = 6): Geo {
  const g = empty();
  r = Math.min(r, w / 2 - 1e-4, h / 2 - 1e-4);
  const pts: Array<{ x: number; y: number; nx: number; ny: number }> = [];
  const corners: Array<[number, number, number]> = [
    [w / 2 - r, h / 2 - r, 0],
    [-w / 2 + r, h / 2 - r, Math.PI / 2],
    [-w / 2 + r, -h / 2 + r, Math.PI],
    [w / 2 - r, -h / 2 + r, (3 * Math.PI) / 2],
  ];
  for (const [cx, cy, a0] of corners) {
    for (let s = 0; s <= seg; s++) {
      const a = a0 + (s / seg) * (Math.PI / 2);
      const nx = Math.cos(a), ny = Math.sin(a);
      pts.push({ x: cx + nx * r, y: cy + ny * r, nx, ny });
    }
  }
  const hd = d / 2;
  for (const side of [1, -1]) {
    const base = g.p.length / 3;
    g.p.push(0, 0, side * hd);
    g.n.push(0, 0, side);
    g.uv.push(0.5, 0.5);
    for (const q of pts) {
      g.p.push(q.x, q.y, side * hd);
      g.n.push(0, 0, side);
      g.uv.push(q.x / w + 0.5, q.y / h + 0.5);
    }
    for (let k = 0; k < pts.length; k++) {
      const a = base + 1 + k;
      const b = base + 1 + ((k + 1) % pts.length);
      if (side === 1) g.i.push(base, a, b);
      else g.i.push(base, b, a);
    }
  }
  const base = g.p.length / 3;
  pts.forEach((q, k) => {
    g.p.push(q.x, q.y, hd, q.x, q.y, -hd);
    g.n.push(q.nx, q.ny, 0, q.nx, q.ny, 0);
    g.uv.push(k / pts.length, 1, k / pts.length, 0);
  });
  for (let k = 0; k < pts.length; k++) {
    const a = base + k * 2;
    const b = base + ((k + 1) % pts.length) * 2;
    g.i.push(a, a + 1, b + 1, a, b + 1, b);
  }
  return g;
}

/** Convex polygon (CCW, in XY) extruded along Z, centred on z = 0. */
function extrude(pts: Array<[number, number]>, d: number): Geo {
  // enforce CCW winding (mirrored outlines come in clockwise)
  let area = 0;
  for (let k = 0; k < pts.length; k++) {
    const [ax, ay] = pts[k], [bx, by] = pts[(k + 1) % pts.length];
    area += ax * by - bx * ay;
  }
  if (area < 0) pts = pts.slice().reverse();
  const g = empty();
  const hd = d / 2;
  const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
  const [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
  for (const side of [1, -1]) {
    const base = g.p.length / 3;
    for (const [x, y] of pts) {
      g.p.push(x, y, side * hd);
      g.n.push(0, 0, side);
      g.uv.push((x - x0) / (x1 - x0), (y - y0) / (y1 - y0));
    }
    for (let k = 1; k < pts.length - 1; k++) {
      if (side === 1) g.i.push(base, base + k, base + k + 1);
      else g.i.push(base, base + k + 1, base + k);
    }
  }
  for (let k = 0; k < pts.length; k++) {
    const [ax, ay] = pts[k], [bx, by] = pts[(k + 1) % pts.length];
    const len = Math.hypot(bx - ax, by - ay) || 1;
    const nx = (by - ay) / len, ny = -(bx - ax) / len;
    const base = g.p.length / 3;
    g.p.push(ax, ay, hd, bx, by, hd, bx, by, -hd, ax, ay, -hd);
    for (let v = 0; v < 4; v++) g.n.push(nx, ny, 0);
    g.uv.push(0, 1, 1, 1, 1, 0, 0, 0);
    g.i.push(base, base + 3, base + 2, base, base + 2, base + 1);
  }
  return g;
}

/**
 * Corner piece outline for the top-right corner (outer corner at +x,+y), size s × s.
 * `round` rounds the outer corner with radius r; otherwise it is chamfered by r.
 * Mirror with sx/sy for the other corners.
 */
function cornerOutline(s: number, r: number, round: boolean, sx: number, sy: number, seg = 10): Array<[number, number]> {
  const h = s / 2;
  const pts: Array<[number, number]> = [[-h, -h], [h, -h]];
  if (round) {
    for (let k = 0; k <= seg; k++) {
      const a = (k / seg) * (Math.PI / 2);
      pts.push([h - r + Math.cos(a) * r, h - r + Math.sin(a) * r]);
    }
  } else {
    pts.push([h, h - r], [h - r, h]);
  }
  pts.push([-h, h]);
  return pts.map(([x, y]) => [x * sx, y * sy] as [number, number]);
}

/** Clips a convex polygon to the half-plane n·p ≥ c (Sutherland–Hodgman). */
function clipPoly(pts: Array<[number, number]>, nx: number, ny: number, c: number): Array<[number, number]> {
  const out: Array<[number, number]> = [];
  const side = (p: [number, number]) => p[0] * nx + p[1] * ny - c;
  for (let k = 0; k < pts.length; k++) {
    const a = pts[k], b = pts[(k + 1) % pts.length];
    const da = side(a), db = side(b);
    if (da >= 0) out.push(a);
    if (da >= 0 !== db >= 0) {
      const t = da / (da - db);
      out.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]);
    }
  }
  return out;
}

/** Cylinder along Y, centred. */
function cylinder(r: number, len: number, seg = 20): Geo {
  const g = empty();
  const hl = len / 2;
  for (let s = 0; s <= seg; s++) {
    const a = (s / seg) * Math.PI * 2;
    const x = Math.cos(a) * r, z = Math.sin(a) * r;
    g.p.push(x, hl, z, x, -hl, z);
    g.n.push(Math.cos(a), 0, Math.sin(a), Math.cos(a), 0, Math.sin(a));
    g.uv.push(s / seg, 1, s / seg, 0);
  }
  for (let s = 0; s < seg; s++) {
    const a = s * 2, b = a + 2;
    g.i.push(a, b, a + 1, b, b + 1, a + 1);
  }
  for (const side of [1, -1]) {
    const c = g.p.length / 3;
    g.p.push(0, side * hl, 0);
    g.n.push(0, side, 0);
    g.uv.push(0.5, 0.5);
    for (let s = 0; s <= seg; s++) {
      const a = (s / seg) * Math.PI * 2;
      g.p.push(Math.cos(a) * r, side * hl, Math.sin(a) * r);
      g.n.push(0, side, 0);
      g.uv.push(Math.cos(a) / 2 + 0.5, Math.sin(a) / 2 + 0.5);
    }
    for (let s = 0; s < seg; s++) {
      if (side === 1) g.i.push(c, c + 2 + s, c + 1 + s);
      else g.i.push(c, c + 1 + s, c + 2 + s);
    }
  }
  return g;
}

function rotate(v: Vec3, [rx, ry, rz]: Vec3): Vec3 {
  let [x, y, z] = v;
  let c = Math.cos(rx), s = Math.sin(rx);
  [y, z] = [y * c - z * s, y * s + z * c];
  c = Math.cos(ry); s = Math.sin(ry);
  [x, z] = [x * c + z * s, -x * s + z * c];
  c = Math.cos(rz); s = Math.sin(rz);
  [x, y] = [x * c - y * s, x * s + y * c];
  return [x, y, z];
}

function place(g: Geo, pos: Vec3, rot: Vec3 = [0, 0, 0]): Geo {
  const out = empty();
  for (let k = 0; k < g.p.length; k += 3) {
    const v = rotate([g.p[k], g.p[k + 1], g.p[k + 2]], rot);
    out.p.push(v[0] + pos[0], v[1] + pos[1], v[2] + pos[2]);
    out.n.push(...rotate([g.n[k], g.n[k + 1], g.n[k + 2]], rot));
  }
  out.uv = g.uv.slice();
  out.i = g.i.slice();
  return out;
}

/** Mirrors geometry in X and/or Y, fixing triangle winding when the mirror flips handedness. */
function mirrorXY(g: Geo, sx: number, sy: number): Geo {
  const out: Geo = { p: [], n: [], uv: g.uv.slice(), i: [] };
  for (let k = 0; k < g.p.length; k += 3) {
    out.p.push(g.p[k] * sx, g.p[k + 1] * sy, g.p[k + 2]);
    out.n.push(g.n[k] * sx, g.n[k + 1] * sy, g.n[k + 2]);
  }
  const flip = sx * sy < 0;
  for (let k = 0; k < g.i.length; k += 3) {
    if (flip) out.i.push(g.i[k], g.i[k + 2], g.i[k + 1]);
    else out.i.push(g.i[k], g.i[k + 1], g.i[k + 2]);
  }
  return out;
}

/** Point of a closed (u, v) profile, counter-clockwise, with its outward normal. */
type ProfilePoint = { u: number; v: number; nu: number; nv: number };

/**
 * Sweeps a (u, v) profile along a path in the XY plane. Each frame gives a position and the
 * in-plane direction the profile's u axis points along; v maps to +Z. Frames must advance so that
 * (tangent) = Z × n, i.e. counter-clockwise around the profile's u side. Ends are capped.
 */
function sweep(profile: ProfilePoint[], frames: Array<{ p: [number, number]; n: [number, number] }>): Geo {
  const g = empty();
  const m = profile.length;
  frames.forEach((f, k) => {
    for (const q of profile) {
      g.p.push(f.p[0] + f.n[0] * q.u, f.p[1] + f.n[1] * q.u, q.v);
      g.n.push(f.n[0] * q.nu, f.n[1] * q.nu, q.nv);
      g.uv.push(k / (frames.length - 1), 0);
    }
  });
  for (let k = 0; k < frames.length - 1; k++) {
    for (let j = 0; j < m; j++) {
      const a = k * m + j, b = k * m + ((j + 1) % m), c = (k + 1) * m + ((j + 1) % m), d = (k + 1) * m + j;
      g.i.push(a, d, c, a, c, b);
    }
  }
  const cap = (f: (typeof frames)[number], sign: 1 | -1) => {
    const t: [number, number] = [-f.n[1], f.n[0]]; // tangent = Z × n
    const base = g.p.length / 3;
    g.p.push(f.p[0], f.p[1], 0);
    g.n.push(t[0] * sign, t[1] * sign, 0);
    g.uv.push(0.5, 0.5);
    for (const q of profile) {
      g.p.push(f.p[0] + f.n[0] * q.u, f.p[1] + f.n[1] * q.u, q.v);
      g.n.push(t[0] * sign, t[1] * sign, 0);
      g.uv.push(0.5, 0.5);
    }
    for (let j = 0; j < m; j++) {
      const a = base + 1 + j, b = base + 1 + ((j + 1) % m);
      if (sign === -1) g.i.push(base, a, b);
      else g.i.push(base, b, a);
    }
  };
  cap(frames[0], -1);
  cap(frames[frames.length - 1], 1);
  return g;
}

/**
 * Decal strip that hugs a rail's front: flat across the middle, following the rounded profile
 * (radius r) near the top and bottom edges so the sticker never floats off a tubular rail.
 */
function decalStrip(w: number, h: number, flatHalf: number, r: number, rows = 12): Geo {
  const g = empty();
  const eps = 0.0012; // clears the groove lines on the rail front
  for (let j = 0; j <= rows; j++) {
    const s = -h / 2 + (j / rows) * h;
    const over = Math.max(0, Math.abs(s) - flatHalf);
    let z = 0, ny = 0, nz = 1;
    if (r > 0 && over > 0) {
      const c = Math.sqrt(Math.max(0, r * r - over * over));
      z = c - r;
      ny = (Math.sign(s) * over) / r;
      nz = c / r;
    }
    for (const x of [-w / 2, w / 2]) {
      g.p.push(x + 0, s + ny * eps, z + nz * eps);
      g.n.push(0, ny, nz);
      g.uv.push(x < 0 ? 0 : 1, 1 - j / rows);
    }
  }
  for (let j = 0; j < rows; j++) {
    const a = j * 2, b = a + 1, c = a + 3, d = a + 2;
    g.i.push(a, b, c, a, c, d);
  }
  return g;
}

/** Square steel tube between two axis-aligned points. */
function sqTube(a: Vec3, b: Vec3, s = 0.025): Geo {
  const d = [b[0] - a[0], b[1] - a[1], b[2] - a[2]].map(Math.abs);
  const size: Vec3 = [Math.max(d[0], s), Math.max(d[1], s), Math.max(d[2], s)];
  return place(box(size[0], size[1], size[2]), [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2]);
}

/** Scales UVs so a tiling texture repeats at a real-world size. */
function tileUV(g: Geo, su: number, sv: number): Geo {
  return { ...g, uv: g.uv.map((x, k) => x * (k % 2 === 0 ? su : sv)) };
}

/** Horizontal rail (length along X) with a rounded w × d profile. */
const hRail = (len: number, w: number, d: number, r: number) =>
  r > 0 ? place(roundedRect(d, w, len, r), [0, 0, 0], [0, Math.PI / 2, 0]) : box(len, w, d);
/** Vertical rail (length along Y) with a rounded w × d profile. */
const vRail = (len: number, w: number, d: number, r: number) =>
  r > 0 ? place(roundedRect(w, d, len, r), [0, 0, 0], [Math.PI / 2, 0, 0]) : box(w, len, d);

/** Thin wire segment from a to b in a plane of constant z. */
function wire(a: [number, number], b: [number, number], z: number, r = 0.0013): Geo {
  const dx = b[0] - a[0], dy = b[1] - a[1];
  const len = Math.hypot(dx, dy);
  return place(cylinder(r, len, 10), [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, z], [0, 0, Math.atan2(-dx, dy)]);
}

/* ------------------------------------------------------------------ */
/* Textures (cropped from real product photos)                         */
/* ------------------------------------------------------------------ */
interface Tex {
  data: Uint8Array;
  mime: "image/jpeg" | "image/png";
  /** Mean sRGB value (0–1) of a grain texture, so the tint colour can be compensated. */
  mean?: number;
}
const TEXTURES = new Map<string, Tex>();
const PHOTOS = path.resolve("public/images/products");
const GRAIN_MEAN = 205;

/** Neutral grey grain map from a crop of a real photo; tinted per product via the base colour. */
async function grain(file: string, left: number, top: number, size: number, targetSd: number, rotate = 0): Promise<Tex> {
  const src = () =>
    sharp(path.join(PHOTOS, file)).extract({ left, top, width: size, height: size }).rotate(rotate).resize(512, 512).greyscale();
  const { channels } = await src().stats();
  const { mean, stdev } = channels[0];
  const k = Math.min(targetSd / Math.max(stdev, 0.5), 4);
  const data = await src()
    .linear(k, GRAIN_MEAN - k * mean)
    .toColourspace("srgb")
    .jpeg({ quality: 82, mozjpeg: true })
    .toBuffer();
  return { data, mime: "image/jpeg", mean: GRAIN_MEAN / 255 };
}

/** Deterministic PRNG so regenerated models are byte-stable (content-hashed URLs). */
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Brushed-aluminium metallic/roughness map (glTF: G = roughness, B = metallic). Streaks run along
 * U so rails get their brushing direction from brushUV(). Mean G ≈ 0.85 so the material's
 * roughness factor stays close to its tuned value.
 */
async function brushedMR(): Promise<Tex> {
  // Streaks are constant along U, so a narrow texture repeated along the rail is enough (small file).
  const W = 128, H = 512;
  const rnd = mulberry32(1337);
  const rows = Array.from({ length: H }, () => rnd());
  const px = Buffer.alloc(W * H * 3);
  for (let y = 0; y < H; y++) {
    const coarse = (rows[y] + rows[(y + 1) % H] + rows[(y + H - 1) % H]) / 3;
    const streak = 0.74 + coarse * 0.24;
    for (let x = 0; x < W; x++) {
      // gentle low-frequency variation along the streak so it doesn't look ruled
      const g = streak + Math.sin((x / W) * Math.PI * 2 + rows[y] * 6.28) * 0.02;
      const k = (y * W + x) * 3;
      px[k] = 255;
      px[k + 1] = Math.round(Math.min(1, g) * 255);
      px[k + 2] = 255;
    }
  }
  const data = await sharp(px, { raw: { width: W, height: H, channels: 3 } })
    .jpeg({ quality: 88, chromaSubsampling: "4:4:4" })
    .toBuffer();
  return { data, mime: "image/jpeg" };
}

/**
 * Planar UVs for a rail so the brushed texture's streaks follow the rail's length (x for
 * horizontal rails, y for vertical ones). `streak` is the real-world height of one texture tile.
 */
function brushUV(g: Geo, horizontal: boolean, streak = 0.06): Geo {
  const uv: number[] = [];
  for (let k = 0; k < g.p.length; k += 3) {
    const x = g.p[k], y = g.p[k + 1], z = g.p[k + 2];
    const along = horizontal ? x : y;
    const across = (horizontal ? y : x) + z; // + z keeps side faces from collapsing to a line
    uv.push(along / 0.6, across / streak);
  }
  return { ...g, uv };
}

const FONT = "Arial, Helvetica, sans-serif";
/**
 * Brand decals. Kept deliberately bold and high-contrast (heavy weight, thick strokes, no hairline
 * detail) so the name stays legible when the sticker is only a few dozen pixels tall on screen.
 * Rasterised at DECAL_SCALE× so the texture stays sharp when the viewer zooms in.
 */
const DECAL_SCALE = 3;
const RETAIL_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="120" viewBox="0 0 600 120">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#eef0f3"/>
    </linearGradient>
  </defs>
  <rect x="3" y="3" width="594" height="114" rx="57" fill="url(#g)" stroke="#b9bfc7" stroke-width="3"/>
  <text x="292" y="82" text-anchor="middle" font-family="${FONT}" font-size="94" font-weight="900" letter-spacing="-2" stroke-width="3" stroke-linejoin="round"><tspan fill="#1a3587" stroke="#1a3587">plus</tspan><tspan fill="#f07c1a" stroke="#f07c1a">mark</tspan></text>
  <text x="498" y="34" font-family="${FONT}" font-size="16" font-weight="700" fill="#1a3587">TM</text>
  <text x="300" y="110" text-anchor="middle" font-family="${FONT}" font-size="21" font-weight="900" letter-spacing="11" fill="#1a3587">RETAIL</text>
</svg>`;
const BADGE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="480" height="96" viewBox="0 0 480 96">
  <defs>
    <linearGradient id="m" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#f4f5f7"/><stop offset="0.5" stop-color="#d9dde2"/><stop offset="1" stop-color="#c3c8ce"/>
    </linearGradient>
  </defs>
  <rect x="3" y="3" width="474" height="90" rx="45" fill="url(#m)" stroke="#8e959d" stroke-width="3"/>
  <circle cx="46" cy="48" r="12" fill="#8e959d"/><circle cx="46" cy="48" r="5" fill="#c9ced4"/>
  <circle cx="434" cy="48" r="12" fill="#8e959d"/><circle cx="434" cy="48" r="5" fill="#c9ced4"/>
  <text x="240" y="66" text-anchor="middle" font-family="${FONT}" font-size="52" font-weight="900" letter-spacing="3" fill="#c8141f">PLUSMARK</text>
</svg>`;

/** Chrome clip plate with the embossed PLUSMARK name and two rivets (from the clipboard photo). */
const CLIP_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="660" height="240" viewBox="0 0 660 240">
  <defs>
    <linearGradient id="c" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#f7f8f9"/><stop offset="0.28" stop-color="#c9ced3"/>
      <stop offset="0.55" stop-color="#eef0f2"/><stop offset="0.8" stop-color="#aab0b6"/><stop offset="1" stop-color="#d9dde1"/>
    </linearGradient>
    <radialGradient id="r" cx="0.4" cy="0.35" r="0.7">
      <stop offset="0" stop-color="#ffffff"/><stop offset="0.6" stop-color="#b9bec4"/><stop offset="1" stop-color="#7c838a"/>
    </radialGradient>
  </defs>
  <rect x="2" y="2" width="656" height="236" rx="26" fill="url(#c)" stroke="#8e959c" stroke-width="4"/>
  <rect x="14" y="14" width="632" height="212" rx="18" fill="none" stroke="#ffffff" stroke-opacity="0.6" stroke-width="3"/>
  <circle cx="92" cy="120" r="36" fill="url(#r)" stroke="#6f767d" stroke-width="4"/>
  <circle cx="568" cy="120" r="36" fill="url(#r)" stroke="#6f767d" stroke-width="4"/>
  <text x="332" y="143" text-anchor="middle" font-family="${FONT}" font-size="60" font-weight="900" letter-spacing="2" fill="#ffffff" fill-opacity="0.9">PLUSMARK</text>
  <text x="330" y="140" text-anchor="middle" font-family="${FONT}" font-size="60" font-weight="900" letter-spacing="2" fill="#4f565d">PLUSMARK</text>
</svg>`;

async function loadTextures() {
  const svg = async (s: string): Promise<Tex> => ({
    // palette PNG keeps the file small while preserving crisp, anti-aliased lettering
    data: await sharp(Buffer.from(s), { density: 72 * DECAL_SCALE })
      .png({ palette: true, colours: 128, dither: 0.4, compressionLevel: 9 })
      .toBuffer(),
    mime: "image/png",
  });
  TEXTURES.set("board-back", { data: await readFile(path.resolve("scripts/assets/board-back.jpg")), mime: "image/jpeg" });
  // Grain maps made by grain() from straight-on product photos, kept as fixed assets so that
  // re-importing a product gallery (which renumbers the photos) never changes the models:
  //  - chalk grade HPL: grain("metallic-premium-chalk-board/7.webp", 840, 480, 320, 16)
  //  - 2 mm blazer cloth weave: grain("metallic-premium-notice-board/4.webp", 672, 480, 256, 34)
  const asset = async (file: string): Promise<Tex> => ({
    data: await readFile(path.resolve("scripts/assets", file)),
    mime: "image/jpeg",
    mean: GRAIN_MEAN / 255,
  });
  TEXTURES.set("grain-chalk", await asset("grain-chalk.jpg"));
  TEXTURES.set("grain-fabric", await asset("grain-fabric.jpg"));
  TEXTURES.set("brushed-mr", await brushedMR());
  // Laminate MDF clipboard: the real walnut HPL face, cropped straight from the product photo
  // (below the clip, inside the board edge).
  TEXTURES.set("clip-wood", {
    data: await sharp(path.join(PHOTOS, "laminate-mdf-base-clipboard/1.webp"))
      .extract({ left: 720, top: 420, width: 560, height: 800 })
      .resize(512, 732)
      .modulate({ brightness: 1.04 })
      .jpeg({ quality: 86, mozjpeg: true })
      .toBuffer(),
    mime: "image/jpeg",
  });
  // Bench laminate: same wood grain, turned so it runs along the plank length, tinted per material.
  TEXTURES.set("grain-wood", await grain("laminate-mdf-base-clipboard/1.webp", 720, 460, 520, 20, 90));
  TEXTURES.set("cap-emboss", await embossMap(FRAME.heavy.w));
  TEXTURES.set("decal-clip", await svg(CLIP_SVG));
  TEXTURES.set("decal-retail", await svg(RETAIL_SVG));
  TEXTURES.set("decal-badge", await svg(BADGE_SVG));
}

/* ------------------------------------------------------------------ */
/* Materials                                                            */
/* ------------------------------------------------------------------ */
type MatDef = {
  color: string;
  metal?: number;
  rough?: number;
  clearcoat?: [number, number];
  sheen?: [string, number];
  alpha?: number;
  doubleSided?: boolean;
  /** Key in TEXTURES used as base colour map. */
  map?: string;
  /** Real-world size (m) of one texture tile on board surfaces. */
  tile?: number;
  /** Key in TEXTURES used as metallic/roughness map (repeat-wrapped). */
  mr?: string;
  /** Key in TEXTURES used as tangent-space normal map (clamped), and its strength. */
  normal?: string;
  normalScale?: number;
};

const MATERIALS: Record<string, MatDef> = {
  // Bright anodised aluminium: slightly below full metalness so the rails keep a light, silvery
  // base tone (as in the photos) instead of mirroring dark parts of the studio.
  aluminium: { color: "#e2e5e9", metal: 0.78, rough: 0.3, mr: "brushed-mr" },
  "aluminium-dark": { color: "#8b9198", metal: 1, rough: 0.42 },
  "aluminium-golden": { color: "#c9a560", metal: 1, rough: 0.36, mr: "brushed-mr" },
  backing: { color: "#7d8083", rough: 0.9 },
  "board-back": { color: "#ffffff", rough: 0.88, map: "board-back" },
  "back-plate": { color: "#a8ada5", rough: 0.6 },
  screw: { color: "#d9dcdf", metal: 1, rough: 0.25 },
  wire: { color: "#d4d7da", metal: 1, rough: 0.2 },
  "marker-hpl": { color: "#f8f9f9", rough: 0.14, clearcoat: [1, 0.04] },
  melamine: { color: "#f3f4f2", rough: 0.24, clearcoat: [0.55, 0.12] },
  // Albedos calibrated so the viewer lighting (components/three/Lighting.tsx) renders them at the
  // colours measured in the straight-on product photos, e.g. chalk ≈ rgb(47,95,95), navy cloth ≈ rgb(12,13,32).
  "chalk-hpl": { color: "#123737", rough: 0.9, map: "grain-chalk", tile: 0.2 },
  "fabric-navy": { color: "#05061a", rough: 1, sheen: ["#0c1036", 0.6], map: "grain-fabric", tile: 0.16 },
  "fabric-red": { color: "#4a0a10", rough: 1, sheen: ["#3a0c12", 0.6], map: "grain-fabric", tile: 0.16 },
  "fabric-green": { color: "#03110b", rough: 1, sheen: ["#0a2218", 0.6], map: "grain-fabric", tile: 0.16 },
  "fabric-gray": { color: "#4a4c50", rough: 1, sheen: ["#50545a", 0.6], map: "grain-fabric", tile: 0.16 },
  "magnetic-white": { color: "#f1f3f4", rough: 0.2, clearcoat: [0.5, 0.1] },
  "ceramic-white": { color: "#fcfcfc", rough: 0.07, clearcoat: [1, 0.02] },
  cork: { color: "#8a6440", rough: 0.96, map: "grain-fabric", tile: 0.12 },
  // Metallic Premium signature corners: satin red moulded cap with PLUSMARK embossed (normal map)
  // over the black connector.
  "cap-red": { color: "#a50b16", rough: 0.42, normal: "cap-emboss" },
  // Moulded plastic with a soft sheen; rough enough that grazing views don't turn it silver.
  "cap-black": { color: "#08090a", rough: 0.46 },
  // The connector's arms seen in the rail's side channel: matte black plastic.
  "connector-black": { color: "#111214", rough: 0.62 },
  // Floor of the signature rail's side channel, in shadow.
  "rail-channel": { color: "#6f757c", metal: 0.85, rough: 0.5 },
  // Eco ABS corners (light silver-grey L cap + matte black insert, as in the Eco close-up photo).
  "abs-gray": { color: "#7c8085", metal: 0.15, rough: 0.45 },
  "abs-dark": { color: "#050506", rough: 0.85 },
  chrome: { color: "#eceef0", metal: 1, rough: 0.07 },
  // Deluxe Standard moulded corner elbow: mid grey satin plastic (close-up photos of the corner).
  "deluxe-corner": { color: "#5f6368", rough: 0.36 },
  // Zinc-plated pan-head screws: a touch darker than the anodised rails so they read against them.
  "screw-zinc": { color: "#a9adb2", metal: 1, rough: 0.18 },
  // Phillips recess on the pan-head screws.
  "screw-recess": { color: "#1d1f22", metal: 0.5, rough: 0.55 },
  "plastic-gray": { color: "#6f7378", rough: 0.6 },
  // Printed vinyl sticker / anodised badge. The viewer renders decal-* materials un-tone-mapped
  // (components/three/ProductModel.tsx) so the brand colours stay true.
  // Matte-ish so a frontal key light doesn't wash out the print colours.
  "decal-retail": { color: "#ffffff", rough: 0.75, map: "decal-retail", alpha: 1 },
  "decal-badge": { color: "#ffffff", rough: 0.55, metal: 0.1, map: "decal-badge", alpha: 1 },
  acrylic: { color: "#f4f8fb", rough: 0.03, alpha: 0.08, doubleSided: true },
  "lock-black": { color: "#141517", metal: 0.4, rough: 0.35 },
  "wood-hpl": { color: "#74492a", rough: 0.46, clearcoat: [0.35, 0.2] },
  // Laminate MDF clipboard: real walnut HPL photo texture on the faces, raw MDF on the edge.
  // Darkened so the lit render matches the walnut tone of the photo.
  "clip-wood": { color: "#9a8a80", rough: 0.55, clearcoat: [0.2, 0.35], map: "clip-wood" },
  "mdf-edge": { color: "#a07a55", rough: 0.85 },
  "decal-clip": { color: "#ffffff", rough: 0.25, metal: 0.3, map: "decal-clip", alpha: 1 },
  // PDS-SB 807 (photo): black powder-coated square tube + beech-tone laminate planks.
  "steel-powder": { color: "#17191c", metal: 0.35, rough: 0.48 },
  "bench-laminate": { color: "#a8652c", rough: 0.6, map: "grain-wood", tile: 0.5 },
  "foot-rubber": { color: "#0c0d0e", rough: 0.9 },
  "magnet-blue": { color: "#1d5fa8", rough: 0.28, clearcoat: [0.8, 0.1] },
  "magnet-green": { color: "#1f7a5a", rough: 0.28, clearcoat: [0.8, 0.1] },
  "magnet-graphite": { color: "#2a2d31", rough: 0.28, clearcoat: [0.8, 0.1] },
};

const srgbToLinear = (c: number) => (c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
function hexLinear(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => srgbToLinear(v / 255)) as [number, number, number];
}

/* ------------------------------------------------------------------ */
/* Scene builder                                                        */
/* ------------------------------------------------------------------ */
class ModelBuilder {
  groups = new Map<string, Geo>();
  add(mat: string, g: Geo) {
    if (!MATERIALS[mat]) throw new Error(`Unknown material ${mat}`);
    const target = this.groups.get(mat) ?? empty();
    const offset = target.p.length / 3;
    target.p.push(...g.p);
    target.n.push(...g.n);
    target.uv.push(...g.uv);
    target.i.push(...g.i.map((x) => x + offset));
    this.groups.set(mat, target);
  }
}

const FRAME: Record<FrameTier, { w: number; d: number }> = {
  heavy: { w: 0.032, d: 0.028 },
  premium: { w: 0.026, d: 0.024 },
  standard: { w: 0.024, d: 0.021 },
  light: { w: 0.02, d: 0.018 },
};

/** Profile style per series, read off the product photos. */
const PROFILE: Record<Corner, { radius: number; grooves: number }> = {
  signature: { radius: 0.007, grooves: 1 }, // tubular rail with one groove near the inner edge
  abs: { radius: 0, grooves: 3 }, // flat, ribbed rail
  chrome: { radius: 0.002, grooves: 1 },
  plastic: { radius: 0, grooves: 2 },
};

/** Caps overhang the frame's outer edge by this much. */
const CAP_INSET = 0.004;

/** Corner cap shape per series: size (× frame width), outer radius/chamfer (× size), rounded or chamfered. */
const CAP: Record<Corner, { size: number; radius: number; round: boolean }> = {
  signature: { size: 2.3, radius: 0.62, round: true },
  // Eco Premium & Eco Regular share the same moulded L-cap (see addEcoCorner).
  abs: { size: 2.15, radius: 0.4, round: true },
  chrome: { size: 2.2, radius: 0.6, round: true },
  plastic: { size: 2.15, radius: 0.4, round: true },
};

/** Smooth vertex normals from area-weighted face normals (meshes with shared vertices). */
function computeNormals(g: Geo): Geo {
  const n = new Float64Array(g.p.length);
  for (let k = 0; k < g.i.length; k += 3) {
    const a = g.i[k] * 3, b = g.i[k + 1] * 3, c = g.i[k + 2] * 3;
    const ux = g.p[b] - g.p[a], uy = g.p[b + 1] - g.p[a + 1], uz = g.p[b + 2] - g.p[a + 2];
    const vx = g.p[c] - g.p[a], vy = g.p[c + 1] - g.p[a + 1], vz = g.p[c + 2] - g.p[a + 2];
    const nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
    for (const v of [a, b, c]) {
      n[v] += nx;
      n[v + 1] += ny;
      n[v + 2] += nz;
    }
  }
  const out: number[] = [];
  for (let k = 0; k < n.length; k += 3) {
    const l = Math.hypot(n[k], n[k + 1], n[k + 2]) || 1;
    out.push(n[k] / l, n[k + 1] / l, n[k + 2] / l);
  }
  return { ...g, n: out };
}

/**
 * Closed section (CCW, outward normals) spanning u ∈ [−aIn, aOut], v ∈ [−bBack, bFront], with its
 * own radius per corner: outer-front, inner-front, inner-back, outer-back. Same point count for
 * any sizes, so sections can vary along a sweepVar() path.
 */
function roundedSection(aIn: number, aOut: number, bFront: number, bBack: number, radii: [number, number, number, number], seg = 8) {
  const pts: Array<{ u: number; v: number; nu: number; nv: number }> = [];
  const lim = (r: number) => Math.max(1e-5, Math.min(r, (aIn + aOut) / 2 - 1e-5, (bFront + bBack) / 2 - 1e-5));
  const [rOF, rIF, rIB, rOB] = radii.map(lim);
  const corners: Array<[number, number, number, number]> = [
    [aOut - rOF, bFront - rOF, rOF, 0],
    [-aIn + rIF, bFront - rIF, rIF, Math.PI / 2],
    [-aIn + rIB, -bBack + rIB, rIB, Math.PI],
    [aOut - rOB, -bBack + rOB, rOB, (3 * Math.PI) / 2],
  ];
  for (const [cu, cv, r, a0] of corners) {
    for (let s = 0; s <= seg; s++) {
      const t = a0 + (s / seg) * (Math.PI / 2);
      pts.push({ u: cu + Math.cos(t) * r, v: cv + Math.sin(t) * r, nu: Math.cos(t), nv: Math.sin(t) });
    }
  }
  return pts;
}

/**
 * sweep() with its own section per frame (all sections with the same point count), for parts
 * whose section changes along the path. Smooth normals come from the mesh itself, so swellings
 * along the path (ridges, grooves) shade correctly; the flat end caps keep crisp edges.
 */
function sweepVar(
  frames: Array<{ p: [number, number]; n: [number, number]; section: ReturnType<typeof roundedSection> }>,
  /** Optional UVs per frame k / section point j, and for the end caps (default: path fraction). */
  uv?: { at: (k: number, j: number) => [number, number]; cap: [number, number] },
): Geo {
  const g = empty();
  const m = frames[0].section.length;
  frames.forEach((f, k) => {
    f.section.forEach((q, j) => {
      g.p.push(f.p[0] + f.n[0] * q.u, f.p[1] + f.n[1] * q.u, q.v);
      g.n.push(0, 0, 1);
      g.uv.push(...(uv ? uv.at(k, j) : [k / (frames.length - 1), 0]));
    });
  });
  for (let k = 0; k < frames.length - 1; k++) {
    for (let j = 0; j < m; j++) {
      const a = k * m + j, b = k * m + ((j + 1) % m), c = (k + 1) * m + ((j + 1) % m), d = (k + 1) * m + j;
      g.i.push(a, d, c, a, c, b);
    }
  }
  const body = computeNormals(g);
  const cap = (f: (typeof frames)[number], sign: 1 | -1) => {
    const t: [number, number] = [-f.n[1] * sign, f.n[0] * sign]; // tangent = Z × n
    const base = body.p.length / 3;
    const [cu, cv] = uv?.cap ?? [0.5, 0.5];
    body.p.push(f.p[0], f.p[1], 0);
    body.n.push(t[0], t[1], 0);
    body.uv.push(cu, cv);
    for (const q of f.section) {
      body.p.push(f.p[0] + f.n[0] * q.u, f.p[1] + f.n[1] * q.u, q.v);
      body.n.push(t[0], t[1], 0);
      body.uv.push(cu, cv);
    }
    for (let j = 0; j < m; j++) {
      const a = base + 1 + j, b = base + 1 + ((j + 1) % m);
      if (sign === -1) body.i.push(base, a, b);
      else body.i.push(base, b, a);
    }
  };
  cap(frames[0], -1);
  cap(frames[frames.length - 1], 1);
  return body;
}

/**
 * Phillips pan-head screw along +Y, base centred on the origin: a short skirt and a domed head
 * (radius r, total height h), plus the cross recess as a thin dark strip pair hugging the dome.
 */
function panHeadScrew(r: number, h: number): { head: Geo; cross: Geo } {
  const skirt = h * 0.28, cap = h - skirt;
  const R = (r * r + cap * cap) / (2 * cap); // sphere through the rim and the apex
  const domeY = (rho: number) => skirt + Math.sqrt(Math.max(0, R * R - rho * rho)) - (R - cap);
  const seg = 28;
  const rings: Array<[number, number]> = [[0, 0], [r, 0], [r, skirt]];
  const phiMax = Math.asin(Math.min(1, r / R));
  for (let k = 9; k >= 0; k--) {
    const rho = R * Math.sin((k / 9) * phiMax);
    rings.push([rho, domeY(rho)]);
  }
  const head = empty();
  rings.forEach(([rho, y]) => {
    for (let j = 0; j < seg; j++) {
      const t = (j / seg) * Math.PI * 2;
      head.p.push(Math.cos(t) * rho, y, Math.sin(t) * rho);
      head.n.push(0, 1, 0);
      head.uv.push(j / seg, y / h);
    }
  });
  for (let k = 0; k < rings.length - 1; k++) {
    for (let j = 0; j < seg; j++) {
      const a = k * seg + j, b = k * seg + ((j + 1) % seg), c = (k + 1) * seg + ((j + 1) % seg), d = (k + 1) * seg + j;
      head.i.push(a, c, d, a, b, c);
    }
  }
  // cross recess: two strips (length 2·l, width w) draped 0.05 mm above the dome
  const cross = empty();
  const l = r * 0.62, w = r * 0.2, steps = 12;
  for (const axis of [0, 1]) {
    const base = cross.p.length / 3;
    for (let s = 0; s <= steps; s++) {
      const along = -l + (2 * l * s) / steps;
      for (const across of [-w / 2, w / 2]) {
        const x = axis === 0 ? along : across, z = axis === 0 ? across : along;
        cross.p.push(x, domeY(Math.hypot(x, z)) + 0.00005, z);
        cross.n.push(0, 1, 0);
        cross.uv.push(s / steps, across > 0 ? 1 : 0);
      }
    }
    for (let s = 0; s < steps; s++) {
      const a = base + s * 2, b = a + 1, c = a + 3, d = a + 2;
      if (axis === 0) cross.i.push(a, b, c, a, c, d);
      else cross.i.push(a, c, b, a, d, c);
    }
  }
  return { head: computeNormals(head), cross: computeNormals(cross) };
}

/**
 * Deluxe Standard frame (visual key "chrome"), modelled on close-up photos of the real corner
 * and the Deluxe studio photo (public/images/products/deluxe-standard-white-board.webp):
 *  - rail: front face with two fine grooves — a wide flat inner band (a touch lower), a narrow
 *    flat band and a rounded outer band — a flat outer side with a centre line, chamfered inner edge;
 *  - corner: a moulded elbow sleeved over the rail ends, its oval section widening around the
 *    bend between a rounded outer contour and a rounded inner (writing surface) corner, with a
 *    groove and a double-ridge collar near each seam;
 *  - Phillips pan-head screws on the outer side of every rail, just past each corner;
 *  - the anodised PLUSMARK badge plate on the bottom rail (no RETAIL sticker on this series).
 */
const DELUXE = {
  /** The corner stands proud of the rail's outer edge, and overlaps the writing surface, by this (× fw). */
  overhang: 0.04,
  /** Radius of the corner's outer contour and of the writing surface's corner, × fw. */
  outerRadius: 0.95,
  innerRadius: 0.35,
  /** Seam between corner and rail, measured from the board's outer corner, × fw. */
  seam: 1.5,
  /** Corner depth vs. the rail (stands proud at front and back, as chunky as in the photos). */
  depth: 1.18,
  /** Section corner radii, × the front half-depth: outer-front (rounded like the rail's outer
   *  band), inner-front (meets the writing surface squarely), inner-back, outer-back. */
  radii: [0.8, 0.3, 0.25, 0.25] as const,
  /** The bend is slimmer than the end collars that sleeve over the rails: its scale (outer side and
   *  front only) blends in between `from` and `to` (× fw from the seam)… */
  waist: { scale: 0.93, from: 0.24, to: 0.44 },
  /** …with two fine ridges on that step, as on the real part (position / half-width × fw, height). */
  ridges: [
    { at: 0.28, w: 0.035, h: 0.035 },
    { at: 0.37, w: 0.035, h: 0.035 },
  ],
  /** Front grooves, offset from the rail centre-line (× fw, + = outer edge). */
  grooves: [-0.05, 0.14] as const,
  /** Screws: distance past the corner seam along the rail (× fw), head radius / height (m). */
  screw: { past: 0.6, r: 0.004, h: 0.0026 },
};
/** Rails stop where the corner's bend starts (hidden inside its sleeve). */
const deluxeClear = (fw: number) => fw * (1 + DELUXE.overhang + DELUXE.innerRadius);
const deluxeSeam = (fw: number) => fw * DELUXE.seam;

/** Deluxe rail cross-section (u across the rail, + = outer edge; v = depth, + = front), CCW. */
function deluxeRailProfile(fw: number, fd: number) {
  const a = fw / 2, b = fd / 2;
  const [g1, g2] = DELUXE.grooves.map((g) => g * fw);
  const step = 0.0004; // the wide inner band sits this much below the rest of the front
  const gw = 0.0006, gd = 0.0009; // groove half-width / depth
  const ch = 0.0008; // inner edge chamfer
  const ru = a - (g2 + gw), rv = 0.006; // elliptical outer band: from the outer groove to the side
  const rb = 0.0015; // back outer edge
  const pts: Array<{ u: number; v: number; nu: number; nv: number }> = [];
  const P = (u: number, v: number, nu: number, nv: number) => {
    const l = Math.hypot(nu, nv) || 1;
    pts.push({ u, v, nu: nu / l, nv: nv / l });
  };
  /** V groove between a lip at height v0 (outer side) and v1 (inner side); hard edges. */
  const groove = (g: number, v0: number, v1: number) => {
    P(g + gw, v0, 0, 1);
    P(g + gw, v0, -gd, gw);
    P(g, b - gd, -gd, gw);
    P(g, b - gd, gd - (b - v1), gw);
    P(g - gw, v1, gd - (b - v1), gw);
    P(g - gw, v1, 0, 1);
  };
  P(-a, -b, 0, -1);
  for (let k = 0; k <= 4; k++) {
    const t = -Math.PI / 2 + (k / 4) * (Math.PI / 2);
    P(a - rb + rb * Math.cos(t), -b + rb + rb * Math.sin(t), Math.cos(t), Math.sin(t));
  }
  for (let k = 0; k <= 14; k++) {
    const t = (k / 14) * (Math.PI / 2);
    P(a - ru + ru * Math.cos(t), b - rv + rv * Math.sin(t), Math.cos(t) / ru, Math.sin(t) / rv);
  }
  groove(g2, b, b); // outer band | narrow band
  groove(g1, b, b - step); // narrow band | inner band
  P(-a + ch, b - step, 0, 1);
  P(-a + ch, b - step, -1, 1);
  P(-a, b - step - ch, -1, 1);
  P(-a, b - step - ch, -1, 0);
  P(-a, -b, -1, 0);
  return { pts, grooves: [g1, g2], gd, sideMid: (rb - rv) / 2 };
}

/** Straight Deluxe rails (both directions shortened by `clear`), grooves, side lines, back ribs. */
function addDeluxeFrame(b: ModelBuilder, W: number, H: number, fw: number, fd: number, clear: number) {
  const prof = deluxeRailProfile(fw, fd);
  const hl = W / 2 - clear, vl = H / 2 - clear;
  const xr = W / 2 - fw / 2, yt = H / 2 - fw / 2;
  // frames advance along Z × n (see sweep)
  const rails: Array<{ f: Array<{ p: [number, number]; n: [number, number] }>; h: boolean }> = [
    { f: [{ p: [hl, yt], n: [0, 1] }, { p: [-hl, yt], n: [0, 1] }], h: true },
    { f: [{ p: [-hl, -yt], n: [0, -1] }, { p: [hl, -yt], n: [0, -1] }], h: true },
    { f: [{ p: [xr, -vl], n: [1, 0] }, { p: [xr, vl], n: [1, 0] }], h: false },
    { f: [{ p: [-xr, vl], n: [-1, 0] }, { p: [-xr, -vl], n: [-1, 0] }], h: false },
  ];
  for (const r of rails) b.add("aluminium", brushUV(sweep(prof.pts, r.f), r.h));

  const dark = (len: number, horizontal: boolean, across: number, depth: number, pos: Vec3) =>
    b.add("aluminium-dark", place(horizontal ? box(len, across, depth) : box(across, len, depth), pos));
  // dark line in each front groove (the grooves alone are sub-pixel at viewing distance)
  const gz = fd / 2 - prof.gd + 0.0003;
  for (const g of prof.grooves) {
    for (const s of [1, -1]) {
      dark(2 * hl, true, 0.0008, 0.0004, [0, s * (yt + g), gz]);
      dark(2 * vl, false, 0.0008, 0.0004, [s * (xr + g), 0, gz]);
    }
  }
  // centre line along the outer side face
  for (const s of [1, -1]) {
    b.add("aluminium-dark", place(box(2 * hl, 0.0003, 0.0007), [0, s * (H / 2 + 0.00012), prof.sideMid]));
    b.add("aluminium-dark", place(box(0.0003, 2 * vl, 0.0007), [s * (W / 2 + 0.00012), 0, prof.sideMid]));
  }
  // back ribs, as on the other profiles
  const zb = -fd / 2 - 0.0003;
  for (const o of [-fw * 0.28, 0, fw * 0.28]) {
    for (const s of [1, -1]) {
      dark(2 * hl, true, 0.0012, 0.0006, [0, s * (yt - o), zb]);
      dark(2 * vl, false, 0.0012, 0.0006, [s * (xr - o), 0, zb]);
    }
  }
}

function addDeluxeCorners(b: ModelBuilder, W: number, H: number, fw: number, fd: number) {
  const e = fw * DELUXE.overhang;
  const Ri = fw * DELUXE.innerRadius, Ro = fw * DELUXE.outerRadius;
  const bz = (fd / 2) * DELUXE.depth;
  // Top-right corner. Outer contour: board edges + e with a rounded corner (radius Ro). Inner
  // contour: the rails' inner edges − e with a rounded corner (radius Ri) — the writing surface's
  // corner. The bend is built from rays out of the inner rounding's centre, so the section is as
  // wide as the rail at both ends and widens towards 45°, as on the real part.
  const xo = W / 2 + e, yo = H / 2 + e;
  const xi = W / 2 - fw - e, yi = H / 2 - fw - e;
  const ox = xi - Ri, oy = yi - Ri;
  const cox = xo - Ro, coy = yo - Ro;
  const outer = (t: number) => {
    const c = Math.cos(t), s = Math.sin(t);
    const px = ox - cox, py = oy - coy;
    const B = px * c + py * s, C = px * px + py * py - Ro * Ro;
    const k = -B + Math.sqrt(Math.max(0, B * B - C));
    if (ox + k * c >= cox - 1e-9 && oy + k * s >= coy - 1e-9) return k;
    return Math.min(c > 1e-9 ? (xo - ox) / c : Infinity, s > 1e-9 ? (yo - oy) / s : Infinity);
  };
  type Frame = { p: [number, number]; n: [number, number]; a: number };
  const path: Frame[] = [];
  const seam = W / 2 - deluxeSeam(fw), seamY = H / 2 - deluxeSeam(fw);
  const half = fw / 2 + e, SL = 4, N = 40;
  // sleeve over the vertical rail (seam → bend), the bend, sleeve over the top rail (bend → seam)
  for (let k = 0; k < SL; k++) path.push({ p: [W / 2 - fw / 2, seamY + ((oy - seamY) * k) / SL], n: [1, 0], a: half });
  for (let k = 0; k <= N; k++) {
    const t = (k / N) * (Math.PI / 2);
    const c = Math.cos(t), s = Math.sin(t), ko = outer(t), mid = (Ri + ko) / 2;
    path.push({ p: [ox + mid * c, oy + mid * s], n: [c, s], a: (ko - Ri) / 2 });
  }
  for (let k = SL - 1; k >= 0; k--) path.push({ p: [seam + ((ox - seam) * k) / SL, H / 2 - fw / 2], n: [0, 1], a: half });

  // Section scale along the corner, by distance from the nearer seam: full-size end collars,
  // a step down (with two fine ridges) into the slimmer bend. Only the outer side and the front
  // scale, so the inner edge keeps covering the rail / writing-surface joint.
  const dist = [0];
  for (let k = 1; k < path.length; k++) dist.push(dist[k - 1] + Math.hypot(path[k].p[0] - path[k - 1].p[0], path[k].p[1] - path[k - 1].p[1]));
  const total = dist[dist.length - 1];
  const smooth = (x: number) => (x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x));
  const scaleAt = (d: number) => {
    const u = d / fw;
    const { scale, from, to } = DELUXE.waist;
    let s = 1 + (scale - 1) * smooth((u - from) / (to - from));
    for (const { at, w, h } of DELUXE.ridges) if (Math.abs(u - at) < w) s += h * 0.5 * (1 + Math.cos((Math.PI * (u - at)) / w));
    return s;
  };
  const [kOF, kIF, kIB, kOB] = DELUXE.radii;
  const elbow = sweepVar(
    path.map((f, k) => {
      const s = scaleAt(Math.min(dist[k], total - dist[k]));
      const bf = bz * s;
      return { p: f.p, n: f.n, section: roundedSection(f.a, f.a * s, bf, bz, [kOF * bf, kIF * bf, kIB * bz, kOB * bz]) };
    }),
  );

  // Pan-head screws on the outer sides of both rails, just past the seam.
  const { head, cross } = panHeadScrew(DELUXE.screw.r, DELUXE.screw.h);
  const along = deluxeSeam(fw) + fw * DELUXE.screw.past;
  const zs = deluxeRailProfile(fw, fd).sideMid;
  const screws: Array<{ pos: Vec3; rot: Vec3 }> = [
    { pos: [W / 2 - along, H / 2 - 0.0002, zs], rot: [0, 0, 0] },
    { pos: [W / 2 - 0.0002, H / 2 - along, zs], rot: [0, 0, -Math.PI / 2] },
  ];

  for (const sx of [1, -1]) {
    for (const sy of [1, -1]) {
      b.add("deluxe-corner", mirrorXY(elbow, sx, sy));
      for (const { pos, rot } of screws) {
        b.add("screw-zinc", mirrorXY(place(head, pos, rot), sx, sy));
        b.add("screw-recess", mirrorXY(place(cross, pos, rot), sx, sy));
      }
    }
  }
}

/* ------------------------------------------------------------------ */
/* Metallic Premium frame ("signature")                                 */
/* ------------------------------------------------------------------ */
/**
 * Metallic Premium frame, modelled on close-up photos of the real board (corners, rails, edges):
 *  - rail: a tubular two-lobe extrusion — a narrow inner band (a touch lower) and a wider, fully
 *    rounded outer band split by a groove — with a channel along its outer side;
 *  - corner: the red moulded cap over the outer band, butted against the rail ends and standing a
 *    little proud of them, its pillow-shaped section swept round a quarter circle, PLUSMARK
 *    embossed along it. Inside it the black connector: a lower band whose inner edge rounds off
 *    the writing surface's corner, with a raised flange at each seam and a small rounded tab
 *    where the cap is notched on the groove line;
 *  - the connector's arms show in the side channel just past each cap, held by Phillips screws.
 */
const SIG = {
  /** Cap/rail seam, from the board's outer edge (× fw). */
  seam: 1.58,
  /** Straight run of the cap from each seam before the bend (× fw). */
  run: 0.12,
  /** The cap stands proud of the rail's outer edge (× fw), and of its front / back (m). */
  overhang: 0.035,
  proud: 0.0016,
  back: 0.0008,
  /** Rail groove (inner band | outer band) and the cap's red/black split, from the outer edge (× fw). */
  groove: 0.57,
  split: 0.55,
  /** Black band front vs. the rail crown (m): round the bend / at the thin seam flanges. */
  blackFront: -0.0004,
  flangeFront: 0.0001,
  /** Flange length from each seam, then the blend down to the band (× fw). */
  flange: 0.04,
  flangeBlend: 0.05,
  /** Rounded tab filling the cap's notch at each seam: depth into the red, length along the cap (× fw). */
  tab: { w: 0.13, l: 0.21 },
  /** Red cap section rounding (m): outer-front (the pillow), inner-front, inner-back, outer-back. */
  capRadii: [0.0085, 0.0028, 0.001, 0.003] as [number, number, number, number],
  /** Black band: a gentle crown rounding down to the writing surface (elliptical, across × depth, m). */
  blackRadius: [0.007, 0.0022] as [number, number],
  /** Side channel: centre (× fd from the middle, + = front), width (× fd), depth (m). */
  slot: { at: -0.04, w: 0.38, depth: 0.003 },
  /** Connector arm showing in the side channel past each cap (× fw); its screw (× fw past the seam; m). */
  arm: 1.25,
  screw: { at: 0.45, r: 0.0042, h: 0.0022 },
  /** Embossed PLUSMARK: line across the cap (fraction from its inner edge), cap height, spacing, relief (m). */
  text: { at: 0.42, size: 0.0034, spacing: 0.0015, relief: 0.00018 },
};

/** Signature corner layout for frame width fw: radii about the bend centre and lengths (m). */
function sigLayout(fw: number) {
  const seam = SIG.seam * fw, run = SIG.run * fw;
  const arc = seam - run; // bend centre → the board's outer edges
  const Ro = arc + SIG.overhang * fw; // cap outer contour
  const Rs = arc - SIG.split * fw; // red/black split
  const Ri = arc - fw; // writing-surface corner (the rails' inner edge line)
  const Rt = Rs + SIG.text.at * (Ro - Rs); // embossed text line
  const quarter = (r: number) => (r * Math.PI) / 2;
  return { seam, run, arc, Ro, Rs, Ri, Rt, band: Ro - Rs, Ls: 2 * run + quarter(Rs), Lt: 2 * run + quarter(Rt) };
}

/**
 * Signature rail cross-section (u across the rail, + = outer edge; v = depth, + = front), CCW.
 * Also returns the front surface height front(u) and the surface a sticker rests on.
 */
function signatureRailProfile(fw: number, fd: number) {
  const a = fw / 2, b = fd / 2;
  const g = -a + (1 - SIG.groove) * fw; // groove centre: inner band | outer band
  const gw = 0.0007, gBottom = b - 0.0024; // groove half-width at the lips, groove bottom
  // Outer band: crown at the full depth, a lip 1.1 mm lower at the groove, rounded far down the side.
  const oLip = b - 0.0011, rv = 0.0065;
  const uo = g + gw + 0.42 * (a - g - gw);
  const ruA = a - uo, ruB = uo - g - gw, rvB = b - oLip;
  // Inner band: crown 0.5 mm lower, a lip 1.1 mm below it at the groove, rounded down at the inner edge.
  const iCrown = b - 0.0005, iLip = iCrown - 0.0011, rvD = 0.0026;
  const ui = -a + 0.55 * (g - gw + a);
  const ruC = g - gw - ui, rvC = iCrown - iLip, ruD = ui + a;
  const rb = 0.0015; // outer back edge
  const sv = SIG.slot.at * fd, sw = SIG.slot.w * fd, sd = SIG.slot.depth;
  const s0 = sv - sw / 2, s1 = sv + sw / 2;

  const pts: Array<{ u: number; v: number; nu: number; nv: number }> = [];
  const P = (u: number, v: number, nu: number, nv: number) => {
    const l = Math.hypot(nu, nv) || 1;
    pts.push({ u, v, nu: nu / l, nv: nv / l });
  };
  /** Elliptical arc, centre (cu, cv), radii (ru, rr), angles t0 → t1. */
  const arc = (cu: number, cv: number, ru: number, rr: number, t0: number, t1: number, n: number) => {
    for (let k = 0; k <= n; k++) {
      const t = t0 + ((t1 - t0) * k) / n;
      P(cu + ru * Math.cos(t), cv + rr * Math.sin(t), Math.cos(t) / ru, Math.sin(t) / rr);
    }
  };
  P(-a, -b, 0, -1); // back
  arc(a - rb, -b + rb, rb, rb, -Math.PI / 2, 0, 4);
  // outer side with the channel (hard edges)
  P(a, s0, 1, 0);
  P(a, s0, 0, 1);
  P(a - sd, s0, 0, 1);
  P(a - sd, s0, 1, 0);
  P(a - sd, s1, 1, 0);
  P(a - sd, s1, 0, -1);
  P(a, s1, 0, -1);
  P(a, s1, 1, 0);
  // outer band: side → crown → groove lip
  arc(uo, b - rv, ruA, rv, 0, Math.PI / 2, 14);
  arc(uo, oLip, ruB, rvB, Math.PI / 2, Math.PI, 8);
  // V groove (hard edges)
  P(g + gw, oLip, gBottom - oLip, gw);
  P(g, gBottom, gBottom - oLip, gw);
  P(g, gBottom, iLip - gBottom, gw);
  P(g - gw, iLip, iLip - gBottom, gw);
  // inner band: groove lip → crown → inner edge, then the inner side
  arc(ui, iLip, ruC, rvC, 0, Math.PI / 2, 8);
  arc(ui, iCrown - rvD, ruD, rvD, Math.PI / 2, Math.PI, 10);
  P(-a, -b, -1, 0);

  const ell = (u: number, cu: number, ru: number, cv: number, rr: number) =>
    cv + rr * Math.sqrt(Math.max(0, 1 - ((u - cu) / ru) ** 2));
  /** Front surface height at u (groove bridged lip to lip). */
  const front = (u: number) =>
    u >= uo ? ell(u, uo, ruA, b - rv, rv)
    : u >= g + gw ? ell(u, uo, ruB, oLip, rvB)
    : u > g - gw ? iLip + ((oLip - iLip) * (u - (g - gw))) / (2 * gw)
    : u >= ui ? ell(u, ui, ruC, iLip, rvC)
    : ell(u, ui, ruD, iCrown - rvD, rvD);
  /** A sticker stretched across the rail rests on both crowns and bridges the groove between them. */
  const sticker = (u: number) =>
    u > ui && u < uo ? Math.max(front(u), iCrown + ((b - iCrown) * (u - ui)) / (uo - ui)) : front(u);
  return { pts, front, sticker, groove: g, gBottom, slot: { s0, s1, depth: sd } };
}

/** Signature rails, stopping `clear` short of each outer corner (inside the caps), with groove and channel shading. */
function addSignatureFrame(b: ModelBuilder, W: number, H: number, fw: number, fd: number, clear: number) {
  const prof = signatureRailProfile(fw, fd);
  const hl = W / 2 - clear, vl = H / 2 - clear;
  const xr = W / 2 - fw / 2, yt = H / 2 - fw / 2;
  // frames advance along Z × n (see sweep)
  const rails: Array<{ f: Array<{ p: [number, number]; n: [number, number] }>; h: boolean }> = [
    { f: [{ p: [hl, yt], n: [0, 1] }, { p: [-hl, yt], n: [0, 1] }], h: true },
    { f: [{ p: [-hl, -yt], n: [0, -1] }, { p: [hl, -yt], n: [0, -1] }], h: true },
    { f: [{ p: [xr, -vl], n: [1, 0] }, { p: [xr, vl], n: [1, 0] }], h: false },
    { f: [{ p: [-xr, vl], n: [-1, 0] }, { p: [-xr, -vl], n: [-1, 0] }], h: false },
  ];
  for (const r of rails) b.add("aluminium", brushUV(sweep(prof.pts, r.f), r.h));

  // Shading strips between the caps; u = offset from the rail's centre line (+ = outer edge).
  const seam = SIG.seam * fw;
  const strip = (mat: string, across: number, depth: number, u: number, z: number) => {
    for (const s of [1, -1]) {
      b.add(mat, place(box(W - 2 * seam, across, depth), [0, s * (yt + u), z]));
      b.add(mat, place(box(across, H - 2 * seam, depth), [s * (xr + u), 0, z]));
    }
  };
  // dark line at the bottom of the front groove (the groove alone is sub-pixel at viewing distance)
  strip("aluminium-dark", 0.0006, 0.0005, prof.groove, prof.gBottom + 0.00045);
  // the side channel's floor, in shadow
  const { s0, s1, depth } = prof.slot;
  strip("rail-channel", 0.0008, s1 - s0 - 0.0002, fw / 2 - depth + 0.0004, (s0 + s1) / 2);
  // back ribs, as on the other profiles
  for (const o of [-fw * 0.28, 0, fw * 0.28]) strip("aluminium-dark", 0.0012, 0.0006, o, -fd / 2 - 0.0003);
}

type CornerRadius = number | [number, number];

/**
 * Like roundedSection(), but each corner (outer-front, inner-front, inner-back, outer-back) can
 * be elliptical ([across, depth]) and is only limited by the room it actually needs.
 */
function capSection(aIn: number, aOut: number, bFront: number, bBack: number, radii: [CornerRadius, CornerRadius, CornerRadius, CornerRadius], seg = 8) {
  const w = aIn + aOut, h = bFront + bBack, e = 1e-5;
  const fit = (r: number, room: number) => Math.max(e, Math.min(r, room - e));
  const [OF, IF, IB, OB] = radii.map((r) => (typeof r === "number" ? [r, r] : r));
  const of: [number, number] = [fit(OF[0], w), fit(OF[1], h)];
  const iF: [number, number] = [fit(IF[0], w - of[0]), fit(IF[1], h)];
  const ob: [number, number] = [fit(OB[0], w), fit(OB[1], h - of[1])];
  const ib: [number, number] = [fit(IB[0], w - ob[0]), fit(IB[1], h - iF[1])];
  const pts: Array<{ u: number; v: number; nu: number; nv: number }> = [];
  const corners: Array<[number, number, [number, number], number]> = [
    [aOut - of[0], bFront - of[1], of, 0],
    [-aIn + iF[0], bFront - iF[1], iF, Math.PI / 2],
    [-aIn + ib[0], -bBack + ib[1], ib, Math.PI],
    [aOut - ob[0], -bBack + ob[1], ob, (3 * Math.PI) / 2],
  ];
  for (const [cu, cv, [ru, rv], a0] of corners) {
    for (let s = 0; s <= seg; s++) {
      const t = a0 + (s / seg) * (Math.PI / 2);
      const nu = Math.cos(t) / ru, nv = Math.sin(t) / rv, l = Math.hypot(nu, nv);
      pts.push({ u: cu + Math.cos(t) * ru, v: cv + Math.sin(t) * rv, nu: nu / l, nv: nv / l });
    }
  }
  return pts;
}

function addSignatureCorners(b: ModelBuilder, W: number, H: number, fw: number, fd: number) {
  const L = sigLayout(fw);
  const { run, Ls, Lt, Rs, Ro, Ri, Rt } = L;
  const bz = fd / 2;
  const cx = W / 2 - L.arc, cy = H / 2 - L.arc; // bend centre, top-right corner (mirrored below)

  // Stations: distance d from the first seam along the split line — fine near the seams (flange,
  // notch), coarse round the bend. Both parts use the same stations so the notch and tab match.
  const near = Math.max(SIG.tab.l, SIG.flange + SIG.flangeBlend) * fw;
  const fine = 0.0005, steps = 28;
  const raw = [0, run, Ls - run, Ls];
  for (let d = fine; d < near; d += fine) raw.push(d, Ls - d);
  for (let k = 1; k < steps; k++) raw.push(run + ((Ls - 2 * run) * k) / steps);
  const stations = raw
    .filter((d) => d >= 0 && d <= Ls)
    .sort((p, q) => p - q)
    .filter((d, k, all) => k === 0 || d - all[k - 1] > 1e-6);
  const frameAt = (d: number, r: number): { p: [number, number]; n: [number, number] } => {
    if (d <= run) return { p: [cx + r, cy - run + d], n: [1, 0] }; // up the right rail
    if (d >= Ls - run) return { p: [cx - (d - (Ls - run)), cy + r], n: [0, 1] }; // along the top rail
    const t = (d - run) / Rs;
    return { p: [cx + r * Math.cos(t), cy + r * Math.sin(t)], n: [Math.cos(t), Math.sin(t)] };
  };
  /** The same station measured along the text line (emboss UVs). */
  const alongText = (d: number) => (d <= run ? d : d >= Ls - run ? Lt - (Ls - d) : run + ((d - run) / Rs) * Rt);

  // Notch in the red cap (= the black tab) and the black flange, by distance e from the nearer seam.
  const tw = SIG.tab.w * fw, tl = SIG.tab.l * fw;
  const notch = (e: number) => {
    if (e <= tl / 2) return tw;
    const x = (e - tl / 2) / (tl / 2);
    return x >= 1 ? 0 : tw * Math.sqrt(1 - x * x);
  };
  const smooth = (x: number) => (x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x));
  const blackTop = (e: number) =>
    bz + SIG.blackFront + (SIG.flangeFront - SIG.blackFront) * (1 - smooth((e - SIG.flange * fw) / (SIG.flangeBlend * fw)));

  // Red cap over the outer band: pillow section, notched at the seams.
  const aR = (Ro - Rs) / 2, rR = (Ro + Rs) / 2;
  const seg = 8, frontPts = 2 * (seg + 1); // section points 0…frontPts-1: outer-front + inner-front corners
  const redFrames = stations.map((d) => ({
    ...frameAt(d, rR),
    section: capSection(aR - notch(Math.min(d, Ls - d)), aR, bz + SIG.proud, bz + SIG.back, SIG.capRadii, seg),
  }));
  const red = sweepVar(redFrames, {
    // Front: u along the text line, v across the cap (0 = inner edge). Sides, back and end faces
    // sample the flat border of the emboss map.
    at: (k, j) => (j < frontPts ? [alongText(stations[k]) / Lt, (redFrames[k].section[j].u + aR) / (2 * aR)] : [-1, 0]),
    cap: [-1, 0],
  });

  // Black connector: from the writing-surface corner to just under the red, with the tab and flanges.
  const aB = (Rs - Ri) / 2, rB = (Rs + Ri) / 2;
  const black = sweepVar(
    stations.map((d) => {
      const e = Math.min(d, Ls - d);
      return {
        ...frameAt(d, rB),
        section: capSection(aB + 0.0003, aB + 0.0015 + notch(e), blackTop(e), bz - 0.0006, [0.0005, SIG.blackRadius, 0.0003, 0.0003], 6),
      };
    }),
  );

  // Connector arms in the side channels just past the cap, each with a Phillips pan-head screw.
  const { s0, s1, depth } = signatureRailProfile(fw, fd).slot;
  const zc = (s0 + s1) / 2, sw = s1 - s0 - 0.0001;
  const face = 0.0018; // arm face, below the rail's outer side
  const t = depth - face, len = SIG.arm * fw + 0.002; // runs 2 mm into the cap
  const mid = L.seam - 0.002 + len / 2; // arm centre, from the outer edge
  const arms = [
    place(box(t, len, sw), [W / 2 - depth + t / 2, H / 2 - mid, zc]), // right rail
    place(box(len, t, sw), [W / 2 - mid, H / 2 - depth + t / 2, zc]), // top rail
  ];
  const { head, cross } = panHeadScrew(SIG.screw.r, SIG.screw.h);
  const at = L.seam + SIG.screw.at * fw;
  const screws: Array<{ pos: Vec3; rot: Vec3 }> = [
    { pos: [W / 2 - face, H / 2 - at, zc], rot: [0, 0, -Math.PI / 2] },
    { pos: [W / 2 - at, H / 2 - face, zc], rot: [0, 0, 0] },
  ];

  // One moulding rotated onto every corner: on the mirrored copies the emboss UVs run backwards
  // so PLUSMARK still reads the right way round.
  const redFlipped: Geo = { ...red, uv: red.uv.map((x, k) => (k % 2 === 0 && x >= 0 ? 1 - x : x)) };
  for (const sx of [1, -1]) {
    for (const sy of [1, -1]) {
      b.add("cap-red", mirrorXY(sx * sy < 0 ? redFlipped : red, sx, sy));
      b.add("cap-black", mirrorXY(black, sx, sy));
      for (const arm of arms) b.add("connector-black", mirrorXY(arm, sx, sy));
      for (const { pos, rot } of screws) {
        b.add("screw-zinc", mirrorXY(place(head, pos, rot), sx, sy));
        b.add("screw-recess", mirrorXY(place(cross, pos, rot), sx, sy));
      }
    }
  }
}

/**
 * Sticker strip for a bottom rail that follows `surface` (height over u, + u = the rail's outer
 * edge, i.e. downwards on the bottom rail), relative to the rail front `zf`.
 */
function railDecal(w: number, h: number, surface: (u: number) => number, zf: number, rows = 24): Geo {
  const g = empty();
  const eps = 0.0004;
  for (let j = 0; j <= rows; j++) {
    const s = -h / 2 + (j / rows) * h;
    const u = -s;
    const slope = (surface(u + 1e-5) - surface(u - 1e-5)) / 2e-5;
    const l = Math.hypot(slope, 1);
    const ny = slope / l, nz = 1 / l;
    const z = surface(u) - zf;
    for (const x of [-w / 2, w / 2]) {
      g.p.push(x, s + ny * eps, z + nz * eps);
      g.n.push(0, ny, nz);
      g.uv.push(x < 0 ? 0 : 1, 1 - j / rows);
    }
  }
  for (let j = 0; j < rows; j++) {
    const a = j * 2, b = a + 1, c = a + 3, d = a + 2;
    g.i.push(a, b, c, a, c, d);
  }
  return g;
}

/**
 * Normal map for the PLUSMARK name embossed along the red signature cap, laid out in the cap's
 * UVs (addSignatureCorners): u along the text line, v across the cap from its inner edge. All
 * signature boards use the heavy frame, so the map is drawn to that cap's size.
 */
async function embossMap(fw: number): Promise<Tex> {
  const L = sigLayout(fw);
  const W = 1024, H = 256;
  const mmU = (L.Lt * 1000) / W, mmV = (L.band * 1000) / H; // mm per pixel
  const size = SIG.text.size * 1000;
  // Lettering in mm, turned 180° so it reads clockwise round the corner with the letter tops
  // towards the cap's outer edge — as moulded on the real cap.
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <rect width="100%" height="100%" fill="#000"/>
  <g transform="translate(${W / 2} ${SIG.text.at * H}) rotate(180) scale(${1 / mmU} ${1 / mmV})">
    <text x="0" y="${size / 2}" text-anchor="middle" font-family="${FONT}" font-size="${size / 0.72}" font-weight="700" letter-spacing="${SIG.text.spacing * 1000}" fill="#fff">PLUSMARK</text>
  </g>
</svg>`;
  const { data, info } = await sharp(Buffer.from(svg))
    .flatten({ background: "#000000" })
    .greyscale()
    .blur(1.1)
    .raw()
    .toBuffer({ resolveWithObject: true });
  const relief = SIG.text.relief * 1000; // mm
  const hAt = (x: number, y: number) =>
    (data[(Math.min(H - 1, Math.max(0, y)) * W + Math.min(W - 1, Math.max(0, x))) * info.channels] / 255) * relief;
  const px = Buffer.alloc(W * H * 3);
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      // tangent space, glTF convention: +X along +u, +Y towards the top of the image (−v)
      const nx = -(hAt(x + 1, y) - hAt(x - 1, y)) / (2 * mmU);
      const ny = (hAt(x, y + 1) - hAt(x, y - 1)) / (2 * mmV);
      const l = Math.hypot(nx, ny, 1);
      const k = (y * W + x) * 3;
      px[k] = Math.round((nx / l / 2 + 0.5) * 255);
      px[k + 1] = Math.round((ny / l / 2 + 0.5) * 255);
      px[k + 2] = Math.round((1 / l / 2 + 0.5) * 255);
    }
  }
  return { data: await sharp(px, { raw: { width: W, height: H, channels: 3 } }).png({ compressionLevel: 9 }).toBuffer(), mime: "image/png" };
}

/** How far rails must stop short of the outer corner so they stay hidden inside the cap. */
function railClearance(corner: Corner, fw: number) {
  // Signature: rails butt against the caps, reaching half the cap's straight run inside them.
  if (corner === "signature") return (SIG.seam - SIG.run / 2) * fw;
  if (corner === "chrome") return deluxeClear(fw);
  const { size, radius, round } = CAP[corner];
  const r = fw * size * radius, inset = CAP_INSET;
  // The top rail's outer corner sits `inset` inside the cap's outer edge; shorten the rail by c so
  // that corner stays within the cap's rounded (circle radius r) or chamfered (length r) outline.
  const e = r - inset;
  const c = round ? e - Math.sqrt(Math.max(0, r * r - e * e)) : r - 2 * inset;
  return Math.max(0, c + 0.0015);
}

/** Surface slab; textured surfaces get UVs that tile at the material's real-world size. */
function surfaceSlab(mat: string, w: number, h: number, t: number): Geo {
  const tile = MATERIALS[mat].tile;
  return tile ? tileUV(box(w, h, t), w / tile, h / tile) : box(w, h, t);
}

/** `clear`: shorten the horizontal rails at both ends so they stay hidden inside corner caps. */
/**
 * `clear`: shorten the horizontal rails at both ends so they stay hidden inside corner caps.
 * `vclear`: same for the vertical rails, for caps that need both shortened.
 */
function addFrame(b: ModelBuilder, W: number, H: number, fw: number, fd: number, corner: Corner, mat = "aluminium", z = 0, x = 0, clear = 0, vclear = 0) {
  const { radius, grooves } = PROFILE[corner];
  const vlen = H - 2 * Math.max(fw, vclear);
  b.add(mat, brushUV(place(hRail(W - 2 * clear, fw, fd, radius), [x, H / 2 - fw / 2, z]), true));
  b.add(mat, brushUV(place(hRail(W - 2 * clear, fw, fd, radius), [x, -H / 2 + fw / 2, z]), true));
  b.add(mat, brushUV(place(vRail(vlen, fw, fd, radius), [x + W / 2 - fw / 2, 0, z]), false));
  b.add(mat, brushUV(place(vRail(vlen, fw, fd, radius), [x - W / 2 + fw / 2, 0, z]), false));

  // Front grooves (dark anodised lines) and back ribs, as seen on the real rails.
  const line = 0.0012;
  const lines = (face: 1 | -1, count: number, fromInner: number) => {
    const zf = z + face * (fd / 2 + 0.0003);
    for (let k = 0; k < count; k++) {
      // offset from the rail centre-line towards the inner edge
      const o = count === 1 ? fromInner : -fw * 0.28 + (k * fw * 0.56) / (count - 1);
      // lines stop where the rails stop, so they never poke out of the corner caps
      const hl = W - 2 * Math.max(fw, clear), vl = vlen;
      b.add("aluminium-dark", place(box(hl, line, 0.0006), [x, H / 2 - fw / 2 - o, zf]));
      b.add("aluminium-dark", place(box(hl, line, 0.0006), [x, -H / 2 + fw / 2 + o, zf]));
      b.add("aluminium-dark", place(box(line, vl, 0.0006), [x + W / 2 - fw / 2 - o, 0, zf]));
      b.add("aluminium-dark", place(box(line, vl, 0.0006), [x - W / 2 + fw / 2 + o, 0, zf]));
    }
  };
  lines(1, grooves, fw * 0.22);
  lines(-1, 3, 0);
}

function addSurface(b: ModelBuilder, surface: Surface, W: number, H: number, fw: number, fd: number) {
  const sw = W - 2 * fw + 0.004, sh = H - 2 * fw + 0.004;
  const z = fd / 2 - 0.0045;
  if (surface === "combination") {
    const half = sw / 2;
    b.add("marker-hpl", place(surfaceSlab("marker-hpl", half, sh, 0.006), [-half / 2, 0, z]));
    b.add("fabric-gray", place(surfaceSlab("fabric-gray", half, sh, 0.006), [half / 2, 0, z]));
    // centre divider sits on the front only, so it doesn't show through the back panel
    b.add("aluminium", place(box(fw * 0.55, sh, 0.008), [0, 0, fd / 2 - 0.003]));
  } else {
    b.add(surface, place(surfaceSlab(surface, sw, sh, 0.006), [0, 0, z]));
  }
  // core between surface and back panel
  b.add("backing", place(box(sw, sh, fd - 0.012), [0, 0, -0.0015]));
}

/** Real back: grey panel photo, L-shaped corner plates with screws, rail screws. */
function addBack(b: ModelBuilder, W: number, H: number, fw: number, fd: number, corner?: Corner) {
  const zb = -fd / 2;
  b.add("board-back", place(quad(W - 2 * fw + 0.004, H - 2 * fw + 0.004, -1), [0, 0, zb + 0.0019]));

  const L = 0.085, arm = Math.max(0.036, fw + 0.008), t = 0.0024;
  // Outer corner follows the front cap's outline so the plate never peeks out from the front.
  const cap = corner ? CAP[corner] : undefined;
  // Signature cap: round the plate a touch more than the cap's bend so it stays tucked behind it.
  const r =
    corner === "signature" ? Math.min(sigLayout(fw).arc + 0.0012, L * 0.95)
    : corner === "chrome" ? Math.min(fw * DELUXE.outerRadius * 1.25, L * 0.95)
    : cap ? Math.min(fw * cap.size * cap.radius - CAP_INSET, L * 0.7)
    : 0.006;
  const outline = cornerOutline(L, Math.max(r, 0.004), corner === "signature" || (cap?.round ?? false), 1, 1);
  const h = L / 2, cut = h - arm;
  const parts = [clipPoly(outline, 0, 1, cut), clipPoly(clipPoly(outline, 1, 0, cut), 0, -1, -cut)];
  const screw = (x: number, y: number, z: number) =>
    b.add("screw", place(cylinder(0.0036, 0.0016, 16), [x, y, z], [Math.PI / 2, 0, 0]));
  for (const sx of [1, -1]) {
    for (const sy of [1, -1]) {
      for (const part of parts) {
        const mirrored = part.map(([x, y]) => [x * sx, y * sy] as [number, number]);
        b.add("back-plate", place(extrude(mirrored, t), [sx * (W / 2 - h), sy * (H / 2 - h), zb - t / 2]));
      }
      screw(sx * (W / 2 - L + 0.016), sy * (H / 2 - fw / 2), zb - t - 0.0008);
      screw(sx * (W / 2 - fw / 2), sy * (H / 2 - L + 0.016), zb - t - 0.0008);
    }
  }
  const zs = zb - 0.0008;
  screw(0, H / 2 - fw * 0.62, zs);
  screw(0, -H / 2 + fw / 2, zs);
  screw(-W / 2 + fw / 2, -H * 0.02, zs);
  screw(W / 2 - fw / 2, H * 0.02, zs);
}

/**
 * Triangle wire hanger + sheet clip. `raised` hangers stand out past the frame (Eco series,
 * as in the front photos); otherwise they lie folded flat on the back rail (as in the back photo).
 */
function addHanger(b: ModelBuilder, base: [number, number], out: [number, number], fd: number, raised: boolean) {
  const dir: [number, number] = raised ? out : [-out[0], -out[1]];
  const perp: [number, number] = [-dir[1], dir[0]];
  const half = 0.017, reach = raised ? 0.032 : 0.036;
  const z = raised ? -fd / 2 + 0.004 : -fd / 2 - 0.003;
  const A: [number, number] = [base[0] + perp[0] * half, base[1] + perp[1] * half];
  const B: [number, number] = [base[0] - perp[0] * half, base[1] - perp[1] * half];
  const C: [number, number] = [base[0] + dir[0] * reach, base[1] + dir[1] * reach];
  b.add("wire", wire(A, B, z));
  b.add("wire", wire(B, C, z));
  b.add("wire", wire(C, A, z));
  // sheet clip on the back of the rail, just inside the outer edge
  const cw = 0.024, ch = 0.013;
  const clipPos: Vec3 = [base[0] - out[0] * (ch / 2 + 0.002), base[1] - out[1] * (ch / 2 + 0.002), -fd / 2 - 0.0013];
  b.add("screw", place(box(out[0] ? ch : cw, out[0] ? cw : ch, 0.0022), clipPos));
}

function addHangers(b: ModelBuilder, W: number, H: number, fd: number, raised: boolean) {
  // Positions from the real back photo (converted to front-view coordinates).
  addHanger(b, [0, H / 2], [0, 1], fd, raised);
  addHanger(b, [-0.37 * W, H / 2], [0, 1], fd, raised);
  addHanger(b, [-W / 2, -0.03 * H], [-1, 0], fd, raised);
  addHanger(b, [-W / 2, -0.38 * H], [-1, 0], fd, raised);
}

function addCorners(b: ModelBuilder, corner: Corner, W: number, H: number, fw: number, fd: number) {
  if (corner === "signature") return addSignatureCorners(b, W, H, fw, fd);
  if (corner === "chrome") return addDeluxeCorners(b, W, H, fw, fd);
  const back = -fd / 2 + 0.001; // caps stop at the back so the grey back plates show there
  for (const sx of [1, -1]) {
    for (const sy of [1, -1]) {
      const inset = CAP_INSET;
      const front = fd / 2 + (corner === "signature" ? 0.006 : 0.004);
      const at = (s: number, z: number): Vec3 => [sx * (W / 2 - s / 2 + inset), sy * (H / 2 - s / 2 + inset), z];
      /**
       * Cap: full outline on the front face; behind the writing surface only the L-shaped part
       * that wraps the rails remains, so from the back the grey back plate and panel show.
       */
      const addCap = (mat: string, s: number, r: number, round: boolean) => {
        const zs = fd / 2 - 0.004;
        const local = cornerOutline(s, r, round, 1, 1);
        const h = s / 2, cut = h - (fw + inset + 0.001);
        const mirror = (pts: Array<[number, number]>) => pts.map(([x, y]) => [x * sx, y * sy] as [number, number]);
        b.add(mat, place(extrude(mirror(local), front - zs), at(s, (front + zs) / 2)));
        const top = clipPoly(local, 0, 1, cut);
        const side = clipPoly(clipPoly(local, 1, 0, cut), 0, -1, -cut);
        for (const part of [top, side]) b.add(mat, place(extrude(mirror(part), zs - back), at(s, (zs + back) / 2)));
      };
      /**
       * Eco L-cap, traced from the Eco close-up photo: a silver-grey L that wraps the two rails
       * (inner quadrant open, so the writing surface shows through) with a rounded outer corner,
       * and a black insert on the front made of a chamfered square block at the corner plus two
       * narrower arms running along the inner half of each cap arm.
       */
      const addEcoCorner = (s: number, r: number) => {
        const zs = fd / 2 - 0.004;
        const h = s / 2;
        const aw = fw + inset + 0.001; // cap arm width
        const cut = h - aw;
        const local = cornerOutline(s, r, true, 1, 1);
        const mirror = (pts: Array<[number, number]>) => pts.map(([x, y]) => [x * sx, y * sy] as [number, number]);
        const top = clipPoly(local, 0, 1, cut);
        const side = clipPoly(clipPoly(local, 1, 0, cut), 0, -1, -cut);
        // Front L (no inner quadrant) and the part wrapping the rails behind the surface.
        for (const part of [top, side]) {
          b.add("abs-gray", place(extrude(mirror(part), front - zs), at(s, (front + zs) / 2)));
          b.add("abs-gray", place(extrude(mirror(part), zs - back), at(s, (zs + back) / 2)));
        }
        // Black insert, in fractions of s measured inward from the outer corner (u along x, v along y).
        const rim = 0.11, inner = aw / s - 0.03, band0 = 0.25, end = 0.97, chamfer = 0.4;
        const P = (u: number, v: number): [number, number] => [h - u * s, h - v * s];
        const pieces: Array<Array<[number, number]>> = [
          // corner block with a chamfer parallel to the cap's rounded corner
          [P(rim, chamfer - rim), P(chamfer - rim, rim), P(inner, rim), P(inner, inner), P(rim, inner)],
          // arm along the horizontal rail
          [P(inner, band0), P(end, band0), P(end, inner), P(inner, inner)],
          // arm along the vertical rail
          [P(band0, inner), P(inner, inner), P(inner, end), P(band0, end)],
        ];
        const t = 0.0006;
        for (const piece of pieces) b.add("abs-dark", place(extrude(mirror(piece), t), at(s, front + t / 2 - 0.0002)));
      };
      const { size, radius, round } = CAP[corner];
      const cs = fw * size;
      if (corner === "abs" || corner === "plastic") {
        addEcoCorner(cs, cs * radius);
      } else {
        addCap("chrome", cs, cs * radius, round);
      }
    }
  }
}

/** "plusmark RETAIL" sticker (bottom-left) and "PLUSMARK" badge (bottom-right) on the front rail. */
function addDecals(b: ModelBuilder, W: number, H: number, fw: number, fd: number, corner: Corner) {
  const y = -H / 2 + fw / 2;
  const z = fd / 2;
  if (corner === "chrome") {
    // Deluxe (studio photo): only the PLUSMARK badge, a thin pill-shaped plate across the rail.
    const bh = fw * 0.5, bw = bh * (480 / 96), t = 0.0006;
    const x = W / 2 - fw * 2.4 - bw / 2 - 0.012;
    b.add("aluminium", place(roundedRect(bw, bh, t, bh / 2, 8), [x, y, z + t / 2]));
    b.add("decal-badge", place(quad(bw, bh), [x, y, z + t + 0.0001]));
    return;
  }
  if (corner === "signature") {
    // Just past each cap, stretched over the two-lobe rail (resting on both crowns).
    const { sticker } = signatureRailProfile(fw, fd);
    const cs = SIG.seam * fw;
    const rh = fw * 0.84, rw = rh * (600 / 120);
    const bh = rh * 0.92, bw = bh * (480 / 96);
    b.add("decal-retail", place(railDecal(rw, rh, sticker, z), [-W / 2 + cs + rw / 2 + 0.012, y, z]));
    b.add("decal-badge", place(railDecal(bw, bh, sticker, z), [W / 2 - cs - bw / 2 - 0.012, y, z]));
    return;
  }
  // Corner zone to keep clear of (cap), then a small gap — as in the photos.
  const cs = fw * 2.4;
  // Stickers fill ~90% of the rail height and wrap the rounded rail edges (decalStrip), so the
  // plusmark name is large and legible without floating off tubular profiles.
  const fill = 0.9;
  const r = PROFILE[corner].radius;
  const flatHalf = fw / 2 - r;
  const rh = fw * fill, rw = rh * (600 / 120);
  const bh = fw * fill * 0.92, bw = bh * (480 / 96);
  b.add("decal-retail", place(decalStrip(rw, rh, flatHalf, r), [-W / 2 + cs + rw / 2 + 0.012, y, z]));
  b.add("decal-badge", place(decalStrip(bw, bh, flatHalf, r), [W / 2 - cs - bw / 2 - 0.012, y, z]));
}

function buildBoard(v: Extract<Visual, { kind: "board" }>): ModelBuilder {
  const b = new ModelBuilder();
  // 3 × 2 ft — the size shown in the catalogue photos. At this size the frame, corners and the
  // plusmark stickers take up a larger share of the view, as they do in the photos.
  const W = 0.915, H = 0.61;
  const { w: fw, d: fd } = FRAME[v.frame];
  addSurface(b, v.surface, W, H, fw, fd);
  addBack(b, W, H, fw, fd, v.corner);
  const clear = railClearance(v.corner, fw);
  if (v.corner === "chrome") addDeluxeFrame(b, W, H, fw, fd, clear);
  else if (v.corner === "signature") addSignatureFrame(b, W, H, fw, fd, clear);
  else addFrame(b, W, H, fw, fd, v.corner, "aluminium", 0, 0, clear);
  addCorners(b, v.corner, W, H, fw, fd);
  addHangers(b, W, H, fd, v.corner === "abs" || v.corner === "plastic");
  addDecals(b, W, H, fw, fd, v.corner);
  if (v.magnets) {
    const mats = ["magnet-blue", "magnet-green", "magnet-graphite"];
    const spots: Array<[number, number]> = [[-0.31 * W, 0.22 * H], [-0.18 * W, 0.26 * H], [0.28 * W, -0.22 * H]];
    spots.forEach(([x, y], k) => {
      b.add(mats[k], place(cylinder(0.018, 0.009, 24), [x, y, fd / 2 - 0.001 + 0.0045], [Math.PI / 2, 0, 0]));
    });
  }
  return b;
}

function buildDoorBoard(v: Extract<Visual, { kind: "door-board" }>): ModelBuilder {
  const b = new ModelBuilder();
  const W = v.doors === 2 ? 1.83 : 1.22;
  const H = 1.22;
  const D = v.frame === "triple" ? 0.045 : 0.03;
  if (v.frame === "triple") {
    addFrame(b, W, H, 0.034, D * 0.45, "abs", "aluminium", -D / 2 + (D * 0.45) / 2);
    addFrame(b, W - 0.012, H - 0.012, 0.03, D * 0.35, "abs", "aluminium-dark", -D / 2 + D * 0.45 + (D * 0.35) / 2);
    addFrame(b, W - 0.024, H - 0.024, 0.026, D * 0.2, "abs", "aluminium", D / 2 - (D * 0.2) / 2);
  } else {
    addFrame(b, W, H, 0.024, D, "abs");
  }
  const inner = v.frame === "triple" ? 0.034 : 0.024;
  b.add(v.surface, place(surfaceSlab(v.surface, W - 2 * inner + 0.004, H - 2 * inner + 0.004, 0.008), [0, 0, -D / 2 + 0.008]));
  addBack(b, W, H, inner, D);
  const doorW = (W - 2 * inner) / v.doors;
  const doorH = H - 2 * inner;
  const dz = D / 2 - 0.006;
  const df = 0.012;
  for (let k = 0; k < v.doors; k++) {
    const cx = -W / 2 + inner + doorW * (k + 0.5);
    b.add("acrylic", place(box(doorW - 2 * df, doorH - 2 * df, 0.004), [cx, 0, dz]));
    addFrame(b, doorW - 0.002, doorH, df, 0.008, "abs", "aluminium", dz, cx);
  }
  const lockX = v.doors === 2 ? 0.02 : W / 2 - inner - 0.035;
  b.add("chrome", place(cylinder(0.011, 0.012, 24), [lockX, 0, dz + 0.009], [Math.PI / 2, 0, 0]));
  b.add("lock-black", place(box(0.0025, 0.009, 0.002), [lockX, 0, dz + 0.0155]));
  return b;
}

function buildClipboard(): ModelBuilder {
  const b = new ModelBuilder();
  // Proportions, corner radius and clip placement read off the product photo
  // (public/images/products/laminate-mdf-base-clipboard/1.webp).
  const W = 0.23, H = 0.355, T = 0.006, R = 0.007;
  const lam = 0.0006;
  // Raw MDF core (visible on the rounded edge) with the walnut HPL laminate on both faces.
  b.add("mdf-edge", roundedRect(W, H, T - 2 * lam, R, 8));
  b.add("clip-wood", place(roundedRect(W, H, lam, R, 8), [0, 0, T / 2 - lam / 2]));
  b.add("clip-wood", place(roundedRect(W, H, lam, R, 8), [0, 0, -T / 2 + lam / 2]));

  // Chrome electroplated clip, just below the top edge, with the embossed PLUSMARK plate.
  const clipY = H / 2 - 0.017;
  const pw = 0.112, ph = 0.041;
  b.add("chrome", place(roundedRect(pw, ph, 0.0014, 0.005), [0, clipY, T / 2 + 0.0007]));
  b.add("chrome", place(roundedRect(pw - 0.004, ph - 0.004, 0.0034, 0.0045), [0, clipY - 0.001, T / 2 + 0.0031]));
  const face = T / 2 + 0.0048 + 0.0003;
  const dw = pw - 0.008;
  b.add("decal-clip", place(quad(dw, dw * (240 / 660)), [0, clipY - 0.001, face]));
  // rolled top edge + lever and its black grip
  b.add("chrome", place(cylinder(0.0032, pw - 0.012, 20), [0, clipY + ph / 2 - 0.001, T / 2 + 0.0042], [0, 0, Math.PI / 2]));
  b.add("chrome", place(cylinder(0.0014, 0.03, 10), [0, clipY + ph / 2 + 0.006, T / 2 + 0.006], [0.5, 0, 0]));
  b.add("lock-black", place(roundedRect(0.014, 0.007, 0.005, 0.002), [0, clipY + ph / 2 + 0.012, T / 2 + 0.009]));
  // dual-side cap rivets (back side; the front rivets are part of the plate artwork)
  for (const x of [-0.036, 0.036]) {
    b.add("chrome", place(cylinder(0.0048, 0.0014, 18), [x, clipY - 0.001, -T / 2 - 0.0007], [Math.PI / 2, 0, 0]));
  }
  return b;
}

function buildBench(): ModelBuilder {
  // PDS-SB 807, from the catalogue photo: a separate seat bench in front of a desk with a book
  // shelf, black square-tube frames joined by floor runners. Dimensions are estimates.
  const b = new ModelBuilder();
  const L = 1.2, s = 0.025;
  const xL = L / 2 - 0.04;
  const plank = (w: number, d: number, t: number, y: number, z: number) =>
    b.add("bench-laminate", place(tileUV(roundedRect(w, d, t, 0.006, 4), w / 0.5, d / 0.5), [0, y, z], [-Math.PI / 2, 0, 0]));

  const foot = 0.012;
  const desk = { zf: 0.02, zb: -0.32, top: 0.76, shelf: 0.6 };
  const seat = { zf: 0.56, zb: 0.34, top: 0.44 };

  plank(L, 0.4, 0.022, desk.top, (desk.zf + desk.zb) / 2);
  plank(L - 0.06, 0.28, 0.016, desk.shelf, desk.zb + 0.15);
  plank(L, 0.3, 0.022, seat.top, (seat.zf + seat.zb) / 2);

  for (const x of [-xL, xL]) {
    const yTop = desk.top - 0.011 - s / 2;
    // desk side frame
    b.add("steel-powder", sqTube([x, foot, desk.zf], [x, yTop + s / 2, desk.zf], s));
    b.add("steel-powder", sqTube([x, foot, desk.zb], [x, yTop + s / 2, desk.zb], s));
    b.add("steel-powder", sqTube([x, yTop, desk.zb], [x, yTop, desk.zf], s));
    b.add("steel-powder", sqTube([x, desk.shelf - 0.008 - s / 2, desk.zb], [x, desk.shelf - 0.008 - s / 2, desk.zf], s));
    // seat side frame
    const ySeat = seat.top - 0.011 - s / 2;
    b.add("steel-powder", sqTube([x, foot, seat.zf], [x, ySeat + s / 2, seat.zf], s));
    b.add("steel-powder", sqTube([x, foot, seat.zb], [x, ySeat + s / 2, seat.zb], s));
    b.add("steel-powder", sqTube([x, ySeat, seat.zb], [x, ySeat, seat.zf], s));
    // floor runner joining desk and seat
    b.add("steel-powder", sqTube([x, foot + s / 2, desk.zb], [x, foot + s / 2, seat.zf], s));
    // rubber feet
    for (const z of [desk.zb, seat.zf]) b.add("foot-rubber", place(box(s * 1.3, foot, s * 1.3), [x, foot / 2, z]));
  }
  // long floor rail along the back of the desk
  b.add("steel-powder", sqTube([-xL, foot + s / 2, desk.zb], [xL, foot + s / 2, desk.zb], s));
  return b;
}

/* ------------------------------------------------------------------ */
/* GLB writer                                                           */
/* ------------------------------------------------------------------ */
async function writeGLB(slug: string, builder: ModelBuilder, io: NodeIO, outDir: string) {
  const doc = new Document();
  doc.createBuffer();
  const buffer = doc.getRoot().listBuffers()[0];
  const clearcoatExt = doc.createExtension(KHRMaterialsClearcoat);
  const sheenExt = doc.createExtension(KHRMaterialsSheen);
  const scene = doc.createScene(slug);
  const root = doc.createNode(slug);
  scene.addChild(root);

  const texCache = new Map<string, Texture>();
  const getTex = (key: string) => {
    if (!texCache.has(key)) {
      const t = TEXTURES.get(key);
      if (!t) throw new Error(`Texture ${key} not loaded`);
      texCache.set(key, doc.createTexture(key).setImage(t.data).setMimeType(t.mime));
    }
    return texCache.get(key)!;
  };

  const matCache = new Map<string, Material>();
  const getMat = (key: string) => {
    if (matCache.has(key)) return matCache.get(key)!;
    const def = MATERIALS[key];
    let [r, g, bl] = hexLinear(def.color);
    const tex = def.map ? TEXTURES.get(def.map) : undefined;
    if (tex?.mean) {
      // grain maps are neutral grey: compensate so the average texel shows the photo colour
      const k = 1 / srgbToLinear(tex.mean);
      [r, g, bl] = [r, g, bl].map((c) => Math.min(1, c * k)) as [number, number, number];
    }
    const m = doc
      .createMaterial(key)
      .setBaseColorFactor([r, g, bl, def.alpha ?? 1])
      .setMetallicFactor(def.metal ?? 0)
      .setRoughnessFactor(def.rough ?? 0.5)
      .setDoubleSided(!!def.doubleSided);
    if (def.alpha !== undefined) m.setAlphaMode("BLEND");
    if (def.map) {
      m.setBaseColorTexture(getTex(def.map));
      const mode = tex?.mean ? TextureInfo.WrapMode.MIRRORED_REPEAT : TextureInfo.WrapMode.CLAMP_TO_EDGE;
      m.getBaseColorTextureInfo()!.setWrapS(mode).setWrapT(mode);
    }
    if (def.mr) {
      m.setMetallicRoughnessTexture(getTex(def.mr));
      m.getMetallicRoughnessTextureInfo()!
        .setWrapS(TextureInfo.WrapMode.REPEAT)
        .setWrapT(TextureInfo.WrapMode.REPEAT);
    }
    if (def.normal) {
      m.setNormalTexture(getTex(def.normal)).setNormalScale(def.normalScale ?? 1);
      m.getNormalTextureInfo()!
        .setWrapS(TextureInfo.WrapMode.CLAMP_TO_EDGE)
        .setWrapT(TextureInfo.WrapMode.CLAMP_TO_EDGE);
    }
    if (def.clearcoat) {
      m.setExtension(
        "KHR_materials_clearcoat",
        clearcoatExt.createClearcoat().setClearcoatFactor(def.clearcoat[0]).setClearcoatRoughnessFactor(def.clearcoat[1]),
      );
    }
    if (def.sheen) {
      m.setExtension(
        "KHR_materials_sheen",
        sheenExt.createSheen().setSheenColorFactor(hexLinear(def.sheen[0])).setSheenRoughnessFactor(def.sheen[1]),
      );
    }
    matCache.set(key, m);
    return m;
  };

  for (const [key, g] of builder.groups) {
    const prim = doc
      .createPrimitive()
      .setAttribute("POSITION", doc.createAccessor().setType("VEC3").setArray(new Float32Array(g.p)).setBuffer(buffer))
      .setAttribute("NORMAL", doc.createAccessor().setType("VEC3").setArray(new Float32Array(g.n)).setBuffer(buffer))
      .setAttribute("TEXCOORD_0", doc.createAccessor().setType("VEC2").setArray(new Float32Array(g.uv)).setBuffer(buffer))
      .setIndices(doc.createAccessor().setType("SCALAR").setArray(new Uint32Array(g.i)).setBuffer(buffer))
      .setMaterial(getMat(key));
    const mesh = doc.createMesh(key).addPrimitive(prim);
    root.addChild(doc.createNode(key).setMesh(mesh));
  }

  await doc.transform(dedup(), prune(), draco({ method: "edgebreaker" }));
  const file = path.join(outDir, `${slug}.glb`);
  await io.write(file, doc);
  return file;
}

async function main() {
  const outDir = path.resolve("public/models");
  await mkdir(outDir, { recursive: true });
  await loadTextures();
  const io = new NodeIO().registerExtensions(KHRONOS_EXTENSIONS).registerDependencies({
    "draco3d.encoder": await draco3d.createEncoderModule(),
    "draco3d.decoder": await draco3d.createDecoderModule(),
  });
  const only = process.argv.slice(2);
  for (const [slug, v] of Object.entries(visuals)) {
    if (only.length && !only.includes(slug)) continue;
    const builder =
      v.kind === "board" ? buildBoard(v)
      : v.kind === "door-board" ? buildDoorBoard(v)
      : v.kind === "clipboard" ? buildClipboard()
      : buildBench();
    const file = await writeGLB(slug, builder, io, outDir);
    const { size } = await stat(file);
    console.log(`✓ ${slug}.glb  ${(size / 1024).toFixed(1)} KB`);
  }
  await writeModelVersions(outDir);
}

/**
 * /models/* is served with an immutable, 1-year Cache-Control header (next.config.ts), so model
 * URLs carry a content hash (?v=) — otherwise browsers keep showing an old model after regenerating.
 */
async function writeModelVersions(outDir: string) {
  const entries: string[] = [];
  for (const slug of Object.keys(visuals).sort()) {
    const buf = await readFile(path.join(outDir, `${slug}.glb`)).catch(() => undefined);
    if (buf) entries.push(`  "${slug}": "${createHash("sha1").update(buf).digest("hex").slice(0, 10)}",`);
  }
  const src = `// Generated by scripts/generate-models.mts — content hashes of /public/models/*.glb. Do not edit.\nexport const modelVersions: Record<string, string> = {\n${entries.join("\n")}\n};\n`;
  await writeFile(path.resolve("data/model-versions.ts"), src);
  console.log(`✓ data/model-versions.ts (${entries.length} models)`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
