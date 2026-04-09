import Link from "next/link";
import { adminSupabase } from "@/lib/supabase/admin";
import { Package, AlertTriangle, ArrowLeft } from "lucide-react";
import { updateInventory } from "./actions";

export default async function InventoryPage() {
  const { data: inventory } = await adminSupabase
    .from("inventory")
    .select(`
      id, format, stock_qty, reorder_level, reorder_qty, cost_price, last_restocked_at,
      books ( id, title, cover_image_url, authors(name) )
    `)
    .order("stock_qty", { ascending: true });

  const items = inventory ?? [];
  const lowStock = items.filter((i) => i.stock_qty <= i.reorder_level);
  const outOfStock = items.filter((i) => i.stock_qty === 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/orders" className="text-neutral-400 hover:text-neutral-600">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-neutral-900">Inventory</h1>
          <p className="text-sm text-neutral-500 mt-1">Track physical book stock levels</p>
        </div>
        <Link
          href="/admin/orders/inventory/purchase-orders"
          className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors"
        >
          Purchase Orders
        </Link>
      </div>

      {/* Alert banners */}
      {outOfStock.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-red-800 text-sm">{outOfStock.length} item{outOfStock.length > 1 ? "s" : ""} out of stock</p>
            <p className="text-xs text-red-600 mt-0.5">{outOfStock.map((i) => `${(i.books as unknown as { title: string }).title} (${i.format})`).join(", ")}</p>
          </div>
        </div>
      )}
      {lowStock.length > 0 && lowStock.length !== outOfStock.length && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-amber-800 text-sm">{lowStock.length} item{lowStock.length > 1 ? "s" : ""} below reorder level</p>
            <p className="text-xs text-amber-600 mt-0.5">{lowStock.map((i) => `${(i.books as unknown as { title: string }).title} (${i.format})`).slice(0, 5).join(", ")}</p>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total SKUs", value: items.length, color: "bg-blue-50 text-blue-600" },
          { label: "Low Stock", value: lowStock.length, color: "bg-amber-50 text-amber-600" },
          { label: "Out of Stock", value: outOfStock.length, color: "bg-red-50 text-red-600" },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white border border-neutral-200 rounded-xl p-4 text-center">
            <p className={`text-2xl font-bold ${color.split(" ")[1]}`}>{value}</p>
            <p className="text-xs text-neutral-500 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Inventory table */}
      {items.length === 0 ? (
        <div className="bg-white border border-neutral-200 rounded-xl py-16 text-center">
          <Package className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
          <p className="text-neutral-500 font-medium">No inventory records yet</p>
          <p className="text-sm text-neutral-400 mt-1">Run migration 005 and add inventory records to get started.</p>
        </div>
      ) : (
        <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-neutral-50 border-b border-neutral-100">
                <th className="text-left px-6 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Book</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Format</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">In Stock</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider hidden md:table-cell">Reorder At</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider hidden md:table-cell">Last Restocked</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Stock Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {items.map((item: {
                id: string; format: string; stock_qty: number; reorder_level: number;
                reorder_qty: number; cost_price: number | null; last_restocked_at: string | null;
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                books: any;
              }) => {
                const isOut  = item.stock_qty === 0;
                const isLow  = !isOut && item.stock_qty <= item.reorder_level;
                const statusLabel = isOut ? "Out of Stock" : isLow ? "Low Stock" : "In Stock";
                const statusClass = isOut ? "bg-red-100 text-red-700" : isLow ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700";

                return (
                  <tr key={item.id} className={`hover:bg-neutral-50 transition-colors ${isOut ? "bg-red-50/30" : isLow ? "bg-amber-50/30" : ""}`}>
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-10 bg-neutral-100 rounded shrink-0 overflow-hidden">
                          {item.books.cover_image_url && <img src={item.books.cover_image_url} alt="" className="w-full h-full object-cover" />}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-neutral-900 line-clamp-1 text-xs">{item.books.title}</p>
                          <p className="text-xs text-neutral-400">{item.books.authors?.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 capitalize text-neutral-600">{item.format}</td>
                    <td className="px-4 py-3 text-center font-bold text-lg text-neutral-900">{item.stock_qty}</td>
                    <td className="px-4 py-3 text-center text-neutral-500 hidden md:table-cell">{item.reorder_level}</td>
                    <td className="px-4 py-3 text-xs text-neutral-400 hidden md:table-cell">
                      {item.last_restocked_at
                        ? new Date(item.last_restocked_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
                        : "Never"}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusClass}`}>{statusLabel}</span>
                    </td>
                    <td className="px-4 py-3">
                      <form action={updateInventory} className="flex items-center gap-1">
                        <input type="hidden" name="inventoryId" value={item.id} />
                        <input
                          type="number"
                          name="qty"
                          defaultValue={item.stock_qty}
                          min={0}
                          className="w-16 border border-neutral-200 rounded px-2 py-1 text-xs text-center focus:outline-none focus:border-brand-400"
                        />
                        <button type="submit" className="text-xs text-brand-500 hover:text-brand-600 font-medium px-1.5">
                          Save
                        </button>
                      </form>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
