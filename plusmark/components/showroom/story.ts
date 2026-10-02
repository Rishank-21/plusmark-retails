"use client";

import { clamp } from "@/lib/utils";
import { lerp, smooth } from "@/components/experience/scroll";

export { lerp, smooth };

/** Parts of a board the camera can close in on, as fractions of its bounding box (front face = +z). */
export const PARTS = {
  frame: [-0.16, 0.47, 0.5],
  surface: [-0.08, -0.06, 0.5],
  corner: [0.47, -0.46, 0.5],
} as const;
export type PartName = keyof typeof PARTS;
export const PART_ORDER: PartName[] = ["frame", "surface", "corner"];

/**
 * Story beats inside one product chapter (local 0 → 1):
 *   0.00–0.06  settled three-quarter view (the hero for product 1)
 *   0.06–0.20  turns to face you, product panel holds until 0.30
 *   0.30–0.36  camera moves in on the aluminium frame      ┐ annotation + leader line
 *   0.36–0.54  frame annotation holds                      │
 *   0.54–0.60  camera slides down to the surface           │
 *   0.60–0.78  surface annotation holds                    ┘
 *   0.78–0.84  pulls back to the full board, panel holds until 0.90
 *   0.90–1.00  board recedes, the next one enters from depth (not on the last chapter)
 * Every beat has a long hold so a light scroll never skips past a detail.
 */
export interface StoryState {
  /** continuous focus: 0 = product 1 is the hero, 1 = product 2 … */
  c: number;
  /** product whose copy is shown */
  index: number;
  local: number;
  /** 0 → 1: current board turned to face the viewer */
  turn: number;
  /** 0 → 1 weight of the close-up camera */
  close: number;
  /** 0 = frame, 1 = surface (where the close-up camera looks) */
  part: number;
  /** 0 → 1 hero copy fade-out */
  heroOut: number;
}

export function storyState(p: number, n: number): StoryState {
  const u = clamp(p) * n;
  const i = Math.min(n - 1, Math.floor(u));
  const local = n === 0 ? 0 : clamp(u - i);
  const last = i === n - 1;
  const exit = last ? 0 : smooth(0.9, 1, local);
  const c = i + exit;
  return {
    c,
    index: Math.round(c),
    local,
    turn: smooth(0.06, 0.2, local),
    close: smooth(0.3, 0.36, local) * (1 - smooth(0.78, 0.84, local)),
    part: smooth(0.54, 0.6, local),
    heroOut: i > 0 ? 1 : smooth(0.01, 0.05, local),
  };
}

/** Viewport-relative anchor for the annotation card's leader line (written by the DOM, read by WebGL). */
export interface CardEdge {
  x: number;
  y: number;
}

/**
 * Mutable state shared between the DOM layer and the WebGL scene. A plain object, so scroll
 * and pointer moves never re-render React.
 */
export const stage = {
  /** 0 → 1 across the pinned story section */
  p: 0,
  /** pointer, -1 … 1 (mouse only) */
  px: 0,
  py: 0,
  /** extra Y rotation from dragging (radians); eases back to 0 when released */
  dragRY: 0,
  dragging: false,
  /** hovered / clicked hotspot on the current board */
  hover: null as PartName | null,
  pinned: null as PartName | null,
  narrow: false,
  /** wide viewport: the hero puts copy left and the board right (matches the `split` CSS variant) */
  split: false,
  reduced: false,
  card: { x: 0, y: 0 } as CardEdge,
  /** 0 → 1 annotation visibility (drives the leader line) */
  annot: 0,
};

/** Writes to the shared stage state (kept outside components so React never re-renders on input). */
export function setStage(patch: Partial<typeof stage>) {
  Object.assign(stage, patch);
}

/** Positions a DOM overlay element at a screen point with an opacity (used by the WebGL projector). */
export function placeOverlay(el: HTMLElement | SVGElement, x: number | null, y: number | null, opacity: number) {
  if (x !== null && y !== null) el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
  el.style.opacity = opacity.toFixed(3);
  el.style.visibility = opacity > 0.02 ? "visible" : "hidden";
}

export function placeLine(line: SVGLineElement, x1: number, y1: number, x2: number, y2: number) {
  line.setAttribute("x1", x1.toFixed(1));
  line.setAttribute("y1", y1.toFixed(1));
  line.setAttribute("x2", x2.toFixed(1));
  line.setAttribute("y2", y2.toFixed(1));
}

export function resetStage() {
  stage.p = 0;
  stage.px = 0;
  stage.py = 0;
  stage.dragRY = 0;
  stage.dragging = false;
  stage.hover = null;
  stage.pinned = null;
  stage.annot = 0;
}
