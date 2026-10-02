"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { PerformanceMonitor, useProgress } from "@react-three/drei";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Lighting } from "@/components/three/Lighting";
import { ProductModel } from "@/components/three/ProductModel";
import { ModelErrorBoundary } from "@/components/three/ModelErrorBoundary";
import { dprForTier, type DeviceTier } from "@/components/three/capabilities";
import { lerp, PARTS, PART_ORDER, placeLine, placeOverlay, smooth, stage, storyState, type PartName } from "./story";

export interface ShowroomBoard {
  slug: string;
  model: string;
}

interface BoardInfo {
  group: THREE.Group | null;
  size: THREE.Vector3;
  ready: boolean;
  appear: number;
  opacity: number;
}

const FOV = 30;
const TAN = Math.tan(THREE.MathUtils.degToRad(FOV / 2));
/** Camera distance that keeps a 2-unit-wide board comfortably inside the frame on any aspect. */
const baseDistance = (aspect: number) => Math.max(7, 2.5 / (aspect * 2 * TAN));

function partWorld(info: BoardInfo, name: PartName, out: THREE.Vector3) {
  const a = PARTS[name];
  out.set(a[0] * info.size.x, a[1] * info.size.y, a[2] * info.size.z);
  if (!info.group) return out;
  info.group.updateMatrixWorld(true);
  return info.group.localToWorld(out);
}

function useShadowTexture() {
  const tex = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = c.height = 128;
    const g = c.getContext("2d")!;
    const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    grad.addColorStop(0, "rgba(27,23,64,0.5)");
    grad.addColorStop(0.5, "rgba(27,23,64,0.18)");
    grad.addColorStop(1, "rgba(27,23,64,0)");
    g.fillStyle = grad;
    g.fillRect(0, 0, 128, 128);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, []);
  useEffect(() => () => tex.dispose(), [tex]);
  return tex;
}

function Board({
  board,
  index,
  count,
  infosRef,
  shadowTex,
  onReady,
  onFail,
}: {
  board: ShowroomBoard;
  index: number;
  count: number;
  infosRef: React.RefObject<BoardInfo[]>;
  shadowTex: THREE.Texture;
  onReady: () => void;
  onFail: () => void;
}) {
  const group = useRef<THREE.Group>(null);
  const shadow = useRef<THREE.Mesh>(null);
  const shadowMat = useRef<THREE.MeshBasicMaterial>(null);
  const opacity = useRef(0);
  const pose = useRef<{ x: number; y: number; z: number; ry: number; rx: number; s: number; o: number } | null>(null);
  const aspect = useThree((s) => s.size.width / Math.max(1, s.size.height));

  useFrame(({ clock }, dt) => {
    const g = group.current;
    const info = infosRef.current[index];
    if (!g || !info) return;
    info.group = g;
    const step = Math.min(dt, 0.1);
    if (info.ready) info.appear = Math.min(1, info.appear + step / 1.1);
    const idle = stage.reduced ? 0 : 1;
    const t = clock.elapsedTime;

    const st = storyState(stage.p, count);
    const turn = index < st.index ? 1 : index > st.index ? 0 : st.turn;
    const baseRY = lerp(-0.55, -0.1, turn);
    const d = index - st.c;
    const ad = Math.abs(d);
    const hero = index === 0 ? 1 - st.heroOut : 0;
    const focused = ad < 0.5;

    const target = { x: 0, y: 0, z: 0, ry: baseRY, rx: 0.02, s: 1, o: 1 };
    if (d >= 0) {
      // waiting in depth → enters, rotating into position
      target.x = d * 1.6;
      target.z = -d * 7;
      target.ry = lerp(baseRY, -1.05, Math.min(1, d));
      target.o = 1 - smooth(0.35, 1, d);
    } else {
      // leaving: rotates slightly, moves back and aside, loses focus
      target.x = -ad * 2.4;
      target.z = -ad * 4;
      target.ry = baseRY + ad * 0.7;
      target.s = 1 - Math.min(1, ad) * 0.15;
      target.o = 1 - smooth(0.05, 0.75, ad);
    }
    // hero: phones stack the board under the headline; wider screens put it in the right half
    // (the copy sits in the left half), so text and board never overlap on short viewports
    if (!stage.split) {
      // board centre at ~71% of the viewport height, below the stacked copy and buttons
      const halfH = baseDistance(aspect) * TAN;
      target.y += lerp(0, -halfH * 0.42, hero);
      target.s *= lerp(1, 0.86, hero);
    } else {
      const halfW = baseDistance(aspect) * TAN * aspect;
      target.x += lerp(0, Math.min(halfW * 0.46, 1.9), hero);
      target.y += lerp(0, -0.06, hero);
      target.s *= lerp(1, 0.96, hero);
    }
    target.s *= 0.94 + 0.06 * info.appear;
    target.y += Math.sin(t * 0.6 + index) * 0.022 * idle;
    target.ry += Math.sin(t * 0.3 + index * 1.7) * 0.012 * idle + (focused ? stage.dragRY : 0);
    target.rx += Math.sin(t * 0.45 + index) * 0.008 * idle;
    target.o *= info.appear;

    // critically damped follow: no jumps on fast scrolls; direct feel while dragging
    const k = 1 - Math.exp(-step * 4);
    const kr = stage.dragging && focused ? 1 - Math.exp(-step * 16) : k;
    const p = (pose.current ??= { ...target });
    p.x += (target.x - p.x) * k;
    p.y += (target.y - p.y) * k;
    p.z += (target.z - p.z) * k;
    p.ry += (target.ry - p.ry) * kr;
    p.rx += (target.rx - p.rx) * k;
    p.s += (target.s - p.s) * k;
    p.o += (target.o - p.o) * k;

    const par = stage.reduced ? 0 : 1;
    g.position.set(p.x, p.y, p.z);
    g.rotation.set(p.rx - stage.py * 0.03 * par, p.ry + stage.px * 0.06 * par, 0);
    g.scale.setScalar(Math.max(0.001, p.s));
    g.visible = p.o > 0.004;
    opacity.current = Math.min(1, p.o);
    info.opacity = p.o;

    if (shadow.current && shadowMat.current) {
      shadow.current.position.set(0, -info.size.y / 2 - 0.14, 0.05);
      shadow.current.scale.set(info.size.x * 1.2, info.size.x * 0.3, 1);
      shadowMat.current.opacity = 0.38 * p.o;
    }
  });

  return (
    <group ref={group}>
      <ModelErrorBoundary onError={onFail}>
        <Suspense fallback={null}>
          <ProductModel
            url={board.model}
            fitSize={2}
            envMapIntensity={1.05}
            opacityRef={opacity}
            onSize={(v) => infosRef.current[index]?.size.copy(v)}
            onReady={() => {
              const info = infosRef.current[index];
              if (info) info.ready = true;
              onReady();
            }}
          />
        </Suspense>
      </ModelErrorBoundary>
      <mesh ref={shadow} rotation-x={-Math.PI / 2} renderOrder={-1}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial ref={shadowMat} map={shadowTex} transparent depthWrite={false} opacity={0} toneMapped={false} />
      </mesh>
    </group>
  );
}

/**
 * Camera: resting in front of the board with a subtle pointer parallax; closes in on the frame,
 * then slides down to the surface during each product's detail beats, and leans toward a hovered
 * (or clicked) hotspot. Everything is spring-damped.
 */
function CameraRig({ infosRef, count }: { infosRef: React.RefObject<BoardInfo[]>; count: number }) {
  const aspect = useThree((s) => s.size.width / Math.max(1, s.size.height));
  const look = useMemo(() => new THREE.Vector3(), []);
  const lookT = useMemo(() => new THREE.Vector3(), []);
  const posT = useMemo(() => new THREE.Vector3(), []);
  const a = useMemo(() => new THREE.Vector3(), []);
  const b = useMemo(() => new THREE.Vector3(), []);

  useFrame(({ camera }, dt) => {
    const st = storyState(stage.p, count);
    const info = infosRef.current[st.index];
    const par = stage.reduced ? 0 : 1;
    const z0 = baseDistance(aspect);
    const bx = stage.px * 0.14 * par;
    const by = -stage.py * 0.09 * par;
    posT.set(bx, by, z0);
    lookT.set(bx * 0.35, by * 0.35, 0);

    let w = 0;
    if (info?.ready && Math.abs(st.c - st.index) < 0.2) {
      if (stage.pinned) {
        partWorld(info, stage.pinned, a);
        w = 0.72;
      } else if (st.close > 0.001) {
        partWorld(info, "frame", a);
        partWorld(info, "surface", b);
        a.lerp(b, st.part);
        w = st.close;
      } else if (stage.hover) {
        partWorld(info, stage.hover, a);
        w = 0.12;
      }
      w *= stage.reduced ? 0.6 : 1;
    }
    if (w > 0.0005) {
      // the part lands right of centre on desktop (card on the left), above centre on phones (card below)
      const closeLook = stage.narrow ? b.set(a.x, a.y - 0.22, a.z) : b.set(a.x - 0.34, a.y, a.z);
      lookT.lerp(closeLook, w);
      // frame detail is framed tighter than the surface, which reads better with more of the board in view
      const surf = stage.pinned ? (stage.pinned === "surface" ? 1 : 0) : st.part;
      const dist = lerp(stage.narrow ? 3.4 : 2.6, stage.narrow ? 4.4 : 3.8, surf);
      posT.lerp(a.set(closeLook.x + (stage.narrow ? 0 : 0.3), closeLook.y + 0.1, closeLook.z + dist), w);
    }

    const k = 1 - Math.exp(-Math.min(dt, 0.1) * 2.8);
    camera.position.lerp(posT, k);
    look.lerp(lookT, k);
    camera.lookAt(look);
  });
  return null;
}

/** Soft key that trails the camera so highlights slide along the aluminium as the view changes. */
function KeyFollow() {
  const light = useRef<THREE.DirectionalLight>(null);
  useFrame(({ camera }) => light.current?.position.set(camera.position.x * 0.8 + 2.4, 3.4 + camera.position.y * 0.5, 6));
  return <directionalLight ref={light} intensity={0.35} color="#f6f4ff" />;
}

const tmp = new THREE.Vector3();
const tmp2 = new THREE.Vector3();

/**
 * Projects 3D part positions into the DOM: hotspots ([data-xe-hot]), the annotation dot
 * ([data-xe-dot]) and the SVG leader line ([data-xe-line]) from the card to the part.
 */
function Projector({ root, infosRef, count }: { root: string; infosRef: React.RefObject<BoardInfo[]>; count: number }) {
  const size = useThree((s) => s.size);
  const els = useRef<{ hots: HTMLElement[]; dot: HTMLElement | null; line: SVGLineElement | null }>({ hots: [], dot: null, line: null });
  useEffect(() => {
    const r = document.getElementById(root);
    if (!r) return;
    els.current = {
      hots: Array.from(r.querySelectorAll<HTMLElement>("[data-xe-hot]")),
      dot: r.querySelector<HTMLElement>("[data-xe-dot]"),
      line: r.querySelector<SVGLineElement>("[data-xe-line]"),
    };
  }, [root]);

  const toScreen = (v: THREE.Vector3, camera: THREE.Camera) => {
    v.project(camera);
    return { x: ((v.x + 1) / 2) * size.width, y: ((1 - v.y) / 2) * size.height, behind: v.z > 1 };
  };

  useFrame(({ camera }) => {
    const st = storyState(stage.p, count);
    const info = infosRef.current[st.index];
    const { hots, dot, line } = els.current;
    camera.updateMatrixWorld();
    const settled = Math.abs(st.c - st.index) < 0.08;

    for (const el of hots) {
      const name = el.dataset.xeHot as PartName;
      let o = 0;
      if (info?.ready && settled && !stage.narrow && PART_ORDER.includes(name)) {
        o = info.opacity * info.appear * (1 - smooth(0.22, 0.3, st.local)) * (1 - st.close);
        if (stage.pinned) o = stage.pinned === name ? 1 : 0.35;
      }
      let x: number | null = null;
      let y: number | null = null;
      if (o > 0.01) {
        const s = toScreen(partWorld(info, name, tmp), camera);
        if (s.behind) o = 0;
        x = s.x;
        y = s.y;
      }
      placeOverlay(el, x, y, o);
    }

    let lo = 0;
    let dx: number | null = null;
    let dy: number | null = null;
    if (info?.ready && stage.annot > 0.01) {
      if (stage.pinned) partWorld(info, stage.pinned, tmp);
      else {
        // the dot follows the part the card is talking about (it swaps while the card is hidden)
        partWorld(info, st.part >= 0.5 ? "surface" : "frame", tmp2);
        tmp.copy(tmp2);
      }
      const s = toScreen(tmp, camera);
      if (!s.behind) {
        lo = stage.annot;
        dx = s.x;
        dy = s.y;
        if (line) placeLine(line, stage.card.x, stage.card.y, s.x, s.y);
      }
    }
    if (dot) placeOverlay(dot, dx, dy, lo);
    if (line) placeOverlay(line, null, null, lo * 0.9);
  });
  return null;
}

function ProgressReporter({ onProgress }: { onProgress: (p: number) => void }) {
  const { progress } = useProgress();
  useEffect(() => onProgress(progress), [progress, onProgress]);
  return null;
}

const makeInfos = (n: number): BoardInfo[] =>
  Array.from({ length: n }, () => ({ group: null, size: new THREE.Vector3(2, 1.45, 0.08), ready: false, appear: 0, opacity: 0 }));

export default function ShowroomCanvas({
  root,
  boards,
  mounted,
  tier,
  active,
  onReady,
  onProgress,
  onFail,
}: {
  /** id of the DOM stage that holds the hotspots / annotation elements */
  root: string;
  boards: ShowroomBoard[];
  /** boards with index < mounted are loaded (lazy, one ahead of the story) */
  mounted: number;
  tier: Exclude<DeviceTier, "none">;
  active: boolean;
  onReady: () => void;
  onProgress: (p: number) => void;
  onFail: () => void;
}) {
  const [dpr, setDpr] = useState<[number, number]>(dprForTier(tier));
  const infosRef = useRef<BoardInfo[]>(makeInfos(boards.length));
  const shadowTex = useShadowTexture();
  return (
    <Canvas
      aria-hidden
      frameloop={active ? "always" : "never"}
      dpr={dpr}
      camera={{ fov: FOV, near: 0.1, far: 80, position: [0, 0, 7] }}
      gl={{ antialias: tier !== "low", alpha: true, powerPreference: "high-performance" }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.1;
        gl.domElement.addEventListener("webglcontextlost", (e) => {
          e.preventDefault();
          onFail();
        });
      }}
    >
      <PerformanceMonitor onDecline={() => setDpr([1, 1])} onIncline={() => setDpr(dprForTier(tier))} />
      <ProgressReporter onProgress={onProgress} />
      <Lighting quality={tier} />
      {/* faint blue-violet rim from behind for separation from the light backdrop */}
      <directionalLight position={[-3, 2.5, -4]} intensity={0.55} color="#c4bbff" />
      <KeyFollow />
      <CameraRig infosRef={infosRef} count={boards.length} />
      {boards.slice(0, mounted).map((b, i) => (
        <Board
          key={b.slug}
          board={b}
          index={i}
          count={boards.length}
          infosRef={infosRef}
          shadowTex={shadowTex}
          onReady={i === 0 ? onReady : () => {}}
          onFail={i === 0 ? onFail : () => {}}
        />
      ))}
      <Projector root={root} infosRef={infosRef} count={boards.length} />
    </Canvas>
  );
}
