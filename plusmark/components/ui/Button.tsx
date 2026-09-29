import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Magnetic } from "@/components/animations/Magnetic";

type Variant = "primary" | "secondary" | "ghost" | "light" | "brand";

const styles: Record<Variant, string> = {
  primary:
    "btn-sheen rounded-full bg-graphite text-white shadow-[0_10px_30px_-10px_rgb(15_17_19/0.55)] hover:bg-ink hover:shadow-[0_16px_40px_-12px_rgb(15_17_19/0.6)]",
  secondary:
    "rounded-full bg-white/80 text-graphite ring-1 ring-line backdrop-blur hover:bg-white hover:ring-graphite/40",
  ghost: "text-graphite hover:text-accent px-0",
  light: "btn-sheen rounded-full bg-white text-graphite shadow-[0_10px_30px_-12px_rgb(0_0_0/0.4)] hover:bg-mist",
  brand:
    "btn-sheen rounded-full bg-gradient-to-r from-brand to-accent text-white shadow-[var(--shadow-glow)] hover:brightness-110",
};

interface ButtonLinkProps {
  href: string;
  children: React.ReactNode;
  variant?: Variant;
  arrow?: boolean;
  magnetic?: boolean;
  className?: string;
  ariaLabel?: string;
}

export function ButtonLink({
  href,
  children,
  variant = "primary",
  arrow = true,
  magnetic = false,
  className,
  ariaLabel,
}: ButtonLinkProps) {
  const link = (
    <Link
      href={href}
      aria-label={ariaLabel}
      className={cn(
        "group inline-flex h-12 items-center gap-3 px-6 text-sm font-semibold tracking-tight transition-[background-color,color,box-shadow,filter] duration-300",
        styles[variant],
        className,
      )}
    >
      <span>{children}</span>
      {arrow && (
        <ArrowRight
          aria-hidden
          className="size-4 transition-transform duration-300 ease-[var(--ease-premium)] group-hover:translate-x-1"
        />
      )}
    </Link>
  );
  return magnetic ? <Magnetic>{link}</Magnetic> : link;
}
