import type { MetadataRoute } from "next";
import { articlesByNewest } from "@/data/articles";
import { categories } from "@/data/categories";
import { getCatalog, getCatalogUpdatedAt } from "@/lib/catalog";
import { absoluteImage, absoluteUrl, siteConfig } from "@/lib/seo";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, updatedAt] = await Promise.all([getCatalog(), getCatalogUpdatedAt()]);
  const imageBySlug = new Map(products.map((p) => [p.slug, absoluteImage(p.image)]));

  const staticRoutes: Array<[string, number, MetadataRoute.Sitemap[number]["changeFrequency"]]> = [
    ["/", 1, "weekly"],
    ["/products", 0.9, "weekly"],
    ["/about", 0.6, "monthly"],
    ["/quality", 0.6, "monthly"],
    ["/custom-solutions", 0.7, "monthly"],
    ["/industries", 0.6, "monthly"],
    ["/buying-guide", 0.7, "monthly"],
    ["/blog", 0.7, "monthly"],
    ["/faq", 0.6, "monthly"],
    ["/contact", 0.7, "monthly"],
    ["/site-map", 0.2, "monthly"],
    ["/privacy-policy", 0.1, "yearly"],
    ["/terms", 0.1, "yearly"],
  ];

  // `lastModified` is only emitted where a real timestamp exists. Stamping every entry with the
  // request time teaches crawlers to ignore lastmod entirely.
  const lastModified = (slug: string) => (updatedAt[slug] ? new Date(updatedAt[slug]) : undefined);
  const coverImages = (slug: string) => {
    const image = imageBySlug.get(slug);
    return image ? [image] : undefined;
  };

  return [
    ...staticRoutes.map(([path, priority, changeFrequency]) => ({
      // Root must match the rendered canonical exactly (no trailing slash) or the sitemap and
      // the page disagree about the preferred URL.
      url: path === "/" ? siteConfig.url : absoluteUrl(path),
      // The index changes whenever a guide is revised, so it carries the newest guide's date
      // instead of a request timestamp.
      ...(path === "/blog" ? { lastModified: new Date(`${articlesByNewest[0].updated}T00:00:00+05:30`) } : {}),
      changeFrequency,
      priority,
    })),
    ...categories.map((c) => ({
      url: absoluteUrl(`/products/${c.slug}`),
      changeFrequency: "monthly" as const,
      priority: 0.8,
      images: coverImages(c.coverProduct),
    })),
    // Subcategory pages are indexable landing pages, so they must be discoverable here too.
    ...categories.flatMap((c) => c.subcategories ?? []).map((sub) => ({
      url: absoluteUrl(`/products/${sub.slug}`),
      changeFrequency: "monthly" as const,
      priority: 0.7,
      images: coverImages(sub.coverProduct),
    })),
    ...products.map((p) => ({
      url: absoluteUrl(`/products/${p.slug}`),
      ...(lastModified(p.slug) ? { lastModified: lastModified(p.slug) } : {}),
      changeFrequency: "monthly" as const,
      priority: p.catalogDetail === "full" ? 0.7 : 0.5,
      images: [absoluteImage(p.image)],
    })),
    // Guide lastmod is the authored revision date in data/articles.ts, not a request timestamp.
    ...articlesByNewest.map((a) => ({
      url: absoluteUrl(`/blog/${a.slug}`),
      lastModified: new Date(`${a.updated}T00:00:00+05:30`),
      changeFrequency: "monthly" as const,
      priority: 0.6,
      images: coverImages(a.coverProduct),
    })),
  ];
}
