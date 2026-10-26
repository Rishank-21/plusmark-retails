import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { JsonLd } from "@/components/ui/JsonLd";
import { Reveal } from "@/components/animations/Reveal";
import { articlesByNewest } from "@/data/articles";
import { getCatalog } from "@/lib/catalog";
import { articleCover, formatDate, resolveRelated } from "@/lib/blog";
import { buildMetadata } from "@/lib/seo";
import { blogIndexSchema } from "@/lib/structured-data";

export const metadata = buildMetadata({
  title: "Board Guides — Choosing, Sizing & Care",
  description:
    "Plusmark guides on board surfaces, sizes and series, magnetic and ceramic boards, notice boards, stands, clipboards and industry-specific setups.",
  path: "/blog",
});

/** Fixed reading order for the topic groups, so the index does not reshuffle when a guide is added. */
const topicOrder = ["Choosing", "Materials", "Sizing", "Installation", "Products", "Maintenance", "Custom", "Industries", "Buying"];

const topicHeading: Record<string, string> = {
  Choosing: "Choosing guides",
  Materials: "Material and surface guides",
  Sizing: "Sizing guides",
  Installation: "Mounting and installation guides",
  Products: "Product guides",
  Maintenance: "Care and maintenance guides",
  Custom: "Custom and made-to-order guides",
  Industries: "Industry guides",
  Buying: "Buying and ordering guides",
};

export default async function BlogPage() {
  const catalog = await getCatalog();
  const latest = articlesByNewest.slice(0, 6);
  const latestSlugs = new Set(latest.map((a) => a.slug));
  const topics = topicOrder
    .map((topic) => ({
      topic,
      entries: articlesByNewest.filter((a) => a.topic === topic && !latestSlugs.has(a.slug)),
    }))
    .filter((g) => g.entries.length > 0);
  const anchor = (topic: string) => `topic-${topic.toLowerCase()}`;

  return (
    <>
      <PageHeader
        crumbs={[{ name: "Blog", path: "/blog" }]}
        eyebrow={`${articlesByNewest.length} guides`}
        title={
          <>
            Board knowledge, <span className="text-gradient">written down.</span>
          </>
        }
        intro="Practical guides on choosing a board surface, sizing a room, comparing construction series, specifying stands, clipboards and display boards, and setting up a school, office, factory or government block. Everything here comes from what Plusmark actually manufactures — no pricing or lead-time claims, because those depend on your requirement."
      />

      <JsonLd data={blogIndexSchema(articlesByNewest.map((a) => ({ slug: a.slug, title: a.title })))} />

      <section aria-labelledby="blog-latest" className="bg-white py-16 md:py-24">
        <div className="container-x">
          <h2 id="blog-latest" className="font-display text-[clamp(1.5rem,3vw,2.25rem)] font-semibold leading-tight">
            Latest guides
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-steel">
            The six most recently published guides. Every guide is also listed under its topic further down the page.
          </p>
          <ul className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {latest.map((a, i) => {
              const cover = articleCover(a, catalog);
              const related = resolveRelated(a.related, catalog);
              return (
                <Reveal
                  as="li"
                  key={a.slug}
                  delay={i * 0.05}
                  className="group relative flex h-full flex-col overflow-hidden rounded-[1.5rem] bg-white ring-1 ring-black/[0.06] shadow-[0_10px_35px_-24px_rgba(20,25,30,0.55)] transition-[box-shadow,transform] duration-500 ease-[var(--ease-premium)] hover:-translate-y-1 hover:shadow-[0_20px_45px_-24px_rgba(20,25,30,0.5)] motion-reduce:hover:translate-y-0"
                >
                  {cover && (
                    <div className="relative aspect-[16/9] overflow-hidden bg-[#f5f5f2]">
                      <Image
                        src={cover}
                        alt=""
                        fill
                        sizes="(min-width: 1280px) 32vw, (min-width: 768px) 48vw, 100vw"
                        className="object-cover transition-transform duration-700 ease-[var(--ease-premium)] group-hover:scale-[1.03]"
                      />
                    </div>
                  )}
                  <div className="flex flex-1 flex-col px-6 pb-6 pt-5">
                    <p className="font-mono text-[0.58rem] uppercase tracking-[0.18em] text-accent">{a.topic}</p>
                    <h3 className="mt-2.5 font-display text-[1.15rem] font-semibold leading-snug tracking-[-0.01em] text-graphite">
                      <Link
                        href={`/blog/${a.slug}`}
                        className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:outline-accent"
                      >
                        {a.title}
                      </Link>
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-steel">{a.excerpt}</p>
                    <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-fog pt-4 text-[0.7rem] text-steel">
                      <span className="font-mono">{formatDate(a.published)}</span>
                      <span className="inline-flex items-center gap-1.5">
                        <Clock aria-hidden className="size-3.5" />
                        {a.readMinutes} min read
                      </span>
                      {related[0] && (
                        <span className="truncate font-mono text-[0.62rem] uppercase tracking-[0.12em] text-alu-dark">
                          {related[0].name}
                        </span>
                      )}
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </ul>
        </div>
      </section>

      <section aria-labelledby="blog-topics" className="border-t border-fog bg-mist py-16 md:py-20">
        <div className="container-x">
          <h2 id="blog-topics" className="font-display text-[clamp(1.5rem,3vw,2.25rem)] font-semibold leading-tight">
            Browse every guide by topic
          </h2>
          <nav aria-label="Guide topics" className="mt-5 flex flex-wrap gap-2">
            {topics.map((g) => (
              <Link
                key={g.topic}
                href={`#${anchor(g.topic)}`}
                className="rounded-full border border-fog bg-white px-3.5 py-1.5 font-mono text-[0.6rem] uppercase tracking-[0.14em] text-steel transition-colors hover:border-accent hover:text-accent"
              >
                {g.topic} <span className="text-alu-dark">{g.entries.length}</span>
              </Link>
            ))}
          </nav>

          {topics.map((g) => (
            <div key={g.topic} className="mt-12 first-of-type:mt-10" id={anchor(g.topic)}>
              <h3 className="font-display text-lg font-semibold text-graphite">
                {topicHeading[g.topic] ?? `${g.topic} guides`}
                <span className="ml-2 font-mono text-[0.6rem] uppercase tracking-[0.14em] text-steel">
                  {g.entries.length}
                </span>
              </h3>
              <ul className="mt-4 grid gap-3 md:grid-cols-2">
                {g.entries.map((a) => (
                  <li key={a.slug}>
                    <Link
                      href={`/blog/${a.slug}`}
                      className="card-premium group flex h-full flex-col p-5 transition-colors hover:bg-white"
                    >
                      <span className="font-display text-[0.98rem] font-semibold leading-snug text-graphite">
                        {a.title}
                      </span>
                      <span className="mt-2 text-xs leading-relaxed text-steel">{a.excerpt}</span>
                      <span className="mt-4 flex items-center gap-x-3 text-[0.66rem] text-steel">
                        <span className="font-mono">{formatDate(a.published)}</span>
                        <span className="inline-flex items-center gap-1.5">
                          <Clock aria-hidden className="size-3" />
                          {a.readMinutes} min read
                        </span>
                        <ArrowRight aria-hidden className="ml-auto size-4 text-accent transition-transform group-hover:translate-x-1" />
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section aria-labelledby="blog-more" className="border-t border-fog bg-mist py-16 md:py-20">
        <div className="container-x">
          <h2 id="blog-more" className="font-display text-[clamp(1.5rem,3vw,2.25rem)] font-semibold leading-tight">
            Still comparing options?
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-steel">
            The buying guide walks through series, surfaces and standard sizes side by side, and the FAQ answers what
            institutions ask most often.
          </p>
          <ul className="mt-8 grid gap-4 sm:grid-cols-3">
            {[
              { href: "/buying-guide", name: "Buying Guide", note: "Series, surfaces and sizes compared" },
              { href: "/products", name: "All Products", note: "The full Plusmark catalog" },
              { href: "/faq", name: "FAQ", note: "Answers institutions ask for" },
            ].map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="card-premium group flex h-full flex-col p-5 transition-colors hover:bg-mist/40"
                >
                  <span className="font-display text-base font-semibold text-graphite">{l.name}</span>
                  <span className="mt-1.5 text-xs leading-relaxed text-steel">{l.note}</span>
                  <ArrowRight aria-hidden className="mt-4 size-4 text-accent transition-transform group-hover:translate-x-1" />
                </Link>
              </li>
            ))}
          </ul>
          <p className="mt-10 text-sm text-steel">
            Need a recommendation for a specific room?{" "}
            <Link href="/contact" className="link-underline font-medium text-graphite">
              Send Plusmark your requirement
            </Link>
            .
          </p>
        </div>
      </section>
    </>
  );
}
