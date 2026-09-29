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

/** Scroll values the WebGL scene reads every frame (written by ExperienceScene's scroll loop). */
export interface SceneScroll {
  /** 0 → 1 as the hero scrolls out */
  heroExit: number;
  /** 0 → 1 as the orbit section scrolls into view (layout blend hero → ring) */
  orbitEnter: number;
  /** 0 → 1 across the pinned orbit section (ring rotation) */
  orbit: number;
  /** canvas visibility */
  visible: number;
  /** pointer, -1 … 1 */
  px: number;
  py: number;
  narrow: boolean;
  reduced: boolean;
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
});
