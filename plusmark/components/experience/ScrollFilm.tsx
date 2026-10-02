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

/** fraction of the frame height where the board's bottom edge sits (frames carry transparent padding) */
const BOARD_BOTTOM = 0.88;

/**
 * Scroll-scrubbed product film: the Drive footage of the Metallic Premium Both Side board
 * turning on its stand, exported as a frame sequence and drawn to a canvas so it scrubs
 * frame-accurately with the scroll (forwards and backwards) in every browser. Frames come from
 * scripts/clean-board-turn.mjs (transparent background, watermark and intro logo removed).
 *
 * The board sits in a bright studio: a soft backdrop whose colour shifts with the face on show,
 * a perspective floor, a drop shadow and a floor reflection drawn on the canvas, and a scrub
 * that eases toward the scroll position so the turn feels continuous instead of stepping.
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

  // Draw the frame for the (eased) scroll position.
  useEffect(() => {
    const c = canvas.current;
    const ctx = c?.getContext("2d");
    if (!c || !ctx) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    let last = -1;
    let eased = pinProgress(section.current);

    const paint = (v: number, force = false) => {
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
      // contained with breathing room for the heading and captions; phones use the full width
      const wide = w > h;
      const s = Math.min(w / img.naturalWidth, h / img.naturalHeight) * (wide ? 0.74 : 1.08);
      const dw = img.naturalWidth * s;
      const dh = img.naturalHeight * s;
      const x = (w - dw) / 2;
      const y = (h - dh) / 2 + h * (wide ? 0.06 : -0.1);
      const floor = y + dh * BOARD_BOTTOM;

      ctx.clearRect(0, 0, w, h);

      // floor reflection: mirrored about the board's bottom edge, faded out with distance
      ctx.save();
      ctx.globalAlpha = 0.16;
      ctx.translate(0, floor * 2);
      ctx.scale(1, -1);
      ctx.drawImage(img, x, y, dw, dh);
      ctx.restore();
      ctx.save();
      ctx.globalCompositeOperation = "destination-out";
      const fade = ctx.createLinearGradient(0, floor, 0, floor + dh * 0.22);
      fade.addColorStop(0, "rgba(0,0,0,0.1)");
      fade.addColorStop(1, "rgba(0,0,0,1)");
      ctx.fillStyle = fade;
      ctx.fillRect(0, floor, w, h - floor);
      ctx.restore();

      // the board, lifted off the backdrop by a soft indigo shadow
      ctx.save();
      ctx.shadowColor = "rgba(27, 23, 64, 0.32)";
      ctx.shadowBlur = 48 * dpr;
      ctx.shadowOffsetY = 26 * dpr;
      ctx.drawImage(img, x, y, dw, dh);
      ctx.restore();
    };

    const tick = () => {
      raf = 0;
      const target = pinProgress(section.current);
      eased = reduced ? target : eased + (target - eased) * 0.16;
      if (Math.abs(target - eased) < 0.0004) eased = target;
      setP(eased);
      paint(eased);
      if (eased !== target) raf = requestAnimationFrame(tick);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };
    const onResize = () => paint(eased, true);
    setP(eased);
    paint(eased, true);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(raf);
    };
  }, [frames, loaded]);

  const pct = Math.round((loaded / frames) * 100);
  // 0 while the chalk face is on show, 1 once the white face has turned to camera
  const side = smooth(0.42, 0.56, p);

  return (
    <section id="xd-film" ref={section} aria-labelledby="xd-film-title" className="relative z-10 h-[520vh]">
      {/* short soft hand-over from the section above into the studio */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[18vh] -translate-y-full bg-gradient-to-b from-transparent to-[#f3f1fb]" />
      <div className="sticky top-0 h-[100svh] overflow-hidden bg-[#f3f1fb] text-graphite">
        {/* studio backdrop: bright centre falling off to lavender */}
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(80%_70%_at_50%_42%,#ffffff_0%,#f6f4fd_45%,#e7e3f7_100%)]" />
        {/* colour washes that follow the face on show: cool indigo/teal for chalk, warm for white */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 transition-opacity duration-500"
          style={{ opacity: 1 - side }}
        >
          <div className="absolute -left-[10%] top-[8%] size-[48vmax] rounded-full bg-[radial-gradient(closest-side,rgb(79_63_217/0.22),transparent)]" style={{ transform: `translate3d(${p * 12}vw, ${p * -6}vh, 0)` }} />
          <div className="absolute -right-[12%] bottom-[-10%] size-[44vmax] rounded-full bg-[radial-gradient(closest-side,rgb(19_145_127/0.2),transparent)]" style={{ transform: `translate3d(${p * -10}vw, 0, 0)` }} />
        </div>
        <div aria-hidden className="pointer-events-none absolute inset-0" style={{ opacity: side }}>
          <div className="absolute -right-[10%] top-[4%] size-[48vmax] rounded-full bg-[radial-gradient(closest-side,rgb(111_99_240/0.22),transparent)]" style={{ transform: `translate3d(${(1 - p) * -12}vw, 0, 0)` }} />
          <div className="absolute -left-[12%] bottom-[-12%] size-[44vmax] rounded-full bg-[radial-gradient(closest-side,rgb(232_119_63/0.2),transparent)]" style={{ transform: `translate3d(${(1 - p) * 10}vw, 0, 0)` }} />
        </div>

        {/* perspective studio floor, gliding with the scroll */}
        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-[42%] overflow-hidden [perspective:700px]">
          <div
            className="absolute -inset-x-1/2 bottom-0 top-0 origin-bottom [background-image:linear-gradient(to_right,rgb(27_23_64/0.07)_1px,transparent_1px),linear-gradient(to_bottom,rgb(27_23_64/0.07)_1px,transparent_1px)] [background-size:64px_64px] [mask-image:linear-gradient(to_top,black_10%,transparent_85%)] [transform:rotateX(64deg)]"
            style={{ backgroundPosition: `${p * -320}px ${p * 640}px` }}
          />
        </div>

        {/* frames carry real alpha; shadow and reflection are drawn with them on the canvas */}
        <canvas
          ref={canvas}
          aria-hidden
          className="absolute inset-0 size-full"
          style={{ backgroundImage: loaded ? undefined : `url(${poster})`, backgroundSize: "contain", backgroundPosition: "center", backgroundRepeat: "no-repeat" }}
        />

        <div className="relative mx-auto flex h-full max-w-[110rem] flex-col justify-between px-5 pb-10 pt-28 sm:px-10">
          <div className="flex items-start justify-between gap-6">
            <div>
              <p className="xd-eyebrow">Scroll-scrubbed film · 360°</p>
              <h2 id="xd-film-title" className="mt-4 max-w-xl font-display text-[clamp(1.75rem,3.6vw,3.25rem)] font-semibold leading-[1.04] tracking-[-0.03em] text-graphite">
                One board. <span className="xd-grad-text">Two writing experiences.</span>
              </h2>
            </div>
            {/* which face is on show; loading progress until the frames are in */}
            <div className="xd-glass hidden shrink-0 items-center gap-1 rounded-full p-1 text-[0.78rem] font-medium sm:flex">
              {loaded < frames ? (
                <span className="px-3 py-1 font-mono tabular-nums text-steel">Loading {pct}%</span>
              ) : (
                (["Chalk face", "White face"] as const).map((label, i) => {
                  const on = i === 0 ? side < 0.5 : side >= 0.5;
                  return (
                    <span
                      key={label}
                      className={cn(
                        "rounded-full px-3.5 py-1.5 transition-colors duration-300",
                        on ? "bg-graphite text-white" : "text-steel",
                      )}
                    >
                      {label}
                    </span>
                  );
                })
              )}
            </div>
          </div>

          {/* right inset keeps right-hand captions clear of the chapter rail */}
          <div className="relative min-h-44 lg:mr-20">
            {beats.map((b, i) => {
              const d = Math.abs(p - b.at);
              const o = 1 - smooth(0.04, 0.11, d);
              return (
                <div
                  key={b.title}
                  className={cn(
                    "xd-glass absolute bottom-0 max-w-sm rounded-xl p-5 md:p-6 lg:max-w-xs",
                    i % 2 ? "right-0" : "left-0",
                  )}
                  style={{ opacity: o, transform: `translate3d(0, ${(1 - o) * 30}px, 0)`, visibility: o < 0.01 ? "hidden" : "visible" }}
                  aria-hidden={o < 0.5}
                >
                  <p className="text-[0.66rem] font-semibold uppercase tracking-[0.2em] text-accent">{b.kicker}</p>
                  <p className="mt-2 font-display text-lg font-semibold tracking-[-0.02em] text-graphite md:text-xl">{b.title}</p>
                  <p className="mt-2 text-sm leading-relaxed text-steel">{b.text}</p>
                </div>
              );
            })}
          </div>

          <div aria-hidden className="h-[3px] w-full overflow-hidden rounded-full bg-graphite/10">
            <div className="h-full origin-left rounded-full bg-gradient-to-r from-accent to-[#6f63f0]" style={{ transform: `scaleX(${p})` }} />
          </div>
        </div>
      </div>
    </section>
  );
}
