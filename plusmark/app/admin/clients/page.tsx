import { requireAdmin } from "@/lib/admin-auth";
import { getClients } from "./actions";
import { ClientsManager } from "./ClientsManager";
import { PageTitle } from "../PageTitle";

export const metadata = { title: "Clients" };

export default async function AdminClientsPage() {
  await requireAdmin();
  const clients = await getClients();

  return (
    <div className="space-y-6">
      <PageTitle title="Clients" text="Schools, colleges and organisations shown in the “Trusted by” logo strip on the home page." />
      <ClientsManager initialClients={clients} />
    </div>
  );
}
