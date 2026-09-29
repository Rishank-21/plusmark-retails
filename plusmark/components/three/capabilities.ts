"use client";

export type DeviceTier = "none" | "low" | "mid" | "high";

let cachedWebGL: boolean | null = null;

export function hasWebGL(): boolean {
  if (cachedWebGL !== null) return cachedWebGL;
  try {
    const canvas = document.createElement("canvas");
    const gl =
      (canvas.getContext("webgl2") as WebGL2RenderingContext | null) ||
      (canvas.getContext("webgl") as WebGLRenderingContext | null);
    cachedWebGL = !!gl;
    gl?.getExtension("WEBGL_lose_context")?.loseContext();
  } catch {
    cachedWebGL = false;
  }
  return cachedWebGL;
}

/**
 * Coarse device tier used to scale 3D quality.
 * "none" → skip WebGL entirely and show product images.
 */
export function getDeviceTier(): DeviceTier {
  if (typeof window === "undefined") return "none";
  if (new URLSearchParams(window.location.search).has("no3d")) return "none";
  if (!hasWebGL()) return "none";
  const nav = navigator as Navigator & {
    deviceMemory?: number;
    connection?: { saveData?: boolean; effectiveType?: string };
  };
  const mem = nav.deviceMemory ?? 8;
  const cores = nav.hardwareConcurrency ?? 8;
  const saveData = nav.connection?.saveData;
  const slowNet = /(^|-)2g$/.test(nav.connection?.effectiveType ?? "");
  if (saveData || slowNet || mem <= 1) return "none";
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  if (mem <= 3 || cores <= 4) return "low";
  if (coarse) return "mid";
  return "high";
}

export function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export const DRACO_PATH = "/draco/";

export function dprForTier(tier: DeviceTier): [number, number] {
  if (tier === "high") return [1, 2];
  if (tier === "mid") return [1, 1.5];
  return [1, 1];
}
