import { categories } from "@/data/categories";
import { getProductsByCategory, products } from "@/data/products";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ProductCard } from "@/components/products/ProductCard";
import { CategoryGrid } from "@/components/products/CategoryGrid";
import { Reveal } from "@/components/animations/Reveal";
import { HomeCollection } from "./HomeCollection";

export function CollectionSection() {
  const featured = products.filter((p) => p.featured).map((p) => p.slug);
  const tabs = [
    { slug: "featured", name: "Featured", products: featured, href: "/products" },
    ...categories
      .filter((c) => c.slug !== "schedule-boards")
      .map((c) => ({
        slug: c.slug,
        name: c.name,
        products: getProductsByCategory(c.slug).slice(0, 8).map((p) => p.slug),
        href: `/products/${c.slug}`,
      })),
  ];
  const used = new Set(tabs.flatMap((t) => t.products));
  const cards = Object.fromEntries(
    products.filter((p) => used.has(p.slug)).map((p) => [p.slug, <ProductCard key={p.slug} product={p} />]),
  );

  return (
    <section id="collection" aria-labelledby="collection-title" className="bg-white py-24 md:py-32">
      <div className="container-x">
        <Reveal className="mb-14 flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <SectionHeading
            id="collection-title"
            eyebrow="The Collection"
            title="Premium Display & Educational Systems"
            intro="Writing boards, notice and display boards, stands, clipboards and school benches — one manufacturing partner for classrooms, offices and institutions."
          />
        </Reveal>
        <HomeCollection tabs={tabs} cards={cards} />

        <div className="mt-24">
          <Reveal>
            <h3 className="mb-8 font-display text-2xl font-semibold">Browse by category</h3>
          </Reveal>
          <CategoryGrid />
        </div>
      </div>
    </section>
  );
}
