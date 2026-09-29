"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { Move3d } from "lucide-react";
import type { FeaturedProduct } from "@/data/featured";
import { getDeviceTier, prefersReducedMotion, type DeviceTier } from "@/components/three/capabilities";
import { preloadModel } from "@/components/three/ProductModel";
import { createHeroState, type ModelStatus } from "./heroState";
import { HeroProgress } from "./HeroProgress";
import { cn } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const Hero3D = dynamic(() => import("./Hero3D"), { ssr: false });

/** Scroll distance per product, in svh. A little more room per product keeps the
 *  eased transitions relaxed instead of snapping between states. */
const PER_PRODUCT = 100;

/** Scroll progress (0–1) at which product i sits in its hold — the snap targets. */
const holdProgress = (i: number, n: number) => (i === 0 ? 0 : Math.min(1, (i + 0.5 + 0.12) / n));

const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};
/** Quintic ease-in-out — gentler acceleration/deceleration than the previous cubic. */
const easeInOut = (t: number) => (t < 0.5 ? 16 * t * t * t * t * t : 1 - Math.pow(-2 * t + 2, 5) / 2);

/** Map linear scroll progress to an eased product index with a hold on each product. */
function progressToIndex(p: number, n: number) {
  const raw = Math.min(n - 1, Math.max(0, p * n - 0.5));
  const base = Math.floor(raw);
  const f = raw - base;
  // Slightly longer hold (0.28) so each product settles before the next eases in.
  const eased = easeInOut(Math.min(1, Math.max(0, (f - 0.28) / 0.52)));
  return Math.min(n - 1, base + eased);
}

interface HeroExperienceProps {
  products: FeaturedProduct[];
  /** Server-rendered text slots — each child carries data-hero-idx. */
  heads: React.ReactNode;
  bodies: React.ReactNode;
  specs: React.ReactNode;
  title: React.ReactNode;
}

export function HeroExperience({ products, heads, bodies, specs, title }: HeroExperienceProps) {
  const n = products.length;
  const root = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const state = useRef(createHeroState());
  const [tier, setTier] = useState<DeviceTier | "pending">("pending");
  const [activeIndex, setActiveIndex] = useState(0);
  const [status, setStatus] = useState<ModelStatus[]>(() => products.map(() => "idle"));
  const [inView, setInView] = useState(true);
  const [interacted, setInteracted] = useState(false);
  const activeRef = useRef(0);

  useEffect(() => {
    state.current.reduced = prefersReducedMotion();
    setTier(getDeviceTier());
  }, []);

  const onStatus = useCallback((i: number, s: "ready" | "error") => {
    setStatus((prev) => (prev[i] === s ? prev : prev.map((v, k) => (k === i ? s : v))));
  }, []);

  // Pause rendering when the hero is off-screen
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { rootMargin: "100px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Apply the continuous index to every synchronised DOM layer.
  const apply = useCallback(
    (e: number) => {
      state.current.e = e;
      const el = root.current;
      if (!el) return;
      el.querySelectorAll<HTMLElement>("[data-hero-idx]").forEach((node) => {
        const i = Number(node.dataset.heroIdx);
        const d = e - i;
        const ad = Math.abs(d);
        const isImg = node.dataset.heroImg !== undefined;
        const op = isImg ? 1 - smooth(0.15, 0.6, ad) : 1 - smooth(0.08, 0.42, ad);
        node.style.opacity = String(op);
        node.style.visibility = op < 0.01 ? "hidden" : "visible";
        if (!isImg) node.style.transform = `translate3d(0, ${(-d * 22).toFixed(2)}px, 0)`;
        else node.style.transform = `translate3d(${(-d * 18).toFixed(2)}%, 0, 0) scale(${1 - Math.min(ad, 1) * 0.12})`;
      });
      if (barRef.current) barRef.current.style.transform = `scaleX(${n > 1 ? e / (n - 1) : 1})`;
      const a = Math.round(e);
      if (a !== activeRef.current) {
        activeRef.current = a;
        setActiveIndex(a);
      }
    },
    [n],
  );

  /** Snap bookkeeping: the product we last settled on, and when the current scroll gesture began. */
  const snapState = useRef({ settled: 0, moving: false, moveStart: 0, force: false });

  useGSAP(
    () => {
      const proxy = { p: 0 };
      const reduced = prefersReducedMotion();
      const targets = [...Array.from({ length: n }, (_, i) => holdProgress(i, n)), 1];
      const nearest = (v: number) =>
        targets.reduce((best, t, k) => (Math.abs(t - v) < Math.abs(targets[best] - v) ? k : best), 0);
      const snap = snapState.current;

      gsap.to(proxy, {
        p: 1,
        ease: "none",
        onUpdate: () => apply(progressToIndex(proxy.p, n)),
        scrollTrigger: {
          trigger: root.current,
          start: "top top",
          end: "bottom bottom",
          // Heavier scrub smoothing: the boards glide instead of tracking every wheel tick.
          scrub: reduced ? true : 1.8,
          invalidateOnRefresh: true,
          onUpdate: () => {
            if (!snap.moving) {
              snap.moving = true;
              snap.moveStart = performance.now();
            }
          },
          // Settle on one product at a time. A quick flick that would jump over a product is
          // limited to the neighbouring one; slow scrolling / scrollbar drags / the progress
          // buttons can still move further.
          snap: reduced
            ? undefined
            : {
                snapTo: (value: number) => {
                  let k = nearest(value);
                  const quick = performance.now() - snap.moveStart < 900;
                  if (!snap.force && quick && Math.abs(k - snap.settled) > 1) {
                    k = snap.settled + Math.sign(k - snap.settled);
                  }
                  return targets[k];
                },
                duration: { min: 0.45, max: 1.1 },
                delay: 0.12,
                ease: "power3.inOut",
                inertia: false,
                onComplete: (self) => {
                  snap.settled = nearest(self.progress);
                  snap.moving = false;
                  snap.force = false;
                },
              },
        },
      });
      apply(0);
    },
    { scope: root, dependencies: [apply, n] },
  );

  // Accessibility: only the active product's text is exposed / focusable.
  useEffect(() => {
    root.current?.querySelectorAll<HTMLElement>("[data-hero-idx]:not([data-hero-img])").forEach((node) => {
      const on = Number(node.dataset.heroIdx) === activeIndex;
      node.inert = !on;
      if (on) node.removeAttribute("aria-hidden");
      else node.setAttribute("aria-hidden", "true");
    });
  }, [activeIndex]);

  // Preload the model after the next one once the current is visible.
  useEffect(() => {
    if (tier === "pending" || tier === "none") return;
    preloadModel(products[activeIndex + 1]?.model);
  }, [activeIndex, tier, products]);

  const mounted = useMemo(
    () => [activeIndex - 1, activeIndex, activeIndex + 1].filter((i) => i >= 0 && i < n),
    [activeIndex, n],
  );

  /* ---------------- pointer / touch interaction ---------------- */
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const pinchStart = useRef<{ dist: number; zoom: number } | null>(null);

  const onPointerDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest("a,button,input,select,textarea")) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const s = state.current;
    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      pinchStart.current = { dist: Math.hypot(a.x - b.x, a.y - b.y), zoom: s.zoomTarget };
    }
    s.dragging = true;
    s.yawVel = 0;
    s.pitchVel = 0;
    s.lastInteract = performance.now();
    if (!interacted) setInteracted(true);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const s = state.current;
    const el = stage.current;
    if (el && e.pointerType === "mouse") {
      const r = el.getBoundingClientRect();
      s.px = ((e.clientX - r.left) / r.width) * 2 - 1;
      s.py = ((e.clientY - r.top) / r.height) * 2 - 1;
    }
    const prev = pointers.current.get(e.pointerId);
    if (!prev) return;
    if (pointers.current.size === 1) {
      // capture only once the gesture is clearly horizontal so vertical swipes still scroll
      if (!el?.hasPointerCapture(e.pointerId) && Math.abs(e.clientX - prev.x) > 4) {
        el?.setPointerCapture(e.pointerId);
      }
      const dx = e.clientX - prev.x;
      const dy = e.clientY - prev.y;
      const k = e.pointerType === "mouse" ? 0.0075 : 0.011;
      s.yaw += dx * k;
      s.yawVel = dx * k;
      if (e.pointerType === "mouse") {
        s.pitch += dy * k * 0.5;
        s.pitchVel = dy * k * 0.5;
      }
    }
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.current.size === 2 && pinchStart.current) {
      const [a, b] = [...pointers.current.values()];
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      s.zoomTarget = Math.min(1.6, Math.max(0.85, pinchStart.current.zoom * (dist / pinchStart.current.dist)));
    }
    s.lastInteract = performance.now();
  };

  const onPointerUp = (e: React.PointerEvent) => {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size < 2) pinchStart.current = null;
    if (pointers.current.size === 0) {
      state.current.dragging = false;
      state.current.lastInteract = performance.now();
    }
  };

  const onPointerLeave = (e: React.PointerEvent) => {
    if (e.pointerType === "mouse") {
      state.current.px = 0;
      state.current.py = 0;
    }
  };

  // ctrl / ⌘ + wheel (and trackpad pinch) zooms; plain wheel scrolls the page.
  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      const s = state.current;
      s.zoomTarget = Math.min(1.6, Math.max(0.85, s.zoomTarget * (1 - e.deltaY * 0.004)));
      s.lastInteract = performance.now();
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  const onKeyDown = (e: React.KeyboardEvent) => {
    const s = state.current;
    if (e.key === "ArrowLeft") s.yawVel = -0.06;
    else if (e.key === "ArrowRight") s.yawVel = 0.06;
    else if (e.key === "+" || e.key === "=") s.zoomTarget = Math.min(1.6, s.zoomTarget + 0.1);
    else if (e.key === "-") s.zoomTarget = Math.max(0.85, s.zoomTarget - 0.1);
    else if (e.key === "0") {
      s.yaw = 0;
      s.pitch = 0;
      s.zoomTarget = 1;
    } else return;
    e.preventDefault();
    s.lastInteract = performance.now();
  };

  const goTo = useCallback(
    (i: number) => {
      const el = root.current;
      if (!el) return;
      const top = el.getBoundingClientRect().top + window.scrollY;
      const dist = el.offsetHeight - window.innerHeight;
      const p = holdProgress(i, n);
      // explicit jump: don't let the one-step snap limit pull it back
      snapState.current.force = true;
      snapState.current.settled = i;
      window.scrollTo({ top: top + p * dist + 1, behavior: prefersReducedMotion() ? "auto" : "smooth" });
    },
    [n],
  );

  const use3D = tier !== "pending" && tier !== "none";
  const firstReady = status[0] === "ready";
  const loading = tier === "pending" || (use3D && status[activeIndex] === "idle" && !!products[activeIndex]?.model);
  // The still photo is only a fallback: never flash it while the 3D model is loading.
  // Show it only when WebGL is unavailable, the model failed, or the product has no model.
  const needsImage = (i: number) =>
    tier === "none" || status[i] === "error" || (tier !== "pending" && !products[i]?.model);

  // Newly shown fallback images need the current scroll-synced opacity/transform.
  useEffect(() => {
    apply(state.current.e);
  }, [tier, status, apply]);

  return (
    <section
      ref={root}
      aria-label="Featured Plusmark products"
      data-nav-overlay
      className="relative studio-bg"
      style={{ height: `calc(100svh + ${n * PER_PRODUCT}svh)` }}
    >
      <div
        ref={stage}
        className="sticky top-0 grid h-[100svh] w-full touch-pan-y select-none overflow-hidden
          grid-rows-[auto_auto_minmax(0,1fr)_auto_auto_auto] [grid-template-areas:'title'_'head'_'model'_'specs'_'body'_'progress']
          px-5 pb-4 pt-[96px]
          lg:grid-cols-[minmax(0,23rem)_minmax(0,1fr)_minmax(0,19rem)] lg:grid-rows-[auto_minmax(0,0.35fr)_auto_auto_1fr_auto] lg:gap-x-10 lg:px-[clamp(1.5rem,4vw,3.5rem)] lg:pb-6 lg:pt-[112px]
          lg:[grid-template-areas:'title_._.'_'._model_.'_'head_model_specs'_'body_model_specs'_'._model_.'_'progress_progress_progress']"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onPointerLeave={onPointerLeave}
      >
        {/* subtle grid + floor glow */}
        <div aria-hidden className="grid-lines pointer-events-none absolute inset-0 [mask-image:radial-gradient(70%_60%_at_50%_45%,black,transparent)]" />
        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-fog/70 to-transparent" />
        {/* soft brand-tinted studio glow behind the product */}
        <div aria-hidden className="aurora opacity-80" />
        <div aria-hidden className="pointer-events-none absolute left-1/2 top-1/2 size-[46rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/70 blur-[90px]" />

        {/* Model area: images underneath, canvas above */}
        <div
          role="img"
          aria-label={`Interactive 3D view of the ${products[activeIndex]?.name}. Drag to rotate; use arrow keys to rotate, plus and minus to zoom, 0 to reset.`}
          tabIndex={0}
          onKeyDown={onKeyDown}
          className="relative z-0 -mx-5 [grid-area:model] focus-visible:outline-offset-[-6px] lg:absolute lg:inset-0 lg:mx-0 lg:[grid-area:1/1/-1/-1]"
        >
          <div className="pointer-events-none absolute inset-0 lg:inset-x-[22%] lg:inset-y-[14%]">
            {products.map((p, i) =>
              (mounted.includes(i) || i === 0) && needsImage(i) ? (
                <div
                  key={p.slug}
                  data-hero-idx={i}
                  data-hero-img=""
                  className={cn(
                    "absolute inset-0 transition-[filter,opacity] duration-700",
                    use3D && status[i] === "ready" && "!opacity-0",
                  )}
                  style={{ opacity: i === 0 ? 1 : 0 }}
                >
                  <Image
                    src={p.fallbackImage}
                    alt={p.imageAlt}
                    fill
                    priority={i === 0}
                    sizes="(min-width: 1024px) 56vw, 100vw"
                    className="object-contain mix-blend-multiply"
                  />
                </div>
              ) : null,
            )}
          </div>

          {use3D && (
            <div className={cn("absolute inset-0 transition-opacity duration-1000", firstReady ? "opacity-100" : "opacity-0")}>
              <Hero3D
                products={products}
                state={state}
                mounted={mounted}
                tier={tier}
                active={inView}
                onStatus={onStatus}
              />
            </div>
          )}

          {/* Loading state */}
          <div
            aria-live="polite"
            className={cn(
              "pointer-events-none absolute inset-x-0 bottom-[8%] hidden justify-center transition-opacity duration-700 [.js_&]:flex",
              loading ? "opacity-100" : "opacity-0",
            )}
          >
            <div className="flex items-center gap-3 rounded-full bg-white/80 px-4 py-2 shadow-sm ring-1 ring-line backdrop-blur">
              <span className="font-display text-[0.7rem] font-bold tracking-[0.2em]">PLUSMARK</span>
              <span className="h-3 w-px bg-line" />
              <span className="font-mono text-[0.65rem] uppercase tracking-[0.14em] text-steel">
                {loading ? "Loading 3D Experience…" : "Ready"}
              </span>
              <span className="relative h-px w-12 overflow-hidden bg-line">
                <span className="absolute inset-y-0 left-0 w-1/2 animate-[heroload_1.2s_ease-in-out_infinite] bg-graphite" />
              </span>
            </div>
          </div>

          {use3D && firstReady && (
            <p
              aria-hidden
              className={cn(
                "pointer-events-none absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-2 font-mono text-[0.62rem] uppercase tracking-[0.16em] text-steel transition-opacity duration-700 lg:bottom-[12%]",
                interacted ? "opacity-0" : "opacity-100",
              )}
            >
              <Move3d className="size-3.5" /> Drag to rotate
            </p>
          )}
        </div>

        <div className="pointer-events-none relative z-10 [grid-area:title] lg:self-end">{title}</div>

        <div className="pointer-events-none relative z-10 grid [grid-area:head] lg:self-end [&>*]:[grid-area:1/1] [&>*]:self-end">{heads}</div>

        <div className="pointer-events-none relative z-10 grid [grid-area:body] [&>*]:[grid-area:1/1]">{bodies}</div>

        <div className="pointer-events-none relative z-10 grid [grid-area:specs] lg:self-center [&>*]:[grid-area:1/1]">{specs}</div>

        <div className="relative z-10 [grid-area:progress]">
          <HeroProgress products={products} active={activeIndex} barRef={barRef} onSelect={goTo} />
        </div>
      </div>
    </section>
  );
}
