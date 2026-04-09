"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Heart, ShoppingCart, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useCart } from "@/context/CartContext";

type WishlistItem = {
  id: string;
  book_id: string;
  books: {
    id: string; title: string; slug: string; cover_image_url: string | null;
    price_paperback: number | null; price_digital: number | null;
    authors: { name: string } | null;
  };
};

const COVER_COLORS = [
  "bg-orange-200", "bg-amber-200", "bg-blue-200", "bg-green-200",
  "bg-purple-200", "bg-red-200", "bg-gray-300", "bg-teal-200",
];
function coverColor(id: string) {
  const sum = id.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return COVER_COLORS[sum % COVER_COLORS.length];
}

export default function WishlistPage() {
  const supabase = createClient();
  const { addItem } = useCart();
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("wishlists")
        .select("id, book_id, books(id, title, slug, cover_image_url, price_paperback, price_digital, authors(name))")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      setItems((data as unknown as WishlistItem[]) ?? []);
      setLoading(false);
    }
    load();
  }, [supabase]);

  async function removeItem(id: string) {
    await supabase.from("wishlists").delete().eq("id", id);
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  function addToCart(item: WishlistItem) {
    const book = item.books;
    const price = book.price_paperback ?? book.price_digital ?? 0;
    addItem({
      id: book.id,
      title: book.title,
      author: book.authors?.name ?? "",
      slug: book.slug,
      cover_image_url: book.cover_image_url,
      price,
      format: "Paperback",
      quantity: 1,
    });
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-40 bg-neutral-100 rounded animate-pulse" />
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="h-64 bg-neutral-100 rounded-xl animate-pulse" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Wishlist</h1>
        <p className="text-sm text-neutral-500 mt-1">{items.length} saved book{items.length !== 1 ? "s" : ""}</p>
      </div>

      {items.length === 0 ? (
        <div className="bg-white border border-neutral-200 rounded-xl py-16 text-center">
          <Heart className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
          <p className="text-neutral-500 font-medium">Your wishlist is empty</p>
          <Link href="/shop" className="mt-3 inline-block text-brand-500 hover:text-brand-600 text-sm font-medium">
            Discover books →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {items.map((item) => {
            const book = item.books;
            const price = book.price_paperback ?? book.price_digital ?? 0;
            return (
              <div key={item.id} className="bg-white border border-neutral-200 rounded-xl overflow-hidden group hover:border-brand-300 transition-colors">
                <Link href={`/books/${book.slug}`}>
                  <div className={`${coverColor(book.id)} h-44 overflow-hidden`}>
                    {book.cover_image_url ? (
                      <img src={book.cover_image_url} alt={book.title} className="w-full h-full object-cover" />
                    ) : null}
                  </div>
                </Link>
                <div className="p-3">
                  <Link href={`/books/${book.slug}`} className="font-semibold text-neutral-900 text-sm line-clamp-2 hover:text-brand-600 transition-colors">
                    {book.title}
                  </Link>
                  <p className="text-xs text-neutral-500 mt-0.5">{book.authors?.name}</p>
                  <p className="text-sm font-bold text-neutral-900 mt-2">GHS {price.toFixed(2)}</p>
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => addToCart(item)}
                      className="flex-1 flex items-center justify-center gap-1.5 bg-brand-500 hover:bg-brand-600 text-white text-xs font-semibold py-2 rounded-lg transition-colors"
                    >
                      <ShoppingCart className="w-3.5 h-3.5" /> Add to Cart
                    </button>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="p-2 text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
