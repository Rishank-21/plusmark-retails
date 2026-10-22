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
      { label: "Corners", value: "Signature Dual-Tone Corners (red cap over black connector)" },
      { label: "Type", value: "Non-Magnetic White Board" },
      { label: "Usage", value: "High-end offices, educational institutions, professional environments" },
    ],
  },
  {
    slug: "eco-premium-white-board",
    keyFeature: "Ribbed aluminium rails with signature L-shaped corners.",
    heroSpecs: [
      { label: "Material", value: "Marker Grade HPL Sheet" },
      { label: "Surface", value: "Smooth writing face for regular writing and easy erasing" },
      { label: "Frame", value: "Ribbed Aluminium Anodized Frame" },
      { label: "Corners", value: "Grey L-Corners with a Black Pebble-Grain Insert" },
      { label: "Type", value: "Non-Magnetic White Board" },
      { label: "Usage", value: "Offices, classrooms and institutions" },
    ],
  },
  {
    slug: "deluxe-standard-white-board",
    keyFeature: "Slim deluxe profile with clean one-piece grey corners.",
    heroSpecs: [
      { label: "Material", value: "Melamine Marker Surface" },
      { label: "Surface", value: "Smooth writing face for everyday marker use" },
      { label: "Frame", value: "Deluxe Anodized Aluminium Frame" },
      { label: "Corners", value: "One-piece Grey Moulded Corners (no visible fasteners)" },
      { label: "Type", value: "Non-Magnetic White Board" },
      { label: "Usage", value: "Homes, offices and classrooms" },
    ],
  },
  {
    slug: "eco-regular-white-board",
    keyFeature: "Economical ribbed frame with matte black corners.",
    heroSpecs: [
      { label: "Material", value: "Melamine Marker Surface" },
      { label: "Surface", value: "Smooth writing face for everyday marker use" },
      { label: "Frame", value: "Ribbed Aluminium Anodized Frame" },
      { label: "Corners", value: "Matte Black L-Corners with a Glossy Carved Recess" },
      { label: "Type", value: "Non-Magnetic White Board" },
      { label: "Usage", value: "Homes, schools and everyday use" },
    ],
  },
  {
    slug: "eco-premium-both-side-board",
    keyFeature: "2-in-1 surface — marker on one side, chalk on the other.",
    heroSpecs: [
      { label: "Type", value: "Non-Magnetic Both Side Board" },
      { label: "Surfaces", value: "Front: White Board (marker) · Back: Chalk Board (chalk)" },
      { label: "Frame", value: "Premium Aluminium Anodised Frame" },
      { label: "Design", value: "ABS Dual-Tone Edge" },
      { label: "Installation", value: "Quick wall-mount, horizontal or vertical" },
      { label: "Usage", value: "Offices, classrooms, home, restaurants & cafés" },
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
