import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  eyebrow?: string;
  title: React.ReactNode;
  intro?: React.ReactNode;
  as?: "h1" | "h2";
  align?: "left" | "center";
  className?: string;
  id?: string;
  tone?: "dark" | "light";
}

export function SectionHeading({
  eyebrow,
  title,
  intro,
  as: Tag = "h2",
  align = "left",
  className,
  id,
  tone = "dark",
}: SectionHeadingProps) {
  return (
    <div className={cn("max-w-3xl", align === "center" && "mx-auto text-center", className)}>
      {eyebrow && (
        <p className={cn("chip mb-6", tone === "light" && "chip-dark")}>
          <span aria-hidden className="chip-dot" />
          {eyebrow}
        </p>
      )}
      <Tag
        id={id}
        className={cn(
          "font-display text-[clamp(2rem,4.4vw,3.6rem)] font-semibold leading-[1.04]",
          tone === "light" ? "text-white" : "text-graphite",
        )}
      >
        {title}
      </Tag>
      {intro && (
        <p className={cn("mt-6 text-base leading-relaxed md:text-lg", tone === "light" ? "text-alu" : "text-steel")}>
          {intro}
        </p>
      )}
    </div>
  );
}
