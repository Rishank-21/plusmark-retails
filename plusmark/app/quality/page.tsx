import { PageHeader } from "@/components/ui/PageHeader";
import { QualityStory } from "@/components/sections/QualityStory";
import { EnquiryBand } from "@/components/sections/EnquiryBand";
import { Reveal } from "@/components/animations/Reveal";
import { company } from "@/data/company";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Quality & Manufacturing — Materials, Frames, Surfaces & Corners",
  description:
    "How Plusmark boards are built: premium-grade materials, aluminium framing, High Gloss Marker Grade and Hardcore Chalk Grade HPL Sheets, ceramic steel surfaces and signature corner designs.",
  path: "/quality",
});

const series = [
  { name: "Metallic Premium", corner: "Signature Dual-Tone Corners", frame: "Heavy-duty aluminium framing" },
  { name: "Eco Premium", corner: "ABS Dual-Tone Corner Design", frame: "Premium-grade construction" },
  { name: "Deluxe Standard", corner: "Electroplated Chrome Corners", frame: "Aluminium frame (magnetic & ceramic)" },
  { name: "Eco Regular", corner: "Standard plastic corners", frame: "Lightweight frame" },
];

export default function QualityPage() {
  return (
    <>
      <PageHeader
        crumbs={[{ name: "Quality", path: "/quality" }]}
        eyebrow="Quality & Manufacturing"
        title="Built for daily institutional use."
        intro={company.quality}
      />
      <section aria-label="How Plusmark boards are built" className="bg-white py-20 md:py-28">
        <div className="container-x">
          <QualityStory />
        </div>
      </section>
      <section aria-labelledby="series-title" className="border-t border-fog bg-mist py-24">
        <div className="container-x">
          <Reveal>
            <p className="eyebrow mb-5">Construction series</p>
            <h2 id="series-title" className="max-w-2xl font-display text-[clamp(1.8rem,3.6vw,3rem)] font-semibold leading-[1.08]">
              Four series, one standard of finish.
            </h2>
          </Reveal>
          <div className="mt-12 overflow-x-auto">
            <table className="w-full min-w-[40rem] border-collapse text-left text-sm">
              <caption className="sr-only">Plusmark board series by corner and frame type</caption>
              <thead>
                <tr className="border-b border-graphite font-mono text-[0.64rem] uppercase tracking-[0.14em] text-steel">
                  <th scope="col" className="py-4 pr-6 font-medium">Series</th>
                  <th scope="col" className="py-4 pr-6 font-medium">Corners</th>
                  <th scope="col" className="py-4 font-medium">Frame</th>
                </tr>
              </thead>
              <tbody>
                {series.map((s) => (
                  <tr key={s.name} className="border-b border-line">
                    <th scope="row" className="py-5 pr-6 font-display text-base font-semibold">{s.name}</th>
                    <td className="py-5 pr-6">{s.corner}</td>
                    <td className="py-5 text-steel">{s.frame}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-6 max-w-2xl text-xs leading-relaxed text-steel">{company.warranty}</p>
        </div>
      </section>
      <EnquiryBand />
    </>
  );
}
