import { trustedClients } from "@/data/clients";
import { Reveal } from "@/components/animations/Reveal";
import { LogoMarquee } from "./LogoMarquee";
import { adminDb } from "@/lib/firebase-admin";
import type { TrustedClient } from "@/data/clients";

async function getClients(): Promise<TrustedClient[]> {
  try {
    const db = adminDb();
    const snapshot = await db.ref("clients").orderByChild("order").once("value");
    const clients: TrustedClient[] = [];
    
    snapshot.forEach((child) => {
      const data = child.val();
      clients.push({
        id: child.key as string,
        name: data.name,
        sector: data.sector,
        logo: data.logo,
      });
    });
    
    return clients.length > 0 ? clients : trustedClients;
  } catch (error) {
    console.error("Error fetching clients from database, using static data:", error);
    return trustedClients;
  }
}

/** Home page: organizations Plusmark has supplied, as a slowly drifting strip of logo cards. */
export async function TrustedBySection() {
  const clients = await getClients();

  return (
    <section aria-labelledby="trusted-title" className="border-y border-fog bg-mist/40 py-20 md:py-28">
      <Reveal className="container-x">
        <div className="mx-auto max-w-4xl text-center">
          {/* Theme C sets heading letter-spacing outside the utility layer, hence the "!" */}
          <h2
            id="trusted-title"
            className="font-display text-[clamp(1.4rem,2.6vw,2.1rem)] font-semibold uppercase leading-[1.15] !tracking-[0.07em] text-graphite"
          >
            Trusted by leading organizations
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-steel md:text-lg">
            Trusted by educational institutions, government organizations and leading businesses across India.
          </p>
        </div>
      </Reveal>
      <Reveal delay={0.08} className="mt-10 md:mt-14">
        <LogoMarquee clients={clients} />
      </Reveal>
    </section>
  );
}
