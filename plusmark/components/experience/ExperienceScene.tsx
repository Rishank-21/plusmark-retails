"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import { getDeviceTier, prefersReducedMotion, type DeviceTier } from "@/components/three/capabilities";
import { ModelErrorBoundary } from "@/components/three/ModelErrorBoundary";
import { clamp } from "@/lib/utils";
import { initialSceneScroll, pinProgress, showroomState, smooth, type SceneScroll, type Slot } from "./scroll";
import type { SceneBoard } from "./SceneCanvas";

const SceneCanvas = dynamic(() => import("./SceneCanvas"), { ssr: false });

function measureSlot(el: HTMLElement | null, into: Slot) {
  if (!el) return;
  const r = el.getBoundingClientRect();
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  into.cx = (r.left + r.width / 2) / vw;
  into.cy = (r.top + r.height / 2) / vh;
  into.w = r.width / vw;
  into.h = r.height / vh;
}

const setState = (v: "loading" | "on" | "off") => (document.documentElement.dataset.xd3d = v);

/**
 * Page-wide spatial layers for the design D home, behind the content:
 *  1. a backdrop (grid, soft studio light, low-opacity type) that tracks the product slot,
 *  2. a fixed, transparent WebGL canvas whose boards are composed into DOM "slots"
 *     (#xd-hero-stage, #xd-orbit-stage) and choreographed by scroll.
 * Falls back to real product photos (.xd-poster / .xd-fallback) when WebGL is unavailable,
 * too slow, still loading, or a model fails.
 */
export function ExperienceScene({ boards }: { boards: SceneBoard[] }) {
  const wrap = useRef<HTMLDivElement>(null);
  const backdrop = useRef<HTMLDivElement>(null);
  const indexEl = useRef<HTMLSpanElement>(null);
  const scroll = useRef<SceneScroll>(initialSceneScroll());
  const [tier, setTier] = useState<DeviceTier | null>(null);
  const [failed, setFailed] = useState(false);
  const [active, setActive] = useState(true);

  useEffect(() => {
    const t = getDeviceTier();
    setTier(t);
    setState(t === "none" ? "off" : "loading");
    scroll.current.reduced = prefersReducedMotion();
  }, []);

  useEffect(() => {
    const hero = document.getElementById("xd-hero");
    const orbit = document.getElementById("xd-orbit");
    const heroStage = document.getElementById("xd-hero-stage");
    const orbitStage = document.getElementById("xd-orbit-stage");
    let raf = 0;
    let lastIndex = -1;
    const update = () => {
      raf = 0;
      const s = scroll.current;
      const vh = window.innerHeight;
      s.narrow = window.innerWidth < 768;
      if (hero) {
        const r = hero.getBoundingClientRect();
        s.heroExit = clamp(-r.top / Math.max(1, r.height));
      }
      measureSlot(heroStage, s.heroSlot);
      measureSlot(orbitStage, s.orbitSlot);
      if (orbit) {
        const r = orbit.getBoundingClientRect();
        s.orbitEnter = clamp((vh - r.top) / vh);
        s.orbit = pinProgress(orbit);
        // fade out as the showroom section leaves the screen
        s.visible = 1 - smooth(0, 0.7, (vh - r.bottom) / vh);
      }
      const b = backdrop.current;
      if (b) {
        const w = smooth(0, 1, s.orbitEnter);
        const par = s.reduced ? 0 : 1;
        b.style.setProperty("--xd-hero", String(1 - smooth(0, 0.8, s.heroExit)));
        b.style.setProperty("--xd-show", String(w * s.visible));
        b.style.setProperty("--xd-par", `${(-s.heroExit * 60 * par).toFixed(1)}px`);
        b.style.setProperty("--xd-hx", `${(s.heroSlot.cx * 100).toFixed(2)}%`);
        b.style.setProperty("--xd-hy", `${(s.heroSlot.cy * 100).toFixed(2)}%`);
        b.style.setProperty("--xd-sx", `${(s.orbitSlot.cx * 100).toFixed(2)}%`);
        b.style.setProperty("--xd-sy", `${(s.orbitSlot.cy * 100).toFixed(2)}%`);
        b.style.visibility = s.visible < 0.01 ? "hidden" : "visible";
        const idx = showroomState(s.orbit, Math.max(1, boards.length)).index;
        if (idx !== lastIndex && indexEl.current) {
          lastIndex = idx;
          indexEl.current.textContent = String(idx + 1).padStart(2, "0");
        }
      }
      if (wrap.current) {
        wrap.current.style.opacity = String(s.visible);
        wrap.current.style.visibility = s.visible < 0.01 ? "hidden" : "visible";
      }
      setActive((a) => (a === s.visible > 0.001 ? a : s.visible > 0.001));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    const onPointer = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      scroll.current.px = (e.clientX / window.innerWidth) * 2 - 1;
      scroll.current.py = (e.clientY / window.innerHeight) * 2 - 1;
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    window.addEventListener("pointermove", onPointer, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      window.removeEventListener("pointermove", onPointer);
      cancelAnimationFrame(raf);
    };
  }, [boards.length]);

  useEffect(() => () => void delete document.documentElement.dataset.xd3d, []);

  const onReady = useCallback(() => setState("on"), []);
  const onFail = useCallback(() => {
    setState("off");
    setFailed(true);
  }, []);
  const onProgress = useCallback((p: number) => {
    const pct = `${Math.round(p)}%`;
    document.querySelectorAll<HTMLElement>("[data-xd-progress]").forEach((el) => (el.textContent = pct));
    document.querySelectorAll<HTMLElement>("[data-xd-progress-bar]").forEach((el) => (el.style.transform = `scaleX(${p / 100})`));
  }, []);

  const show3d = tier && tier !== "none" && !failed;

  return (
    <>
      {/* Background layer: supports the product, stays below ~5% visual intensity */}
      <div ref={backdrop} aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0" style={{ opacity: "var(--xd-hero, 1)" }}>
          <div className="xd-backdrop-grid absolute inset-0" />
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(34% 42% at var(--xd-hx, 55%) var(--xd-hy, 52%), rgb(111 99 240 / 0.11), rgb(111 99 240 / 0.03) 55%, transparent 75%)",
            }}
          />
          <div className="absolute inset-x-0 top-[9%] -ml-[3vw]" style={{ transform: "translate3d(0, var(--xd-par, 0px), 0)" }}>
            <p className="xd-backdrop-type text-[17vw]">PLUSMARK</p>
          </div>
          <p
            className="xd-backdrop-type absolute bottom-[6%] right-[4vw] text-[3.2vw] !tracking-[0.4em]"
            style={{ transform: "translate3d(0, calc(var(--xd-par, 0px) * 0.5), 0)" }}
          >
            PRODUCT SYSTEM
          </p>
        </div>
        <div className="absolute inset-0" style={{ opacity: "var(--xd-show, 0)" }}>
          <div className="absolute inset-0 bg-[linear-gradient(180deg,#f8f7fd_0%,#f1effa_100%)]" />
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(32% 40% at var(--xd-sx, 62%) var(--xd-sy, 50%), rgb(255 255 255 / 0.95), rgb(111 99 240 / 0.07) 60%, transparent 80%)",
            }}
          />
          <span ref={indexEl} className="xd-backdrop-type absolute -bottom-[4vw] right-[2vw] text-[30vw] !tracking-[-0.04em]">
            01
          </span>
        </div>
      </div>

      {show3d && (
        <div ref={wrap} aria-hidden className="pointer-events-none fixed inset-0 z-0">
          <ModelErrorBoundary onError={onFail}>
            <SceneCanvas
              boards={boards}
              scroll={scroll}
              tier={tier}
              active={active}
              onReady={onReady}
              onProgress={onProgress}
              onFail={onFail}
            />
          </ModelErrorBoundary>
        </div>
      )}
    </>
  );
}
