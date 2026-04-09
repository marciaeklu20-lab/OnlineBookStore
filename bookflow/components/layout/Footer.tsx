import Link from "next/link";
import { BookOpen, Mail, Phone, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-neutral-900 text-neutral-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-brand-400" />
              <span className="text-lg font-bold text-white">
                Book<span className="text-brand-400">Flow</span>
              </span>
            </Link>
            <p className="text-sm leading-relaxed">
              Your premier destination for books of every genre. Discover, read, and connect with stories that matter.
            </p>
            <div className="flex gap-3">
              {["facebook", "instagram", "twitter", "youtube"].map((s) => (
                <a
                  key={s}
                  href="#"
                  className="w-8 h-8 rounded-full bg-neutral-700 hover:bg-brand-500 flex items-center justify-center transition-colors"
                  aria-label={s}
                >
                  <span className="text-xs capitalize">{s[0].toUpperCase()}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              {[
                { label: "Shop All Books", href: "/shop" },
                { label: "New Arrivals", href: "/shop?sort=newest" },
                { label: "Best Sellers", href: "/shop?sort=bestselling" },
                { label: "Books on Sale", href: "/shop?sale=true" },
                { label: "Blog", href: "/blog" },
                { label: "FAQ", href: "/faq" },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-brand-400 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Categories</h3>
            <ul className="space-y-2 text-sm">
              {["Fiction", "Non-Fiction", "Biography", "Business", "Science", "Self-Help", "Children", "Religion"].map(
                (cat) => (
                  <li key={cat}>
                    <Link
                      href={`/shop?category=${cat.toLowerCase()}`}
                      className="hover:text-brand-400 transition-colors"
                    >
                      {cat}
                    </Link>
                  </li>
                )
              )}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Contact Us</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5 text-brand-400 shrink-0" />
                <span>Accra, Ghana</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-brand-400 shrink-0" />
                <a href="tel:+233244498467" className="hover:text-brand-400 transition-colors">
                  +233-244-49-8467
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-brand-400 shrink-0" />
                <a href="mailto:support@bookflow.com" className="hover:text-brand-400 transition-colors">
                  support@bookflow.com
                </a>
              </li>
            </ul>
            <div className="mt-4">
              <p className="text-xs text-neutral-500 mb-1">Mon – Sat: 09:00 – 18:00</p>
            </div>

            {/* Newsletter */}
            <div className="mt-5">
              <p className="text-sm font-medium text-white mb-2">Get a free audiobook</p>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Your email"
                  className="flex-1 bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm placeholder-neutral-500 focus:outline-none focus:border-brand-500"
                />
                <button className="bg-brand-500 hover:bg-brand-600 text-white text-sm px-3 py-2 rounded-lg transition-colors">
                  Join
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-neutral-500">
          <p>© {new Date().getFullYear()} BookFlow. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-neutral-300">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-neutral-300">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
