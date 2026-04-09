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

export async function updateOrderStatus(formData: FormData) {
  await requireAdmin();
  const orderId = formData.get("orderId") as string;
  const status = formData.get("status") as string;

  const updates: Record<string, string | null> = { status };
  if (status === "shipped")   updates.shipped_at   = new Date().toISOString();
  if (status === "delivered") updates.delivered_at = new Date().toISOString();

  await adminSupabase.from("orders").update(updates).eq("id", orderId);
  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin/orders");
}

export async function addTrackingNumber(formData: FormData) {
  await requireAdmin();
  const orderId  = formData.get("orderId") as string;
  const tracking = formData.get("tracking") as string;
  const carrier  = formData.get("carrier") as string;

  await adminSupabase
    .from("orders")
    .update({ tracking_number: tracking, shipping_carrier: carrier })
    .eq("id", orderId);

  revalidatePath(`/admin/orders/${orderId}`);
}
