import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Package, Trash2 } from "lucide-react";
import { adminSupabase } from "@/lib/supabase/admin";
import { updatePOStatus, addPOItem, removePOItem } from "../actions";

type Props = { params: Promise<{ poId: string }> };

const PO_STATUS_STYLES: Record<string, string> = {
  draft:     "bg-neutral-100 text-neutral-600",
  sent:      "bg-blue-100 text-blue-700",
  confirmed: "bg-purple-100 text-purple-700",
  received:  "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

const STATUS_FLOW = ["draft", "sent", "confirmed", "received"];

export default async function PODetailPage({ params }: Props) {
  const { poId } = await params;

  const [poRes, booksRes] = await Promise.all([
    adminSupabase
      .from("purchase_orders")
      .select(`
        *,
        suppliers ( id, name, email, phone, contact_name ),
        purchase_order_items (
          id, format, quantity_ordered, quantity_received, unit_cost, total_cost,
          books ( id, title, authors(name) )
        )
      `)
      .eq("id", poId)
      .single(),
    adminSupabase
      .from("books")
      .select("id, title")
      .eq("published", true)
      .order("title")
      .limit(200),
  ]);

  if (!poRes.data) notFound();
  const po = poRes.data;
  const books = booksRes.data ?? [];

  const currentIdx = STATUS_FLOW.indexOf(po.status);
  const isCancelled = po.status === "cancelled";
  const isDone = po.status === "received";
  const nextStatuses = (!isCancelled && !isDone)
    ? STATUS_FLOW.filter((_, i) => i > currentIdx)
    : [];

  const inp = "w-full border border-neutral-200 rounded-lg px-2 py-2 text-xs focus:outline-none focus:border-brand-400";

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-3 flex-wrap">
        <Link href="/admin/supply-chain/purchase-orders" className="text-neutral-400 hover:text-neutral-600">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-neutral-900">{po.po_number}</h1>
          <p className="text-sm text-neutral-500 mt-0.5">
            Created {new Date(po.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
            {po.expected_at && ` · Expected ${new Date(po.expected_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}`}
          </p>
        </div>
        <span className={`text-xs font-bold px-3 py-1.5 rounded-full capitalize ${PO_STATUS_STYLES[po.status] ?? "bg-neutral-100"}`}>
          {po.status}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sidebar */}
        <div className="space-y-4">
          {/* Supplier info */}
          <div className="bg-white border border-neutral-200 rounded-xl p-5">
            <h2 className="font-semibold text-neutral-900 text-sm mb-3">Supplier</h2>
            {po.suppliers ? (
              <>
                <p className="font-medium text-neutral-900 text-sm">{po.suppliers.name}</p>
                {po.suppliers.contact_name && <p className="text-xs text-neutral-500">{po.suppliers.contact_name}</p>}
                {po.suppliers.email && <p className="text-xs text-neutral-500">{po.suppliers.email}</p>}
                {po.suppliers.phone && <p className="text-xs text-neutral-500">{po.suppliers.phone}</p>}
                <Link href={`/admin/supply-chain/suppliers/${po.suppliers.id}`} className="mt-2 inline-block text-xs text-brand-500 hover:text-brand-600">
                  Edit supplier →
                </Link>
              </>
            ) : (
              <p className="text-sm text-neutral-400">No supplier assigned</p>
            )}
            {po.notes && (
              <div className="mt-3 pt-3 border-t border-neutral-100">
                <p className="text-xs font-medium text-neutral-500 mb-1">Notes</p>
                <p className="text-xs text-neutral-600">{po.notes}</p>
              </div>
            )}
          </div>

          {/* Status actions */}
          {(nextStatuses.length > 0 || !isCancelled) && (
            <div className="bg-white border border-neutral-200 rounded-xl p-5">
              <h2 className="font-semibold text-neutral-900 text-sm mb-3">Update Status</h2>
              <div className="space-y-2">
                {nextStatuses.map((s) => (
                  <form key={s} action={updatePOStatus}>
                    <input type="hidden" name="poId" value={poId} />
                    <input type="hidden" name="status" value={s} />
                    <button type="submit" className="w-full text-left px-3 py-2.5 rounded-lg border border-neutral-200 text-sm font-medium text-neutral-700 hover:border-brand-400 hover:bg-brand-50 hover:text-brand-700 transition-colors capitalize">
                      Mark as {s} →
                    </button>
                  </form>
                ))}
                {!isCancelled && !isDone && (
                  <form action={updatePOStatus}>
                    <input type="hidden" name="poId" value={poId} />
                    <input type="hidden" name="status" value="cancelled" />
                    <button type="submit" className="w-full text-left px-3 py-2.5 rounded-lg border border-red-100 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors">
                      Cancel PO
                    </button>
                  </form>
                )}
              </div>
              {isDone && po.received_at && (
                <p className="text-xs text-green-600 mt-2">
                  Received {new Date(po.received_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                </p>
              )}
            </div>
          )}

          {/* Totals */}
          <div className="bg-white border border-neutral-200 rounded-xl p-5">
            <h2 className="font-semibold text-neutral-900 text-sm mb-3">Summary</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-neutral-600">
                <span>Line Items</span>
                <span>{po.purchase_order_items?.length ?? 0}</span>
              </div>
              <div className="flex justify-between font-bold text-neutral-900 text-base border-t border-neutral-100 pt-2">
                <span>Total Cost</span>
                <span>GHS {Number(po.total_cost ?? 0).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main: items */}
        <div className="lg:col-span-2 space-y-4">
          {/* Items list */}
          <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-neutral-100 flex items-center gap-2">
              <Package className="w-4 h-4 text-brand-500" />
              <h2 className="font-semibold text-neutral-900 text-sm">Order Items</h2>
            </div>
            {(po.purchase_order_items ?? []).length === 0 ? (
              <p className="px-5 py-8 text-sm text-neutral-400 text-center">No items added yet</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-neutral-50 border-b border-neutral-100">
                    <th className="text-left px-5 py-2.5 text-xs font-semibold text-neutral-500">Book</th>
                    <th className="text-left px-3 py-2.5 text-xs font-semibold text-neutral-500">Format</th>
                    <th className="text-center px-3 py-2.5 text-xs font-semibold text-neutral-500">Qty</th>
                    <th className="text-right px-3 py-2.5 text-xs font-semibold text-neutral-500">Unit</th>
                    <th className="text-right px-5 py-2.5 text-xs font-semibold text-neutral-500">Total</th>
                    <th className="px-3 py-2.5" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {po.purchase_order_items.map((item: {
                    id: string; format: string; quantity_ordered: number;
                    unit_cost: number; total_cost: number;
                    books: { title: string; authors: { name: string } | null };
                  }) => (
                    <tr key={item.id} className="hover:bg-neutral-50">
                      <td className="px-5 py-3">
                        <p className="font-medium text-neutral-900 text-xs line-clamp-1">{item.books.title}</p>
                        <p className="text-xs text-neutral-400">{item.books.authors?.name}</p>
                      </td>
                      <td className="px-3 py-3 capitalize text-neutral-600 text-xs">{item.format}</td>
                      <td className="px-3 py-3 text-center text-neutral-700">{item.quantity_ordered}</td>
                      <td className="px-3 py-3 text-right text-neutral-600 text-xs">GHS {Number(item.unit_cost).toFixed(2)}</td>
                      <td className="px-5 py-3 text-right font-semibold text-neutral-900 text-xs">GHS {Number(item.total_cost).toFixed(2)}</td>
                      <td className="px-3 py-3">
                        {!isDone && !isCancelled && (
                          <form action={removePOItem}>
                            <input type="hidden" name="itemId" value={item.id} />
                            <input type="hidden" name="poId" value={poId} />
                            <button type="submit" className="text-neutral-300 hover:text-red-500 transition-colors">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </form>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Add item form */}
          {!isDone && !isCancelled && (
            <div className="bg-white border border-neutral-200 rounded-xl p-5">
              <h2 className="font-semibold text-neutral-900 text-sm mb-4">Add Item</h2>
              <form action={addPOItem} className="grid grid-cols-2 sm:grid-cols-4 gap-3 items-end">
                <input type="hidden" name="poId" value={poId} />
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-neutral-600 mb-1">Book</label>
                  <select name="book_id" required className={inp}>
                    <option value="">Select book…</option>
                    {books.map((b) => <option key={b.id} value={b.id}>{b.title}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-600 mb-1">Format</label>
                  <select name="format" className={inp}>
                    <option value="paperback">Paperback</option>
                    <option value="hardcover">Hardcover</option>
                    <option value="audiobook">Audiobook</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-600 mb-1">Qty</label>
                  <input type="number" name="quantity" min={1} defaultValue={10} className={inp} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-600 mb-1">Unit Cost (GHS)</label>
                  <input type="number" name="unit_cost" min={0} step="0.01" defaultValue="0.00" className={inp} />
                </div>
                <div className="col-span-2 sm:col-span-1 flex items-end">
                  <button type="submit" className="w-full bg-brand-500 hover:bg-brand-600 text-white text-xs font-semibold py-2 rounded-lg transition-colors">
                    Add Item
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
