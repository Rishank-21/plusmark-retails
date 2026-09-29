/** Mutable, per-frame hero state shared between the DOM layer and the 3D canvas (no React re-renders). */
export interface HeroState {
  /** Eased product index, continuous: 0 … N-1. */
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

export type ModelStatus = "idle" | "ready" | "error";
