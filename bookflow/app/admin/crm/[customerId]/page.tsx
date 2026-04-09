import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ShoppingBag, BookOpen, Heart, MessageSquare, Star } from "lucide-react";
import { adminSupabase } from "@/lib/supabase/admin";

type Props = { params: Promise<{ customerId: string }> };

const STATUS_STYLES: Record<string, string> = {
  pending:    "bg-yellow-100 text-yellow-700",
  paid:       "bg-blue-100 text-blue-700",
  processing: "bg-purple-100 text-purple-700",
  shipped:    "bg-indigo-100 text-indigo-700",
  delivered:  "bg-green-100 text-green-700",
  cancelled:  "bg-red-100 text-red-700",
};

const TICKET_STATUS: Record<string, string> = {
  open:        "bg-red-100 text-red-700",
  in_progress: "bg-amber-100 text-amber-700",
  resolved:    "bg-green-100 text-green-700",
  closed:      "bg-neutral-100 text-neutral-500",
};

export default async function CustomerDetailPage({ params }: Props) {
  const { customerId } = await params;

  const [profileRes, ordersRes, wishlistRes, progressRes, ticketsRes, pointsRes] = await Promise.all([
    adminSupabase.from("profiles").select("*").eq("id", customerId).single(),
    adminSupabase
      .from("orders")
      .select("id, order_number, status, total_amount, created_at")
      .eq("user_id", customerId)
      .order("created_at", { ascending: false }),
    adminSupabase
      .from("wishlists")
      .select("id", { count: "exact", head: true })
      .eq("user_id", customerId),
    adminSupabase
      .from("reading_progress")
      .select("id, status")
      .eq("user_id", customerId),
    adminSupabase
      .from("support_tickets")
      .select("id, topic, message, status, created_at")
      .eq("user_id", customerId)
      .order("created_at", { ascending: false }),
    adminSupabase
      .from("user_points")
      .select("total_points, level")
      .eq("user_id", customerId)
      .single(),
  ]);

  if (!profileRes.data) notFound();
  const p = profileRes.data;
  const name = [p.first_name, p.last_name].filter(Boolean).join(" ") || p.email;
  const orders = ordersRes.data ?? [];
  const tickets = ticketsRes.data ?? [];
  const reading = progressRes.data ?? [];
  const totalSpend = orders.reduce((acc: number, o: { total_amount: number }) => acc + Number(o.total_amount), 0);

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center gap-3">
        <Link href="/admin/crm" className="text-neutral-400 hover:text-neutral-600">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-brand-100 text-brand-700 font-bold text-lg flex items-center justify-center">
            {name.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <h1 className="text-xl font-bold text-neutral-900">{name}</h1>
            <p className="text-sm text-neutral-500">{p.email}</p>
          </div>
        </div>
        {p.is_admin && (
          <span className="ml-auto text-xs font-semibold px-2.5 py-1 rounded-full bg-red-100 text-red-700">Admin</span>
        )}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Orders", value: orders.length, icon: ShoppingBag, color: "bg-blue-50 text-blue-600" },
          { label: "Total Spend", value: `GHS ${totalSpend.toFixed(2)}`, icon: Star, color: "bg-green-50 text-green-600" },
          { label: "Wishlist", value: wishlistRes.count ?? 0, icon: Heart, color: "bg-pink-50 text-pink-600" },
          { label: "Books Tracked", value: reading.length, icon: BookOpen, color: "bg-amber-50 text-amber-600" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white border border-neutral-200 rounded-xl p-4">
            <div className={`w-7 h-7 rounded-lg ${color} flex items-center justify-center mb-2`}>
              <Icon className="w-3.5 h-3.5" />
            </div>
            <p className="text-lg font-bold text-neutral-900">{value}</p>
            <p className="text-xs text-neutral-500">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile details */}
        <div className="bg-white border border-neutral-200 rounded-xl p-5 space-y-3">
          <h2 className="font-semibold text-neutral-900 text-sm">Customer Details</h2>
          {[
            { label: "Phone", value: p.phone ?? "—" },
            { label: "Bio", value: p.bio ?? "—" },
            { label: "Reader Level", value: `Level ${pointsRes.data?.level ?? 1} · ${(pointsRes.data?.total_points ?? 0).toLocaleString()} pts` },
            { label: "Joined", value: new Date(p.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) },
            { label: "Reading Status", value: `${reading.filter((r: { status: string }) => r.status === "reading").length} reading · ${reading.filter((r: { status: string }) => r.status === "completed").length} completed` },
          ].map(({ label, value }) => (
            <div key={label} className="flex justify-between text-sm">
              <span className="text-neutral-500">{label}</span>
              <span className="text-neutral-900 font-medium text-right max-w-[60%]">{value}</span>
            </div>
          ))}
        </div>

        {/* Support tickets */}
        <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100">
            <h2 className="font-semibold text-neutral-900 text-sm flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-brand-500" /> Support Tickets
            </h2>
            <Link href="/admin/crm/tickets" className="text-xs text-brand-500 hover:text-brand-600">View all</Link>
          </div>
          {tickets.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-neutral-400">No tickets raised</p>
          ) : (
            <div className="divide-y divide-neutral-100">
              {tickets.slice(0, 4).map((t: { id: string; topic: string | null; message: string; status: string; created_at: string }) => (
                <div key={t.id} className="px-5 py-3">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium text-neutral-900 line-clamp-1">{t.topic ?? "General"}</p>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 ${TICKET_STATUS[t.status] ?? "bg-neutral-100 text-neutral-500"}`}>
                      {t.status.replace("_", " ")}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-500 mt-0.5 line-clamp-1">{t.message}</p>
                  <p className="text-xs text-neutral-400 mt-1">
                    {new Date(t.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Order history */}
      <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-neutral-100">
          <h2 className="font-semibold text-neutral-900 text-sm flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-brand-500" /> Order History
          </h2>
        </div>
        {orders.length === 0 ? (
          <p className="px-6 py-10 text-center text-sm text-neutral-400">No orders placed</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-100 bg-neutral-50">
                <th className="text-left px-6 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Order</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Date</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Status</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {orders.map((o: { id: string; order_number: string; status: string; total_amount: number; created_at: string }) => (
                <tr key={o.id} className="hover:bg-neutral-50">
                  <td className="px-6 py-3 font-medium text-neutral-900">{o.order_number}</td>
                  <td className="px-4 py-3 text-neutral-500 text-xs">
                    {new Date(o.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${STATUS_STYLES[o.status] ?? "bg-neutral-100 text-neutral-500"}`}>
                      {o.status}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-right font-semibold text-neutral-900">
                    GHS {Number(o.total_amount).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
