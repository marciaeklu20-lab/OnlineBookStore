import Link from "next/link";
import { Library, Users, Eye, EyeOff, Star, Plus } from "lucide-react";
import { adminSupabase } from "@/lib/supabase/admin";

async function getStats() {
  const [booksRes, authorsRes, publishedRes, featuredRes] = await Promise.all([
    adminSupabase.from("books").select("id", { count: "exact", head: true }),
    adminSupabase.from("authors").select("id", { count: "exact", head: true }),
    adminSupabase.from("books").select("id", { count: "exact", head: true }).eq("published", true),
    adminSupabase.from("books").select("id", { count: "exact", head: true }).eq("featured", true),
  ]);

  return {
    total:     booksRes.count ?? 0,
    authors:   authorsRes.count ?? 0,
    published: publishedRes.count ?? 0,
    unpublished: (booksRes.count ?? 0) - (publishedRes.count ?? 0),
    featured:  featuredRes.count ?? 0,
  };
}

async function getRecentBooks() {
  const { data } = await adminSupabase
    .from("books")
    .select("id, title, slug, published, featured, bestseller, price_paperback, authors(name)")
    .order("created_at", { ascending: false })
    .limit(5);
  return data ?? [];
}

export default async function AdminDashboard() {
  const [stats, recentBooks] = await Promise.all([getStats(), getRecentBooks()]);

  const cards = [
    { label: "Total Books",   value: stats.total,       icon: Library, color: "bg-blue-50 text-blue-600" },
    { label: "Published",     value: stats.published,   icon: Eye,     color: "bg-green-50 text-green-600" },
    { label: "Unpublished",   value: stats.unpublished, icon: EyeOff,  color: "bg-amber-50 text-amber-600" },
    { label: "Authors",       value: stats.authors,     icon: Users,   color: "bg-purple-50 text-purple-600" },
    { label: "Featured",      value: stats.featured,    icon: Star,    color: "bg-brand-50 text-brand-600" },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Dashboard</h1>
          <p className="text-sm text-neutral-500 mt-1">Manage your BookFlow storefront</p>
        </div>
        <Link
          href="/admin/books/new"
          className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-semibold px-4 py-2.5 rounded-lg text-sm transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Book
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {cards.map((card) => (
          <div key={card.label} className="bg-white border border-neutral-200 rounded-xl p-5">
            <div className={`w-9 h-9 rounded-lg ${card.color} flex items-center justify-center mb-3`}>
              <card.icon className="w-5 h-5" />
            </div>
            <p className="text-2xl font-bold text-neutral-900">{card.value}</p>
            <p className="text-xs text-neutral-500 mt-0.5">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Recent books */}
      <div className="bg-white border border-neutral-200 rounded-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
          <h2 className="font-semibold text-neutral-900">Recent Books</h2>
          <Link href="/admin/books" className="text-sm text-brand-500 hover:text-brand-600">
            View all →
          </Link>
        </div>
        <div className="divide-y divide-neutral-100">
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {recentBooks.map((book: any) => (
            <div key={book.id} className="flex items-center justify-between px-6 py-4">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-neutral-900 truncate">{book.title}</p>
                <p className="text-sm text-neutral-500 truncate">{book.authors?.name}</p>
              </div>
              <div className="flex items-center gap-3 ml-4 shrink-0">
                {book.featured && (
                  <span className="text-xs bg-brand-100 text-brand-700 px-2 py-0.5 rounded-full font-medium">Featured</span>
                )}
                {book.bestseller && (
                  <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">Bestseller</span>
                )}
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  book.published
                    ? "bg-green-100 text-green-700"
                    : "bg-neutral-100 text-neutral-500"
                }`}>
                  {book.published ? "Published" : "Draft"}
                </span>
                <Link
                  href={`/admin/books/${book.id}/edit`}
                  className="text-sm text-brand-500 hover:text-brand-600 font-medium"
                >
                  Edit
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
