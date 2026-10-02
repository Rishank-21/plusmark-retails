/** Mutable, per-frame hero state shared between the DOM layer and the 3D canvas (no React re-renders). */
export interface HeroState {
  /**
   * Carousel position, continuous and unbounded: product i is centred whenever the position is
   * i + k·N. It is animated over time (auto-advance and the arrow buttons), never by page scroll.
   */
  e: number;
  /** Normalised pointer position over the stage, -1 … 1. */
  px: number;
  py: number;
  /** User rotation (drag) with inertia. */
  yaw: number;
  yawVel: number;
  pitch: number;
  pitchVel: number;
  dragging: boolean;
  lastInteract: number;
  zoom: number;
  zoomTarget: number;
  reduced: boolean;
}

export function createHeroState(): HeroState {
  return {
    e: 0,
    px: 0,
    py: 0,
    yaw: 0,
    yawVel: 0,
    pitch: 0,
    pitchVel: 0,
    dragging: false,
    lastInteract: 0,
    zoom: 1,
    zoomTarget: 1,
    reduced: false,
  };
}

/**
 * Signed offset of product `i` from carousel position `e`, taken around the loop so the last
 * product sits just left of the first: −N/2 … N/2. Negative = waiting on the right (comes next),
 * positive = gone to the left (shown before).
 */
export function slotOffset(e: number, i: number, n: number) {
  const d = e - i;
  return n > 1 ? d - n * Math.round(d / n) : d;
}

/** Product index (0 … N−1) nearest to carousel position `e`. */
export function wrapIndex(e: number, n: number) {
  return ((Math.round(e) % n) + n) % n;
}

export type ModelStatus = "idle" | "ready" | "error";
