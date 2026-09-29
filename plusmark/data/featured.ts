/**
 * Hero showcase sequence. Data-driven: the hero renders whatever is in this array.
 * Name / category / description come from products.ts; the specs below are
 * condensed, verbatim catalog phrases for the right-hand spec column.
 */
import type { Spec } from "./types.ts";
import { getProduct } from "./products.ts";
import { categoryMap } from "./categories.ts";

type FeaturedInput = {
  slug: string;
  keyFeature: string;
  heroSpecs: Spec[];
  /** Initial yaw so the model shows its depth & corners. */
  yaw?: number;
  /** Normalised size of the model in the hero scene. */
  fit?: number;
};

const featuredInput: FeaturedInput[] = [
  {
    slug: "metallic-premium-white-board",
    keyFeature: "Extremely long-lasting and highly resistant to wear and tear.",
    heroSpecs: [
      { label: "Material", value: "High Gloss Marker Grade HPL Sheet" },
      { label: "Surface", value: "Ultra-smooth, high-gloss for effortless writing and easy erasing" },
      { label: "Frame", value: "Aluminium Anodized Frame · heavy-duty framing" },
      { label: "Corners", value: "Signature Dual-Tone Corners" },
      { label: "Type", value: "Non-Magnetic White Board" },
      { label: "Usage", value: "High-end offices, educational institutions, professional environments" },
    ],
  },
  {
    slug: "metallic-premium-chalk-board",
    keyFeature: "Designed for intensive daily institutional use.",
    heroSpecs: [
      { label: "Material", value: "High-quality materials with rigid core construction" },
      { label: "Surface", value: "Hardcore Chalk Grade HPL Sheet — non-reflective, glare-free" },
      { label: "Frame", value: "Heavy-duty aluminium framing" },
      { label: "Corners", value: "Signature Dual-Tone Corners" },
      { label: "Installation", value: "Wall-mountable, easy to install" },
      { label: "Usage", value: "Schools, colleges, offices, institutional classrooms" },
    ],
  },
  {
    slug: "metallic-premium-notice-board",
    keyFeature: "Highest grade, designed for long-term institutional use.",
    heroSpecs: [
      { label: "Material", value: "Premium aluminium construction" },
      { label: "Surface", value: "2 mm Blazer Cloth with long-lasting colour retention" },
      { label: "Core", value: "Soft pin-friendly core for frequent and heavy pin usage" },
      { label: "Corners", value: "Signature Dual-Tone Corners" },
      { label: "Colours", value: "Royal & Navy Blue, Almond & Dark Green, Red, Maroon, Light Gray, Dark Gray" },
      { label: "Usage", value: "Schools, colleges, corporate & government offices" },
    ],
  },
  {
    slug: "metallic-premium-magnetic-board",
    keyFeature: "Accepts magnets — compatible with magnets, charts and holders.",
    heroSpecs: [
      { label: "Type", value: "Resin Coated Steel Magnetic Board" },
      { label: "Surface", value: "Resin coated — marker (white) and chalk (green)" },
      { label: "Magnetic Use", value: "Magnets, charts and holders" },
      { label: "Frame", value: "Heavy-duty aluminium framing" },
      { label: "Corners", value: "Signature Dual-Tone Corners" },
      { label: "Finish", value: "Smooth writing surface for regular writing and erasing" },
    ],
  },
  {
    slug: "metallic-premium-ceramic-board",
    keyFeature: "Designed for very long product life under regular institutional use.",
    heroSpecs: [
      { label: "Surface", value: "Ceramic steel / porcelain enamel steel" },
      { label: "Options", value: "White Board (marker) · Chalk Board (chalk)" },
      { label: "Performance", value: "Hard, non-porous — continuous writing, frequent cleaning" },
      { label: "Frame", value: "Aluminium frame" },
      { label: "Corners", value: "Signature Dual-Tone Corners" },
      { label: "Maintenance", value: "Easy to clean and maintain for daily classroom use" },
    ],
  },
  {
    slug: "deluxe-45mm-adc-notice-board-double-door",
    keyFeature: "Transparent acrylic door cover protects notices from dust and handling.",
    heroSpecs: [
      { label: "Type", value: "Acrylic Door Covered Notice Board — Double Door" },
      { label: "Framing", value: "Deluxe 45 mm Triple Aluminium Framing" },
      { label: "Cover", value: "Transparent acrylic door cover" },
      { label: "Locking", value: "Secure double-door system" },
      { label: "Sizes", value: "5 × 4 ft · 6 × 4 ft · 8 × 4 ft" },
      { label: "Usage", value: "Offices, institutions, housing societies, hospitals, public areas" },
    ],
  },
  {
    slug: "laminate-mdf-base-clipboard",
    keyFeature: "Rounded edge for a safe and clean finish, uniform on both sides.",
    yaw: -0.55,
    fit: 1.75,
    heroSpecs: [
      { label: "Base", value: "Laminate MDF — HPL Sheet Wood Grade" },
      { label: "Clip", value: "Chrome Electroplated Clip — rust-resistant finish" },
      { label: "Finish", value: "Smooth & premium appearance, uniform on both sides" },
      { label: "Edge", value: "Rounded Edge — safe & clean finish" },
      { label: "Rivets", value: "Dual-Side Cap Rivets" },
      { label: "Sizes", value: "Available in 2 different sizes" },
    ],
  },
  {
    slug: "pds-sb-807",
    keyFeature: "Supporting educational infrastructure development.",
    yaw: -0.7,
    fit: 1.75,
    heroSpecs: [
      { label: "Model", value: "PDS-SB 807" },
      { label: "Range", value: "15 catalog models, PDS-SB 801 – PDS-SB 815" },
      { label: "Category", value: "School Benches" },
      { label: "Specifications", value: "Available on enquiry" },
    ],
  },
];

export interface FeaturedProduct {
  slug: string;
  name: string;
  category: string;
  categorySlug: string;
  description: string;
  keyFeature: string;
  heroSpecs: Spec[];
  model?: string;
  fallbackImage: string;
  imageAlt: string;
  yaw: number;
  fit: number;
}

export const featuredProducts: FeaturedProduct[] = featuredInput.map((f) => {
  const product = getProduct(f.slug);
  if (!product) throw new Error(`Featured product "${f.slug}" missing from products.ts`);
  return {
    slug: product.slug,
    name: product.name,
    category: categoryMap[product.categorySlug].name,
    categorySlug: product.categorySlug,
    description: product.shortDescription,
    keyFeature: f.keyFeature,
    heroSpecs: f.heroSpecs,
    model: product.model,
    fallbackImage: product.modelFallback,
    imageAlt: product.imageAlt,
    yaw: f.yaw ?? -0.38,
    fit: f.fit ?? 2.2,
  };
});
