/**
 * Customer reviews, reproduced from the public Google Maps business profile
 * for Plusmark Display System. Keep this list to real reviews only.
 */

export interface Review {
  author: string;
  text: string;
  rating: number;
  /** Relative age as shown on Google, e.g. "4 years ago". */
  when?: string;
}

export const reviewSummary = {
  rating: 5.0,
  count: 95,
  source: "Google",
  profileUrl: "https://www.google.com/maps/search/?api=1&query=Plusmark+Display+System+Narolgam+Ahmedabad",
} as const;

/** Short highlights Google surfaces in its review summary. */
export const reviewHighlights = [
  "Cheapest rate with best quality and service.",
  "Nice product and fast service — amazing work by Plus Mark Display System.",
  "Nice management and shipping of products.",
];

export const reviews: Review[] = [
  {
    author: "Krishna Vivek",
    rating: 5,
    when: "4 years ago",
    text: "Great service, great quality of products. Would recommend without any hesitation.",
  },
  {
    author: "Vivek Chaudhary",
    rating: 5,
    when: "4 years ago",
    text: "It's a fully trustworthy product. I must give reference to other people, and the after-sales service is also genuine and the best.",
  },
  {
    author: "Tushar Gauswami",
    rating: 5,
    when: "4 years ago",
    text: "The belief enshrined in Plus Mark Display System is to consider the customer as king, because customers provide the opportunity to serve them in fine manners.",
  },
];
