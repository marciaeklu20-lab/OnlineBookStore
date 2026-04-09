import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { CheckCircle, Package, BookOpen, ArrowRight, Printer } from "lucide-react";
import { getOrderById } from "../../actions";
import { getServerUser } from "@/lib/supabase/server";

type Props = { params: Promise<{ orderId: string }> };

const COVER_COLORS = [
  "bg-orange-200", "bg-amber-200", "bg-blue-200", "bg-green-200",
  "bg-purple-200", "bg-red-200", "bg-gray-300", "bg-teal-200",
];
function coverColor(id: string) {
  const sum = id.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return COVER_COLORS[sum % COVER_COLORS.length];
}

export default async function ConfirmationPage({ params }: Props) {
  const { orderId } = await params;
  const user = await getServerUser();
  if (!user) redirect("/account");

  const order = await getOrderById(orderId);
  if (!order) notFound();

  const address = order.shipping_address as {
    first_name: string; last_name: string; address: string;
    city: string; region: string; country: string; email: string; phone: string;
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      {/* Success banner */}
      <div className="text-center mb-10">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-10 h-10 text-green-500" />
        </div>
        <h1 className="text-3xl font-bold text-neutral-900">Order Confirmed!</h1>
        <p className="text-neutral-500 mt-2">
          Thank you, {address.first_name}. Your order has been placed successfully.
        </p>
        <div className="inline-flex items-center gap-2 bg-neutral-100 rounded-full px-4 py-2 mt-4">
          <span className="text-sm text-neutral-500">Order number:</span>
          <span className="font-bold text-neutral-900">{order.order_number}</span>
        </div>
      </div>

      {/* Order details card */}
      <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden mb-6">
        {/* Items */}
        <div className="p-6 border-b border-neutral-100">
          <h2 className="font-semibold text-neutral-900 mb-4 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-brand-500" /> Items Ordered
          </h2>
          <div className="space-y-4">
            {order.order_line_items?.map((item: {
              id: string; book_format: string; quantity: number;
              unit_price: number; total_price: number;
              books: { id: string; title: string; slug: string; cover_image_url: string | null; authors: { name: string } | null };
            }) => (
              <div key={item.id} className="flex gap-4">
                <div className={`${coverColor(item.books.id)} w-14 h-20 rounded-lg shrink-0 overflow-hidden`}>
                  {item.books.cover_image_url && (
                    <img src={item.books.cover_image_url} alt={item.books.title} className="w-full h-full object-cover" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <Link href={`/books/${item.books.slug}`} className="font-medium text-neutral-900 hover:text-brand-600 transition-colors line-clamp-1">
                    {item.books.title}
                  </Link>
                  <p className="text-sm text-neutral-500 mt-0.5">{item.books.authors?.name}</p>
                  <p className="text-xs text-neutral-400 mt-1">
                    {item.book_format} · Qty {item.quantity}
                  </p>
                </div>
                <p className="font-semibold text-neutral-900 text-sm">GHS {item.total_price.toFixed(2)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Totals */}
        <div className="px-6 py-4 bg-neutral-50 border-b border-neutral-100 space-y-2 text-sm">
          <div className="flex justify-between text-neutral-600">
            <span>Subtotal</span><span>GHS {order.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-neutral-600">
            <span>Shipping</span>
            <span className={order.shipping_cost === 0 ? "text-green-600 font-medium" : ""}>
              {order.shipping_cost === 0 ? "FREE" : `GHS ${order.shipping_cost.toFixed(2)}`}
            </span>
          </div>
          <div className="flex justify-between font-bold text-neutral-900 text-base border-t border-neutral-200 pt-2">
            <span>Total Paid</span><span>GHS {order.total_amount.toFixed(2)}</span>
          </div>
        </div>

        {/* Shipping & Payment info */}
        <div className="grid grid-cols-2 divide-x divide-neutral-100">
          <div className="p-5">
            <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">Deliver to</p>
            <p className="text-sm font-medium text-neutral-800">{address.first_name} {address.last_name}</p>
            <p className="text-sm text-neutral-500">{address.address}</p>
            <p className="text-sm text-neutral-500">{address.city}{address.region ? `, ${address.region}` : ""}</p>
            <p className="text-sm text-neutral-500">{address.country}</p>
          </div>
          <div className="p-5">
            <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">Payment</p>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-sm font-medium text-green-700">Payment Confirmed</span>
            </div>
            <p className="text-sm text-neutral-500 mt-1 capitalize">{order.payment_method}</p>
            <p className="text-xs text-neutral-400 mt-1">
              {new Date(order.paid_at).toLocaleDateString("en-GB", {
                day: "numeric", month: "long", year: "numeric",
              })}
            </p>
          </div>
        </div>
      </div>

      {/* Delivery status */}
      <div className="bg-brand-50 border border-brand-100 rounded-xl p-5 mb-6">
        <div className="flex items-center gap-3">
          <Package className="w-5 h-5 text-brand-500 shrink-0" />
          <div>
            <p className="font-semibold text-brand-800">Your order is being processed</p>
            <p className="text-sm text-brand-600 mt-0.5">
              A confirmation email will be sent to <strong>{address.email}</strong>.
              Physical books are typically delivered within 3–5 business days.
            </p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          href="/dashboard/orders"
          className="flex-1 flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-semibold py-3 rounded-xl transition-colors text-sm"
        >
          View My Orders <ArrowRight className="w-4 h-4" />
        </Link>
        <button
          type="button"
          onClick={() => window.print()}
          className="flex-1 flex items-center justify-center gap-2 border border-neutral-300 text-neutral-700 hover:bg-neutral-50 font-semibold py-3 rounded-xl transition-colors text-sm"
        >
          <Printer className="w-4 h-4" /> Print Receipt
        </button>
        <Link
          href="/shop"
          className="flex-1 flex items-center justify-center gap-2 border border-neutral-300 text-neutral-700 hover:bg-neutral-50 font-semibold py-3 rounded-xl transition-colors text-sm"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}
