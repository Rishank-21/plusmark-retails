"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { getDeviceTier, prefersReducedMotion, type DeviceTier } from "@/components/three/capabilities";
import { clamp } from "@/lib/utils";
import { initialSceneScroll, pinProgress, smooth, type SceneScroll } from "./scroll";
import type { SceneBoard } from "./SceneCanvas";

const SceneCanvas = dynamic(() => import("./SceneCanvas"), { ssr: false });

/**
 * Page-wide WebGL layer for the design D home. A fixed, transparent canvas sits behind the
 * content; its boards are choreographed by scroll: floating cluster in the hero → they fly
 * onto a turntable ring in the "collection" section, which the scroll then rotates.
 * Falls back to plain images (see .xd-fallback) when WebGL is unavailable or too slow.
 */
export function ExperienceScene({ boards }: { boards: SceneBoard[] }) {
  const wrap = useRef<HTMLDivElement>(null);
  const scroll = useRef<SceneScroll>(initialSceneScroll());
  const [tier, setTier] = useState<DeviceTier | null>(null);
  const [active, setActive] = useState(true);

  useEffect(() => {
    const t = getDeviceTier();
    setTier(t);
    if (t === "none") document.documentElement.dataset.xd3d = "off";
    scroll.current.reduced = prefersReducedMotion();
  }, []);

  useEffect(() => {
    if (!tier || tier === "none") return;
    const hero = document.getElementById("xd-hero");
    const orbit = document.getElementById("xd-orbit");
    let raf = 0;
    const update = () => {
      raf = 0;
      const s = scroll.current;
      const vh = window.innerHeight;
      s.narrow = window.innerWidth < 768;
      if (hero) {
        const r = hero.getBoundingClientRect();
        s.heroExit = clamp(-r.top / Math.max(1, r.height));
      }
      if (orbit) {
        const r = orbit.getBoundingClientRect();
        s.orbitEnter = clamp((vh - r.top) / vh);
        s.orbit = pinProgress(orbit);
        // fade out as the ring section leaves the screen
        s.visible = 1 - smooth(0, 0.7, (vh - r.bottom) / vh);
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
  }, [tier]);

  useEffect(() => () => void delete document.documentElement.dataset.xd3d, []);

  if (!tier || tier === "none") return null;
  return (
    <div ref={wrap} aria-hidden className="pointer-events-none fixed inset-0 z-0 transition-opacity duration-300">
      <SceneCanvas
        boards={boards}
        scroll={scroll}
        tier={tier}
        active={active}
        onReady={() => (document.documentElement.dataset.xd3d = "on")}
      />
    </div>
  );
}
