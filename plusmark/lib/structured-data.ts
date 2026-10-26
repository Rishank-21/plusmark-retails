/**
 * JSON-LD builders. Only fields backed by real data are emitted —
 * no price, currency, rating, review, availability or SKU is fabricated.
 */
import { company, contactChannels, location } from "@/data/company.ts";
import { categoryMap } from "@/data/categories.ts";
import type { Article } from "@/data/articles.ts";
import type { Product } from "@/data/types.ts";
import { absoluteImage, absoluteUrl, siteConfig } from "./seo.ts";

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": absoluteUrl("/#organization"),
    name: company.name,
    alternateName: ["Plusmark", "Plusmark Brands", company.catalogTitle],
    url: siteConfig.url,
    // Square 642x666 mark; Google requires the logo to be at least 112x112.
    logo: {
      "@type": "ImageObject",
      url: absoluteUrl("/images/plusmark-mark.png"),
      width: 642,
      height: 666,
    },
    slogan: company.tagline,
    foundingDate: String(company.established),
    description: company.about[0],
    areaServed: { "@type": "Country", name: "India" },
    knowsAbout: company.manufacturingRange,
    telephone: contactChannels.phone,
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "sales",
      telephone: contactChannels.phone,
      areaServed: "IN",
      ...(contactChannels.email ? { email: contactChannels.email } : {}),
    },
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
  const category = categoryMap[product.categorySlug];
  const parent = category.parentSlug ? categoryMap[category.parentSlug] : undefined;
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": absoluteUrl(`/products/${product.slug}#product`),
    name: product.name,
    description: product.description,
    url: absoluteUrl(`/products/${product.slug}`),
    image: product.gallery.map((src) => absoluteImage(src)),
    category: parent ? [parent.name, category.name] : category.name,
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

/**
 * Category and subcategory landing pages. Carries the product list as `mainEntity` so the
 * ItemList is emitted once, as part of the page node, instead of as a second disconnected graph.
 */
export function collectionPageSchema({
  name,
  description,
  path,
  products,
}: {
  name: string;
  description: string;
  path: string;
  products: Product[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": absoluteUrl(`${path}#collection`),
    url: absoluteUrl(path),
    name,
    description,
    isPartOf: { "@id": absoluteUrl("/#website") },
    about: { "@id": absoluteUrl("/#organization") },
    mainEntity: {
      "@type": "ItemList",
      name,
      numberOfItems: products.length,
      itemListElement: products.map((p, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: absoluteUrl(`/products/${p.slug}`),
        name: p.name,
      })),
    },
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

/**
 * Blog articles. `author` is the Organization rather than an invented person, and the dates are
 * the ones recorded in data/articles.ts — both are what Google cross-checks against the page.
 */
export function articleSchema(article: Article, image: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": absoluteUrl(`/blog/${article.slug}#article`),
    headline: article.seoTitle,
    description: article.description,
    image: absoluteImage(image),
    inLanguage: siteConfig.locale.replace("_", "-"),
    datePublished: article.published,
    dateModified: article.updated,
    author: { "@id": absoluteUrl("/#organization") },
    publisher: { "@id": absoluteUrl("/#organization") },
    isPartOf: { "@id": absoluteUrl("/blog#collection") },
    mainEntityOfPage: { "@type": "WebPage", "@id": absoluteUrl(`/blog/${article.slug}`) },
    keywords: article.topic,
  };
}

/**
 * The blog index. Same CollectionPage + inline ItemList shape as a category page, with the
 * article nodes as `mainEntity` so the list is not a second disconnected graph.
 */
export function blogIndexSchema(entries: Array<{ slug: string; title: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": absoluteUrl("/blog#collection"),
    url: absoluteUrl("/blog"),
    name: "Plusmark Blog",
    description:
      "Guides from Plusmark on choosing, sizing, surfacing and maintaining white boards, chalk boards and notice boards for schools, offices and institutions.",
    isPartOf: { "@id": absoluteUrl("/#website") },
    about: { "@id": absoluteUrl("/#organization") },
    mainEntity: {
      "@type": "ItemList",
      name: "Plusmark Blog",
      numberOfItems: entries.length,
      itemListElement: entries.map((a, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: absoluteUrl(`/blog/${a.slug}`),
        name: a.title,
      })),
    },
  };
}
