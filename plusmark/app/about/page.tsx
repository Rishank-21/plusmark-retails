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
  title: "About Plusmark — Indian Manufacturer of Educational & Institutional Products",
  description:
    "Established in 2015, Plusmark is an Indian manufacturing brand specializing in high-quality educational and institutional products, GEM Portal approved with Pan India supply.",
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
                  <div className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm ring-1 ring-fog transition-all duration-500 hover:shadow-xl hover:ring-accent/20 hover:-translate-y-1">
                    <div className="absolute -right-6 -top-6 size-24 rounded-full bg-gradient-to-br from-accent/10 to-brand/10 blur-2xl transition-transform duration-700 group-hover:scale-150" />
                    <div className="relative">
                      <div className="inline-flex size-12 items-center justify-center rounded-xl bg-gradient-to-br from-accent to-brand text-white shadow-lg shadow-accent/25 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3">
                        <Icon className="size-6" />
                      </div>
                      <h3 className="mt-4 font-display text-lg font-semibold text-graphite">
                        {item.title}
                      </h3>
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
      <section aria-labelledby="quality-promise" className="relative border-t border-fog bg-gradient-to-br from-mist via-white to-mist py-24">
        {/* Animated gradient orb */}
        <div aria-hidden className="absolute left-0 top-1/2 size-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-brand/10 to-accent/10 blur-3xl" />
        
        <div className="container-x relative max-w-4xl">
          <Reveal>
            <div className="rounded-3xl bg-white/80 p-8 shadow-xl ring-1 ring-fog/50 backdrop-blur-sm md:p-12">
              <p className="eyebrow mb-5">Best Quality. Best Rate.</p>
              <h2 id="quality-promise" className="font-display text-[clamp(1.8rem,3.6vw,3rem)] font-semibold leading-[1.08]">
                Quality is the foundation of{" "}
                <span className="text-gradient">everything we do.</span>
              </h2>
              <p className="mt-6 text-lg leading-relaxed text-steel">{company.quality}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                {["Aluminium Frames", "HPL Surfaces", "Strict QC", "Made in India"].map((tag, i) => (
                  <Reveal key={tag} delay={0.1 + i * 0.05}>
                    <span className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-accent/10 to-brand/10 px-4 py-2 text-sm font-semibold text-accent ring-1 ring-accent/20">
                      <CheckCircle2 className="size-4" />
                      {tag}
                    </span>
                  </Reveal>
                ))}
              </div>
              <p className="mt-8 text-sm leading-relaxed text-steel">{company.warranty}</p>
            </div>
          </Reveal>
        </div>
      </section>
      <TrustSection />
      <EnquiryBand />
    </>
  );
}
