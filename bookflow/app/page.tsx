import Link from "next/link";
import { ArrowRight, Star, TrendingUp, Tag, BookMarked } from "lucide-react";

const categories = [
  { name: "Fiction", emoji: "📖", href: "/shop?category=fiction", color: "bg-blue-50 hover:bg-blue-100 text-blue-700" },
  { name: "Non-Fiction", emoji: "🧠", href: "/shop?category=non-fiction", color: "bg-green-50 hover:bg-green-100 text-green-700" },
  { name: "Biography", emoji: "👤", href: "/shop?category=biography", color: "bg-purple-50 hover:bg-purple-100 text-purple-700" },
  { name: "Business", emoji: "💼", href: "/shop?category=business", color: "bg-yellow-50 hover:bg-yellow-100 text-yellow-700" },
  { name: "Science", emoji: "🔬", href: "/shop?category=science", color: "bg-cyan-50 hover:bg-cyan-100 text-cyan-700" },
  { name: "Self-Help", emoji: "🌱", href: "/shop?category=self-help", color: "bg-emerald-50 hover:bg-emerald-100 text-emerald-700" },
  { name: "Children", emoji: "🎨", href: "/shop?category=children", color: "bg-pink-50 hover:bg-pink-100 text-pink-700" },
  { name: "Religion", emoji: "✝️", href: "/shop?category=religion", color: "bg-amber-50 hover:bg-amber-100 text-amber-700" },
  { name: "Education", emoji: "🎓", href: "/shop?category=education", color: "bg-indigo-50 hover:bg-indigo-100 text-indigo-700" },
  { name: "Technology", emoji: "💻", href: "/shop?category=technology", color: "bg-slate-50 hover:bg-slate-100 text-slate-700" },
];

const featuredBooks = [
  { id: 1, title: "Atomic Habits", author: "James Clear", price: 45, rating: 4.9, reviews: 2341, badge: "Bestseller", cover: "bg-orange-200" },
  { id: 2, title: "The Alchemist", author: "Paulo Coelho", price: 38, rating: 4.8, reviews: 1892, badge: "Classic", cover: "bg-amber-200" },
  { id: 3, title: "Sapiens", author: "Yuval Noah Harari", price: 52, rating: 4.7, reviews: 3102, badge: "Popular", cover: "bg-blue-200" },
  { id: 4, title: "Rich Dad Poor Dad", author: "Robert Kiyosaki", price: 42, rating: 4.6, reviews: 1567, badge: "Bestseller", cover: "bg-green-200" },
  { id: 5, title: "The Power of Now", author: "Eckhart Tolle", price: 36, rating: 4.7, reviews: 1234, badge: null, cover: "bg-purple-200" },
  { id: 6, title: "Think and Grow Rich", author: "Napoleon Hill", price: 30, rating: 4.5, reviews: 2876, badge: "Sale", cover: "bg-red-200" },
  { id: 7, title: "1984", author: "George Orwell", price: 28, rating: 4.9, reviews: 4120, badge: "Classic", cover: "bg-gray-300" },
  { id: 8, title: "Deep Work", author: "Cal Newport", price: 44, rating: 4.6, reviews: 987, badge: null, cover: "bg-teal-200" },
];

function BookCard({ book }: { book: typeof featuredBooks[0] }) {
  return (
    <Link href={`/books/${book.id}`} className="group flex flex-col">
      <div className={`relative ${book.cover} rounded-lg aspect-[2/3] w-full flex items-end justify-center overflow-hidden shadow-sm group-hover:shadow-md transition-shadow`}>
        {book.badge && (
          <span className={`absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-full ${
            book.badge === "Sale" ? "bg-red-500 text-white" :
            book.badge === "Bestseller" ? "bg-brand-500 text-white" :
            "bg-neutral-800 text-white"
          }`}>
            {book.badge}
          </span>
        )}
        <div className="w-full bg-black/10 px-3 py-2">
          <p className="text-xs font-semibold text-neutral-800 truncate">{book.title}</p>
        </div>
      </div>
      <div className="mt-2 flex-1">
        <p className="text-sm font-semibold text-neutral-900 leading-tight line-clamp-1 group-hover:text-brand-600 transition-colors">
          {book.title}
        </p>
        <p className="text-xs text-neutral-500 mt-0.5">{book.author}</p>
        <div className="flex items-center gap-1 mt-1">
          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
          <span className="text-xs font-medium text-neutral-700">{book.rating}</span>
          <span className="text-xs text-neutral-400">({book.reviews.toLocaleString()})</span>
        </div>
        <p className="text-sm font-bold text-neutral-900 mt-1">GHS {book.price}</p>
      </div>
      <button type="button" className="mt-2 w-full bg-brand-500 hover:bg-brand-600 text-white text-xs font-semibold py-2 rounded-lg transition-colors">
        Add to Cart
      </button>
    </Link>
  );
}

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative bg-neutral-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-900/80 via-neutral-900 to-neutral-900" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="max-w-2xl">
            <span className="inline-block bg-brand-500/20 text-brand-300 text-xs font-semibold px-3 py-1 rounded-full mb-4 uppercase tracking-wider">
              New arrivals every week
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              Find Your Next <br />
              <span className="text-brand-400">Favourite Book</span>
            </h1>
            <p className="mt-4 text-neutral-300 text-lg leading-relaxed max-w-lg">
              Browse thousands of titles across every genre. From bestsellers to hidden gems — your next great read is here.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/shop"
                className="bg-brand-500 hover:bg-brand-600 text-white font-semibold px-6 py-3 rounded-full transition-colors flex items-center gap-2"
              >
                Shop Now <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/shop?sale=true"
                className="bg-white/10 hover:bg-white/20 text-white font-semibold px-6 py-3 rounded-full transition-colors flex items-center gap-2"
              >
                <Tag className="w-4 h-4" /> Books on Sale
              </Link>
            </div>
            <div className="mt-10 flex gap-8">
              {[
                { value: "10,000+", label: "Books" },
                { value: "500+", label: "Authors" },
                { value: "50,000+", label: "Happy Readers" },
              ].map((stat) => (
                <div key={stat.label}>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                  <p className="text-xs text-neutral-400">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-neutral-900">Browse by Category</h2>
            <p className="text-sm text-neutral-500 mt-1">Find exactly what you are looking for</p>
          </div>
          <Link href="/shop" className="text-sm text-brand-500 hover:text-brand-600 font-medium flex items-center gap-1">
            View all <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {categories.map((cat) => (
            <Link
              key={cat.name}
              href={cat.href}
              className={`${cat.color} rounded-xl p-4 flex flex-col items-center gap-2 transition-colors cursor-pointer`}
            >
              <span className="text-2xl">{cat.emoji}</span>
              <span className="text-sm font-semibold text-center">{cat.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Bestsellers */}
      <section className="bg-neutral-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-brand-500" />
              <div>
                <h2 className="text-2xl font-bold text-neutral-900">Bestselling Books</h2>
                <p className="text-sm text-neutral-500 mt-0.5">Most loved by our readers</p>
              </div>
            </div>
            <Link href="/shop?sort=bestselling" className="text-sm text-brand-500 hover:text-brand-600 font-medium flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
            {featuredBooks.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-gradient-to-r from-brand-500 to-brand-700 rounded-2xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-white">
            <div className="flex items-center gap-2 mb-2">
              <BookMarked className="w-5 h-5 text-brand-200" />
              <span className="text-brand-200 text-sm font-semibold uppercase tracking-wider">Newsletter</span>
            </div>
            <h3 className="text-2xl md:text-3xl font-bold">Get a FREE Audiobook</h3>
            <p className="mt-1 text-brand-100 text-sm">Subscribe and receive a free audiobook plus exclusive deals.</p>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 md:w-72 bg-white/20 border border-white/30 text-white placeholder-white/60 rounded-full px-4 py-3 text-sm focus:outline-none focus:bg-white/30"
            />
            <button type="button" className="bg-white text-brand-600 font-semibold px-5 py-3 rounded-full hover:bg-brand-50 transition-colors text-sm whitespace-nowrap">
              Subscribe
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
