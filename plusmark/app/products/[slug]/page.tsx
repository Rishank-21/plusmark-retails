import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { categories, getCategory } from "@/data/categories";
import { products } from "@/data/products";
import { buildMetadata } from "@/lib/seo";
import { getAdminAplus, getCatalog, getLiveProduct, relatedProducts } from "@/lib/catalog";
import { getVideosForProduct } from "@/lib/videos";
import { CategoryView } from "@/components/products/CategoryView";
import { ProductDetail } from "@/components/products/ProductDetail";

/**
 * One segment serves both category pages (/products/white-boards) and product
 * pages (/products/metallic-premium-white-board). Slugs are unique across both.
 *
 * Built-in slugs are prerendered; products added in /admin are rendered on first visit
 * (dynamicParams) and then cached until the next admin save.
 */
export const dynamicParams = true;

export function generateStaticParams() {
  const categoryParams = categories.map((c) => ({ slug: c.slug }));
  const subcategoryParams = categories.flatMap((c) => c.subcategories || []).map((sc) => ({ slug: sc.slug }));
  const productParams = products.map((p) => ({ slug: p.slug }));
  return [...categoryParams, ...subcategoryParams, ...productParams];
}

export async function generateMetadata({ params }: PageProps<"/products/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const category = getCategory(slug);
  if (category) {
    const cover = await getLiveProduct(category.coverProduct);
    return buildMetadata({
      title: category.seoTitle,
      description: category.seoDescription,
      path: `/products/${category.slug}`,
      image: cover?.image,
      imageAlt: category.name,
    });
  }
  const product = await getLiveProduct(slug);
  if (!product) notFound();
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
  const catalog = await getCatalog();
  const product = catalog.find((p) => p.slug === slug);
  if (!product) notFound();
  const [adminAplus, videos] = await Promise.all([getAdminAplus(slug), getVideosForProduct(slug)]);
  return <ProductDetail product={product} related={relatedProducts(catalog, product)} adminAplus={adminAplus} videos={videos} />;
}
