"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Building2, GraduationCap, Landmark, Pause, Play, School, type LucideIcon } from "lucide-react";
import type { ClientSector, TrustedClient } from "@/data/clients";

/** Neutral stand-in for the logo slot until an organization's official file is added. Never a redrawn logo. */
const SECTOR_ICON: Record<ClientSector, LucideIcon> = {
  school: School,
  university: GraduationCap,
  government: Landmark,
  business: Building2,
};

/** Seconds per organization: the strip drifts at the same unhurried pace however long the list gets. */
const SECONDS_PER_ITEM = 6.4;

/** Logo height the files are requested at (px); CSS sets the shown height per breakpoint. */
const LOGO_PX = 72;

function ClientCard({ client }: { client: TrustedClient }) {
  const Icon = SECTOR_ICON[client.sector];
  const logo = client.logo;
  return (
    <div className="flex h-20 min-w-[280px] items-center gap-4 rounded-2xl bg-white px-6 ring-1 ring-fog shadow-[var(--shadow-soft)] transition-[box-shadow,transform] duration-500 ease-[var(--ease-premium)] hover:-translate-y-1 hover:shadow-[var(--shadow-lift)] hover:ring-graphite/20 sm:h-24 sm:min-w-[320px] sm:px-7 md:h-28 md:min-w-[360px] md:gap-5 md:px-8 lg:h-32 lg:min-w-[400px] lg:px-9">
      <span className="flex h-12 shrink-0 items-center sm:h-14 md:h-16 lg:h-18">
        {logo ? (
          // The name sits right beside the logo, so the image itself is decorative.
          <Image
            src={logo.src}
            alt=""
            width={Math.round((LOGO_PX * logo.width) / logo.height)}
            height={LOGO_PX}
            unoptimized={logo.src.endsWith(".svg")}
            className="h-full w-auto max-w-36 object-contain sm:max-w-44 md:max-w-52 lg:max-w-60"
          />
        ) : (
          <span aria-hidden className="flex aspect-square h-full items-center justify-center rounded-2xl bg-mist text-steel ring-1 ring-fog">
            <Icon strokeWidth={1.8} className="size-[50%]" />
          </span>
        )}
      </span>
      <span className="whitespace-nowrap font-display text-base font-semibold text-graphite sm:text-lg md:text-xl lg:text-[1.3rem]">
        {client.name}
      </span>
    </div>
  );
}

/**
 * Endless right-to-left logo strip. The list is rendered twice and the track slides by exactly
 * one copy (CSS `marquee`: 0 → −50%), so the hand-over from the last organization back to the first
 * is seamless; each card carries its own trailing space so both copies are the same width.
 * The strip waits until it scrolls into view, pauses on hover and has a Pause control (WCAG 2.2.2).
 * With reduced motion it is a static, wrapped row of every organization instead.
 */
export function LogoMarquee({ clients }: { clients: TrustedClient[] }) {
  const root = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const list = (copy: boolean) => (
    <ul
      aria-hidden={copy || undefined}
      className={
        copy
          ? "flex shrink-0 motion-reduce:hidden"
          : "flex shrink-0 motion-reduce:flex-wrap motion-reduce:justify-center motion-reduce:gap-4"
      }
    >
      {clients.map((c) => (
        <li key={c.id} className="shrink-0 pr-4 sm:pr-5 md:pr-6 lg:pr-7 motion-reduce:pr-0">
          <ClientCard client={c} />
        </li>
      ))}
    </ul>
  );

  return (
    // "held" (not yet on screen) only stops the strip when JavaScript runs; see globals.css.
    <div ref={root} data-marquee={paused ? "paused" : inView ? "run" : "held"}>
      <div className="marquee mask-fade-x mx-auto max-w-[120rem] overflow-hidden py-4 pl-[8%] motion-reduce:px-5 motion-reduce:[mask-image:none]">
        <div
          className="marquee-track motion-reduce:block motion-reduce:w-auto motion-reduce:animate-none"
          style={{ animationDuration: `${clients.length * SECONDS_PER_ITEM}s` }}
        >
          {list(false)}
          {list(true)}
        </div>
      </div>
      <div className="container-x mt-2 flex justify-end motion-reduce:hidden">
        <button
          type="button"
          onClick={() => setPaused((p) => !p)}
          className="group inline-flex h-10 items-center gap-2.5 font-mono text-[0.64rem] uppercase tracking-[0.16em] text-steel transition-colors hover:text-graphite"
        >
          <span className="flex size-7 items-center justify-center rounded-full bg-white ring-1 ring-line transition-[box-shadow,transform] duration-300 group-hover:ring-alu-dark group-active:scale-90">
            {paused ? <Play aria-hidden className="size-3" /> : <Pause aria-hidden className="size-3" />}
          </span>
          {paused ? "Play" : "Pause"}
          <span className="sr-only"> logo animation</span>
        </button>
      </div>
    </div>
  );
}
