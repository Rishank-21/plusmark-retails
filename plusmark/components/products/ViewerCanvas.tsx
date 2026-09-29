"use client";

import { Canvas } from "@react-three/fiber";
import { ContactShadows, OrbitControls } from "@react-three/drei";
import { Suspense, useEffect, useRef } from "react";
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

export default function ViewerCanvas({ url, tier, autoRotate, handle, onReady, onError, label }: ViewerCanvasProps) {
  const controls = useRef<OrbitControlsImpl>(null);

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
      camera={{ fov: 28, near: 0.1, far: 40, position: [1.6, 0.35, 5.2] }}
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
          <ProductModel url={url} fitSize={2.2} onReady={onReady} />
        </Suspense>
      </ModelErrorBoundary>
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
