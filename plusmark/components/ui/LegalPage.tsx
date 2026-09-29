import { PageHeader } from "./PageHeader";

export function LegalPage({
  title,
  path,
  intro,
  sections,
}: {
  title: string;
  path: string;
  intro: string;
  sections: Array<{ heading: string; body: string[] }>;
}) {
  return (
    <>
      <PageHeader crumbs={[{ name: title, path }]} title={title} intro={intro} />
      <div className="container-x max-w-3xl py-16 md:py-24">
        {sections.map((s) => (
          <section key={s.heading} className="border-t border-fog py-8">
            <h2 className="font-display text-xl font-semibold">{s.heading}</h2>
            {s.body.map((p) => (
              <p key={p} className="mt-3 leading-relaxed text-steel">
                {p}
              </p>
            ))}
          </section>
        ))}
      </div>
    </>
  );
}
