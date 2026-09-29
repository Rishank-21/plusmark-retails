import { isAdmin } from "@/lib/admin-auth";
import { isEnquiryStatus, listEnquiries, type EnquiryRecord } from "@/lib/db";

const COLUMNS: (keyof EnquiryRecord)[] = [
  "id",
  "createdAt",
  "status",
  "name",
  "company",
  "phone",
  "email",
  "product",
  "size",
  "quantity",
  "requirement",
  "message",
];

/** Quote for CSV and neutralise spreadsheet formula injection (=, +, -, @ …). */
function cell(v: unknown) {
  let s = String(v ?? "");
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
}

export async function GET(req: Request) {
  if (!(await isAdmin())) return new Response("Unauthorized", { status: 401 });

  const url = new URL(req.url);
  const q = url.searchParams.get("q")?.trim().slice(0, 100) || undefined;
  const s = url.searchParams.get("status");
  const status = isEnquiryStatus(s) ? s : undefined;

  let rows: EnquiryRecord[];
  try {
    ({ rows } = await listEnquiries({ q, status, limit: 5000 }));
  } catch (err) {
    console.error("[admin/export] failed to load enquiries", err);
    return new Response("Could not load enquiries from Firebase.", { status: 502 });
  }
  const csv = [COLUMNS.join(","), ...rows.map((r) => COLUMNS.map((c) => cell(r[c])).join(","))].join("\r\n");
  const date = new Date().toISOString().slice(0, 10);

  return new Response("\uFEFF" + csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="plusmark-enquiries-${date}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
