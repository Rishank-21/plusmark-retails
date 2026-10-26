import type { Category } from "@/data/types";
import { getParentCategory } from "@/data/categories";
import { getCatalog, liveSubcategoryConfig, productsForCategory } from "@/lib/catalog";
import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader";
import { ProductCard } from "./ProductCard";
import { SubcategoryProductList } from "./SubcategoryProductList";
import { CategoryGrid } from "./CategoryGrid";
import { EnquiryBand } from "@/components/sections/EnquiryBand";
import { RelatedGuides } from "@/components/sections/RelatedGuides";
import { JsonLd } from "@/components/ui/JsonLd";
import { Reveal } from "@/components/animations/Reveal";
import { collectionPageSchema } from "@/lib/structured-data";
import { cn } from "@/lib/utils";

export async function CategoryView({ category }: { category: Category }) {
  const catalog = await getCatalog();
  const subcategoryConfig = liveSubcategoryConfig(catalog, category.slug);
  const list = productsForCategory(catalog, category.slug);
  const listingOnly = list.every((p) => p.catalogDetail === "listing");
  // Subcategory pages sit one level below their parent, so the breadcrumb and the sibling
  // switcher both need the parent to keep the category silo connected.
  const parent = category.parentSlug ? getParentCategory(category.slug) : undefined;
  const path = `/products/${category.slug}`;
  return (
    <>
      <PageHeader
        crumbs={[
          { name: "Products", path: "/products" },
          ...(parent ? [{ name: parent.name, path: `/products/${parent.slug}` }] : []),
          { name: category.name, path },
        ]}
        eyebrow={`${list.length} ${list.length === 1 ? "product" : "products"}`}
        title={category.name}
        intro={category.intro}
      />

      <section className="container-x py-16 md:py-20" aria-labelledby="range-title">
        <h2 id="range-title" className="sr-only">
          {category.name} range
        </h2>

        {parent?.subcategories && (
          <nav aria-label={`${parent.name} types`} className="mb-10 flex flex-wrap items-center gap-2">
            <Link
              href={`/products/${parent.slug}`}
              className="rounded-full bg-mist px-4 py-2 text-xs font-semibold text-steel ring-1 ring-line transition-all hover:bg-fog hover:text-graphite"
            >
              All {parent.name}
            </Link>
            {parent.subcategories.map((sub) => {
              const isCurrent = sub.slug === category.slug;
              return (
                <Link
                  key={sub.slug}
                  href={`/products/${sub.slug}`}
                  aria-current={isCurrent ? "page" : undefined}
                  className={cn(
                    "rounded-full px-4 py-2 text-xs font-semibold ring-1 transition-all",
                    isCurrent
                      ? "bg-accent text-white shadow-sm ring-accent"
                      : "bg-mist text-steel ring-line hover:bg-fog hover:text-graphite",
                  )}
                >
                  {sub.name}
                </Link>
              );
            })}
          </nav>
        )}

        {subcategoryConfig ? (
          <SubcategoryProductList
            category={category}
            config={subcategoryConfig}
            allProducts={list}
            listingOnly={listingOnly}
          />
        ) : (
          <>
            {listingOnly && (
              <p className="mb-8 max-w-2xl border-l-2 border-accent bg-accent-soft/50 px-5 py-4 text-sm text-graphite">
                The Plusmark catalog lists these models by name. Request an enquiry for dimensions, materials and finishes.
              </p>
            )}
            <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {list.map((p, i) => (
                <Reveal as="li" key={p.slug} delay={Math.min(i, 6) * 0.05}>
                  <ProductCard product={p} />
                </Reveal>
              ))}
            </ul>
          </>
        )}
      </section>

      <section className="border-t border-fog bg-mist py-16 md:py-20" aria-labelledby="other-cats">
        <div className="container-x">
          <h2 id="other-cats" className="mb-8 font-display text-2xl font-semibold">
            Other categories
          </h2>
          <CategoryGrid exclude={category.slug} compact />
        </div>
      </section>

      <RelatedGuides
        slugs={[
          category.slug,
          ...(category.subcategories ?? []).map((s) => s.slug),
          // A subcategory is a narrower cut of its parent, so guides written about the parent apply.
          ...(parent ? [parent.slug] : []),
        ]}
        title={`Guides on ${category.name.toLowerCase()}`}
      />

      <EnquiryBand title={`Enquire about ${category.name.toLowerCase()}`} />
      <JsonLd
        data={collectionPageSchema({
          name: category.name,
          description: category.seoDescription,
          path,
          products: list,
        })}
      />
    </>
  );
}
