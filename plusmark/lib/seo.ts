import type { Metadata } from "next";
import { company } from "@/data/company.ts";

export const siteConfig = {
  name: company.name,
  url: (process.env.NEXT_PUBLIC_SITE_URL || company.website).replace(/\/$/, ""),
  description:
    "Plusmark Display System — Indian manufacturer of white boards, chalk boards, notice boards, magnetic and ceramic boards, board stands, clipboards and school benches. Established in 2015. GEM Portal approved, Pan India supply.",
  locale: "en_IN",
  ogImage: "/opengraph-image",
};

export const navLinks = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Products" },
  { href: "/about", label: "About" },
  { href: "/custom-solutions", label: "Custom Solutions" },
  { href: "/industries", label: "Industries" },
  { href: "/buying-guide", label: "Buying Guide" },
  { href: "/blog", label: "Blog" },
  { href: "/contact", label: "Contact" },
] as const;

/** Everything that does not fit the primary navbar row lives in the "More" dropdown. */
const moreNavHrefs = ["/industries", "/buying-guide", "/blog"];

export const primaryNavLinks = navLinks.filter((link) => !moreNavHrefs.includes(link.href));

export const moreNavLinks = navLinks.filter((link) => moreNavHrefs.includes(link.href));

export function absoluteUrl(path = "/") {
  return `${siteConfig.url}${path.startsWith("/") ? path : `/${path}`}`;
}

/**
 * Catalog photos are either local (`/images/...`) or already absolute (Cloudinary, Firebase
 * Storage). Prefixing an absolute URL would produce an unfetchable
 * `https://host/https://cdn/...`, so pass those through untouched.
 */
export function absoluteImage(src: string) {
  return /^https?:\/\//.test(src) ? src : absoluteUrl(src);
}

/** Dimensions of the generated brand card served at siteConfig.ogImage (see app/opengraph-image.tsx). */
const DEFAULT_OG_SIZE = { width: 1200, height: 630 };
const DEFAULT_OG_ALT = "Plusmark Display System — Writing & Display Systems, Made in India";

interface BuildMetadataInput {
  title: string;
  description: string;
  path: string;
  image?: string;
  imageAlt?: string;
  noIndex?: boolean;
  /** Use the title as-is, without the site-name template. */
  absoluteTitle?: boolean;
}

export function buildMetadata({
  title,
  description,
  path,
  image,
  imageAlt,
  noIndex,
  absoluteTitle,
}: BuildMetadataInput): Metadata {
  // The opengraph-image file convention only applies to its own segment, so pages without a
  // product photo would otherwise ship no social card at all. Fall back to the brand card.
  const images = image
    ? [{ url: image, width: 1600, height: 1200, alt: imageAlt ?? title }]
    : [{ url: siteConfig.ogImage, ...DEFAULT_OG_SIZE, alt: DEFAULT_OG_ALT }];
  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      siteName: siteConfig.name,
      locale: siteConfig.locale,
      url: path,
      title,
      description,
      images,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [images[0].url],
    },
    robots: noIndex
      ? { index: false, follow: true }
      : { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large" } },
  };
}
