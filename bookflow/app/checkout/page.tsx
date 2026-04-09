"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ChevronRight, ShoppingBag, Truck, CreditCard,
  CheckCircle, Loader2, Lock, AlertCircle,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { createOrder } from "./actions";

const COVER_COLORS = [
  "bg-orange-200", "bg-amber-200", "bg-blue-200", "bg-green-200",
  "bg-purple-200", "bg-red-200", "bg-gray-300", "bg-teal-200",
];
function coverColor(id: string) {
  const sum = id.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return COVER_COLORS[sum % COVER_COLORS.length];
}

type Step = "shipping" | "payment" | "review";

const inputClass = "w-full border border-neutral-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500";

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart();
  const router = useRouter();
  const [step, setStep] = useState<Step>("shipping");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const shipping = total >= 200 ? 0 : 20;
  const taxAmount = Math.round(total * 0.175 * 100) / 100; // VAT 12.5% + NHIL 2.5% + GETFund 2.5%
  const grandTotal = total + shipping + taxAmount;

  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", phone: "",
    address: "", city: "", region: "", country: "Ghana",
    cardNumber: "", cardName: "", expiry: "", cvv: "",
    paymentMethod: "card",
  });

  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  if (items.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center">
        <ShoppingBag className="w-14 h-14 text-neutral-300 mx-auto mb-4" />
        <h1 className="text-xl font-bold text-neutral-800">Your cart is empty</h1>
        <Link href="/shop" className="mt-4 inline-block bg-brand-500 text-white px-6 py-3 rounded-full text-sm font-semibold hover:bg-brand-600 transition-colors">
          Browse Books
        </Link>
      </div>
    );
  }

  const steps: { id: Step; label: string; icon: React.ReactNode }[] = [
    { id: "shipping", label: "Shipping", icon: <Truck className="w-4 h-4" /> },
    { id: "payment", label: "Payment",  icon: <CreditCard className="w-4 h-4" /> },
    { id: "review",  label: "Review",   icon: <CheckCircle className="w-4 h-4" /> },
  ];

  const stepIndex = steps.findIndex((s) => s.id === step);

  const handlePlaceOrder = async () => {
    setLoading(true);
    setError(null);
    try {
      const { orderId } = await createOrder({
        items: items.map((i) => ({
          id: i.id, title: i.title, price: i.price,
          format: i.format, quantity: i.quantity,
        })),
        shipping: {
          firstName: form.firstName, lastName: form.lastName,
          email: form.email, phone: form.phone, address: form.address,
          city: form.city, region: form.region, country: form.country,
        },
        paymentMethod: form.paymentMethod,
      });
      clearCart();
      router.push(`/checkout/confirmation/${orderId}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Order failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex items-center gap-2 text-sm text-neutral-500 mb-8">
        <Link href="/cart" className="hover:text-brand-500">Cart</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-neutral-900 font-medium">Checkout</span>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-0 mb-10">
        {steps.map((s, i) => (
          <div key={s.id} className="flex items-center flex-1">
            <button
              type="button"
              onClick={() => i < stepIndex && setStep(s.id)}
              className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                s.id === step ? "text-brand-600" :
                i < stepIndex ? "text-brand-500 cursor-pointer" :
                "text-neutral-400 cursor-default"
              }`}
            >
              <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors ${
                s.id === step ? "border-brand-500 bg-brand-500 text-white" :
                i < stepIndex ? "border-brand-500 bg-brand-50 text-brand-600" :
                "border-neutral-300 text-neutral-400"
              }`}>
                {i < stepIndex ? <CheckCircle className="w-4 h-4" /> : i + 1}
              </span>
              <span className="hidden sm:inline">{s.label}</span>
            </button>
            {i < steps.length - 1 && (
              <div className={`flex-1 h-0.5 mx-3 ${i < stepIndex ? "bg-brand-400" : "bg-neutral-200"}`} />
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form area */}
        <div className="lg:col-span-2 space-y-6">

          {/* ── STEP 1: SHIPPING ── */}
          {step === "shipping" && (
            <div className="bg-white border border-neutral-200 rounded-xl p-6 space-y-5">
              <h2 className="font-bold text-neutral-900 text-lg flex items-center gap-2">
                <Truck className="w-5 h-5 text-brand-500" /> Shipping Details
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">First Name *</label>
                  <input className={inputClass} value={form.firstName} onChange={(e) => set("firstName", e.target.value)} placeholder="Jane" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Last Name *</label>
                  <input className={inputClass} value={form.lastName} onChange={(e) => set("lastName", e.target.value)} placeholder="Doe" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Email Address *</label>
                <input className={inputClass} type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="jane@example.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Phone Number *</label>
                <input className={inputClass} value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+233 20 000 0000" />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Delivery Address *</label>
                <input className={inputClass} value={form.address} onChange={(e) => set("address", e.target.value)} placeholder="Street address, area" />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">City *</label>
                  <input className={inputClass} value={form.city} onChange={(e) => set("city", e.target.value)} placeholder="Accra" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Region</label>
                  <input className={inputClass} value={form.region} onChange={(e) => set("region", e.target.value)} placeholder="Greater Accra" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Country</label>
                  <select className={inputClass} value={form.country} onChange={(e) => set("country", e.target.value)}>
                    <option>Ghana</option>
                    <option>Nigeria</option>
                    <option>Kenya</option>
                    <option>South Africa</option>
                    <option>Other</option>
                  </select>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (!form.firstName || !form.lastName || !form.email || !form.phone || !form.address || !form.city) {
                    setError("Please fill in all required fields.");
                    return;
                  }
                  setError(null);
                  setStep("payment");
                }}
                className="w-full bg-brand-500 hover:bg-brand-600 text-white font-semibold py-3 rounded-xl transition-colors"
              >
                Continue to Payment
              </button>
              {error && <p className="text-sm text-red-600 flex items-center gap-1"><AlertCircle className="w-4 h-4" />{error}</p>}
            </div>
          )}

          {/* ── STEP 2: PAYMENT ── */}
          {step === "payment" && (
            <div className="bg-white border border-neutral-200 rounded-xl p-6 space-y-5">
              <h2 className="font-bold text-neutral-900 text-lg flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-brand-500" /> Payment
              </h2>

              {/* Payment method selector */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: "card",   label: "Card",    icon: "💳" },
                  { id: "momo",   label: "Mobile Money", icon: "📱" },
                  { id: "paypal", label: "PayPal",  icon: "🅿️" },
                ].map((pm) => (
                  <button
                    key={pm.id}
                    type="button"
                    onClick={() => set("paymentMethod", pm.id)}
                    className={`flex flex-col items-center gap-1 p-3 border-2 rounded-xl text-sm font-medium transition-colors ${
                      form.paymentMethod === pm.id
                        ? "border-brand-500 bg-brand-50 text-brand-700"
                        : "border-neutral-200 text-neutral-600 hover:border-neutral-300"
                    }`}
                  >
                    <span className="text-xl">{pm.icon}</span>
                    {pm.label}
                  </button>
                ))}
              </div>

              {/* Card details */}
              {form.paymentMethod === "card" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">Card Number</label>
                    <input
                      className={inputClass}
                      value={form.cardNumber}
                      onChange={(e) => set("cardNumber", e.target.value.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim())}
                      placeholder="1234 5678 9012 3456"
                      maxLength={19}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">Cardholder Name</label>
                    <input className={inputClass} value={form.cardName} onChange={(e) => set("cardName", e.target.value)} placeholder="Jane Doe" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">Expiry Date</label>
                      <input
                        className={inputClass}
                        value={form.expiry}
                        onChange={(e) => {
                          const v = e.target.value.replace(/\D/g, "").slice(0, 4);
                          set("expiry", v.length >= 2 ? `${v.slice(0, 2)}/${v.slice(2)}` : v);
                        }}
                        placeholder="MM/YY"
                        maxLength={5}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">CVV</label>
                      <input className={inputClass} value={form.cvv} onChange={(e) => set("cvv", e.target.value.replace(/\D/g, "").slice(0, 4))} placeholder="123" maxLength={4} />
                    </div>
                  </div>
                </div>
              )}

              {/* Mobile Money */}
              {form.paymentMethod === "momo" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">Mobile Money Number</label>
                    <input className={inputClass} placeholder="+233 20 000 0000" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">Network</label>
                    <select className={inputClass}>
                      <option>MTN Mobile Money</option>
                      <option>Vodafone Cash</option>
                      <option>AirtelTigo Money</option>
                    </select>
                  </div>
                  <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-sm text-amber-700">
                    You will receive a prompt on your phone to confirm the payment.
                  </div>
                </div>
              )}

              {form.paymentMethod === "paypal" && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 text-sm text-blue-700">
                  You will be redirected to PayPal to complete payment after placing your order.
                </div>
              )}

              <div className="flex items-center gap-2 text-xs text-neutral-500 bg-neutral-50 rounded-lg px-3 py-2">
                <Lock className="w-3.5 h-3.5 text-green-500 shrink-0" />
                Your payment information is encrypted and secure. (Simulation — no real charge)
              </div>

              <div className="flex gap-3">
                <button type="button" onClick={() => setStep("shipping")} className="flex-1 border border-neutral-300 text-neutral-600 font-semibold py-3 rounded-xl hover:bg-neutral-50 transition-colors text-sm">
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => { setError(null); setStep("review"); }}
                  className="flex-1 bg-brand-500 hover:bg-brand-600 text-white font-semibold py-3 rounded-xl transition-colors"
                >
                  Review Order
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 3: REVIEW ── */}
          {step === "review" && (
            <div className="bg-white border border-neutral-200 rounded-xl p-6 space-y-6">
              <h2 className="font-bold text-neutral-900 text-lg flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-brand-500" /> Review Your Order
              </h2>

              {/* Shipping summary */}
              <div className="bg-neutral-50 rounded-xl p-4 text-sm space-y-1">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-neutral-700">Shipping to</p>
                  <button type="button" onClick={() => setStep("shipping")} className="text-xs text-brand-500 hover:text-brand-600">Edit</button>
                </div>
                <p className="text-neutral-600">{form.firstName} {form.lastName}</p>
                <p className="text-neutral-600">{form.address}, {form.city}, {form.region}</p>
                <p className="text-neutral-600">{form.country} · {form.phone}</p>
                <p className="text-neutral-500">{form.email}</p>
              </div>

              {/* Payment summary */}
              <div className="bg-neutral-50 rounded-xl p-4 text-sm space-y-1">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-neutral-700">Payment</p>
                  <button type="button" onClick={() => setStep("payment")} className="text-xs text-brand-500 hover:text-brand-600">Edit</button>
                </div>
                <p className="text-neutral-600 capitalize">
                  {form.paymentMethod === "card" ? `Card ending in ${form.cardNumber.replace(/\s/g, "").slice(-4) || "****"}` :
                   form.paymentMethod === "momo" ? "Mobile Money" : "PayPal"}
                </p>
              </div>

              {/* Items */}
              <div className="space-y-3">
                {items.map((item) => (
                  <div key={`${item.id}-${item.format}`} className="flex gap-3">
                    <div className={`${coverColor(item.id)} w-12 h-16 rounded-lg shrink-0 overflow-hidden`}>
                      {item.cover_image_url && <img src={item.cover_image_url} alt={item.title} className="w-full h-full object-cover" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-neutral-900 truncate">{item.title}</p>
                      <p className="text-xs text-neutral-500">{item.format} · qty {item.quantity}</p>
                    </div>
                    <p className="text-sm font-semibold text-neutral-900">GHS {(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" /> {error}
                </div>
              )}

              <button
                type="button"
                onClick={handlePlaceOrder}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-600 disabled:opacity-60 text-white font-bold py-4 rounded-xl transition-colors text-base"
              >
                {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Processing…</> : <>Place Order · GHS {grandTotal.toFixed(2)}</>}
              </button>

              <p className="text-xs text-center text-neutral-400">
                By placing your order you agree to our Terms of Service and Privacy Policy.
              </p>
            </div>
          )}
        </div>

        {/* Order summary sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-neutral-200 rounded-xl p-6 sticky top-24">
            <h3 className="font-bold text-neutral-900 mb-4">Order Summary</h3>
            <div className="space-y-3 mb-4">
              {items.map((item) => (
                <div key={`${item.id}-${item.format}`} className="flex justify-between text-sm">
                  <span className="text-neutral-600 truncate flex-1 mr-2">{item.title} <span className="text-neutral-400">×{item.quantity}</span></span>
                  <span className="font-medium text-neutral-900 shrink-0">GHS {(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-neutral-100 pt-3 space-y-2 text-sm">
              <div className="flex justify-between text-neutral-600">
                <span>Subtotal</span><span>GHS {total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-neutral-600">
                <span>Shipping</span>
                <span className={shipping === 0 ? "text-green-600 font-medium" : ""}>
                  {shipping === 0 ? "FREE" : `GHS ${shipping.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between text-neutral-600">
                <span className="flex flex-col">
                  <span>Tax (17.5%)</span>
                  <span className="text-xs text-neutral-400">VAT + NHIL + GETFund</span>
                </span>
                <span>GHS {taxAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-neutral-900 text-base border-t border-neutral-100 pt-2">
                <span>Total</span><span>GHS {grandTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
