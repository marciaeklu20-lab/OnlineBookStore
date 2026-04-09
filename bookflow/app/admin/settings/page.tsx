import { adminSupabase } from "@/lib/supabase/admin";
import { getServerUser } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import SettingsTabs from "./SettingsTabs";

async function getSettings() {
  const { data } = await adminSupabase
    .from("store_settings")
    .select("*")
    .eq("id", 1)
    .single();
  return data;
}

async function getAdminProfile(userId: string) {
  const { data } = await adminSupabase
    .from("profiles")
    .select("first_name, last_name, email")
    .eq("id", userId)
    .single();
  return data;
}

export default async function AdminSettingsPage() {
  const user = await getServerUser();
  if (!user) redirect("/account");

  const [settings, profile] = await Promise.all([
    getSettings(),
    getAdminProfile(user.id),
  ]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-900">Settings</h1>
        <p className="text-sm text-neutral-500 mt-0.5">Manage your store configuration</p>
      </div>

      <SettingsTabs settings={settings} profile={profile} userEmail={user.email} />
    </div>
  );
}
