"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowDown, ArrowUpRight, Sparkles } from "lucide-react";
import { useRef } from "react";

const EASE = [0.22, 1, 0.36, 1] as const;

function Kinetic({ text, delay = 0, className }: { text: string; delay?: number; className?: string }) {
  return (
    <span className={className} aria-hidden>
      {text.split(" ").map((word, w) => (
        <span key={w} className="inline-block whitespace-nowrap">
          {word.split("").map((ch, i) => (
            <motion.span
              key={i}
              className="inline-block"
              initial={{ opacity: 0, y: "0.9em", rotateX: -80 }}
              animate={{ opacity: 1, y: 0, rotateX: 0 }}
              transition={{ delay: delay + (w * 5 + i) * 0.028, duration: 0.9, ease: EASE }}
              style={{ transformOrigin: "50% 100%", transformPerspective: 600 }}
            >
              {ch}
            </motion.span>
          ))}
          <span className="inline-block">&nbsp;</span>
        </span>
      ))}
    </span>
  );
}

const chips = ["Aluminium anodised frames", "ABS dual-tone corners", "HPL & steel surfaces", "GEM Portal approved"];

/** Design D hero: kinetic 3D type on the left, the WebGL boards (page-wide canvas) float on the right. */
export function HeroD({ fallbackImage }: { fallbackImage: string }) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, -140]);
  const fade = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  return (
    <section id="xd-hero" ref={ref} aria-labelledby="xd-hero-title" className="relative flex min-h-[100svh] items-center overflow-hidden">
      <div aria-hidden className="xd-blob -left-24 top-10 size-[28rem] bg-[#8f73ff]" />
      <div aria-hidden className="xd-blob right-0 top-1/3 size-[26rem] bg-[#5fdcf5]" style={{ animationDelay: "-5s" }} />
      <div aria-hidden className="xd-blob bottom-0 left-1/3 size-[22rem] bg-[#ffb08a]" style={{ animationDelay: "-10s" }} />

      {/* Static composition when WebGL is off */}
      <div aria-hidden className="xd-fallback pointer-events-none absolute inset-y-0 right-0 hidden w-1/2 items-center md:flex">
        <Image src={fallbackImage} alt="" width={900} height={700} className="h-auto w-full max-w-2xl drop-shadow-2xl" priority />
      </div>

      <motion.div style={{ y, opacity: fade }} className="relative z-10 mx-auto w-full max-w-[110rem] px-5 pb-40 pt-32 sm:px-10 md:pb-24">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: EASE }}
          className="xd-glass inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-accent"
        >
          <Sparkles aria-hidden className="size-3.5" /> Plusmark Display System · Made in India
        </motion.p>

        <h1 id="xd-hero-title" className="mt-7 max-w-[15ch] font-display text-[clamp(2.6rem,7.2vw,7.4rem)] font-semibold leading-[0.95] text-graphite">
          <span className="sr-only">Boards that make every idea visible.</span>
          <Kinetic text="Boards that make" />
          <br />
          <Kinetic text="every idea" delay={0.35} className="xd-grad-text" />{" "}
          <Kinetic text="visible." delay={0.6} />
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.9, ease: EASE }}
          className="mt-7 max-w-xl text-lg leading-relaxed text-steel md:text-xl"
        >
          White, chalk, notice, magnetic and ceramic boards engineered in aluminium and steel. Scroll to send them
          spinning and see every detail up close.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.05, duration: 0.9, ease: EASE }}
          className="mt-9 flex flex-wrap gap-3"
        >
          <Link href="/products" className="xd-btn">
            Explore products <ArrowUpRight aria-hidden className="size-4" />
          </Link>
          <a href="#xd-film" className="xd-btn-ghost">
            Watch it turn <ArrowDown aria-hidden className="size-4" />
          </a>
        </motion.div>

        <ul className="mt-12 flex max-w-2xl flex-wrap gap-2">
          {chips.map((c, i) => (
            <motion.li
              key={c}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.2 + i * 0.08, duration: 0.6, ease: EASE }}
              className="xd-glass rounded-full px-4 py-2 text-xs font-medium text-graphite"
            >
              {c}
            </motion.li>
          ))}
        </ul>
      </motion.div>

      <motion.a
        href="#xd-orbit"
        aria-label="Scroll to the collection"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6 }}
        className="absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2 text-[0.65rem] font-semibold uppercase tracking-[0.25em] text-steel"
      >
        Scroll
        <span className="flex h-10 w-6 justify-center rounded-full ring-1 ring-alu-dark/50">
          <motion.span
            className="mt-2 block size-1.5 rounded-full bg-accent"
            animate={{ y: [0, 14, 0], opacity: [1, 0.2, 1] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          />
        </span>
      </motion.a>
    </section>
  );
}
