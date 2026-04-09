import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, Package, CheckCircle, Truck, Clock, XCircle, BookOpen } from "lucide-react";
import { getServerUser } from "@/lib/supabase/server";
import { adminSupabase } from "@/lib/supabase/admin";

type Props = { params: Promise<{ orderId: string }> };

const STATUS_STEPS = ["paid", "processing", "shipped", "delivered"];

const STEP_META: Record<string, { label: string; desc: string; icon: React.ElementType }> = {
  paid:       { label: "Order Placed",    desc: "Payment confirmed",                   icon: CheckCircle },
  processing: { label: "Processing",      desc: "Preparing your books",                icon: Package },
  shipped:    { label: "Shipped",         desc: "On its way to you",                   icon: Truck },
  delivered:  { label: "Delivered",       desc: "Order delivered successfully",         icon: CheckCircle },
};

const STATUS_STYLES: Record<string, string> = {
  pending:    "bg-yellow-100 text-yellow-700",
  paid:       "bg-blue-100 text-blue-700",
  processing: "bg-purple-100 text-purple-700",
  shipped:    "bg-indigo-100 text-indigo-700",
  delivered:  "bg-green-100 text-green-700",
  cancelled:  "bg-red-100 text-red-700",
};

const COVER_COLORS = [
  "bg-orange-200", "bg-amber-200", "bg-blue-200", "bg-green-200",
  "bg-purple-200", "bg-red-200", "bg-gray-300", "bg-teal-200",
];
function coverColor(id: string) {
  const sum = id.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return COVER_COLORS[sum % COVER_COLORS.length];
}

export default async function OrderDetailPage({ params }: Props) {
  const { orderId } = await params;
  const user = await getServerUser();
  if (!user) redirect("/account");

  const { data: order } = await adminSupabase
    .from("orders")
    .select(`
      *,
      order_line_items (
        id, book_format, quantity, unit_price, total_price,
        books ( id, title, slug, cover_image_url, authors(name) )
      )
    `)
    .eq("id", orderId)
    .eq("user_id", user.id)
    .single();

  if (!order) notFound();

  const address = order.shipping_address as {
    first_name: string; last_name: string; address: string;
    city: string; region: string; country: string; email: string; phone: string;
  };

  const isCancelled = order.status === "cancelled";
  const currentStepIdx = STATUS_STEPS.indexOf(order.status);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/orders" className="text-neutral-400 hover:text-neutral-600 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">{order.order_number}</h1>
          <p className="text-sm text-neutral-500 mt-0.5">
            Placed {new Date(order.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>
        <span className={`ml-auto text-xs font-semibold px-3 py-1.5 rounded-full capitalize ${STATUS_STYLES[order.status] ?? "bg-neutral-100 text-neutral-500"}`}>
          {order.status}
        </span>
      </div>

      {/* Tracking timeline */}
      {!isCancelled ? (
        <div className="bg-white border border-neutral-200 rounded-xl p-6">
          <h2 className="font-semibold text-neutral-900 mb-6">Order Tracking</h2>
          <div className="relative">
            {/* Progress bar */}
            <div className="absolute left-5 top-5 bottom-5 w-0.5 bg-neutral-100" />
            <div
              className="absolute left-5 top-5 w-0.5 bg-brand-500 transition-all"
              style={{ height: currentStepIdx >= 0 ? `${(currentStepIdx / (STATUS_STEPS.length - 1)) * 100}%` : "0%" }}
            />
            <div className="space-y-6">
              {STATUS_STEPS.map((step, idx) => {
                const meta = STEP_META[step];
                const Icon = meta.icon;
                const done = currentStepIdx >= idx;
                const active = currentStepIdx === idx;
                return (
                  <div key={step} className="flex items-start gap-4 relative">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 z-10 transition-colors ${
                      done ? "bg-brand-500 text-white" : "bg-neutral-100 text-neutral-400"
                    } ${active ? "ring-4 ring-brand-100" : ""}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="pt-2">
                      <p className={`font-semibold text-sm ${done ? "text-neutral-900" : "text-neutral-400"}`}>{meta.label}</p>
                      <p className={`text-xs mt-0.5 ${done ? "text-neutral-500" : "text-neutral-300"}`}>{meta.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-red-50 border border-red-100 rounded-xl p-5 flex items-center gap-3">
          <XCircle className="w-5 h-5 text-red-500 shrink-0" />
          <div>
            <p className="font-semibold text-red-800">Order Cancelled</p>
            <p className="text-sm text-red-600 mt-0.5">This order was cancelled. Contact support if you need assistance.</p>
          </div>
        </div>
      )}

      {/* Items */}
      <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-neutral-100">
          <h2 className="font-semibold text-neutral-900 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-brand-500" /> Items
          </h2>
        </div>
        <div className="divide-y divide-neutral-100">
          {order.order_line_items?.map((item: {
            id: string; book_format: string; quantity: number;
            unit_price: number; total_price: number;
            books: { id: string; title: string; slug: string; cover_image_url: string | null; authors: { name: string } | null };
          }) => (
            <div key={item.id} className="flex gap-4 px-6 py-4">
              <div className={`${coverColor(item.books.id)} w-14 h-20 rounded-lg shrink-0 overflow-hidden`}>
                {item.books.cover_image_url && (
                  <img src={item.books.cover_image_url} alt={item.books.title} className="w-full h-full object-cover" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <Link href={`/books/${item.books.slug}`} className="font-medium text-neutral-900 hover:text-brand-600 transition-colors line-clamp-1 text-sm">
                  {item.books.title}
                </Link>
                <p className="text-xs text-neutral-500 mt-0.5">{item.books.authors?.name}</p>
                <p className="text-xs text-neutral-400 mt-1">{item.book_format} · Qty {item.quantity} · GHS {item.unit_price.toFixed(2)} each</p>
              </div>
              <p className="font-semibold text-neutral-900 text-sm self-start pt-1">GHS {item.total_price.toFixed(2)}</p>
            </div>
          ))}
        </div>

        {/* Totals */}
        <div className="px-6 py-4 bg-neutral-50 space-y-2 text-sm border-t border-neutral-100">
          <div className="flex justify-between text-neutral-600">
            <span>Subtotal</span><span>GHS {Number(order.subtotal).toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-neutral-600">
            <span>Shipping</span>
            <span className={order.shipping_cost === 0 ? "text-green-600 font-medium" : ""}>
              {order.shipping_cost === 0 ? "FREE" : `GHS ${Number(order.shipping_cost).toFixed(2)}`}
            </span>
          </div>
          <div className="flex justify-between font-bold text-neutral-900 text-base border-t border-neutral-200 pt-2">
            <span>Total</span><span>GHS {Number(order.total_amount).toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Shipping info */}
      <div className="bg-white border border-neutral-200 rounded-xl p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">Deliver to</p>
          <p className="text-sm font-medium text-neutral-800">{address.first_name} {address.last_name}</p>
          <p className="text-sm text-neutral-500">{address.address}</p>
          <p className="text-sm text-neutral-500">{address.city}{address.region ? `, ${address.region}` : ""}</p>
          <p className="text-sm text-neutral-500">{address.country}</p>
          <p className="text-sm text-neutral-500 mt-1">{address.phone}</p>
        </div>
        <div>
          <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">Payment</p>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span className="text-sm font-medium text-green-700">Payment Confirmed</span>
          </div>
          <p className="text-sm text-neutral-500 mt-1 capitalize">{order.payment_method}</p>
          {order.paid_at && (
            <p className="text-xs text-neutral-400 mt-1">
              {new Date(order.paid_at).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
            </p>
          )}
        </div>
      </div>

      <div className="flex gap-3">
        <Link href="/dashboard/orders" className="flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-700 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to orders
        </Link>
        <Link href="/shop" className="ml-auto text-sm text-brand-500 hover:text-brand-600 font-medium transition-colors">
          Continue shopping →
        </Link>
      </div>
    </div>
  );
}
