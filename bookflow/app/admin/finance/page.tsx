import { adminSupabase } from "@/lib/supabase/admin";
import { TrendingUp, ShoppingBag, Receipt, Percent, Download } from "lucide-react";
import Link from "next/link";

const STATUS_STYLES: Record<string, string> = {
  pending:    "bg-yellow-100 text-yellow-700",
  paid:       "bg-blue-100 text-blue-700",
  processing: "bg-purple-100 text-purple-700",
  shipped:    "bg-indigo-100 text-indigo-700",
  delivered:  "bg-green-100 text-green-700",
  cancelled:  "bg-red-100 text-red-700",
};

export default async function FinancePage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>;
}) {
  const { period } = await searchParams;
  const activePeriod = period ?? "30";

  const periodDays = parseInt(activePeriod, 10);
  const since = new Date();
  since.setDate(since.getDate() - periodDays);

  const [allOrdersRes, periodOrdersRes] = await Promise.all([
    adminSupabase
      .from("orders")
      .select("id, order_number, status, subtotal, shipping_cost, tax_amount, total_amount, created_at, payment_method")
      .order("created_at", { ascending: false }),
    adminSupabase
      .from("orders")
      .select("id, status, subtotal, shipping_cost, tax_amount, total_amount, created_at, payment_method")
      .gte("created_at", since.toISOString())
      .neq("status", "cancelled"),
  ]);

  const allOrders = allOrdersRes.data ?? [];
  const periodOrders = periodOrdersRes.data ?? [];

  // Revenue metrics
  const totalRevenue = periodOrders.reduce((s, o) => s + Number(o.total_amount), 0);
  const totalSubtotal = periodOrders.reduce((s, o) => s + Number(o.subtotal), 0);
  const totalTax = periodOrders.reduce((s, o) => s + Number(o.tax_amount ?? 0), 0);
  const totalShipping = periodOrders.reduce((s, o) => s + Number(o.shipping_cost), 0);
  const orderCount = periodOrders.length;
  const avgOrder = orderCount > 0 ? totalRevenue / orderCount : 0;

  // Payment method breakdown
  const paymentBreakdown = periodOrders.reduce((acc: Record<string, number>, o) => {
    acc[o.payment_method] = (acc[o.payment_method] ?? 0) + 1;
    return acc;
  }, {});

  // Daily revenue for last 7 days (within the period)
  const dailyMap: Record<string, number> = {};
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split("T")[0];
  });
  last7.forEach((d) => { dailyMap[d] = 0; });
  periodOrders.forEach((o) => {
    const day = new Date(o.created_at).toISOString().split("T")[0];
    if (dailyMap[day] !== undefined) dailyMap[day] += Number(o.total_amount);
  });

  const maxDaily = Math.max(...Object.values(dailyMap), 1);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Finance Dashboard</h1>
          <p className="text-sm text-neutral-500 mt-1">Revenue, tax, and transaction overview</p>
        </div>
        <Link
          href="/admin/finance/invoices"
          className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors"
        >
          <Receipt className="w-4 h-4" /> Invoices
        </Link>
      </div>

      {/* Period filter */}
      <div className="flex gap-2">
        {[
          { label: "Last 7 days", value: "7" },
          { label: "Last 30 days", value: "30" },
          { label: "Last 90 days", value: "90" },
          { label: "All time", value: "3650" },
        ].map(({ label, value }) => (
          <Link
            key={value}
            href={`/admin/finance?period=${value}`}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              activePeriod === value
                ? "bg-brand-500 text-white"
                : "bg-white border border-neutral-200 text-neutral-600 hover:border-brand-300"
            }`}
          >
            {label}
          </Link>
        ))}
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Revenue", value: `GHS ${totalRevenue.toFixed(2)}`, icon: TrendingUp, color: "bg-green-50 text-green-600", sub: `${orderCount} orders` },
          { label: "Net Sales", value: `GHS ${totalSubtotal.toFixed(2)}`, icon: ShoppingBag, color: "bg-blue-50 text-blue-600", sub: "Before tax & shipping" },
          { label: "Tax Collected", value: `GHS ${totalTax.toFixed(2)}`, icon: Percent, color: "bg-amber-50 text-amber-600", sub: "VAT + NHIL + GETFund" },
          { label: "Avg Order Value", value: `GHS ${avgOrder.toFixed(2)}`, icon: Receipt, color: "bg-purple-50 text-purple-600", sub: `Shipping: GHS ${totalShipping.toFixed(2)}` },
        ].map(({ label, value, icon: Icon, color, sub }) => (
          <div key={label} className="bg-white border border-neutral-200 rounded-xl p-5">
            <div className={`w-9 h-9 rounded-lg ${color} flex items-center justify-center mb-3`}>
              <Icon className="w-4 h-4" />
            </div>
            <p className="text-xl font-bold text-neutral-900">{value}</p>
            <p className="text-xs font-medium text-neutral-500 mt-0.5">{label}</p>
            <p className="text-xs text-neutral-400 mt-0.5">{sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue bar chart (last 7 days) */}
        <div className="lg:col-span-2 bg-white border border-neutral-200 rounded-xl p-6">
          <h2 className="font-semibold text-neutral-900 mb-6">Daily Revenue — Last 7 Days</h2>
          <div className="flex items-end gap-3 h-36">
            {last7.map((day) => {
              const val = dailyMap[day];
              const pct = (val / maxDaily) * 100;
              const label = new Date(day).toLocaleDateString("en-GB", { weekday: "short", day: "numeric" });
              return (
                <div key={day} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-xs text-neutral-500 font-medium">{val > 0 ? `${val.toFixed(0)}` : ""}</span>
                  <div className="w-full flex items-end justify-center" style={{ height: "80px" }}>
                    <div
                      className="w-full bg-brand-500 rounded-t-md transition-all"
                      style={{ height: `${Math.max(pct, val > 0 ? 4 : 0)}%` }}
                    />
                  </div>
                  <span className="text-xs text-neutral-400">{label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tax breakdown */}
        <div className="bg-white border border-neutral-200 rounded-xl p-6">
          <h2 className="font-semibold text-neutral-900 mb-4">Tax Breakdown</h2>
          <div className="space-y-3">
            {[
              { label: "VAT (12.5%)", value: totalSubtotal * 0.125, color: "bg-blue-500" },
              { label: "NHIL (2.5%)", value: totalSubtotal * 0.025, color: "bg-amber-500" },
              { label: "GETFund (2.5%)", value: totalSubtotal * 0.025, color: "bg-green-500" },
            ].map(({ label, value, color }) => (
              <div key={label}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-neutral-600">{label}</span>
                  <span className="font-semibold text-neutral-900">GHS {value.toFixed(2)}</span>
                </div>
                <div className="h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${color} rounded-full`}
                    style={{ width: `${totalTax > 0 ? (value / totalTax) * 100 : 0}%` }}
                  />
                </div>
              </div>
            ))}
            <div className="border-t border-neutral-100 pt-3 flex justify-between text-sm font-bold text-neutral-900">
              <span>Total Tax</span>
              <span>GHS {totalTax.toFixed(2)}</span>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-neutral-100">
            <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3">By Payment Method</h3>
            {Object.entries(paymentBreakdown).map(([method, count]) => (
              <div key={method} className="flex justify-between text-sm mb-2">
                <span className="text-neutral-600 capitalize">{method}</span>
                <span className="font-medium text-neutral-800">{count} orders</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent transactions */}
      <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
          <h2 className="font-semibold text-neutral-900">Recent Transactions</h2>
          <Link href="/admin/orders" className="text-sm text-brand-500 hover:text-brand-600 font-medium">
            View all orders →
          </Link>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-neutral-50 border-b border-neutral-100">
              <th className="text-left px-6 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Order</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider hidden md:table-cell">Date</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider hidden sm:table-cell">Payment</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Status</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider hidden md:table-cell">Tax</th>
              <th className="text-right px-6 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {allOrders.slice(0, 20).map((o: {
              id: string; order_number: string; status: string; total_amount: number;
              tax_amount: number | null; created_at: string; payment_method: string;
            }) => (
              <tr key={o.id} className="hover:bg-neutral-50 transition-colors">
                <td className="px-6 py-3 font-medium text-neutral-900">{o.order_number}</td>
                <td className="px-4 py-3 text-neutral-500 text-xs hidden md:table-cell">
                  {new Date(o.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                </td>
                <td className="px-4 py-3 text-neutral-500 capitalize hidden sm:table-cell">{o.payment_method}</td>
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
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
