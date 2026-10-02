"use client";

import { Canvas, useThree } from "@react-three/fiber";
import { ContactShadows, OrbitControls } from "@react-three/drei";
import { Suspense, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { Lighting } from "@/components/three/Lighting";
import { ProductModel } from "@/components/three/ProductModel";
import { ModelErrorBoundary } from "@/components/three/ModelErrorBoundary";
import { dprForTier, type DeviceTier } from "@/components/three/capabilities";
import type { ViewerHandle } from "./ProductViewer3D";

interface ViewerCanvasProps {
  url: string;
  tier: Exclude<DeviceTier, "none">;
  autoRotate: boolean;
  handle: React.RefObject<ViewerHandle | null>;
  onReady: () => void;
  onError: () => void;
  label: string;
}

/** Starting view direction from the product: a little to its right and slightly above it. */
const VIEW_DIR = new THREE.Vector3(1.5, 0.33, 4.85).normalize();
/** Largest share of the frame height / width the model may take, even at the nearest point of a turn. */
const FILL_V = 0.9;
const FILL_H = 0.92;

/**
 * Puts the camera at the distance where the model stays whole in the frame at every angle the
 * auto-rotate passes through, with a little room around it. Wide boards come out large; tall
 * pieces (clipboards) keep clear margins top and bottom. That view is also what "Reset view" returns to.
 */
function FitCamera({ size, controls }: { size: THREE.Vector3 | null; controls: React.RefObject<OrbitControlsImpl | null> }) {
  const get = useThree((s) => s.get);
  const aspect = useThree((s) => s.size.width / Math.max(1, s.size.height));

  useEffect(() => {
    const c = controls.current;
    const camera = get().camera;
    if (!size || !c || !(camera instanceof THREE.PerspectiveCamera)) return;
    const tanV = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    const tanH = tanV * aspect;
    // Radius of the footprint the model sweeps while turning: the closest it comes to the camera.
    const r = Math.hypot(size.x, size.z) / 2;
    const d = Math.max(r + size.y / (2 * tanV * FILL_V), r * Math.sqrt(1 + 1 / (tanH * FILL_H) ** 2));
    // Keep the current viewing angle (a fullscreen toggle re-fits without spinning the model back).
    const dir = camera.position.clone().sub(c.target).normalize();
    camera.position.copy(c.target).addScaledVector(dir, d);
    c.position0.copy(c.target0).addScaledVector(VIEW_DIR, d);
    c.update();
  }, [size, aspect, get, controls]);

  return null;
}

export default function ViewerCanvas({ url, tier, autoRotate, handle, onReady, onError, label }: ViewerCanvasProps) {
  const controls = useRef<OrbitControlsImpl>(null);
  const [modelSize, setModelSize] = useState<THREE.Vector3 | null>(null);

  useEffect(() => {
    handle.current = { reset: () => controls.current?.reset() };
    return () => {
      handle.current = null;
    };
  }, [handle]);

  return (
    <Canvas
      aria-label={label}
      role="img"
      dpr={dprForTier(tier)}
      // Starts about where a landscape board ends up after FitCamera, so the hand-over is invisible.
      camera={{ fov: 28, near: 0.1, far: 40, position: VIEW_DIR.clone().multiplyScalar(4.8).toArray() }}
      gl={{ antialias: tier !== "low", alpha: true }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.12;
      }}
      style={{ touchAction: "none" }}
    >
      <Lighting quality={tier} />
      <ModelErrorBoundary onError={onError}>
        <Suspense fallback={null}>
          <ProductModel url={url} fitSize={2.2} onReady={onReady} onSize={setModelSize} />
        </Suspense>
      </ModelErrorBoundary>
      <FitCamera size={modelSize} controls={controls} />
      {tier !== "low" && (
        <ContactShadows
          position={[0, -1.05, 0]}
          opacity={0.42}
          scale={7}
          blur={2.2}
          far={2.4}
          resolution={tier === "high" ? 1024 : 512}
          color="#15181c"
        />
      )}
      <OrbitControls
        ref={controls}
        makeDefault
        enablePan={false}
        enableDamping
        dampingFactor={0.08}
        minDistance={1.6}
        maxDistance={8.5}
        minPolarAngle={Math.PI * 0.2}
        maxPolarAngle={Math.PI * 0.62}
        autoRotate={autoRotate}
        autoRotateSpeed={0.9}
      />
    </Canvas>
  );
}
