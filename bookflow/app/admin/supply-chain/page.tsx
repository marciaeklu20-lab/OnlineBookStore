import Link from "next/link";
import { adminSupabase } from "@/lib/supabase/admin";
import { Truck, Users, Package, ClipboardList, AlertTriangle, TrendingDown } from "lucide-react";

export default async function SupplyChainPage() {
  const [suppliersRes, poRes, inventoryRes] = await Promise.all([
    adminSupabase.from("suppliers").select("id, name, active, country, email").order("name"),
    adminSupabase
      .from("purchase_orders")
      .select("id, po_number, status, total_cost, created_at, expected_at, suppliers(name)")
      .order("created_at", { ascending: false })
      .limit(5),
    adminSupabase
      .from("inventory")
      .select("id, stock_qty, reorder_level, books(title)")
      .lte("stock_qty", 5),
  ]);

  const suppliers = suppliersRes.data ?? [];
  const recentPOs = poRes.data ?? [];
  const lowStock  = inventoryRes.data ?? [];

  const activeSuppliers = suppliers.filter((s) => s.active).length;

  const PO_STATUS: Record<string, string> = {
    draft:     "bg-neutral-100 text-neutral-500",
    sent:      "bg-blue-100 text-blue-700",
    confirmed: "bg-purple-100 text-purple-700",
    received:  "bg-green-100 text-green-700",
    cancelled: "bg-red-100 text-red-700",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Supply Chain</h1>
        <p className="text-sm text-neutral-500 mt-1">Manage suppliers, purchase orders, and stock replenishment</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Suppliers",  value: suppliers.length,  icon: Users,         color: "bg-blue-50 text-blue-600",   href: "/admin/supply-chain/suppliers" },
          { label: "Active Suppliers", value: activeSuppliers,   icon: Truck,         color: "bg-green-50 text-green-600", href: "/admin/supply-chain/suppliers" },
          { label: "Purchase Orders",  value: recentPOs.length,  icon: ClipboardList, color: "bg-purple-50 text-purple-600", href: "/admin/supply-chain/purchase-orders" },
          { label: "Low Stock Items",  value: lowStock.length,   icon: TrendingDown,  color: "bg-red-50 text-red-600",     href: "/admin/orders/inventory" },
        ].map(({ label, value, icon: Icon, color, href }) => (
          <Link key={label} href={href} className="bg-white border border-neutral-200 rounded-xl p-4 hover:border-brand-300 transition-colors">
            <div className={`w-8 h-8 rounded-lg ${color} flex items-center justify-center mb-3`}>
              <Icon className="w-4 h-4" />
            </div>
            <p className="text-2xl font-bold text-neutral-900">{value}</p>
            <p className="text-xs text-neutral-500 mt-0.5">{label}</p>
          </Link>
        ))}
      </div>

      {/* Low stock alert */}
      {lowStock.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold text-amber-800 text-sm">{lowStock.length} items need restocking</p>
            <p className="text-xs text-amber-700 mt-1">
              {lowStock.slice(0, 4).map((i) => (i.books as unknown as { title: string }).title).join(", ")}
              {lowStock.length > 4 ? ` +${lowStock.length - 4} more` : ""}
            </p>
          </div>
          <Link href="/admin/supply-chain/purchase-orders/new" className="text-xs bg-amber-500 hover:bg-amber-600 text-white font-semibold px-3 py-1.5 rounded-lg transition-colors shrink-0">
            Create PO
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Purchase Orders */}
        <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100">
            <h2 className="font-semibold text-neutral-900 text-sm flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-brand-500" /> Recent Purchase Orders
            </h2>
            <Link href="/admin/supply-chain/purchase-orders" className="text-xs text-brand-500 hover:text-brand-600 font-medium">View all</Link>
          </div>
          {recentPOs.length === 0 ? (
            <div className="py-10 text-center">
              <Package className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
              <p className="text-sm text-neutral-400">No purchase orders yet</p>
              <Link href="/admin/supply-chain/purchase-orders/new" className="mt-2 inline-block text-xs text-brand-500 hover:text-brand-600 font-medium">
                Create first PO →
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-neutral-100">
              {recentPOs.map((po: {
                id: string; po_number: string; status: string;
                total_cost: number | null; created_at: string; expected_at: string | null;
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                suppliers: any;
              }) => (
                <div key={po.id} className="flex items-center justify-between px-5 py-3">
                  <div>
                    <p className="text-sm font-medium text-neutral-900">{po.po_number}</p>
                    <p className="text-xs text-neutral-500">{po.suppliers?.name ?? "No supplier"}</p>
                    <p className="text-xs text-neutral-400 mt-0.5">
                      {new Date(po.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${PO_STATUS[po.status] ?? "bg-neutral-100 text-neutral-500"}`}>
                      {po.status}
                    </span>
                    {po.total_cost && (
                      <span className="text-xs font-medium text-neutral-700">GHS {Number(po.total_cost).toFixed(2)}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Suppliers list */}
        <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100">
            <h2 className="font-semibold text-neutral-900 text-sm flex items-center gap-2">
              <Users className="w-4 h-4 text-brand-500" /> Suppliers
            </h2>
            <Link href="/admin/supply-chain/suppliers/new" className="text-xs bg-brand-500 hover:bg-brand-600 text-white font-semibold px-3 py-1.5 rounded-lg transition-colors">
              + Add
            </Link>
          </div>
          {suppliers.length === 0 ? (
            <div className="py-10 text-center">
              <Users className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
              <p className="text-sm text-neutral-400">No suppliers added yet</p>
              <Link href="/admin/supply-chain/suppliers/new" className="mt-2 inline-block text-xs text-brand-500 hover:text-brand-600 font-medium">
                Add first supplier →
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-neutral-100">
              {suppliers.slice(0, 6).map((s) => (
                <div key={s.id} className="flex items-center justify-between px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-brand-50 text-brand-600 font-bold text-xs flex items-center justify-center">
                      {s.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-neutral-900">{s.name}</p>
                      <p className="text-xs text-neutral-400">{s.country} · {s.email ?? "no email"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${s.active ? "bg-green-100 text-green-700" : "bg-neutral-100 text-neutral-500"}`}>
                      {s.active ? "Active" : "Inactive"}
                    </span>
                    <Link href={`/admin/supply-chain/suppliers/${s.id}`} className="text-xs text-brand-500 hover:text-brand-600">Edit</Link>
                  </div>
                </div>
              ))}
              {suppliers.length > 6 && (
                <div className="px-5 py-3 text-center">
                  <Link href="/admin/supply-chain/suppliers" className="text-xs text-brand-500 hover:text-brand-600 font-medium">
                    View all {suppliers.length} suppliers →
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
