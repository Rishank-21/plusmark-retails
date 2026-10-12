/** Heading block at the top of every admin page. */
export function PageTitle({ title, text, children }: { title: string; text?: string; children?: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-graphite sm:text-[1.75rem]">{title}</h1>
        {text && <p className="mt-1 max-w-2xl text-sm text-steel">{text}</p>}
      </div>
      {children}
    </div>
  );
}
