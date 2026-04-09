import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { adminSupabase } from "@/lib/supabase/admin";
import { createPurchaseOrder } from "../actions";

export default async function NewPOPage() {
  const { data: suppliers } = await adminSupabase
    .from("suppliers")
    .select("id, name")
    .eq("active", true)
    .order("name");

  const inp = "w-full border border-neutral-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-brand-400 focus:ring-1 focus:ring-brand-200";

  return (
    <div className="max-w-xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/supply-chain/purchase-orders" className="text-neutral-400 hover:text-neutral-600">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold text-neutral-900">New Purchase Order</h1>
      </div>

      <form action={createPurchaseOrder} className="bg-white border border-neutral-200 rounded-xl p-6 space-y-5">
        <div>
          <label className="block text-xs font-medium text-neutral-600 mb-1.5">Supplier</label>
          <select name="supplier_id" className={inp}>
            <option value="">Select supplier…</option>
            {(suppliers ?? []).map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
          {(suppliers ?? []).length === 0 && (
            <p className="text-xs text-amber-600 mt-1">
              No active suppliers. <Link href="/admin/supply-chain/suppliers/new" className="underline">Add one first →</Link>
            </p>
          )}
        </div>

        <div>
          <label className="block text-xs font-medium text-neutral-600 mb-1.5">Expected Delivery Date</label>
          <input type="date" name="expected_at" className={inp} />
        </div>

        <div>
          <label className="block text-xs font-medium text-neutral-600 mb-1.5">Notes</label>
          <textarea name="notes" rows={3} className={`${inp} resize-none`} placeholder="Special instructions, delivery terms…" />
        </div>

        <div className="flex gap-3 pt-2">
          <button type="submit" className="bg-brand-500 hover:bg-brand-600 text-white font-semibold px-6 py-2.5 rounded-lg text-sm transition-colors">
            Create Purchase Order
          </button>
          <Link href="/admin/supply-chain/purchase-orders" className="border border-neutral-200 text-neutral-600 hover:bg-neutral-50 font-medium px-6 py-2.5 rounded-lg text-sm">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
