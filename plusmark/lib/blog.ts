import { getCategory } from "@/data/categories.ts";
import type { Article } from "@/data/articles.ts";
import type { Product } from "@/data/types.ts";

export interface RelatedLink {
  slug: string;
  name: string;
  href: string;
}

/**
 * Article `related` entries mix category and product slugs — both live under /products/ — so they
 * resolve against whichever catalog the slug belongs to. Unknown slugs drop out rather than
 * emitting a link to a 404.
 */
export function resolveRelated(slugs: string[], catalog: Product[]): RelatedLink[] {
  return slugs.flatMap((slug) => {
    const category = getCategory(slug);
    if (category) return [{ slug, name: category.name, href: `/products/${slug}` }];
    const product = catalog.find((p) => p.slug === slug);
    return product ? [{ slug, name: product.name, href: `/products/${slug}` }] : [];
  });
}

/** Cover photo for an article, taken from the real product shot named in the article. */
export function articleCover(article: Article, catalog: Product[]): string | undefined {
  return catalog.find((p) => p.slug === article.coverProduct)?.image;
}

const dateFmt = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "long", year: "numeric" });

export function formatDate(iso: string): string {
  return dateFmt.format(new Date(`${iso}T00:00:00+05:30`));
}
