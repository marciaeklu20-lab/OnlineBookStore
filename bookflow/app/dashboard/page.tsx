import Link from "next/link";
import { ShoppingBag, Heart, BookOpen, ArrowRight, Package, Star } from "lucide-react";
import { getServerUser } from "@/lib/supabase/server";
import { adminSupabase } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";

const STATUS_STYLES: Record<string, string> = {
  pending:    "bg-yellow-100 text-yellow-700",
  paid:       "bg-blue-100 text-blue-700",
  processing: "bg-purple-100 text-purple-700",
  shipped:    "bg-indigo-100 text-indigo-700",
  delivered:  "bg-green-100 text-green-700",
  cancelled:  "bg-red-100 text-red-700",
};

export default async function DashboardPage() {
  const user = await getServerUser();
  if (!user) redirect("/account");

  const [ordersRes, wishlistRes, progressRes, pointsRes] = await Promise.all([
    adminSupabase
      .from("orders")
      .select("id, order_number, status, total_amount, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(5),
    adminSupabase
      .from("wishlists")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id),
    adminSupabase
      .from("reading_progress")
      .select("id, status", { count: "exact" })
      .eq("user_id", user.id),
    adminSupabase
      .from("user_points")
      .select("total_points, level")
      .eq("user_id", user.id)
      .single(),
  ]);

  const orders = ordersRes.data ?? [];
  const wishlistCount = wishlistRes.count ?? 0;
  const readingCount = (progressRes.data ?? []).filter((r: { status: string }) => r.status === "reading").length;
  const completedCount = (progressRes.data ?? []).filter((r: { status: string }) => r.status === "completed").length;
  const points = pointsRes.data?.total_points ?? 0;
  const level = pointsRes.data?.level ?? 1;

  const stats = [
    { label: "Total Orders",    value: orders.length,    icon: ShoppingBag, href: "/dashboard/orders",   color: "bg-blue-50 text-blue-600" },
    { label: "Wishlist",        value: wishlistCount,    icon: Heart,       href: "/dashboard/wishlist",  color: "bg-pink-50 text-pink-600" },
    { label: "Currently Reading", value: readingCount,  icon: BookOpen,    href: "/dashboard/reading",   color: "bg-green-50 text-green-600" },
    { label: "Books Completed", value: completedCount,   icon: Star,        href: "/dashboard/reading",   color: "bg-amber-50 text-amber-600" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">My Dashboard</h1>
        <p className="text-sm text-neutral-500 mt-1">Welcome back! Here&apos;s your reading life at a glance.</p>
      </div>

      {/* Points banner */}
      {points > 0 && (
        <div className="bg-gradient-to-r from-brand-500 to-brand-700 rounded-xl p-5 text-white flex items-center justify-between">
          <div>
            <p className="text-brand-100 text-sm font-medium">Reader Level {level}</p>
            <p className="text-2xl font-bold mt-0.5">{points.toLocaleString()} Points</p>
            <p className="text-brand-200 text-xs mt-1">Keep reading to earn more rewards</p>
          </div>
          <Star className="w-12 h-12 text-brand-300 opacity-50" />
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="bg-white border border-neutral-200 rounded-xl p-4 hover:border-brand-300 transition-colors group">
            <div className={`w-8 h-8 rounded-lg ${s.color} flex items-center justify-center mb-3`}>
              <s.icon className="w-4 h-4" />
            </div>
            <p className="text-2xl font-bold text-neutral-900">{s.value}</p>
            <p className="text-xs text-neutral-500 mt-0.5">{s.label}</p>
          </Link>
        ))}
      </div>

      {/* Recent orders */}
      <div className="bg-white border border-neutral-200 rounded-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
          <h2 className="font-semibold text-neutral-900 flex items-center gap-2">
            <Package className="w-4 h-4 text-brand-500" /> Recent Orders
          </h2>
          <Link href="/dashboard/orders" className="text-sm text-brand-500 hover:text-brand-600 flex items-center gap-1">
            View all <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="py-12 text-center">
            <ShoppingBag className="w-10 h-10 text-neutral-300 mx-auto mb-3" />
            <p className="text-neutral-500 text-sm">No orders yet.</p>
            <Link href="/shop" className="mt-2 inline-block text-brand-500 hover:text-brand-600 text-sm font-medium">
              Browse books →
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-neutral-100">
            {orders.map((order: {
              id: string; order_number: string; status: string;
              total_amount: number; created_at: string;
            }) => (
              <Link
                key={order.id}
                href={`/dashboard/orders/${order.id}`}
                className="flex items-center justify-between px-6 py-4 hover:bg-neutral-50 transition-colors"
              >
                <div>
                  <p className="font-medium text-neutral-900 text-sm">{order.order_number}</p>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    {new Date(order.created_at).toLocaleDateString("en-GB", {
                      day: "numeric", month: "short", year: "numeric",
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${STATUS_STYLES[order.status] ?? "bg-neutral-100 text-neutral-500"}`}>
                    {order.status}
                  </span>
                  <span className="text-sm font-semibold text-neutral-900">
                    GHS {Number(order.total_amount).toFixed(2)}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-neutral-400" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
