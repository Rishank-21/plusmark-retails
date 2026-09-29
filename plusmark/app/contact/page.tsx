import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { EnquirySection } from "@/components/sections/EnquirySection";
import { LocationSection } from "@/components/sections/LocationSection";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Contact & Request Enquiry",
  description:
    "Request an enquiry for Plusmark white boards, chalk boards, notice boards, board stands, clipboards, school benches and custom boards. Pan India supply.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <>
      <div className="bg-mist pt-[100px] md:pt-[120px]">
        <div className="container-x">
          <Breadcrumbs items={[{ name: "Contact", path: "/contact" }]} />
        </div>
      </div>
      <EnquirySection headingLevel="h1" />
      <LocationSection />
    </>
  );
}
