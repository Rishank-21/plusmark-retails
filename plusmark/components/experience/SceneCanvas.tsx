"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { PerformanceMonitor, useProgress } from "@react-three/drei";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Lighting } from "@/components/three/Lighting";
import { ProductModel } from "@/components/three/ProductModel";
import { ModelErrorBoundary } from "@/components/three/ModelErrorBoundary";
import { dprForTier, type DeviceTier } from "@/components/three/capabilities";
import { ANCHORS, lerp, sceneInput, showroomState, smooth, type AnchorName, type SceneScroll, type Slot } from "./scroll";

export interface SceneBoard {
  slug: string;
  model: string;
  /** part of the board the camera closes in on during this product's detail beat */
  detail: AnchorName;
}

interface Pose {
  x: number;
  y: number;
  z: number;
  ry: number;
  rx: number;
  s: number;
  o: number;
}

/** Per-board runtime info shared between the boards, the camera and the DOM anchor projector. */
interface BoardInfo {
  group: THREE.Group | null;
  size: THREE.Vector3;
  appear: number;
  ready: boolean;
  opacity: number;
}

const CAM_Z = 7;
const FOV = 30;
const VIEW_H = 2 * CAM_Z * Math.tan(THREE.MathUtils.degToRad(FOV / 2));
/** Lean of the hero board towards a hovered hotspot (frame / corner / surface). */
const HOTSPOT_LEAN: Record<AnchorName, number> = { frame: 0.06, corner: -0.14, surface: 0.03 };
const HOTSPOT_ORDER: AnchorName[] = ["frame", "surface", "corner"];

/** Viewport-fraction slot → world position on the z = 0 plane (for the resting camera). */
function slotToWorld(slot: Slot, aspect: number) {
  const W = VIEW_H * aspect;
  return { x: (slot.cx - 0.5) * W, y: (0.5 - slot.cy) * VIEW_H, w: slot.w * W, h: slot.h * VIEW_H };
}

const tmp = new THREE.Vector3();

function anchorWorld(info: BoardInfo, name: AnchorName, out: THREE.Vector3) {
  const a = ANCHORS[name];
  out.set(a[0] * info.size.x, a[1] * info.size.y, a[2] * info.size.z);
  if (!info.group) return out;
  info.group.updateMatrixWorld(true);
  return info.group.localToWorld(out);
}

/** DOM writes for anchor elements (kept out of the frame loop body). */
function placeAnchor(el: HTMLElement, x: number, y: number) {
  el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
}
function showAnchor(el: HTMLElement, o: number) {
  el.style.opacity = o.toFixed(3);
  el.style.visibility = o > 0.02 ? "visible" : "hidden";
  const on = o > 0.55 ? "1" : "0";
  if (el.dataset.on !== on) el.dataset.on = on;
}

const makeInfos = (n: number): BoardInfo[] =>
  Array.from({ length: n }, () => ({ group: null, size: new THREE.Vector3(2, 1.45, 0.08), appear: 0, ready: false, opacity: 0 }));

/** Soft radial texture for the contact shadow under each board (no shadow maps needed). */
function useShadowTexture() {
  const tex = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = c.height = 128;
    const g = c.getContext("2d")!;
    const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    grad.addColorStop(0, "rgba(27,23,64,0.55)");
    grad.addColorStop(0.45, "rgba(27,23,64,0.22)");
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
  scroll,
  infosRef,
  shadowTex,
  onFirstReady,
  onFail,
}: {
  board: SceneBoard;
  index: number;
  count: number;
  scroll: React.RefObject<SceneScroll>;
  infosRef: React.RefObject<BoardInfo[]>;
  shadowTex: THREE.Texture;
  onFirstReady: () => void;
  onFail: () => void;
}) {
  const group = useRef<THREE.Group>(null);
  const shadow = useRef<THREE.Mesh>(null);
  const shadowMat = useRef<THREE.MeshBasicMaterial>(null);
  const pose = useRef<Pose | null>(null);
  const opacityRef = useRef(0);
  const aspect = useThree((s) => s.size.width / Math.max(1, s.size.height));

  useFrame(({ clock }, dt) => {
    const g = group.current;
    const s = scroll.current;
    const info = infosRef.current[index];
    if (!g || !s || !info) return;
    info.group = g;
    const t = clock.elapsedTime;
    const idle = s.reduced ? 0 : 1;
    const step = Math.min(dt, 0.1);
    if (info.ready) info.appear = Math.min(1, info.appear + step / 0.9);

    const st = showroomState(s.orbit, count);
    const w = smooth(0, 1, s.orbitEnter);
    const i = Math.min(count - 1, Math.floor(st.c + 1e-4));
    // this board's own story beat: 0 = three-quarter overview, 1 = turned to face you
    const own = index < i ? 1 : index > i ? 0 : smooth(0, 0.3, st.local);
    const heroS = slotToWorld(s.heroSlot, aspect);
    const showS = slotToWorld(s.orbitSlot, aspect);
    const slot = {
      x: lerp(heroS.x, showS.x, w),
      y: lerp(heroS.y, showS.y, w),
      w: lerp(heroS.w, showS.w, w),
      h: lerp(heroS.h, showS.h, w),
    };
    const fit = Math.min(slot.w / info.size.x, slot.h / info.size.y) * 0.98;

    // distance from focus: 0 = hero of the frame, >0 = waiting in depth, <0 = leaving
    const d = index - st.c;
    const ad = Math.min(1.4, Math.abs(d));
    const lean = index === 0 && sceneInput.hotspot >= 0 ? HOTSPOT_LEAN[HOTSPOT_ORDER[sceneInput.hotspot]] ?? 0 : 0;
    const focusDrag = Math.abs(d) < 0.5 ? sceneInput.dragRY : 0;
    const target: Pose = {
      x: slot.x + (d > 0 ? d * 1.9 : d * 1.5),
      y: slot.y + Math.sin(t * 0.55 + index * 1.3) * 0.03 * idle - ad * 0.1,
      z: -ad * 3.2,
      ry:
        lerp(-0.36, lerp(-0.5, -0.14, own), w) +
        (d > 0 ? -d * 0.75 : d * 0.6) +
        Math.sin(t * 0.3 + index) * 0.015 * idle +
        lean +
        focusDrag,
      rx: 0.03 + Math.sin(t * 0.4 + index * 2) * 0.01 * idle,
      s: fit * (1 - Math.min(1, ad) * 0.16) * (0.94 + 0.06 * info.appear),
      o: (1 - smooth(0.05, 0.9, ad)) * info.appear,
    };

    // critically damped follow → no jumps even on fast scrolls
    const k = 1 - Math.exp(-step * 4.2);
    const kr = sceneInput.dragging ? 1 - Math.exp(-step * 14) : k;
    const p = (pose.current ??= { ...target });
    p.x += (target.x - p.x) * k;
    p.y += (target.y - p.y) * k;
    p.z += (target.z - p.z) * k;
    p.ry += (target.ry - p.ry) * kr;
    p.rx += (target.rx - p.rx) * k;
    p.s += (target.s - p.s) * k;
    p.o += (target.o - p.o) * k;

    const pointer = s.reduced ? 0 : 1;
    g.position.set(p.x, p.y, p.z);
    g.rotation.set(p.rx - s.py * 0.035 * pointer, p.ry + s.px * 0.07 * pointer, 0);
    g.scale.setScalar(Math.max(0.001, p.s));
    g.visible = p.o > 0.004;
    opacityRef.current = Math.min(1, p.o);
    info.opacity = p.o;

    // contact shadow breathes with the float height
    if (shadow.current && shadowMat.current) {
      shadow.current.position.set(0, -info.size.y / 2 - 0.12, 0.05);
      shadow.current.scale.set(info.size.x * 1.25, info.size.x * 0.34, 1);
      shadowMat.current.opacity = 0.42 * p.o * (0.9 - Math.sin(t * 0.55 + index * 1.3) * 0.08 * idle);
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
            opacityRef={opacityRef}
            onSize={(v) => infosRef.current[index]?.size.copy(v)}
            onReady={() => {
              const info = infosRef.current[index];
              if (info) info.ready = true;
              onFirstReady();
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
 * Camera: resting at z = 7, nudged by the pointer, leaning towards a hovered hotspot and
 * dollying in on the current product's detail beat so the part lands in the product slot.
 */
function CameraRig({ scroll, infosRef, boards }: { scroll: React.RefObject<SceneScroll>; infosRef: React.RefObject<BoardInfo[]>; boards: SceneBoard[] }) {
  const aspect = useThree((s) => s.size.width / Math.max(1, s.size.height));
  const a = useMemo(() => new THREE.Vector3(), []);
  const look = useMemo(() => new THREE.Vector3(), []);
  useFrame(({ camera }, dt) => {
    const s = scroll.current;
    if (!s) return;
    const k = 1 - Math.exp(-Math.min(dt, 0.1) * 3);
    const pointer = s.reduced ? 0 : 1;
    const bx = s.px * 0.12 * pointer;
    const by = -s.py * 0.08 * pointer;
    let tx = bx;
    let ty = by;
    let tz = CAM_Z;

    const st = showroomState(s.orbit, boards.length);
    const w = smooth(0.6, 1, s.orbitEnter);
    const list = infosRef.current;
    const focus = list[st.index];
    const detail = st.detail * w * (s.narrow ? 0.6 : 1) * (s.reduced ? 0.5 : 1);
    if (focus?.ready && detail > 0.001) {
      anchorWorld(focus, boards[st.index].detail, a);
      const S = slotToWorld(s.orbitSlot, aspect);
      const z = CAM_Z - 2.4 * detail;
      const dist = z - a.z;
      tx = lerp(bx, a.x - S.x * (dist / CAM_Z), detail);
      ty = lerp(by, a.y - S.y * (dist / CAM_Z), detail);
      tz = z;
    } else if (sceneInput.hotspot >= 0 && list[0]?.ready && s.heroExit < 0.3) {
      // subtle move towards the hovered feature
      anchorWorld(list[0], HOTSPOT_ORDER[sceneInput.hotspot], a);
      tx = lerp(bx, a.x * 0.35, 0.3);
      ty = lerp(by, a.y * 0.35, 0.3);
      tz = CAM_Z - 0.35;
    }
    camera.position.x += (tx - camera.position.x) * k;
    camera.position.y += (ty - camera.position.y) * k;
    camera.position.z += (tz - camera.position.z) * k;
    // look straight ahead (minus the pointer nudge) so the slot mapping stays true
    look.set(camera.position.x - bx * 0.6, camera.position.y - by * 0.6, 0);
    camera.lookAt(look);
  });
  return null;
}

/** Soft key that trails the camera so highlights slide across the aluminium as you move. */
function KeyFollow() {
  const light = useRef<THREE.DirectionalLight>(null);
  useFrame(({ camera }) => {
    light.current?.position.set(camera.position.x * 0.8 + 2.5, 3.5 + camera.position.y * 0.5, 6);
  });
  return <directionalLight ref={light} intensity={0.35} color="#f6f4ff" />;
}

/**
 * Projects 3D anchor points on the boards to screen space and positions the DOM hotspots /
 * annotations ([data-xd-anchor]) there, so the labels stay glued to the product.
 */
function AnchorProjector({ scroll, infosRef, count }: { scroll: React.RefObject<SceneScroll>; infosRef: React.RefObject<BoardInfo[]>; count: number }) {
  const els = useRef<HTMLElement[]>([]);
  const size = useThree((s) => s.size);
  useEffect(() => {
    els.current = Array.from(document.querySelectorAll<HTMLElement>("[data-xd-anchor]"));
  }, []);
  useFrame(({ camera }) => {
    const s = scroll.current;
    if (!s || !els.current.length) return;
    camera.updateMatrixWorld();
    const st = showroomState(s.orbit, count);
    const showroomIn = smooth(0.85, 1, s.orbitEnter);
    for (const el of els.current) {
      const b = Number(el.dataset.xdBoard ?? 0);
      const info = infosRef.current[b];
      const name = el.dataset.xdAnchor as AnchorName;
      let o = 0;
      if (info?.ready && ANCHORS[name]) {
        if (el.dataset.xdKind === "hotspot") o = s.narrow ? 0 : info.opacity * info.appear * (1 - smooth(0.02, 0.18, s.heroExit));
        else o = s.narrow ? 0 : b === st.index ? st.detail * showroomIn * s.visible : 0;
      }
      if (o > 0.01) {
        anchorWorld(info, name, tmp).project(camera);
        if (tmp.z > 1) o = 0;
        const x = ((tmp.x + 1) / 2) * size.width;
        const y = ((1 - tmp.y) / 2) * size.height;
        placeAnchor(el, x, y);
      }
      showAnchor(el, o);
    }
  });
  return null;
}

/** Reports GLB download progress to the DOM loader (no React state outside the canvas). */
function ProgressReporter({ onProgress }: { onProgress: (p: number) => void }) {
  const { progress } = useProgress();
  useEffect(() => onProgress(progress), [progress, onProgress]);
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
  onProgress,
  onFail,
}: {
  boards: SceneBoard[];
  scroll: React.RefObject<SceneScroll>;
  tier: Exclude<DeviceTier, "none">;
  active: boolean;
  /** first product model is on screen */
  onReady: () => void;
  onProgress: (p: number) => void;
  /** the hero model failed or WebGL was lost → show product photos instead */
  onFail: () => void;
}) {
  const [dpr, setDpr] = useState<[number, number]>(dprForTier(tier));
  const infosRef = useRef<BoardInfo[]>(makeInfos(boards.length));
  const shadowTex = useShadowTexture();
  return (
    <Canvas
      aria-hidden
      frameloop="demand"
      dpr={dpr}
      camera={{ fov: FOV, near: 0.1, far: 60, position: [0, 0, CAM_Z] }}
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
      <Driver scroll={scroll} active={active} />
      <ProgressReporter onProgress={onProgress} />
      <Lighting quality={tier} />
      {/* faint blue-violet rim from behind: separation from the white page, no glow */}
      <directionalLight position={[-3, 2.5, -4]} intensity={0.55} color="#c4bbff" />
      <KeyFollow />
      <CameraRig scroll={scroll} infosRef={infosRef} boards={boards} />
      {boards.map((b, i) => (
        <Board
          key={b.slug}
          board={b}
          index={i}
          count={boards.length}
          scroll={scroll}
          infosRef={infosRef}
          shadowTex={shadowTex}
          onFirstReady={i === 0 ? onReady : () => {}}
          onFail={i === 0 ? onFail : () => {}}
        />
      ))}
      <AnchorProjector scroll={scroll} infosRef={infosRef} count={boards.length} />
    </Canvas>
  );
}
