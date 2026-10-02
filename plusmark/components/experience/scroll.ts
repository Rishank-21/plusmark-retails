"use client";

import { clamp } from "@/lib/utils";

/** Hermite smoothstep between a and b. */
export const smooth = (a: number, b: number, x: number) => {
  const t = clamp((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/**
 * Progress of a tall "pinned" section: 0 when its top reaches the top of the viewport,
 * 1 when its bottom reaches the bottom of the viewport.
 */
export function pinProgress(el: HTMLElement | null) {
  if (!el) return 0;
  const r = el.getBoundingClientRect();
  const span = r.height - window.innerHeight;
  return span > 0 ? clamp(-r.top / span) : r.top <= 0 ? 1 : 0;
}

/** A DOM "slot" the product is composed into, as fractions of the viewport. */
export interface Slot {
  cx: number;
  cy: number;
  w: number;
  h: number;
}

/** Scroll values the WebGL scene reads every frame (written by ExperienceScene's scroll loop). */
export interface SceneScroll {
  /** 0 → 1 as the hero scrolls out */
  heroExit: number;
  /** 0 → 1 as the showroom section scrolls into view (hero slot → showroom slot) */
  orbitEnter: number;
  /** 0 → 1 across the pinned showroom section (drives the product sequence) */
  orbit: number;
  /** canvas visibility */
  visible: number;
  /** pointer, -1 … 1 */
  px: number;
  py: number;
  narrow: boolean;
  reduced: boolean;
  /** where the product sits in the hero / in the showroom (measured from the DOM) */
  heroSlot: Slot;
  orbitSlot: Slot;
}

export const initialSceneScroll = (): SceneScroll => ({
  heroExit: 0,
  orbitEnter: 0,
  orbit: 0,
  visible: 1,
  px: 0,
  py: 0,
  narrow: false,
  reduced: false,
  heroSlot: { cx: 0.55, cy: 0.52, w: 0.4, h: 0.6 },
  orbitSlot: { cx: 0.62, cy: 0.5, w: 0.45, h: 0.6 },
});

/**
 * Direct-manipulation input shared between DOM controls (drag surface, hotspots) and the
 * WebGL scene. A plain mutable object, so pointer moves never trigger React renders.
 */
export const sceneInput = {
  /** extra Y rotation from dragging / arrow keys (radians) */
  dragRY: 0,
  dragging: false,
  /** hovered / selected hotspot index on the hero product, -1 = none */
  hotspot: -1,
};

export interface ShowroomState {
  /** continuous focus position: 0 = product 1 in focus, 1 = product 2 … */
  c: number;
  /** product whose copy is shown */
  index: number;
  /** 0 → 1 within the current product's chapter */
  local: number;
  /** 0 → 1 weight of the close-up detail shot */
  detail: number;
}

/**
 * Story beats per product inside the pinned showroom:
 * overview → rotates to face you → close-up detail with annotation → next product enters.
 */
export function showroomState(p: number, n: number): ShowroomState {
  if (n <= 1) return { c: 0, index: 0, local: p, detail: smooth(0.3, 0.45, p) * (1 - smooth(0.8, 0.95, p)) };
  const u = clamp(p) * n;
  const i = Math.min(n - 1, Math.floor(u));
  const local = clamp(u - i);
  const last = i === n - 1;
  // long holds: overview/turn 0–0.24, close-up in 0.24–0.32, annotation holds 0.32–0.70,
  // pull back 0.70–0.78, then the next board enters 0.84–1 (so a light scroll never skips a beat)
  const tr = last ? 0 : smooth(0.84, 1, local);
  const detail = smooth(0.24, 0.32, local) * (1 - smooth(last ? 0.86 : 0.7, last ? 0.96 : 0.78, local));
  const c = i + tr;
  return { c, index: Math.round(c), local, detail };
}

/** Local anchor points on a board, as fractions of its bounding box (front face = +z). */
export const ANCHORS = {
  frame: [-0.12, 0.475, 0.5],
  corner: [0.47, -0.465, 0.5],
  surface: [-0.2, -0.08, 0.5],
} as const;
export type AnchorName = keyof typeof ANCHORS;
