export default function Loading() {
  return (
    <div className="studio-bg pb-14 pt-[100px] md:pt-[120px]" aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading product…</span>
      <div className="container-x">
        <div className="h-3 w-60 animate-pulse bg-fog" />
        <div className="mt-8 grid gap-10 lg:grid-cols-[1.25fr_1fr] lg:items-center lg:gap-16">
          <div className="aspect-[4/3] w-full animate-pulse bg-fog/70 lg:order-1" />
          <div className="space-y-4">
            <div className="h-3 w-32 animate-pulse bg-fog" />
            <div className="h-12 w-4/5 animate-pulse bg-fog" />
            <div className="h-12 w-3/5 animate-pulse bg-fog" />
            <div className="h-20 w-full animate-pulse bg-fog/70" />
          </div>
        </div>
      </div>
    </div>
  );
}
