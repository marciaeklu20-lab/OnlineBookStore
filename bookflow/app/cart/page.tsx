"use client";

import Link from "next/link";
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from "lucide-react";
import { useCart } from "@/context/CartContext";

const COVER_COLORS = [
  "bg-orange-200", "bg-amber-200", "bg-blue-200", "bg-green-200",
  "bg-purple-200", "bg-red-200", "bg-gray-300", "bg-teal-200",
];

function coverColor(id: string) {
  const sum = id.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return COVER_COLORS[sum % COVER_COLORS.length];
}

export default function CartPage() {
  const { items, count, total, removeItem, updateQty, clearCart } = useCart();

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <ShoppingBag className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-neutral-800">Your cart is empty</h1>
        <p className="text-neutral-500 mt-2">Looks like you have not added any books yet.</p>
        <Link
          href="/shop"
          className="mt-6 inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-semibold px-6 py-3 rounded-full transition-colors"
        >
          Browse Books <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-neutral-900">
          Your Cart <span className="text-neutral-400 font-normal text-xl">({count} item{count !== 1 ? "s" : ""})</span>
        </h1>
        <button
          type="button"
          onClick={clearCart}
          className="text-sm text-neutral-400 hover:text-red-500 transition-colors"
        >
          Clear all
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div
              key={`${item.id}-${item.format}`}
              className="flex gap-4 bg-white border border-neutral-200 rounded-xl p-4"
            >
              {/* Cover */}
              <Link href={`/books/${item.slug}`} className="shrink-0">
                <div className={`${coverColor(item.id)} w-16 h-24 rounded-lg overflow-hidden`}>
                  {item.cover_image_url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.cover_image_url} alt={item.title} className="w-full h-full object-cover" />
                  )}
                </div>
              </Link>

              {/* Details */}
              <div className="flex-1 min-w-0">
                <Link href={`/books/${item.slug}`}>
                  <p className="font-semibold text-neutral-900 hover:text-brand-600 transition-colors line-clamp-1">
                    {item.title}
                  </p>
                </Link>
                <p className="text-sm text-neutral-500 mt-0.5">{item.author}</p>
                <span className="inline-block mt-1 text-xs bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded-full">
                  {item.format}
                </span>

                <div className="flex items-center justify-between mt-3">
                  {/* Quantity */}
                  <div className="flex items-center gap-2 border border-neutral-200 rounded-lg">
                    <button
                      type="button"
                      onClick={() => updateQty(item.id, item.format, item.quantity - 1)}
                      className="p-1.5 hover:bg-neutral-100 rounded-l-lg transition-colors"
                    >
                      <Minus className="w-3.5 h-3.5 text-neutral-600" />
                    </button>
                    <span className="text-sm font-semibold w-6 text-center">{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() => updateQty(item.id, item.format, item.quantity + 1)}
                      className="p-1.5 hover:bg-neutral-100 rounded-r-lg transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5 text-neutral-600" />
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    <p className="font-bold text-neutral-900">
                      GHS {(item.price * item.quantity).toFixed(2)}
                    </p>
                    <button
                      type="button"
                      onClick={() => removeItem(item.id, item.format)}
                      className="text-neutral-300 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-neutral-200 rounded-xl p-6 sticky top-24">
            <h2 className="text-lg font-bold text-neutral-900 mb-5">Order Summary</h2>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-neutral-600">
                <span>Subtotal ({count} item{count !== 1 ? "s" : ""})</span>
                <span>GHS {total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-neutral-600">
                <span>Shipping</span>
                <span className="text-green-600 font-medium">
                  {total >= 200 ? "FREE" : "GHS 20.00"}
                </span>
              </div>
              {total < 200 && (
                <p className="text-xs text-neutral-400 bg-neutral-50 rounded-lg px-3 py-2">
                  Add GHS {(200 - total).toFixed(2)} more for free shipping
                </p>
              )}
              <div className="border-t border-neutral-100 pt-3 flex justify-between font-bold text-neutral-900 text-base">
                <span>Total</span>
                <span>GHS {(total + (total >= 200 ? 0 : 20)).toFixed(2)}</span>
              </div>
            </div>

            <Link
              href="/checkout"
              className="mt-6 w-full flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-semibold py-3.5 rounded-xl transition-colors"
            >
              Proceed to Checkout <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/shop"
              className="mt-3 w-full flex items-center justify-center text-sm text-neutral-500 hover:text-brand-500 transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
