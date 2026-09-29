/**
 * Plusmark product database.
 *
 * SOURCE OF TRUTH: the Plusmark Display System product catalog.
 * Do not add prices, ratings, reviews, dimensions or specifications that are not
 * printed in the catalog. Products the catalog only lists by name are marked
 * `catalogDetail: "listing"`.
 */
import type { CategorySlug, Product, Series, Spec } from "./types.ts";
import { categoryMap } from "./categories.ts";
import { modelPath } from "./visuals.ts";
import { gallery } from "./gallery.ts";
import { sizeOptions } from "./sizes.ts";

type ProductInput = {
  slug: string;
  name: string;
  categorySlug: CategorySlug;
  series: Series;
  shortDescription: string;
  description?: string;
  features?: string[];
  specifications?: Spec[];
  applications?: string[];
  variants?: string[];
  colors?: string[];
  sizes?: string[];
  notes?: string[];
  highlights?: string[];
  catalogDetail?: "full" | "listing";
  featured?: boolean;
};

const BRAND = "Plusmark Display System";

function clip(text: string, max = 158): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max - 1);
  return `${cut.slice(0, cut.lastIndexOf(" "))}…`;
}

function define(input: ProductInput): Product {
  // The gallery's first entry is the main photo with a content-hash `?v=` suffix, so
  // replaced photos get a fresh URL instead of a stale cached copy.
  const image = gallery[input.slug]?.[0] ?? `/images/products/${input.slug}.webp`;
  const category = categoryMap[input.categorySlug];
  return {
    description: input.shortDescription,
    features: [],
    specifications: [],
    applications: [],
    variants: [],
    colors: [],
    notes: [],
    highlights: [],
    catalogDetail: "full",
    featured: false,
    ...input,
    sizes: input.sizes ?? (sizeOptions[input.slug] ?? []).map((s) => s.label),
    sizeOptions: sizeOptions[input.slug] ?? [],
    image,
    imageAlt: `${input.name} — ${category.name} by ${BRAND}`,
    gallery: gallery[input.slug] ?? [image],
    model: modelPath(input.slug),
    modelFallback: image,
    seoTitle: `${input.name} | ${category.name}`,
    seoDescription: clip(`${input.name} by ${BRAND}. ${input.shortDescription}`),
  };
}

const NOTICE_COLORS_PREMIUM = [
  "Royal & Navy Blue",
  "Almond & Dark Green",
  "Red",
  "Maroon",
  "Light Gray",
  "Dark Gray",
];
const NOTICE_COLORS_STANDARD = ["Red", "Blue", "Maroon", "Green"];
const FRAME_VARIANTS = ["Metallic Premium", "Eco Premium", "Deluxe"];

/* ------------------------------------------------------------------ */
/* White Boards                                                        */
/* ------------------------------------------------------------------ */
const whiteBoards: Product[] = [
  define({
    slug: "metallic-premium-white-board",
    name: "Metallic Premium White Board",
    categorySlug: "white-boards",
    series: "Metallic Premium",
    featured: true,
    highlights: ["Non-Magnetic White Board", "Signature Dual-Tone Corners", "Aluminium Anodized Frame"],
    shortDescription:
      "High Gloss Marker Grade HPL Sheet with heavy-duty framing and Signature Dual-Tone Corners — an ultra-smooth, high-gloss surface for effortless writing and easy erasing.",
    description:
      "The Metallic Premium White Board is built from high-quality, durable materials with a High Gloss Marker Grade HPL Sheet. Heavy-duty framing with Signature Dual-Tone Corners frames an ultra-smooth, high-gloss surface for effortless writing and easy erasing. It is extremely long-lasting and highly resistant to wear and tear.",
    features: [
      "High Gloss Marker Grade HPL Sheet",
      "Heavy-duty framing with Signature Dual-Tone Corners",
      "Ultra-smooth, high-gloss surface for effortless writing and easy erasing",
      "Extremely long-lasting and highly resistant to wear and tear",
    ],
    specifications: [
      { label: "Type", value: "Non-Magnetic White Board" },
      { label: "Material", value: "High-quality, durable materials with High Gloss Marker Grade HPL Sheet" },
      { label: "Design", value: "Heavy-duty framing with Signature Dual-Tone Corners" },
      { label: "Frame", value: "Aluminium Anodized Frame" },
      { label: "Surface", value: "Ultra-smooth, high-gloss surface for effortless writing and easy erasing" },
      { label: "Durability", value: "Extremely long-lasting and highly resistant to wear and tear" },
    ],
    applications: ["High-end offices", "Educational institutions", "Professional environments"],
  }),
  define({
    slug: "eco-premium-white-board",
    name: "Eco Premium White Board",
    categorySlug: "white-boards",
    series: "Eco Premium",
    highlights: ["Non-Magnetic White Board", "ABS Dual-Tone Corner Design", "Aluminium Anodized Frame"],
    shortDescription:
      "Premium-grade materials with High Gloss Marker Grade HPL Sheet and ABS Dual-Tone Corner Design for a smooth, seamless writing experience.",
    description:
      "The Eco Premium White Board uses premium-grade materials with High Gloss Marker Grade HPL Sheet for enhanced durability. Its ABS Dual-Tone Corner Design adds strength and a refined appearance, and the smooth, high-gloss surface ensures a seamless writing experience. Reliable and long-lasting for daily institutional use.",
    features: [
      "High Gloss Marker Grade HPL Sheet for enhanced durability",
      "ABS Dual-Tone Corner Design for added strength and refined appearance",
      "Smooth, high-gloss surface ensuring seamless writing experience",
      "Reliable and long-lasting for daily institutional use",
    ],
    specifications: [
      { label: "Type", value: "Non-Magnetic White Board" },
      { label: "Material", value: "Premium-grade materials with High Gloss Marker Grade HPL Sheet for enhanced durability" },
      { label: "Design", value: "ABS Dual-Tone Corner Design for added strength and refined appearance" },
      { label: "Frame", value: "Aluminium Anodized Frame" },
      { label: "Surface", value: "Smooth, high-gloss surface ensuring seamless writing experience" },
      { label: "Durability", value: "Reliable and long-lasting for daily institutional use" },
    ],
    applications: ["Schools", "Institutes", "Corporate environments"],
  }),
  define({
    slug: "deluxe-standard-white-board",
    name: "Deluxe Standard White Board",
    categorySlug: "white-boards",
    series: "Deluxe Standard",
    highlights: ["Non-Magnetic White Board", "Electroplated Chrome Corners"],
    shortDescription:
      "High Gloss Melamine Writing Surface with Electroplated Chrome Corners for a clean, professional look — smooth and easy to clean.",
    description:
      "The Deluxe Standard White Board is made from regular quality materials, with Electroplated Chrome Corners for a clean and professional look. Its High Gloss Melamine Writing Surface is smooth and easy to clean, and the board is dependable for regular use.",
    features: [
      "Electroplated Chrome Corners for a clean and professional look",
      "High Gloss Melamine Writing Surface, smooth and easy to clean",
      "Dependable for regular use",
    ],
    specifications: [
      { label: "Type", value: "Non-Magnetic White Board" },
      { label: "Material", value: "Regular quality materials" },
      { label: "Design", value: "Electroplated Chrome Corners for a clean and professional look" },
      { label: "Surface", value: "High Gloss Melamine Writing Surface, smooth and easy to clean" },
      { label: "Durability", value: "Dependable for regular use" },
    ],
    applications: ["Standard offices", "Classrooms", "Coaching centres"],
  }),
  define({
    slug: "eco-regular-white-board",
    name: "Eco Regular White Board",
    categorySlug: "white-boards",
    series: "Eco Regular",
    highlights: ["Non-Magnetic White Board", "Lightweight frame"],
    shortDescription:
      "Cost-effective board with a lightweight frame, standard plastic corners and a High Gloss Melamine Writing Surface for basic writing needs.",
    description:
      "The Eco Regular White Board uses cost-effective, regular materials. A lightweight frame with standard plastic corners makes it easy to handle and install, and the High Gloss Melamine Writing Surface suits basic writing needs. Good for light use and budget-friendly applications.",
    features: [
      "Lightweight frame with standard plastic corners, easy to handle and install",
      "High Gloss Melamine Writing Surface suitable for basic writing needs",
      "Good for light use and budget-friendly applications",
    ],
    specifications: [
      { label: "Type", value: "Non-Magnetic White Board" },
      { label: "Material", value: "Cost-effective, regular materials" },
      { label: "Design", value: "Lightweight frame with standard plastic corners, easy to handle and install" },
      { label: "Surface", value: "High Gloss Melamine Writing Surface suitable for basic writing needs" },
      { label: "Durability", value: "Good for light use and budget-friendly applications" },
    ],
    applications: ["Home offices", "Tuition classes", "Small classrooms"],
  }),
];

/* ------------------------------------------------------------------ */
/* Chalk Boards                                                        */
/* ------------------------------------------------------------------ */
const chalkBoards: Product[] = [
  define({
    slug: "metallic-premium-chalk-board",
    name: "Metallic Premium Chalk Board",
    categorySlug: "chalk-boards",
    series: "Metallic Premium",
    featured: true,
    highlights: ["Non-Magnetic Chalk Board", "Signature Dual-Tone Corners", "Wall-mountable"],
    shortDescription:
      "Hardcore Chalk Grade HPL Sheet on a rigid core with heavy-duty aluminium framing — non-reflective, glare-free, with clear visibility from all angles.",
    description:
      "The Metallic Premium Chalk Board is made from high-quality materials with rigid core construction. Heavy-duty aluminium framing with Signature Dual-Tone Corners surrounds a Hardcore Chalk Grade HPL Sheet with enhanced scratch resistance — non-reflective, glare-free, with clear visibility from all angles. Designed for intensive daily institutional use and wall-mountable for easy installation.",
    features: [
      "Hardcore Chalk Grade HPL Sheet with enhanced scratch resistance",
      "Non-reflective, glare-free, with clear visibility from all angles",
      "Heavy-duty aluminium framing with Signature Dual-Tone Corners",
      "Rigid core construction",
      "Designed for intensive daily institutional use",
      "Wall-mountable, easy to install",
    ],
    specifications: [
      { label: "Type", value: "Non-Magnetic Chalk Board" },
      { label: "Material", value: "High-quality materials with rigid core construction" },
      { label: "Design", value: "Heavy-duty aluminium framing with Signature Dual-Tone Corners" },
      { label: "Surface", value: "Hardcore Chalk Grade HPL Sheet with enhanced scratch resistance; non-reflective, glare-free, with clear visibility from all angles" },
      { label: "Durability", value: "Designed for intensive daily institutional use" },
      { label: "Installation", value: "Wall-mountable, easy to install" },
    ],
    applications: ["Schools", "Colleges", "Offices", "Institutional classrooms"],
  }),
  define({
    slug: "eco-premium-chalk-board",
    name: "Eco Premium Chalk Board",
    categorySlug: "chalk-boards",
    series: "Eco Premium",
    highlights: ["Non-Magnetic Chalk Board", "ABS Dual-Tone Corner Design"],
    shortDescription:
      "Hardcore Chalk Grade HPL Sheet with enhanced scratch resistance and ABS Dual-Tone Corner Design — non-reflective and glare-free.",
    description:
      "The Eco Premium Chalk Board is built from premium-grade strong materials with an ABS Dual-Tone Corner Design for added strength. Its Hardcore Chalk Grade HPL Sheet offers enhanced scratch resistance and is non-reflective and glare-free, with clear visibility from all angles. Reliable and long-lasting for regular institutional use.",
    features: [
      "Hardcore Chalk Grade HPL Sheet with enhanced scratch resistance",
      "Non-reflective and glare-free with clear visibility from all angles",
      "ABS Dual-Tone Corner Design for added strength",
      "Reliable and long-lasting for regular institutional use",
    ],
    specifications: [
      { label: "Type", value: "Non-Magnetic Chalk Board" },
      { label: "Material", value: "Premium-grade strong materials" },
      { label: "Design", value: "ABS Dual-Tone Corner Design for added strength" },
      { label: "Surface", value: "Hardcore Chalk Grade HPL Sheet with enhanced scratch resistance; non-reflective and glare-free with clear visibility from all angles" },
      { label: "Durability", value: "Reliable and long-lasting for regular institutional use" },
    ],
    applications: ["Classrooms", "Training rooms", "Offices"],
  }),
  define({
    slug: "deluxe-standard-chalk-board",
    name: "Deluxe Standard Chalk Board",
    categorySlug: "chalk-boards",
    series: "Deluxe Standard",
    highlights: ["Non-Magnetic Chalk Board", "Electroplated Chrome Corners"],
    shortDescription:
      "Chalk Grade HPL Sheet with Electroplated Chrome Corners — non-reflective, glare-free and dependable for everyday use.",
    description:
      "The Deluxe Standard Chalk Board uses regular quality materials with balanced performance and Electroplated Chrome Corners for a clean finish. The Chalk Grade HPL Sheet is non-reflective and glare-free, with clear visibility from all angles. Durable and dependable for everyday use.",
    features: [
      "Chalk Grade HPL Sheet — non-reflective, glare-free",
      "Clear visibility from all angles",
      "Electroplated Chrome Corners for a clean finish",
      "Durable and dependable for everyday use",
    ],
    specifications: [
      { label: "Type", value: "Non-Magnetic Chalk Board" },
      { label: "Material", value: "Regular quality materials with balanced performance" },
      { label: "Design", value: "Electroplated Chrome Corners for a clean finish" },
      { label: "Surface", value: "Chalk Grade HPL Sheet; non-reflective, glare-free, with clear visibility from all angles" },
      { label: "Durability", value: "Durable and dependable for everyday use" },
    ],
    applications: ["Classrooms", "Coaching centres", "Offices"],
  }),
  define({
    slug: "eco-regular-chalk-board",
    name: "Eco Regular Chalk Board",
    categorySlug: "chalk-boards",
    series: "Eco Regular",
    highlights: ["Non-Magnetic Chalk Board", "Lightweight frame"],
    shortDescription:
      "Cost-effective Chalk Grade HPL Sheet board with a lightweight frame and standard plastic corners for light and economical use.",
    description:
      "The Eco Regular Chalk Board uses cost-effective, regular materials with a lightweight frame and standard plastic corners. The Chalk Grade HPL Sheet is non-reflective and glare-free, with clear visibility from all angles. Suitable for light and economical use.",
    features: [
      "Chalk Grade HPL Sheet — non-reflective, glare-free",
      "Lightweight frame with standard plastic corners",
      "Suitable for light and economical use",
    ],
    specifications: [
      { label: "Type", value: "Non-Magnetic Chalk Board" },
      { label: "Material", value: "Cost-effective, regular materials" },
      { label: "Design", value: "Lightweight frame with standard plastic corners" },
      { label: "Surface", value: "Chalk Grade HPL Sheet; non-reflective, glare-free, with clear visibility from all angles" },
      { label: "Durability", value: "Suitable for light and economical use" },
    ],
    applications: ["Home classrooms", "Tuition classes", "Small institutions"],
  }),
];

/* ------------------------------------------------------------------ */
/* Notice Boards                                                       */
/* ------------------------------------------------------------------ */
const noticeBoards: Product[] = [
  define({
    slug: "metallic-premium-notice-board",
    name: "Metallic Premium Notice Board",
    categorySlug: "notice-boards",
    series: "Metallic Premium",
    featured: true,
    highlights: ["2 mm Blazer Cloth", "Signature Dual-Tone Corners"],
    shortDescription:
      "Premium aluminium construction with 2 mm Blazer Cloth and a soft pin-friendly core for frequent and heavy pin usage — the highest grade.",
    description:
      "The Metallic Premium Notice Board combines premium aluminium construction and Signature Dual-Tone Corners with 2 mm Blazer Cloth that offers long-lasting colour retention. Its soft pin-friendly core is made for frequent and heavy pin usage. Highest grade, designed for long-term institutional use.",
    features: [
      "Premium aluminium construction with Signature Dual-Tone Corners",
      "2 mm Blazer Cloth with long-lasting colour retention",
      "Soft pin-friendly core for frequent and heavy pin usage",
      "Highest grade, designed for long-term institutional use",
    ],
    specifications: [
      { label: "Material", value: "Premium aluminium construction with Signature Dual-Tone Corners" },
      { label: "Surface", value: "2 mm Blazer Cloth with long-lasting colour retention" },
      { label: "Core", value: "Soft pin-friendly core for frequent and heavy pin usage" },
      { label: "Durability", value: "Highest grade, designed for long-term institutional use" },
    ],
    applications: ["Schools", "Colleges", "Corporate offices", "Government offices"],
    colors: NOTICE_COLORS_PREMIUM,
  }),
  define({
    slug: "eco-premium-notice-board",
    name: "Eco Premium Notice Board",
    categorySlug: "notice-boards",
    series: "Eco Premium",
    highlights: ["2 mm Blazer Cloth"],
    shortDescription:
      "Premium-grade construction with 2 mm Blazer Cloth and a soft core for repeated pinning — long-lasting with consistent performance.",
    description:
      "The Eco Premium Notice Board uses premium-grade construction for reliable performance. The 2 mm Blazer Cloth surface is suitable for regular institutional use, over a soft core material for repeated pinning. Long-lasting with consistent performance.",
    features: [
      "Premium-grade construction for reliable performance",
      "2 mm Blazer Cloth suitable for regular institutional use",
      "Soft core material for repeated pinning",
      "Long-lasting with consistent performance",
    ],
    specifications: [
      { label: "Material", value: "Premium-grade construction for reliable performance" },
      { label: "Surface", value: "2 mm Blazer Cloth suitable for regular institutional use" },
      { label: "Core", value: "Soft core material for repeated pinning" },
      { label: "Durability", value: "Long-lasting with consistent performance" },
    ],
    applications: ["Classrooms", "Offices", "Institutions"],
    colors: NOTICE_COLORS_PREMIUM,
  }),
  define({
    slug: "deluxe-standard-notice-board",
    name: "Deluxe Standard Notice Board",
    categorySlug: "notice-boards",
    series: "Deluxe Standard",
    highlights: ["Super Fine Velvet Cloth", "Electroplated Chrome Corners"],
    shortDescription:
      "Super Fine Velvet Cloth over a soft core for everyday pin usage, with Electroplated Chrome Corners — reliable for daily use.",
    description:
      "The Deluxe Standard Notice Board is made from standard quality materials with Electroplated Chrome Corners. Its Super Fine Velvet Cloth surface is made for everyday pin usage over a soft core suitable for normal pin use. Reliable for daily use.",
    features: [
      "Super Fine Velvet Cloth for everyday pin usage",
      "Soft core suitable for normal pin use",
      "Electroplated Chrome Corners",
      "Reliable for daily use",
    ],
    specifications: [
      { label: "Material", value: "Standard quality materials with Electroplated Chrome Corners" },
      { label: "Surface", value: "Super Fine Velvet Cloth for everyday pin usage" },
      { label: "Core", value: "Soft core suitable for normal pin use" },
      { label: "Durability", value: "Reliable for daily use" },
    ],
    applications: ["Classrooms", "Coaching centres", "Offices"],
    colors: NOTICE_COLORS_STANDARD,
  }),
  define({
    slug: "eco-regular-notice-board",
    name: "Eco Regular Notice Board",
    categorySlug: "notice-boards",
    series: "Eco Regular",
    highlights: ["Super Fine Velvet Cloth"],
    shortDescription:
      "Economical notice board with standard plastic corners and Super Fine Velvet Cloth for basic pin-up needs and light, occasional use.",
    description:
      "The Eco Regular Notice Board uses economical materials with standard plastic corners. Super Fine Velvet Cloth covers basic pin-up needs, over a soft core for light pin usage. Suitable for light and occasional use.",
    features: [
      "Economical materials with standard plastic corners",
      "Super Fine Velvet Cloth for basic pin-up needs",
      "Soft core for light pin usage",
      "Suitable for light and occasional use",
    ],
    specifications: [
      { label: "Material", value: "Economical materials with standard plastic corners" },
      { label: "Surface", value: "Super Fine Velvet Cloth for basic pin-up needs" },
      { label: "Core", value: "Soft core for light pin usage" },
      { label: "Durability", value: "Suitable for light and occasional use" },
    ],
    applications: ["Home classrooms", "Tuition classes", "Small offices"],
    colors: NOTICE_COLORS_STANDARD,
  }),
];

/* ------------------------------------------------------------------ */
/* Magnetic Boards — Resin Coated Steel                                */
/* ------------------------------------------------------------------ */
const magneticBoards: Product[] = [
  define({
    slug: "metallic-premium-magnetic-board",
    name: "Metallic Premium Magnetic Board",
    categorySlug: "magnetic-boards",
    series: "Metallic Premium",
    featured: true,
    highlights: ["Resin Coated Steel Magnetic Board", "Accepts Magnet", "Signature Dual-Tone Corners"],
    shortDescription:
      "Resin coated writing surface for marker (white) and chalk (green) boards, compatible with magnets, charts and holders — framed in heavy-duty aluminium.",
    description:
      "The Metallic Premium Magnetic Board is a Resin Coated Steel Magnetic Board that accepts magnets. Its resin coated writing surface is suitable for marker (white) and chalk (green) boards and is compatible with magnetic accessories such as magnets, charts and holders. Heavy-duty aluminium framing with Signature Dual-Tone Corners surrounds a smooth writing surface for regular writing and erasing.",
    features: [
      "Accepts magnets",
      "Resin coated writing surface for marker (white) and chalk (green) boards",
      "Compatible with magnets, charts and holders",
      "Heavy-duty aluminium framing with Signature Dual-Tone Corners",
      "Smooth writing surface for regular writing and erasing",
    ],
    specifications: [
      { label: "Type", value: "Resin Coated Steel Magnetic Board" },
      { label: "Surface", value: "Resin coated writing surface suitable for marker (white) and chalk (green) boards" },
      { label: "Magnetic Use", value: "Compatible with magnetic accessories such as magnets, charts, and holders" },
      { label: "Design", value: "Heavy-duty aluminium framing with Signature Dual-Tone Corners" },
      { label: "Finish", value: "Smooth writing surface for regular writing and erasing" },
    ],
    variants: ["White (marker)", "Green (chalk)"],
    notes: [
      "Selection Guidance: For heavy chalk usage without magnetic requirements, choose Non-Magnetic Premium or Ceramic Boards for longer surface life.",
    ],
  }),
  define({
    slug: "deluxe-standard-magnetic-board",
    name: "Deluxe Standard Magnetic Board",
    categorySlug: "magnetic-boards",
    series: "Deluxe Standard",
    highlights: ["Resin Coated Steel Magnetic Board", "Accepts Magnet"],
    shortDescription:
      "Resin coated writing surface in white and green, with an aluminium frame and Electroplated Chrome Corners — balanced construction for regular use.",
    description:
      "The Deluxe Standard Magnetic Board accepts magnets and has a resin coated writing surface available in white and green options, suitable for standard magnetic accessories. An aluminium frame with Electroplated Chrome Corners and balanced construction make it suitable for daily classroom or office writing.",
    features: [
      "Accepts magnets",
      "Resin coated writing surface in white and green options",
      "Suitable for standard magnetic accessories",
      "Aluminium frame with Electroplated Chrome Corners",
      "Balanced construction for regular use",
    ],
    specifications: [
      { label: "Type", value: "Resin Coated Steel Magnetic Board" },
      { label: "Surface", value: "Resin coated writing surface available in white and green options" },
      { label: "Magnetic Use", value: "Suitable for standard magnetic accessories" },
      { label: "Design", value: "Aluminium frame with Electroplated Chrome Corners" },
      { label: "Finish", value: "Smooth surface suitable for daily classroom or office writing" },
      { label: "Build", value: "Balanced construction for regular use" },
    ],
    variants: ["White", "Green"],
    applications: ["Classrooms", "Offices"],
  }),
  define({
    slug: "eco-regular-magnetic-board",
    name: "Eco Regular Magnetic Board",
    categorySlug: "magnetic-boards",
    series: "Eco Regular",
    highlights: ["Resin Coated Steel Magnetic Board", "Accepts Magnet"],
    shortDescription:
      "Economical magnetic board with a resin coated surface in white and green variants and a lightweight aluminium frame, designed for light usage.",
    description:
      "The Eco Regular Magnetic Board accepts magnets and supports basic magnetic accessories. Its resin coated writing surface comes in white and green variants, set in a lightweight aluminium frame with standard plastic corners. A functional writing surface for basic requirements — an economical option designed for light usage.",
    features: [
      "Accepts magnets",
      "Resin coated writing surface in white and green variants",
      "Supports basic magnetic accessories",
      "Lightweight aluminium frame with standard plastic corners",
      "Economical option designed for light usage",
    ],
    specifications: [
      { label: "Type", value: "Resin Coated Steel Magnetic Board" },
      { label: "Surface", value: "Resin coated writing surface in white and green variants" },
      { label: "Magnetic Use", value: "Supports basic magnetic accessories" },
      { label: "Design", value: "Lightweight aluminium frame with standard plastic corners" },
      { label: "Finish", value: "Functional writing surface for basic requirements" },
      { label: "Build", value: "Economical option designed for light usage" },
    ],
    variants: ["White", "Green"],
  }),
];

/* ------------------------------------------------------------------ */
/* Ceramic Boards — Ceramic Steel Magnetic                             */
/* ------------------------------------------------------------------ */
const ceramicBoards: Product[] = [
  define({
    slug: "metallic-premium-ceramic-board",
    name: "Metallic Premium Ceramic Board",
    categorySlug: "ceramic-boards",
    series: "Metallic Premium",
    featured: true,
    highlights: ["Ceramic Steel Magnetic Board", "Signature Dual-Tone Corners"],
    shortDescription:
      "Ceramic steel / porcelain enamel steel surface — hard and non-porous for continuous writing and frequent cleaning — designed for very long product life.",
    description:
      "The Metallic Premium Ceramic Board has a ceramic steel / porcelain enamel steel surface, available in White Board (marker writing) and Chalk Board (chalk writing) options. The hard, non-porous surface is suitable for continuous writing and frequent cleaning, with consistent performance over time, and is designed for very long product life under regular institutional use. Aluminium frame with Signature Dual-Tone Corners.",
    features: [
      "Ceramic steel / porcelain enamel steel surface",
      "Designed for very long product life under regular institutional use",
      "Hard, non-porous surface suitable for continuous writing and frequent cleaning",
      "Smooth writing surface with consistent performance over time",
      "Easy to clean and maintain for daily classroom use",
      "Aluminium frame with Signature Dual-Tone Corners",
    ],
    specifications: [
      { label: "Type", value: "Ceramic Steel Magnetic Board" },
      { label: "Surface", value: "Ceramic steel / porcelain enamel steel surface, available in White Board (marker writing) and Chalk Board (chalk writing) options" },
      { label: "Product Life", value: "Designed for very long product life under regular institutional use" },
      { label: "Performance", value: "Hard, non-porous surface suitable for continuous writing and frequent cleaning" },
      { label: "Finish", value: "Smooth writing surface with consistent performance over time" },
      { label: "Maintenance", value: "Easy to clean and maintain for daily classroom use" },
      { label: "Design", value: "Aluminium frame with Signature Dual-Tone Corners" },
    ],
    variants: ["White Board (marker writing)", "Chalk Board (chalk writing)"],
    applications: ["Classrooms", "Institutions"],
    notes: [
      "Selection Guidance: For similar writing performance at a more economical level, Non-Magnetic Metallic Premium Boards are a suitable alternative when magnetic use is not required.",
    ],
  }),
  define({
    slug: "deluxe-standard-ceramic-board",
    name: "Deluxe Standard Ceramic Board",
    categorySlug: "ceramic-boards",
    series: "Deluxe Standard",
    highlights: ["Ceramic Steel Magnetic Board", "Electroplated Chrome Corners"],
    shortDescription:
      "Ceramic steel / porcelain enamel steel surface in white board and chalk board options, with an aluminium frame and Electroplated Chrome Corners.",
    description:
      "The Deluxe Standard Ceramic Board has a ceramic steel / porcelain enamel steel surface, available in White Board (marker writing) and Chalk Board (chalk writing) options, designed for very long product life under regular institutional use. The hard, non-porous surface is suitable for continuous writing and is easy to clean and maintain. Aluminium frame with Electroplated Chrome Corners.",
    features: [
      "Ceramic steel / porcelain enamel steel surface",
      "Designed for very long product life under regular institutional use",
      "Hard, non-porous surface suitable for continuous writing",
      "Smooth writing surface with consistent performance over time",
      "Easy to clean and maintain for daily classroom use",
      "Aluminium frame with Electroplated Chrome Corners",
    ],
    specifications: [
      { label: "Type", value: "Ceramic Steel Magnetic Board" },
      { label: "Surface", value: "Ceramic steel / porcelain enamel steel surface, available in White Board (marker writing) and Chalk Board (chalk writing) options" },
      { label: "Product Life", value: "Designed for very long product life under regular institutional use" },
      { label: "Performance", value: "Hard, non-porous surface suitable for continuous writing and frequent cleaning" },
      { label: "Finish", value: "Smooth writing surface with consistent performance over time" },
      { label: "Maintenance", value: "Easy to clean and maintain for daily classroom use" },
      { label: "Design", value: "Aluminium frame with Electroplated Chrome Corners" },
    ],
    variants: ["White Board (marker writing)", "Chalk Board (chalk writing)"],
    applications: ["Classrooms", "Institutions"],
    notes: [
      "Selection Guidance: For similar writing performance at a more economical level, Non-Magnetic Eco Premium Boards are a suitable alternative when magnetic use is not required.",
    ],
  }),
];

/* ------------------------------------------------------------------ */
/* Specialty — Different Types of Notice Boards                        */
/* ------------------------------------------------------------------ */
const specialtyBoards: Product[] = [
  define({
    slug: "acrylic-folder-display-board",
    name: "Acrylic Folder Display Board",
    categorySlug: "specialty-boards",
    series: "Specialty",
    highlights: ["Custom Layout", "Aluminium frame"],
    shortDescription:
      "Transparent front folders for charts, reports, SOPs and production data, in a strong aluminium frame — folder size and quantity as per requirement.",
    description:
      "The Acrylic Folder Display Board gives clear visibility through transparent front folders for easy document viewing. It is ideal for organised display of charts, reports, SOPs and production data, and papers can be inserted and replaced quickly. Folder size and quantity are made as per customer requirement, in a strong aluminium frame suitable for industrial use.",
    features: [
      "Clear Visibility: Transparent front folders for easy document viewing",
      "Organized Display: Ideal for charts, reports, SOPs and production data",
      "Easy Access: Papers can be inserted and replaced quickly",
      "Custom Layout: Folder size and quantity as per customer requirement",
      "Durable Frame: Strong aluminium frame suitable for industrial use",
    ],
    specifications: [
      { label: "Folders", value: "Transparent front folders" },
      { label: "Layout", value: "Folder size and quantity as per customer requirement" },
      { label: "Frame", value: "Strong aluminium frame suitable for industrial use" },
    ],
    applications: ["Charts", "Reports", "SOPs", "Production data", "Industrial use"],
  }),
  define({
    slug: "cork-notice-board",
    name: "Cork Notice Board",
    categorySlug: "specialty-boards",
    series: "Specialty",
    highlights: ["Natural cork surface"],
    shortDescription:
      "High-quality natural cork surface for repeated pin use, with a soft and resilient base for smooth pin insertion and firm holding.",
    description:
      "The Cork Notice Board has a high-quality natural cork surface suitable for repeated pin use. Its soft and resilient base material is designed specially for smooth pin insertion and firm holding, allowing frequent pinning and removal without surface damage or loss of grip. A uniform cork texture gives a neat, professional appearance with long-lasting surface performance.",
    features: [
      "High-quality natural cork surface suitable for repeated pin use",
      "Soft and resilient base for smooth pin insertion and firm holding",
      "Frequent pinning and removal without surface damage or loss of grip",
      "Uniform cork texture with a neat and professional appearance",
      "Long-lasting surface performance for regular notice display use",
    ],
    specifications: [
      { label: "Surface", value: "High-quality natural cork surface suitable for repeated pin use" },
      { label: "Core", value: "Soft and resilient base material designed specially for smooth pin insertion and firm holding" },
      { label: "Performance", value: "Allows frequent pinning and removal without surface damage or loss of grip" },
      { label: "Finish", value: "Uniform cork texture with a neat and professional appearance" },
      { label: "Durability", value: "Long-lasting surface performance for regular notice display use" },
    ],
    variants: FRAME_VARIANTS,
  }),
  define({
    slug: "combination-board",
    name: "Combination Board",
    categorySlug: "specialty-boards",
    series: "Specialty",
    highlights: ["Dry wipe + fabric", "Two surfaces, one board"],
    shortDescription:
      "Dry wipe white board on one side and fabric notice board on the other — marker writing plus pin-up display in a single board.",
    description:
      "The Combination Board has a dry wipe white board on one side and a fabric notice board on the other, combining writing with markers and pin-up display in a single board. It offers smooth marker writing with easy erase, and a durable fabric surface for repeated pin use with long-lasting surface performance.",
    features: [
      "Dry wipe white board on one side and fabric notice board on the other",
      "Writing with markers plus pin-up display in a single board",
      "Smooth marker writing with easy erase",
      "Durable fabric surface for repeated pin use",
      "Long-lasting surface performance for regular notice display use",
    ],
    specifications: [
      { label: "Surface", value: "Dry wipe white board on one side and fabric notice board on the other" },
      { label: "Functionality", value: "Writing with markers plus pin-up display in a single board" },
      { label: "Customization", value: "Allows frequent pinning and removal without surface damage or loss of grip" },
      { label: "Performance", value: "Smooth marker writing with easy erase and durable fabric surface for repeated pin use" },
      { label: "Durability", value: "Long-lasting surface performance for regular notice display use" },
    ],
    variants: FRAME_VARIANTS,
  }),
  define({
    slug: "fabric-notice-board",
    name: "Fabric Notice Board",
    categorySlug: "specialty-boards",
    series: "Specialty",
    highlights: ["Customer's preferred fabric colour"],
    shortDescription:
      "Fabric notice board in the customer's preferred fabric colour, with fabric colour and board layout provided as per requirement.",
    description:
      "The Fabric Notice Board is suitable for repeated pin use and is available in the customer's preferred fabric colour. Fabric colour and board layout can be provided as per customer requirement. A soft core material allows easy pin insertion and firm holding, and the durable fabric surface suits regular notice display.",
    features: [
      "Available in customer's preferred fabric colour",
      "Fabric colour and board layout as per customer requirement",
      "Soft core material for easy pin insertion and firm holding",
      "Durable fabric surface suitable for regular notice display",
    ],
    specifications: [
      { label: "Surface", value: "Fabric notice board suitable for repeated pin use" },
      { label: "Color Options", value: "Available in customer's preferred fabric colour" },
      { label: "Customization", value: "Fabric colour and board layout can be provided as per customer requirement" },
      { label: "Core", value: "Soft core material for easy pin insertion and firm holding" },
      { label: "Performance", value: "Durable fabric surface suitable for regular notice display" },
    ],
    variants: FRAME_VARIANTS,
    colors: ["Customer's preferred fabric colour"],
  }),
];

/* ------------------------------------------------------------------ */
/* Acrylic Door Cover Notice Boards                                    */
/* ------------------------------------------------------------------ */
const adcBoards: Product[] = [
  define({
    slug: "deluxe-45mm-adc-notice-board-double-door",
    name: "Deluxe 45 MM ADC Notice Board (Double Door)",
    categorySlug: "acrylic-door-cover-notice-boards",
    series: "Deluxe",
    featured: true,
    highlights: ["Deluxe 45 mm Triple Aluminium Framing", "Double Door"],
    shortDescription:
      "Acrylic door covered notice board with Deluxe 45 mm Triple Aluminium Framing and a secure double-door system for controlled notice display.",
    description:
      "The Deluxe 45 MM ADC Notice Board (Double Door) is an Acrylic Door Covered Notice Board with a double door design. Deluxe 45 mm Triple Aluminium Framing adds strength and a premium appearance, while the transparent acrylic door cover protects notices from dust and handling. A secure double-door system is suitable for controlled notice display.",
    features: [
      "Deluxe 45 mm Triple Aluminium Framing for added strength and premium appearance",
      "Transparent acrylic door cover to protect notices from dust and handling",
      "Secure double-door system suitable for controlled notice display",
    ],
    specifications: [
      { label: "Type", value: "Acrylic Door Covered Notice Board (Double Door Design)" },
      { label: "Framing", value: "Deluxe 45 mm Triple Aluminium Framing for added strength and premium appearance" },
      { label: "Cover", value: "Transparent acrylic door cover to protect notices from dust and handling" },
      { label: "Locking", value: "Secure double-door system suitable for controlled notice display" },
    ],
    sizes: ["5 × 4 ft", "6 × 4 ft", "8 × 4 ft"],
    applications: ["Offices", "Institutions", "Housing societies", "Hospitals", "Public areas"],
  }),
  define({
    slug: "deluxe-45mm-adc-notice-board-single-door",
    name: "Deluxe 45 MM ADC Notice Board (Single Door)",
    categorySlug: "acrylic-door-cover-notice-boards",
    series: "Deluxe",
    highlights: ["Deluxe 45 mm triple aluminium framing", "Single Door"],
    shortDescription:
      "Single door acrylic covered notice board with Deluxe 45 mm triple aluminium framing and a secure single-door locking system.",
    description:
      "The Deluxe 45 MM ADC Notice Board (Single Door) is an acrylic door covered notice board with a single door design. Deluxe 45 mm triple aluminium framing provides strength, stability and long-term durability. The transparent acrylic door cover protects displayed notices from dust, moisture and handling, with a secure single-door locking system, smooth door operation and clear visibility of notices.",
    features: [
      "Deluxe 45 mm triple aluminium framing for strength, stability and long-term durability",
      "Transparent acrylic door cover protects notices from dust, moisture and handling",
      "Secure single-door locking system for controlled and safe notice display",
      "Smooth door operation with clear visibility of notices",
      "Neat and professional finish suitable for regular indoor use",
    ],
    specifications: [
      { label: "Type", value: "Acrylic door covered notice board with single door design" },
      { label: "Framing", value: "Deluxe 45 mm triple aluminium framing for strength, stability, and long-term durability" },
      { label: "Cover", value: "Transparent acrylic door cover to protect displayed notices from dust, moisture, and handling" },
      { label: "Locking", value: "Secure single-door locking system for controlled and safe notice display" },
      { label: "Performance", value: "Smooth door operation with clear visibility of notices" },
      { label: "Finish", value: "Neat and professional finish suitable for regular indoor use" },
    ],
    sizes: ["2 × 3 ft", "2 × 4 ft", "3 × 4 ft", "4 × 4 ft"],
    applications: ["Regular indoor use"],
  }),
  define({
    slug: "eco-adc-notice-board-single-door",
    name: "ECO ADC Notice Board (Single Door)",
    categorySlug: "acrylic-door-cover-notice-boards",
    series: "ECO",
    highlights: ["Lightweight aluminium framing", "Single Door"],
    shortDescription:
      "Single door acrylic covered notice board with lightweight aluminium framing for economical and practical use.",
    description:
      "The ECO ADC Notice Board (Single Door) is an acrylic door covered notice board with a single door design and lightweight aluminium framing for economical and practical use. A transparent acrylic door cover protects notices from dust and handling, with a single-door locking system, smooth door operation and a clean, simple finish for regular indoor applications.",
    features: [
      "Lightweight aluminium framing for economical and practical use",
      "Transparent acrylic door cover to protect notices from dust and handling",
      "Single-door locking system for safe and controlled notice display",
      "Smooth door operation with clear visibility of displayed notices",
      "Clean and simple finish suitable for regular indoor applications",
    ],
    specifications: [
      { label: "Type", value: "Acrylic door covered notice board with single door design" },
      { label: "Framing", value: "Lightweight aluminium framing for economical and practical use" },
      { label: "Cover", value: "Transparent acrylic door cover to protect notices from dust and handling" },
      { label: "Locking", value: "Single-door locking system for safe and controlled notice display" },
      { label: "Performance", value: "Smooth door operation with clear visibility of displayed notices" },
      { label: "Finish", value: "Clean and simple finish suitable for regular indoor applications" },
    ],
    sizes: ["1.5 × 2 ft", "2 × 3 ft", "2 × 4 ft", "3 × 4 ft", "4 × 4 ft"],
    applications: ["Regular indoor applications"],
  }),
];

/* ------------------------------------------------------------------ */
/* Board & Study Essentials                                            */
/* ------------------------------------------------------------------ */
const essentials: Product[] = [
  define({
    slug: "four-line-square-line-practice-board",
    name: "Four Line & Square Line Practice Board",
    categorySlug: "board-study-essentials",
    series: "Essentials",
    highlights: ["Handwriting Improvement", "Primary & Early Learning"],
    shortDescription:
      "Specially designed for handwriting improvement — proper letter size, spacing and alignment, with a square grid for number writing and basic maths.",
    description:
      "The Four Line & Square Line Practice Board is specially designed for handwriting improvement and ensures proper letter size, spacing and alignment. Its square grid section supports accurate number writing and basic maths practice. Line marking is provided as per school / customer requirements, on a smooth writing surface suitable for daily classroom use.",
    features: [
      "Specially Designed for Handwriting Improvement",
      "Ensures Proper Letter Size, Spacing & Alignment",
      "Square Grid Section Supports Accurate Number Writing & Basic Maths Practice",
      "Line Marking Provided as per School / Customer Requirements",
      "Smooth Writing Surface Suitable for Daily Classroom Use",
      "Ideal for Primary & Early Learning Classes",
    ],
    specifications: [
      { label: "Line layout", value: "Four line and square grid sections" },
      { label: "Line marking", value: "Provided as per School / Customer Requirements" },
      { label: "Surface", value: "Smooth Writing Surface Suitable for Daily Classroom Use" },
    ],
    applications: ["Primary classes", "Early learning classes"],
  }),
  define({
    slug: "key-hanger-board",
    name: "Key Hanger Board",
    categorySlug: "board-study-essentials",
    series: "Essentials",
    highlights: ["Lockable Acrylic Door"],
    shortDescription:
      "Secure key management system with locking facility — lockable acrylic door with clear visibility of keys, from 15 / 20 to 150 keys.",
    description:
      "The Key Hanger Board is a secure key management system with locking facility. A lockable acrylic door gives clear visibility of keys, in a professional and durable design suitable for offices, companies and workshops.",
    features: [
      "Lockable Acrylic Door",
      "Clear Visibility of Keys",
      "Professional & Durable Design",
      "Suitable for Offices, Companies & Workshops",
    ],
    specifications: [
      { label: "1 × 1.5 ft", value: "15 / 20 Keys" },
      { label: "1.5 × 2 ft", value: "30 Keys" },
      { label: "2 × 2 ft", value: "50 Keys" },
      { label: "2 × 3 ft", value: "100 Keys" },
      { label: "3 × 4 ft", value: "150 Keys" },
    ],
    sizes: [
      "1 × 1.5 ft — 15 / 20 Keys",
      "1.5 × 2 ft — 30 Keys",
      "2 × 2 ft — 50 Keys",
      "2 × 3 ft — 100 Keys",
      "3 × 4 ft — 150 Keys",
    ],
    applications: ["Offices", "Companies", "Workshops"],
  }),
  define({
    slug: "student-study-table",
    name: "Student Study Table",
    categorySlug: "board-study-essentials",
    series: "Essentials",
    highlights: ["Foldable", "White Board Writing Surface"],
    shortDescription:
      "Foldable, space-saving study table with a smooth white board writing surface — for study, reading and laptop use.",
    description:
      "The Student Study Table is ideal for daily study and homework. It has a smooth white board writing surface that is easy to clean and maintain, a foldable and space-saving design, and multipurpose use as a study, reading and laptop table. Writing area size: 16 × 24 inches.",
    features: [
      "Ideal for Daily Study & Homework",
      "Smooth White Board Writing Surface",
      "Easy to Clean & Maintain",
      "Multipurpose Use – Study, Reading & Laptop Table",
      "Foldable & Space-Saving Design",
    ],
    specifications: [
      { label: "Writing Area Size", value: "16 × 24 inches" },
      { label: "Surface", value: "Smooth White Board Writing Surface" },
      { label: "Design", value: "Foldable & Space-Saving Design" },
    ],
    sizes: ["Writing area 16 × 24 inches"],
    applications: ["Study", "Reading", "Laptop table", "Homework"],
  }),
];

/* ------------------------------------------------------------------ */
/* Display Boards                                                      */
/* ------------------------------------------------------------------ */
const displayBoards: Product[] = [
  define({
    slug: "grooved-boards",
    name: "Grooved Boards",
    categorySlug: "display-boards",
    series: "Display",
    highlights: ["Nine sizes"],
    shortDescription:
      "Grooved display boards for hotels, reception areas and leisure centres, in nine sizes in landscape and portrait.",
    description:
      "Grooved Boards are suitable for use in hotels, reception areas, leisure centres and similar spaces, and are available in nine sizes in landscape and portrait orientation.",
    features: [
      "Suitable for use in Hotels, Reception Area",
      "Leisure centers etc.",
      "Nine sizes in landscape and Portrait",
    ],
    specifications: [{ label: "Sizes", value: "Nine sizes in landscape and portrait" }],
    applications: ["Hotels", "Reception areas", "Leisure centres"],
    sizes: ["Nine sizes in landscape and portrait"],
  }),
  define({
    slug: "perforated-board",
    name: "Perforated Board",
    categorySlug: "display-boards",
    series: "Display",
    highlights: ["Golden Anodized frame"],
    shortDescription:
      "Black perforated boards with golden anodized frame — very popular for displaying information vertically as well as horizontally.",
    description:
      "Black perforated boards are very popular boards to display information vertically as well as horizontally. Used in offices, hotels and many other public places, with a golden anodized frame and felt available in red and maroon.",
    features: [
      "Black perforated boards",
      "Display information vertically as well as horizontally",
      "Used in Offices, Hotels and many other public places",
      "Golden Anodized frame",
    ],
    specifications: [
      { label: "Board", value: "Black perforated board" },
      { label: "Frame", value: "Golden Anodized frame" },
      { label: "Felt colors", value: "Red, Maroon" },
    ],
    colors: ["Red", "Maroon"],
    applications: ["Offices", "Hotels", "Public places"],
  }),
  define({
    slug: "letters-and-figures-set",
    name: "Letters & Figures Set",
    categorySlug: "display-boards",
    series: "Display",
    highlights: ["Letters set of 112", "Figures set of 100"],
    shortDescription:
      "Letters set of 112 pieces and figures set of 100 pieces for display boards, in 12 mm, 18 mm, 24 mm and 36 mm letter sizes.",
    description:
      "The display board range includes a letters set of 112 pieces and a figures set of 100 pieces, each offered in 12 mm, 18 mm, 24 mm and 36 mm letter sizes.",
    features: ["Letters set of 112 pieces", "Figures set of 100 pieces", "Letter sizes: 12 mm, 18 mm, 24 mm, 36 mm"],
    specifications: [
      { label: "Letters A E I O", value: "5 each — 20 pcs" },
      { label: "Letters C N R S T", value: "4 each — 20 pcs" },
      { label: "Letters B D F G H K", value: "3 each — 18 pcs" },
      { label: "Letters L M P U W Y", value: "3 each — 18 pcs" },
      { label: "Letters J Q V", value: "2 each — 06 pcs" },
      { label: "Letters X Z", value: "1 each — 02 pcs" },
      { label: "Punctuation & symbols", value: "Remaining pieces of the set (. , {} & % / and others)" },
      { label: "Letters set total", value: "112 pcs" },
      { label: "Figures 1 5 0", value: "14 each — 42 pcs" },
      { label: "Figure 2", value: "10 pcs" },
      { label: "Figures 3 4 6", value: "8 each — 24 pcs" },
      { label: "Figures 7 8 9", value: "8 each — 24 pcs" },
      { label: "Figures set total", value: "100 pcs" },
    ],
    sizes: ["12 mm", "18 mm", "24 mm", "36 mm"],
    variants: ["Letters set of 112", "Figures set of 100"],
  }),
];

/* ------------------------------------------------------------------ */
/* Stands & Storage — catalog lists names only                         */
/* ------------------------------------------------------------------ */
const standItems: Array<[string, string]> = [
  ["three-leg-stand", "Three Leg Stand"],
  ["four-leg-stand", "Four Leg Stand"],
  ["revolving-stand", "Revolving Stand"],
  ["zig-zag-stand", "Zig Zag Stand"],
  ["telescopic-stand", "Telescopic Stand"],
  ["newspaper-stand", "Newspaper Stand"],
  ["magazine-stand", "Magazine Stand"],
  ["file-rack", "File Rack"],
  ["first-aid-box", "First Aid Box"],
  ["letter-box", "Letter Box"],
  ["pds-500", "PDS-500"],
];

const stands: Product[] = standItems.map(([slug, name]) =>
  define({
    slug,
    name,
    categorySlug: "board-stands",
    series: "Stand & Storage",
    catalogDetail: "listing",
    shortDescription: `${name} from the Plusmark Board Stand, Newspaper Stand and Magazine Stand range. Contact Plusmark for specifications.`,
    description: `The ${name} is part of the Plusmark range of board stands, newspaper stands, magazine stands and storage products. Plusmark manufactures all types of board stands. Please request an enquiry for the current specifications, sizes and finishes of this model.`,
  }),
);

/* ------------------------------------------------------------------ */
/* Clipboards                                                          */
/* ------------------------------------------------------------------ */
const clipboards: Product[] = [
  define({
    slug: "pre-lam-mdf-base-clipboard",
    name: "Pre-Lam MDF Base Clipboard (Wood Finish)",
    categorySlug: "clipboards",
    series: "Clipboard",
    highlights: ["Chrome Electroplated Clip", "Pre-Lam Wood Finish"],
    shortDescription:
      "Pre-Lam MDF base with a smooth wood finish, Chrome Electroplated Clip with rust-resistant finish and Dual-Side Cap Rivets.",
    features: [
      "Chrome Electroplated Clip — Rust-Resistant Finish",
      "Pre-Lam Wood Finish — Smooth Wood Finish",
      "Dual-Side Cap Rivets",
      "Available in 6 different sizes",
    ],
    specifications: [
      { label: "Base", value: "Pre-Lam MDF Base (Wood Finish)" },
      { label: "Clip", value: "Chrome Electroplated Clip — Rust-Resistant Finish" },
      { label: "Finish", value: "Pre-Lam wood Finish — Smooth Wood Finish" },
      { label: "Rivets", value: "Dual-Side Cap Rivets" },
    ],
    sizes: ["Available in 6 different sizes"],
  }),
  define({
    slug: "graphic-mdf-base-clipboard",
    name: "Graphic MDF Base Clipboard",
    categorySlug: "clipboards",
    series: "Clipboard",
    highlights: ["Premium Graphic Printing", "Chrome Electroplated Clip"],
    shortDescription:
      "Graphic MDF base with premium graphic printing that is sharp and fade-resistant, a Chrome Electroplated Clip and Dual-Side Cap Rivets.",
    features: [
      "Chrome Electroplated Clip — Rust-Resistant Finish",
      "Premium Graphic Printing — Sharp & Fade-Resistant",
      "Dual-Side Cap Rivets — Uniform Finish on Both Sides",
    ],
    specifications: [
      { label: "Base", value: "Graphic MDF Base" },
      { label: "Clip", value: "Chrome Electroplated Clip — Rust-Resistant Finish" },
      { label: "Printing", value: "Premium Graphic Printing — Sharp & Fade-Resistant" },
      { label: "Rivets", value: "Dual-Side Cap Rivets — Uniform Finish on Both Sides" },
    ],
    sizes: ["Available in different sizes"],
  }),
  define({
    slug: "laminate-mdf-base-clipboard",
    name: "Laminate MDF Base Clipboard (Wood Finish)",
    categorySlug: "clipboards",
    series: "Clipboard",
    featured: true,
    highlights: ["HPL Sheet Wood Grade", "Rounded Edge"],
    shortDescription:
      "Laminate MDF base in HPL Sheet Wood Grade with a smooth, premium appearance, Chrome Electroplated Clip and rounded edges for a safe, clean finish.",
    description:
      "The Laminate MDF Base Clipboard (Wood Finish) uses an HPL Sheet Wood Grade base for a smooth and premium appearance with a uniform finish on both sides. A Chrome Electroplated Clip with rust-resistant finish, Dual-Side Cap Rivets and rounded edges for a safe and clean finish complete the design.",
    features: [
      "Chrome Electroplated Clip — Rust-Resistant Finish",
      "HPL Sheet Wood Grade — Smooth & Premium Appearance",
      "Uniform Finish on Both Sides",
      "Rounded Edge — Safe & Clean Finish",
      "Dual-Side Cap Rivets",
      "Available in 2 different sizes",
    ],
    specifications: [
      { label: "Base", value: "Laminate MDF Base (Wood Finish) — HPL Sheet Wood Grade" },
      { label: "Clip", value: "Chrome Electroplated Clip — Rust-Resistant Finish" },
      { label: "Finish", value: "Smooth & Premium Appearance — Uniform Finish on Both Sides" },
      { label: "Edge", value: "Rounded Edge — Safe & Clean Finish" },
      { label: "Rivets", value: "Dual-Side Cap Rivets" },
    ],
    sizes: ["Available in 2 different sizes"],
  }),
  define({
    slug: "crystal-clear-base-clipboard",
    name: "Crystal Clear Base Clipboard",
    categorySlug: "clipboards",
    series: "Clipboard",
    highlights: ["Glass-Like Clarity", "Chrome Electroplated Clip"],
    shortDescription:
      "Crystal clear base with glass-like clarity and modern appeal, Chrome Electroplated Clip and Dual-Side Cap Rivets for a uniform look on both sides.",
    features: [
      "Crystal Clear Base — Glass-Like Clarity with Modern Appeal",
      "Chrome Electroplated Clip — Rust-Resistant Finish",
      "Dual-Side Cap Rivets — Uniform Look on Both Sides",
    ],
    specifications: [
      { label: "Base", value: "Crystal Clear Base — Glass-Like Clarity with Modern Appeal" },
      { label: "Clip", value: "Chrome Electroplated Clip — Rust-Resistant Finish" },
      { label: "Rivets", value: "Dual-Side Cap Rivets — Uniform Look on Both Sides" },
    ],
    sizes: ["Available in different sizes & variants"],
  }),
  define({
    slug: "heavy-duty-clear-acrylic-clipboard",
    name: "Heavy-Duty Clear Acrylic Clipboard",
    categorySlug: "clipboards",
    series: "Clipboard",
    highlights: ["High Impact Strength", "Shatter-Resistant"],
    shortDescription: "Heavy-duty clear acrylic clipboard with high impact strength and a shatter-resistant build.",
    features: ["Heavy-Duty Clear Acrylic — High Impact Strength & Shatter-Resistant"],
    specifications: [{ label: "Base", value: "Heavy-Duty Clear Acrylic — High Impact Strength & Shatter-Resistant" }],
  }),
  define({
    slug: "crystal-colour-base-clipboard",
    name: "Crystal Colour Base Clipboard",
    categorySlug: "clipboards",
    series: "Clipboard",
    highlights: ["Crystal-Tint Acrylic Base", "Rounded Edge"],
    shortDescription:
      "Crystal-tint acrylic base in a modern transparent colour with elegant appeal, soft rounded corners and an anti-rust Chrome Electroplated Clip.",
    features: [
      "Crystal-Tint Acrylic Base — Modern Transparent Colour with Elegant Appeal",
      "Rounded Edge — Soft Rounded Corners for Safety & Comfort",
      "Chrome Electroplated Clip — Anti-Rust Protection",
      "Dual-Cap Rivet System — Balanced & Neat Appearance",
      "Available in 2 different sizes",
    ],
    specifications: [
      { label: "Base", value: "Crystal-Tint Acrylic Base — Modern Transparent Colour with Elegant Appeal" },
      { label: "Edge", value: "Rounded Edge — Soft Rounded Corners for Safety & Comfort" },
      { label: "Clip", value: "Chrome Electroplated Clip — Anti-Rust Protection" },
      { label: "Rivets", value: "Dual-Cap Rivet System — Balanced & Neat Appearance" },
    ],
    sizes: ["Available in 2 different sizes"],
  }),
];

/* ------------------------------------------------------------------ */
/* School Benches — catalog lists model numbers only                   */
/* ------------------------------------------------------------------ */
const benchModels = [
  "807", "810", "804", "812", "801", "802", "803", "805",
  "806", "808", "809", "811", "813", "814", "815",
];

const benches: Product[] = benchModels.map((n) =>
  define({
    slug: `pds-sb-${n}`,
    name: `School Bench PDS-SB ${n}`,
    categorySlug: "school-benches",
    series: "School Bench",
    catalogDetail: "listing",
    featured: n === "807",
    highlights: [`Model PDS-SB ${n}`],
    shortDescription: `School bench model PDS-SB ${n} from the Plusmark School Benches range. Contact Plusmark for dimensions and specifications.`,
    description: `PDS-SB ${n} is one of fifteen school bench models listed in the Plusmark catalog. Plusmark is expanding into the manufacturing of School Benches, supporting educational infrastructure development. Please request an enquiry for the dimensions, materials and seating configuration of this model.`,
    specifications: [{ label: "Model", value: `PDS-SB ${n}` }],
    applications: ["Schools", "Educational institutions"],
  }),
);

/* ------------------------------------------------------------------ */
/* Schedule Board                                                      */
/* ------------------------------------------------------------------ */
const scheduleBoards: Product[] = [
  define({
    slug: "dry-wipe-schedule-board",
    name: "Dry Wipe Schedule Board",
    categorySlug: "schedule-boards",
    series: "Custom",
    highlights: ["Any Design / Any Size"],
    shortDescription:
      "Dry wipe schedule board available in any design and any size — share quantity, sizes and a sketch of the board before ordering.",
    description:
      "The Dry Wipe Schedule Board is available in any design and any size. Before ordering, provide the quantity of boards, the sizes of the boards and a sketch of the board as per your requirements. The sketch should be in CorelDRAW, Photoshop or Word file format. When Plusmark makes the design of a board, additional charges are applicable.",
    features: [
      "Available in Any Design / Any Size",
      "Made to your sketch and layout",
      "Sketch accepted in CorelDRAW, Photoshop or Word file",
    ],
    specifications: [
      { label: "Design", value: "Any design" },
      { label: "Size", value: "Any size" },
      { label: "Required before order", value: "Quantity of board, sizes of board, sketch of board as per customer requirements" },
      { label: "Sketch format", value: "CorelDRAW, Photoshop or Word file" },
    ],
    notes: ["When Plusmark makes the design of a board, additional charges will be applicable."],
  }),
];

export const products: Product[] = [
  ...whiteBoards,
  ...chalkBoards,
  ...noticeBoards,
  ...magneticBoards,
  ...ceramicBoards,
  ...specialtyBoards,
  ...adcBoards,
  ...essentials,
  ...displayBoards,
  ...stands,
  ...clipboards,
  ...benches,
  ...scheduleBoards,
];

export function getProduct(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function getProductsByCategory(slug: CategorySlug): Product[] {
  return products.filter((p) => p.categorySlug === slug);
}

export function getRelatedProducts(product: Product, limit = 4): Product[] {
  const sameCategory = products.filter(
    (p) => p.categorySlug === product.categorySlug && p.slug !== product.slug,
  );
  const sameSeries = products.filter(
    (p) =>
      p.series === product.series &&
      p.categorySlug !== product.categorySlug &&
      p.slug !== product.slug,
  );
  return [...sameCategory, ...sameSeries].slice(0, limit);
}

export const allSeries: Series[] = Array.from(new Set(products.map((p) => p.series)));
