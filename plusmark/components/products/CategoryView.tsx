import type { Category } from "@/data/types";
import { getProductsByCategory } from "@/data/products";
import { PageHeader } from "@/components/ui/PageHeader";
import { ProductCard } from "./ProductCard";
import { CategoryGrid } from "./CategoryGrid";
import { EnquiryBand } from "@/components/sections/EnquiryBand";
import { JsonLd } from "@/components/ui/JsonLd";
import { Reveal } from "@/components/animations/Reveal";
import { itemListSchema } from "@/lib/structured-data";

export function CategoryView({ category }: { category: Category }) {
  const list = getProductsByCategory(category.slug);
  const listingOnly = list.every((p) => p.catalogDetail === "listing");
  return (
    <>
      <PageHeader
        crumbs={[
          { name: "Products", path: "/products" },
          { name: category.name, path: `/products/${category.slug}` },
        ]}
        eyebrow={`${list.length} ${list.length === 1 ? "product" : "products"}`}
        title={category.name}
        intro={category.intro}
      />

      <section className="container-x py-16 md:py-20" aria-labelledby="range-title">
        <h2 id="range-title" className="sr-only">
          {category.name} range
        </h2>
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
      </section>

      <section className="border-t border-fog bg-mist py-16 md:py-20" aria-labelledby="other-cats">
        <div className="container-x">
          <h2 id="other-cats" className="mb-8 font-display text-2xl font-semibold">
            Other categories
          </h2>
          <CategoryGrid exclude={category.slug} compact />
        </div>
      </section>

      <EnquiryBand title={`Enquire about ${category.name.toLowerCase()}`} />
      <JsonLd data={itemListSchema(category.name, list)} />
    </>
  );
}
