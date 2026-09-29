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
  { href: "/quality", label: "Quality" },
  { href: "/custom-solutions", label: "Custom Solutions" },
  { href: "/industries", label: "Industries" },
  { href: "/buying-guide", label: "Buying Guide" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
] as const;

export function absoluteUrl(path = "/") {
  return `${siteConfig.url}${path.startsWith("/") ? path : `/${path}`}`;
}

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
  const images = image ? [{ url: image, width: 1600, height: 1200, alt: imageAlt ?? title }] : undefined;
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
      ...(images ? { images } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(image ? { images: [image] } : {}),
    },
    robots: noIndex
      ? { index: false, follow: true }
      : { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large" } },
  };
}
