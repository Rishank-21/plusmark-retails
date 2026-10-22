import { requireAdmin } from "@/lib/admin-auth";
import { leadsDb } from "@/lib/firebase-admin";

export const metadata = { title: "Visits" };

export default async function AdminVisitsPage() {
  await requireAdmin();
  const snapshot = await leadsDb().ref("assignments").get();
  const assignments: Array<Record<string, unknown> & { id: string }> = [];
  snapshot.forEach((child) => {
    const value = child.val();
    if (value && typeof value === "object") assignments.push({ ...(value as Record<string, unknown>), id: child.key! });
  });
  assignments.sort((a, b) => Number(b.createdAt ?? 0) - Number(a.createdAt ?? 0));

  return (
    <div className="space-y-8">
      <header>
        <p className="font-mono text-xs uppercase tracking-[0.16em] text-steel">Lead management</p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-graphite">Visits & assignments</h1>
        <p className="mt-2 text-sm text-steel">{assignments.length} assignments from the Android field app.</p>
      </header>
      <div className="overflow-hidden rounded-2xl border border-line bg-white">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-line bg-mist/60 text-xs uppercase tracking-wide text-steel">
              <tr><th className="px-5 py-3">Area</th><th className="px-5 py-3">Salesman</th><th className="px-5 py-3">Due date</th><th className="px-5 py-3">Status</th></tr>
            </thead>
            <tbody className="divide-y divide-line">
              {assignments.map((assignment) => (
                <tr key={assignment.id}>
                  <td className="px-5 py-4 font-semibold text-graphite">{String(assignment.areaName || assignment.city || "Unassigned area")}</td>
                  <td className="px-5 py-4 text-steel">{String(assignment.salesmanName || assignment.salesmanId || "—")}</td>
                  <td className="px-5 py-4 text-steel">{assignment.dueDate ? new Date(Number(assignment.dueDate)).toLocaleDateString("en-IN") : "—"}</td>
                  <td className="px-5 py-4"><span className="rounded-full bg-mist px-2.5 py-1 text-xs font-semibold">{String(assignment.status || "Assigned")}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!assignments.length && <p className="p-8 text-center text-sm text-steel">No assignments found.</p>}
      </div>
    </div>
  );
}
