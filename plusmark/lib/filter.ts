import type { Product } from "@/data/types";

export type FilterItem = Pick<
  Product,
  "slug" | "name" | "series" | "categorySlug" | "shortDescription" | "highlights" | "features"
>;

export function toFilterItem(p: Product): FilterItem {
  const { slug, name, series, categorySlug, shortDescription, highlights, features } = p;
  return { slug, name, series, categorySlug, shortDescription, highlights, features };
}

