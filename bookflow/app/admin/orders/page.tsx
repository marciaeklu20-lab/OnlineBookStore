import Link from "next/link";
import { adminSupabase } from "@/lib/supabase/admin";
import { Package, Search } from "lucide-react";

const STATUS_STYLES: Record<string, string> = {
  pending:    "bg-yellow-100 text-yellow-700",
  paid:       "bg-blue-100 text-blue-700",
  processing: "bg-purple-100 text-purple-700",
  shipped:    "bg-indigo-100 text-indigo-700",
  delivered:  "bg-green-100 text-green-700",
  cancelled:  "bg-red-100 text-red-700",
};

const STATUSES = ["all", "pending", "paid", "processing", "shipped", "delivered", "cancelled"];

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string; page?: string }>;
}) {
  const { status, q, page } = await searchParams;
  const activeStatus = status ?? "all";
  const currentPage = parseInt(page ?? "1", 10);
  const pageSize = 25;
  const offset = (currentPage - 1) * pageSize;

  let query = adminSupabase
    .from("orders")
    .select(`
      id, order_number, status, total_amount, tax_amount, created_at,
      payment_method, shipping_address,
      profiles!orders_user_id_fkey ( first_name, last_name, email )
    `, { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + pageSize - 1);

  if (activeStatus !== "all") query = query.eq("status", activeStatus);
  if (q) query = query.ilike("order_number", `%${q}%`);

  const { data: orders, count } = await query;
  const totalPages = Math.ceil((count ?? 0) / pageSize);

  // Status counts
  const { data: counts } = await adminSupabase
    .from("orders")
    .select("status");

  const statusCounts = (counts ?? []).reduce((acc: Record<string, number>, o) => {
    acc[o.status] = (acc[o.status] ?? 0) + 1;
    acc.all = (acc.all ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Orders</h1>
        <p className="text-sm text-neutral-500 mt-1">Manage and fulfil customer orders</p>
      </div>

      {/* Status filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {STATUSES.map((s) => (
          <Link
            key={s}
            href={`/admin/orders?status=${s}${q ? `&q=${q}` : ""}`}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium capitalize transition-colors ${
              activeStatus === s
                ? "bg-brand-500 text-white"
                : "bg-white border border-neutral-200 text-neutral-600 hover:border-brand-300"
            }`}
          >
            {s}
            <span className={`text-xs px-1.5 py-0.5 rounded-full ${activeStatus === s ? "bg-brand-600 text-brand-100" : "bg-neutral-100 text-neutral-500"}`}>
              {statusCounts[s] ?? 0}
            </span>
          </Link>
        ))}
      </div>

      {/* Search */}
      <form className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
        <input
          name="q"
          defaultValue={q}
          placeholder="Search order number…"
          className="w-full pl-9 pr-4 py-2.5 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:border-brand-400 bg-white"
        />
      </form>

      {/* Orders table */}
      <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-neutral-50 border-b border-neutral-100">
              <th className="text-left px-6 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Order</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider hidden sm:table-cell">Customer</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider hidden md:table-cell">Date</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Status</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider hidden md:table-cell">Payment</th>
              <th className="text-right px-6 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Total</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {(orders ?? []).length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center">
                  <Package className="w-10 h-10 text-neutral-300 mx-auto mb-3" />
                  <p className="text-neutral-400 text-sm">No orders found</p>
                </td>
              </tr>
            ) : (orders ?? []).map((o: {
              id: string; order_number: string; status: string;
              total_amount: number; created_at: string; payment_method: string;
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              profiles: any; shipping_address: any;
            }) => {
              const customer = o.profiles
                ? [o.profiles.first_name, o.profiles.last_name].filter(Boolean).join(" ") || o.profiles.email
                : (o.shipping_address?.first_name ?? "Guest");
              return (
                <tr key={o.id} className="hover:bg-neutral-50 transition-colors">
                  <td className="px-6 py-3 font-medium text-neutral-900">{o.order_number}</td>
                  <td className="px-4 py-3 text-neutral-600 hidden sm:table-cell">{customer}</td>
                  <td className="px-4 py-3 text-neutral-500 text-xs hidden md:table-cell">
                    {new Date(o.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${STATUS_STYLES[o.status] ?? "bg-neutral-100 text-neutral-500"}`}>
                      {o.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-neutral-500 capitalize hidden md:table-cell">{o.payment_method}</td>
                  <td className="px-6 py-3 text-right font-semibold text-neutral-900">
                    GHS {Number(o.total_amount).toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/admin/orders/${o.id}`} className="text-xs text-brand-500 hover:text-brand-600 font-medium">
                      Manage →
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-neutral-500">
          <p>Showing {offset + 1}–{Math.min(offset + pageSize, count ?? 0)} of {count} orders</p>
          <div className="flex gap-2">
            {currentPage > 1 && (
              <Link href={`/admin/orders?status=${activeStatus}&page=${currentPage - 1}${q ? `&q=${q}` : ""}`}
                className="px-3 py-1.5 border border-neutral-200 rounded-lg hover:border-brand-300 transition-colors">
                Previous
              </Link>
            )}
            {currentPage < totalPages && (
              <Link href={`/admin/orders?status=${activeStatus}&page=${currentPage + 1}${q ? `&q=${q}` : ""}`}
                className="px-3 py-1.5 border border-neutral-200 rounded-lg hover:border-brand-300 transition-colors">
                Next
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
