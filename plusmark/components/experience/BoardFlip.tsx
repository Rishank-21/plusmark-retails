"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { pinProgress, smooth } from "./scroll";

export interface FlipBeat {
  /** progress 0–1 where the caption is centred */
  at: number;
  kicker: string;
  title: string;
  text: string;
}

/** frame depth as a fraction of the board width (a 25 mm profile on a 3 ft board ≈ 3%) */
const DEPTH = 0.03;

/**
 * Designs D and E: "One board. Two writing experiences." A pinned studio stage where a
 * both-side board turns on scroll, built in CSS 3D from the real studio photos of the Eco
 * Premium chalk and white faces (scripts/both-side-faces.mjs), so both faces stay crisp and
 * bright at any size. Aluminium edges give it real depth; a moving sheen and a floor shadow
 * that narrows as the board turns edge-on sell the rotation. The face pills jump to either
 * side. Reduced motion follows the scroll without easing.
 */
export function BoardFlip({
  front,
  back,
  beats,
}: {
  front: { src: string; alt: string; label: string };
  back: { src: string; alt: string; label: string };
  beats: FlipBeat[];
}) {
  const section = useRef<HTMLElement>(null);
  const board = useRef<HTMLDivElement>(null);
  const [p, setP] = useState(0);
  const [bw, setBw] = useState(0);

  // eased scroll progress
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    let eased = pinProgress(section.current);
    const tick = () => {
      raf = 0;
      const target = pinProgress(section.current);
      eased = reduced ? target : eased + (target - eased) * 0.14;
      if (Math.abs(target - eased) < 0.0004) eased = target;
      setP(eased);
      if (eased !== target) raf = requestAnimationFrame(tick);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };
    setP(eased);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  // board width drives the 3D depth of the frame
  useEffect(() => {
    const el = board.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setBw(e.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // turn: chalk face → edge-on → white face, then a gentle settle toward the viewer
  const turn = smooth(0.24, 0.6, p);
  const settle = smooth(0.78, 0.98, p);
  const ry = 180 * turn - 14 * settle;
  const rx = 7 - 3 * Math.sin(turn * Math.PI);
  const lift = Math.sin(turn * Math.PI); // 1 while edge-on
  const side = turn; // 0 = chalk face on show, 1 = white face
  const d = Math.max(6, bw * DEPTH);
  const facing = Math.abs(Math.cos((ry * Math.PI) / 180));
  // sheen sweeps across the face as it turns
  const sheen = ((ry % 180) / 180) * 160 - 30;

  const jump = (target: number) => {
    const el = section.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY;
    const span = el.offsetHeight - window.innerHeight;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: top + span * target, behavior: reduced ? "auto" : "smooth" });
  };

  const edge = "absolute bg-[linear-gradient(90deg,#9aa0a8_0%,#eef0f3_35%,#c3c7cd_60%,#8d939b_100%)]";

  return (
    <section id="xd-film" ref={section} aria-labelledby="xd-film-title" className="relative z-10 h-[420vh]">
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[18vh] -translate-y-full bg-gradient-to-b from-transparent to-[#f3f1fb]" />
      <div className="sticky top-0 h-[100svh] overflow-hidden bg-[#f3f1fb] text-graphite">
        {/* studio backdrop */}
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(75%_65%_at_50%_45%,#ffffff_0%,#f7f5fd_45%,#e6e2f6_100%)]" />
        <div aria-hidden className="pointer-events-none absolute inset-0" style={{ opacity: 1 - side }}>
          <div className="absolute -left-[10%] top-[6%] size-[46vmax] rounded-full bg-[radial-gradient(closest-side,rgb(19_145_127/0.16),transparent)]" style={{ transform: `translate3d(${p * 12}vw,0,0)` }} />
          <div className="absolute -right-[12%] bottom-[-12%] size-[42vmax] rounded-full bg-[radial-gradient(closest-side,rgb(79_63_217/0.16),transparent)]" />
        </div>
        <div aria-hidden className="pointer-events-none absolute inset-0" style={{ opacity: side }}>
          <div className="absolute -right-[10%] top-[4%] size-[46vmax] rounded-full bg-[radial-gradient(closest-side,rgb(111_99_240/0.18),transparent)]" style={{ transform: `translate3d(${(1 - p) * -12}vw,0,0)` }} />
          <div className="absolute -left-[12%] bottom-[-12%] size-[42vmax] rounded-full bg-[radial-gradient(closest-side,rgb(232_119_63/0.14),transparent)]" />
        </div>
        {/* perspective floor */}
        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-[38%] overflow-hidden [perspective:700px]">
          <div
            className="absolute -inset-x-1/2 bottom-0 top-0 origin-bottom [background-image:linear-gradient(to_right,rgb(27_23_64/0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgb(27_23_64/0.06)_1px,transparent_1px)] [background-size:64px_64px] [mask-image:linear-gradient(to_top,black_10%,transparent_85%)] [transform:rotateX(64deg)]"
            style={{ backgroundPosition: `${p * -320}px ${p * 640}px` }}
          />
        </div>

        {/* the board */}
        <div aria-hidden className="absolute inset-0 flex items-center justify-center pt-[12svh] [perspective:1800px]">
          <div className="relative">
            {/* floor shadow narrows as the board turns edge-on */}
            <div
              className="absolute -bottom-[14%] left-1/2 h-[12%] w-[86%] rounded-[50%] bg-[radial-gradient(closest-side,rgb(27_23_64/0.34),transparent)] blur-md"
              style={{ transform: `translateX(-50%) scaleX(${0.18 + 0.82 * facing})`, opacity: 0.55 + 0.45 * facing }}
            />
            <div
              ref={board}
              className="relative aspect-[3/2] w-[min(84vw,calc(40svh*1.5))] [transform-style:preserve-3d] md:w-[min(48vw,calc(46svh*1.5))]"
              style={{ transform: `translateY(${-lift * 2}%) rotateX(${rx}deg) rotateY(${ry}deg)` }}
            >
              {/* front: chalk face */}
              <div className="absolute inset-0 [backface-visibility:hidden]" style={{ transform: `translateZ(${d / 2}px)` }}>
                <Image src={front.src} alt="" fill priority={false} sizes="(min-width: 768px) 56vw, 84vw" className="object-contain drop-shadow-[0_30px_40px_rgb(27_23_64/0.22)]" />
                <div className="pointer-events-none absolute inset-[3%] mix-blend-screen" style={{ background: `linear-gradient(105deg, transparent ${sheen}%, rgb(255 255 255 / 0.22) ${sheen + 12}%, transparent ${sheen + 26}%)` }} />
              </div>
              {/* back: white face */}
              <div className="absolute inset-0 [backface-visibility:hidden]" style={{ transform: `rotateY(180deg) translateZ(${d / 2}px)` }}>
                <Image src={back.src} alt="" fill sizes="(min-width: 768px) 56vw, 84vw" className="object-contain drop-shadow-[0_30px_40px_rgb(27_23_64/0.22)]" />
                <div className="pointer-events-none absolute inset-[3%] mix-blend-multiply" style={{ background: `linear-gradient(105deg, transparent ${sheen}%, rgb(27 23 64 / 0.06) ${sheen + 12}%, transparent ${sheen + 26}%)` }} />
              </div>
              {/* aluminium profile: right, left, top and bottom edges */}
              <div className={cn(edge, "inset-y-[1.2%] left-1/2")} style={{ width: d, marginLeft: -d / 2, transform: `rotateY(90deg) translateZ(${bw / 2 - 1}px)` }} />
              <div className={cn(edge, "inset-y-[1.2%] left-1/2")} style={{ width: d, marginLeft: -d / 2, transform: `rotateY(-90deg) translateZ(${bw / 2 - 1}px)` }} />
              <div
                className="absolute inset-x-[1.2%] top-1/2 bg-[linear-gradient(180deg,#9aa0a8_0%,#eef0f3_40%,#b9bec5_100%)]"
                style={{ height: d, marginTop: -d / 2, transform: `rotateX(90deg) translateZ(${(bw / 1.5) / 2 - 1}px)` }}
              />
              <div
                className="absolute inset-x-[1.2%] top-1/2 bg-[linear-gradient(180deg,#b9bec5_0%,#8d939b_100%)]"
                style={{ height: d, marginTop: -d / 2, transform: `rotateX(-90deg) translateZ(${(bw / 1.5) / 2 - 1}px)` }}
              />
            </div>
          </div>
        </div>

        <div className="relative mx-auto flex h-full max-w-[110rem] flex-col justify-between px-5 pb-10 pt-28 sm:px-10">
          <div className="flex items-start justify-between gap-6">
            <div>
              <p className="xd-eyebrow">Both side board · 360°</p>
              <h2 id="xd-film-title" className="mt-4 max-w-xl font-display text-[clamp(1.75rem,3.6vw,3.25rem)] font-semibold leading-[1.04] tracking-[-0.03em] text-graphite">
                One board. <span className="xd-grad-text">Two writing experiences.</span>
              </h2>
            </div>
            <div className="xd-glass hidden shrink-0 items-center gap-1 rounded-full p-1 text-[0.78rem] font-medium sm:flex" role="group" aria-label="Show a face">
              {[front, back].map((f, i) => {
                const on = i === 0 ? side < 0.5 : side >= 0.5;
                return (
                  <button
                    key={f.label}
                    type="button"
                    onClick={() => jump(i === 0 ? 0.1 : 0.7)}
                    aria-pressed={on}
                    className={cn("rounded-full px-3.5 py-1.5 transition-colors duration-300", on ? "bg-graphite text-white" : "text-steel hover:text-graphite")}
                  >
                    {f.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* the faces, described for screen readers (the 3D board itself is decorative) */}
          <p className="sr-only">
            {front.alt}. {back.alt}.
          </p>

          <div className="relative min-h-44 lg:mr-20">
            {beats.map((b, i) => {
              const o = 1 - smooth(0.05, 0.12, Math.abs(p - b.at));
              return (
                <div
                  key={b.title}
                  className={cn("xd-glass absolute bottom-0 max-w-sm rounded-xl p-5 md:p-6 lg:max-w-xs", i % 2 ? "right-0" : "left-0")}
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
