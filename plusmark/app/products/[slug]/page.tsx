import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { categories, getCategory } from "@/data/categories";
import { getProduct, products } from "@/data/products";
import { buildMetadata } from "@/lib/seo";
import { CategoryView } from "@/components/products/CategoryView";
import { ProductDetail } from "@/components/products/ProductDetail";

/**
 * One segment serves both category pages (/products/white-boards) and product
 * pages (/products/metallic-premium-white-board). Slugs are unique across both.
 */
export const dynamicParams = false;

export function generateStaticParams() {
  return [...categories.map((c) => ({ slug: c.slug })), ...products.map((p) => ({ slug: p.slug }))];
}

export async function generateMetadata({ params }: PageProps<"/products/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const category = getCategory(slug);
  if (category) {
    return buildMetadata({
      title: category.seoTitle,
      description: category.seoDescription,
      path: `/products/${category.slug}`,
      image: getProduct(category.coverProduct)?.image,
      imageAlt: category.name,
    });
  }
  const product = getProduct(slug);
  if (!product) return {};
  return buildMetadata({
    title: product.seoTitle,
    description: product.seoDescription,
    path: `/products/${product.slug}`,
    image: product.image,
    imageAlt: product.imageAlt,
  });
}

export default async function ProductOrCategoryPage({ params }: PageProps<"/products/[slug]">) {
  const { slug } = await params;
  const category = getCategory(slug);
  if (category) return <CategoryView category={category} />;
  const product = getProduct(slug);
  if (!product) notFound();
  return <ProductDetail product={product} />;
}
