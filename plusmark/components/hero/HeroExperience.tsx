"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { gsap } from "gsap";
import { ChevronLeft, ChevronRight, Move3d } from "lucide-react";
import type { FeaturedProduct } from "@/data/featured";
import { getDeviceTier, prefersReducedMotion, type DeviceTier } from "@/components/three/capabilities";
import { preloadModel } from "@/components/three/ProductModel";
import { createHeroState, slotOffset, wrapIndex, type ModelStatus } from "./heroState";
import { HeroProgress } from "./HeroProgress";
import { cn } from "@/lib/utils";

const Hero3D = dynamic(() => import("./Hero3D"), { ssr: false });

/**
 * How long each product rests on show, counted from the moment its board has settled, before the
 * hero moves on to the next one (ms). Counting from the settle (not the start of the transition)
 * keeps the rhythm even on slow devices, where a transition can take longer than planned.
 */
const AUTO_ADVANCE_MS = 5000;
/** Board-to-board transition (s): the timed hand-over, and a step from the arrows or dots. */
const AUTO_DURATION = 1.6;
const STEP_DURATION = 1.15;

const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

/**
 * Progress-bar fill for carousel position `e`: 0 → 1 across the products, then a smooth rewind
 * while the last product hands over to the first (and the reverse when stepping back from the first).
 */
function barFill(e: number, n: number) {
  if (n < 2) return 1;
  const p = ((e % n) + n) % n;
  return p <= n - 1 ? p / (n - 1) : n - p;
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
  /** Keyboard focus is inside the hero: the carousel holds still and the counter announces changes. */
  const [kbFocus, setKbFocus] = useState(false);
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

  // Apply the carousel position to every synchronised DOM layer.
  const apply = useCallback(
    (e: number) => {
      state.current.e = e;
      const el = root.current;
      if (!el) return;
      // Reduced motion: layers cross-fade in place instead of sliding.
      const move = state.current.reduced ? 0 : 1;
      el.querySelectorAll<HTMLElement>("[data-hero-idx]").forEach((node) => {
        const i = Number(node.dataset.heroIdx);
        const d = slotOffset(e, i, n);
        const ad = Math.abs(d);
        const isImg = node.dataset.heroImg !== undefined;
        const op = isImg ? 1 - smooth(0.15, 0.6, ad) : 1 - smooth(0.08, 0.42, ad);
        node.style.opacity = String(op);
        node.style.visibility = op < 0.01 ? "hidden" : "visible";
        if (!isImg) node.style.transform = `translate3d(0, ${(-d * 22 * move).toFixed(2)}px, 0)`;
        else
          node.style.transform = `translate3d(${(-d * 18 * move).toFixed(2)}%, 0, 0) scale(${1 - Math.min(ad, 1) * 0.12 * move})`;
      });
      if (barRef.current) barRef.current.style.transform = `scaleX(${barFill(e, n)})`;
      const a = wrapIndex(e, n);
      if (a !== activeRef.current) {
        activeRef.current = a;
        setActiveIndex(a);
      }
    },
    [n],
  );

  /* ---------------- timed carousel ---------------- */
  // The position is animated over time, never by page scroll: the hero is an ordinary 100svh
  // section, so a vertical scroll goes straight on to the next section.
  const carousel = useRef({
    /** Tweened position (see HeroState.e). */
    pos: { e: 0 },
    /** Where the carousel is heading: an integer that keeps counting, so the loop never rewinds. */
    target: 0,
    timer: undefined as number | undefined,
    /** Reasons to hold the product on show; the countdown only runs while none of them applies. */
    hold: { offscreen: false, hidden: false, loading: true, dragging: false, focus: false },
    advance: () => {},
  });

  /**
   * Restart the countdown to the next automatic change, so it is always a full interval away.
   * Nothing is counted while a transition runs: its completion starts the countdown.
   */
  const schedule = useCallback(() => {
    const c = carousel.current;
    window.clearTimeout(c.timer);
    const h = c.hold;
    if (n < 2 || h.offscreen || h.hidden || h.loading || h.dragging || h.focus) return;
    if (gsap.isTweening(c.pos)) return;
    c.timer = window.setTimeout(() => c.advance(), AUTO_ADVANCE_MS);
  }, [n]);

  const moveTo = useCallback(
    (to: number, auto = false) => {
      const c = carousel.current;
      const p = c.pos;
      window.clearTimeout(c.timer);
      // A click during a transition carries on at speed instead of easing in again.
      const moving = gsap.isTweening(p);
      const steps = Math.abs(to - p.e);
      c.target = to;
      gsap.to(p, {
        e: to,
        duration: state.current.reduced
          ? 0.7
          : auto
            ? AUTO_DURATION
            : Math.min(2, STEP_DURATION + 0.2 * Math.max(0, steps - 1)),
        ease: moving ? "power2.out" : "power2.inOut",
        overwrite: true,
        onUpdate: () => apply(p.e),
        onComplete: schedule,
      });
    },
    [apply, schedule],
  );

  useEffect(() => {
    const c = carousel.current;
    c.advance = () => moveTo(c.target + 1, true);
  }, [moveTo]);

  /** Arrow buttons: the board waiting on the left (previous) or on the right (next). */
  const step = useCallback((dir: -1 | 1) => moveTo(carousel.current.target + dir), [moveTo]);

  /** Progress dots: the shortest way round the loop to product i. */
  const goTo = useCallback(
    (i: number) => {
      const c = carousel.current;
      let delta = (((i - wrapIndex(c.target, n)) % n) + n) % n;
      if (delta > n / 2) delta -= n;
      if (delta) moveTo(c.target + delta);
      else schedule();
    },
    [moveTo, schedule, n],
  );

  // Hold while the hero is off-screen or the tab is hidden; the full interval restarts on return.
  useEffect(() => {
    carousel.current.hold.offscreen = !inView;
    schedule();
  }, [inView, schedule]);

  useEffect(() => {
    const onVisibility = () => {
      carousel.current.hold.hidden = document.visibilityState === "hidden";
      schedule();
    };
    onVisibility();
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [schedule]);

  // Keyboard focus inside the hero holds the carousel, so content doesn't change under the user,
  // and lets the counter announce changes. Focus from a mouse click on a control doesn't hold it.
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const onFocusIn = (e: FocusEvent) => {
      let keyboard = false;
      try {
        keyboard = (e.target as Element).matches(":focus-visible");
      } catch {
        /* :focus-visible unsupported */
      }
      carousel.current.hold.focus = keyboard;
      setKbFocus(keyboard);
      schedule();
    };
    const onFocusOut = (e: FocusEvent) => {
      if (e.relatedTarget instanceof Node && el.contains(e.relatedTarget)) return;
      carousel.current.hold.focus = false;
      setKbFocus(false);
      schedule();
    };
    el.addEventListener("focusin", onFocusIn);
    el.addEventListener("focusout", onFocusOut);
    return () => {
      el.removeEventListener("focusin", onFocusIn);
      el.removeEventListener("focusout", onFocusOut);
    };
  }, [schedule]);

  useEffect(() => {
    const c = carousel.current;
    return () => {
      window.clearTimeout(c.timer);
      gsap.killTweensOf(c.pos);
    };
  }, []);

  // Accessibility: only the active product's text is exposed / focusable.
  useEffect(() => {
    root.current?.querySelectorAll<HTMLElement>("[data-hero-idx]:not([data-hero-img])").forEach((node) => {
      const on = Number(node.dataset.heroIdx) === activeIndex;
      node.inert = !on;
      if (on) node.removeAttribute("aria-hidden");
      else node.setAttribute("aria-hidden", "true");
    });
  }, [activeIndex]);

  // The carousel moves forward on its own: preload the model after the next one.
  useEffect(() => {
    if (tier === "pending" || tier === "none" || n < 3) return;
    preloadModel(products[(activeIndex + 2) % n]?.model);
  }, [activeIndex, tier, products, n]);

  // The product on show plus its neighbours on the left (previous) and right (next), round the loop.
  const mounted = useMemo(() => {
    const wrap = (i: number) => ((i % n) + n) % n;
    return [...new Set([wrap(activeIndex - 1), activeIndex, wrap(activeIndex + 1)])];
  }, [activeIndex, n]);

  /* ---------------- pointer / touch interaction ---------------- */
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const pinchStart = useRef<{ dist: number; zoom: number } | null>(null);

  const onPointerDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest("a,button,input,select,textarea")) return;
    // Primary button only: a right-click menu can swallow the pointerup and leave the drag hanging.
    if (e.pointerType === "mouse" && e.button !== 0) return;
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
    // Hold the board on show while it is being turned.
    carousel.current.hold.dragging = true;
    schedule();
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

  /** A pointer lifted or cancelled: end the drag, and restart the countdown it was holding. */
  const endPointer = useCallback(
    (pointerId: number) => {
      const ptrs = pointers.current;
      if (!ptrs.delete(pointerId)) return;
      if (ptrs.size < 2) pinchStart.current = null;
      if (ptrs.size === 0) {
        state.current.dragging = false;
        state.current.lastInteract = performance.now();
        carousel.current.hold.dragging = false;
        schedule();
      }
    },
    [schedule],
  );

  // Listened for on the window, so releasing outside the stage (before pointer capture) still ends
  // the drag; switching away mid-drag (no pointerup ever arrives) ends it too.
  useEffect(() => {
    const end = (e: PointerEvent) => endPointer(e.pointerId);
    const endAll = () => [...pointers.current.keys()].forEach(endPointer);
    window.addEventListener("pointerup", end);
    window.addEventListener("pointercancel", end);
    window.addEventListener("blur", endAll);
    return () => {
      window.removeEventListener("pointerup", end);
      window.removeEventListener("pointercancel", end);
      window.removeEventListener("blur", endAll);
    };
  }, [endPointer]);

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

  const use3D = tier !== "pending" && tier !== "none";
  const firstReady = status[0] === "ready";
  const loading = tier === "pending" || (use3D && status[activeIndex] === "idle" && !!products[activeIndex]?.model);
  // The still photo is only a fallback: never flash it while the 3D model is loading.
  // Show it only when WebGL is unavailable, the model failed, or the product has no model.
  const needsImage = (i: number) =>
    tier === "none" || status[i] === "error" || (tier !== "pending" && !products[i]?.model);

  // Each product gets its full time on show once it is actually visible: the countdown waits
  // for the model on show to load.
  useEffect(() => {
    carousel.current.hold.loading = loading;
    schedule();
  }, [loading, schedule]);

  // Newly shown fallback images need the current carousel opacity/transform.
  useEffect(() => {
    apply(state.current.e);
  }, [tier, status, mounted, apply]);

  return (
    <section
      ref={root}
      aria-label="Featured Plusmark products"
      aria-roledescription="carousel"
      data-nav-overlay
      className="relative studio-bg"
    >
      <div
        ref={stage}
        className="relative grid h-[100svh] w-full touch-pan-y select-none overflow-hidden
          grid-rows-[auto_auto_minmax(0,1fr)_auto_auto_auto] [grid-template-areas:'title'_'head'_'model'_'specs'_'body'_'progress']
          px-5 pb-4 pt-[96px]
          lg:grid-cols-[minmax(0,23rem)_minmax(0,1fr)_minmax(0,19rem)] lg:grid-rows-[auto_minmax(0,0.35fr)_auto_auto_1fr_auto] lg:gap-x-10 lg:px-[clamp(1.5rem,4vw,3.5rem)] lg:pb-6 lg:pt-[112px]
          lg:[grid-template-areas:'title_._.'_'._model_.'_'head_model_specs'_'body_model_specs'_'._model_.'_'progress_progress_progress']"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
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

        {/* Previous / next: the boards waiting on the left and on the right of the one on show.
            Same box as the model area; on desktop the pair sits on the "drag to rotate" line under
            the board (the copy columns flank it at mid-height), on smaller screens at mid-height. */}
        {n > 1 && (
          <div className="pointer-events-none relative z-20 -mx-5 hidden [grid-area:model] [.js_&]:block lg:absolute lg:inset-0 lg:mx-0 lg:[grid-area:1/1/-1/-1]">
            <HeroArrow
              dir={-1}
              onClick={() => step(-1)}
              className="left-2 sm:left-4 md:left-6 lg:left-[calc(50%-max(26svh,14rem)-1.375rem)]"
            />
            <HeroArrow
              dir={1}
              onClick={() => step(1)}
              className="right-2 sm:right-4 md:right-6 lg:right-[calc(50%-max(26svh,14rem)-1.375rem)]"
            />
          </div>
        )}

        <div className="pointer-events-none relative z-10 [grid-area:title] lg:self-end">{title}</div>

        <div className="pointer-events-none relative z-10 grid [grid-area:head] lg:self-end [&>*]:[grid-area:1/1] [&>*]:self-end">{heads}</div>

        <div className="pointer-events-none relative z-10 grid [grid-area:body] [&>*]:[grid-area:1/1]">{bodies}</div>

        <div className="pointer-events-none relative z-10 grid [grid-area:specs] lg:self-center [&>*]:[grid-area:1/1]">{specs}</div>

        <div className="relative z-10 [grid-area:progress]">
          <HeroProgress products={products} active={activeIndex} barRef={barRef} onSelect={goTo} live={kbFocus} />
        </div>
      </div>
    </section>
  );
}

/** Round previous / next control, in the same material as the hero's loading pill. */
function HeroArrow({ dir, onClick, className }: { dir: -1 | 1; onClick: () => void; className: string }) {
  const Icon = dir < 0 ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={dir < 0 ? "Previous product" : "Next product"}
      className={cn(
        // 36px circle on phones with a 44px hit area; 40px on tablets, 44px on desktop
        "group pointer-events-auto absolute top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full before:absolute before:-inset-1 md:size-10",
        "bg-white/80 text-graphite shadow-sm ring-1 ring-line backdrop-blur",
        "transition duration-300 ease-[var(--ease-premium)] hover:bg-white hover:shadow-[var(--shadow-soft)] hover:ring-alu-dark/60 active:scale-[0.92]",
        "lg:top-auto lg:bottom-[calc(12%-0.9375rem)] lg:size-11 lg:translate-y-0",
        className,
      )}
    >
      <Icon
        aria-hidden
        strokeWidth={1.75}
        className={cn(
          "size-[1.125rem] transition-transform duration-300 ease-[var(--ease-premium)]",
          dir < 0 ? "group-hover:-translate-x-0.5" : "group-hover:translate-x-0.5",
        )}
      />
    </button>
  );
}
