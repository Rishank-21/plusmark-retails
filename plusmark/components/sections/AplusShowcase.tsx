"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, ArrowUpRight, ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { AMAZON_STORE_URL, APLUS_HEIGHT, APLUS_WIDTH, type AplusLine } from "@/data/aplus";
import { cn, pad2 } from "@/lib/utils";

/** How long each banner stays on screen while the showcase plays (ms). */
const DWELL = 5000;

/**
 * Amazon A+ explainer banners for all six Plusmark Retail lines (the design E showroom). A
 * product-line rail on the left, one uncropped banner on a lit stage with
 * story-style progress segments, and a labelled chapter strip underneath. Banners change on
 * their own every few seconds while the showcase is on screen; the pause button stops it, and
 * keyboard focus inside holds it so nothing moves under a keyboard user.
 */
export function AplusShowcase({ lines }: { lines: AplusLine[] }) {
  const root = useRef<HTMLDivElement>(null);
  const strip = useRef<HTMLUListElement>(null);
  const [lineIdx, setLineIdx] = useState(0);
  const [imgIdx, setImgIdx] = useState(0);
  const [inView, setInView] = useState(false);
  const [hold, setHold] = useState(false);
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(false);
  /** time already spent on the current banner, so a pause resumes instead of restarting */
  const elapsed = useRef(0);

  const line = lines[lineIdx];
  const img = line.images[imgIdx];
  const count = line.images.length;
  const playing = inView && !hold && !paused;

  useEffect(() => setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches), []);

  // "in view" = any part of the showcase inside the middle of the screen (works however tall it is)
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { rootMargin: "-20% 0px -20% 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // a new banner starts its full dwell time (declared before the timer so it runs first)
  useEffect(() => {
    elapsed.current = 0;
  }, [lineIdx, imgIdx]);

  // autoplay timer: last banner of a line hands over to the next line. A JS timer rather than
  // the CSS segment's animationend, so it also runs when animations are reduced or disabled.
  useEffect(() => {
    if (!playing) return;
    const start = performance.now();
    const id = window.setTimeout(() => {
      if (imgIdx < count - 1) setImgIdx(imgIdx + 1);
      else {
        setLineIdx((lineIdx + 1) % lines.length);
        setImgIdx(0);
      }
    }, Math.max(0, DWELL - elapsed.current));
    return () => {
      window.clearTimeout(id);
      elapsed.current += performance.now() - start;
    };
  }, [playing, lineIdx, imgIdx, count, lines.length]);

  // keep the active chapter visible in the strip (horizontal scroll only, never the page)
  useEffect(() => {
    const list = strip.current;
    const item = list?.children[imgIdx] as HTMLElement | undefined;
    if (!list || !item) return;
    const left = item.offsetLeft - (list.clientWidth - item.clientWidth) / 2;
    list.scrollTo({ left, behavior: reduced ? "auto" : "smooth" });
  }, [imgIdx, lineIdx, reduced]);

  const pickLine = (i: number) => {
    setLineIdx(i);
    setImgIdx(0);
  };
  const step = (d: number) => setImgIdx((i) => (i + d + count) % count);

  return (
    <div
      ref={root}
      className="grid gap-8 lg:grid-cols-[17rem_minmax(0,1fr)] lg:gap-10 xl:grid-cols-[19rem_minmax(0,1fr)]"
      onFocus={(e) => e.target.matches(":focus-visible") && setHold(true)}
      onBlur={(e) => !e.currentTarget.contains(e.relatedTarget as Node | null) && setHold(false)}
    >
      {/* Product lines: horizontal chips on phones, a vertical rail on desktop */}
      <div
        role="tablist"
        aria-label="Plusmark Retail product line"
        className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 [scrollbar-width:none] lg:mx-0 lg:flex-col lg:gap-1.5 lg:overflow-visible lg:px-0 lg:pb-0"
      >
        {lines.map((l, i) => {
          const on = i === lineIdx;
          return (
            <button
              key={l.id}
              role="tab"
              type="button"
              id={`aplus-tab-${l.id}`}
              aria-selected={on}
              aria-controls="aplus-panel"
              onClick={() => pickLine(i)}
              className={cn(
                "group relative shrink-0 overflow-hidden rounded-2xl text-left transition-[background-color,box-shadow,color] duration-300",
                "px-4 py-2.5 lg:px-5 lg:py-4",
                on
                  ? "bg-graphite text-white shadow-[0_18px_40px_-24px_rgb(15_17_19/0.6)]"
                  : "bg-white text-graphite ring-1 ring-line hover:ring-graphite/40 lg:bg-transparent lg:ring-0 lg:hover:bg-white lg:hover:ring-1 lg:hover:ring-line",
              )}
            >
              <span className="flex items-center gap-3">
                <span className={cn("hidden font-mono text-[0.66rem] tabular-nums lg:inline", on ? "text-white/60" : "text-steel")}>{pad2(i + 1)}</span>
                <span className="whitespace-nowrap text-sm font-semibold lg:whitespace-normal lg:font-display lg:text-[0.98rem]">
                  <span className="lg:hidden">{l.short}</span>
                  <span className="hidden lg:inline">{l.name}</span>
                </span>
              </span>
              <span className={cn("mt-1.5 hidden pl-7 text-xs leading-relaxed lg:block", on ? "text-white/70" : "text-steel")}>{l.tagline}</span>
              {/* how far through this line the showcase is */}
              {on && (
                <span aria-hidden className="absolute inset-x-0 bottom-0 h-0.5 bg-white/15">
                  <span
                    className="block h-full origin-left bg-accent transition-transform duration-500 ease-[var(--ease-premium)]"
                    style={{ transform: `scaleX(${(imgIdx + 1) / count})` }}
                  />
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div id="aplus-panel" role="tabpanel" aria-labelledby={`aplus-tab-${line.id}`} className="min-w-0">
        {/* Stage: the banner, uncropped, lifted off an ambient glow of itself */}
        <div className="relative">
          <div aria-hidden className="pointer-events-none absolute -inset-x-4 -inset-y-6 overflow-hidden rounded-[2.5rem] opacity-60 blur-3xl saturate-150 md:-inset-x-8">
            <Image key={`glow-${img.src}`} src={img.src} alt="" fill sizes="240px" quality={30} className="animate-[fade_0.9s_var(--ease-premium)_both] object-cover" />
          </div>

          <div className="relative overflow-hidden rounded-[1.25rem] bg-white shadow-[0_2px_4px_rgb(15_17_19/0.05),0_40px_80px_-40px_rgb(15_17_19/0.55)] ring-1 ring-black/5 md:rounded-[1.75rem]">
            <div className="relative" style={{ aspectRatio: `${APLUS_WIDTH} / ${APLUS_HEIGHT}` }}>
              <Image
                key={img.src}
                src={img.src}
                alt={img.alt}
                fill
                priority={lineIdx === 0 && imgIdx === 0}
                sizes="(min-width: 1408px) 1040px, (min-width: 1024px) 72vw, 100vw"
                quality={85}
                className="animate-[aplus-in_0.9s_var(--ease-premium)_both] object-cover"
              />
            </div>

            {/* story-style progress: one segment per banner, the live one fills while it plays */}
            <div aria-hidden className="absolute inset-x-3 top-3 flex gap-1 md:inset-x-5 md:top-4 md:gap-1.5">
              {line.images.map((im, i) => (
                <span key={im.src} className="h-[3px] flex-1 overflow-hidden rounded-full bg-black/15 backdrop-blur-sm">
                  <span
                    key={i === imgIdx ? `${line.id}-${imgIdx}` : undefined}
                    className="block h-full origin-left rounded-full bg-white shadow-[0_0_6px_rgb(0_0_0/0.25)]"
                    style={
                      i < imgIdx
                        ? { transform: "scaleX(1)" }
                        : i > imgIdx
                          ? { transform: "scaleX(0)" }
                          : reduced
                            ? { transform: "scaleX(1)" }
                            : { animation: `aplus-seg ${DWELL}ms linear forwards`, animationPlayState: playing ? "running" : "paused" }
                    }
                  />
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Caption + controls, kept off the banner so its own artwork is never covered */}
        <div className="mt-6 flex items-center justify-between gap-4">
          <div className="min-w-0" aria-live="polite">
            <p className="font-mono text-[0.66rem] uppercase tracking-[0.16em] text-steel">
              {pad2(imgIdx + 1)} / {pad2(count)} · <span className="text-accent">{img.label}</span>
            </p>
            <p className="mt-1 truncate text-sm text-graphite md:text-[0.95rem]">{img.alt}</p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={() => setPaused((v) => !v)}
              aria-label={paused ? "Play the banner showcase" : "Pause the banner showcase"}
              className="flex size-10 items-center justify-center rounded-full bg-white text-graphite ring-1 ring-line transition hover:ring-graphite"
            >
              {paused ? <Play aria-hidden className="size-4" /> : <Pause aria-hidden className="size-4" />}
            </button>
            <button
              type="button"
              onClick={() => step(-1)}
              aria-label="Previous banner"
              className="flex size-10 items-center justify-center rounded-full bg-white text-graphite ring-1 ring-line transition hover:ring-graphite"
            >
              <ChevronLeft aria-hidden className="size-5" />
            </button>
            <button
              type="button"
              onClick={() => step(1)}
              aria-label="Next banner"
              className="flex size-10 items-center justify-center rounded-full bg-graphite text-white transition hover:brightness-110"
            >
              <ChevronRight aria-hidden className="size-5" />
            </button>
          </div>
        </div>

        {/* Chapter strip: every banner of the line, labelled */}
        <ul
          ref={strip}
          aria-label={`${line.name} banners`}
          className="mask-fade-x -mx-1 mt-5 flex snap-x gap-3 overflow-x-auto px-1 pb-2 pt-1 [scrollbar-width:none]"
        >
          {line.images.map((im, i) => {
            const on = i === imgIdx;
            return (
              <li key={im.src} className="w-[9.5rem] shrink-0 snap-start md:w-[11rem]">
                <button
                  type="button"
                  onClick={() => setImgIdx(i)}
                  aria-label={`Show banner ${i + 1}: ${im.label}`}
                  aria-current={on ? "true" : undefined}
                  className="group block w-full text-left"
                >
                  <span
                    className={cn(
                      "block overflow-hidden rounded-xl ring-2 ring-offset-2 ring-offset-paper transition duration-300",
                      on ? "ring-accent" : "ring-transparent opacity-65 group-hover:opacity-100",
                    )}
                  >
                    <Image
                      src={im.src}
                      alt=""
                      width={352}
                      height={144}
                      sizes="176px"
                      className="h-auto w-full transition-transform duration-500 ease-[var(--ease-premium)] group-hover:scale-[1.04]"
                    />
                  </span>
                  <span className={cn("mt-2 flex items-baseline gap-1.5 text-xs", on ? "font-semibold text-graphite" : "text-steel")}>
                    <span className="font-mono text-[0.62rem] text-steel">{pad2(i + 1)}</span>
                    {im.label}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>

        <div className="mt-8 flex flex-col gap-4 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-display text-xl font-semibold">{line.name}</p>
            <p className="mt-1 text-sm text-steel">{line.tagline}</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {line.productSlug && (
              <Link
                href={`/products/${line.productSlug}`}
                className="inline-flex h-11 items-center gap-2 rounded-full bg-graphite px-5 text-sm font-semibold text-white transition hover:brightness-110"
              >
                View product <ArrowRight aria-hidden className="size-4" />
              </Link>
            )}
            <a
              href={line.amazonUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-11 items-center gap-2 rounded-full bg-white px-5 text-sm font-semibold text-graphite ring-1 ring-line transition hover:ring-graphite"
            >
              View on Amazon <ArrowUpRight aria-hidden className="size-4" />
            </a>
            <a
              href={AMAZON_STORE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="link-underline inline-flex h-11 items-center text-sm font-medium text-steel"
            >
              All Plusmark Retail listings
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
