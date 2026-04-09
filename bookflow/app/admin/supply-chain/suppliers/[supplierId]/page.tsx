import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { adminSupabase } from "@/lib/supabase/admin";
import { SupplierForm } from "../new/page";
import { upsertSupplier, deleteSupplier } from "../actions";

type Props = { params: Promise<{ supplierId: string }> };

export default async function EditSupplierPage({ params }: Props) {
  const { supplierId } = await params;
  const { data: supplier } = await adminSupabase
    .from("suppliers")
    .select("*")
    .eq("id", supplierId)
    .single();

  if (!supplier) notFound();

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin/supply-chain/suppliers" className="text-neutral-400 hover:text-neutral-600">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold text-neutral-900">Edit Supplier</h1>
        </div>
        <form action={deleteSupplier}>
          <input type="hidden" name="id" value={supplier.id} />
          <button type="submit" className="text-sm text-red-500 hover:text-red-700 font-medium">
            Delete supplier
          </button>
        </form>
      </div>
      <SupplierForm action={upsertSupplier} supplier={supplier} />
    </div>
  );
}
