"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { Search, ShoppingCart, User, Menu, X, BookOpen, ChevronDown, LayoutDashboard, Package, Heart, LogOut } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { supabase } from "@/lib/supabase/client";

const categories = [
  "Fiction", "Non-Fiction", "Biography", "Business", "Science",
  "Self-Help", "Children", "Religion", "Education", "Technology",
];

type UserProfile = {
  first_name: string | null;
  last_name: string | null;
  email: string;
};

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const { count } = useCart();
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setProfile(null); return; }

      const { data } = await supabase
        .from("profiles")
        .select("first_name, last_name, email")
        .eq("id", user.id)
        .single();

      if (data) setProfile(data as UserProfile);
    }

    loadUser();

    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      loadUser();
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  // Close user menu on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  async function handleSignOut() {
    await supabase.auth.signOut();
    setProfile(null);
    setUserMenuOpen(false);
    window.location.href = "/";
  }

  const displayName = profile?.first_name
    ? profile.first_name
    : profile?.email?.split("@")[0] ?? "";

  const initials = profile?.first_name
    ? `${profile.first_name[0]}${profile.last_name?.[0] ?? ""}`.toUpperCase()
    : profile?.email?.[0]?.toUpperCase() ?? "?";

  return (
    <header className="w-full border-b border-neutral-200 bg-white sticky top-0 z-50">
      {/* Top bar */}
      <div className="bg-neutral-900 text-white text-xs text-center py-2 px-4">
        Free shipping on orders over GHS 200 &nbsp;·&nbsp; Call us: +233-244-49-8467
      </div>

      {/* Main nav */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <BookOpen className="w-7 h-7 text-brand-500" />
            <span className="text-xl font-bold text-neutral-900 tracking-tight">
              Book<span className="text-brand-500">Flow</span>
            </span>
          </Link>

          {/* Search — desktop */}
          <div className="hidden md:flex flex-1 max-w-xl mx-8">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search books, authors, genres…"
                className="w-full border border-neutral-300 rounded-full py-2 pl-4 pr-10 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
              />
              <button type="button" aria-label="Search" className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-brand-500">
                <Search className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">

            {/* User area */}
            {profile ? (
              <div className="hidden md:block relative" ref={userMenuRef}>
                <button
                  type="button"
                  onClick={() => setUserMenuOpen((o) => !o)}
                  className="flex items-center gap-2 text-sm text-neutral-700 hover:text-brand-500 transition-colors"
                >
                  {/* Avatar */}
                  <span className="w-8 h-8 rounded-full bg-brand-500 text-white text-xs font-bold flex items-center justify-center shrink-0">
                    {initials}
                  </span>
                  <span className="font-medium">Hi, {displayName}</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${userMenuOpen ? "rotate-180" : ""}`} />
                </button>

                {/* Dropdown */}
                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-52 bg-white border border-neutral-200 rounded-xl shadow-lg py-2 z-50">
                    <div className="px-4 py-2 border-b border-neutral-100 mb-1">
                      <p className="text-xs font-semibold text-neutral-900 truncate">{profile.first_name} {profile.last_name}</p>
                      <p className="text-xs text-neutral-400 truncate">{profile.email}</p>
                    </div>
                    {[
                      { href: "/dashboard",          label: "My Dashboard",   icon: LayoutDashboard },
                      { href: "/dashboard/orders",   label: "My Orders",      icon: Package },
                      { href: "/dashboard/wishlist", label: "Wishlist",       icon: Heart },
                    ].map(({ href, label, icon: Icon }) => (
                      <Link
                        key={href}
                        href={href}
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-sm text-neutral-600 hover:bg-brand-50 hover:text-brand-600 transition-colors"
                      >
                        <Icon className="w-3.5 h-3.5" />
                        {label}
                      </Link>
                    ))}
                    <div className="border-t border-neutral-100 mt-1 pt-1">
                      <button
                        type="button"
                        onClick={handleSignOut}
                        className="flex items-center gap-2.5 px-4 py-2 text-sm text-neutral-400 hover:text-red-500 hover:bg-red-50 transition-colors w-full text-left"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/account"
                className="hidden md:flex items-center gap-1.5 text-sm text-neutral-600 hover:text-brand-500 transition-colors"
              >
                <User className="w-5 h-5" />
                <span>Sign In</span>
              </Link>
            )}

            {/* Cart */}
            <Link
              href="/cart"
              className="relative flex items-center gap-1.5 text-sm text-neutral-600 hover:text-brand-500 transition-colors"
            >
              <ShoppingCart className="w-5 h-5" />
              <span className="hidden md:inline">Cart</span>
              {count > 0 && (
                <span className="absolute -top-2 -right-2 bg-brand-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {count > 9 ? "9+" : count}
                </span>
              )}
            </Link>

            {/* Mobile menu toggle */}
            <button
              type="button"
              className="md:hidden text-neutral-600"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Desktop nav links */}
        <nav className="hidden md:flex items-center gap-6 pb-3 text-sm font-medium text-neutral-700">
          <Link href="/" className="hover:text-brand-500 transition-colors">Home</Link>
          <Link href="/shop" className="hover:text-brand-500 transition-colors">Shop</Link>

          {/* Categories dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setCategoriesOpen(true)}
            onMouseLeave={() => setCategoriesOpen(false)}
          >
            <button type="button" className="flex items-center gap-1 hover:text-brand-500 transition-colors">
              Categories
              <svg className="w-3 h-3 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {categoriesOpen && (
              <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-neutral-200 rounded-lg shadow-lg py-2 z-50">
                {categories.map((cat) => (
                  <Link
                    key={cat}
                    href={`/shop?category=${cat.toLowerCase().replace(" ", "-")}`}
                    className="block px-4 py-2 text-sm text-neutral-700 hover:bg-brand-50 hover:text-brand-600"
                  >
                    {cat}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <Link href="/blog" className="hover:text-brand-500 transition-colors">Blog</Link>
          <Link href="/about" className="hover:text-brand-500 transition-colors">About</Link>
          <Link href="/contact" className="hover:text-brand-500 transition-colors">Contact</Link>
        </nav>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-neutral-200 bg-white px-4 py-4 space-y-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search books…"
              className="w-full border border-neutral-300 rounded-full py-2 pl-4 pr-10 text-sm focus:outline-none focus:border-brand-500"
            />
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          </div>

          {/* Mobile user info */}
          {profile && (
            <div className="flex items-center gap-3 py-2 border-b border-neutral-100">
              <span className="w-9 h-9 rounded-full bg-brand-500 text-white text-sm font-bold flex items-center justify-center shrink-0">
                {initials}
              </span>
              <div>
                <p className="text-sm font-semibold text-neutral-900">Hi, {displayName}!</p>
                <p className="text-xs text-neutral-400 truncate">{profile.email}</p>
              </div>
            </div>
          )}

          <nav className="flex flex-col gap-3 text-sm font-medium text-neutral-700">
            <Link href="/" onClick={() => setMenuOpen(false)}>Home</Link>
            <Link href="/shop" onClick={() => setMenuOpen(false)}>Shop</Link>
            <Link href="/blog" onClick={() => setMenuOpen(false)}>Blog</Link>
            <Link href="/about" onClick={() => setMenuOpen(false)}>About</Link>
            <Link href="/contact" onClick={() => setMenuOpen(false)}>Contact</Link>
            {profile ? (
              <>
                <Link href="/dashboard" onClick={() => setMenuOpen(false)}>My Dashboard</Link>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="text-left text-red-500 font-medium"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <Link href="/account" onClick={() => setMenuOpen(false)}>Sign In</Link>
            )}
          </nav>
          <div>
            <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">Categories</p>
            <div className="grid grid-cols-2 gap-1">
              {categories.map((cat) => (
                <Link
                  key={cat}
                  href={`/shop?category=${cat.toLowerCase().replace(" ", "-")}`}
                  className="text-sm text-neutral-600 hover:text-brand-500 py-1"
                  onClick={() => setMenuOpen(false)}
                >
                  {cat}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
