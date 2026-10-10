"use server";

import { adminDb } from "@/lib/firebase-admin";
import { revalidatePath } from "next/cache";
import type { Product, CategorySlug, Series, Spec } from "@/data/types";
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

// Convert static products to ProductData format
const getStaticProducts = (): ProductData[] => {
  return staticProducts.map((product, index) => ({
    id: product.slug, // Use slug as ID for static products
    slug: product.slug,
    name: product.name,
    categorySlug: product.categorySlug,
    series: product.series,
    shortDescription: product.shortDescription,
    description: product.description,
    features: product.features,
    specifications: product.specifications,
    applications: product.applications,
    variants: product.variants,
    colors: product.colors,
    sizes: product.sizes,
    notes: product.notes,
    highlights: product.highlights,
    catalogDetail: product.catalogDetail || "full",
    featured: product.featured || false,
    image: product.image,
    gallery: product.gallery || [],
  }));
};

export async function getProducts(): Promise<ProductData[]> {
  try {
    const db = adminDb();
    const snapshot = await db.ref("products").orderByChild("name").once("value");
    const products: ProductData[] = [];
    
    snapshot.forEach((child) => {
      const data = child.val();
      products.push({
        id: child.key as string,
        slug: data.slug,
        name: data.name,
        categorySlug: data.categorySlug,
        series: data.series,
        shortDescription: data.shortDescription,
        description: data.description,
        features: data.features || [],
        specifications: data.specifications || [],
        applications: data.applications || [],
        variants: data.variants || [],
        colors: data.colors || [],
        sizes: data.sizes || [],
        notes: data.notes || [],
        highlights: data.highlights || [],
        catalogDetail: data.catalogDetail || "full",
        featured: data.featured || false,
        image: data.image,
        gallery: data.gallery || [],
      });
    });
    
    // If database has products, return them; otherwise return static data
    return products.length > 0 ? products : getStaticProducts();
  } catch (error) {
    console.error("Error fetching products, returning static data:", error);
    return getStaticProducts();
  }
}

export async function addProduct(product: Omit<ProductData, "id">) {
  const db = adminDb();
  const newRef = db.ref("products").push();
  
  await newRef.set({
    ...product,
    createdAt: new Date().toISOString(),
  });
  
  revalidatePath("/products");
  revalidatePath("/admin/products");
  return { success: true, id: newRef.key };
}

export async function updateProduct(id: string, product: Partial<ProductData>) {
  const db = adminDb();
  await db.ref(`products/${id}`).update({
    ...product,
    updatedAt: new Date().toISOString(),
  });
  
  revalidatePath("/products");
  revalidatePath("/admin/products");
  return { success: true };
}

export async function deleteProduct(id: string) {
  const db = adminDb();
  await db.ref(`products/${id}`).remove();
  
  revalidatePath("/products");
  revalidatePath("/admin/products");
  return { success: true };
}
