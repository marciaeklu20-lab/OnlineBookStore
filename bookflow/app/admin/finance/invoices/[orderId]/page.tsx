import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Printer } from "lucide-react";
import { adminSupabase } from "@/lib/supabase/admin";
import PrintButton from "./PrintButton";

type Props = { params: Promise<{ orderId: string }> };

export default async function InvoicePage({ params }: Props) {
  const { orderId } = await params;

  const { data: order } = await adminSupabase
    .from("orders")
    .select(`
      *,
      order_line_items (
        id, book_format, quantity, unit_price, total_price,
        books ( id, title, authors(name) )
      ),
      profiles!orders_user_id_fkey ( first_name, last_name, email, phone )
    `)
    .eq("id", orderId)
    .single();

  if (!order) notFound();

  const address = order.shipping_address as {
    first_name: string; last_name: string; address: string;
    city: string; region: string; country: string; email: string; phone: string;
  };

  const taxBreakdown = (order.tax_breakdown ?? { vat: 0.125, nhil: 0.025, getfund: 0.025 }) as {
    vat: number; nhil: number; getfund: number;
  };

  const subtotal = Number(order.subtotal);
  const vatAmt     = subtotal * taxBreakdown.vat;
  const nhilAmt    = subtotal * taxBreakdown.nhil;
  const getfundAmt = subtotal * taxBreakdown.getfund;
  const taxTotal   = Number(order.tax_amount ?? vatAmt + nhilAmt + getfundAmt);

  const invoiceDate = new Date(order.created_at).toLocaleDateString("en-GB", {
    day: "numeric", month: "long", year: "numeric",
  });

  return (
    <div className="max-w-3xl mx-auto">
      {/* Screen-only controls */}
      <div className="flex items-center justify-between mb-6 print:hidden">
        <Link href="/admin/finance/invoices" className="flex items-center gap-2 text-neutral-500 hover:text-neutral-700 text-sm">
          <ArrowLeft className="w-4 h-4" /> Back to Invoices
        </Link>
        <PrintButton />
      </div>

      {/* Invoice document */}
      <div id="invoice" className="bg-white border border-neutral-200 rounded-xl p-8 print:border-0 print:rounded-none print:p-0">

        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">
              Book<span className="text-brand-500">Flow</span>
            </h1>
            <p className="text-sm text-neutral-500 mt-1">Osu, Oxford Street, Accra, Ghana</p>
            <p className="text-sm text-neutral-500">support@bookflow.com.gh</p>
            <p className="text-sm text-neutral-500">+233 30 000 0000</p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-neutral-200 uppercase tracking-widest">Invoice</p>
            <p className="text-sm font-semibold text-neutral-900 mt-2"># {order.order_number}</p>
            <p className="text-sm text-neutral-500 mt-0.5">Date: {invoiceDate}</p>
            <span className={`inline-block mt-2 text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wide ${
              order.payment_status === "completed" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
            }`}>
              {order.payment_status === "completed" ? "Paid" : "Pending"}
            </span>
          </div>
        </div>

        {/* Bill to / Ship to */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">Bill To</p>
            <p className="font-semibold text-neutral-900">{address.first_name} {address.last_name}</p>
            <p className="text-sm text-neutral-600">{address.email}</p>
            <p className="text-sm text-neutral-600">{address.phone}</p>
          </div>
          <div>
            <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">Ship To</p>
            <p className="text-sm text-neutral-600">{address.address}</p>
            <p className="text-sm text-neutral-600">{address.city}{address.region ? `, ${address.region}` : ""}</p>
            <p className="text-sm text-neutral-600">{address.country}</p>
          </div>
        </div>

        {/* Payment details */}
        <div className="grid grid-cols-3 gap-4 mb-8 bg-neutral-50 rounded-lg p-4 text-sm">
          <div>
            <p className="text-xs text-neutral-400 uppercase font-semibold tracking-wider">Payment Method</p>
            <p className="font-medium text-neutral-900 capitalize mt-1">{order.payment_method}</p>
          </div>
          <div>
            <p className="text-xs text-neutral-400 uppercase font-semibold tracking-wider">Payment Date</p>
            <p className="font-medium text-neutral-900 mt-1">{order.paid_at ? new Date(order.paid_at).toLocaleDateString("en-GB") : "—"}</p>
          </div>
          <div>
            <p className="text-xs text-neutral-400 uppercase font-semibold tracking-wider">Currency</p>
            <p className="font-medium text-neutral-900 mt-1">{order.currency ?? "GHS"}</p>
          </div>
        </div>

        {/* Line items */}
        <table className="w-full mb-6 text-sm">
          <thead>
            <tr className="border-b-2 border-neutral-200">
              <th className="text-left pb-3 font-semibold text-neutral-700">Description</th>
              <th className="text-center pb-3 font-semibold text-neutral-700 w-16">Qty</th>
              <th className="text-right pb-3 font-semibold text-neutral-700 w-28">Unit Price</th>
              <th className="text-right pb-3 font-semibold text-neutral-700 w-28">Amount</th>
            </tr>
          </thead>
          <tbody>
            {order.order_line_items?.map((item: {
              id: string; book_format: string; quantity: number;
              unit_price: number; total_price: number;
              books: { title: string; authors: { name: string } | null };
            }) => (
              <tr key={item.id} className="border-b border-neutral-100">
                <td className="py-3">
                  <p className="font-medium text-neutral-900">{item.books.title}</p>
                  <p className="text-xs text-neutral-500">{item.books.authors?.name} · {item.book_format}</p>
                </td>
                <td className="py-3 text-center text-neutral-600">{item.quantity}</td>
                <td className="py-3 text-right text-neutral-600">GHS {item.unit_price.toFixed(2)}</td>
                <td className="py-3 text-right font-medium text-neutral-900">GHS {item.total_price.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="flex justify-end">
          <div className="w-64 space-y-2 text-sm">
            <div className="flex justify-between text-neutral-600">
              <span>Subtotal</span>
              <span>GHS {subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-neutral-600">
              <span>Shipping</span>
              <span>{Number(order.shipping_cost) === 0 ? "FREE" : `GHS ${Number(order.shipping_cost).toFixed(2)}`}</span>
            </div>
            <div className="border-t border-neutral-200 pt-2 space-y-1">
              <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Tax (Ghana GRA)</p>
              <div className="flex justify-between text-neutral-600">
                <span>VAT (12.5%)</span>
                <span>GHS {vatAmt.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-neutral-600">
                <span>NHIL (2.5%)</span>
                <span>GHS {nhilAmt.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-neutral-600">
                <span>GETFund Levy (2.5%)</span>
                <span>GHS {getfundAmt.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-neutral-600 font-medium">
                <span>Total Tax</span>
                <span>GHS {taxTotal.toFixed(2)}</span>
              </div>
            </div>
            <div className="flex justify-between font-bold text-neutral-900 text-base border-t-2 border-neutral-900 pt-2">
              <span>Total Paid</span>
              <span>GHS {Number(order.total_amount).toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-10 pt-6 border-t border-neutral-100 text-xs text-neutral-400 flex justify-between">
          <p>Thank you for shopping with BookFlow!</p>
          <p>This is a computer-generated invoice and requires no signature.</p>
        </div>
      </div>
    </div>
  );
}
