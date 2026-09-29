"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { PerformanceMonitor } from "@react-three/drei";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Lighting } from "@/components/three/Lighting";
import { ProductModel } from "@/components/three/ProductModel";
import { ModelErrorBoundary } from "@/components/three/ModelErrorBoundary";
import { dprForTier, type DeviceTier } from "@/components/three/capabilities";
import { lerp, smooth, type SceneScroll } from "./scroll";

export interface SceneBoard {
  slug: string;
  model: string;
}

interface Pose {
  x: number;
  y: number;
  z: number;
  ry: number;
  rx: number;
  s: number;
}

/** Hero composition: a loose, floating cluster on the right (centred behind the copy on phones). */
const HERO: Pose[] = [
  { x: 1.75, y: 0.1, z: 0, ry: -0.5, rx: 0.04, s: 1 },
  { x: 3.1, y: -1.05, z: -1.8, ry: -0.75, rx: 0.1, s: 0.9 },
  { x: 0.55, y: -1.35, z: -2.6, ry: -0.2, rx: -0.06, s: 0.85 },
  { x: 3.0, y: 1.35, z: -3.0, ry: -0.65, rx: 0.12, s: 0.85 },
];
const HERO_NARROW: Pose[] = [
  { x: 0.25, y: -1.25, z: -0.6, ry: -0.35, rx: 0.08, s: 0.72 },
  { x: 1.25, y: -2.2, z: -2.4, ry: -0.6, rx: 0.1, s: 0.6 },
  { x: -1.1, y: -2.3, z: -2.8, ry: 0.35, rx: 0.06, s: 0.6 },
  { x: 1.0, y: 1.9, z: -3.6, ry: -0.5, rx: 0.12, s: 0.55 },
];

const RING_R = 2.5;
const RING_Z = -2.5;

function Board({
  board,
  index,
  count,
  scroll,
}: {
  board: SceneBoard;
  index: number;
  count: number;
  scroll: React.RefObject<SceneScroll>;
}) {
  const group = useRef<THREE.Group>(null);
  const pose = useRef<Pose | null>(null);

  useFrame(({ clock }, dt) => {
    const g = group.current;
    const s = scroll.current;
    if (!g || !s) return;
    const t = clock.elapsedTime;
    const idle = s.reduced ? 0 : 1;
    const h = (s.narrow ? HERO_NARROW : HERO)[index % 4];

    // Hero pose, drifting up/around as the hero scrolls away
    const e = s.heroExit;
    const hero: Pose = {
      x: h.x + e * (s.narrow ? 0 : -0.6 + index * 0.3),
      y: h.y + e * (0.9 + index * 0.25) + Math.sin(t * 0.7 + index * 1.7) * 0.06 * idle,
      z: h.z + e * 0.6,
      ry: h.ry + e * (0.9 + index * 0.3) + Math.sin(t * 0.35 + index) * 0.06 * idle,
      rx: h.rx + Math.sin(t * 0.5 + index * 2) * 0.03 * idle,
      s: h.s,
    };

    // Ring pose: boards sit on a turntable ring; scroll turns the ring so each one comes to the front
    const a = (index / count) * Math.PI * 2 - s.orbit * ((count - 1) / count) * Math.PI * 2;
    const front = Math.cos(a); // 1 = facing camera at the front of the ring
    const ring: Pose = {
      x: Math.sin(a) * RING_R * (s.narrow ? 0.6 : 1) + (s.narrow ? 0 : 1.1),
      // phones: the copy panel sits at the bottom, so the ring rides higher
      y: (s.narrow ? 1.05 : -0.15) + Math.sin(t * 0.8 + index) * 0.04 * idle,
      z: RING_Z + Math.cos(a) * RING_R,
      ry: a * 0.85,
      rx: 0.02,
      s: (s.narrow ? 0.62 : 0.95) * (0.8 + 0.2 * Math.max(0, front)),
    };

    const w = smooth(0, 1, s.orbitEnter);
    const target: Pose = {
      x: lerp(hero.x, ring.x, w),
      y: lerp(hero.y, ring.y, w),
      z: lerp(hero.z, ring.z, w),
      ry: lerp(hero.ry, ring.ry, w),
      rx: lerp(hero.rx, ring.rx, w),
      s: lerp(hero.s, ring.s, w),
    };
    // Critically damped follow, so fast scrolling still moves the boards smoothly
    const k = 1 - Math.exp(-dt * 5);
    const p = (pose.current ??= { ...target });
    (Object.keys(p) as (keyof Pose)[]).forEach((key) => (p[key] += (target[key] - p[key]) * k));
    g.position.set(p.x, p.y, p.z);
    g.rotation.set(p.rx - s.py * 0.05, p.ry + s.px * 0.12, 0);
    g.scale.setScalar(p.s);
  });

  return (
    <group ref={group}>
      <ModelErrorBoundary>
        <Suspense fallback={null}>
          <ProductModel url={board.model} fitSize={2} envMapIntensity={1.1} />
        </Suspense>
      </ModelErrorBoundary>
    </group>
  );
}

/** Soft violet / cyan particle field that spins with the scroll. */
function Particles({ scroll, count }: { scroll: React.RefObject<SceneScroll>; count: number }) {
  const ref = useRef<THREE.Points>(null);
  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const palette = [new THREE.Color("#6d4aff"), new THREE.Color("#12c2e9"), new THREE.Color("#ff7a45"), new THREE.Color("#a996ff")];
    // deterministic pseudo-random so renders are stable
    let seed = 7;
    const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (rnd() - 0.5) * 16;
      pos[i * 3 + 1] = (rnd() - 0.5) * 10;
      pos[i * 3 + 2] = -rnd() * 10 + 1.5;
      const c = palette[i % palette.length];
      col.set([c.r, c.g, c.b], i * 3);
    }
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("color", new THREE.BufferAttribute(col, 3));
    return g;
  }, [count]);
  useEffect(() => () => geometry.dispose(), [geometry]);
  useFrame(({ clock }) => {
    const p = ref.current;
    const s = scroll.current;
    if (!p || !s) return;
    p.rotation.y = clock.elapsedTime * 0.02 * (s.reduced ? 0 : 1) + (s.heroExit + s.orbit) * 0.6;
    p.rotation.x = s.py * 0.04;
    p.position.y = s.heroExit * 0.8;
  });
  return (
    <points ref={ref} geometry={geometry}>
      <pointsMaterial size={0.045} vertexColors transparent opacity={0.75} sizeAttenuation depthWrite={false} />
    </points>
  );
}

function CameraRig({ scroll }: { scroll: React.RefObject<SceneScroll> }) {
  useFrame(({ camera }, dt) => {
    const s = scroll.current;
    if (!s) return;
    const k = 1 - Math.exp(-dt * 3);
    const w = smooth(0, 1, s.orbitEnter);
    const tx = s.px * 0.25;
    const ty = 0.1 - s.py * 0.15 + w * 0.35;
    const tz = (s.narrow ? 8.6 : 7) + w * 0.6;
    camera.position.x += (tx - camera.position.x) * k;
    camera.position.y += (ty - camera.position.y) * k;
    camera.position.z += (tz - camera.position.z) * k;
    camera.lookAt(s.narrow ? 0 : w * 0.9, w * -0.2, -1);
  });
  return null;
}

/** Drives rendering on demand: only while the scene is visible. */
function Driver({ scroll, active }: { scroll: React.RefObject<SceneScroll>; active: boolean }) {
  const invalidate = useThree((s) => s.invalidate);
  useEffect(() => {
    if (!active) return;
    let raf = 0;
    const loop = () => {
      if ((scroll.current?.visible ?? 0) > 0.001) invalidate();
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [active, invalidate, scroll]);
  return null;
}

export default function SceneCanvas({
  boards,
  scroll,
  tier,
  active,
  onReady,
}: {
  boards: SceneBoard[];
  scroll: React.RefObject<SceneScroll>;
  tier: Exclude<DeviceTier, "none">;
  active: boolean;
  onReady: () => void;
}) {
  const [dpr, setDpr] = useState<[number, number]>(dprForTier(tier));
  return (
    <Canvas
      aria-hidden
      frameloop="demand"
      dpr={dpr}
      camera={{ fov: 30, near: 0.1, far: 60, position: [0, 0.1, 7] }}
      gl={{ antialias: tier !== "low", alpha: true, powerPreference: "high-performance" }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.15;
        onReady();
      }}
    >
      <PerformanceMonitor onDecline={() => setDpr([1, 1])} onIncline={() => setDpr(dprForTier(tier))} />
      <Driver scroll={scroll} active={active} />
      <Lighting quality={tier} />
      <pointLight position={[-4, 2, 3]} intensity={18} color="#8f73ff" distance={14} />
      <pointLight position={[5, -2, 2]} intensity={14} color="#3fd0f0" distance={14} />
      <CameraRig scroll={scroll} />
      <Particles scroll={scroll} count={tier === "high" ? 900 : tier === "mid" ? 500 : 250} />
      {boards.map((b, i) => (
        <Board key={b.slug} board={b} index={i} count={boards.length} scroll={scroll} />
      ))}
    </Canvas>
  );
}
