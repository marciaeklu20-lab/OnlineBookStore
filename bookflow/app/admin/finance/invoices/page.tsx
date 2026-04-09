import Link from "next/link";
import { adminSupabase } from "@/lib/supabase/admin";
import { FileText, ArrowLeft } from "lucide-react";

const STATUS_STYLES: Record<string, string> = {
  pending:    "bg-yellow-100 text-yellow-700",
  paid:       "bg-blue-100 text-blue-700",
  processing: "bg-purple-100 text-purple-700",
  shipped:    "bg-indigo-100 text-indigo-700",
  delivered:  "bg-green-100 text-green-700",
  cancelled:  "bg-red-100 text-red-700",
};

export default async function InvoicesPage() {
  const { data: orders } = await adminSupabase
    .from("orders")
    .select(`
      id, order_number, status, subtotal, shipping_cost,
      tax_amount, tax_rate, total_amount, created_at, payment_method,
      shipping_address,
      profiles!orders_user_id_fkey ( first_name, last_name, email )
    `)
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/finance" className="text-neutral-400 hover:text-neutral-600">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Invoices</h1>
          <p className="text-sm text-neutral-500 mt-1">Generate and download order invoices</p>
        </div>
      </div>

      <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-neutral-50 border-b border-neutral-100">
              <th className="text-left px-6 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Invoice</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider hidden sm:table-cell">Customer</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider hidden md:table-cell">Date</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Status</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider hidden md:table-cell">Tax</th>
              <th className="text-right px-6 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Total</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {(orders ?? []).map((o: {
              id: string; order_number: string; status: string;
              subtotal: number; shipping_cost: number; tax_amount: number | null;
              total_amount: number; created_at: string; payment_method: string;
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              profiles: any; shipping_address: any;
            }) => {
              const customer = o.profiles
                ? [o.profiles.first_name, o.profiles.last_name].filter(Boolean).join(" ") || o.profiles.email
                : (o.shipping_address?.first_name ?? "Guest");
              return (
                <tr key={o.id} className="hover:bg-neutral-50 transition-colors">
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-neutral-400 shrink-0" />
                      <span className="font-medium text-neutral-900">{o.order_number}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-neutral-600 hidden sm:table-cell">{customer}</td>
                  <td className="px-4 py-3 text-neutral-500 text-xs hidden md:table-cell">
                    {new Date(o.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${STATUS_STYLES[o.status] ?? "bg-neutral-100 text-neutral-500"}`}>
                      {o.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-neutral-500 text-xs hidden md:table-cell">
                    GHS {Number(o.tax_amount ?? 0).toFixed(2)}
                  </td>
                  <td className="px-6 py-3 text-right font-semibold text-neutral-900">
                    GHS {Number(o.total_amount).toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/finance/invoices/${o.id}`}
                      className="text-xs text-brand-500 hover:text-brand-600 font-medium"
                    >
                      View →
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
