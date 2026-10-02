"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowDown,
  ArrowUpRight,
  BadgeCheck,
  ChevronLeft,
  ChevronRight,
  Factory,
  RotateCcw,
  RotateCw,
  Truck,
  type LucideIcon,
} from "lucide-react";
import { company } from "@/data/company";
import { useCallback, useEffect, useRef, useState } from "react";
import { getDeviceTier, prefersReducedMotion, type DeviceTier } from "@/components/three/capabilities";
import { ModelErrorBoundary } from "@/components/three/ModelErrorBoundary";
import { pinProgress } from "@/components/experience/scroll";
import { cn } from "@/lib/utils";
import { PART_ORDER, resetStage, setStage, smooth, stage, storyState, type PartName } from "./story";

const ShowroomCanvas = dynamic(() => import("./ShowroomCanvas"), { ssr: false });

const EASE = [0.22, 1, 0.36, 1] as const;
const STAGE_ID = "xe-stage";
/** Scroll length of one product chapter, in viewport heights. */
const CHAPTER_VH = 300;
/** Keep in sync with the `xe-split` variant in globals.css. */
const SPLIT_QUERY = "(min-width: 768px) and (min-aspect-ratio: 23/20)";

export interface ShowroomPart {
  /** small uppercase label; defaults to Frame / Surface / Corners */
  kicker?: string;
  label: string;
  text: string;
}

export interface ShowroomItem {
  slug: string;
  name: string;
  category: string;
  series: string;
  description: string;
  image: string;
  imageAlt: string;
  model?: string;
  specs: { label: string; value: string }[];
  parts: Record<PartName, ShowroomPart>;
}

/** Hero trust row: facts stated in data/company.ts. */
const TRUST: { icon: LucideIcon; label: string }[] = [
  { icon: Factory, label: "Made in India" },
  { icon: BadgeCheck, label: "GEM Portal approved" },
  { icon: Truck, label: "Pan India supply" },
];

const HOT_LABEL: Record<PartName, string> = { frame: "Frame", surface: "Surface", corner: "Corners" };
const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Design E: one pinned 3D stage for the whole product story. Each board is introduced,
 * turns to face you, the camera moves in on the frame and then the surface (with an annotation
 * anchored to the 3D part), and the board recedes while the next one enters from depth.
 * WebGL is the visual layer only; every name, spec and annotation is real HTML.
 */
export function ShowroomStory({ items }: { items: ShowroomItem[] }) {
  const n = items.length;
  const section = useRef<HTMLElement>(null);
  const stageEl = useRef<HTMLDivElement>(null);
  const card = useRef<HTMLDivElement>(null);
  const [tier, setTier] = useState<DeviceTier | null>(null);
  const [mode, setMode] = useState<"loading" | "on" | "off">("loading");
  const [active, setActive] = useState(true);
  const [index, setIndex] = useState(0);
  const [part, setPart] = useState<PartName>("frame");
  const [pinned, setPinned] = useState<PartName | null>(null);
  const [mounted, setMounted] = useState(2);
  const [progress, setProgress] = useState(0);
  const [heroOn, setHeroOn] = useState(true);
  const reduce = !!useReducedMotion();

  const boards = items.filter((i) => i.model).map((i) => ({ slug: i.slug, model: i.model! }));
  const allHaveModels = boards.length === n;

  useEffect(() => {
    resetStage();
    setStage({ reduced: prefersReducedMotion() });
    const t = getDeviceTier();
    setTier(t);
    if (t === "none" || !allHaveModels) setMode("off");
    return () => resetStage();
  }, [allHaveModels]);

  // Scroll → story state. Continuous values go to CSS variables; discrete ones to React state.
  useEffect(() => {
    let raf = 0;
    let lastIndex = -1;
    const update = () => {
      raf = 0;
      const root = stageEl.current;
      if (!root) return;
      setStage({
        p: pinProgress(section.current),
        narrow: window.innerWidth < 768,
        split: window.matchMedia(SPLIT_QUERY).matches,
      });
      const st = storyState(stage.p, n);

      if (st.index !== lastIndex) {
        lastIndex = st.index;
        setIndex(st.index);
        setMounted((m) => Math.max(m, Math.min(n, st.index + 2)));
        setStage({ dragRY: 0 });
      }
      // scrolling into the close-up takes over from a clicked hotspot
      if (stage.pinned && (st.close > 0.05 || Math.abs(st.c - st.index) > 0.05)) {
        setStage({ pinned: null });
        setPinned(null);
      }
      const shown: PartName = stage.pinned ?? (st.part < 0.5 ? "frame" : "surface");
      setPart((p) => (p === shown ? p : shown));

      // the card hides while the camera travels from the frame to the surface
      const annot = stage.pinned ? 1 : st.close * smooth(0.15, 0.4, Math.abs(st.part - 0.5));
      setStage({ annot });
      const c = card.current?.getBoundingClientRect();
      const s = root.getBoundingClientRect();
      if (c) {
        setStage({ card: stage.narrow
          ? { x: c.left - s.left + c.width / 2, y: c.top - s.top }
          : { x: c.right - s.left, y: c.top - s.top + c.height / 2 } });
      }

      const hero = 1 - st.heroOut;
      const on = hero > 0.5;
      setHeroOn((h) => (h === on ? h : on));
      root.style.setProperty("--xe-hero", hero.toFixed(3));
      root.style.setProperty("--xe-info", (1 - hero).toFixed(3));
      // phones: the annotation takes the panel's place; desktop: they sit side by side
      // the panel steps aside for the close-up (the annotation card carries the story there)
      root.style.setProperty("--xe-panel", ((1 - hero) * (1 - Math.max(st.close, annot))).toFixed(3));
      root.style.setProperty("--xe-annot", annot.toFixed(3));
      root.style.setProperty("--xe-close", st.close.toFixed(3));
      root.style.setProperty("--xe-local", (stage.p * n - st.index).toFixed(3));
      root.style.setProperty("--xe-p", stage.p.toFixed(4));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    const onPointer = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      setStage({ px: (e.clientX / window.innerWidth) * 2 - 1, py: (e.clientY / window.innerHeight) * 2 - 1 });
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
  }, [n]);

  // Render the canvas only while the story is on screen.
  useEffect(() => {
    const el = section.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setActive(e.isIntersecting), { rootMargin: "10% 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!pinned) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setStage({ pinned: null });
        setPinned(null);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [pinned]);

  /** Scroll to a product chapter (lands just after its intro beat). */
  const goTo = useCallback(
    (i: number) => {
      const el = section.current;
      if (!el) return;
      const target = Math.max(0, Math.min(n - 1, i));
      const span = el.offsetHeight - window.innerHeight;
      const top = el.getBoundingClientRect().top + window.scrollY + span * ((target + 0.22) / n);
      window.scrollTo({ top, behavior: stage.reduced ? "auto" : "smooth" });
    },
    [n],
  );

  // Drag to rotate (mouse + touch). A quick horizontal flick on touch switches product.
  const drag = useRef<{ x: number; x0: number; t0: number; id: number } | null>(null);
  const onDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    drag.current = { x: e.clientX, x0: e.clientX, t0: performance.now(), id: e.pointerId };
    setStage({ dragging: true });
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    setStage({ dragRY: Math.max(-1.3, Math.min(1.3, stage.dragRY + (e.clientX - d.x) * 0.008)) });
    d.x = e.clientX;
  };
  const onUp = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    drag.current = null;
    setStage({ dragging: false });
    const dx = e.clientX - d.x0;
    if (e.pointerType === "touch" && Math.abs(dx) > 90 && performance.now() - d.t0 < 450) {
      setStage({ dragRY: 0 });
      goTo(index + (dx < 0 ? 1 : -1));
    }
  };
  const nudge = (dir: number) => {
    setStage({ dragRY: Math.max(-1.3, Math.min(1.3, stage.dragRY + dir * 0.4)) });
  };

  const pin = (name: PartName) => {
    const next = stage.pinned === name ? null : name;
    setStage({ pinned: next });
    setPinned(next);
    if (next) setPart(next);
  };

  const onReady = useCallback(() => setMode("on"), []);
  const onFail = useCallback(() => setMode("off"), []);
  const onProgress = useCallback((p: number) => setProgress(Math.round(p)), []);

  const item = items[index];
  const annotation = item.parts[part];
  const show3d = tier && tier !== "none" && mode !== "off";

  return (
    <section
      ref={section}
      id="xe-story"
      aria-labelledby="xe-hero-title"
      className="relative z-10"
      style={{ height: `${100 + n * CHAPTER_VH}vh` }}
    >
      <div
        ref={stageEl}
        id={STAGE_ID}
        className="sticky top-0 h-[100svh] overflow-hidden"
        style={{ ["--xe-hero" as string]: 1, ["--xe-info" as string]: 0, ["--xe-annot" as string]: 0 }}
      >
        {/* ---------- background: supports the product, never competes ---------- */}
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-[linear-gradient(180deg,#fcfcfe_0%,#f4f2fb_60%,#eceaf7_100%)]" />
          <div className="xd-backdrop-grid absolute inset-0 opacity-70" />
          <div className="absolute inset-0 bg-[radial-gradient(38%_42%_at_50%_58%,rgb(255_255_255/0.95),rgb(111_99_240/0.08)_60%,transparent_80%)]" />
          <p
            className="xd-backdrop-type absolute inset-x-0 top-[14%] text-center text-[19vw]"
            style={{ opacity: "calc(0.6 + 0.4 * var(--xe-hero))", transform: "translate3d(calc((var(--xe-p, 0) - 0.5) * -12vw), 0, 0)" }}
          >
            PLUSMARK
          </p>
          {/* the wrapper carries the scroll opacity (framer's animate would override it on the span) */}
          <div className="absolute inset-0" style={{ opacity: "calc(var(--xe-info) * 0.9)" }}>
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={index}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -40 }}
                transition={{ duration: 0.8, ease: EASE }}
                className="xd-backdrop-type absolute -bottom-[5vw] right-[3vw] text-[26vw] !tracking-[-0.05em]"
              >
                {pad(index + 1)}
              </motion.span>
            </AnimatePresence>
          </div>
        </div>

        {/* ---------- product photo: only a fallback when 3D is off (no WebGL / a model failed).
            It is never shown while the model loads, so switching designs doesn't flash a 2D photo
            before the 3D board; the loader below covers that moment instead. ---------- */}
        <div
          data-3d-photo
          aria-hidden={mode !== "off"}
          className={cn(
            "pointer-events-none absolute inset-x-[8%] bottom-[16%] top-[calc(18%+38%*var(--xe-hero))] transition-[opacity,scale] duration-700 ease-[var(--xd-ease)] md:inset-x-[24%]",
            // split hero: the photo sits in the right half, beside the copy
            "xe-split:top-[18%] xe-split:[translate:calc(var(--xe-hero)*24vw)_0]",
            mode === "off" ? "opacity-100" : "scale-[0.97] opacity-0",
          )}
        >
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.div
              key={item.slug}
              className="absolute inset-0"
              initial={{ opacity: 0, scale: 0.94, z: -40 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, x: "-12%" }}
              transition={{ duration: 0.8, ease: EASE }}
            >
              <Image src={item.image} alt={item.imageAlt} fill priority={index === 0} sizes="(min-width: 768px) 52vw, 84vw" className="object-contain mix-blend-multiply" />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* ---------- WebGL layer ---------- */}
        {show3d && (
          <div aria-hidden className="pointer-events-none absolute inset-0">
            <ModelErrorBoundary onError={onFail}>
              <ShowroomCanvas
                root={STAGE_ID}
                boards={boards}
                mounted={mounted}
                tier={tier}
                active={active}
                onReady={onReady}
                onProgress={onProgress}
                onFail={onFail}
              />
            </ModelErrorBoundary>
          </div>
        )}

        {/* drag surface (vertical scrolling stays native on touch) */}
        {mode === "on" && (
          <div
            aria-hidden
            className="absolute inset-x-0 bottom-[12%] top-[20%] cursor-grab touch-pan-y active:cursor-grabbing"
            onPointerDown={onDown}
            onPointerMove={onMove}
            onPointerUp={onUp}
            onPointerCancel={onUp}
          />
        )}

        {/* ---------- leader line + dot, glued to the 3D part by the canvas ---------- */}
        <svg aria-hidden className="pointer-events-none absolute inset-0 size-full overflow-visible">
          <line data-xe-line x1="0" y1="0" x2="0" y2="0" stroke="#4f3fd9" strokeWidth="1" strokeDasharray="3 4" style={{ opacity: 0 }} />
        </svg>
        <span aria-hidden data-xe-dot className="pointer-events-none absolute left-0 top-0 opacity-0" style={{ willChange: "transform" }}>
          <span className="absolute -left-2 -top-2 block size-4 rounded-full bg-accent/15 ring-1 ring-accent/40" />
          <span className="absolute -left-[3px] -top-[3px] block size-1.5 rounded-full bg-accent" />
        </span>

        {/* ---------- hotspots ---------- */}
        {mode === "on" &&
          PART_ORDER.map((name) => (
            <div key={name} data-xe-hot={name} className="absolute left-0 top-0 z-20 opacity-0" style={{ visibility: "hidden", willChange: "transform" }}>
              <button
                type="button"
                onClick={() => pin(name)}
                onMouseEnter={() => setStage({ hover: name })}
                onMouseLeave={() => setStage({ hover: null })}
                onFocus={() => setStage({ hover: name })}
                onBlur={() => setStage({ hover: null })}
                aria-pressed={pinned === name}
                aria-label={`${item.parts[name].kicker ?? HOT_LABEL[name]}: ${item.parts[name].label}`}
                className="group relative -ml-3 -mt-3 flex size-6 items-center justify-center rounded-full focus-visible:outline-none"
              >
                <span className="absolute inset-0 rounded-full bg-white/80 shadow-[0_2px_10px_-2px_rgb(27_23_64/0.35)] ring-1 ring-[rgb(27_23_64/0.12)] backdrop-blur transition-transform duration-300 group-hover:scale-125 group-focus-visible:scale-125 group-focus-visible:ring-2 group-focus-visible:ring-accent" />
                <span className={cn("relative size-1.5 rounded-full transition-colors", pinned === name ? "bg-accent" : "bg-graphite")} />
                <span className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-md bg-white/90 px-2 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-graphite opacity-0 shadow-[0_6px_18px_-10px_rgb(27_23_64/0.5)] ring-1 ring-line transition-[opacity,transform] duration-300 group-hover:translate-x-1 group-hover:opacity-100 group-focus-visible:opacity-100">
                  {item.parts[name].kicker ?? HOT_LABEL[name]}
                </span>
              </button>
            </div>
          ))}

        {/* ---------- UI layer ---------- */}
        <div className="pointer-events-none relative z-10 mx-auto flex h-full max-w-[110rem] flex-col px-5 pb-6 pt-24 sm:px-10 md:pb-8 lg:pr-24">
          {/* Hero copy: out of the flow so it never pushes the story UI around.
              Phones / tall screens: centred on top, board below. Wide screens: left half, board right. */}
          <div
            className="absolute inset-x-5 top-24 z-10 mx-auto max-w-2xl text-center sm:inset-x-10 xe-split:right-auto xe-split:top-1/2 xe-split:mx-0 xe-split:w-[min(40rem,46%)] xe-split:max-w-none xe-split:-translate-y-1/2 xe-split:text-left"
            aria-hidden={!heroOn}
            style={{ opacity: "var(--xe-hero)", transform: "translate3d(0, calc((1 - var(--xe-hero)) * -40px), 0)" }}
          >
            <motion.p
              className="xd-eyebrow justify-center xe-split:justify-start"
              initial={reduce ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: EASE }}
            >
              Plusmark Display System · Since {company.established}
            </motion.p>
            <h1
              id="xe-hero-title"
              className="mt-4 font-display text-[clamp(2.4rem,min(6vw,10.5svh),5.75rem)] font-semibold leading-[0.98] tracking-[-0.045em] text-graphite"
            >
              {/* each line rises out of its own mask */}
              {[
                <>Designed for</>,
                <>
                  better <span className="xd-grad-text">spaces.</span>
                </>,
              ].map((line, i) => (
                <span key={i} className="block overflow-hidden pb-[0.08em]">
                  <motion.span
                    className="block"
                    initial={reduce ? false : { y: "105%" }}
                    animate={{ y: 0 }}
                    transition={{ duration: 0.9, ease: EASE, delay: 0.1 + i * 0.1 }}
                  >
                    {line}
                  </motion.span>
                </span>
              ))}
            </h1>
            <motion.div
              initial={reduce ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: EASE, delay: 0.35 }}
            >
              <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-steel xe-split:mx-0 md:text-lg">
                Premium notice &amp; display solutions: white, chalk, notice, magnetic and ceramic boards, made in India.
              </p>
              <div className={cn("mt-6 flex flex-wrap items-center justify-center gap-3 xe-split:justify-start", heroOn && "pointer-events-auto")}>
                <a href="#xe-range" className="xd-btn" tabIndex={heroOn ? 0 : -1}>
                  Explore products <ArrowDown aria-hidden className="xd-down size-4" />
                </a>
                <Link href="/contact#enquiry" className="xd-btn-ghost" tabIndex={heroOn ? 0 : -1}>
                  Request a quote <ArrowUpRight aria-hidden className="size-4" />
                </Link>
              </div>
            </motion.div>
            {/* trust row (catalog facts only) */}
            <motion.ul
              aria-label="Why Plusmark"
              className="mt-7 hidden flex-wrap items-center justify-center gap-x-5 gap-y-2 border-t border-line/80 pt-5 sm:flex xe-split:justify-start"
              initial="hide"
              animate="show"
              variants={{ show: { transition: { staggerChildren: 0.08, delayChildren: 0.55 } } }}
            >
              {TRUST.map(({ icon: Icon, label }) => (
                <motion.li
                  key={label}
                  variants={reduce ? undefined : { hide: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } } }}
                  className="flex items-center gap-2 text-[0.8rem] font-medium text-graphite"
                >
                  <span className="flex size-7 items-center justify-center rounded-full bg-white text-accent ring-1 ring-line">
                    <Icon aria-hidden className="size-3.5" />
                  </span>
                  {label}
                </motion.li>
              ))}
            </motion.ul>
          </div>

          <div className="relative min-h-0 flex-1">
            {/* Annotation card: desktop left-middle, phones bottom */}
            <div
              ref={card}
              className="xd-glass absolute bottom-24 left-0 right-0 mx-auto max-w-sm rounded-xl p-5 md:bottom-auto md:left-0 md:right-auto md:top-1/2 md:w-[20rem] md:-translate-y-1/2"
              style={{ opacity: "var(--xe-annot)" }}
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={`${item.slug}-${part}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.35, ease: EASE }}
                >
                  <p className="text-[0.66rem] font-semibold uppercase tracking-[0.22em] text-accent">{annotation.kicker ?? HOT_LABEL[part]}</p>
                  <p className="mt-2 font-display text-xl font-semibold leading-snug tracking-[-0.02em] text-graphite">{annotation.label}</p>
                  <p className="mt-2 text-sm leading-relaxed text-steel">{annotation.text}</p>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Product information panel (every product is in the DOM; only the current one shows) */}
            <div
              className="absolute inset-x-0 bottom-20 md:bottom-4 md:left-auto md:right-0 md:w-[19rem]"
              style={{ opacity: "var(--xe-panel, 0)" }}
            >
              {items.map((it, i) => (
                <article
                  key={it.slug}
                  aria-hidden={i !== index}
                  className={cn(
                    "xd-glass absolute inset-x-0 bottom-0 rounded-xl p-5 transition-[opacity,transform] duration-700 ease-[var(--xd-ease)]",
                    i === index ? "pointer-events-auto opacity-100" : "pointer-events-none translate-y-4 opacity-0",
                    i < index && "-translate-y-4",
                  )}
                >
                  <p className="xd-label">
                    {it.category} · {it.series}
                  </p>
                  <h2 className="mt-2 font-display text-lg font-semibold leading-snug tracking-[-0.02em] text-graphite">{it.name}</h2>
                  <p className="mt-2 hidden text-sm leading-relaxed text-steel md:line-clamp-3">{it.description}</p>
                  <dl className="mt-4 hidden divide-y divide-line/70 border-t border-line/70 md:block">
                    {it.specs.map((s) => (
                      <div key={s.label} className="flex items-baseline justify-between gap-4 py-2">
                        <dt className="xd-label !text-[0.62rem]">{s.label}</dt>
                        <dd className="text-right text-[0.8rem] font-medium text-graphite">{s.value}</dd>
                      </div>
                    ))}
                  </dl>
                  <Link
                    href={`/products/${it.slug}`}
                    tabIndex={i === index ? 0 : -1}
                    className="xd-link mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-graphite"
                  >
                    View product <ArrowUpRight aria-hidden className="size-3.5" />
                  </Link>
                </article>
              ))}
            </div>
          </div>

          {/* Counter · category · progress + controls (they fade in once the story starts, so the
              hero stays clean and nothing sits on the board) */}
          <div
            className={cn("flex items-end justify-between gap-4", !heroOn && "pointer-events-auto")}
            aria-hidden={heroOn}
            style={{ opacity: "var(--xe-info)", transform: "translate3d(0, calc(var(--xe-hero) * 16px), 0)" }}
          >
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => goTo(index - 1)} disabled={index === 0} aria-label="Previous product" className="xd-btn-ghost !h-9 !px-2.5 disabled:opacity-40">
                <ChevronLeft aria-hidden className="size-4" />
              </button>
              <button type="button" onClick={() => goTo(index + 1)} disabled={index === n - 1} aria-label="Next product" className="xd-btn-ghost !h-9 !px-2.5 disabled:opacity-40">
                <ChevronRight aria-hidden className="size-4" />
              </button>
            </div>

            <div className="xd-glass mx-auto min-w-0 max-w-[24rem] flex-1 rounded-lg px-4 py-2.5 text-center">
              <p className="font-mono text-[0.72rem] tabular-nums text-graphite">
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.span
                    key={index}
                    className="inline-block"
                    initial={{ y: 8, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -8, opacity: 0 }}
                    transition={{ duration: 0.35, ease: EASE }}
                  >
                    {pad(index + 1)}
                  </motion.span>
                </AnimatePresence>
                <span className="text-alu-dark"> / {pad(n)}</span>
              </p>
              <p className="mt-1 truncate text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-graphite">{item.category}</p>
              <div aria-hidden className="mx-auto mt-2.5 flex max-w-[16rem] gap-1">
                {items.map((it, i) => (
                  <span key={it.slug} className="relative h-0.5 flex-1 overflow-hidden rounded-full bg-line">
                    <span
                      className="absolute inset-0 origin-left bg-accent"
                      style={{
                        transform:
                          i < index ? "scaleX(1)" : i > index ? "scaleX(0)" : "scaleX(clamp(0, var(--xe-local, 0), 1))",
                      }}
                    />
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2" aria-hidden={mode !== "on"}>
              {mode === "on" && (
                <>
                  <span className="xd-glass mr-1 hidden h-9 items-center gap-1.5 rounded-lg px-3 text-[0.66rem] font-medium uppercase tracking-[0.2em] text-steel sm:inline-flex">
                    <RotateCw aria-hidden className="size-3.5" /> Drag
                  </span>
                  <button type="button" onClick={() => nudge(-1)} aria-label="Rotate product left" className="xd-btn-ghost !h-9 !px-2.5">
                    <RotateCcw aria-hidden className="size-4" />
                  </button>
                  <button type="button" onClick={() => nudge(1)} aria-label="Rotate product right" className="xd-btn-ghost !h-9 !px-2.5">
                    <RotateCw aria-hidden className="size-4" />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Scroll cue (hero only) */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-6 hidden flex-col items-center gap-2 sm:flex md:bottom-8"
          style={{ opacity: "var(--xe-hero)" }}
        >
          <span className="relative flex h-9 w-6 justify-center rounded-full ring-[1.5px] ring-alu-dark/70">
            <span className="xe-scroll-dot mt-1.5 block h-2 w-1 rounded-full bg-accent" />
          </span>
          <span className="text-[0.6rem] font-semibold uppercase tracking-[0.3em] text-alu-dark">Scroll to explore</span>
        </div>

        {/* ---------- loader: shown on the empty studio until the first board is ready ---------- */}
        <div
          role="status"
          aria-live="polite"
          className={cn(
            "pointer-events-none absolute inset-x-0 bottom-[38%] flex justify-center transition-opacity duration-500",
            show3d && mode === "loading" ? "opacity-100" : "opacity-0",
          )}
        >
          <div className="xd-glass flex min-w-[15rem] flex-col items-center gap-2 rounded-xl px-6 py-4">
            <p className="font-display text-sm font-bold tracking-[0.3em] text-graphite">PLUSMARK</p>
            <p className="text-[0.66rem] font-medium uppercase tracking-[0.2em] text-steel">
              Loading product experience · <span className="tabular-nums">{progress}%</span>
            </p>
            <span className="mt-1 h-0.5 w-full overflow-hidden rounded-full bg-line">
              <span className="block h-full origin-left bg-accent transition-transform duration-300" style={{ transform: `scaleX(${progress / 100})` }} />
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
