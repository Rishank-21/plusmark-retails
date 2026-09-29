/**
 * Visual construction descriptors, keyed by product slug.
 *
 * These drive BOTH the GLB model generator (scripts/generate-models.ts) and the
 * product image generator (scripts/generate-images.ts). They encode only the
 * construction differences the catalog describes (surface type, corner type,
 * framing type) — never dimensions or specifications.
 *
 * Products without an entry here have no 3D model yet and use an image.
 * To add a real CAD/photogrammetry model later, drop the GLB into
 * /public/models/<slug>.glb and add an entry (or set `model` directly in products.ts).
 */

import { modelVersions } from "./model-versions.ts";

export type Surface =
  | "marker-hpl"
  | "melamine"
  | "chalk-hpl"
  | "fabric-navy"
  | "fabric-red"
  | "fabric-green"
  | "fabric-gray"
  | "magnetic-white"
  | "ceramic-white"
  | "cork"
  | "combination";

export type Corner = "signature" | "abs" | "chrome" | "plastic";
export type FrameTier = "heavy" | "premium" | "standard" | "light";

export type Visual =
  | {
      kind: "board";
      surface: Surface;
      corner: Corner;
      frame: FrameTier;
      magnets?: boolean;
    }
  | {
      kind: "door-board";
      doors: 1 | 2;
      frame: "triple" | "light";
      surface: Surface;
    }
  | { kind: "clipboard" }
  | { kind: "bench" };

export const visuals: Record<string, Visual> = {
  // White boards
  "metallic-premium-white-board": { kind: "board", surface: "marker-hpl", corner: "signature", frame: "heavy" },
  "eco-premium-white-board": { kind: "board", surface: "marker-hpl", corner: "abs", frame: "premium" },
  "deluxe-standard-white-board": { kind: "board", surface: "melamine", corner: "chrome", frame: "standard" },
  "eco-regular-white-board": { kind: "board", surface: "melamine", corner: "plastic", frame: "light" },
  // Chalk boards
  "metallic-premium-chalk-board": { kind: "board", surface: "chalk-hpl", corner: "signature", frame: "heavy" },
  "eco-premium-chalk-board": { kind: "board", surface: "chalk-hpl", corner: "abs", frame: "premium" },
  "deluxe-standard-chalk-board": { kind: "board", surface: "chalk-hpl", corner: "chrome", frame: "standard" },
  "eco-regular-chalk-board": { kind: "board", surface: "chalk-hpl", corner: "plastic", frame: "light" },
  // Notice boards
  "metallic-premium-notice-board": { kind: "board", surface: "fabric-navy", corner: "signature", frame: "heavy" },
  "eco-premium-notice-board": { kind: "board", surface: "fabric-green", corner: "abs", frame: "premium" },
  "deluxe-standard-notice-board": { kind: "board", surface: "fabric-red", corner: "chrome", frame: "standard" },
  "eco-regular-notice-board": { kind: "board", surface: "fabric-green", corner: "plastic", frame: "light" },
  // Magnetic boards
  "metallic-premium-magnetic-board": { kind: "board", surface: "magnetic-white", corner: "signature", frame: "heavy", magnets: true },
  "deluxe-standard-magnetic-board": { kind: "board", surface: "magnetic-white", corner: "chrome", frame: "standard", magnets: true },
  "eco-regular-magnetic-board": { kind: "board", surface: "magnetic-white", corner: "plastic", frame: "light", magnets: true },
  // Ceramic boards
  "metallic-premium-ceramic-board": { kind: "board", surface: "ceramic-white", corner: "signature", frame: "heavy" },
  "deluxe-standard-ceramic-board": { kind: "board", surface: "ceramic-white", corner: "chrome", frame: "standard" },
  // Specialty
  "cork-notice-board": { kind: "board", surface: "cork", corner: "signature", frame: "heavy" },
  "combination-board": { kind: "board", surface: "combination", corner: "signature", frame: "heavy" },
  "fabric-notice-board": { kind: "board", surface: "fabric-gray", corner: "signature", frame: "heavy" },
  // Acrylic door cover
  "deluxe-45mm-adc-notice-board-double-door": { kind: "door-board", doors: 2, frame: "triple", surface: "fabric-navy" },
  "deluxe-45mm-adc-notice-board-single-door": { kind: "door-board", doors: 1, frame: "triple", surface: "fabric-navy" },
  "eco-adc-notice-board-single-door": { kind: "door-board", doors: 1, frame: "light", surface: "fabric-red" },
  // Clipboard
  "laminate-mdf-base-clipboard": { kind: "clipboard" },
  // School bench — modelled on the PDS-SB 807 catalogue photo (dimensions estimated)
  "pds-sb-807": { kind: "bench" },
};

/** Models that are generic representations rather than an exact catalog design. */
export const representativeModels = new Set<string>(["pds-sb-807"]);

/** Model URL with a content-hash cache-buster (models are served with an immutable cache header). */
export function modelPath(slug: string): string | undefined {
  if (!visuals[slug]) return undefined;
  const v = modelVersions[slug];
  return v ? `/models/${slug}.glb?v=${v}` : `/models/${slug}.glb`;
}
