import { PageHeader } from "@/components/ui/PageHeader";
import { AboutSection } from "@/components/sections/AboutSection";
import { TrustSection } from "@/components/sections/TrustSection";
import { EnquiryBand } from "@/components/sections/EnquiryBand";
import { Reveal } from "@/components/animations/Reveal";
import { company } from "@/data/company";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "About Plusmark — Indian Manufacturer of Educational & Institutional Products",
  description:
    "Established in 2015, Plusmark is an Indian manufacturing brand specializing in high-quality educational and institutional products, GEM Portal approved with Pan India supply.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <>
      <PageHeader
        crumbs={[{ name: "About", path: "/about" }]}
        eyebrow={`Established ${company.established}`}
        title="About Plusmark"
        intro={company.about[0]}
      />
      <AboutSection full />
      <section aria-labelledby="clients-title" className="bg-white py-24 md:py-28">
        <div className="container-x grid gap-12 lg:grid-cols-[1fr_1.4fr]">
          <Reveal>
            <p className="eyebrow mb-5">Our Happy Clients</p>
            <h2 id="clients-title" className="font-display text-[clamp(1.8rem,3.6vw,3rem)] font-semibold leading-[1.08]">
              Who Plusmark supplies.
            </h2>
          </Reveal>
          <ul className="grid gap-px bg-fog ring-1 ring-fog sm:grid-cols-2">
            {company.clients.map((c, i) => (
              <Reveal as="li" key={c} delay={i * 0.05} className="bg-white p-7">
                <span className="font-mono text-[0.62rem] text-alu-dark">{String(i + 1).padStart(2, "0")}</span>
                <p className="mt-4 font-display text-lg font-semibold">{c}</p>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>
      <section aria-labelledby="quality-promise" className="border-t border-fog bg-mist py-24">
        <div className="container-x max-w-4xl">
          <Reveal>
            <p className="eyebrow mb-5">Best Quality. Best Rate.</p>
            <h2 id="quality-promise" className="font-display text-[clamp(1.8rem,3.6vw,3rem)] font-semibold leading-[1.08]">
              Quality is the foundation of everything we do.
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-steel">{company.quality}</p>
            <p className="mt-6 text-sm leading-relaxed text-steel">{company.warranty}</p>
          </Reveal>
        </div>
      </section>
      <TrustSection />
      <EnquiryBand />
    </>
  );
}
