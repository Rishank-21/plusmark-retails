/**
 * JSON-LD builders. Only fields backed by real data are emitted —
 * no price, currency, rating, review, availability or SKU is fabricated.
 */
import { company, contactChannels, location } from "@/data/company.ts";
import { categoryMap } from "@/data/categories.ts";
import type { Product } from "@/data/types.ts";
import { absoluteUrl, siteConfig } from "./seo.ts";

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": absoluteUrl("/#organization"),
    name: company.name,
    alternateName: ["Plusmark", "Plusmark Brands", company.catalogTitle],
    url: siteConfig.url,
    logo: absoluteUrl("/icon.svg"),
    slogan: company.tagline,
    foundingDate: String(company.established),
    description: company.about[0],
    areaServed: { "@type": "Country", name: "India" },
    knowsAbout: company.manufacturingRange,
    telephone: contactChannels.phone,
    address: {
      "@type": "PostalAddress",
      streetAddress: location.street,
      addressLocality: location.city,
      addressRegion: location.region,
      postalCode: location.postalCode,
      addressCountry: location.country,
    },
  };
}

export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": absoluteUrl("/#website"),
    name: company.name,
    url: siteConfig.url,
    publisher: { "@id": absoluteUrl("/#organization") },
    inLanguage: "en-IN",
  };
}

export function productSchema(product: Product) {
  const additionalProperty = product.specifications.map((s) => ({
    "@type": "PropertyValue",
    name: s.label,
    value: s.value,
  }));
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": absoluteUrl(`/products/${product.slug}#product`),
    name: product.name,
    description: product.description,
    url: absoluteUrl(`/products/${product.slug}`),
    image: product.gallery.map((src) => absoluteUrl(src)),
    category: categoryMap[product.categorySlug].name,
    brand: { "@type": "Brand", name: company.name },
    manufacturer: { "@id": absoluteUrl("/#organization") },
    countryOfOrigin: { "@type": "Country", name: "India" },
    ...(product.colors.length ? { color: product.colors.join(", ") } : {}),
    ...(additionalProperty.length ? { additionalProperty } : {}),
  };
}

export function breadcrumbSchema(items: Array<{ name: string; path: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function itemListSchema(name: string, products: Product[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    numberOfItems: products.length,
    itemListElement: products.map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: absoluteUrl(`/products/${p.slug}`),
      name: p.name,
    })),
  };
}

export function faqSchema(items: ReadonlyArray<{ q: string; a: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };
}
