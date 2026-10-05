import { Hero } from "@/components/hero/Hero";
import { CollectionSection } from "@/components/sections/CollectionSection";
import { AboutSection } from "@/components/sections/AboutSection";
import { QualityStory } from "@/components/sections/QualityStory";
import { IndustriesSection } from "@/components/sections/IndustriesSection";
import { TrustSection } from "@/components/sections/TrustSection";
import { ReviewWall } from "@/components/experience/ReviewWall";
import { CustomTeaser } from "@/components/sections/CustomTeaser";
import { EnquirySection } from "@/components/sections/EnquirySection";
import { StatsBand } from "@/components/sections/StatsBand";
import { VideoRing } from "@/components/experience/VideoRing";
import { allVideos } from "@/data/media";
import { ProcessSection } from "@/components/sections/ProcessSection";
import { FaqSection } from "@/components/sections/FaqSection";
import { TrustedBySection } from "@/components/sections/TrustedBySection";
import { DesignHomeRedirect } from "@/components/ui/DesignHomeRedirect";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/animations/Reveal";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Plusmark Display System — White Boards, Chalk Boards & Notice Boards | Made in India",
  absoluteTitle: true,
  description:
    "Plusmark Display System manufactures white boards, chalk boards, notice boards, magnetic and ceramic boards, board stands, clipboards and school benches. Established 2015, GEM Portal approved, Pan India supply.",
  path: "/",
});

export default function HomePage() {
  return (
    <>
      <DesignHomeRedirect />
      <Hero />
      <StatsBand />
      <TrustedBySection />
      <CollectionSection />
      {/* Same "Spin the film reel" section as design D, with every product and installation film */}
      <VideoRing videos={allVideos} />
      <AboutSection />
      {/* No overflow-hidden here: it would break the sticky 3D assembly inside QualityStory. */}
      <section aria-labelledby="quality-title" className="relative bg-white py-24 md:py-32">
        <div className="container-x">
          <Reveal className="mb-16">
            <SectionHeading
              id="quality-title"
              eyebrow="Quality & Manufacturing"
              title={
                <>
                  Quality is the foundation of <span className="text-gradient">everything we do.</span>
                </>
              }
              intro="Premium-grade materials, modern production techniques and strict quality control processes — from the aluminium frame to the writing surface."
            />
          </Reveal>
          <QualityStory />
        </div>
      </section>
      <IndustriesSection />
      <ProcessSection />
      <TrustSection />
      {/* Same Google review wall as designs D and E */}
      <ReviewWall id="reviews" />

      <CustomTeaser />
      <FaqSection />
      <EnquirySection />
    </>
  );
}
