import { PageHeader } from "@/components/ui/PageHeader";
import { IndustriesSection } from "@/components/sections/IndustriesSection";
import { TrustSection } from "@/components/sections/TrustSection";
import { EnquiryBand } from "@/components/sections/EnquiryBand";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Industries — Schools, Colleges, Institutions, Offices & Factories",
  description:
    "Plusmark boards and furniture for schools, colleges and universities, training and coaching centres, dealers and distributors, factories and industrial units, and government and private institutions.",
  path: "/industries",
});

export default function IndustriesPage() {
  return (
    <>
      <PageHeader
        crumbs={[{ name: "Industries", path: "/industries" }]}
        eyebrow="Industries & Applications"
        title="Trusted where learning and work happen."
        intro="With a strong focus on quality, reliability and customer satisfaction, Plusmark has earned long-term trust from schools, institutions and government organizations across India."
      />
      <IndustriesSection showHeading={false} />
      <TrustSection />
      <EnquiryBand />
    </>
  );
}
