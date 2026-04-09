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
}

export async function upsertSupplier(formData: FormData) {
  await requireAdmin();
  const id   = formData.get("id") as string | null;
  const data = {
    name:         formData.get("name") as string,
    contact_name: formData.get("contact_name") as string || null,
    email:        formData.get("email") as string || null,
    phone:        formData.get("phone") as string || null,
    address:      formData.get("address") as string || null,
    country:      formData.get("country") as string || "Ghana",
    notes:        formData.get("notes") as string || null,
    active:       formData.get("active") === "true",
  };

  if (id) {
    await adminSupabase.from("suppliers").update(data).eq("id", id);
  } else {
    await adminSupabase.from("suppliers").insert(data);
  }

  revalidatePath("/admin/supply-chain/suppliers");
  redirect("/admin/supply-chain/suppliers");
}

export async function deleteSupplier(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id") as string;
  await adminSupabase.from("suppliers").delete().eq("id", id);
  revalidatePath("/admin/supply-chain/suppliers");
  redirect("/admin/supply-chain/suppliers");
}
