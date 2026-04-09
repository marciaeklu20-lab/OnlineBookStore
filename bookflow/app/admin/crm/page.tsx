import Link from "next/link";
import { adminSupabase } from "@/lib/supabase/admin";
import { Users, MessageSquare, ShoppingBag, Star, Search } from "lucide-react";

export default async function CRMPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const { q, status } = await searchParams;

  // Fetch customers (profiles who have orders or are registered)
  let query = adminSupabase
    .from("profiles")
    .select("id, first_name, last_name, email, created_at, is_admin")
    .order("created_at", { ascending: false })
    .limit(100);

  if (q) {
    query = query.or(`email.ilike.%${q}%,first_name.ilike.%${q}%,last_name.ilike.%${q}%`);
  }

  const { data: profiles } = await query;

  // Get order counts per user
  const { data: orderCounts } = await adminSupabase
    .from("orders")
    .select("user_id")
    .in("user_id", (profiles ?? []).map((p) => p.id));

  // Get open ticket counts
  const { data: tickets } = await adminSupabase
    .from("support_tickets")
    .select("id, status")
    .in("status", ["open", "in_progress"]);

  // Stats
  const totalCustomers = profiles?.length ?? 0;
  const ordersMap = (orderCounts ?? []).reduce((acc: Record<string, number>, o) => {
    acc[o.user_id] = (acc[o.user_id] ?? 0) + 1;
    return acc;
  }, {});

  const openTickets = tickets?.length ?? 0;
  const activeCustomers = Object.keys(ordersMap).length;

  const customers = (profiles ?? []).map((p) => ({
    ...p,
    orderCount: ordersMap[p.id] ?? 0,
    name: [p.first_name, p.last_name].filter(Boolean).join(" ") || p.email,
  }));

  const filtered = status === "active"
    ? customers.filter((c) => c.orderCount > 0)
    : status === "new"
    ? customers.filter((c) => c.orderCount === 0)
    : customers;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">CRM — Customer Management</h1>
        <p className="text-sm text-neutral-500 mt-1">View and manage customer relationships</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Customers", value: totalCustomers, icon: Users, color: "bg-blue-50 text-blue-600" },
          { label: "Active Buyers", value: activeCustomers, icon: ShoppingBag, color: "bg-green-50 text-green-600" },
          { label: "Open Tickets", value: openTickets, icon: MessageSquare, color: "bg-amber-50 text-amber-600" },
          { label: "New (no orders)", value: totalCustomers - activeCustomers, icon: Star, color: "bg-purple-50 text-purple-600" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white border border-neutral-200 rounded-xl p-4">
            <div className={`w-8 h-8 rounded-lg ${color} flex items-center justify-center mb-3`}>
              <Icon className="w-4 h-4" />
            </div>
            <p className="text-2xl font-bold text-neutral-900">{value}</p>
            <p className="text-xs text-neutral-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Filters & search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <form className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            name="q"
            defaultValue={q}
            placeholder="Search by name or email…"
            className="w-full pl-9 pr-4 py-2.5 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:border-brand-400 bg-white"
          />
        </form>
        <div className="flex gap-2">
          {[
            { label: "All", value: "" },
            { label: "Active", value: "active" },
            { label: "New", value: "new" },
          ].map(({ label, value }) => (
            <Link
              key={value}
              href={`/admin/crm?${new URLSearchParams({ ...(q ? { q } : {}), ...(value ? { status: value } : {}) }).toString()}`}
              className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                (status ?? "") === value
                  ? "bg-brand-500 text-white"
                  : "bg-white border border-neutral-200 text-neutral-600 hover:border-brand-300"
              }`}
            >
              {label}
            </Link>
          ))}
        </div>
      </div>

      {/* Customer table */}
      <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-100 bg-neutral-50">
              <th className="text-left px-6 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Customer</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider hidden sm:table-cell">Email</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Orders</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider hidden md:table-cell">Joined</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Type</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-neutral-400 text-sm">No customers found.</td>
              </tr>
            ) : filtered.map((c) => (
              <tr key={c.id} className="hover:bg-neutral-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 font-bold text-xs flex items-center justify-center shrink-0">
                      {c.name.slice(0, 2).toUpperCase()}
                    </div>
                    <span className="font-medium text-neutral-900">{c.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-neutral-500 hidden sm:table-cell">{c.email}</td>
                <td className="px-4 py-4 text-center">
                  <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${
                    c.orderCount > 0 ? "bg-green-100 text-green-700" : "bg-neutral-100 text-neutral-400"
                  }`}>{c.orderCount}</span>
                </td>
                <td className="px-4 py-4 text-neutral-400 text-xs hidden md:table-cell">
                  {new Date(c.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                </td>
                <td className="px-4 py-4">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    c.is_admin ? "bg-red-100 text-red-700" :
                    c.orderCount > 0 ? "bg-green-100 text-green-700" :
                    "bg-neutral-100 text-neutral-500"
                  }`}>
                    {c.is_admin ? "Admin" : c.orderCount > 0 ? "Customer" : "Registered"}
                  </span>
                </td>
                <td className="px-4 py-4 text-right">
                  <Link href={`/admin/crm/${c.id}`} className="text-xs text-brand-500 hover:text-brand-600 font-medium">
                    View →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Support tickets shortcut */}
      <div className="flex justify-end">
        <Link
          href="/admin/crm/tickets"
          className="flex items-center gap-2 text-sm text-brand-500 hover:text-brand-600 font-medium"
        >
          <MessageSquare className="w-4 h-4" />
          Manage Support Tickets ({openTickets} open) →
        </Link>
      </div>
    </div>
  );
}
