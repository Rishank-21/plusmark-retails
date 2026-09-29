"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { pinProgress, smooth } from "./scroll";

export interface FilmBeat {
  /** progress 0–1 where the caption is centred */
  at: number;
  kicker: string;
  title: string;
  text: string;
}

/**
 * Scroll-scrubbed product film: the Drive footage of the Metallic Premium Both Side board
 * turning on its stand, exported as a frame sequence and drawn to a canvas so it scrubs
 * frame-accurately with the scroll (forwards and backwards) in every browser. The studio's
 * dark backdrop is blended away with `screen` over a violet stage, so no black shows.
 */
export function ScrollFilm({
  frames,
  path,
  beats,
  poster,
}: {
  frames: number;
  /** e.g. "/sequence/board-turn/" → 001.webp … */
  path: string;
  beats: FilmBeat[];
  poster: string;
}) {
  const section = useRef<HTMLElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const images = useRef<HTMLImageElement[]>([]);
  const [p, setP] = useState(0);
  const [loaded, setLoaded] = useState(0);

  // Load frames once the section is near (first frame is the poster, loaded eagerly).
  useEffect(() => {
    const el = section.current;
    if (!el) return;
    let cancelled = false;
    const start = () => {
      let done = 0;
      for (let i = 0; i < frames; i++) {
        const img = new Image();
        img.decoding = "async";
        img.src = `${path}${String(i + 1).padStart(3, "0")}.webp`;
        img.onload = () => !cancelled && setLoaded(++done);
        images.current[i] = img;
      }
    };
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          io.disconnect();
          start();
        }
      },
      { rootMargin: "150% 0px" },
    );
    io.observe(el);
    return () => {
      cancelled = true;
      io.disconnect();
    };
  }, [frames, path]);

  // Draw the frame for the current scroll position.
  useEffect(() => {
    const c = canvas.current;
    const ctx = c?.getContext("2d");
    if (!c || !ctx) return;
    let raf = 0;
    let last = -1;
    const draw = (force = false) => {
      const v = pinProgress(section.current);
      setP(v);
      // film runs over the middle 90% of the pinned span
      const t = smooth(0.03, 0.95, v);
      let i = Math.round(t * (frames - 1));
      // nearest loaded frame
      while (i > 0 && !images.current[i]?.complete) i--;
      const img = images.current[i];
      if (!img?.complete || !img.naturalWidth || (!force && i === last)) return;
      last = i;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = c.clientWidth * dpr;
      const h = c.clientHeight * dpr;
      if (c.width !== w || c.height !== h) {
        c.width = w;
        c.height = h;
      }
      // contain on wide screens, a light crop on tall ones
      const s = Math.max(Math.min(w / img.naturalWidth, h / img.naturalHeight), (h / img.naturalHeight) * 0.9);
      const dw = img.naturalWidth * s;
      const dh = img.naturalHeight * s;
      ctx.clearRect(0, 0, w, h);
      ctx.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh);
    };
    const onScroll = () => {
      if (!raf)
        raf = requestAnimationFrame(() => {
          raf = 0;
          draw();
        });
    };
    const onResize = () => draw(true);
    draw(true);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(raf);
    };
  }, [frames, loaded]);

  const pct = Math.round((loaded / frames) * 100);

  return (
    <section id="xd-film" ref={section} aria-labelledby="xd-film-title" className="relative z-10 h-[520vh]">
      <div className="xd-stage sticky top-0 h-[100svh] overflow-hidden text-white">
        {/* giant outline type drifting behind the board */}
        <p
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 select-none whitespace-nowrap text-center font-display text-[24vw] font-bold leading-none text-transparent [-webkit-text-stroke:1px_rgb(255_255_255/0.12)]"
          style={{ transform: `translate3d(${(0.5 - p) * 30}%, -50%, 0)` }}
        >
          BOTH SIDES
        </p>
        <canvas
          ref={canvas}
          aria-hidden
          className="absolute inset-0 size-full mix-blend-screen"
          style={{ backgroundImage: loaded ? undefined : `url(${poster})`, backgroundSize: "contain", backgroundPosition: "center", backgroundRepeat: "no-repeat" }}
        />
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_60%_at_50%_50%,transparent_55%,rgb(42_31_110/0.65)_100%)]" />

        <div className="relative mx-auto flex h-full max-w-[110rem] flex-col justify-between px-5 pb-10 pt-28 sm:px-10">
          <div className="flex items-start justify-between gap-6">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.22em] text-white/60">Scroll-scrubbed film · 360°</p>
              <h2 id="xd-film-title" className="mt-3 max-w-xl font-display text-[clamp(1.6rem,3.4vw,3rem)] font-semibold leading-[1.05]">
                One board. <span className="xd-grad-text">Two writing experiences.</span>
              </h2>
            </div>
            <p className="xd-glass-dark hidden rounded-full px-4 py-2 font-mono text-xs tabular-nums text-white/80 sm:block">
              {loaded < frames ? `Loading ${pct}%` : `Frame ${String(Math.round(smooth(0.03, 0.95, p) * (frames - 1)) + 1).padStart(3, "0")} / ${frames}`}
            </p>
          </div>

          <div className="relative min-h-44">
            {beats.map((b, i) => {
              const d = Math.abs(p - b.at);
              const o = 1 - smooth(0.04, 0.11, d);
              return (
                <div
                  key={b.title}
                  className={cn(
                    "xd-glass-dark absolute bottom-0 max-w-md rounded-3xl p-6 transition-[filter] md:p-7",
                    i % 2 ? "right-0" : "left-0",
                  )}
                  style={{ opacity: o, transform: `translate3d(0, ${(1 - o) * 30}px, 0)`, visibility: o < 0.01 ? "hidden" : "visible" }}
                  aria-hidden={o < 0.5}
                >
                  <p className="font-mono text-[0.68rem] uppercase tracking-[0.2em] text-[#8ee8fb]">{b.kicker}</p>
                  <p className="mt-2 font-display text-xl font-semibold md:text-2xl">{b.title}</p>
                  <p className="mt-2 text-sm leading-relaxed text-white/75">{b.text}</p>
                </div>
              );
            })}
          </div>

          <div aria-hidden className="h-1 w-full overflow-hidden rounded-full bg-white/15">
            <div className="h-full rounded-full bg-gradient-to-r from-[#a996ff] via-[#12c2e9] to-[#ffb08a]" style={{ width: `${p * 100}%` }} />
          </div>
        </div>
      </div>
    </section>
  );
}
