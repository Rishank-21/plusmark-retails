/**
 * Product description banners in Amazon A+ style, exported at full 4100 × 1680 WebP from the
 * original A+ masters to /public/images/aplus/<set>/NN.webp (see drive-tmp/aplus-amazon.mjs).
 * ECO sets follow the exact order of the live Plusmark Retail listings on Amazon.in; Metallic sets
 * (not on Amazon) follow the same pattern: overview, features, mounting, hardware, sizes, 4 uses.
 * Amazon opens every listing with the shared brand banner, stored once as APLUS_BRAND.
 */
import { getAplusImageUrl } from "../lib/cloudinary";

export interface AplusImage {
  src: string;
  alt: string;
  /** Short chapter label, e.g. "Mounting" or "Classroom" */
  label: string;
}

export interface AplusSet {
  /** Folder under /public/images/aplus */
  id: string;
  name: string;
  images: AplusImage[];
}

export interface AplusLine extends AplusSet {
  /** Short label for tabs / chips */
  short: string;
  tagline: string;
  /** Site product page for this line, when the catalog has one */
  productSlug?: string;
  /** Plusmark Retail listing on Amazon.in */
  amazonUrl: string;
}

type Banner = [label: string, alt: string];

/** Banners in display order → /images/aplus/<id>/01.webp, 02.webp, … */
const set = (id: string, banners: Banner[]): AplusImage[] =>
  banners.map(([label, alt], i) => ({
    src: getAplusImageUrl(id, String(i + 1).padStart(2, "0")),
    alt,
    label,
  }));

export const APLUS_WIDTH = 4100;
export const APLUS_HEIGHT = 1680;

/** Brand banner Amazon places first in every Plusmark Retail A+ description. */
export const APLUS_BRAND: AplusImage = {
  src: getAplusImageUrl("brand", ""),
  alt: "Plusmark Retail",
  label: "Plusmark Retail",
};

const amazon = (asin: string) => `https://www.amazon.in/dp/${asin}`;
export const AMAZON_STORE_URL = "https://www.amazon.in/s?k=plusmark+retail";

/* ------------------------------------------------------------------ */
/* ECO — Amazon.in listings (also used by the home / showroom / experience showcases) */
/* ------------------------------------------------------------------ */
export const aplusLines: AplusLine[] = [
  {
    id: "eco-premium-white-board",
    name: "Eco Premium White Board",
    short: "White Board",
    tagline: "Non-magnetic, high-gloss writing surface in an anodised aluminium frame.",
    productSlug: "eco-premium-white-board",
    amazonUrl: amazon("B0HFN59VDL"),
    images: set("eco-premium-white-board", [
      ["Features", "Features: non-magnetic surface, quick wall-mount installation, ABS dual-tone edge, easy-to-clean surface and premium aluminium anodised frame"],
      ["Mounting", "Flexible mounting: the white board can be hung horizontally or vertically"],
      ["Corners & surface", "ABS dual-tone corners and a bright white surface that is easy to write on and clean"],
      ["Sizes", "Available in 12 popular sizes from 1 × 1 ft to 4 × 6 ft"],
      ["Office", "Office use: meetings, communication, brainstorming and daily planning"],
      ["Classroom", "Classroom use: teaching, presentations, demonstrations and daily activities"],
      ["Home", "Home use: screen-free learning, reminders and kids' creativity"],
    ]),
  },
  {
    id: "eco-premium-chalk-board",
    name: "Eco Premium Chalk Board",
    short: "Chalk Board",
    tagline: "Glare-free matte green surface with minimal chalk dust.",
    productSlug: "eco-premium-chalk-board",
    amazonUrl: amazon("B0HFX71HB2"),
    images: set("eco-premium-chalk-board", [
      ["Features", "Features: non-magnetic surface, premium aluminium anodised frame, ABS dual-tone edge, easy-to-clean surface and quick wall-mount installation"],
      ["Mounting", "Flexible mounting: no reflection and clear visibility, hung horizontally or vertically"],
      ["Corners & surface", "ABS dual-tone corners and a smooth matte surface with minimal chalk dust"],
      ["Sizes", "Available in 12 popular sizes from 1 × 1 ft to 4 × 6 ft"],
      ["School", "School essential for teaching, presentations, training and classroom activities"],
      ["Teaching", "Traditional writing essential for teaching, practice and explanations"],
      ["Home learning", "Screen-free learning at home: daily planning, reminders and creativity"],
      ["Restaurant", "Restaurant supply: daily specials, kitchen orders and menu boards"],
    ]),
  },
  {
    id: "eco-premium-notice-board",
    name: "Eco Premium Notice Board",
    short: "Notice Board",
    tagline: "Soft velvet pin-up surface in blue, green and maroon.",
    productSlug: "eco-premium-notice-board",
    amazonUrl: amazon("B0HG62MHDD"),
    images: set("eco-premium-notice-board", [
      ["Overview", "Plusmark notice and bulletin board, available in blue, green and maroon"],
      ["Features", "Features: premium aluminium anodised frame, ABS dual-tone edge, easy to pin and quick wall-mount installation"],
      ["Mounting", "Flexible mounting: the notice board can be hung horizontally or vertically"],
      ["Corners & surface", "ABS dual-tone corners and a high-quality soft surface that is easy to pin"],
      ["Sizes", "Available in 6 popular sizes from 1.5 × 2 ft to 3 × 4 ft"],
      ["Office records", "Office records: keep work progress and reminders in view"],
      ["School notices", "School notes area: announcements, achievements and competition winners"],
      ["Kids' corner", "Children's creative corner: drawings and message boards"],
    ]),
  },
  {
    id: "eco-regular-magnetic-board",
    name: "Eco Magnetic White Board",
    short: "Magnetic White",
    tagline: "Resin-coated steel surface that accepts magnets and dusters.",
    productSlug: "eco-regular-magnetic-board",
    amazonUrl: amazon("B0HG5SNXP1"),
    images: set("eco-regular-magnetic-board", [
      ["Features", "Features: magnetic surface, premium aluminium anodised frame, ABS dual-tone edge, quick wall-mount installation and easy-to-clean surface"],
      ["Mounting", "Resin-coated magnetic white board with flexible horizontal or vertical mounting"],
      ["Corners & surface", "ABS dual-tone corners and a bright white surface for smooth writing and easy cleaning"],
      ["Sizes", "Available in 12 popular sizes from 1 × 1 ft to 4 × 6 ft"],
      ["Office", "Office use: meetings, brainstorming and planning"],
      ["Classroom", "Classroom use: teaching, presentations and demonstrations"],
      ["Home", "Home use: screen-free learning and daily reminders"],
      ["Restaurant & café", "Restaurant and café use: menus and daily specials"],
    ]),
  },
  {
    id: "eco-magnetic-chalk-board",
    name: "Eco Magnetic Chalk Board",
    short: "Magnetic Chalk",
    tagline: "Resin-coated steel chalk surface that holds magnets.",
    productSlug: "eco-regular-magnetic-board",
    amazonUrl: amazon("B0HHBDQVKC"),
    images: set("eco-magnetic-chalk-board", [
      ["Features", "Features: magnetic surface, easy-to-clean surface, premium aluminium anodised frame, quick wall-mount installation and ABS dual-tone edge"],
      ["Mounting", "Flexible mounting: no reflection, clear visibility, low dust, hung vertically or horizontally"],
      ["Corners & surface", "ABS dual-tone corners and a smooth matte surface with minimal chalk dust"],
      ["Sizes", "Available in 12 popular sizes from 1 × 1 ft to 4 × 6 ft"],
      ["Teaching", "Traditional writing essential for teaching and daily use in classrooms and workspaces"],
      ["School", "School essential for teaching, presentations and training"],
      ["Home learning", "Screen-free learning at home with a classic writing experience"],
      ["Restaurant", "Restaurant supply: daily specials, kitchen orders and offers menu"],
    ]),
  },
  {
    id: "eco-premium-both-side-board",
    name: "Eco Premium Both Side Board",
    short: "Both Side",
    tagline: "One board, two writing experiences: white board front, chalk board back.",
    productSlug: "eco-premium-both-side-board",
    amazonUrl: amazon("B0HFXS44PD"),
    images: set("eco-premium-both-side-board", [
      ["Features", "Features: non-magnetic surface, premium aluminium anodised frame, ABS dual-tone edge, easy-to-clean surface and quick wall-mount installation"],
      ["Mounting", "Flexible mounting: the double-sided board can be hung horizontally or vertically"],
      ["Corners & surface", "ABS dual-tone corners and an easy-to-write, easy-to-clean surface"],
      ["Sizes", "Available in 12 popular sizes, reversible white and chalk surfaces"],
      ["Office", "Office use: meetings, brainstorming and managing deadlines"],
      ["Classroom", "Classroom use: teaching, presentations and demonstrations"],
      ["Home", "Home use: screen-free learning, weekly plans and reminders"],
      ["Restaurant & café", "Restaurant and café use: specials, orders and offers"],
    ]),
  },
];

/* ------------------------------------------------------------------ */
/* Metallic Premium — same A+ pattern, product pages only               */
/* ------------------------------------------------------------------ */
const WRITING_USES: Banner[] = [
  ["Office", "Office use: meetings, communication, brainstorming and daily planning"],
  ["Classroom", "Classroom use: teaching, presentations, demonstrations and daily activities"],
  ["Home", "Screen-free learning at home: daily planning, reminders and kids' creativity"],
  ["Restaurant & café", "Restaurant and café use: daily specials, kitchen orders and menus"],
];

const CHALK_USES: Banner[] = [
  ["Teaching", "Traditional writing essential for teaching, practice and explanations"],
  ["Classroom", "Classroom use: teaching, presentations, demonstrations and daily activities"],
  ["Home learning", "Screen-free learning at home with a classic writing experience"],
  ["Restaurant", "Restaurant supply: daily specials, kitchen orders and offers menu"],
];

const metallic = (id: string, name: string, overview: string, features: string, uses: Banner[] = WRITING_USES): AplusSet => ({
  id,
  name,
  images: set(id, [
    ["Overview", overview],
    ["Features", features],
    ["Mounting", `Flexible mounting: the ${name} can be hung horizontally or vertically`],
    ["Sizes", `${name} available in multiple popular sizes`],
    ...uses,
  ]),
});

const metallicSets = {
  white: metallic(
    "metallic-premium-white-board",
    "Metallic Non-Magnetic White Board",
    "Plusmark Metallic non-magnetic white board: an exceptional writing surface with a premium finish",
    "Features: non-magnetic surface, premium aluminium anodised frame, ABS signature dual-tone edge, easy-to-clean surface",
  ),
  chalk: metallic(
    "metallic-premium-chalk-board",
    "Metallic Non-Magnetic Chalk Board",
    "Plusmark Metallic non-magnetic chalk board",
    "Features: non-magnetic surface, ABS signature dual-tone edge, premium aluminium anodised frame, easy-to-clean surface",
  ),
  notice: metallic(
    "metallic-premium-notice-board",
    "Metallic Notice Board",
    "Plusmark Metallic notice and bulletin board, available in 6 colour options",
    "Features: ABS signature dual-tone edge, premium aluminium anodised frame, easy to pin surface",
    [
      ["Office records", "Office records: keep your desk tidy and reminders in view"],
      ["Kids' corner", "Children's creative corner: drawings and message boards"],
      ["School notices", "School notes area: announcements, achievements, educational charts and competition winners"],
      ["Family photos", "Family photo album posted on a prominent wall for weekly activities and memos"],
      ["Reception", "Reception and lobby display: company values, visitor information and announcements"],
    ],
  ),
  magneticWhite: metallic(
    "metallic-magnetic-white-board",
    "Metallic Magnetic White Board",
    "Plusmark Metallic magnetic white board",
    "Features: magnetic surface, premium aluminium anodised frame, ABS signature dual-tone edge, easy-to-clean surface",
  ),
  magneticChalk: metallic(
    "metallic-magnetic-chalk-board",
    "Metallic Magnetic Chalk Board",
    "Plusmark Metallic magnetic chalk board",
    "Features: magnetic surface, ABS signature dual-tone edge, premium aluminium anodised frame, easy-to-clean surface",
    CHALK_USES,
  ),
  ceramicWhite: metallic(
    "metallic-ceramic-white-board",
    "Ceramic Magnetic White Board",
    "Plusmark ceramic magnetic white board",
    "Features: ceramic magnetic surface, premium aluminium anodised frame, ABS signature dual-tone edge, easy-to-clean surface",
  ),
  ceramicChalk: metallic(
    "metallic-ceramic-chalk-board",
    "Ceramic Magnetic Chalk Board",
    "Plusmark ceramic magnetic chalk board",
    "Features: ceramic magnetic surface, ABS signature dual-tone edge, premium aluminium anodised frame, easy-to-clean surface",
    CHALK_USES,
  ),
};

/* ------------------------------------------------------------------ */
/* Product page → A+ sets (one per variant)                            */
/* ------------------------------------------------------------------ */
export interface ProductAplus {
  /** Variant heading when a product shows more than one set */
  variant?: string;
  set: AplusSet;
  amazonUrl?: string;
}

const line = (id: string) => aplusLines.find((l) => l.id === id)!;
const eco = (id: string, variant?: string): ProductAplus => ({ variant, set: line(id), amazonUrl: line(id).amazonUrl });

const productAplus: Record<string, ProductAplus[]> = {
  "eco-premium-white-board": [eco("eco-premium-white-board")],
  "eco-premium-both-side-board": [eco("eco-premium-both-side-board")],
  "eco-premium-chalk-board": [eco("eco-premium-chalk-board")],
  "eco-premium-notice-board": [eco("eco-premium-notice-board")],
  "eco-regular-magnetic-board": [eco("eco-regular-magnetic-board", "White Board"), eco("eco-magnetic-chalk-board", "Chalk Board")],
  "metallic-premium-white-board": [{ set: metallicSets.white }],
  "metallic-premium-chalk-board": [{ set: metallicSets.chalk }],
  "metallic-premium-notice-board": [{ set: metallicSets.notice }],
  "metallic-premium-magnetic-board": [
    { variant: "White Board", set: metallicSets.magneticWhite },
    { variant: "Chalk Board", set: metallicSets.magneticChalk },
  ],
  "metallic-premium-ceramic-board": [
    { variant: "White Board", set: metallicSets.ceramicWhite },
    { variant: "Chalk Board", set: metallicSets.ceramicChalk },
  ],
  "metallic-premium-ceramic-chalk-board": [{ set: metallicSets.ceramicChalk }],
  "deluxe-standard-ceramic-board": [
    { variant: "White Board", set: metallicSets.ceramicWhite },
    { variant: "Chalk Board", set: metallicSets.ceramicChalk },
  ],
  "deluxe-standard-ceramic-chalk-board": [{ set: metallicSets.ceramicChalk }],
};

/** A+ banner sets for a product page (empty when the product has none). */
export const getProductAplus = (slug: string): ProductAplus[] => productAplus[slug] ?? [];
