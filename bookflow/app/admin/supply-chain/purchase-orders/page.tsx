import Link from "next/link";
import { adminSupabase } from "@/lib/supabase/admin";
import { ArrowLeft, Plus, ClipboardList } from "lucide-react";

const PO_STATUS: Record<string, string> = {
  draft:     "bg-neutral-100 text-neutral-500",
  sent:      "bg-blue-100 text-blue-700",
  confirmed: "bg-purple-100 text-purple-700",
  received:  "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

export default async function PurchaseOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const active = status ?? "all";

  let query = adminSupabase
    .from("purchase_orders")
    .select("id, po_number, status, total_cost, created_at, expected_at, received_at, suppliers(name)")
    .order("created_at", { ascending: false });

  if (active !== "all") query = query.eq("status", active);

  const { data: pos } = await query;
  const list = pos ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/supply-chain" className="text-neutral-400 hover:text-neutral-600">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-neutral-900">Purchase Orders</h1>
          <p className="text-sm text-neutral-500 mt-1">Manage supplier restocking orders</p>
        </div>
        <Link
          href="/admin/supply-chain/purchase-orders/new"
          className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" /> New PO
        </Link>
      </div>

      {/* Status filter */}
      <div className="flex gap-2 flex-wrap">
        {["all", "draft", "sent", "confirmed", "received", "cancelled"].map((s) => (
          <Link
            key={s}
            href={`/admin/supply-chain/purchase-orders?status=${s}`}
            className={`px-3 py-1.5 rounded-full text-sm font-medium capitalize transition-colors ${
              active === s
                ? "bg-brand-500 text-white"
                : "bg-white border border-neutral-200 text-neutral-600 hover:border-brand-300"
            }`}
          >
            {s}
          </Link>
        ))}
      </div>

      {list.length === 0 ? (
        <div className="bg-white border border-neutral-200 rounded-xl py-16 text-center">
          <ClipboardList className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
          <p className="text-neutral-500 font-medium">No purchase orders</p>
          <Link href="/admin/supply-chain/purchase-orders/new" className="mt-3 inline-block text-brand-500 hover:text-brand-600 text-sm font-medium">
            Create first PO →
          </Link>
        </div>
      ) : (
        <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-neutral-50 border-b border-neutral-100">
                <th className="text-left px-6 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">PO Number</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider hidden sm:table-cell">Supplier</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider hidden md:table-cell">Expected</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Total Cost</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {list.map((po: {
                id: string; po_number: string; status: string;
                total_cost: number | null; created_at: string;
                expected_at: string | null; received_at: string | null;
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                suppliers: any;
              }) => (
                <tr key={po.id} className="hover:bg-neutral-50 transition-colors">
                  <td className="px-6 py-3 font-medium text-neutral-900">{po.po_number}</td>
                  <td className="px-4 py-3 text-neutral-600 hidden sm:table-cell">{po.suppliers?.name ?? "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${PO_STATUS[po.status] ?? "bg-neutral-100"}`}>
                      {po.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-neutral-500 text-xs hidden md:table-cell">
                    {po.expected_at ? new Date(po.expected_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                  </td>
                  <td className="px-6 py-3 text-right font-semibold text-neutral-900">
                    {po.total_cost ? `GHS ${Number(po.total_cost).toFixed(2)}` : "—"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/admin/supply-chain/purchase-orders/${po.id}`} className="text-xs text-brand-500 hover:text-brand-600 font-medium">
                      View →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
