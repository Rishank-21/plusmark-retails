import Link from "next/link";
import { requireAdmin } from "@/lib/admin-auth";
import { leadsDb } from "@/lib/firebase-admin";
import type { Lead } from "@/web-admin-types";

export const metadata = { title: "Leads" };

export default async function AdminLeadsPage() {
  await requireAdmin();
  const snapshot = await leadsDb().ref("leads").get();
  const leads: Lead[] = [];
  snapshot.forEach((child) => {
    const value = child.val();
    if (value && typeof value === "object") leads.push({ ...(value as Lead), id: child.key! });
  });
  leads.sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.16em] text-steel">Lead management</p>
          <h1 className="mt-2 font-display text-3xl font-semibold text-graphite">Leads</h1>
          <p className="mt-2 text-sm text-steel">{leads.length} leads from the Android field app.</p>
        </div>
        <Link href="/admin" className="rounded-lg border border-line bg-white px-4 py-2 text-sm font-medium text-graphite hover:bg-mist">
          Back to dashboard
        </Link>
      </header>

      <div className="overflow-hidden rounded-2xl border border-line bg-white">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-line bg-mist/60 text-xs uppercase tracking-wide text-steel">
              <tr>
                <th className="px-5 py-3 font-semibold">Lead</th>
                <th className="px-5 py-3 font-semibold">Phone</th>
                <th className="px-5 py-3 font-semibold">City / State</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 font-semibold">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {leads.map((lead) => (
                <tr key={lead.id} className="hover:bg-mist/40">
                  <td className="px-5 py-4">
                    <div className="font-semibold text-graphite">{lead.shopName || lead.contactPerson || "Unnamed lead"}</div>
                    <div className="text-xs text-steel">{lead.contactPerson || lead.type || "—"}</div>
                  </td>
                  <td className="px-5 py-4 text-steel">{lead.phone1 || "—"}</td>
                  <td className="px-5 py-4 text-steel">{[lead.city, lead.state].filter(Boolean).join(", ") || "—"}</td>
                  <td className="px-5 py-4"><span className="rounded-full bg-mist px-2.5 py-1 text-xs font-semibold text-graphite">{lead.status || "New"}</span></td>
                  <td className="px-5 py-4 text-steel">{lead.createdAt ? new Date(lead.createdAt).toLocaleDateString("en-IN") : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!leads.length && <p className="p-8 text-center text-sm text-steel">No leads found in the Android lead database.</p>}
      </div>
    </div>
  );
}
