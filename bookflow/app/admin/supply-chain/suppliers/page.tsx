import Link from "next/link";
import { adminSupabase } from "@/lib/supabase/admin";
import { ArrowLeft, Plus } from "lucide-react";

export default async function SuppliersPage() {
  const { data: suppliers } = await adminSupabase
    .from("suppliers")
    .select("id, name, contact_name, email, phone, country, active, created_at")
    .order("name");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/supply-chain" className="text-neutral-400 hover:text-neutral-600">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-neutral-900">Suppliers</h1>
          <p className="text-sm text-neutral-500 mt-1">{(suppliers ?? []).length} supplier{(suppliers ?? []).length !== 1 ? "s" : ""} registered</p>
        </div>
        <Link
          href="/admin/supply-chain/suppliers/new"
          className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Supplier
        </Link>
      </div>

      <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-neutral-50 border-b border-neutral-100">
              <th className="text-left px-6 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Supplier</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider hidden sm:table-cell">Contact</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider hidden md:table-cell">Country</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {(suppliers ?? []).length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-neutral-400">
                  No suppliers yet. <Link href="/admin/supply-chain/suppliers/new" className="text-brand-500 hover:text-brand-600">Add one →</Link>
                </td>
              </tr>
            ) : (suppliers ?? []).map((s) => (
              <tr key={s.id} className="hover:bg-neutral-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-brand-50 text-brand-600 font-bold text-sm flex items-center justify-center shrink-0">
                      {s.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-neutral-900">{s.name}</p>
                      <p className="text-xs text-neutral-400">{s.email ?? "No email"}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4 hidden sm:table-cell">
                  <p className="text-neutral-700">{s.contact_name ?? "—"}</p>
                  <p className="text-xs text-neutral-400">{s.phone ?? ""}</p>
                </td>
                <td className="px-4 py-4 text-neutral-600 hidden md:table-cell">{s.country}</td>
                <td className="px-4 py-4">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${s.active ? "bg-green-100 text-green-700" : "bg-neutral-100 text-neutral-500"}`}>
                    {s.active ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-4 py-4 text-right">
                  <Link href={`/admin/supply-chain/suppliers/${s.id}`} className="text-xs text-brand-500 hover:text-brand-600 font-medium">
                    Edit →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
