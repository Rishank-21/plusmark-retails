"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X, ArrowRight, ChevronDown, Package } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { moreNavLinks, primaryNavLinks } from "@/lib/seo";
import { cn } from "@/lib/utils";

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
    setMoreOpen(false);
  }, [pathname]);

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
            // Keep the fixed header opaque so scrolling content never shows through it.
            "bg-white/95 shadow-[0_8px_28px_-18px_rgb(20_25_30/0.45)] backdrop-blur-xl",
          )}
        >
          <Link
            href="/"
            aria-label="Plusmark Display System — Home"
            className="shrink-0"
          >
            <Logo />
          </Link>

          <ul className="hidden items-center gap-0.5 rounded-full p-1 xl:flex">
            {primaryNavLinks.map((l) => (
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
            <li className="relative">
              <button
                type="button"
                aria-expanded={moreOpen}
                onClick={() => setMoreOpen((value) => !value)}
                className={cn(
                  "relative flex items-center gap-1 rounded-full px-3 py-2 text-[0.84rem] font-medium transition-colors duration-300",
                  moreNavLinks.some((link) => isActive(link.href))
                    ? "bg-graphite text-white shadow-[0_6px_16px_-8px_rgb(15_17_19/0.6)]"
                    : "text-steel hover:bg-graphite/[0.06] hover:text-graphite",
                )}
              >
                More <ChevronDown className={cn("size-3.5 transition-transform", moreOpen && "rotate-180")} />
              </button>
              <AnimatePresence>
                {moreOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    className="absolute right-0 top-full mt-2 min-w-48 rounded-2xl bg-white p-2 shadow-[0_18px_40px_-20px_rgb(20_25_30/0.45)] ring-1 ring-fog"
                  >
                    {moreNavLinks.map((l) => (
                      <Link
                        key={l.href}
                        href={l.href}
                        className={cn(
                          "block rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                          isActive(l.href)
                            ? "bg-mist text-graphite"
                            : "text-steel hover:bg-mist hover:text-graphite",
                        )}
                      >
                        {l.label}
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </li>
          </ul>

          <div className="flex items-center gap-2">
            <Link
              href="/products"
              aria-label="Browse products"
              title="Browse products"
              className="inline-flex size-10 items-center justify-center rounded-full text-graphite hover:bg-mist xl:hidden"
            >
              <Package aria-hidden className="size-5" />
            </Link>
            <Link
              href="/contact#enquiry"
              className="btn-sheen group hidden h-10 items-center gap-2 rounded-full bg-gradient-to-r from-brand to-accent px-5 text-[0.8rem] font-semibold text-white shadow-[var(--shadow-glow)] transition-[filter] hover:brightness-110 sm:inline-flex"
            >
              Request Enquiry
              <ArrowRight
                aria-hidden
                className="size-3.5 transition-transform group-hover:translate-x-0.5"
              />
            </Link>
            <a
              href="https://www.amazon.in/stores/PLUSMARKRETAIL/page/80295B88-1EB8-4F7C-A64B-2522D35BEA28?lp_asin=B0HHBTPTPQ&ref_=ast_bln"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden h-10 items-center rounded-full bg-[#ffd966] px-5 text-[0.8rem] font-semibold text-[#131921] shadow-[inset_0_-2px_0_rgb(0_0_0/0.12)] transition-colors hover:bg-[#f7ca00] sm:inline-flex"
            >
              Buy on Amazon
            </a>
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
              {primaryNavLinks.map((l, i) => (
                <motion.li
                  key={l.href}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: 0.04 * i,
                    duration: 0.5,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="border-b border-fog"
                >
                  <Link
                    href={l.href}
                    aria-current={isActive(l.href) ? "page" : undefined}
                    className="flex items-center justify-between py-4 font-display text-2xl font-semibold"
                  >
                    <span
                      className={
                        isActive(l.href) ? "text-accent" : "text-graphite"
                      }
                    >
                      {l.label}
                    </span>
                    <span className="font-mono text-xs text-alu-dark">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </Link>
                </motion.li>
              ))}
              <li className="border-b border-fog pt-5">
                <p className="font-mono text-[0.66rem] uppercase tracking-[0.14em] text-steel">More</p>
                <ul className="mt-1">
                  {moreNavLinks.map((l, i) => (
                    <li key={l.href}>
                      <Link
                        href={l.href}
                        aria-current={isActive(l.href) ? "page" : undefined}
                        className="flex items-center justify-between py-4 font-display text-2xl font-semibold"
                      >
                        <span className={isActive(l.href) ? "text-accent" : "text-graphite"}>{l.label}</span>
                        <span className="font-mono text-xs text-alu-dark">
                          {String(primaryNavLinks.length + i + 1).padStart(2, "0")}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>
            </ul>
            <div className="container-x py-8">
              <Link
                href="/contact#enquiry"
                className="flex h-14 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-brand to-accent text-sm font-semibold text-white shadow-[var(--shadow-glow)]"
              >
                Request Enquiry <ArrowRight aria-hidden className="size-4" />
              </Link>
              <a
                href="https://www.amazon.in/stores/PLUSMARKRETAIL/page/80295B88-1EB8-4F7C-A64B-2522D35BEA28?lp_asin=B0HHBTPTPQ&ref_=ast_bln"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 flex h-14 items-center justify-center rounded-full bg-[#ffd966] text-sm font-semibold text-[#131921] transition-colors hover:bg-[#f7ca00]"
              >
                Buy on Amazon
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
