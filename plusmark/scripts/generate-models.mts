/**
 * Generates Draco-compressed GLB models for products that have an entry in data/visuals.ts.
 *
 * Boards are built to match the real Plusmark product photos (public/images/products):
 *  - Metallic Premium ("signature"): tubular aluminium profile, red rounded caps with a black insert.
 *  - Eco Premium ("abs"): flat grooved profile, grey ABS caps with a black insert, raised wire hangers.
 *  - Deluxe Standard ("chrome"): flat profile with electroplated chrome corners.
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

/** Closed rounded-rectangle profile (CCW) with outward normals, half-sizes a × b, corner radius r. */
function roundedProfile(a: number, b: number, r: number, seg = 6) {
  r = Math.min(r, a - 1e-4, b - 1e-4);
  const pts: Array<{ u: number; v: number; nu: number; nv: number }> = [];
  const corners: Array<[number, number, number]> = [
    [a - r, b - r, 0],
    [-a + r, b - r, Math.PI / 2],
    [-a + r, -b + r, Math.PI],
    [a - r, -b + r, (3 * Math.PI) / 2],
  ];
  for (const [cu, cv, a0] of corners) {
    for (let s = 0; s <= seg; s++) {
      const t = a0 + (s / seg) * (Math.PI / 2);
      pts.push({ u: cu + Math.cos(t) * r, v: cv + Math.sin(t) * r, nu: Math.cos(t), nv: Math.sin(t) });
    }
  }
  return pts;
}

/**
 * Sweeps a (u, v) profile along a path in the XY plane. Each frame gives a position and the
 * in-plane direction the profile's u axis points along; v maps to +Z. Frames must advance so that
 * (tangent) = Z × n, i.e. counter-clockwise around the profile's u side. Ends are capped.
 */
function sweep(profile: ReturnType<typeof roundedProfile>, frames: Array<{ p: [number, number]; n: [number, number] }>): Geo {
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
 * Flat band between two polylines (same point count) in XY, extruded from z0 to z1, with the
 * front face (+Z) and the wall along the `inner` polyline. Used for the black corner insert.
 */
function band(outer: Array<[number, number]>, inner: Array<[number, number]>, innerNormal: (p: [number, number]) => [number, number], z0: number, z1: number): Geo {
  const g = empty();
  const n = outer.length;
  const base = 0;
  for (let k = 0; k < n; k++) {
    g.p.push(outer[k][0], outer[k][1], z1, inner[k][0], inner[k][1], z1);
    g.n.push(0, 0, 1, 0, 0, 1);
    g.uv.push(k / (n - 1), 0, k / (n - 1), 1);
  }
  for (let k = 0; k < n - 1; k++) {
    const o0 = base + k * 2, i0 = o0 + 1, o1 = o0 + 2, i1 = o0 + 3;
    g.i.push(i0, o0, o1, i0, o1, i1);
  }
  const wall = g.p.length / 3;
  for (let k = 0; k < n; k++) {
    const nn = innerNormal(inner[k]);
    g.p.push(inner[k][0], inner[k][1], z1, inner[k][0], inner[k][1], z0);
    g.n.push(nn[0], nn[1], 0, nn[0], nn[1], 0);
    g.uv.push(k / (n - 1), 0, k / (n - 1), 1);
  }
  for (let k = 0; k < n - 1; k++) {
    const A = wall + k * 2, B = A + 1, D = A + 2, C = A + 3;
    g.i.push(A, C, B, A, D, C);
  }
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
  // Chalk grade HPL grain — straight-on Metallic Premium chalk board photo.
  TEXTURES.set("grain-chalk", await grain("metallic-premium-chalk-board/7.webp", 840, 480, 320, 16));
  // 2 mm blazer cloth weave — straight-on Metallic Premium notice board photo.
  TEXTURES.set("grain-fabric", await grain("metallic-premium-notice-board/4.webp", 672, 480, 256, 34));
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
  // Metallic Premium signature corners (red cap + black insert).
  "cap-red": { color: "#a50b16", rough: 0.32 },
  // Glossy moulded plastic: a tight highlight instead of a broad grey sheen over the whole part.
  "cap-black": { color: "#08090a", rough: 0.3 },
  // Eco ABS corners (light silver-grey L cap + matte black insert, as in the Eco close-up photo).
  "abs-gray": { color: "#7c8085", metal: 0.15, rough: 0.45 },
  "abs-dark": { color: "#050506", rough: 0.85 },
  chrome: { color: "#eceef0", metal: 1, rough: 0.07 },
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

/**
 * Metallic Premium "Signature Dual-Tone" corner, modelled on the product photos: a red tubular
 * elbow (the rail profile, slightly oversized, swept around a quarter circle with short sleeves
 * over the rail ends) plus a black curved insert filling the inside of the bend.
 */
const ELBOW = {
  /** Centre-line radius of the bend, × frame width (wide sweep, like the reference corner). */
  bend: 2.0,
  /** Elbow profile oversize vs. the rail (so it reads as a cap sleeved over the rail). */
  grow: 1.12,
  /** Short sleeve along each rail, × frame width; red and black end flush here. */
  sleeve: 0.18,
  /** Width of the visible black band inside the red, × frame width. */
  insert: 0.62,
};
const elbowBend = (fw: number) => fw * ELBOW.bend;
/** Distance from the board edge to where the straight rails end (inside the elbow sleeves). */
const elbowClear = (fw: number) => fw / 2 + elbowBend(fw);

function addSignatureCorners(b: ModelBuilder, W: number, H: number, fw: number, fd: number) {
  const Rc = elbowBend(fw);
  const a = (fw / 2) * ELBOW.grow, bz = (fd / 2) * ELBOW.grow;
  const profile = roundedProfile(a, bz, Math.min(a, bz) * 0.72, 8);
  const cx = W / 2 - fw / 2 - Rc, cy = H / 2 - fw / 2 - Rc;
  const Ls = fw * ELBOW.sleeve;
  const frames: Array<{ p: [number, number]; n: [number, number] }> = [{ p: [cx + Rc, cy - Ls], n: [1, 0] }];
  const N = 20;
  for (let k = 0; k <= N; k++) {
    const t = (k / N) * (Math.PI / 2);
    frames.push({ p: [cx + Rc * Math.cos(t), cy + Rc * Math.sin(t)], n: [Math.cos(t), Math.sin(t)] });
  }
  frames.push({ p: [cx - Ls, cy + Rc], n: [0, 1] });
  const elbow = sweep(profile, frames);

  // Black insert, as in the reference close-up: a band concentric with the red bend, directly
  // inside it, ending flush with the red ends. Inside the black the writing surface shows through.
  const rOut = Rc - fw / 2 + 0.002; // just past the rail inner edge, tucked under the elbow
  // The elbow's rounded flank only rises above the insert at ≈ 0.74·a inside the centre line,
  // so measure the visible black band from there.
  const rIn = Math.max(0.004, Rc - a * 0.74 - fw * ELBOW.insert);
  const ring = (r: number): Array<[number, number]> => {
    const pts: Array<[number, number]> = [[cx + r, cy - Ls]];
    for (let k = 0; k <= N; k++) {
      const t = (k / N) * (Math.PI / 2);
      pts.push([cx + r * Math.cos(t), cy + r * Math.sin(t)]);
    }
    pts.push([cx - Ls, cy + r]);
    return pts;
  };
  const zSurf = fd / 2 - 0.0015;
  const insert = band(ring(rOut), ring(rIn), ([x, y]) => {
    if (y < cy) return [-1, 0];
    if (x < cx) return [0, -1];
    const l = Math.hypot(x - cx, y - cy) || 1;
    return [-(x - cx) / l, -(y - cy) / l];
  }, zSurf - 0.001, fd / 2 - 0.0005);

  for (const sx of [1, -1]) {
    for (const sy of [1, -1]) {
      b.add("cap-red", mirrorXY(elbow, sx, sy));
      b.add("cap-black", mirrorXY(insert, sx, sy));
    }
  }
}

/** How far rails must stop short of the outer corner so they stay hidden inside the cap. */
function railClearance(corner: Corner, fw: number) {
  if (corner === "signature") return elbowClear(fw);
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
 * `vclear`: same for the vertical rails (the signature elbow needs both shortened).
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
  // Signature elbow: round the plate a little more than the elbow's outer radius so it stays
  // tucked behind the bend.
  const r =
    corner === "signature" ? Math.min((elbowBend(fw) + fw / 2) * 1.15, L * 0.95)
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
  // Corner zone to keep clear of (elbow / cap), then a small gap — as in the photos.
  const cs = corner === "signature" ? elbowClear(fw) + fw * ELBOW.sleeve : fw * 2.4;
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
  addFrame(b, W, H, fw, fd, v.corner, "aluminium", 0, 0, clear, v.corner === "signature" ? clear : 0);
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
