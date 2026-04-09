"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { User, Lock, Save, CheckCircle } from "lucide-react";

type Profile = {
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  bio: string | null;
  preferred_genres: string[] | null;
};

export default function ProfilePage() {
  const supabase = createClient();
  const [profile, setProfile] = useState<Profile>({ first_name: "", last_name: "", email: "", phone: "", bio: "", preferred_genres: [] });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwError, setPwError] = useState("");
  const [pwSaving, setPwSaving] = useState(false);
  const [pwSaved, setPwSaved] = useState(false);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("profiles")
        .select("first_name, last_name, email, phone, bio, preferred_genres")
        .eq("id", user.id)
        .single();
      if (data) setProfile(data as Profile);
      setLoading(false);
    }
    load();
  }, [supabase]);

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("profiles").update({
      first_name: profile.first_name,
      last_name: profile.last_name,
      phone: profile.phone,
      bio: profile.bio,
    }).eq("id", user.id);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    setPwError("");
    if (newPassword !== confirmPassword) { setPwError("Passwords do not match."); return; }
    if (newPassword.length < 8) { setPwError("Password must be at least 8 characters."); return; }
    setPwSaving(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setPwSaving(false);
    if (error) { setPwError(error.message); return; }
    setPwSaved(true);
    setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
    setTimeout(() => setPwSaved(false), 3000);
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-40 bg-neutral-100 rounded animate-pulse" />
        <div className="h-64 bg-neutral-100 rounded-xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Profile Settings</h1>
        <p className="text-sm text-neutral-500 mt-1">Manage your account details</p>
      </div>

      {/* Profile form */}
      <form onSubmit={saveProfile} className="bg-white border border-neutral-200 rounded-xl p-6 space-y-5">
        <div className="flex items-center gap-2 mb-2">
          <User className="w-4 h-4 text-brand-500" />
          <h2 className="font-semibold text-neutral-900">Personal Information</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-neutral-600 mb-1.5">First Name</label>
            <input
              type="text"
              value={profile.first_name}
              onChange={(e) => setProfile((p) => ({ ...p, first_name: e.target.value }))}
              className="w-full border border-neutral-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-brand-400 focus:ring-1 focus:ring-brand-200"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-neutral-600 mb-1.5">Last Name</label>
            <input
              type="text"
              value={profile.last_name}
              onChange={(e) => setProfile((p) => ({ ...p, last_name: e.target.value }))}
              className="w-full border border-neutral-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-brand-400 focus:ring-1 focus:ring-brand-200"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-neutral-600 mb-1.5">Email Address</label>
          <input
            type="email"
            value={profile.email}
            disabled
            className="w-full border border-neutral-100 rounded-lg px-3 py-2.5 text-sm bg-neutral-50 text-neutral-400 cursor-not-allowed"
          />
          <p className="text-xs text-neutral-400 mt-1">Email cannot be changed here.</p>
        </div>

        <div>
          <label className="block text-xs font-medium text-neutral-600 mb-1.5">Phone Number</label>
          <input
            type="tel"
            value={profile.phone ?? ""}
            onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))}
            placeholder="+233 xx xxx xxxx"
            className="w-full border border-neutral-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-brand-400 focus:ring-1 focus:ring-brand-200"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-neutral-600 mb-1.5">Bio</label>
          <textarea
            value={profile.bio ?? ""}
            onChange={(e) => setProfile((p) => ({ ...p, bio: e.target.value }))}
            rows={3}
            placeholder="Tell us a bit about yourself and your reading interests..."
            className="w-full border border-neutral-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-brand-400 focus:ring-1 focus:ring-brand-200 resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 disabled:opacity-60 text-white font-semibold px-5 py-2.5 rounded-lg text-sm transition-colors"
        >
          {saved ? <><CheckCircle className="w-4 h-4" /> Saved!</> : <><Save className="w-4 h-4" /> {saving ? "Saving…" : "Save Changes"}</>}
        </button>
      </form>

      {/* Password form */}
      <form onSubmit={changePassword} className="bg-white border border-neutral-200 rounded-xl p-6 space-y-5">
        <div className="flex items-center gap-2 mb-2">
          <Lock className="w-4 h-4 text-brand-500" />
          <h2 className="font-semibold text-neutral-900">Change Password</h2>
        </div>

        <div>
          <label className="block text-xs font-medium text-neutral-600 mb-1.5">Current Password</label>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="w-full border border-neutral-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-brand-400 focus:ring-1 focus:ring-brand-200"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-neutral-600 mb-1.5">New Password</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full border border-neutral-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-brand-400 focus:ring-1 focus:ring-brand-200"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-neutral-600 mb-1.5">Confirm New Password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full border border-neutral-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-brand-400 focus:ring-1 focus:ring-brand-200"
          />
        </div>

        {pwError && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{pwError}</p>}

        <button
          type="submit"
          disabled={pwSaving || !newPassword}
          className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 disabled:opacity-60 text-white font-semibold px-5 py-2.5 rounded-lg text-sm transition-colors"
        >
          {pwSaved ? <><CheckCircle className="w-4 h-4" /> Password Updated!</> : <><Lock className="w-4 h-4" /> {pwSaving ? "Updating…" : "Update Password"}</>}
        </button>
      </form>
    </div>
  );
}
