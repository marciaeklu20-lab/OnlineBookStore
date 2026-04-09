"use server";

import { revalidatePath } from "next/cache";
import { adminSupabase } from "@/lib/supabase/admin";
import { getServerUser } from "@/lib/supabase/server";

async function requireAdmin() {
  const user = await getServerUser();
  if (!user) throw new Error("Unauthorized");
  const { data } = await adminSupabase.from("profiles").select("is_admin").eq("id", user.id).single();
  if (!data?.is_admin) throw new Error("Forbidden");
}

export async function updateInventory(formData: FormData) {
  await requireAdmin();
  const inventoryId = formData.get("inventoryId") as string;
  const qty = parseInt(formData.get("qty") as string, 10);
  await adminSupabase
    .from("inventory")
    .update({ stock_qty: qty, last_restocked_at: new Date().toISOString() })
    .eq("id", inventoryId);
  revalidatePath("/admin/orders/inventory");
}
