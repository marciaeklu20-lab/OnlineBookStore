import Link from "next/link";
import { redirect } from "next/navigation";
import {
  BookOpen, LayoutDashboard, Library, Users, Tag,
  Settings, LogOut, ChevronRight, HeartHandshake,
  BarChart2, ShoppingCart,
} from "lucide-react";
import { getServerUser } from "@/lib/supabase/server";
import { adminSupabase } from "@/lib/supabase/admin";
import type { ReactNode } from "react";

const NAV = [
  { href: "/admin",           label: "Dashboard",  icon: LayoutDashboard },
  { href: "/admin/books",     label: "Books",       icon: Library },
  { href: "/admin/authors",   label: "Authors",     icon: Users },
  { href: "/admin/genres",    label: "Genres",      icon: Tag },
  { href: "/admin/crm",       label: "CRM",         icon: HeartHandshake },
  { href: "/admin/finance",   label: "Finance",     icon: BarChart2 },
  { href: "/admin/orders",    label: "Orders",      icon: ShoppingCart },
  { href: "/admin/settings",  label: "Settings",    icon: Settings },
];

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const user = await getServerUser();
  if (!user) redirect("/account");

  const { data: profile } = await adminSupabase
    .from("profiles")
    .select("is_admin, first_name, last_name")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) redirect("/");

  const name = [profile.first_name, profile.last_name].filter(Boolean).join(" ") || user.email;

  return (
    <div className="min-h-screen flex bg-neutral-50">
      {/* Sidebar */}
      <aside className="w-60 bg-neutral-900 text-white flex flex-col shrink-0">
        {/* Logo */}
        <div className="px-6 py-5 border-b border-neutral-800">
          <Link href="/" className="flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-brand-400" />
            <span className="font-bold text-white">
              Book<span className="text-brand-400">Flow</span>
              <span className="text-xs text-neutral-400 ml-1 font-normal">Admin</span>
            </span>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-neutral-300 hover:bg-neutral-800 hover:text-white transition-colors group"
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="flex-1">{label}</span>
              <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-50 transition-opacity" />
            </Link>
          ))}
        </nav>

        {/* View storefront */}
        <div className="px-3 py-3 border-t border-neutral-800">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <BookOpen className="w-4 h-4" />
            View Storefront ↗
          </Link>
        </div>

        {/* User */}
        <div className="px-4 py-4 border-t border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-brand-500 flex items-center justify-center text-xs font-bold text-white shrink-0">
              {(name?.[0] ?? "A").toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-white truncate">{name}</p>
              <p className="text-xs text-neutral-500 truncate">{user.email}</p>
            </div>
            <Link href="/account" className="text-neutral-500 hover:text-white">
              <LogOut className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 min-w-0 flex flex-col">
        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  );
}
