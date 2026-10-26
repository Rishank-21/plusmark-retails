import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader";
import { articlesByNewest } from "@/data/articles";
import { categories } from "@/data/categories";
import { getCatalog, productsForCategory } from "@/lib/catalog";
import { navLinks, buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Sitemap",
  description: "All pages, product categories and products on the Plusmark Display System website.",
  path: "/site-map",
});

const pages = [
  ...navLinks,
  { href: "/quality", label: "Quality" },
  { href: "/faq", label: "FAQ" },
  { href: "/privacy-policy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms" },
];

export default async function SiteMapPage() {
  // The live catalog, so products filed under a subcategory still appear beneath their parent.
  const catalog = await getCatalog();
  return (
    <>
      <PageHeader crumbs={[{ name: "Sitemap", path: "/site-map" }]} title="Sitemap" />
      <div className="container-x grid gap-12 py-16 md:grid-cols-[14rem_1fr] md:py-24">
        <section aria-labelledby="sm-pages">
          <h2 id="sm-pages" className="eyebrow mb-4">Pages</h2>
          <ul className="space-y-2 text-sm">
            {pages.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="link-underline">{l.label}</Link>
              </li>
            ))}
          </ul>
          <h2 id="sm-guides" className="eyebrow mb-4 mt-8">Guides</h2>
          <ul className="space-y-2 text-sm">
            {articlesByNewest.map((a) => (
              <li key={a.slug}>
                <Link href={`/blog/${a.slug}`} className="link-underline">{a.seoTitle}</Link>
              </li>
            ))}
          </ul>
        </section>
        <section aria-labelledby="sm-products" className="columns-1 gap-10 sm:columns-2 lg:columns-3">
          <h2 id="sm-products" className="sr-only">Products</h2>
          {categories.map((c) => {
            const list = productsForCategory(catalog, c.slug);
            return (
              <div key={c.slug} className="mb-10 break-inside-avoid">
                <h3 className="font-display text-base font-semibold">
                  <Link href={`/products/${c.slug}`} className="link-underline">{c.name}</Link>
                </h3>
                {c.subcategories && c.subcategories.length > 0 && (
                  <ul className="mt-3 space-y-1.5 text-sm">
                    {c.subcategories.map((sub) => (
                      <li key={sub.slug}>
                        <Link href={`/products/${sub.slug}`} className="link-underline font-medium hover:text-graphite">
                          {sub.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
                <ul className="mt-3 space-y-1.5 text-sm text-steel">
                  {list.map((p) => (
                    <li key={p.slug}>
                      <Link href={`/products/${p.slug}`} className="link-underline hover:text-graphite">{p.name}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </section>
      </div>
    </>
  );
}
