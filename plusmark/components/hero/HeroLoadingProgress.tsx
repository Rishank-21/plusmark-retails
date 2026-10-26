"use client";

import { useProgress } from "@react-three/drei";

/**
 * The percentage comes out of drei's progress store, which is wired to three's loading manager.
 * Kept in its own module so the hero can show it without importing three into the initial bundle.
 */
export default function HeroLoadingProgress() {
  const { progress } = useProgress();
  return <>Loading 3D… {Math.round(progress)}%</>;
}
