import { PageHeader } from "@/components/ui/PageHeader";
import { ProductFilter } from "@/components/products/ProductFilter";
import { ProductCard } from "@/components/products/ProductCard";
import { EnquiryBand } from "@/components/sections/EnquiryBand";
import { JsonLd } from "@/components/ui/JsonLd";
import { categories } from "@/data/categories";
import { allSeries, products } from "@/data/products";
import { buildMetadata } from "@/lib/seo";
import { itemListSchema } from "@/lib/structured-data";
import { toFilterItem } from "@/lib/filter";

export const metadata = buildMetadata({
  title: "Products — White Boards, Chalk Boards, Notice Boards & More",
  description:
    "Browse the Plusmark Display System range: white boards, chalk boards, notice boards, magnetic and ceramic boards, acrylic door cover notice boards, board stands, clipboards, school benches and schedule boards.",
  path: "/products",
});

export default function ProductsPage() {
  const cards = Object.fromEntries(products.map((p) => [p.slug, <ProductCard key={p.slug} product={p} headingLevel="h2" />]));
  return (
    <>
      <PageHeader
        crumbs={[{ name: "Products", path: "/products" }]}
        eyebrow={`${products.length} products · ${categories.length} categories`}
        title={<>Premium Display &amp; Educational Systems</>}
        intro="The complete Plusmark catalogue — writing boards, notice and display boards, stands, clipboards and school benches, manufactured in India for schools, institutions, offices and government organisations."
      />
      <section className="container-x pb-24" aria-label="Product catalogue">
        <ProductFilter
          products={products.map(toFilterItem)}
          categories={categories.map(({ slug, name }) => ({ slug, name }))}
          series={allSeries}
          cards={cards}
        />
      </section>
      <EnquiryBand />
      <JsonLd data={itemListSchema("Plusmark Display System products", products)} />
    </>
  );
}
