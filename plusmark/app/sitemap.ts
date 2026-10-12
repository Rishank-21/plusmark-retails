import type { MetadataRoute } from "next";
import { categories } from "@/data/categories";
import { getCatalog } from "@/lib/catalog";
import { absoluteUrl } from "@/lib/seo";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await getCatalog();
  const now = new Date();
  const staticRoutes: Array<[string, number, MetadataRoute.Sitemap[number]["changeFrequency"]]> = [
    ["/", 1, "weekly"],
    ["/products", 0.9, "weekly"],
    ["/about", 0.6, "monthly"],
    ["/quality", 0.6, "monthly"],
    ["/custom-solutions", 0.7, "monthly"],
    ["/industries", 0.6, "monthly"],
    ["/buying-guide", 0.7, "monthly"],
    ["/faq", 0.6, "monthly"],
    ["/contact", 0.7, "monthly"],
    ["/site-map", 0.2, "monthly"],
    ["/privacy-policy", 0.1, "yearly"],
    ["/terms", 0.1, "yearly"],
  ];
  return [
    ...staticRoutes.map(([path, priority, changeFrequency]) => ({
      url: absoluteUrl(path),
      lastModified: now,
      changeFrequency,
      priority,
    })),
    ...categories.map((c) => ({
      url: absoluteUrl(`/products/${c.slug}`),
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    ...products.map((p) => ({
      url: absoluteUrl(`/products/${p.slug}`),
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: p.catalogDetail === "full" ? 0.7 : 0.5,
      images: [/^https?:\/\//.test(p.image) ? p.image : absoluteUrl(p.image)],
    })),
  ];
}
