"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion, useScroll, useSpring } from "framer-motion";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { navLinks } from "@/lib/seo";
import { cn } from "@/lib/utils";

export interface ChapterLink {
  id: string;
  label: string;
}

/**
 * Design D navigation: floating logo + menu capsules, a gradient scroll-progress line, a
 * full-screen menu overlay and a chapter rail on the right that tracks the current section.
 */
export function ExperienceNav({ chapters }: { chapters: ChapterLink[] }) {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState(chapters[0]?.id);
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 30, mass: 0.3 });

  useEffect(() => {
    const els = chapters.map((c) => document.getElementById(c.id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setCurrent(e.target.id);
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [chapters]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <motion.div
        aria-hidden
        className="fixed inset-x-0 top-0 z-[60] h-[3px] origin-left bg-gradient-to-r from-[#6d4aff] via-[#12c2e9] to-[#ff7a45]"
        style={{ scaleX: progress }}
      />
      <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-5 sm:pt-4">
        <div className="mx-auto flex max-w-[110rem] items-center justify-between gap-3">
          <Link href="/experience" aria-label="Plusmark Display System — Home" className="xd-glass rounded-full px-5 py-2.5">
            <Logo className="h-8 sm:h-9" />
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/contact#enquiry" className="xd-btn hidden !h-12 sm:inline-flex">
              Request Enquiry <ArrowUpRight aria-hidden className="size-4" />
            </Link>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="xd-menu"
              aria-label={open ? "Close menu" : "Open menu"}
              className="xd-glass inline-flex h-12 items-center gap-2 rounded-full px-5 text-sm font-semibold text-graphite"
            >
              {open ? <X className="size-4" aria-hidden /> : <Menu className="size-4" aria-hidden />}
              <span className="hidden sm:inline">{open ? "Close" : "Menu"}</span>
            </button>
          </div>
        </div>
      </header>

      <nav aria-label="Page chapters" className="fixed right-4 top-1/2 z-40 hidden -translate-y-1/2 lg:block">
        <ul className="xd-glass flex flex-col gap-1 rounded-full p-1.5">
          {chapters.map((c) => (
            <li key={c.id}>
              <a
                href={`#${c.id}`}
                aria-current={current === c.id ? "true" : undefined}
                className="group relative flex size-8 items-center justify-center rounded-full"
              >
                <span
                  className={cn(
                    "block rounded-full transition-all duration-500",
                    current === c.id ? "size-3 bg-gradient-to-br from-[#6d4aff] to-[#12c2e9]" : "size-1.5 bg-alu-dark/60 group-hover:bg-accent",
                  )}
                />
                <span className="pointer-events-none absolute right-10 whitespace-nowrap rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-graphite opacity-0 shadow-[var(--shadow-soft)] transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                  {c.label}
                </span>
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            id="xd-menu"
            key="xd-menu"
            initial={{ clipPath: "circle(0% at 95% 4%)" }}
            animate={{ clipPath: "circle(150% at 95% 4%)" }}
            exit={{ clipPath: "circle(0% at 95% 4%)" }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="xd-stage fixed inset-0 z-[45] overflow-y-auto"
          >
            <div className="mx-auto grid min-h-full max-w-[110rem] content-center gap-10 px-6 pb-16 pt-28 md:grid-cols-[1.4fr_1fr] md:px-12">
              <ul>
                {navLinks.map((l, i) => (
                  <motion.li
                    key={l.href}
                    initial={{ opacity: 0, y: 40, rotateX: -40 }}
                    animate={{ opacity: 1, y: 0, rotateX: 0 }}
                    transition={{ delay: 0.15 + i * 0.05, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                    style={{ transformPerspective: 800 }}
                  >
                    <Link
                      href={l.href === "/" ? "/experience" : l.href}
                      onClick={() => setOpen(false)}
                      className="group flex items-baseline gap-4 py-1.5 font-display text-[clamp(1.8rem,5vw,4rem)] font-semibold leading-tight text-white/90 transition-colors hover:text-white"
                    >
                      <span className="font-mono text-xs text-white/50">{String(i + 1).padStart(2, "0")}</span>
                      <span className="bg-gradient-to-r from-white to-white bg-[length:0%_2px] bg-left-bottom bg-no-repeat transition-[background-size] duration-500 group-hover:bg-[length:100%_2px]">
                        {l.label}
                      </span>
                    </Link>
                  </motion.li>
                ))}
              </ul>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45, duration: 0.6 }}
                className="xd-glass-dark self-end rounded-3xl p-8 text-white"
              >
                <p className="font-mono text-xs uppercase tracking-[0.2em] text-white/60">Made in India · Since 2015</p>
                <p className="mt-4 font-display text-2xl font-semibold leading-snug">Quality Jo Pehchaan Ban Jaaye.</p>
                <p className="mt-3 text-sm leading-relaxed text-white/75">
                  White, chalk, notice, magnetic and ceramic boards, stands, clipboards and school benches.
                </p>
                <Link href="/contact#enquiry" onClick={() => setOpen(false)} className="xd-btn mt-6">
                  Request Enquiry <ArrowUpRight aria-hidden className="size-4" />
                </Link>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
