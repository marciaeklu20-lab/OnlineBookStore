import Link from "next/link";
import { Star, ShoppingCart } from "lucide-react";
import type { BookWithAuthor } from "@/lib/types";

// Deterministic placeholder color from book id
const COVER_COLORS = [
  "bg-orange-200", "bg-amber-200", "bg-blue-200", "bg-green-200",
  "bg-purple-200", "bg-red-200", "bg-gray-300", "bg-teal-200",
  "bg-pink-200", "bg-indigo-200", "bg-cyan-200", "bg-lime-200",
];

function coverColor(id: string) {
  const sum = id.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return COVER_COLORS[sum % COVER_COLORS.length];
}

export default function BookCard({ book }: { book: BookWithAuthor }) {
  const price = book.price_paperback ?? book.price_digital ?? 0;
  const displayPrice = book.is_on_sale && book.sale_price ? book.sale_price : price;

  const badge = book.bestseller ? "Bestseller" : book.featured ? "Featured" : book.is_on_sale ? "Sale" : null;

  return (
    <Link href={`/books/${book.slug}`} className="group flex flex-col">
      {/* Cover */}
      <div className={`relative ${coverColor(book.id)} rounded-lg aspect-[2/3] w-full flex items-end justify-center overflow-hidden shadow-sm group-hover:shadow-md transition-shadow`}>
        {book.cover_image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={book.cover_image_url}
            alt={book.title}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : null}
        {badge && (
          <span className={`absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-full z-10 ${
            badge === "Sale" ? "bg-red-500 text-white" :
            badge === "Bestseller" ? "bg-brand-500 text-white" :
            "bg-neutral-800 text-white"
          }`}>
            {badge}
          </span>
        )}
        <div className="w-full bg-black/10 px-3 py-2 relative z-10">
          <p className="text-xs font-semibold text-neutral-800 truncate">{book.title}</p>
        </div>
      </div>

      {/* Info */}
      <div className="mt-2 flex-1 min-w-0">
        <p className="text-sm font-semibold text-neutral-900 leading-tight line-clamp-1 group-hover:text-brand-600 transition-colors">
          {book.title}
        </p>
        <p className="text-xs text-neutral-500 mt-0.5 truncate">{book.authors?.name}</p>
        {book.avg_rating > 0 && (
          <div className="flex items-center gap-1 mt-1">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            <span className="text-xs font-medium text-neutral-700">{Number(book.avg_rating).toFixed(1)}</span>
            <span className="text-xs text-neutral-400">({book.review_count})</span>
          </div>
        )}
        <div className="flex items-center gap-2 mt-1">
          <p className="text-sm font-bold text-neutral-900">GHS {displayPrice}</p>
          {book.is_on_sale && book.sale_price && (
            <p className="text-xs text-neutral-400 line-through">GHS {price}</p>
          )}
        </div>
      </div>

      <button
        type="button"
        className="mt-2 w-full bg-brand-500 hover:bg-brand-600 text-white text-xs font-semibold py-2 rounded-lg transition-colors flex items-center justify-center gap-1.5"
      >
        <ShoppingCart className="w-3.5 h-3.5" />
        Add to Cart
      </button>
    </Link>
  );
}
