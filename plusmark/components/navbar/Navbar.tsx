"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X, ArrowRight } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { navLinks } from "@/lib/seo";
import { cn } from "@/lib/utils";

export function Navbar() {
  const pathname = usePathname();
  const [overlay, setOverlay] = useState(true);
  const [open, setOpen] = useState(false);

  // Transparent while an element marked [data-nav-overlay] sits behind the bar
  // (the pinned hero), otherwise solid once the page is scrolled.
  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const el = document.querySelector<HTMLElement>("[data-nav-overlay]");
      if (el) {
        const r = el.getBoundingClientRect();
        setOverlay(r.top <= 1 && r.bottom >= window.innerHeight - 2);
      } else {
        setOverlay(window.scrollY < 8);
      }
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
  }, [pathname]);

  useEffect(() => setOpen(false), [pathname]);

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

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 animate-[fade_0.9s_var(--ease-premium)_both] transition-[padding] duration-500 ease-[var(--ease-premium)]",
        "pt-2 md:pt-3",
      )}
    >
      <div className="mx-auto w-full max-w-[104rem] px-2 sm:px-4 md:px-6">
      <nav
        aria-label="Primary"
        className={cn(
          "flex h-[68px] items-center justify-between gap-4 rounded-full px-4 transition-[background-color,box-shadow,backdrop-filter] duration-500 sm:px-6 md:h-[76px] md:px-8",
          // Always a light glass bar so the logo keeps its contrast over the hero, too.
          overlay && !open ? "bg-white/55 shadow-[inset_0_0_0_1px_rgb(255_255_255/0.7)] backdrop-blur-md" : "glass",
        )}
      >
        <Link href="/" aria-label="Plusmark Display System — Home" className="shrink-0">
          <Logo />
        </Link>

        <ul className="hidden items-center gap-0.5 rounded-full p-1 xl:flex">
          {navLinks.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                aria-current={isActive(l.href) ? "page" : undefined}
                className={cn(
                  "relative block rounded-full px-3 py-2 text-[0.84rem] font-medium transition-colors duration-300",
                  isActive(l.href)
                    ? "bg-graphite text-white shadow-[0_6px_16px_-8px_rgb(15_17_19/0.6)]"
                    : "text-steel hover:bg-graphite/[0.06] hover:text-graphite",
                )}
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <Link
            href="/contact#enquiry"
            className="btn-sheen group hidden h-10 items-center gap-2 rounded-full bg-gradient-to-r from-brand to-accent px-5 text-[0.8rem] font-semibold text-white shadow-[var(--shadow-glow)] transition-[filter] hover:brightness-110 sm:inline-flex"
          >
            Request Enquiry
            <ArrowRight aria-hidden className="size-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <button
            type="button"
            className="inline-flex size-10 items-center justify-center text-graphite xl:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </nav>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            key="mobile-menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-x-0 bottom-0 top-[84px] overflow-y-auto md:top-[92px] bg-white/95 backdrop-blur-xl xl:hidden"
          >
            <ul className="container-x flex flex-col pt-6">
              {navLinks.map((l, i) => (
                <motion.li
                  key={l.href}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.04 * i, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  className="border-b border-fog"
                >
                  <Link
                    href={l.href}
                    aria-current={isActive(l.href) ? "page" : undefined}
                    className="flex items-center justify-between py-4 font-display text-2xl font-semibold"
                  >
                    <span className={isActive(l.href) ? "text-accent" : "text-graphite"}>{l.label}</span>
                    <span className="font-mono text-xs text-alu-dark">{String(i + 1).padStart(2, "0")}</span>
                  </Link>
                </motion.li>
              ))}
            </ul>
            <div className="container-x py-8">
              <Link
                href="/contact#enquiry"
                className="flex h-14 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-brand to-accent text-sm font-semibold text-white shadow-[var(--shadow-glow)]"
              >
                Request Enquiry <ArrowRight aria-hidden className="size-4" />
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
