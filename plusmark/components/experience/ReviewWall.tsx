"use client";

import { ArrowUpRight, MessageSquareReply, Quote, Star } from "lucide-react";
import { Reveal } from "@/components/animations/Reveal";
import { CountUp } from "@/components/animations/CountUp";
import { useAutoScroll } from "@/components/animations/useAutoScroll";
import { googleReviews, reviewSummary, reviewTopics, type GoogleReview } from "@/data/reviews";
import { cn } from "@/lib/utils";

const AVATAR = ["#4f3fd9", "#6f63f0", "#2a2380", "#8c7cf5", "#3f31c4", "#5a4fe0"];

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => Array.from(w)[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

const tone = (name: string) => AVATAR[Array.from(name).reduce((a, c) => a + c.charCodeAt(0), 0) % AVATAR.length];

function Stars({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex gap-0.5", className)} role="img" aria-label={`${reviewSummary.rating} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star key={i} aria-hidden className="size-3.5 fill-[#f5b301] text-[#f5b301]" />
      ))}
    </span>
  );
}

function ReviewCard({ r, copy }: { r: GoogleReview; copy: boolean }) {
  const long = r.text.length > 140;
  return (
    <li
      aria-hidden={copy || undefined}
      className={cn("group shrink-0", long ? "w-[min(26rem,84vw)]" : "w-[min(19rem,76vw)]")}
    >
      <figure className="flex h-full flex-col rounded-2xl bg-white p-6 shadow-[0_1px_2px_rgb(27_23_64/0.05),0_24px_48px_-36px_rgb(27_23_64/0.45)] ring-1 ring-[rgb(27_23_64/0.07)] transition-[transform,box-shadow] duration-500 ease-[var(--xd-ease)] group-hover:-translate-y-1 group-hover:shadow-[0_1px_2px_rgb(27_23_64/0.06),0_32px_60px_-34px_rgb(79_63_217/0.45)] group-hover:ring-[rgb(79_63_217/0.25)]">
        <div className="flex items-center justify-between">
          <Stars />
          <Quote aria-hidden className="size-5 text-accent/30 transition-colors duration-500 group-hover:text-accent" />
        </div>
        <blockquote className="mt-4 flex-1 text-[0.94rem] leading-relaxed text-graphite">
          <p>{r.text}</p>
        </blockquote>
        {r.reply && (
          <p className="mt-4 flex items-start gap-2 rounded-lg bg-mist px-3 py-2 text-xs text-steel">
            <MessageSquareReply aria-hidden className="mt-px size-3.5 shrink-0 text-accent" />
            <span>
              <span className="font-semibold text-graphite">Plusmark replied:</span> {r.reply}
            </span>
          </p>
        )}
        <figcaption className="mt-5 flex items-center gap-3 border-t border-line/70 pt-4">
          <span
            aria-hidden
            className="flex size-9 shrink-0 items-center justify-center rounded-full font-display text-xs font-semibold text-white"
            style={{ background: tone(r.author) }}
          >
            {initials(r.author)}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-semibold text-graphite">{r.author}</span>
            <span className="block truncate text-[0.7rem] text-steel">
              {r.meta} · {r.when}
            </span>
          </span>
        </figcaption>
      </figure>
    </li>
  );
}

function Row({ items, reverse, speed, label }: { items: GoogleReview[]; reverse?: boolean; speed: number; label: string }) {
  const { ref, handlers } = useAutoScroll<HTMLUListElement>({ speed, reverse });
  return (
    <ul
      ref={ref}
      aria-label={label}
      {...handlers}
      className="mask-fade-x xd-noscroll-bar flex items-stretch gap-4 overflow-x-auto px-5 py-3 [scrollbar-width:none] sm:px-10 md:gap-5"
    >
      {[...items, ...items].map((r, i) => (
        <ReviewCard key={`${r.author}-${i}`} r={r} copy={i >= items.length} />
      ))}
    </ul>
  );
}

/**
 * Review wall for designs D and E: every Google review, verbatim, on two rows drifting in
 * opposite directions. A row pauses under the pointer or a finger, and can be swiped.
 */
export function ReviewWall({ id }: { id: string }) {
  const rowA = googleReviews.filter((_, i) => i % 2 === 0);
  const rowB = googleReviews.filter((_, i) => i % 2 === 1);
  const titleId = `${id}-title`;

  return (
    <section id={id} aria-labelledby={titleId} className="relative z-10 overflow-hidden py-24 md:py-32">
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-1/3 h-2/3 bg-[radial-gradient(50%_60%_at_50%_50%,rgb(111_99_240/0.09),transparent_75%)]" />
      <div className="relative mx-auto max-w-[110rem] px-5 sm:px-10 lg:pr-24">
        <div className="grid gap-10 lg:grid-cols-[1fr_auto] lg:items-end">
          <Reveal>
            <p className="xd-eyebrow">Google reviews</p>
            <h2 id={titleId} className="mt-4 max-w-3xl font-display text-[clamp(2.25rem,4.4vw,4.5rem)] font-semibold leading-[1.02] tracking-[-0.035em] text-graphite">
              Trusted by the people <span className="xd-grad-text">we supply.</span>
            </h2>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-steel">
              Schools, dealers and institutions on Plusmark boards, service and delivery, in their own words.
            </p>
          </Reveal>

          <Reveal delay={0.08}>
            <a
              href={reviewSummary.profileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="xd-glass group flex items-center gap-5 rounded-2xl px-6 py-5 transition-transform duration-500 ease-[var(--xd-ease)] hover:-translate-y-0.5"
            >
              <span className="font-display text-5xl font-semibold leading-none tracking-[-0.04em] text-graphite">{reviewSummary.rating.toFixed(1)}</span>
              <span className="flex flex-col gap-1.5">
                <Stars />
                <span className="flex items-center gap-1 text-[0.7rem] font-medium uppercase tracking-[0.16em] text-steel">
                  <CountUp to={reviewSummary.count} /> {reviewSummary.source} reviews
                  <ArrowUpRight aria-hidden className="size-3 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </span>
              </span>
              <span className="sr-only">(opens Google Maps in a new tab)</span>
            </a>
          </Reveal>
        </div>

        <div className="mt-10 flex flex-wrap items-center gap-2.5">
          <Reveal as="div" className="xd-label mr-1">
            Most mentioned
          </Reveal>
          {reviewTopics.map((t, i) => (
            <Reveal
              key={t.label}
              delay={0.08 + i * 0.08}
              className="inline-flex items-center gap-2 rounded-full bg-white py-1.5 pl-4 pr-1.5 text-sm font-medium text-graphite ring-1 ring-line"
            >
              {t.label}
              <span className="rounded-full bg-accent px-2.5 py-0.5 text-xs font-semibold text-white">
                <CountUp to={t.count} duration={1100} />
              </span>
            </Reveal>
          ))}
        </div>
      </div>

      <Reveal delay={0.1} className="relative mt-12 grid gap-3 md:gap-4">
        <Row items={rowA} speed={30} label="Customer reviews, part 1" />
        <Row items={rowB} speed={24} reverse label="Customer reviews, part 2" />
      </Reveal>
    </section>
  );
}
