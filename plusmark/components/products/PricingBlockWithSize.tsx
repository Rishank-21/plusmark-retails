"use client";

import type { Series } from "@/data/types";
import { useSelectedSize } from "./SizeSelection";
import { PricingBlock } from "./PricingBlock";

/** Reads the selected size from SizeContext and passes it to PricingBlock. */
export function PricingBlockWithSize({ series }: { series: Series }) {
  const selected = useSelectedSize();
  return <PricingBlock series={series} selectedSize={selected?.label} />;
}
