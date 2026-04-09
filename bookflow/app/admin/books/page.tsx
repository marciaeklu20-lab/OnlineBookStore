import Link from "next/link";
import Image from "next/image";
import { Plus, Pencil, Eye, EyeOff, Trash2, Star, BookOpen, TrendingUp, Tag, Search } from "lucide-react";
import { adminSupabase } from "@/lib/supabase/admin";
import { togglePublished, deleteBook } from "../actions";

type BookRow = {
  id: string; title: string; slug: string; published: boolean;
  featured: boolean; bestseller: boolean; price_paperback: number | null;
  price_digital: number | null; is_on_sale: boolean; sale_price: number | null;
  avg_rating: number; review_count: number; cover_image_url: string | null;
  stock_quantity: number | null;
  authors: { name: string } | null;
};

type SearchParams = { q?: string; status?: string };

async function getBooks(search: string, status: string) {
  let query = adminSupabase
    .from("books")
    .select("id, title, slug, published, featured, bestseller, price_paperback, price_digital, is_on_sale, sale_price, avg_rating, review_count, cover_image_url, stock_quantity, authors(name)")
    .order("created_at", { ascending: false });

  if (search) {
    query = query.ilike("title", `%${search}%`);
  }

  if (status === "published") query = query.eq("published", true);
  else if (status === "draft") query = query.eq("published", false);
  else if (status === "featured") query = query.eq("featured", true);
  else if (status === "sale") query = query.eq("is_on_sale", true);

  const { data } = await query;
  return (data ?? []) as unknown as BookRow[];
}

async function getStats() {
  const [total, published, featured, sale] = await Promise.all([
    adminSupabase.from("books").select("id", { count: "exact", head: true }),
    adminSupabase.from("books").select("id", { count: "exact", head: true }).eq("published", true),
    adminSupabase.from("books").select("id", { count: "exact", head: true }).eq("featured", true),
    adminSupabase.from("books").select("id", { count: "exact", head: true }).eq("is_on_sale", true),
  ]);
  return {
    total: total.count ?? 0,
    published: published.count ?? 0,
    featured: featured.count ?? 0,
    sale: sale.count ?? 0,
  };
}

const STATUS_TABS = [
  { key: "all",       label: "All" },
  { key: "published", label: "Published" },
  { key: "draft",     label: "Draft" },
  { key: "featured",  label: "Featured" },
  { key: "sale",      label: "On Sale" },
];

export default async function AdminBooksPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { q = "", status = "all" } = await searchParams;
  const [books, stats] = await Promise.all([getBooks(q, status), getStats()]);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Books</h1>
          <p className="text-sm text-neutral-500 mt-0.5">Manage your catalog</p>
        </div>
        <Link
          href="/admin/books/new"
          className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-semibold px-4 py-2.5 rounded-lg text-sm transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Book
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Books",  value: stats.total,     icon: BookOpen,    color: "text-brand-600 bg-brand-50" },
          { label: "Published",    value: stats.published, icon: Eye,         color: "text-green-600 bg-green-50" },
          { label: "Featured",     value: stats.featured,  icon: TrendingUp,  color: "text-amber-600 bg-amber-50" },
          { label: "On Sale",      value: stats.sale,      icon: Tag,         color: "text-red-600 bg-red-50" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white border border-neutral-200 rounded-xl p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${color}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-neutral-900">{value}</p>
              <p className="text-xs text-neutral-500">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search + Filter bar */}
      <div className="bg-white border border-neutral-200 rounded-xl mb-0 overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 px-4 pt-4 pb-3 border-b border-neutral-100">
          {/* Search */}
          <form method="GET" className="relative flex-1 max-w-sm">
            <input type="hidden" name="status" value={status} />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              name="q"
              defaultValue={q}
              placeholder="Search by title…"
              className="w-full border border-neutral-200 rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            />
          </form>

          {/* Status tabs */}
          <div className="flex items-center gap-1 flex-wrap">
            {STATUS_TABS.map((tab) => (
              <Link
                key={tab.key}
                href={`/admin/books?status=${tab.key}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  status === tab.key
                    ? "bg-brand-500 text-white"
                    : "text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700"
                }`}
              >
                {tab.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Table */}
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-100 bg-neutral-50">
              <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Book</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider hidden sm:table-cell">Price</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider hidden md:table-cell">Rating</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider hidden lg:table-cell">Stock</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider hidden md:table-cell">Labels</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Status</th>
              <th className="px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {books.map((book) => (
              <tr key={book.id} className="hover:bg-neutral-50 transition-colors group">
                {/* Book */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {book.cover_image_url ? (
                      <Image
                        src={book.cover_image_url}
                        alt={book.title}
                        width={36}
                        height={48}
                        className="rounded object-cover shrink-0 border border-neutral-100"
                        style={{ width: 36, height: 48 }}
                      />
                    ) : (
                      <div className="w-9 h-12 rounded bg-neutral-100 border border-neutral-200 flex items-center justify-center shrink-0">
                        <BookOpen className="w-4 h-4 text-neutral-300" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="font-medium text-neutral-900 leading-tight truncate max-w-[160px] lg:max-w-[240px]">{book.title}</p>
                      <p className="text-xs text-neutral-500 mt-0.5 truncate">{book.authors?.name ?? "—"}</p>
                    </div>
                  </div>
                </td>

                {/* Price */}
                <td className="px-4 py-3 text-neutral-700 hidden sm:table-cell">
                  {book.is_on_sale && book.sale_price ? (
                    <div>
                      <p className="font-semibold text-red-600">GHS {book.sale_price}</p>
                      <p className="text-xs text-neutral-400 line-through">GHS {book.price_paperback}</p>
                    </div>
                  ) : (
                    <span>GHS {book.price_paperback ?? book.price_digital ?? "—"}</span>
                  )}
                </td>

                {/* Rating */}
                <td className="px-4 py-3 hidden md:table-cell">
                  {book.avg_rating > 0 ? (
                    <div className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span className="text-neutral-700">{Number(book.avg_rating).toFixed(1)}</span>
                      <span className="text-neutral-400 text-xs">({book.review_count})</span>
                    </div>
                  ) : (
                    <span className="text-neutral-300">—</span>
                  )}
                </td>

                {/* Stock */}
                <td className="px-4 py-3 hidden lg:table-cell">
                  {book.stock_quantity != null ? (
                    <span className={`text-sm font-medium ${book.stock_quantity === 0 ? "text-red-500" : book.stock_quantity < 5 ? "text-amber-600" : "text-neutral-700"}`}>
                      {book.stock_quantity === 0 ? "Out of stock" : `${book.stock_quantity} left`}
                    </span>
                  ) : (
                    <span className="text-neutral-300">—</span>
                  )}
                </td>

                {/* Labels */}
                <td className="px-4 py-3 hidden md:table-cell">
                  <div className="flex flex-wrap gap-1">
                    {book.featured && (
                      <span className="text-xs bg-brand-100 text-brand-700 px-2 py-0.5 rounded-full font-medium">Featured</span>
                    )}
                    {book.bestseller && (
                      <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">Bestseller</span>
                    )}
                    {book.is_on_sale && (
                      <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-medium">Sale</span>
                    )}
                    {!book.featured && !book.bestseller && !book.is_on_sale && (
                      <span className="text-neutral-300 text-xs">—</span>
                    )}
                  </div>
                </td>

                {/* Status toggle */}
                <td className="px-4 py-3">
                  <form action={togglePublished.bind(null, book.id, !book.published)}>
                    <button
                      type="submit"
                      className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full font-medium border transition-colors ${
                        book.published
                          ? "bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                          : "bg-neutral-100 text-neutral-500 border-neutral-200 hover:bg-neutral-200"
                      }`}
                    >
                      {book.published
                        ? <><Eye className="w-3 h-3" /> Published</>
                        : <><EyeOff className="w-3 h-3" /> Draft</>}
                    </button>
                  </form>
                </td>

                {/* Actions */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1 justify-end">
                    <Link
                      href={`/books/${book.slug}`}
                      target="_blank"
                      className="p-2 text-neutral-400 hover:text-brand-500 hover:bg-brand-50 rounded-lg transition-colors"
                      title="View on storefront"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                    <Link
                      href={`/admin/books/${book.id}/edit`}
                      className="p-2 text-neutral-400 hover:text-brand-500 hover:bg-brand-50 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Pencil className="w-4 h-4" />
                    </Link>
                    <form
                      action={deleteBook.bind(null, book.id)}
                      onSubmit={(e) => { if (!confirm(`Delete "${book.title}"?`)) e.preventDefault(); }}
                    >
                      <button
                        type="submit"
                        className="p-2 text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {books.length === 0 && (
          <div className="py-16 text-center">
            <BookOpen className="w-10 h-10 text-neutral-200 mx-auto mb-3" />
            <p className="text-neutral-400 text-sm font-medium">
              {q ? `No books matching "${q}"` : "No books yet."}
            </p>
            {!q && (
              <Link href="/admin/books/new" className="mt-3 inline-block text-brand-500 font-medium text-sm hover:text-brand-600">
                Add your first book →
              </Link>
            )}
          </div>
        )}

        {/* Footer row */}
        {books.length > 0 && (
          <div className="px-4 py-3 border-t border-neutral-100 bg-neutral-50 text-xs text-neutral-400">
            Showing {books.length} {books.length === 1 ? "book" : "books"}
            {q && ` matching "${q}"`}
            {status !== "all" && ` · filtered by ${status}`}
          </div>
        )}
      </div>
    </div>
  );
}
