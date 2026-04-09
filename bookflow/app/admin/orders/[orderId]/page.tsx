import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Package, Truck, CheckCircle, Clock, XCircle } from "lucide-react";
import { adminSupabase } from "@/lib/supabase/admin";
import { updateOrderStatus, addTrackingNumber } from "../actions";

type Props = { params: Promise<{ orderId: string }> };

const STATUS_FLOW = ["pending", "paid", "processing", "shipped", "delivered"];

const STATUS_STYLES: Record<string, string> = {
  pending:    "bg-yellow-100 text-yellow-700",
  paid:       "bg-blue-100 text-blue-700",
  processing: "bg-purple-100 text-purple-700",
  shipped:    "bg-indigo-100 text-indigo-700",
  delivered:  "bg-green-100 text-green-700",
  cancelled:  "bg-red-100 text-red-700",
};

const STEP_META: Record<string, { label: string; icon: React.ElementType }> = {
  pending:    { label: "Order Received",  icon: Clock },
  paid:       { label: "Payment Confirmed", icon: CheckCircle },
  processing: { label: "Processing",      icon: Package },
  shipped:    { label: "Shipped",          icon: Truck },
  delivered:  { label: "Delivered",        icon: CheckCircle },
};

export default async function AdminOrderDetailPage({ params }: Props) {
  const { orderId } = await params;

  const { data: order } = await adminSupabase
    .from("orders")
    .select(`
      *,
      order_line_items (
        id, book_format, quantity, unit_price, total_price,
        books ( id, title, slug, cover_image_url, authors(name) )
      ),
      profiles!orders_user_id_fkey ( id, first_name, last_name, email, phone )
    `)
    .eq("id", orderId)
    .single();

  if (!order) notFound();

  const address = order.shipping_address as {
    first_name: string; last_name: string; address: string;
    city: string; region: string; country: string; email: string; phone: string;
  };

  const currentIdx = STATUS_FLOW.indexOf(order.status);
  const isCancelled = order.status === "cancelled";

  // Which statuses can we move to from current?
  const nextStatuses = isCancelled
    ? []
    : STATUS_FLOW.filter((_, i) => i > currentIdx);

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/admin/orders" className="text-neutral-400 hover:text-neutral-600">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-neutral-900">{order.order_number}</h1>
          <p className="text-sm text-neutral-500 mt-0.5">
            {new Date(order.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
          </p>
        </div>
        <span className={`text-xs font-bold px-3 py-1.5 rounded-full capitalize ${STATUS_STYLES[order.status] ?? "bg-neutral-100 text-neutral-500"}`}>
          {order.status}
        </span>
        <Link href={`/admin/finance/invoices/${orderId}`} className="text-sm text-brand-500 hover:text-brand-600 font-medium border border-brand-200 px-3 py-1.5 rounded-lg">
          View Invoice
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: timeline + actions */}
        <div className="space-y-4">
          {/* Order timeline */}
          <div className="bg-white border border-neutral-200 rounded-xl p-5">
            <h2 className="font-semibold text-neutral-900 text-sm mb-5">Order Timeline</h2>
            {isCancelled ? (
              <div className="flex items-center gap-3 text-red-600">
                <XCircle className="w-5 h-5" />
                <span className="text-sm font-semibold">Order Cancelled</span>
              </div>
            ) : (
              <div className="relative space-y-4">
                <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-neutral-100" />
                {STATUS_FLOW.map((s, idx) => {
                  const meta = STEP_META[s];
                  const Icon = meta.icon;
                  const done = currentIdx >= idx;
                  const active = currentIdx === idx;
                  return (
                    <div key={s} className="flex items-start gap-3 relative">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 ${
                        done ? "bg-brand-500 text-white" : "bg-neutral-100 text-neutral-400"
                      } ${active ? "ring-4 ring-brand-100" : ""}`}>
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div className="pt-1">
                        <p className={`text-sm font-semibold ${done ? "text-neutral-900" : "text-neutral-400"}`}>{meta.label}</p>
                        {s === "shipped" && order.tracking_number && done && (
                          <p className="text-xs text-neutral-500 mt-0.5">Tracking: {order.tracking_number}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Update status */}
          {nextStatuses.length > 0 && (
            <div className="bg-white border border-neutral-200 rounded-xl p-5">
              <h2 className="font-semibold text-neutral-900 text-sm mb-3">Update Status</h2>
              <div className="space-y-2">
                {nextStatuses.map((s) => (
                  <form key={s} action={updateOrderStatus}>
                    <input type="hidden" name="orderId" value={orderId} />
                    <input type="hidden" name="status" value={s} />
                    <button
                      type="submit"
                      className="w-full text-left px-3 py-2.5 rounded-lg border border-neutral-200 text-sm font-medium text-neutral-700 hover:border-brand-400 hover:bg-brand-50 hover:text-brand-700 transition-colors capitalize"
                    >
                      Mark as {s} →
                    </button>
                  </form>
                ))}
                {!isCancelled && (
                  <form action={updateOrderStatus}>
                    <input type="hidden" name="orderId" value={orderId} />
                    <input type="hidden" name="status" value="cancelled" />
                    <button
                      type="submit"
                      className="w-full text-left px-3 py-2.5 rounded-lg border border-red-100 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                    >
                      Cancel Order
                    </button>
                  </form>
                )}
              </div>
            </div>
          )}

          {/* Tracking number */}
          {!isCancelled && (order.status === "processing" || order.status === "shipped" || order.status === "delivered") && (
            <div className="bg-white border border-neutral-200 rounded-xl p-5">
              <h2 className="font-semibold text-neutral-900 text-sm mb-3">Shipping Tracking</h2>
              <form action={addTrackingNumber} className="space-y-3">
                <input type="hidden" name="orderId" value={orderId} />
                <div>
                  <label className="block text-xs font-medium text-neutral-600 mb-1">Carrier</label>
                  <select
                    name="carrier"
                    defaultValue={order.shipping_carrier ?? ""}
                    className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-400"
                  >
                    <option value="">Select carrier…</option>
                    <option>DHL</option>
                    <option>FedEx</option>
                    <option>GhanaPost</option>
                    <option>Jumia Logistics</option>
                    <option>Courier Plus</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-600 mb-1">Tracking Number</label>
                  <input
                    name="tracking"
                    defaultValue={order.tracking_number ?? ""}
                    placeholder="e.g. JD0001234567890"
                    className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-400"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold py-2 rounded-lg transition-colors"
                >
                  Save Tracking
                </button>
              </form>
            </div>
          )}

          {/* Customer info */}
          <div className="bg-white border border-neutral-200 rounded-xl p-5">
            <h2 className="font-semibold text-neutral-900 text-sm mb-3">Customer</h2>
            {order.profiles ? (
              <>
                <p className="text-sm font-medium text-neutral-900">
                  {[order.profiles.first_name, order.profiles.last_name].filter(Boolean).join(" ") || order.profiles.email}
                </p>
                <p className="text-sm text-neutral-500">{order.profiles.email}</p>
                {order.profiles.phone && <p className="text-sm text-neutral-500">{order.profiles.phone}</p>}
                <Link href={`/admin/crm/${order.profiles.id}`} className="mt-2 inline-block text-xs text-brand-500 hover:text-brand-600 font-medium">
                  View CRM profile →
                </Link>
              </>
            ) : (
              <p className="text-sm text-neutral-500">Guest checkout</p>
            )}
          </div>
        </div>

        {/* Right: items + financials */}
        <div className="lg:col-span-2 space-y-4">
          {/* Items */}
          <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-neutral-100">
              <h2 className="font-semibold text-neutral-900 text-sm">Items Ordered</h2>
            </div>
            <div className="divide-y divide-neutral-100">
              {order.order_line_items?.map((item: {
                id: string; book_format: string; quantity: number;
                unit_price: number; total_price: number;
                books: { id: string; title: string; slug: string; cover_image_url: string | null; authors: { name: string } | null };
              }) => (
                <div key={item.id} className="flex items-center gap-4 px-5 py-3">
                  <div className="w-10 h-14 bg-neutral-100 rounded shrink-0 overflow-hidden">
                    {item.books.cover_image_url && (
                      <img src={item.books.cover_image_url} alt={item.books.title} className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-neutral-900 line-clamp-1">{item.books.title}</p>
                    <p className="text-xs text-neutral-500">{item.books.authors?.name}</p>
                    <p className="text-xs text-neutral-400 mt-0.5">{item.book_format} · qty {item.quantity} · GHS {item.unit_price.toFixed(2)} each</p>
                  </div>
                  <p className="font-semibold text-neutral-900 text-sm shrink-0">GHS {item.total_price.toFixed(2)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Financials */}
          <div className="bg-white border border-neutral-200 rounded-xl p-5">
            <h2 className="font-semibold text-neutral-900 text-sm mb-4">Order Summary</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-neutral-600">
                <span>Subtotal</span><span>GHS {Number(order.subtotal).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-neutral-600">
                <span>Shipping</span>
                <span>{Number(order.shipping_cost) === 0 ? "FREE" : `GHS ${Number(order.shipping_cost).toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between text-neutral-600">
                <span>Tax (17.5%)</span>
                <span>GHS {Number(order.tax_amount ?? 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-neutral-900 text-base border-t border-neutral-200 pt-2">
                <span>Total</span><span>GHS {Number(order.total_amount).toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Shipping address */}
          <div className="bg-white border border-neutral-200 rounded-xl p-5">
            <h2 className="font-semibold text-neutral-900 text-sm mb-3">Delivery Address</h2>
            <p className="text-sm font-medium text-neutral-900">{address.first_name} {address.last_name}</p>
            <p className="text-sm text-neutral-600">{address.address}</p>
            <p className="text-sm text-neutral-600">{address.city}{address.region ? `, ${address.region}` : ""}</p>
            <p className="text-sm text-neutral-600">{address.country}</p>
            <p className="text-sm text-neutral-500 mt-1">{address.phone}</p>
            <p className="text-sm text-neutral-500">{address.email}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
