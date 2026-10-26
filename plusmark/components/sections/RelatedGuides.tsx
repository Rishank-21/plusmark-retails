import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";
import { articles } from "@/data/articles";

/**
 * Deep links from catalog pages into the guides that mention them. An article lists the product and
 * category slugs it covers, so a category page can show only guides that actually link back to it —
 * the link graph stays two-way instead of every guide appearing on every page.
 */
export function RelatedGuides({ slugs, title = "Guides" }: { slugs: string[]; title?: string }) {
  const matches = articles.filter((a) => a.related.some((s) => slugs.includes(s)));
  if (!matches.length) return null;

  return (
    <section className="border-t border-fog bg-white py-16 md:py-20" aria-labelledby="related-guides">
      <div className="container-x">
        <h2 id="related-guides" className="mb-2 font-display text-2xl font-semibold">
          {title}
        </h2>
        <p className="mb-8 max-w-2xl text-sm leading-relaxed text-steel">
          Written by the Plusmark team, from the same catalog these boards are listed in.
        </p>
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {matches.map((a) => (
            <li key={a.slug}>
              <Link
                href={`/blog/${a.slug}`}
                className="card-premium group flex h-full flex-col p-5 transition-colors hover:bg-mist/40"
              >
                <span className="inline-flex items-center gap-2 font-mono text-[0.6rem] uppercase tracking-[0.14em] text-accent">
                  <BookOpen aria-hidden className="size-3.5" />
                  {a.topic}
                </span>
                <span className="mt-2.5 font-display text-[0.98rem] font-semibold leading-snug text-graphite">
                  {a.title}
                </span>
                <span className="mt-2 text-xs leading-relaxed text-steel">{a.excerpt}</span>
                <ArrowRight aria-hidden className="mt-4 size-4 shrink-0 text-accent transition-transform group-hover:translate-x-1" />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
