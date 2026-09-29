/**
 * Product explainer banners from Plusmark's Amazon A+ listings. Exported from the original
 * 4100 × 1680 Drive masters (IMG/ECO/ALL ECO FINAL Image AMAZON/A+) to 2400 × 983 WebP in
 * /public/images/aplus/<slug>/NN.webp, so they stay sharp on retina screens.
 * Every set follows the same order: hero, features, mounting, corners & surface, 4 uses, sizes.
 */
export interface AplusImage {
  src: string;
  alt: string;
}

export interface AplusLine {
  /** Folder under /public/images/aplus */
  id: string;
  name: string;
  /** Short label for tabs / chips */
  short: string;
  tagline: string;
  /** Site product page for this line, when the catalog has one */
  productSlug?: string;
  /** Plusmark Retail listing on Amazon.in */
  amazonUrl: string;
  images: AplusImage[];
}

const set = (slug: string, alts: string[]): AplusImage[] =>
  alts.map((alt, i) => ({ src: `/images/aplus/${slug}/${String(i + 1).padStart(2, "0")}.webp`, alt }));

export const APLUS_WIDTH = 2400;
export const APLUS_HEIGHT = 983;

const amazon = (asin: string) => `https://www.amazon.in/dp/${asin}`;
export const AMAZON_STORE_URL = "https://www.amazon.in/s?k=plusmark+retail";

export const aplusLines: AplusLine[] = [
  {
    id: "eco-premium-white-board",
    name: "Eco Premium White Board",
    short: "White Board",
    tagline: "Non-magnetic, high-gloss writing surface in an anodised aluminium frame.",
    productSlug: "eco-premium-white-board",
    amazonUrl: amazon("B0HFN59VDL"),
    images: set("eco-premium-white-board", [
      "Plusmark Eco Premium non-magnetic white board, premium quality feature-rich board",
      "Features: non-magnetic surface, quick wall-mount installation, ABS dual-tone edge, easy-to-clean surface and premium aluminium anodised frame",
      "Flexible mounting: the white board can be hung horizontally or vertically",
      "ABS dual-tone corners and a bright white surface that is easy to write on and clean",
      "Office use: meetings, communication, brainstorming and daily planning",
      "Classroom use: teaching, presentations, demonstrations and daily activities",
      "Home use: screen-free learning, reminders and kids' creativity",
      "Restaurant and café use: daily specials, order tracking and menus",
      "Available in 12 popular sizes from 1 × 1 ft to 4 × 6 ft",
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
      "Plusmark Eco Premium non-magnetic chalk board",
      "Features: non-magnetic surface, premium aluminium anodised frame, ABS dual-tone edge, easy-to-clean surface and quick wall-mount installation",
      "Flexible mounting: no reflection and clear visibility, hung horizontally or vertically",
      "ABS dual-tone corners and a smooth matte surface with minimal chalk dust",
      "Traditional writing essential for teaching, practice and explanations",
      "School essential for teaching, presentations, training and classroom activities",
      "Screen-free learning at home: daily planning, reminders and creativity",
      "Restaurant supply: daily specials, kitchen orders and menu boards",
      "Available in 12 popular sizes from 1 × 1 ft to 4 × 6 ft",
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
      "Plusmark notice and bulletin board, available in blue, green and maroon",
      "Features: premium aluminium anodised frame, ABS dual-tone edge, easy to pin and quick wall-mount installation",
      "Flexible mounting: the notice board can be hung horizontally or vertically",
      "ABS dual-tone corners and a high-quality soft surface that is easy to pin",
      "Office records: keep work progress and reminders in view",
      "Children's creative corner: drawings and message boards",
      "School notes area: announcements, achievements and competition winners",
      "Family photo album for weekly activities and memos",
      "Available in 6 popular sizes from 1.5 × 2 ft to 3 × 4 ft",
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
      "Plusmark magnetic white board that accepts magnets",
      "Features: magnetic surface, premium aluminium anodised frame, ABS dual-tone edge, quick wall-mount installation and easy-to-clean surface",
      "Resin-coated magnetic white board with flexible horizontal or vertical mounting",
      "ABS dual-tone corners and a bright white surface for smooth writing and easy cleaning",
      "Office use: meetings, brainstorming and planning",
      "Classroom use: teaching, presentations and demonstrations",
      "Home use: screen-free learning and daily reminders",
      "Restaurant and café use: menus and daily specials",
      "Available in 12 popular sizes from 1 × 1 ft to 4 × 6 ft",
    ]),
  },
  {
    id: "eco-magnetic-chalk-board",
    name: "Eco Magnetic Chalk Board",
    short: "Magnetic Chalk",
    tagline: "Resin-coated steel chalk surface that holds magnets.",
    amazonUrl: amazon("B0HHBDQVKC"),
    images: set("eco-magnetic-chalk-board", [
      "Plusmark magnetic chalk board that accepts magnets",
      "Features: magnetic surface, easy-to-clean surface, premium aluminium anodised frame, quick wall-mount installation and ABS dual-tone edge",
      "Flexible mounting: no reflection, clear visibility, low dust, hung vertically or horizontally",
      "ABS dual-tone corners and a smooth matte surface with minimal chalk dust",
      "Traditional writing essential for teaching and daily use in classrooms and workspaces",
      "School essential for teaching, presentations and training",
      "Screen-free learning at home with a classic writing experience",
      "Restaurant supply: daily specials, kitchen orders and offers menu",
      "Available in 12 popular sizes from 1 × 1 ft to 4 × 6 ft",
    ]),
  },
  {
    id: "eco-premium-both-side-board",
    name: "Eco Premium Both Side Board",
    short: "Both Side",
    tagline: "One board, two writing experiences: white board front, chalk board back.",
    amazonUrl: amazon("B0HFXS44PD"),
    images: set("eco-premium-both-side-board", [
      "Plusmark double-sided board: white board on the front and chalk board on the back",
      "Features: non-magnetic surface, premium aluminium anodised frame, ABS dual-tone edge, easy-to-clean surface and quick wall-mount installation",
      "Flexible mounting: the double-sided board can be hung horizontally or vertically",
      "ABS dual-tone corners and an easy-to-write, easy-to-clean surface",
      "Office use: meetings, brainstorming and managing deadlines",
      "Classroom use: teaching, presentations and demonstrations",
      "Home use: screen-free learning, weekly plans and reminders",
      "Restaurant and café use: specials, orders and offers",
      "Available in 12 popular sizes, reversible white and chalk surfaces",
    ]),
  },
];

export const aplus: Record<string, AplusImage[]> = Object.fromEntries(
  aplusLines.filter((l) => l.productSlug).map((l) => [l.productSlug!, l.images]),
);

export const getAplus = (slug: string) => aplus[slug] ?? [];
