/**
 * The live product catalog: the built-in products from data/products.ts with the edits made in
 * /admin/products laid over them (stored in Firebase under `products`).
 *
 * - A database entry with the same slug as a built-in product replaces its fields.
 * - `deleted: true` hides a built-in product.
 * - An entry with a new slug adds a product.
 *
 * Cached under the "catalog" tag; the admin product actions invalidate it on every save.
 * If Firebase is unavailable the built-in catalog is used, so the site never breaks.
 */
import "server-only";
import { unstable_cache } from "next/cache";
import type { CategorySlug, Product, Series, Spec } from "@/data/types";
import type { AplusImage } from "@/data/aplus";
import { products as builtIn } from "@/data/products";
import { categoryMap } from "@/data/categories";
import { subcategoryConfigs } from "@/data/subcategories";
import { websiteFirestore, websiteFirebaseConfigured } from "@/lib/firebase-admin";

export const CATALOG_TAG = "catalog";

const BRAND = "Plusmark Display System";
const CLOUD = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "drt0rpkn2";

/** Image sources next/image can render with the current next.config (anything else is dropped). */
export function isAllowedImage(src: unknown): src is string {
  if (typeof src !== "string" || !src) return false;
  return src.startsWith("/")
    || src.startsWith(`https://res.cloudinary.com/${CLOUD}/image/upload/`)
    || src.startsWith("https://firebasestorage.googleapis.com/")
    || src.startsWith("https://storage.googleapis.com/")
    || src.startsWith("data:image/");
}

const strings = (v: unknown): string[] | undefined =>
  Array.isArray(v) ? v.filter((x): x is string => typeof x === "string" && x.trim() !== "").map((x) => x.trim()) : undefined;

const specs = (v: unknown): Spec[] | undefined =>
  Array.isArray(v)
    ? v
        .filter((s): s is Spec => !!s && typeof s.label === "string" && typeof s.value === "string" && !!s.label.trim() && !!s.value.trim())
        .map((s) => ({ label: s.label.trim(), value: s.value.trim() }))
    : undefined;

const clip = (text: string, max = 158) => {
  if (text.length <= max) return text;
  const cut = text.slice(0, max - 1);
  return `${cut.slice(0, cut.lastIndexOf(" "))}…`;
};

type Stored = Partial<Record<keyof Product | "deleted" | "aplusImages", unknown>>;

/** Builds a full Product from a database entry, filling gaps from the built-in product. */
function toProduct(d: Stored, base: Product | undefined): Product | null {
  const slug = typeof d.slug === "string" && d.slug ? d.slug : base?.slug;
  const categorySlug = (typeof d.categorySlug === "string" && d.categorySlug in categoryMap ? d.categorySlug : base?.categorySlug) as CategorySlug | undefined;
  const name = typeof d.name === "string" && d.name.trim() ? d.name.trim() : base?.name;
  if (!slug || !categorySlug || !name) return null;

  const category = categoryMap[categorySlug];
  const shortDescription = (typeof d.shortDescription === "string" && d.shortDescription.trim()) || base?.shortDescription || "";
  const description = (typeof d.description === "string" && d.description.trim()) || base?.description || shortDescription;

  // Photos: the admin gallery wins when it has any usable image.
  const adminGallery = (strings(d.gallery) ?? []).filter(isAllowedImage);
  const adminImage = isAllowedImage(d.image) ? d.image : undefined;
  const gallery = adminGallery.length ? adminGallery : adminImage ? [adminImage] : base?.gallery ?? [];
  const image = gallery[0] ?? base?.image ?? "";
  if (!image) return null; // cards and pages need at least one photo
  const photosChanged = !!base && image !== base.image;

  const sizes = strings(d.sizes) ?? base?.sizes ?? [];

  return {
    slug,
    name,
    categorySlug,
    series: ((typeof d.series === "string" && d.series) || base?.series || "Custom") as Series,
    shortDescription,
    description,
    features: strings(d.features) ?? base?.features ?? [],
    specifications: specs(d.specifications) ?? base?.specifications ?? [],
    applications: strings(d.applications) ?? base?.applications ?? [],
    variants: strings(d.variants) ?? base?.variants ?? [],
    colors: strings(d.colors) ?? base?.colors ?? [],
    sizes,
    // Keep the per-size photos only for sizes that are still offered.
    sizeOptions: (base?.sizeOptions ?? []).filter((o) => sizes.includes(o.label)),
    notes: strings(d.notes) ?? base?.notes ?? [],
    highlights: strings(d.highlights) ?? base?.highlights ?? [],
    catalogDetail: d.catalogDetail === "listing" || d.catalogDetail === "full" ? d.catalogDetail : base?.catalogDetail ?? "full",
    image,
    imageAlt: base && !photosChanged && base.name === name ? base.imageAlt : `${name} — ${category.name} by ${BRAND}`,
    gallery,
    // The 3D model shows the built-in board, so drop it once the photos are replaced.
    model: typeof d.model === "string" && d.model.trim() ? d.model : photosChanged ? undefined : base?.model,
    modelFallback: image,
    featured: typeof d.featured === "boolean" ? d.featured : base?.featured ?? false,
    seoTitle: `${name} | ${category.name}`,
    seoDescription: clip(`${name} by ${BRAND}. ${shortDescription}`),
  };
}

type CatalogData = { products: Product[]; aplus: Record<string, AplusImage[]> };

function aplusImages(v: unknown, productName: string): AplusImage[] {
  if (!Array.isArray(v)) return [];
  return v
    .filter((a): a is { src: string; label?: string; alt?: string } => !!a && isAllowedImage(a.src))
    .map((a) => {
      const label = (typeof a.label === "string" && a.label.trim()) || productName;
      return { src: a.src, label, alt: (typeof a.alt === "string" && a.alt.trim()) || label };
    });
}

async function loadCatalog(): Promise<CatalogData> {
  const fallback = { products: builtIn, aplus: {} };
  if (!websiteFirebaseConfigured()) return fallback;
  try {
    const snapshot = await websiteFirestore().collection("website_products").get();
    if (snapshot.empty) return fallback;

    const bySlug = new Map(builtIn.map((p) => [p.slug, p]));
    const order = builtIn.map((p) => p.slug);
    const aplus: Record<string, AplusImage[]> = {};
    snapshot.forEach((child) => {
      const d = (child.data() ?? {}) as Stored;
      const slug = typeof d.slug === "string" && d.slug ? d.slug : child.id;
      if (d.deleted) {
        bySlug.delete(slug);
        return;
      }
      const product = toProduct({ ...d, slug }, bySlug.get(slug) ?? builtIn.find((p) => p.slug === slug));
      if (!product) return;
      if (!order.includes(slug)) order.push(slug);
      bySlug.set(slug, product);
      const banners = aplusImages(d.aplusImages, product.name);
      if (banners.length) aplus[slug] = banners;
    });
    return { products: order.map((s) => bySlug.get(s)).filter((p): p is Product => !!p), aplus };
  } catch (err) {
    console.error("[catalog] could not load admin product edits, using built-in catalog", err);
    return fallback;
  }
}

const getCatalogData = unstable_cache(loadCatalog, ["plusmark-catalog-v1"], { tags: [CATALOG_TAG], revalidate: 3600 });

/** All live products, in catalog order (admin-added products at the end). */
export async function getCatalog(): Promise<Product[]> {
  return (await getCatalogData()).products;
}

/** A+ banners uploaded for a product in the admin (in addition to the built-in sets). */
export async function getAdminAplus(slug: string): Promise<AplusImage[]> {
  return (await getCatalogData()).aplus[slug] ?? [];
}

export async function getLiveProduct(slug: string) {
  return (await getCatalog()).find((p) => p.slug === slug);
}

/**
 * Products for a category page. Parent categories with a sub-type filter (White Boards, Chalk
 * Boards, …) keep their curated order, then any other product filed under the parent or one of
 * its sub-categories (e.g. a board added in the admin) follows.
 */
export function productsForCategory(list: Product[], slug: CategorySlug): Product[] {
  const config = subcategoryConfigs[slug];
  if (!config) return list.filter((p) => p.categorySlug === slug);

  const bySlug = new Map(list.map((p) => [p.slug, p]));
  const seen = new Set<string>();
  const ordered: Product[] = [];
  for (const sub of config.subcategories) {
    for (const s of sub.productSlugs) {
      const p = bySlug.get(s);
      if (p && !seen.has(s)) {
        seen.add(s);
        ordered.push(p);
      }
    }
  }
  const family = new Set<string>([slug, ...(categoryMap[slug]?.subcategories ?? []).map((c) => c.slug)]);
  for (const p of list) if (!seen.has(p.slug) && family.has(p.categorySlug)) ordered.push(p);
  return ordered;
}

/**
 * The sub-type filter config for a category, with live products filed under a sub-category
 * (e.g. "white-boards-magnetic") added to the matching filter ("magnetic"), and hidden ones removed.
 */
export function liveSubcategoryConfig(list: Product[], slug: CategorySlug) {
  const config = subcategoryConfigs[slug];
  if (!config) return null;
  const live = new Set(list.map((p) => p.slug));
  return {
    ...config,
    subcategories: config.subcategories.map((sub) => {
      const extra = list.filter((p) => p.categorySlug === `${slug}-${sub.id}` && !sub.productSlugs.includes(p.slug)).map((p) => p.slug);
      return { ...sub, productSlugs: [...sub.productSlugs.filter((s) => live.has(s)), ...extra] };
    }),
  };
}

export function relatedProducts(list: Product[], product: Product, limit = 4): Product[] {
  const sameCategory = list.filter((p) => p.categorySlug === product.categorySlug && p.slug !== product.slug);
  const sameSeries = list.filter((p) => p.series === product.series && p.categorySlug !== product.categorySlug && p.slug !== product.slug);
  return [...sameCategory, ...sameSeries].slice(0, limit);
}
