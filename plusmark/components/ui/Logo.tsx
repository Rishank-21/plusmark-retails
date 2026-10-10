import Image from "next/image";
import { cn } from "@/lib/utils";
import { getCloudinaryUrl } from "@/lib/cloudinary";

/**
 * Plusmark brand logo (circular "A" monogram + PLUSMARK wordmark).
 * Transparent, tightly-cropped artwork in /public/images. On dark surfaces
 * (`tone="light"`) the navy artwork is rendered white via CSS filter.
 */
export function Logo({ className, tone = "dark" }: { className?: string; tone?: "dark" | "light" }) {
  return (
    <Image
      src={getCloudinaryUrl("/images/plusmark-logo.png")}
      alt="Plusmark — Writing & Display System"
      width={892}
      height={162}
      priority
      className={cn("h-10 w-auto sm:h-12", tone === "light" && "brightness-0 invert", className)}
    />
  );
}
