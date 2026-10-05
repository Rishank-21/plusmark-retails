import { ShieldCheck } from "lucide-react";
import type { Series } from "@/data/types";
import { getFramePricing } from "@/data/frame-pricing";

interface PricingBlockProps {
  series: Series;
  selectedSize?: string;
}

export function PricingBlock({ series }: PricingBlockProps) {
  const pricing = getFramePricing(series);
  if (!pricing) return null;

  return (
    <div className="mt-6 flex items-center gap-3 rounded-xl border border-verdant/20 bg-verdant/5 px-4 py-3">
      <ShieldCheck className="size-5 shrink-0 text-verdant" aria-hidden />
      <div>
        <span className="font-semibold text-graphite">
          {pricing.warrantyYears}-Year Manufacturer Warranty
        </span>
        <span className="ml-2 text-sm text-steel">
          · {series} Series
        </span>
      </div>
    </div>
  );
}
