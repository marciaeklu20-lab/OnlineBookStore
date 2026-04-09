import Link from "next/link";
import { Plus, Pencil, Eye, EyeOff, Trash2, Star } from "lucide-react";
import { adminSupabase } from "@/lib/supabase/admin";
import { togglePublished, deleteBook } from "../actions";

async function getAllBooks() {
  const { data } = await adminSupabase
    .from("books")
    .select("id, title, slug, published, featured, bestseller, price_paperback, price_digital, is_on_sale, sale_price, avg_rating, review_count, authors(name)")
    .order("created_at", { ascending: false });
  return data ?? [];
}

type BookRow = {
  id: string; title: string; slug: string; published: boolean;
  featured: boolean; bestseller: boolean; price_paperback: number | null;
  price_digital: number | null; is_on_sale: boolean; sale_price: number | null;
  avg_rating: number; review_count: number; authors: { name: string } | null;
};

export default async function AdminBooksPage() {
  const books = await getAllBooks() as unknown as BookRow[];

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Books</h1>
          <p className="text-sm text-neutral-500 mt-1">{books.length} books total</p>
        </div>
        <Link
          href="/admin/books/new"
          className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-semibold px-4 py-2.5 rounded-lg text-sm transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Book
        </Link>
      </div>

      <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-100 bg-neutral-50">
              <th className="text-left px-6 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Book</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Price</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Rating</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Labels</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Status</th>
              <th className="px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {books.map((book) => (
              <tr key={book.id} className="hover:bg-neutral-50 transition-colors">
                <td className="px-6 py-4">
                  <p className="font-medium text-neutral-900 leading-tight">{book.title}</p>
                  <p className="text-xs text-neutral-500 mt-0.5">{book.authors?.name}</p>
                </td>
                <td className="px-4 py-4 text-neutral-700">
                  {book.is_on_sale && book.sale_price ? (
                    <div>
                      <p className="font-semibold text-red-600">GHS {book.sale_price}</p>
                      <p className="text-xs text-neutral-400 line-through">GHS {book.price_paperback}</p>
                    </div>
                  ) : (
                    <span>GHS {book.price_paperback ?? book.price_digital ?? "—"}</span>
                  )}
                </td>
                <td className="px-4 py-4">
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
                <td className="px-4 py-4">
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
                  </div>
                </td>
                <td className="px-4 py-4">
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
                <td className="px-4 py-4">
                  <div className="flex items-center gap-2 justify-end">
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
                    <form action={deleteBook.bind(null, book.id)}
                      onSubmit={(e) => { if (!confirm(`Delete "${book.title}"?`)) e.preventDefault(); }}>
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
            <p className="text-neutral-400 text-sm">No books yet.</p>
            <Link href="/admin/books/new" className="mt-3 inline-block text-brand-500 font-medium text-sm hover:text-brand-600">
              Add your first book →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
