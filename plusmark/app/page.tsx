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
import { getSiteSettings } from "@/lib/site-settings";

export const metadata = buildMetadata({
  title: "Plusmark — White Boards, Chalk Boards & Notice Boards",
  absoluteTitle: true,
  description:
    "Plusmark manufactures white, chalk, notice, magnetic and ceramic boards, board stands, clipboards and school benches. Est. 2015, GEM Portal approved.",
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
      <VideoRing videos={await getSiteVideos()} mode={(await getSiteSettings()).videoMode} />
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
