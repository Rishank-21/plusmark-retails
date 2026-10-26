/**
 * Home-hero product sequence.
 *
 * The sequence is admin-editable: a list of product slugs saved in Firestore at
 * `website_config/hero`. When nothing is saved, the Admin SDK is
 * not configured, or the read fails, it falls back to the built-in
 * `data/featured` list. Unknown slugs are dropped; an empty result also falls
 * back, so the hero always has something to show.
 *
 * Only the product's hero copy (name, category, description) comes from
 * products.ts; the condensed hero specs and the 3D fit/yaw live in featured.ts,
 * so a slug the admin adds that is not in featured.ts gets sensible defaults.
 */
import "server-only";
import { categoryMap } from "@/data/categories";
import { featuredProducts, type FeaturedProduct } from "@/data/featured";
import { getCatalog } from "@/lib/catalog";
import { websiteFirebaseConfigured, websiteFirestore } from "@/lib/firebase-admin";

/** The admin-saved slug order, or null when none/unavailable. */
type HeroOverride = {
  model?: string;
  image?: string;
  fit?: number;
  yaw?: number;
  keyFeature?: string;
  heroSpecs?: Array<{ label: string; value: string }>;
};

type HeroConfig = {
  sequence: string[] | null;
  overrides: Record<string, HeroOverride>;
};

async function savedConfig(): Promise<HeroConfig> {
  const empty = { sequence: null, overrides: {} };
  if (!websiteFirebaseConfigured()) return empty;
  try {
    const snap = await websiteFirestore().collection("website_config").doc("hero").get();
    const data = snap.data() ?? {};
    const value = data.heroSequence;
    const sequence = Array.isArray(value) ? value.filter((s): s is string => typeof s === "string") : null;
    const overrides = data.heroOverrides && typeof data.heroOverrides === "object" ? data.heroOverrides as Record<string, HeroOverride> : {};
    return { sequence: sequence?.length ? sequence : null, overrides };
  } catch {
    return empty;
  }
}

async function featuredFromCatalogSlug(slug: string): Promise<FeaturedProduct | undefined> {
  const product = (await getCatalog()).find((item) => item.slug === slug);
  if (!product) return undefined;
  return {
    slug: product.slug,
    name: product.name,
    category: categoryMap[product.categorySlug].name,
    categorySlug: product.categorySlug,
    description: product.shortDescription,
    keyFeature: product.highlights[0] ?? product.shortDescription,
    heroSpecs: product.specifications.slice(0, 6),
    model: product.model,
    fallbackImage: product.modelFallback,
    imageAlt: product.imageAlt,
    yaw: -0.38,
    fit: 2.2,
  };
}

/**
 * Products shown in the home hero, in order. Server-only (reads Firebase); the
 * result is passed to the client HeroExperience as plain data.
 */
export async function getHeroProducts(): Promise<FeaturedProduct[]> {
  const config = await savedConfig();
  const slugs = config.sequence;
  if (slugs) {
    const catalog = await getCatalog();
    const byAdmin = (await Promise.all(slugs.map(async (slug): Promise<FeaturedProduct | undefined> => {
      const catalogProduct = catalog.find((product) => product.slug === slug);
      const featured = featuredProducts.find((p) => p.slug === slug);
      if (!featured && !catalogProduct) return undefined;
      const base = featured ?? (catalogProduct ? await featuredFromCatalogSlug(slug) : undefined);
      if (!base) return undefined;
      const override = config.overrides[slug] ?? {};
      return catalogProduct
          ? {
              ...base,
              name: catalogProduct.name,
              category: categoryMap[catalogProduct.categorySlug].name,
              categorySlug: catalogProduct.categorySlug,
              description: catalogProduct.shortDescription,
              model: override.model ?? catalogProduct.model,
              fallbackImage: override.image ?? catalogProduct.modelFallback,
              imageAlt: catalogProduct.imageAlt,
              fit: override.fit ?? base.fit,
              yaw: override.yaw ?? base.yaw,
              keyFeature: override.keyFeature ?? base.keyFeature,
              heroSpecs: override.heroSpecs ?? base.heroSpecs,
            }
          : {
              ...base,
              model: override.model ?? base.model,
              fallbackImage: override.image ?? base.fallbackImage,
              fit: override.fit ?? base.fit,
              yaw: override.yaw ?? base.yaw,
              keyFeature: override.keyFeature ?? base.keyFeature,
              heroSpecs: override.heroSpecs ?? base.heroSpecs,
            };
    }))).filter((p): p is FeaturedProduct => Boolean(p));
    if (byAdmin.length) return byAdmin;
  }
  return featuredProducts;
}
