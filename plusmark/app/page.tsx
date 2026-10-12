import { Hero } from "@/components/hero/Hero";
import { CollectionSection } from "@/components/sections/CollectionSection";
import { AboutSection } from "@/components/sections/AboutSection";
import { IndustriesSection } from "@/components/sections/IndustriesSection";
import { TrustSection } from "@/components/sections/TrustSection";
import { ReviewWall } from "@/components/experience/ReviewWall";
import { LocationSection } from "@/components/sections/LocationSection";
import { CustomTeaser } from "@/components/sections/CustomTeaser";
import { EnquirySection } from "@/components/sections/EnquirySection";
import { VideoRing } from "@/components/experience/VideoRing";
import { getSiteVideos } from "@/lib/videos";
import { ProcessSection } from "@/components/sections/ProcessSection";
import { FaqSection } from "@/components/sections/FaqSection";
import { TrustedBySection } from "@/components/sections/TrustedBySection";
import { DesignHomeRedirect } from "@/components/ui/DesignHomeRedirect";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Plusmark Display System — White Boards, Chalk Boards & Notice Boards | Made in India",
  absoluteTitle: true,
  description:
    "Plusmark Display System manufactures white boards, chalk boards, notice boards, magnetic and ceramic boards, board stands, clipboards and school benches. Established 2015, GEM Portal approved, Pan India supply.",
  path: "/",
});

export default async function HomePage() {
  return (
    <>
      <DesignHomeRedirect />
      <Hero />
      <TrustedBySection />
      <CollectionSection />
      {/* Same "Spin the film reel" section as design D, with every product and installation film */}
      <VideoRing videos={await getSiteVideos()} />
      <AboutSection />
      <IndustriesSection />
      <ProcessSection />
      <TrustSection />
      {/* Same Google review wall as designs D and E */}
      <ReviewWall id="reviews" />
      <CustomTeaser />
      <FaqSection />
      <LocationSection />
      <EnquirySection />
    </>
  );
}
