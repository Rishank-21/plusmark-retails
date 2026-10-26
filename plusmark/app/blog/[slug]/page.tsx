import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Clock } from "lucide-react";
import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { JsonLd } from "@/components/ui/JsonLd";
import { Reveal } from "@/components/animations/Reveal";
import { articles, articlesByNewest, getArticle } from "@/data/articles";
import { getCatalog } from "@/lib/catalog";
import { articleCover, formatDate, resolveRelated } from "@/lib/blog";
import { buildMetadata } from "@/lib/seo";
import { articleSchema, faqSchema } from "@/lib/structured-data";

/**
 * Article slugs come entirely from data/articles.ts, so an unknown /blog/{slug} must 404 instead of
 * rendering an empty page that a crawler would file as a soft-404.
 */
export const dynamicParams = false;

export function generateStaticParams() {
  return articles.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: PageProps<"/blog/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) notFound();
  const catalog = await getCatalog();
  return buildMetadata({
    title: article.seoTitle,
    description: article.description,
    path: `/blog/${article.slug}`,
    image: articleCover(article, catalog),
    imageAlt: article.title,
  });
}

export default async function ArticlePage({ params }: PageProps<"/blog/[slug]">) {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) notFound();

  const catalog = await getCatalog();
  const cover = articleCover(article, catalog);
  const related = resolveRelated(article.related, catalog);

  const index = articlesByNewest.findIndex((a) => a.slug === slug);
  const newer = articlesByNewest[index - 1];
  const older = articlesByNewest[index + 1];
  // Same topic first, then newest, so the list reads as related rather than arbitrary.
  const moreGuides = articlesByNewest
    .filter((a) => a.slug !== slug)
    .sort((a, b) => Number(b.topic === article.topic) - Number(a.topic === article.topic))
    .slice(0, 3);

  const schemas: Record<string, unknown>[] = [articleSchema(article, cover ?? "")];
  if (article.faq?.length) schemas.push(faqSchema(article.faq));

  return (
    <>
      <div className="bg-mist pt-[100px] md:pt-[120px]">
        <div className="container-x">
          <Breadcrumbs items={[{ name: "Blog", path: "/blog" }, { name: article.seoTitle, path: `/blog/${article.slug}` }]} />
        </div>
      </div>

      <article className="pb-20 pt-12 md:pb-28 md:pt-16">
        <JsonLd data={schemas.length === 1 ? schemas[0] : schemas} />

        <header className="container-x max-w-3xl">
          <p className="eyebrow">{article.topic}</p>
          <h1 className="mt-5 font-display text-[clamp(2rem,5vw,3.4rem)] font-bold leading-[1.05] tracking-tight text-graphite">
            {article.title}
          </h1>
          <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-steel">
            <span className="font-mono">Published {formatDate(article.published)}</span>
            {article.updated !== article.published && (
              <span className="font-mono">Updated {formatDate(article.updated)}</span>
            )}
            <span className="inline-flex items-center gap-1.5">
              <Clock aria-hidden className="size-3.5" />
              {article.readMinutes} min read
            </span>
          </div>
        </header>

        {cover && (
          <div className="container-x mt-10">
            <Reveal>
              <div className="relative aspect-[16/9] overflow-hidden rounded-3xl bg-[#f5f5f2] ring-1 ring-fog">
                <Image
                  src={cover}
                  alt={`${article.title} — Plusmark Display System`}
                  fill
                  priority
                  sizes="(min-width: 1024px) 896px, 100vw"
                  className="object-cover"
                />
              </div>
            </Reveal>
          </div>
        )}

        <div className="container-x mt-12 max-w-3xl">
          <div className="space-y-6 text-[1.05rem] leading-relaxed text-graphite/90">
            {article.intro.map((p, i) => (
              <p key={i} className={i === 0 ? "text-[1.15rem] leading-relaxed" : undefined}>
                {p}
              </p>
            ))}
          </div>

          {article.sections.map((s) => (
            <section key={s.heading} className="mt-14">
              <h2 className="font-display text-[clamp(1.4rem,3vw,2rem)] font-semibold leading-tight tracking-tight text-graphite">
                {s.heading}
              </h2>
              <div className="mt-5 space-y-5 text-[1.05rem] leading-relaxed text-graphite/90">
                {s.body.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
              {s.bullets && (
                <ul className="mt-5 space-y-3 border-l-2 border-accent pl-5">
                  {s.bullets.map((b) => (
                    <li key={b} className="text-[1.02rem] leading-relaxed text-graphite/90">
                      {b}
                    </li>
                  ))}
                </ul>
              )}
              {s.table && (
                <div className="mt-7 overflow-x-auto rounded-2xl ring-1 ring-fog">
                  <table className="w-full min-w-[34rem] border-collapse text-left text-sm">
                    <thead className="bg-mist">
                      <tr>
                        {s.table.head.map((h, i) => (
                          <th key={i} scope={h ? "col" : undefined} className="px-5 py-3.5 font-semibold text-graphite">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {s.table.rows.map((row, ri) => (
                        <tr key={ri} className="border-t border-fog">
                          {row.map((cell, ci) =>
                            ci === 0 ? (
                              <th key={ci} scope="row" className="px-5 py-3.5 text-left align-top leading-relaxed font-semibold text-graphite">
                                {cell}
                              </th>
                            ) : (
                              <td key={ci} className="px-5 py-3.5 align-top leading-relaxed text-steel">
                                {cell}
                              </td>
                            ),
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          ))}

          {article.faq?.length && (
            <section className="mt-16" aria-labelledby="article-faq">
              <h2 id="article-faq" className="font-display text-[clamp(1.4rem,3vw,2rem)] font-semibold leading-tight tracking-tight text-graphite">
                Questions on this topic
              </h2>
              <dl className="mt-6 divide-y divide-fog border-y border-fog">
                {article.faq.map((f) => (
                  <div key={f.q} className="py-5">
                    <dt className="font-display text-base font-semibold text-graphite">{f.q}</dt>
                    <dd className="mt-2 text-[0.98rem] leading-relaxed text-steel">{f.a}</dd>
                  </div>
                ))}
              </dl>
            </section>
          )}

          {related.length > 0 && (
            <section className="mt-16" aria-labelledby="article-related">
              <h2 id="article-related" className="font-display text-[clamp(1.4rem,3vw,2rem)] font-semibold leading-tight tracking-tight text-graphite">
                Boards mentioned in this guide
              </h2>
              <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                {related.map((r) => (
                  <li key={r.slug}>
                    <Link
                      href={r.href}
                      className="card-premium group flex items-center justify-between gap-3 p-4 transition-colors hover:bg-mist/40"
                    >
                      <span className="text-sm font-semibold text-graphite">{r.name}</span>
                      <ArrowRight aria-hidden className="size-4 shrink-0 text-accent transition-transform group-hover:translate-x-1" />
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <p className="mt-14 border-l-2 border-accent bg-accent-soft/50 px-6 py-5 text-[0.98rem] leading-relaxed text-graphite">
            Sizes, surfaces and frame variants listed here are made to order.{" "}
            <Link href="/contact" className="link-underline font-semibold">
              Send Plusmark your room details and quantity
            </Link>{" "}
            and the team will confirm what is available in that series.
          </p>
        </div>
      </article>

      <nav aria-label="More guides" className="border-t border-fog bg-mist py-14">
        <div className="container-x max-w-3xl">
          <ul className="grid gap-3 sm:grid-cols-3">
            {moreGuides.map((g) => (
              <li key={g.slug}>
                <Link href={`/blog/${g.slug}`} className="card-premium group flex h-full flex-col p-4">
                  <span className="font-mono text-[0.58rem] uppercase tracking-[0.14em] text-accent">{g.topic}</span>
                  <span className="mt-2 font-display text-[0.85rem] font-semibold leading-snug text-graphite">{g.seoTitle}</span>
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-6 grid gap-6 sm:grid-cols-2">
          {older ? (
            <Link href={`/blog/${older.slug}`} className="card-premium group p-5">
              <span className="inline-flex items-center gap-1.5 font-mono text-[0.6rem] uppercase tracking-[0.14em] text-steel">
                <ArrowLeft aria-hidden className="size-3.5" /> Previous guide
              </span>
              <span className="mt-2 block font-display text-sm font-semibold leading-snug text-graphite">{older.title}</span>
            </Link>
          ) : (
            <Link href="/blog" className="card-premium group p-5">
              <span className="inline-flex items-center gap-1.5 font-mono text-[0.6rem] uppercase tracking-[0.14em] text-steel">
                <ArrowLeft aria-hidden className="size-3.5" /> All guides
              </span>
              <span className="mt-2 block font-display text-sm font-semibold leading-snug text-graphite">Back to the blog</span>
            </Link>
          )}
          {newer && (
            <Link href={`/blog/${newer.slug}`} className="card-premium group p-5 sm:text-right">
              <span className="inline-flex items-center gap-1.5 font-mono text-[0.6rem] uppercase tracking-[0.14em] text-steel sm:flex-row-reverse">
                <ArrowRight aria-hidden className="size-3.5" /> Newer guide
              </span>
              <span className="mt-2 block font-display text-sm font-semibold leading-snug text-graphite">{newer.title}</span>
            </Link>
          )}
          </div>
        </div>
      </nav>
    </>
  );
}
