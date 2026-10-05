import { products } from "@/data/products";
import { categoryMap } from "@/data/categories";
import { company, contactChannels } from "@/data/company";
import { getFramePricing } from "@/data/frame-pricing";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/animations/Reveal";
import { EnquiryForm } from "./EnquiryForm";

export function EnquirySection({ headingLevel = "h2" }: { headingLevel?: "h1" | "h2" }) {
  // Only concrete sizes are selectable; summaries like "Available in 6 different sizes" are not.
  const selectable = (sizes: string[]) => sizes.filter((s) => !/^available\b|\bsizes\b/i.test(s));
  const options = products.map((p) => {
    // Prefer real catalog sizes from frame-pricing; fall back to product.sizes
    const framePricing = getFramePricing(p.series);
    const rawSizes = framePricing ? framePricing.availableSizes : selectable(p.sizes);
    return {
      slug: p.slug,
      name: p.name,
      group: categoryMap[p.categorySlug].name,
      sizes: rawSizes.length > 1 ? rawSizes : [],
    };
  });
  return (
    <section id="enquiry" aria-labelledby="enquiry-title" className="scroll-mt-20 bg-mist py-24 md:py-32">
      <div className="container-x grid gap-14 lg:grid-cols-[1fr_1.5fr] lg:gap-20">
        <Reveal>
          <SectionHeading
            as={headingLevel}
            id="enquiry-title"
            eyebrow="Request Enquiry"
            title="Tell us what you need."
            intro="Share the product, quantity and any size or colour requirements. Schools, institutions, dealers and government buyers are welcome."
          />
          <ul className="mt-10 space-y-4 text-sm">
            <li className="flex gap-3">
              <span className="font-mono text-[0.66rem] uppercase tracking-[0.14em] text-alu-dark">Website</span>
              <a href={company.website} className="link-underline font-medium">
                {company.websiteLabel}
              </a>
            </li>
            {contactChannels.email && (
              <li className="flex gap-3">
                <span className="font-mono text-[0.66rem] uppercase tracking-[0.14em] text-alu-dark">Email</span>
                <a href={`mailto:${contactChannels.email}`} className="link-underline font-medium">
                  {contactChannels.email}
                </a>
              </li>
            )}
            {contactChannels.phone && (
              <li className="flex gap-3">
                <span className="font-mono text-[0.66rem] uppercase tracking-[0.14em] text-alu-dark">Phone</span>
                <a href={`tel:${contactChannels.phone}`} className="link-underline font-medium">
                  {contactChannels.phoneLabel}
                </a>
              </li>
            )}
          </ul>
          <p className="mt-10 max-w-sm text-xs leading-relaxed text-steel">{company.warranty}</p>
        </Reveal>
        <Reveal delay={0.08}>
          <EnquiryForm products={options} whatsapp={contactChannels.whatsapp || undefined} />
        </Reveal>
      </div>
    </section>
  );
}
