import { getClients } from "./actions";
import { ClientsManager } from "./ClientsManager";

export const metadata = {
  title: "Manage Clients — Plusmark Admin",
};

export default async function AdminClientsPage() {
  const clients = await getClients();

  return (
    <div className="space-y-6">
      <div className="border-b border-line pb-5">
        <h1 className="font-display text-2xl font-bold tracking-tight text-graphite sm:text-3xl">
          Client Brands & Logos
        </h1>
        <p className="mt-1 text-sm text-steel">
          Manage logos displayed in the homepage &ldquo;Trusted by Institutions&rdquo; marquee and customer proof sections.
        </p>
      </div>

      <ClientsManager initialClients={clients} />
    </div>
  );
}
