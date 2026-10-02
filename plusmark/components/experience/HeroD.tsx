"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowDown, ArrowUpRight, Move3d } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { sceneInput, type AnchorName } from "./scroll";

const EASE = [0.22, 1, 0.36, 1] as const;

export interface HeroFeature {
  anchor: AnchorName;
  /** short hotspot label, e.g. "Frame" */
  label: string;
  /** catalog value, e.g. "Aluminium Anodized Frame" */
  value: string;
  /** one-line explanation shown when the hotspot is selected */
  text: string;
}

export interface HeroProduct {
  slug: string;
  name: string;
  category: string;
  image: string;
  imageAlt: string;
  /** Order must match the scene's hotspot order: frame, surface, corner. */
  features: HeroFeature[];
}

/** Masked line reveal: each line slides up from behind its own baseline. */
function Line({ children, delay, className }: { children: React.ReactNode; delay: number; className?: string }) {
  return (
    <span className="block overflow-hidden pb-[0.08em]" aria-hidden>
      <motion.span
        className={cn("block", className)}
        initial={{ y: "105%" }}
        animate={{ y: 0 }}
        transition={{ delay, duration: 1, ease: EASE }}
      >
        {children}
      </motion.span>
    </span>
  );
}

const chips = ["Aluminium anodised frames", "ABS dual-tone corners", "HPL & steel surfaces", "GEM Portal approved"];

/**
 * Design D hero. TEXT | PRODUCT | INFO: the copy on the left, the WebGL board composed into
 * #xd-hero-stage (the page-wide canvas reads this slot), and a small specification panel on the
 * right. Hotspots are DOM buttons positioned from 3D by the canvas (see AnchorProjector).
 */
export function HeroD({ product }: { product: HeroProduct }) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  // three depth layers: copy moves fastest, info panel slower, the product is placed by 3D
  const yText = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : -90]);
  const yInfo = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : -40]);
  const fade = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const [selected, setSelected] = useState(-1);
  const [hovered, setHovered] = useState(-1);
  const active = hovered >= 0 ? hovered : selected;

  useEffect(() => {
    sceneInput.hotspot = active;
  }, [active]);
  useEffect(
    () => () => {
      sceneInput.hotspot = -1;
      sceneInput.dragRY = 0;
    },
    [],
  );

  // Drag / arrow-key rotation of the hero product (eases back to its pose after a pause).
  const drag = useRef<{ x: number; id: number } | null>(null);
  const resetTimer = useRef<number>(0);
  const scheduleReset = () => {
    window.clearTimeout(resetTimer.current);
    resetTimer.current = window.setTimeout(() => (sceneInput.dragRY = 0), 2200);
  };
  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    drag.current = { x: e.clientX, id: e.pointerId };
    sceneInput.dragging = true;
    window.clearTimeout(resetTimer.current);
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!drag.current || drag.current.id !== e.pointerId) return;
    const dx = e.clientX - drag.current.x;
    drag.current.x = e.clientX;
    sceneInput.dragRY = Math.max(-2.6, Math.min(2.6, sceneInput.dragRY + dx * 0.009));
  };
  const endDrag = () => {
    drag.current = null;
    sceneInput.dragging = false;
    scheduleReset();
  };
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    e.preventDefault();
    sceneInput.dragRY = Math.max(-2.6, Math.min(2.6, sceneInput.dragRY + (e.key === "ArrowRight" ? 0.25 : -0.25)));
    scheduleReset();
  };

  return (
    <section id="xd-hero" ref={ref} aria-labelledby="xd-hero-title" className="relative">
      <div className="xd-hero-grid mx-auto min-h-[100svh] w-full max-w-[110rem] px-5 pb-20 pt-24 sm:px-10 md:pt-28 lg:pr-24">
        {/* LEFT: eyebrow, headline */}
        <motion.div style={{ y: yText, opacity: fade }} className="relative z-10 self-end [grid-area:head]">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: EASE }}
            className="xd-eyebrow"
          >
            Plusmark Display System · Made in India
          </motion.p>
          <h1
            id="xd-hero-title"
            className="mt-6 font-display text-[clamp(2.75rem,4.8vw,6.25rem)] font-semibold leading-[0.98] tracking-[-0.035em] text-graphite"
          >
            <span className="sr-only">Boards that make every idea visible.</span>
            <Line delay={0.1}>Boards that</Line>
            <Line delay={0.2}>make every</Line>
            <Line delay={0.3}>
              <span className="xd-grad-text">idea visible.</span>
            </Line>
          </h1>
        </motion.div>

        {/* LEFT (below): description, CTAs */}
        <motion.div style={{ y: yText, opacity: fade }} className="relative z-10 self-start [grid-area:body]">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, duration: 0.8, ease: EASE }}
            className="mt-6 max-w-[34rem] text-[1.0625rem] leading-relaxed text-steel md:text-lg"
          >
            White, chalk, notice, magnetic and ceramic boards engineered in aluminium and steel. Scroll to walk the
            showroom and see every detail up close.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.8, ease: EASE }}
            className="mt-8 flex flex-wrap gap-3"
          >
            <Link href="/products" className="xd-btn">
              Explore products <ArrowUpRight aria-hidden className="size-4" />
            </Link>
            <a href="#xd-orbit" className="xd-btn-ghost">
              Explore the showroom <ArrowDown aria-hidden className="xd-down size-4" />
            </a>
          </motion.div>
          <motion.ul
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.95, duration: 0.8 }}
            className="mt-9 flex max-w-xl flex-wrap gap-x-4 gap-y-2 text-[0.8rem] text-steel"
          >
            {chips.map((c) => (
              <li key={c} className="flex items-center gap-2">
                <span aria-hidden className="size-1 rounded-full bg-accent/60" />
                {c}
              </li>
            ))}
          </motion.ul>
        </motion.div>

        {/* CENTER: product slot (3D board is composed here by the page-wide canvas) */}
        <div
          id="xd-hero-stage"
          className="relative my-4 h-[46svh] min-h-[18rem] [grid-area:stage] md:my-0 md:h-[70svh] md:self-center"
        >
          <div className="xd-poster absolute inset-0">
            <Image
              src={product.image}
              alt={product.imageAlt}
              fill
              priority
              sizes="(min-width: 1024px) 40vw, (min-width: 768px) 50vw, 100vw"
              className="object-contain mix-blend-multiply"
            />
          </div>
          <div className="xd-loader pointer-events-none absolute inset-x-0 bottom-2 flex justify-center" role="status" aria-live="polite">
            <div className="xd-glass flex items-center gap-4 rounded-lg px-4 py-2.5">
              <span className="font-display text-xs font-semibold tracking-[0.2em] text-graphite">PLUSMARK</span>
              <span className="text-xs text-steel">Loading product experience</span>
              <span className="relative h-px w-16 overflow-hidden bg-line">
                <span data-xd-progress-bar className="absolute inset-0 origin-left scale-x-0 bg-accent transition-transform duration-300" />
              </span>
              <span data-xd-progress className="w-8 text-right font-mono text-[0.7rem] tabular-nums text-graphite">
                0%
              </span>
            </div>
          </div>
          {/* drag / keyboard rotation surface (only when the 3D product is live) */}
          <div
            tabIndex={0}
            role="group"
            aria-label={`${product.name} in 3D. Drag, or use the left and right arrow keys, to rotate.`}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
            onKeyDown={onKeyDown}
            className="xd-3d-only absolute inset-[8%] cursor-grab touch-pan-y rounded-2xl outline-offset-4 active:cursor-grabbing"
          />
          <p
            aria-hidden
            className="xd-3d-only pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 whitespace-nowrap text-[0.7rem] font-medium uppercase tracking-[0.18em] text-alu-dark"
          >
            <Move3d className="mr-2 inline size-3.5 -translate-y-px" /> Drag to rotate
          </p>
        </div>

        {/* RIGHT: specification panel */}
        <motion.aside
          style={{ y: yInfo, opacity: fade }}
          aria-label={`${product.name} specifications`}
          className="relative z-10 mt-6 self-start [grid-area:info] md:mt-10 lg:mt-0 lg:self-center"
        >
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.9, ease: EASE }}
            className="xd-glass rounded-xl p-5"
          >
            <p className="xd-label">{product.category}</p>
            <p className="mt-1.5 font-display text-base font-semibold leading-snug tracking-[-0.02em] text-graphite">{product.name}</p>
            <dl className="mt-4 divide-y divide-line/80 border-t border-line/80">
              {product.features.map((f, i) => {
                const on = active === i;
                return (
                  <div key={f.anchor} className="py-3">
                    <dt className={cn("xd-label !text-[0.66rem] transition-colors", on && "!text-accent")}>{f.label}</dt>
                    <dd className="mt-1 text-[0.86rem] font-medium leading-snug text-graphite">{f.value}</dd>
                    <AnimatePresence initial={false}>
                      {on && (
                        <motion.dd
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: EASE }}
                          className="overflow-hidden text-[0.8rem] leading-relaxed text-steel"
                        >
                          <span className="block pt-1.5">{f.text}</span>
                        </motion.dd>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </dl>
            <Link href={`/products/${product.slug}`} className="xd-link mt-3 text-sm">
              View product <ArrowUpRight aria-hidden className="size-3.5" />
            </Link>
          </motion.div>
          <p className="xd-3d-only mt-3 px-1 text-[0.72rem] leading-relaxed text-alu-dark">
            Select a <span className="font-medium text-steel">+</span> marker on the board to inspect a part.
          </p>
        </motion.aside>
      </div>

      {/* Hotspots: positioned on the 3D board every frame (hidden on phones / without WebGL) */}
      {product.features.map((f, i) => (
        <div key={f.anchor} className="xd-anchor" data-xd-anchor={f.anchor} data-xd-board="0" data-xd-kind="hotspot">
          <button
            type="button"
            className="xd-hotspot"
            aria-pressed={selected === i}
            aria-label={`${f.label}: ${f.value}`}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(-1)}
            onFocus={() => setHovered(i)}
            onBlur={() => setHovered(-1)}
            onClick={() => setSelected((s) => (s === i ? -1 : i))}
          >
            <span aria-hidden className="xd-hotspot-dot">
              {selected === i ? "–" : "+"}
            </span>
            {f.label}
          </button>
        </div>
      ))}

      <motion.a
        href="#xd-orbit"
        aria-label="Scroll to the collection"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.3 }}
        className="absolute bottom-7 left-5 z-10 hidden items-center gap-3 text-[0.68rem] font-medium uppercase tracking-[0.22em] text-steel sm:left-10 md:flex"
      >
        <span className="relative h-10 w-px overflow-hidden bg-line">
          <motion.span
            className="absolute inset-x-0 top-0 h-1/2 bg-accent"
            animate={reduce ? undefined : { y: ["-100%", "200%"] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
          />
        </span>
        Scroll to explore
      </motion.a>
    </section>
  );
}
