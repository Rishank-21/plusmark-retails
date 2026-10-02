"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion, useScroll, useSpring, useTransform, type MotionValue } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { APLUS_HEIGHT, APLUS_WIDTH, type AplusLine } from "@/data/aplus";

/** Card that tilts slightly towards the pointer. */
function TiltCard({ line, index }: { line: AplusLine; index: number }) {
  const ref = useRef<HTMLElement>(null);
  const onMove = (e: React.PointerEvent) => {
    const el = ref.current;
    if (!el || e.pointerType !== "mouse") return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `perspective(1100px) rotateY(${x * 5}deg) rotateX(${-y * 4}deg) translateY(-4px)`;
  };
  const onLeave = () => {
    if (ref.current) ref.current.style.transform = "";
  };
  const href = line.productSlug ? `/products/${line.productSlug}` : line.amazonUrl;
  const external = !line.productSlug;
  return (
    <article
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      className="group relative overflow-hidden rounded-xl bg-white shadow-[0_1px_2px_rgb(27_23_64/0.05),0_24px_48px_-28px_rgb(27_23_64/0.35)] ring-1 ring-[rgb(27_23_64/0.07)] transition-[transform,box-shadow] duration-300 ease-out will-change-transform hover:shadow-[0_1px_2px_rgb(27_23_64/0.05),0_32px_60px_-28px_rgb(27_23_64/0.45)]"
    >
      <div className="relative overflow-hidden">
        <Image
          src={line.images[0].src}
          alt={line.images[0].alt}
          width={APLUS_WIDTH}
          height={APLUS_HEIGHT}
          sizes="(min-width: 1024px) 40vw, (min-width: 640px) 56vw, 78vw"
          quality={85}
          className="h-auto w-full transition-transform duration-700 ease-out group-hover:scale-[1.03]"
        />
      </div>
      <div className="flex items-end justify-between gap-4 p-5 md:p-6">
        <div>
          <p className="font-mono text-[0.7rem] text-alu-dark">
            {String(index + 1).padStart(2, "0")} · {line.short}
          </p>
          <h3 className="mt-1.5 font-display text-lg font-semibold tracking-[-0.02em] text-graphite md:text-xl">{line.name}</h3>
          <p className="mt-1.5 max-w-md text-sm leading-relaxed text-steel">{line.tagline}</p>
        </div>
        <Link
          href={href}
          {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
          aria-label={`${line.name}: ${external ? "view on Amazon" : "view product"}`}
          className="xd-btn !h-11 shrink-0 !px-3.5"
        >
          <ArrowUpRight aria-hidden className="size-4" />
        </Link>
      </div>
    </article>
  );
}

/** One slot on the rail: focused in the centre, smaller / turned / pushed back at the sides. */
function RailSlot({
  progress,
  index,
  count,
  reduce,
  onSelect,
  children,
}: {
  progress: MotionValue<number>;
  index: number;
  count: number;
  reduce: boolean;
  onSelect: (i: number, e: React.SyntheticEvent) => void;
  children: React.ReactNode;
}) {
  const rel = (v: number) => index - v * Math.max(1, count - 1);
  const k = (v: number) => Math.min(1, Math.abs(rel(v)));
  const scale = useTransform(progress, (v) => 1 - k(v) * 0.12);
  const rotateY = useTransform(progress, (v) => (reduce ? 0 : Math.max(-1, Math.min(1, rel(v))) * -14));
  const z = useTransform(progress, (v) => -k(v) * 140);
  const opacity = useTransform(progress, (v) => 1 - k(v) * 0.5);
  return (
    <motion.div
      style={{ scale, rotateY, z, opacity, transformPerspective: 1400 }}
      onClickCapture={(e) => onSelect(index, e)}
      onFocusCapture={(e) => onSelect(index, e)}
      className="w-[78vw] shrink-0 sm:w-[56vw] lg:w-[40vw]"
      data-rail-card
    >
      {children}
    </motion.div>
  );
}

/**
 * Pinned product-line carousel: vertical scroll moves the rail sideways. The centred card is in
 * focus; side cards sit smaller, turned and further back. Selecting a side card brings it forward.
 */
export function LinesRail({ lines }: { lines: AplusLine[] }) {
  const section = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const [m, setM] = useState({ dist: 0, pad: 0 });
  const reduce = !!useReducedMotion();
  const n = lines.length;

  useEffect(() => {
    const measure = () => {
      const card = track.current?.querySelector<HTMLElement>("[data-rail-card]");
      if (!card) return;
      const cw = card.offsetWidth;
      const gap = 24;
      setM({ dist: Math.max(0, (n - 1) * (cw + gap)), pad: Math.max(0, (window.innerWidth - cw) / 2) });
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (track.current) ro.observe(track.current);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [n]);

  const { scrollYProgress } = useScroll({ target: section, offset: ["start start", "end end"] });
  const smoothP = useSpring(scrollYProgress, { stiffness: 120, damping: 28, mass: 0.4 });
  const x = useTransform(smoothP, [0, 1], [0, -m.dist]);
  const bar = useTransform(smoothP, [0, 1], [0, 1]);

  const select = (i: number, e: React.SyntheticEvent) => {
    const off = Math.abs(i - smoothP.get() * Math.max(1, n - 1));
    if (off < 0.5) return;
    if (e.type === "click") e.preventDefault();
    const el = section.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY;
    const span = el.offsetHeight - window.innerHeight;
    window.scrollTo({ top: top + (i / Math.max(1, n - 1)) * span, behavior: reduce || e.type !== "click" ? "auto" : "smooth" });
  };

  return (
    <section
      id="xd-lines"
      ref={section}
      aria-labelledby="xd-lines-title"
      className="relative z-10"
      style={{ height: `calc(100svh + ${m.dist}px)` }}
    >
      <div className="sticky top-0 flex h-[100svh] flex-col justify-center overflow-hidden">
        <div className="mx-auto mb-10 flex w-full max-w-[110rem] items-end justify-between gap-6 px-5 sm:px-10 lg:pr-24">
          <div>
            <p className="xd-eyebrow">Plusmark Retail on Amazon</p>
            <h2 id="xd-lines-title" className="mt-4 font-display text-[clamp(2.25rem,4.4vw,4.5rem)] font-semibold leading-[1.02] tracking-[-0.035em] text-graphite">
              Six lines, <span className="xd-grad-text">one frame system.</span>
            </h2>
          </div>
          <div aria-hidden className="hidden h-px w-48 overflow-hidden bg-line md:block">
            <motion.div className="h-full origin-left bg-graphite" style={{ scaleX: bar }} />
          </div>
        </div>
        <motion.div ref={track} style={{ x, paddingInline: m.pad }} className="flex w-max items-center gap-6 [transform-style:preserve-3d]">
          {lines.map((l, i) => (
            <RailSlot key={l.id} progress={smoothP} index={i} count={n} reduce={reduce} onSelect={select}>
              <TiltCard line={l} index={i} />
            </RailSlot>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
