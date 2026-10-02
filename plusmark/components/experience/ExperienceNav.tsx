"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useScroll, useSpring } from "framer-motion";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { navLinks } from "@/lib/seo";
import { cn } from "@/lib/utils";

export interface ChapterLink {
  id: string;
  label: string;
}

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Design D navigation: a compact bar that starts transparent and turns into a light blurred
 * surface once you scroll, a full-page menu overlay, and a "01 / 08" chapter indicator on the
 * right with a thin vertical progress line.
 */
export function ExperienceNav({
  chapters,
  home = "/experience",
  rail = true,
}: {
  chapters: ChapterLink[];
  /** this variant's home page */
  home?: string;
  /** show the right-hand "01 / 08" chapter rail */
  rail?: boolean;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [current, setCurrent] = useState(0);
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 30, mass: 0.3 });
  const menuBtn = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const els = chapters.map((c) => document.getElementById(c.id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setCurrent(Math.max(0, chapters.findIndex((c) => c.id === e.target.id)));
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [chapters]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        menuBtn.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  // every page inline on desktop (same list as designs A–C); "/" is this variant's own home
  const links = navLinks.map((l) => ({ ...l, href: l.href === "/" ? home : l.href }));
  const chapter = chapters[current];

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-[background-color,box-shadow,backdrop-filter] duration-300",
          scrolled && !open
            ? "bg-[rgb(252_252_254/0.78)] shadow-[inset_0_-1px_0_rgb(27_23_64/0.07)] backdrop-blur-md"
            : "bg-transparent",
        )}
      >
        <div className="mx-auto flex h-[4.5rem] max-w-[110rem] items-center justify-between gap-4 px-5 sm:h-20 sm:px-10 xl:gap-6">
          <Link
            href={home}
            aria-label="Plusmark Display System — Home"
            className={cn("relative z-[46] shrink-0 rounded-md transition-[filter]", open && "brightness-0 invert")}
          >
            <Logo className="h-9 sm:h-11 lg:h-9 xl:h-10 2xl:h-12" />
          </Link>

          <nav aria-label="Primary" className="hidden min-w-0 lg:block">
            <ul className="flex items-center">
              {links.map((l) => {
                const current = l.href === home ? pathname === home : pathname.startsWith(l.href);
                return (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      aria-current={current ? "page" : undefined}
                      className={cn(
                        "group relative block whitespace-nowrap px-1.5 py-2 text-[0.86rem] font-medium transition-colors hover:text-graphite xl:px-2 xl:text-[0.94rem] 2xl:px-3 2xl:text-[1.02rem]",
                        current ? "text-graphite" : "text-steel",
                      )}
                    >
                      {l.label}
                      <span
                        aria-hidden
                        className={cn(
                          "absolute inset-x-1.5 bottom-1 h-px origin-left bg-accent transition-transform duration-300 ease-out group-hover:scale-x-100 group-focus-visible:scale-x-100 xl:inset-x-2 2xl:inset-x-3",
                          current ? "scale-x-100" : "scale-x-0",
                        )}
                      />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="relative z-[46] flex shrink-0 items-center gap-2">
            {/* the quote button needs room: shown on phones/tablets and wide desktops, not squeezed in at lg */}
            <Link href="/contact#enquiry" className={cn("xd-btn !hidden !h-11 !px-4 !text-[0.92rem] sm:!inline-flex lg:!hidden xl:!inline-flex", open && "invisible")}>
              Request a Quote <ArrowUpRight aria-hidden className="size-4" />
            </Link>
            <button
              ref={menuBtn}
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="xd-menu"
              aria-label={open ? "Close menu" : "Open menu"}
              className={cn(
                "inline-flex size-11 items-center justify-center rounded-lg transition-colors lg:hidden",
                open ? "text-white hover:bg-white/10" : "text-graphite shadow-[inset_0_0_0_1px_rgb(27_23_64/0.12)] hover:bg-white",
              )}
            >
              {open ? <X className="size-4" aria-hidden /> : <Menu className="size-4" aria-hidden />}
            </button>
          </div>
        </div>
        <motion.div aria-hidden className="absolute inset-x-0 bottom-0 h-px origin-left bg-accent/70" style={{ scaleX: progress }} />
      </header>

      {/* Chapter indicator: 01 / 08 · label, with a vertical progress line */}
      {rail && (
      <nav aria-label="Page chapters" className="group/rail fixed right-5 top-1/2 z-40 hidden -translate-y-1/2 lg:block">
        {/* glass backing keeps the rail readable when a dark board passes behind it */}
        <div className="xd-glass flex items-stretch gap-3 rounded-xl !bg-white/90 px-2.5 py-3">
          <div className="flex flex-col items-end justify-between py-1 text-right">
            <p className="font-mono text-[0.7rem] tabular-nums text-graphite" aria-hidden>
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                  key={current}
                  className="inline-block"
                  initial={{ y: 8, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -8, opacity: 0 }}
                  transition={{ duration: 0.35, ease: EASE }}
                >
                  {String(current + 1).padStart(2, "0")}
                </motion.span>
              </AnimatePresence>
              <span className="text-alu-dark"> / {String(chapters.length).padStart(2, "0")}</span>
            </p>
            <p className="max-w-[7rem] text-[0.62rem] font-medium uppercase leading-tight tracking-[0.18em] text-alu-dark [writing-mode:vertical-rl] rotate-180">
              {chapter?.label}
            </p>
          </div>
          <ul className="relative flex flex-col gap-2 py-1">
            <span aria-hidden className="absolute bottom-1 left-1/2 top-1 w-px -translate-x-1/2 bg-line" />
            <motion.span
              aria-hidden
              className="absolute left-1/2 top-1 w-px origin-top -translate-x-1/2 bg-graphite"
              style={{ scaleY: progress, height: "calc(100% - 0.5rem)" }}
            />
            {chapters.map((c, i) => (
              <li key={c.id} className="relative">
                <a
                  href={`#${c.id}`}
                  aria-current={current === i ? "true" : undefined}
                  className="group relative flex h-5 w-5 items-center justify-center"
                >
                  <span
                    className={cn(
                      "block rounded-full transition-all duration-300",
                      current === i ? "size-2 bg-accent ring-4 ring-accent/10" : "size-1 bg-alu group-hover:bg-graphite",
                    )}
                  />
                  <span className="pointer-events-none absolute right-8 whitespace-nowrap rounded-md bg-white px-2.5 py-1 text-[0.72rem] font-medium text-graphite opacity-0 shadow-[var(--shadow-soft)] ring-1 ring-line transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                    <span className="mr-1.5 font-mono text-alu-dark">{String(i + 1).padStart(2, "0")}</span>
                    {c.label}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </nav>
      )}

      <AnimatePresence>
        {open && (
          <motion.div
            id="xd-menu"
            key="xd-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Site menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: EASE }}
            className="xd-stage xd-on-dark fixed inset-0 z-[45] overflow-y-auto"
          >
            <div className="mx-auto grid min-h-full max-w-[110rem] content-center gap-10 px-6 pb-16 pt-24 md:grid-cols-[1.4fr_1fr] md:px-12">
              <ul>
                {links.map((l, i) => (
                  <motion.li
                    key={l.href}
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.06 + i * 0.035, duration: 0.5, ease: EASE }}
                  >
                    <Link
                      href={l.href}
                      onClick={() => setOpen(false)}
                      className="group flex items-baseline gap-4 py-1 font-display text-[clamp(1.6rem,4vw,3.25rem)] font-semibold leading-tight tracking-[-0.03em] text-white/80 transition-colors hover:text-white"
                    >
                      <span className="font-mono text-xs font-normal text-white/40">{String(i + 1).padStart(2, "0")}</span>
                      <span className="bg-gradient-to-r from-white to-white bg-[length:0%_1px] bg-left-bottom bg-no-repeat transition-[background-size] duration-500 group-hover:bg-[length:100%_1px]">
                        {l.label}
                      </span>
                    </Link>
                  </motion.li>
                ))}
              </ul>
              <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5, ease: EASE }}
                className="xd-glass-dark self-end rounded-xl p-7 text-white"
              >
                <p className="text-[0.7rem] font-medium uppercase tracking-[0.2em] text-white/55">Made in India · Since 2015</p>
                <p className="mt-4 font-display text-2xl font-semibold leading-snug tracking-[-0.02em]">Quality Jo Pehchaan Ban Jaaye.</p>
                <p className="mt-3 text-sm leading-relaxed text-white/70">
                  White, chalk, notice, magnetic and ceramic boards, stands, clipboards and school benches.
                </p>
                <Link href="/contact#enquiry" onClick={() => setOpen(false)} className="xd-btn mt-6">
                  Request a Quote <ArrowUpRight aria-hidden className="size-4" />
                </Link>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
