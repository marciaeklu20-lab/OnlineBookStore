import { redirect } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard, ShoppingBag, Heart, BookOpen,
  User, LogOut, BookMarked,
} from "lucide-react";
import { getServerUser } from "@/lib/supabase/server";
import { adminSupabase } from "@/lib/supabase/admin";
import type { ReactNode } from "react";

const NAV = [
  { href: "/dashboard",          label: "Overview",      icon: LayoutDashboard },
  { href: "/dashboard/orders",   label: "My Orders",     icon: ShoppingBag },
  { href: "/dashboard/wishlist", label: "Wishlist",      icon: Heart },
  { href: "/dashboard/reading",  label: "Reading List",  icon: BookOpen },
  { href: "/dashboard/profile",  label: "Profile",       icon: User },
];

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const user = await getServerUser();
  if (!user) redirect("/account");

  const { data: profile } = await adminSupabase
    .from("profiles")
    .select("first_name, last_name, email")
    .eq("id", user.id)
    .single();

  const name = [profile?.first_name, profile?.last_name].filter(Boolean).join(" ") || user.email;
  const initials = name?.slice(0, 2).toUpperCase() ?? "ME";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <aside className="lg:w-56 shrink-0">
          {/* Profile card */}
          <div className="bg-white border border-neutral-200 rounded-xl p-5 mb-4 text-center">
            <div className="w-14 h-14 rounded-full bg-brand-500 text-white font-bold text-xl flex items-center justify-center mx-auto mb-3">
              {initials}
            </div>
            <p className="font-semibold text-neutral-900 text-sm truncate">{name}</p>
            <p className="text-xs text-neutral-500 truncate">{user.email}</p>
            <Link
              href="/dashboard/profile"
              className="mt-3 inline-block text-xs text-brand-500 hover:text-brand-600 font-medium"
            >
              Edit Profile
            </Link>
          </div>

          {/* Nav */}
          <nav className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
            {NAV.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-3 px-4 py-3 text-sm text-neutral-600 hover:bg-brand-50 hover:text-brand-600 transition-colors border-b border-neutral-100 last:border-0"
              >
                <Icon className="w-4 h-4 shrink-0" />
                {label}
              </Link>
            ))}
            <Link
              href="/"
              className="flex items-center gap-3 px-4 py-3 text-sm text-neutral-400 hover:bg-neutral-50 hover:text-neutral-600 transition-colors border-t border-neutral-100"
            >
              <BookMarked className="w-4 h-4 shrink-0" />
              Back to Shop
            </Link>
          </nav>

          {/* Sign out */}
          <form action="/api/auth/signout" method="POST" className="mt-3">
            <button
              type="submit"
              className="w-full flex items-center gap-2 justify-center text-sm text-neutral-400 hover:text-red-500 py-2 transition-colors"
            >
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </form>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}
