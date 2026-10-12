import Image from "next/image";
import { cn } from "@/lib/utils";
import { getCloudinaryUrl } from "@/lib/cloudinary";

/**
 * Plusmark brand logo (circular "A" monogram + PLUSMARK wordmark).
 * Transparent, tightly-cropped artwork in /public/images. On dark surfaces
 * (`tone="light"`) the navy artwork is rendered white via CSS filter.
 *
 * `className` replaces the default size (cn() does not merge conflicting classes),
 * so pass a full height/width when overriding.
 */
export function Logo({ className, tone = "dark" }: { className?: string; tone?: "dark" | "light" }) {
  return (
    <Image
      src={getCloudinaryUrl("/images/plusmark-logo.png")}
      alt="Plusmark — Writing & Display System"
      width={892}
      height={162}
      priority
      className={cn(className ?? "h-10 w-auto sm:h-12", tone === "light" && "brightness-0 invert")}
    />
  );
}

/** Just the circular monogram, cropped from the logo artwork (for round badges). */
export function LogoMark({ className }: { className?: string }) {
  return (
    <span className={cn("relative block overflow-hidden rounded-full bg-white", className)}>
      <Image
        src="/images/plusmark-mark.png"
        alt=""
        width={256}
        height={256}
        sizes="80px"
        className="size-full object-contain"
      />
    </span>
  );
}
