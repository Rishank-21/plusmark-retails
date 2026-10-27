"use server";

import { websiteFirestore } from "@/lib/firebase-admin";
import { revalidateTag } from "next/cache";
import { requireAdmin } from "@/lib/admin-auth";
import { CATALOG_TAG } from "@/lib/catalog";
import type { CategorySlug, Series, Spec } from "@/data/types";
import { products as staticProducts } from "@/data/products";

export interface ProductData {
  id: string;
  slug: string;
  name: string;
  categorySlug: CategorySlug;
  series: Series;
  shortDescription: string;
  description?: string;
  features?: string[];
  specifications?: Spec[];
  applications?: string[];
  variants?: string[];
  colors?: string[];
  sizes?: string[];
  notes?: string[];
  highlights?: string[];
  catalogDetail?: "full" | "listing";
  featured?: boolean;
  image?: string;
  gallery?: string[]; // Multiple images
  aplusImages?: Array<{ label: string; alt: string; src: string }>; // A+ listing images
}

const FIELDS = [
  "slug", "name", "categorySlug", "series", "shortDescription", "description", "features", "specifications",
  "applications", "variants", "colors", "sizes", "notes", "highlights", "catalogDetail", "featured", "image",
  "gallery", "aplusImages",
] as const satisfies readonly (keyof ProductData)[];

/** Keep only known fields; Firebase rejects `undefined`, so those are stored as null (= removed). */
function clean(p: Partial<ProductData>) {
  const out: Record<string, unknown> = {};
  for (const k of FIELDS) if (k in p) out[k] = p[k] ?? null;
  return out;
}

function fromStatic(): ProductData[] {
  return staticProducts.map((p) => ({
    id: p.slug, // static products use their slug as ID
    slug: p.slug,
    name: p.name,
    categorySlug: p.categorySlug,
    series: p.series,
    shortDescription: p.shortDescription,
    description: p.description,
    features: p.features,
    specifications: p.specifications,
    applications: p.applications,
    variants: p.variants,
    colors: p.colors,
    sizes: p.sizes,
    notes: p.notes,
    highlights: p.highlights,
    catalogDetail: p.catalogDetail || "full",
    featured: p.featured || false,
    image: p.image,
    gallery: p.gallery || [],
  }));
}

/**
 * The catalog in data/products.ts, with any admin edits from the database laid over it.
 * A database entry with the same slug replaces the built-in product, `deleted: true` hides it,
 * and entries with a new slug are added. Editing one product never hides the others.
 */
export async function getProducts(): Promise<ProductData[]> {
  await requireAdmin();
  const bySlug = new Map(fromStatic().map((p) => [p.slug, p]));
  try {
    const snapshot = await websiteFirestore().collection("website_products").get();
    snapshot.forEach((child) => {
      const d = child.data() ?? {};
      const slug: string = d.slug || child.id;
      if (d.deleted) {
        bySlug.delete(slug);
        return;
      }
      const base = bySlug.get(slug);
      bySlug.set(slug, {
        ...base,
        id: child.id,
        slug,
        name: d.name ?? base?.name ?? slug,
        categorySlug: d.categorySlug ?? base?.categorySlug,
        series: d.series ?? base?.series,
        shortDescription: d.shortDescription ?? base?.shortDescription ?? "",
        description: d.description ?? base?.description,
        features: d.features ?? base?.features ?? [],
        specifications: d.specifications ?? base?.specifications ?? [],
        applications: d.applications ?? base?.applications ?? [],
        variants: d.variants ?? base?.variants ?? [],
        colors: d.colors ?? base?.colors ?? [],
        sizes: d.sizes ?? base?.sizes ?? [],
        notes: d.notes ?? base?.notes ?? [],
        highlights: d.highlights ?? base?.highlights ?? [],
        catalogDetail: d.catalogDetail ?? base?.catalogDetail ?? "full",
        featured: d.featured ?? base?.featured ?? false,
        image: d.image ?? base?.image,
        gallery: d.gallery ?? base?.gallery ?? [],
        aplusImages: d.aplusImages ?? base?.aplusImages ?? [],
      } as ProductData);
    });
  } catch (error) {
    console.error("Error fetching products, returning static data:", error);
  }
  return [...bySlug.values()].sort((a, b) => a.name.localeCompare(b.name));
}

/** Products appear on many pages (home, catalog, categories, enquiry form), so refresh them all. */
function revalidate() {
  revalidateTag(CATALOG_TAG, { expire: 0 });
}

export async function addProduct(product: Omit<ProductData, "id">) {
  await requireAdmin();
  const newRef = websiteFirestore().collection("website_products").doc();
  await newRef.set({ ...clean(product), createdAt: new Date().toISOString() });
  revalidate();
  return { success: true, id: newRef.id };
}

export async function updateProduct(id: string, product: Partial<ProductData>) {
  await requireAdmin();
  await websiteFirestore().collection("website_products").doc(id)
    .set({ ...clean(product), deleted: null, updatedAt: new Date().toISOString() }, { merge: true });
  revalidate();
  return { success: true };
}

export async function deleteProduct(id: string, slug: string) {
  await requireAdmin();
  const ref = websiteFirestore().collection("website_products").doc(id);
  // Built-in products can't be removed from the code, so leave a marker that hides them.
  if (staticProducts.some((p) => p.slug === slug)) await ref.set({ slug, deleted: true, updatedAt: new Date().toISOString() });
  else await ref.delete();
  revalidate();
  return { success: true };
}
