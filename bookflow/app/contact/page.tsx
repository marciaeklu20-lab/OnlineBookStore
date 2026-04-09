"use client";

import { useState } from "react";
import { Mail, Phone, MapPin, Clock, MessageSquare, ChevronDown, ChevronUp, CheckCircle, Send } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const FAQS = [
  {
    q: "How long does delivery take?",
    a: "Physical books are typically delivered within 3–5 business days within Accra. Other regions may take 5–10 business days. Digital formats (PDF/ePub) are available immediately after purchase.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept Mobile Money (MTN MoMo, Vodafone Cash, AirtelTigo Money), major debit/credit cards, and PayPal. All transactions are secured and processed instantly.",
  },
  {
    q: "Can I return or exchange a book?",
    a: "Physical books in their original condition can be returned within 14 days of delivery for a full refund or exchange. Digital purchases are non-refundable once downloaded.",
  },
  {
    q: "How do I track my order?",
    a: "Once your order is shipped, you can track it from your dashboard under 'My Orders'. You'll see a real-time status from order placement through to delivery.",
  },
  {
    q: "Do you ship outside Ghana?",
    a: "Currently we only ship within Ghana. International shipping is on our roadmap — sign up to our newsletter to be notified when it launches.",
  },
  {
    q: "How do I cancel an order?",
    a: "You can cancel an order before it moves to the 'Processing' stage. Go to My Orders, open the order, and use the cancel option. Once processing has begun, cancellation is no longer available.",
  },
  {
    q: "Are there discounts for bulk or institutional orders?",
    a: "Yes! We offer special pricing for schools, universities, and businesses ordering 10+ copies. Contact us via email or phone to discuss bulk order pricing.",
  },
  {
    q: "How do I access a digital book I purchased?",
    a: "After purchase, digital books appear in your Reading List on the dashboard. You can download the file directly from there in PDF or ePub format.",
  },
];

const TOPICS = [
  "Order Issue", "Delivery Query", "Product Information",
  "Account Help", "Returns & Refunds", "Bulk / Institutional Orders", "Other",
];

export default function ContactPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [form, setForm] = useState({ name: "", email: "", topic: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) { setError("Please fill in all required fields."); return; }
    setError("");
    setSubmitting(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const { error: insertError } = await supabase.from("support_tickets").insert({
      user_id: user?.id ?? null,
      name: form.name,
      email: form.email,
      topic: form.topic || null,
      message: form.message,
    });
    setSubmitting(false);
    if (insertError) { setError("Failed to send message. Please try again."); return; }
    setSubmitted(true);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-neutral-900">Contact & Support</h1>
        <p className="text-neutral-500 mt-3 max-w-xl mx-auto">
          Have a question or need help? We&apos;re here for you. Reach out through any of the channels below.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
        {/* Contact info cards */}
        <div className="space-y-4">
          {[
            {
              icon: Mail,
              title: "Email Us",
              detail: "support@bookflow.com.gh",
              sub: "We reply within 24 hours",
              color: "bg-blue-50 text-blue-600",
            },
            {
              icon: Phone,
              title: "Call Us",
              detail: "+233 30 000 0000",
              sub: "Mon–Fri, 9am – 6pm",
              color: "bg-green-50 text-green-600",
            },
            {
              icon: MapPin,
              title: "Visit Us",
              detail: "Osu, Oxford Street",
              sub: "Accra, Ghana",
              color: "bg-amber-50 text-amber-600",
            },
            {
              icon: Clock,
              title: "Business Hours",
              detail: "Mon – Sat: 9am – 6pm",
              sub: "Sunday: Closed",
              color: "bg-purple-50 text-purple-600",
            },
          ].map(({ icon: Icon, title, detail, sub, color }) => (
            <div key={title} className="bg-white border border-neutral-200 rounded-xl p-5 flex items-start gap-4">
              <div className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center shrink-0`}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold text-neutral-900 text-sm">{title}</p>
                <p className="text-sm text-neutral-700 mt-0.5">{detail}</p>
                <p className="text-xs text-neutral-400 mt-0.5">{sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Contact form */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-neutral-200 rounded-xl p-6 sm:p-8">
            {submitted ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
                <h2 className="text-xl font-bold text-neutral-900">Message Sent!</h2>
                <p className="text-neutral-500 mt-2 max-w-sm mx-auto">
                  Thanks for reaching out. Our support team will get back to you within 24 hours.
                </p>
                <button
                  type="button"
                  onClick={() => { setSubmitted(false); setForm({ name: "", email: "", topic: "", message: "" }); }}
                  className="mt-6 text-brand-500 hover:text-brand-600 text-sm font-medium"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2 mb-6">
                  <MessageSquare className="w-5 h-5 text-brand-500" />
                  <h2 className="text-lg font-bold text-neutral-900">Send a Message</h2>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-neutral-600 mb-1.5">Full Name <span className="text-red-400">*</span></label>
                      <input
                        type="text"
                        value={form.name}
                        onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                        placeholder="Jane Mensah"
                        className="w-full border border-neutral-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-brand-400 focus:ring-1 focus:ring-brand-200"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-neutral-600 mb-1.5">Email Address <span className="text-red-400">*</span></label>
                      <input
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                        placeholder="jane@example.com"
                        className="w-full border border-neutral-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-brand-400 focus:ring-1 focus:ring-brand-200"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="topic" className="block text-xs font-medium text-neutral-600 mb-1.5">Topic</label>
                    <select
                      id="topic"
                      value={form.topic}
                      onChange={(e) => setForm((f) => ({ ...f, topic: e.target.value }))}
                      className="w-full border border-neutral-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-brand-400 focus:ring-1 focus:ring-brand-200 bg-white"
                    >
                      <option value="">Select a topic…</option>
                      {TOPICS.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-neutral-600 mb-1.5">Message <span className="text-red-400">*</span></label>
                    <textarea
                      value={form.message}
                      onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                      rows={5}
                      placeholder="Describe your issue or question in detail…"
                      className="w-full border border-neutral-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-brand-400 focus:ring-1 focus:ring-brand-200 resize-none"
                    />
                  </div>

                  {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 disabled:opacity-60 text-white font-semibold px-6 py-3 rounded-xl text-sm transition-colors w-full sm:w-auto justify-center"
                  >
                    <Send className="w-4 h-4" />
                    {submitting ? "Sending…" : "Send Message"}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>

      {/* FAQ section */}
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-neutral-900">Frequently Asked Questions</h2>
          <p className="text-neutral-500 mt-2 text-sm">Quick answers to common questions</p>
        </div>

        <div className="space-y-3">
          {FAQS.map((faq, i) => (
            <div key={i} className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
              <button
                type="button"
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-neutral-50 transition-colors"
              >
                <span className="font-medium text-neutral-900 text-sm pr-4">{faq.q}</span>
                {openFaq === i ? (
                  <ChevronUp className="w-4 h-4 text-neutral-400 shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-neutral-400 shrink-0" />
                )}
              </button>
              {openFaq === i && (
                <div className="px-6 pb-5 text-sm text-neutral-600 border-t border-neutral-100 pt-4">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
