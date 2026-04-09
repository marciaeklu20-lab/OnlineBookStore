import Link from "next/link";
import { ArrowRight, TrendingUp, Tag, BookMarked } from "lucide-react";
import { getBestsellers, getGenres } from "@/lib/supabase/queries";
import BookCard from "@/components/books/BookCard";
import RecommendedBooks from "@/components/books/RecommendedBooks";
import type { Genre } from "@/lib/types";

const GENRE_COLORS: Record<string, string> = {
  fiction:      "bg-blue-50 hover:bg-blue-100 text-blue-700",
  "non-fiction":"bg-green-50 hover:bg-green-100 text-green-700",
  biography:    "bg-purple-50 hover:bg-purple-100 text-purple-700",
  business:     "bg-yellow-50 hover:bg-yellow-100 text-yellow-700",
  science:      "bg-cyan-50 hover:bg-cyan-100 text-cyan-700",
  "self-help":  "bg-emerald-50 hover:bg-emerald-100 text-emerald-700",
  children:     "bg-pink-50 hover:bg-pink-100 text-pink-700",
  religion:     "bg-amber-50 hover:bg-amber-100 text-amber-700",
  education:    "bg-indigo-50 hover:bg-indigo-100 text-indigo-700",
  technology:   "bg-slate-50 hover:bg-slate-100 text-slate-700",
  "young-adult":"bg-rose-50 hover:bg-rose-100 text-rose-700",
  history:      "bg-stone-50 hover:bg-stone-100 text-stone-700",
  romance:      "bg-red-50 hover:bg-red-100 text-red-700",
  thriller:     "bg-gray-100 hover:bg-gray-200 text-gray-700",
  philosophy:   "bg-violet-50 hover:bg-violet-100 text-violet-700",
};

function GenreCard({ genre }: { genre: Genre }) {
  const color = GENRE_COLORS[genre.slug] ?? "bg-neutral-50 hover:bg-neutral-100 text-neutral-700";
  return (
    <Link
      href={`/shop?category=${genre.slug}`}
      className={`${color} rounded-xl p-4 flex flex-col items-center gap-2 transition-colors`}
    >
      <span className="text-2xl">{genre.emoji ?? "📚"}</span>
      <span className="text-sm font-semibold text-center">{genre.name}</span>
    </Link>
  );
}

export default async function HomePage() {
  const [bestsellers, genres] = await Promise.all([
    getBestsellers(8),
    getGenres(),
  ]);

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
      {genres.length > 0 && (
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
            {genres.slice(0, 10).map((genre) => (
              <GenreCard key={genre.id} genre={genre} />
            ))}
          </div>
        </section>
      )}

      {/* Personalised Recommendations */}
      <RecommendedBooks />

      {/* Bestsellers */}
      {bestsellers.length > 0 && (
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
              {bestsellers.map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
          </div>
        </section>
      )}

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
