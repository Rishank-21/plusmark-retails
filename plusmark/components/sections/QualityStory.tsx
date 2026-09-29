"use client";

import { useEffect, useRef, useState } from "react";
import { qualitySteps } from "@/data/quality";
import { cn, pad2 } from "@/lib/utils";

/**
 * Scroll storytelling: an exploded board assembly (CSS 3D, no WebGL) whose layers
 * come together step by step — Material → Frame → Surface → Construction → QC → Finished.
 * Text is server-rendered by the parent through the `steps` data; works fully without JS.
 */
export function QualityStory() {
  const root = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  // Active step = the step whose box spans 55% of the viewport height (works for jumps & both directions).
  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const el = root.current;
      if (!el) return;
      const line = window.innerHeight * 0.55;
      const steps = el.querySelectorAll<HTMLElement>("[data-q-step]");
      let idx = 0;
      steps.forEach((node, i) => {
        if (node.getBoundingClientRect().top < line) idx = i;
      });
      setActive(idx);
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
  }, []);

  const assembled = active >= 5;
  // layer: [base z when exploded, activating step]
  const layers = [
    { name: "Backing", z: -60, step: 0, cls: "bg-[#3a3d41]" },
    { name: "Core", z: -20, step: 0, cls: "bg-[#d8cdb8]" },
    { name: "Surface", z: 30, step: 2, cls: "bg-white shadow-[inset_0_0_0_1px_#e5e5e2]" },
  ];

  return (
    <div ref={root} className="grid gap-12 lg:grid-cols-2 lg:gap-20">
      {/* Visual */}
      {/*
        Sticky on every breakpoint so the assembly stays in view while the steps scroll past.
        self-start matters: a stretched grid item is as tall as the row and can't stick.
      */}
      <div className="sticky top-[88px] z-10 -mx-2 self-start rounded-[1.75rem] bg-white/80 p-2 backdrop-blur-md lg:top-[calc(50vh-15rem)] lg:mx-0 lg:h-[30rem] lg:bg-transparent lg:p-0 lg:backdrop-blur-none">
        <div className="relative mx-auto aspect-square max-w-[16rem] overflow-hidden rounded-3xl studio-bg shadow-[var(--shadow-soft)] ring-1 ring-fog [perspective:1400px] sm:max-w-[20rem] lg:max-w-[30rem]">
          <div aria-hidden className="grid-lines absolute inset-0 opacity-70" />
          <div
            aria-hidden
            className="absolute left-1/2 top-1/2 h-[40%] w-[54%] [transform-style:preserve-3d] transition-transform duration-[1200ms] ease-[var(--ease-premium)]"
            style={{ transform: `translate(-50%,-50%) rotateX(${assembled ? 18 : 56}deg) rotateZ(${assembled ? -6 : -32}deg)` }}
          >
            {layers.map((l) => (
              <div
                key={l.name}
                className={cn(
                  "absolute inset-0 transition-[transform,opacity] duration-[1100ms] ease-[var(--ease-premium)]",
                  l.cls,
                  active >= l.step ? "opacity-100" : "opacity-20",
                )}
                style={{ transform: `translateZ(${assembled ? (l.name === "Surface" ? 4 : 0) : l.z}px)` }}
              />
            ))}
            {/* Frame */}
            <div
              className={cn(
                "absolute -inset-[4%] shadow-[inset_0_0_0_12px_#c3c7cc,inset_0_0_0_13px_#8b9198] transition-[transform,opacity] duration-[1100ms] ease-[var(--ease-premium)]",
                active >= 1 ? "opacity-100" : "opacity-15",
              )}
              style={{ transform: `translateZ(${assembled ? 8 : 80}px)` }}
            />
            {/* Corners */}
            {[
              "-left-[6%] -top-[8%]",
              "-right-[6%] -top-[8%]",
              "-left-[6%] -bottom-[8%]",
              "-right-[6%] -bottom-[8%]",
            ].map((pos) => (
              <div
                key={pos}
                className={cn(
                  "absolute size-[13%] bg-graphite transition-[transform,opacity] duration-[1100ms] ease-[var(--ease-premium)]",
                  pos,
                  active >= 3 ? "opacity-100" : "opacity-0",
                )}
                style={{ transform: `translateZ(${assembled ? 12 : 130}px)` }}
              >
                <span className="absolute inset-[22%] bg-alu" />
              </div>
            ))}
          </div>

          {/* QC scan line */}
          <div
            aria-hidden
            className={cn(
              "absolute inset-x-[10%] h-px bg-accent shadow-[0_0_18px_2px_rgb(29_95_168/0.45)] transition-opacity duration-700",
              active === 4 ? "animate-[qscan_2.4s_ease-in-out_infinite] opacity-100" : "opacity-0",
            )}
          />

          <div className="absolute inset-x-5 bottom-5 flex items-end justify-between">
            <p className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-steel">
              {pad2(active + 1)} / {pad2(qualitySteps.length)}
            </p>
            <p className="font-display text-sm font-semibold">{qualitySteps[active].title}</p>
          </div>
        </div>
      </div>

      {/* Steps */}
      <ol className="space-y-[28vh] pb-[20vh] pt-4 lg:space-y-[22vh] lg:py-[12vh]">
        {qualitySteps.map((s, i) => (
          <li
            key={s.key}
            data-q-step
            className={cn(
              "border-l-2 pl-6 transition-[border-color,opacity] duration-500 lg:pl-8",
              active === i ? "border-accent opacity-100" : "border-fog lg:opacity-45",
            )}
          >
            <p className="font-mono text-[0.66rem] uppercase tracking-[0.16em] text-steel">
              {pad2(i + 1)} — {s.title}
            </p>
            <h3 className="mt-3 font-display text-2xl font-semibold leading-tight md:text-3xl">{s.lead}</h3>
            <p className="mt-4 max-w-lg leading-relaxed text-steel">{s.text}</p>
            <ul className="mt-5 flex flex-wrap gap-2">
              {s.terms.map((t) => (
                <li key={t} className="rounded-full bg-mist px-3 py-1.5 font-mono text-[0.62rem] uppercase tracking-[0.1em] text-graphite">
                  {t}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
    </div>
  );
}
