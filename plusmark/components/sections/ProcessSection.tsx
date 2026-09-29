import { ClipboardList, MessagesSquare, FileText, Factory, Truck } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/animations/Reveal";

const steps = [
  {
    icon: ClipboardList,
    title: "Choose your boards",
    text: "Browse the range or use the Buying Guide to pick the series, surface and size that fit your space and usage.",
  },
  {
    icon: MessagesSquare,
    title: "Send an enquiry",
    text: "Share products, sizes and quantities through the enquiry form, WhatsApp or phone. Custom layouts can include a sketch.",
  },
  {
    icon: FileText,
    title: "Get a quotation",
    text: "The Plusmark team confirms the specification and shares a quotation for your exact requirement.",
  },
  {
    icon: Factory,
    title: "Manufacturing & QC",
    text: "Boards are built with premium-grade materials and checked under strict quality control before dispatch.",
  },
  {
    icon: Truck,
    title: "Pan India supply",
    text: "Orders are supplied across India to schools, institutions, offices, dealers and government buyers.",
  },
];

export function ProcessSection() {
  return (
    <section aria-labelledby="process-title" className="relative overflow-hidden bg-white py-24 md:py-32">
      <div className="container-x">
        <Reveal className="mb-14 md:mb-20">
          <SectionHeading
            id="process-title"
            eyebrow="How ordering works"
            title={
              <>
                From enquiry to installation, <span className="text-gradient">in five steps.</span>
              </>
            }
            intro="A simple, transparent process whether you need one board for an office or a full fit-out for a school."
          />
        </Reveal>
        <ol className="relative grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <span
            aria-hidden
            className="absolute left-0 right-0 top-[3.25rem] hidden h-px bg-gradient-to-r from-transparent via-line to-transparent lg:block"
          />
          {steps.map((s, i) => (
            <Reveal as="li" key={s.title} delay={i * 0.07} className="card-premium relative p-6">
              <div className="flex items-center justify-between">
                <span className="inline-flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-brand to-accent text-white shadow-[var(--shadow-glow)]">
                  <s.icon aria-hidden className="size-5" />
                </span>
                <span className="font-mono text-xs text-alu-dark">{String(i + 1).padStart(2, "0")}</span>
              </div>
              <h3 className="mt-6 font-display text-lg font-semibold">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-steel">{s.text}</p>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
