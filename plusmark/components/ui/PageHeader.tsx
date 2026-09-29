import { Breadcrumbs, type Crumb } from "./Breadcrumbs";

interface PageHeaderProps {
  crumbs: Crumb[];
  eyebrow?: string;
  title: React.ReactNode;
  intro?: React.ReactNode;
  children?: React.ReactNode;
}

/** Standard inner-page header: breadcrumb, H1, intro. Server-rendered. */
export function PageHeader({ crumbs, eyebrow, title, intro, children }: PageHeaderProps) {
  return (
    <header className="noise relative overflow-hidden studio-bg pb-16 pt-[108px] md:pb-24 md:pt-[132px]">
      <div aria-hidden className="aurora" />
      <div aria-hidden className="grid-lines pointer-events-none absolute inset-0 [mask-image:linear-gradient(to_bottom,black,transparent)]" />
      <div className="container-x relative">
        <Breadcrumbs items={crumbs} />
        <div className="mt-10 grid gap-10 md:mt-14 lg:grid-cols-[1.3fr_1fr] lg:items-end">
          <div className="animate-rise">
            {eyebrow && (
              <p className="chip mb-6">
                <span aria-hidden className="chip-dot" />
                {eyebrow}
              </p>
            )}
            <h1 className="font-display text-[clamp(2.4rem,6vw,5rem)] font-semibold leading-[1] text-graphite">{title}</h1>
          </div>
          {intro && <p className="animate-rise text-base leading-relaxed text-steel [animation-delay:120ms] md:text-lg">{intro}</p>}
        </div>
        {children}
      </div>
    </header>
  );
}
