import Link from "next/link";
import { redirect } from "next/navigation";
import { ShoppingBag, ArrowRight, Package } from "lucide-react";
import { getServerUser } from "@/lib/supabase/server";
import { adminSupabase } from "@/lib/supabase/admin";

const STATUS_STYLES: Record<string, string> = {
  pending:    "bg-yellow-100 text-yellow-700",
  paid:       "bg-blue-100 text-blue-700",
  processing: "bg-purple-100 text-purple-700",
  shipped:    "bg-indigo-100 text-indigo-700",
  delivered:  "bg-green-100 text-green-700",
  cancelled:  "bg-red-100 text-red-700",
};

export default async function OrdersPage() {
  const user = await getServerUser();
  if (!user) redirect("/account");

  const { data: orders } = await adminSupabase
    .from("orders")
    .select("id, order_number, status, total_amount, created_at, shipping_cost, subtotal")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const list = orders ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">My Orders</h1>
        <p className="text-sm text-neutral-500 mt-1">{list.length} order{list.length !== 1 ? "s" : ""} placed</p>
      </div>

      {list.length === 0 ? (
        <div className="bg-white border border-neutral-200 rounded-xl py-16 text-center">
          <ShoppingBag className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
          <p className="text-neutral-500 font-medium">No orders yet</p>
          <Link href="/shop" className="mt-3 inline-block text-brand-500 hover:text-brand-600 text-sm font-medium">
            Browse books →
          </Link>
        </div>
      ) : (
        <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
          <div className="divide-y divide-neutral-100">
            {list.map((order: {
              id: string; order_number: string; status: string;
              total_amount: number; created_at: string;
            }) => (
              <Link
                key={order.id}
                href={`/dashboard/orders/${order.id}`}
                className="flex items-center justify-between px-6 py-5 hover:bg-neutral-50 transition-colors group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-brand-50 flex items-center justify-center shrink-0">
                    <Package className="w-5 h-5 text-brand-500" />
                  </div>
                  <div>
                    <p className="font-semibold text-neutral-900 text-sm">{order.order_number}</p>
                    <p className="text-xs text-neutral-400 mt-0.5">
                      {new Date(order.created_at).toLocaleDateString("en-GB", {
                        day: "numeric", month: "long", year: "numeric",
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${STATUS_STYLES[order.status] ?? "bg-neutral-100 text-neutral-500"}`}>
                    {order.status}
                  </span>
                  <span className="text-sm font-bold text-neutral-900 w-24 text-right">
                    GHS {Number(order.total_amount).toFixed(2)}
                  </span>
                  <ArrowRight className="w-4 h-4 text-neutral-300 group-hover:text-brand-500 transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
