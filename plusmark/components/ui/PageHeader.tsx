import { Breadcrumbs, type Crumb } from "./Breadcrumbs";
import { Reveal } from "@/components/animations/Reveal";

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
    <header className="noise relative overflow-hidden bg-gradient-to-br from-white via-mist/30 to-white pb-20 pt-[108px] md:pb-28 md:pt-[132px]">
      {/* Animated gradient orbs */}
      <div aria-hidden className="absolute -left-40 top-20 size-[500px] rounded-full bg-gradient-to-br from-brand/20 to-accent/20 blur-3xl animate-pulse" style={{ animationDuration: '4s' }} />
      <div aria-hidden className="absolute -right-40 bottom-20 size-[600px] rounded-full bg-gradient-to-br from-accent/15 to-flame/15 blur-3xl animate-pulse" style={{ animationDuration: '5s', animationDelay: '1s' }} />
      
      {/* Grid pattern overlay */}
      <div aria-hidden className="grid-lines pointer-events-none absolute inset-0 opacity-40 [mask-image:linear-gradient(to_bottom,black_20%,transparent_80%)]" />
      
      {/* Subtle shimmer effect */}
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent [mask-image:linear-gradient(to_right,transparent,black_50%,transparent)] animate-shimmer" />
      
      <div className="container-x relative">
        <Reveal>
          <Breadcrumbs items={crumbs} />
        </Reveal>
        
        <div className="mt-12 grid gap-12 md:mt-16 lg:grid-cols-[1.4fr_1fr] lg:items-end lg:gap-16">
          <div>
            {eyebrow && (
              <Reveal>
                <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-accent/10 to-brand/10 px-4 py-2 ring-1 ring-accent/20 backdrop-blur-sm">
                  <span aria-hidden className="relative flex size-2">
                    <span className="absolute inline-flex size-full animate-ping rounded-full bg-accent opacity-75" style={{ animationDuration: '2s' }} />
                    <span className="relative inline-flex size-2 rounded-full bg-accent" />
                  </span>
                  <span className="font-mono text-xs font-semibold uppercase tracking-[0.14em] text-accent">{eyebrow}</span>
                </div>
              </Reveal>
            )}
            <Reveal delay={0.1}>
              <h1 className="font-display text-[clamp(2.6rem,6.5vw,5.5rem)] font-bold leading-[0.95] tracking-tight">
                <span className="bg-gradient-to-br from-graphite via-graphite to-accent bg-clip-text text-transparent">{title}</span>
              </h1>
            </Reveal>
          </div>
          
          {intro && (
            <Reveal delay={0.2}>
              <div className="relative">
                {/* Decorative line */}
                <div aria-hidden className="absolute -left-4 top-0 h-full w-1 rounded-full bg-gradient-to-b from-accent via-brand to-transparent" />
                <p className="text-base leading-relaxed text-steel md:text-lg lg:pl-6">{intro}</p>
              </div>
            </Reveal>
          )}
        </div>
        {children}
      </div>
    </header>
  );
}
