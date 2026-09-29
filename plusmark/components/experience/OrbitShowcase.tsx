"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { pinProgress } from "./scroll";

export interface OrbitItem {
  slug: string;
  name: string;
  category: string;
  description: string;
  highlights: string[];
  image: string;
}

/**
 * Pinned "collection" chapter. The WebGL boards arrive on a turntable ring here and the scroll
 * rotates it (see SceneCanvas); this component renders the copy for whichever board is in front.
 */
export function OrbitShowcase({ items }: { items: OrbitItem[] }) {
  const ref = useRef<HTMLElement>(null);
  const [index, setIndex] = useState(0);
  const [p, setP] = useState(0);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const v = pinProgress(ref.current);
      setP(v);
      setIndex(Math.min(items.length - 1, Math.round(v * (items.length - 1))));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [items.length]);

  const item = items[index];

  return (
    <section id="xd-orbit" ref={ref} aria-labelledby="xd-orbit-title" className="relative" style={{ height: `${items.length * 90 + 60}vh` }}>
      <div className="sticky top-0 flex h-[100svh] items-end overflow-hidden md:items-center">
        <div className="relative z-10 mx-auto grid w-full max-w-[110rem] gap-8 px-5 pb-10 sm:px-10 md:grid-cols-[minmax(0,34rem)_1fr] md:pb-0">
          <div className="xd-glass rounded-[2rem] p-7 md:p-10">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">The collection · 360°</p>
            <h2 id="xd-orbit-title" className="sr-only">
              Featured boards
            </h2>
            <AnimatePresence mode="wait">
              <motion.div
                key={item.slug}
                initial={{ opacity: 0, y: 24, filter: "blur(8px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -24, filter: "blur(8px)" }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              >
                <p className="mt-5 font-mono text-xs text-steel">
                  {String(index + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")} · {item.category}
                </p>
                <p className="mt-3 font-display text-[clamp(1.6rem,3vw,2.6rem)] font-semibold leading-[1.05] text-graphite">{item.name}</p>
                <p className="mt-4 line-clamp-3 text-base leading-relaxed text-steel">{item.description}</p>
                <ul className="mt-5 flex flex-wrap gap-2">
                  {item.highlights.slice(0, 3).map((h) => (
                    <li key={h} className="rounded-full bg-accent-soft px-3 py-1.5 text-xs font-medium text-accent">
                      {h}
                    </li>
                  ))}
                </ul>
                <Link href={`/products/${item.slug}`} className="xd-btn mt-7">
                  View product <ArrowUpRight aria-hidden className="size-4" />
                </Link>
              </motion.div>
            </AnimatePresence>
            <div className="mt-8 flex gap-1.5" aria-hidden>
              {items.map((it, i) => (
                <span key={it.slug} className="h-1 flex-1 overflow-hidden rounded-full bg-fog">
                  <span
                    className="block h-full rounded-full bg-gradient-to-r from-[#6d4aff] to-[#12c2e9]"
                    style={{ width: `${Math.max(0, Math.min(1, p * (items.length - 1) - i + 0.5)) * 100}%` }}
                  />
                </span>
              ))}
            </div>
          </div>

          {/* Image stand-in for the 3D ring when WebGL is off */}
          <div aria-hidden className="xd-fallback relative hidden items-center justify-center md:flex">
            <AnimatePresence mode="wait">
              <motion.div
                key={item.slug}
                initial={{ opacity: 0, rotateY: -50, scale: 0.9 }}
                animate={{ opacity: 1, rotateY: 0, scale: 1 }}
                exit={{ opacity: 0, rotateY: 50, scale: 0.9 }}
                transition={{ duration: 0.6 }}
                style={{ transformPerspective: 1000 }}
              >
                <Image src={item.image} alt="" width={800} height={640} className="h-auto w-full max-w-xl drop-shadow-2xl" />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
        <p
          aria-hidden
          className="pointer-events-none absolute -bottom-6 right-0 select-none font-display text-[22vw] font-bold leading-none text-accent/[0.05]"
        >
          360°
        </p>
      </div>
    </section>
  );
}
