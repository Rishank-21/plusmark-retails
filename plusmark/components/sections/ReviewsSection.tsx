import { Star, Quote, ArrowUpRight } from "lucide-react";
import { reviews, reviewHighlights, reviewSummary } from "@/data/reviews";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/animations/Reveal";
import { cn } from "@/lib/utils";

function Stars({ value, className }: { value: number; className?: string }) {
  return (
    <span className={cn("inline-flex gap-0.5", className)} role="img" aria-label={`${value} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          aria-hidden
          className={cn("size-4", i < Math.round(value) ? "fill-[#f5b301] text-[#f5b301]" : "text-alu")}
        />
      ))}
    </span>
  );
}

const initials = (name: string) =>
  name
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

export function ReviewsSection() {
  return (
    <section aria-labelledby="reviews-title" className="bg-white py-24 md:py-32">
      <div className="container-x">
        <div className="grid gap-12 lg:grid-cols-[1fr_auto] lg:items-end">
          <Reveal>
            <SectionHeading
              id="reviews-title"
              eyebrow="Customer Reviews"
              title="Trusted by the people we supply."
              intro="What schools, dealers and institutions say about Plusmark products and service."
            />
          </Reveal>
          <Reveal delay={0.06}>
            <a
              href={reviewSummary.profileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="card-premium group flex items-center gap-5 px-6 py-5"
            >
              <span className="font-display text-5xl font-semibold leading-none">{reviewSummary.rating.toFixed(1)}</span>
              <span className="flex flex-col gap-1.5">
                <Stars value={reviewSummary.rating} />
                <span className="flex items-center gap-1 font-mono text-[0.66rem] uppercase tracking-[0.14em] text-steel">
                  {reviewSummary.count} {reviewSummary.source} reviews
                  <ArrowUpRight aria-hidden className="size-3 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </span>
              </span>
              <span className="sr-only">(opens Google Maps in a new tab)</span>
            </a>
          </Reveal>
        </div>

        <ul className="mt-16 grid gap-4 md:grid-cols-3">
          {reviews.map((r, i) => (
            <Reveal as="li" key={r.author} delay={i * 0.07} className="card-premium flex flex-col p-8">
              <Quote aria-hidden className="size-6 text-accent" />
              <blockquote className="mt-5 flex-1 leading-relaxed text-graphite">
                <p>{r.text}</p>
              </blockquote>
              <div className="mt-8 flex items-center gap-3 border-t border-fog pt-6">
                <span
                  aria-hidden
                  className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent-soft font-display text-sm font-semibold text-accent"
                >
                  {initials(r.author)}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold">{r.author}</span>
                  {r.when && <span className="block text-xs text-steel">{r.when} · {reviewSummary.source}</span>}
                </span>
                <Stars value={r.rating} />
              </div>
            </Reveal>
          ))}
        </ul>

        <ul className="mt-10 flex flex-wrap gap-3">
          {reviewHighlights.map((h, i) => (
            <Reveal as="li" key={h} delay={0.1 + i * 0.05} className="rounded-full bg-mist px-4 py-2.5 text-sm text-steel ring-1 ring-line">
              “{h}”
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
