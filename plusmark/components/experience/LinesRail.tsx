"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { APLUS_HEIGHT, APLUS_WIDTH, type AplusLine } from "@/data/aplus";

/** Card that tilts in 3D towards the pointer. */
function TiltCard({ line, index }: { line: AplusLine; index: number }) {
  const ref = useRef<HTMLElement>(null);
  const onMove = (e: React.PointerEvent) => {
    const el = ref.current;
    if (!el || e.pointerType !== "mouse") return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `perspective(1100px) rotateY(${x * 10}deg) rotateX(${-y * 8}deg) translateZ(10px)`;
    el.style.setProperty("--gx", `${(x + 0.5) * 100}%`);
    el.style.setProperty("--gy", `${(y + 0.5) * 100}%`);
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
      className="xd-glass group relative w-[82vw] shrink-0 overflow-hidden rounded-[2rem] transition-transform duration-300 ease-out will-change-transform sm:w-[62vw] lg:w-[46vw]"
    >
      <div className="relative overflow-hidden">
        <Image
          src={line.images[0].src}
          alt={line.images[0].alt}
          width={APLUS_WIDTH}
          height={APLUS_HEIGHT}
          sizes="(min-width: 1024px) 46vw, (min-width: 640px) 62vw, 82vw"
          quality={85}
          className="h-auto w-full transition-transform duration-700 group-hover:scale-[1.04]"
        />
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{ background: "radial-gradient(40% 60% at var(--gx,50%) var(--gy,50%), rgb(255 255 255 / 0.35), transparent 70%)" }}
        />
      </div>
      <div className="flex items-end justify-between gap-4 p-6 md:p-7">
        <div>
          <p className="font-mono text-xs text-steel">{String(index + 1).padStart(2, "0")} · {line.short}</p>
          <h3 className="mt-2 font-display text-xl font-semibold text-graphite md:text-2xl">{line.name}</h3>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-steel">{line.tagline}</p>
        </div>
        <Link
          href={href}
          {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
          aria-label={`${line.name}: ${external ? "view on Amazon" : "view product"}`}
          className="xd-btn !h-12 shrink-0 !px-4"
        >
          <ArrowUpRight aria-hidden className="size-5" />
        </Link>
      </div>
    </article>
  );
}

/** Pinned horizontal rail: vertical scroll moves the product lines sideways. */
export function LinesRail({ lines }: { lines: AplusLine[] }) {
  const section = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const [dist, setDist] = useState(0);

  useEffect(() => {
    const measure = () => {
      const t = track.current;
      if (t) setDist(Math.max(0, t.scrollWidth - window.innerWidth));
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (track.current) ro.observe(track.current);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  const { scrollYProgress } = useScroll({ target: section, offset: ["start start", "end end"] });
  const smoothP = useSpring(scrollYProgress, { stiffness: 120, damping: 28, mass: 0.4 });
  const x = useTransform(smoothP, [0, 1], [0, -dist]);
  const bar = useTransform(smoothP, [0, 1], ["0%", "100%"]);

  return (
    <section
      id="xd-lines"
      ref={section}
      aria-labelledby="xd-lines-title"
      className="relative z-10"
      style={{ height: `calc(100svh + ${dist}px)` }}
    >
      <div className="sticky top-0 flex h-[100svh] flex-col justify-center overflow-hidden">
        <div className="mx-auto mb-8 flex w-full max-w-[110rem] items-end justify-between gap-6 px-5 sm:px-10">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Plusmark Retail on Amazon</p>
            <h2 id="xd-lines-title" className="mt-3 font-display text-[clamp(1.8rem,4vw,3.6rem)] font-semibold leading-[1.02] text-graphite">
              Six lines, <span className="xd-grad-text">one frame system.</span>
            </h2>
          </div>
          <div aria-hidden className="hidden h-1 w-48 overflow-hidden rounded-full bg-fog md:block">
            <motion.div className="h-full rounded-full bg-gradient-to-r from-[#6d4aff] to-[#12c2e9]" style={{ width: bar }} />
          </div>
        </div>
        <motion.div ref={track} style={{ x }} className="flex w-max gap-6 px-5 sm:px-10">
          {lines.map((l, i) => (
            <TiltCard key={l.id} line={l} index={i} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
