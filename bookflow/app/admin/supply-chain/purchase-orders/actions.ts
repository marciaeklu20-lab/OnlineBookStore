"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { adminSupabase } from "@/lib/supabase/admin";
import { getServerUser } from "@/lib/supabase/server";

async function requireAdmin() {
  const user = await getServerUser();
  if (!user) throw new Error("Unauthorized");
  const { data } = await adminSupabase.from("profiles").select("is_admin").eq("id", user.id).single();
  if (!data?.is_admin) throw new Error("Forbidden");
  return user;
}

function generatePONumber() {
  const now = new Date();
  const ymd = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
  const rand = Math.floor(Math.random() * 9000) + 1000;
  return `PO-${ymd}-${rand}`;
}

export async function createPurchaseOrder(formData: FormData) {
  const user = await requireAdmin();

  const supplierId  = formData.get("supplier_id") as string || null;
  const notes       = formData.get("notes") as string || null;
  const expectedAt  = formData.get("expected_at") as string || null;

  const { data: po, error } = await adminSupabase
    .from("purchase_orders")
    .insert({
      po_number:   generatePONumber(),
      supplier_id: supplierId,
      status:      "draft",
      notes,
      expected_at: expectedAt || null,
      created_by:  user.id,
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);

  revalidatePath("/admin/supply-chain/purchase-orders");
  redirect(`/admin/supply-chain/purchase-orders/${po.id}`);
}

export async function updatePOStatus(formData: FormData) {
  await requireAdmin();
  const poId   = formData.get("poId") as string;
  const status = formData.get("status") as string;

  const updates: Record<string, string | null> = { status };
  if (status === "received") updates.received_at = new Date().toISOString();

  await adminSupabase.from("purchase_orders").update(updates).eq("id", poId);

  // If received, update inventory stock levels
  if (status === "received") {
    const { data: items } = await adminSupabase
      .from("purchase_order_items")
      .select("book_id, format, quantity_ordered")
      .eq("purchase_order_id", poId);

    for (const item of items ?? []) {
      const { error: rpcError } = await adminSupabase.rpc("increment_inventory", {
        p_book_id: item.book_id,
        p_format:  item.format.toLowerCase(),
        p_qty:     item.quantity_ordered,
      });
      if (rpcError) {
        // Fallback: upsert inventory record directly
        await adminSupabase
          .from("inventory")
          .upsert(
            { book_id: item.book_id, format: item.format.toLowerCase(), stock_qty: item.quantity_ordered, last_restocked_at: new Date().toISOString() },
            { onConflict: "book_id,format" }
          );
      }
    }
  }

  revalidatePath(`/admin/supply-chain/purchase-orders/${poId}`);
  revalidatePath("/admin/supply-chain/purchase-orders");
}

export async function addPOItem(formData: FormData) {
  await requireAdmin();
  const poId     = formData.get("poId") as string;
  const bookId   = formData.get("book_id") as string;
  const format   = formData.get("format") as string;
  const qty      = parseInt(formData.get("quantity") as string, 10);
  const unitCost = parseFloat(formData.get("unit_cost") as string);

  await adminSupabase.from("purchase_order_items").insert({
    purchase_order_id: poId,
    book_id: bookId,
    format,
    quantity_ordered: qty,
    unit_cost: unitCost,
  });

  // Recalculate PO total
  const { data: items } = await adminSupabase
    .from("purchase_order_items")
    .select("total_cost")
    .eq("purchase_order_id", poId);

  const total = (items ?? []).reduce((s, i) => s + Number(i.total_cost), 0);
  await adminSupabase.from("purchase_orders").update({ total_cost: total }).eq("id", poId);

  revalidatePath(`/admin/supply-chain/purchase-orders/${poId}`);
}

export async function removePOItem(formData: FormData) {
  await requireAdmin();
  const itemId = formData.get("itemId") as string;
  const poId   = formData.get("poId") as string;

  await adminSupabase.from("purchase_order_items").delete().eq("id", itemId);

  const { data: items } = await adminSupabase
    .from("purchase_order_items")
    .select("total_cost")
    .eq("purchase_order_id", poId);

  const total = (items ?? []).reduce((s, i) => s + Number(i.total_cost), 0);
  await adminSupabase.from("purchase_orders").update({ total_cost: total }).eq("id", poId);

  revalidatePath(`/admin/supply-chain/purchase-orders/${poId}`);
}
