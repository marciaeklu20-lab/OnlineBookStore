"use client";

import Link from "next/link";
import { useState } from "react";
import { Search, ShoppingCart, User, Menu, X, BookOpen } from "lucide-react";
import { useCart } from "@/context/CartContext";

const categories = [
  "Fiction", "Non-Fiction", "Biography", "Business", "Science",
  "Self-Help", "Children", "Religion", "Education", "Technology",
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const { count } = useCart();

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
            <Link
              href="/account"
              className="hidden md:flex items-center gap-1.5 text-sm text-neutral-600 hover:text-brand-500 transition-colors"
            >
              <User className="w-5 h-5" />
              <span>Sign In</span>
            </Link>
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
          <nav className="flex flex-col gap-3 text-sm font-medium text-neutral-700">
            <Link href="/" onClick={() => setMenuOpen(false)}>Home</Link>
            <Link href="/shop" onClick={() => setMenuOpen(false)}>Shop</Link>
            <Link href="/blog" onClick={() => setMenuOpen(false)}>Blog</Link>
            <Link href="/about" onClick={() => setMenuOpen(false)}>About</Link>
            <Link href="/contact" onClick={() => setMenuOpen(false)}>Contact</Link>
            <Link href="/account" onClick={() => setMenuOpen(false)}>Sign In</Link>
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
