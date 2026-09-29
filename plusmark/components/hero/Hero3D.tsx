"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, PerformanceMonitor } from "@react-three/drei";
import { Suspense, useRef, useState } from "react";
import * as THREE from "three";
import type { FeaturedProduct } from "@/data/featured";
import { Lighting } from "@/components/three/Lighting";
import { ProductModel } from "@/components/three/ProductModel";
import { ModelErrorBoundary } from "@/components/three/ModelErrorBoundary";
import { dprForTier, type DeviceTier } from "@/components/three/capabilities";
import type { HeroState } from "./heroState";

interface Hero3DProps {
  products: FeaturedProduct[];
  state: React.RefObject<HeroState>;
  /** Indices that should currently be mounted (current ±1). */
  mounted: number[];
  tier: Exclude<DeviceTier, "none">;
  active: boolean;
  onStatus: (index: number, status: "ready" | "error") => void;
}

const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

function HeroSlot({
  index,
  product,
  state,
  onStatus,
}: {
  index: number;
  product: FeaturedProduct;
  state: React.RefObject<HeroState>;
  onStatus: Hero3DProps["onStatus"];
}) {
  const group = useRef<THREE.Group>(null);
  const opacity = useRef(0);

  useFrame((clock) => {
    const g = group.current;
    const s = state.current;
    if (!g || !s) return;
    const d = s.e - index; // <0 upcoming, >0 passed
    const ad = Math.abs(d);
    g.visible = ad < 1;
    if (!g.visible) return;
    const t = clock.clock.elapsedTime;
    const idle = s.reduced ? 0 : 1;
    opacity.current = 1 - smooth(0.12, 0.62, ad);
    // 3D carousel: outgoing / incoming boards swing along a shallow arc (sideways, back in depth,
    // with a slight tilt), so the change reads as depth rather than a flat slide.
    const arc = Math.sin(Math.min(ad, 1) * (Math.PI / 2));
    g.position.x = -d * 1.7;
    g.position.y = Math.sin(t * 0.8 + index) * 0.025 * idle - arc * 0.16;
    g.position.z = -arc * 1.5;
    g.rotation.y = product.yaw - d * 0.9 + s.yaw + s.px * 0.12 + Math.sin(t * 0.35) * 0.04 * idle;
    g.rotation.x = s.pitch - s.py * 0.06 + 0.02 + arc * 0.12;
    g.rotation.z = -d * 0.05;
    const sc = 1 - smooth(0, 1, ad) * 0.18;
    g.scale.setScalar(sc);
  });

  return (
    <group ref={group} visible={false}>
      <ModelErrorBoundary onError={() => onStatus(index, "error")}>
        <Suspense fallback={null}>
          <ProductModel url={product.model!} fitSize={product.fit} opacityRef={opacity} onReady={() => onStatus(index, "ready")} />
        </Suspense>
      </ModelErrorBoundary>
    </group>
  );
}

/** Drag inertia, spring-back, zoom and camera parallax. */
function Rig({ state }: { state: React.RefObject<HeroState> }) {
  const { camera, size } = useThree();
  const base = useRef(new THREE.Vector3(0, 0.02, 5.9));
  useFrame((_, dt) => {
    const s = state.current;
    if (!s) return;
    const k = Math.min(1, dt * 60);
    if (!s.dragging) {
      s.yaw += s.yawVel * k;
      s.pitch += s.pitchVel * k;
      s.yawVel *= Math.pow(0.93, k);
      s.pitchVel *= Math.pow(0.9, k);
      // settle back to the presentation angle after a pause
      if (performance.now() - s.lastInteract > 2600) {
        s.yaw += (0 - s.yaw) * 0.02 * k;
        s.pitch += (0 - s.pitch) * 0.04 * k;
      }
    }
    s.pitch = THREE.MathUtils.clamp(s.pitch, -0.45, 0.45);
    s.zoom += (s.zoomTarget - s.zoom) * 0.1 * k;
    // narrow viewports need the camera further back to keep the model centred and whole
    const aspectPush = size.width < 768 ? 1.12 : 1;
    const z = (base.current.z * aspectPush) / s.zoom;
    camera.position.x += (s.px * 0.14 - camera.position.x) * 0.05 * k;
    camera.position.y += (base.current.y - s.py * 0.08 - camera.position.y) * 0.05 * k;
    camera.position.z += (z - camera.position.z) * 0.12 * k;
    camera.lookAt(0, 0, 0);
  });
  return null;
}

export default function Hero3D({ products, state, mounted, tier, active, onStatus }: Hero3DProps) {
  const [dpr, setDpr] = useState<[number, number]>(dprForTier(tier));
  return (
    <Canvas
      aria-hidden
      className="!absolute inset-0"
      frameloop={active ? "always" : "never"}
      dpr={dpr}
      camera={{ fov: 26, near: 0.1, far: 40, position: [0, 0.02, 5.4] }}
      gl={{ antialias: tier !== "low", alpha: true, powerPreference: "high-performance" }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.12;
      }}
    >
      <PerformanceMonitor
        onDecline={() => setDpr([1, 1])}
        onIncline={() => setDpr(dprForTier(tier))}
      />
      <Lighting quality={tier} />
      <Rig state={state} />
      {products.map((p, i) =>
        p.model && mounted.includes(i) ? (
          <HeroSlot key={p.slug} index={i} product={p} state={state} onStatus={onStatus} />
        ) : null,
      )}
      {tier !== "low" && (
        <ContactShadows
          position={[0, -1.02, 0]}
          opacity={0.4}
          scale={8}
          blur={2.3}
          far={2.6}
          resolution={tier === "high" ? 1024 : 512}
          color="#15181c"
        />
      )}
    </Canvas>
  );
}
