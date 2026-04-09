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

export async function updateTicketStatus(formData: FormData) {
  await requireAdmin();
  const ticketId = formData.get("ticketId") as string;
  const status = formData.get("status") as string;
  const resolved_at = status === "resolved" ? new Date().toISOString() : null;
  await adminSupabase
    .from("support_tickets")
    .update({ status, ...(resolved_at ? { resolved_at } : {}) })
    .eq("id", ticketId);
  revalidatePath("/admin/crm/tickets");
}
