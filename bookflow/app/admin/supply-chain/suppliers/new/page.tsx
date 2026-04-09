import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { upsertSupplier } from "../actions";

export default function NewSupplierPage() {
  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/supply-chain/suppliers" className="text-neutral-400 hover:text-neutral-600">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold text-neutral-900">Add Supplier</h1>
      </div>
      <SupplierForm action={upsertSupplier} />
    </div>
  );
}

export function SupplierForm({
  action,
  supplier,
}: {
  action: (fd: FormData) => Promise<void>;
  supplier?: {
    id: string; name: string; contact_name: string | null; email: string | null;
    phone: string | null; address: string | null; country: string; notes: string | null; active: boolean;
  };
}) {
  const inp = "w-full border border-neutral-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-brand-400 focus:ring-1 focus:ring-brand-200";
  return (
    <form action={action} className="bg-white border border-neutral-200 rounded-xl p-6 space-y-5">
      {supplier && <input type="hidden" name="id" value={supplier.id} />}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-neutral-600 mb-1.5">Supplier Name <span className="text-red-400">*</span></label>
          <input name="name" required defaultValue={supplier?.name} className={inp} placeholder="e.g. Accra Book Distributors" />
        </div>
        <div>
          <label className="block text-xs font-medium text-neutral-600 mb-1.5">Contact Person</label>
          <input name="contact_name" defaultValue={supplier?.contact_name ?? ""} className={inp} placeholder="John Mensah" />
        </div>
        <div>
          <label className="block text-xs font-medium text-neutral-600 mb-1.5">Email</label>
          <input name="email" type="email" defaultValue={supplier?.email ?? ""} className={inp} placeholder="contact@supplier.com" />
        </div>
        <div>
          <label className="block text-xs font-medium text-neutral-600 mb-1.5">Phone</label>
          <input name="phone" defaultValue={supplier?.phone ?? ""} className={inp} placeholder="+233 20 000 0000" />
        </div>
        <div>
          <label className="block text-xs font-medium text-neutral-600 mb-1.5">Country</label>
          <select name="country" defaultValue={supplier?.country ?? "Ghana"} className={inp}>
            {["Ghana", "Nigeria", "Kenya", "South Africa", "UK", "USA", "India", "China", "Other"].map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-neutral-600 mb-1.5">Address</label>
          <input name="address" defaultValue={supplier?.address ?? ""} className={inp} placeholder="Street, city" />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-neutral-600 mb-1.5">Notes</label>
          <textarea name="notes" defaultValue={supplier?.notes ?? ""} rows={3} className={`${inp} resize-none`} placeholder="Terms, lead times, special conditions…" />
        </div>
        <div>
          <label className="block text-xs font-medium text-neutral-600 mb-1.5">Status</label>
          <select name="active" defaultValue={supplier?.active !== false ? "true" : "false"} className={inp}>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button type="submit" className="bg-brand-500 hover:bg-brand-600 text-white font-semibold px-6 py-2.5 rounded-lg text-sm transition-colors">
          {supplier ? "Save Changes" : "Add Supplier"}
        </button>
        <Link href="/admin/supply-chain/suppliers" className="border border-neutral-200 text-neutral-600 hover:bg-neutral-50 font-medium px-6 py-2.5 rounded-lg text-sm transition-colors">
          Cancel
        </Link>
      </div>
    </form>
  );
}
