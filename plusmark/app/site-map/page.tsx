import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader";
import { categories } from "@/data/categories";
import { getProductsByCategory } from "@/data/products";
import { navLinks, buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Sitemap",
  description: "All pages, product categories and products on the Plusmark Display System website.",
  path: "/site-map",
});

export default function SiteMapPage() {
  return (
    <>
      <PageHeader crumbs={[{ name: "Sitemap", path: "/site-map" }]} title="Sitemap" />
      <div className="container-x grid gap-12 py-16 md:grid-cols-[14rem_1fr] md:py-24">
        <section aria-labelledby="sm-pages">
          <h2 id="sm-pages" className="eyebrow mb-4">Pages</h2>
          <ul className="space-y-2 text-sm">
            {[...navLinks, { href: "/privacy-policy", label: "Privacy Policy" }, { href: "/terms", label: "Terms" }].map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="link-underline">{l.label}</Link>
              </li>
            ))}
          </ul>
        </section>
        <section aria-labelledby="sm-products" className="columns-1 gap-10 sm:columns-2 lg:columns-3">
          <h2 id="sm-products" className="sr-only">Products</h2>
          {categories.map((c) => (
            <div key={c.slug} className="mb-10 break-inside-avoid">
              <h3 className="font-display text-base font-semibold">
                <Link href={`/products/${c.slug}`} className="link-underline">{c.name}</Link>
              </h3>
              <ul className="mt-3 space-y-1.5 text-sm text-steel">
                {getProductsByCategory(c.slug).map((p) => (
                  <li key={p.slug}>
                    <Link href={`/products/${p.slug}`} className="link-underline hover:text-graphite">{p.name}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>
      </div>
    </>
  );
}
