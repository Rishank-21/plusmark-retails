/**
 * Frame-level pricing information for Plusmark boards.
 * Price is per square foot + 18% GST.
 * Applies to all board types (white, chalk, notice, etc.) within each frame series.
 */
import type { Series } from "./types";

export interface FramePricing {
  series: Series;
  warrantyYears: number;
  pricePerSqFt: number;
  gstPercent: number;
  availableSizes: string[];
}

export const framePricing: Record<string, FramePricing> = {
  "Eco Regular": {
    series: "Eco Regular",
    warrantyYears: 2,
    pricePerSqFt: 65,
    gstPercent: 18,
    availableSizes: [
      "1.5 × 2 ft",
      "2 × 2 ft",
      "2 × 3 ft",
      "3 × 4 ft",
      "4 × 4 ft",
      "5 × 4 ft",
      "6 × 4 ft",
      "8 × 4 ft",
    ],
  },
  "Deluxe Standard": {
    series: "Deluxe Standard",
    warrantyYears: 2,
    pricePerSqFt: 75,
    gstPercent: 18,
    availableSizes: [
      "3 × 4 ft",
      "4 × 4 ft",
      "5 × 4 ft",
      "6 × 4 ft",
      "8 × 4 ft",
    ],
  },
  "Eco Premium": {
    series: "Eco Premium",
    warrantyYears: 7,
    pricePerSqFt: 110,
    gstPercent: 18,
    availableSizes: [
      "1.5 × 2 ft",
      "2 × 2 ft",
      "2 × 3 ft",
      "3 × 4 ft",
      "4 × 4 ft",
      "5 × 4 ft",
      "6 × 4 ft",
      "8 × 4 ft",
    ],
  },
  "Metallic Premium": {
    series: "Metallic Premium",
    warrantyYears: 7,
    pricePerSqFt: 130,
    gstPercent: 18,
    availableSizes: [
      "3 × 4 ft",
      "4 × 4 ft",
      "5 × 4 ft",
      "6 × 4 ft",
      "8 × 4 ft",
    ],
  },
};

/** Get pricing info for a given series, or null if not in the pricing table. */
export function getFramePricing(series: Series): FramePricing | null {
  return framePricing[series] ?? null;
}

/** Compute the price for a given size (WxH in ft), e.g. "3 × 4 ft" → 3*4 sqft * rate */
export function computeSizePrice(sizeLabel: string, pricePerSqFt: number, gstPercent: number) {
  // Parse "3 × 4 ft" or "3*4 ft" style
  const match = sizeLabel.match(/([\d.]+)\s*[×x\*]\s*([\d.]+)/);
  if (!match) return null;
  const w = parseFloat(match[1]);
  const h = parseFloat(match[2]);
  const sqft = w * h;
  const basePrice = Math.round(sqft * pricePerSqFt);
  const gstAmount = Math.round(basePrice * (gstPercent / 100));
  const totalPrice = basePrice + gstAmount;
  return { sqft, basePrice, gstAmount, totalPrice };
}
