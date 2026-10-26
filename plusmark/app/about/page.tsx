import { PageHeader } from "@/components/ui/PageHeader";
import { AboutSection } from "@/components/sections/AboutSection";
import { TrustSection } from "@/components/sections/TrustSection";
import { EnquiryBand } from "@/components/sections/EnquiryBand";
import { StatsBand } from "@/components/sections/StatsBand";
import { Reveal } from "@/components/animations/Reveal";
import { CheckCircle2, Award, Clock, Shield } from "lucide-react";
import { company } from "@/data/company";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "About Plusmark — Indian Board Manufacturer",
  description:
    "Established 2015, Plusmark is an Indian manufacturer of educational and institutional products. GEM Portal approved, with Pan India supply.",
  path: "/about",
});

export default function AboutPage() {
  const highlights = [
    {
      icon: Award,
      title: "GEM Portal Approved",
      description: "Approved supplier for government organizations across India",
    },
    {
      icon: Clock,
      title: "Fast Pan India Supply",
      description: "Quick delivery to schools, institutions and dealers nationwide",
    },
    {
      icon: Shield,
      title: "Quality Assurance",
      description: "Strict quality control at every step of manufacturing",
    },
    {
      icon: CheckCircle2,
      title: "Customer Satisfaction",
      description: "Long-term trust from leading educational institutions",
    },
  ];

  return (
    <>
      <PageHeader
        crumbs={[{ name: "About", path: "/about" }]}
        title="About Plusmark"
        intro={company.about[0]}
      />

      {/* Highlights Section - New Animated Cards */}
      <section aria-label="Why choose Plusmark" className="bg-gradient-to-b from-white to-mist/30 py-16 md:py-20">
        <div className="container-x">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {highlights.map((item, i) => {
              const Icon = item.icon;
              return (
                <Reveal key={item.title} delay={i * 0.08}>
                  <div className="group relative overflow-hidden rounded-2xl bg-white p-6 transition-transform duration-500 hover:-translate-y-1">
                    <div className="absolute -right-6 -top-6 size-24 rounded-full bg-gradient-to-br from-accent/10 to-brand/10 blur-2xl transition-transform duration-700 group-hover:scale-150" />
                    <div className="relative">
                      <div className="inline-flex size-12 items-center justify-center rounded-xl bg-gradient-to-br from-accent to-brand text-white shadow-lg shadow-accent/25 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3">
                        <Icon className="size-6" />
                      </div>
                      <h2 className="mt-4 font-display text-lg font-semibold text-graphite">
                        {item.title}
                      </h2>
                      <p className="mt-2 text-sm leading-relaxed text-steel">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      <AboutSection full />
      {/* Plusmark in numbers, after the story it backs up */}
      <StatsBand />
      <section aria-labelledby="clients-title" className="relative overflow-hidden bg-white py-24 md:py-28">
        {/* Background decoration */}
        <div aria-hidden className="absolute right-0 top-0 size-[600px] -translate-y-1/2 translate-x-1/2 rounded-full bg-gradient-to-br from-accent/5 to-brand/5 blur-3xl" />
        
        <div className="container-x relative grid gap-12 lg:grid-cols-[1fr_1.4fr]">
          <Reveal>
            <p className="eyebrow mb-5">Our Happy Clients</p>
            <h2 id="clients-title" className="font-display text-[clamp(1.8rem,3.6vw,3rem)] font-semibold leading-[1.08]">
              Who Plusmark supplies.
            </h2>
            <p className="mt-6 max-w-md text-lg leading-relaxed text-steel">
              Trusted by leading educational institutions, government organizations, and businesses across India.
            </p>
          </Reveal>
          <ul className="grid gap-px bg-fog ring-1 ring-fog sm:grid-cols-2">
            {company.clients.map((c, i) => (
              <Reveal as="li" key={c} delay={i * 0.05} className="group bg-white p-7 transition-colors duration-300 hover:bg-accent/5">
                <span className="font-mono text-[0.62rem] text-alu-dark transition-colors duration-300 group-hover:text-accent">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <p className="mt-4 font-display text-lg font-semibold transition-colors duration-300 group-hover:text-accent">
                  {c}
                </p>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>
      <section aria-labelledby="quality-promise" className="bg-mist/40 py-20 md:py-24">
        <div className="container-x max-w-4xl text-left">
          <Reveal>
            <div>
              <p className="eyebrow mb-4">Best Quality. Best Rate.</p>
              <h2 id="quality-promise" className="font-display text-[clamp(1.8rem,3.6vw,3rem)] font-semibold leading-[1.08]">
                Built for dependable performance.
              </h2>
              <p className="mt-5 max-w-3xl text-base leading-relaxed text-steel md:text-lg">
                Premium materials, careful manufacturing and strict quality checks go into every Plusmark product.
              </p>
              <div className="mt-7 flex flex-wrap gap-x-6 gap-y-3 text-sm font-medium text-graphite">
                {["Aluminium Frames", "HPL Surfaces", "Strict QC", "Made in India"].map((tag, i) => (
                  <Reveal key={tag} delay={0.1 + i * 0.05}>
                    <span className="inline-flex items-center gap-2">
                      <CheckCircle2 className="size-4 text-accent" />
                      {tag}
                    </span>
                  </Reveal>
                ))}
              </div>
              <p className="mt-7 max-w-2xl text-sm leading-relaxed text-steel">{company.warranty}</p>
            </div>
          </Reveal>
        </div>
      </section>
      <TrustSection />
      <EnquiryBand />
    </>
  );
}
