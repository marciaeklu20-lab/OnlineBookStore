import { notFound } from "next/navigation";
import Link from "next/link";
import { Star, BookOpen, Clock, Globe, ChevronRight } from "lucide-react";
import { getBookBySlug, getBooks } from "@/lib/supabase/queries";
import AddToCartButton from "@/components/books/AddToCartButton";
import BookCard from "@/components/books/BookCard";

type Props = {
  params: Promise<{ slug: string }>;
};

const FORMAT_LABELS: Record<string, string> = {
  paperback: "Paperback",
  hardcover: "Hardcover",
  pdf: "PDF",
  epub: "EPUB",
  mobi: "MOBI",
  audiobook: "Audiobook",
};

const COVER_COLORS = [
  "bg-orange-200", "bg-amber-200", "bg-blue-200", "bg-green-200",
  "bg-purple-200", "bg-red-200", "bg-gray-300", "bg-teal-200",
  "bg-pink-200", "bg-indigo-200", "bg-cyan-200", "bg-lime-200",
];

function coverColor(id: string) {
  const sum = id.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return COVER_COLORS[sum % COVER_COLORS.length];
}

function StarRating({ rating, count }: { rating: number; count: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((s) => (
          <Star
            key={s}
            className={`w-4 h-4 ${
              s <= Math.round(rating)
                ? "fill-amber-400 text-amber-400"
                : "text-neutral-300"
            }`}
          />
        ))}
      </div>
      <span className="font-semibold text-sm text-neutral-800">
        {Number(rating).toFixed(1)}
      </span>
      <span className="text-sm text-neutral-500">({count} reviews)</span>
    </div>
  );
}

export default async function BookDetailPage({ params }: Props) {
  const { slug } = await params;
  const book = await getBookBySlug(slug);
  if (!book) notFound();

  const { books: related } = await getBooks({ limit: 4 });
  const relatedBooks = related.filter((b) => b.id !== book.id).slice(0, 4);

  const availableFormats = Object.entries(book.formats)
    .filter(([, v]) => v)
    .map(([fmt]) => fmt);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-neutral-500 mb-8">
        <Link href="/" className="hover:text-brand-500">Home</Link>
        <ChevronRight className="w-3 h-3" />
        <Link href="/shop" className="hover:text-brand-500">Shop</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-neutral-900 font-medium truncate max-w-xs">{book.title}</span>
      </nav>

      {/* Main detail */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-16">
        {/* Cover */}
        <div className="lg:col-span-2 flex justify-center">
          <div className={`relative ${coverColor(book.id)} rounded-2xl w-64 md:w-full max-w-xs aspect-[2/3] shadow-lg overflow-hidden`}>
            {book.cover_image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={book.cover_image_url}
                alt={book.title}
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                <BookOpen className="w-12 h-12 text-neutral-600/40 mb-3" />
                <p className="text-lg font-bold text-neutral-700 leading-tight">{book.title}</p>
                {book.authors && (
                  <p className="text-sm text-neutral-600 mt-2">{book.authors.name}</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="lg:col-span-3 flex flex-col gap-5">
          {/* Title & author */}
          <div>
            <h1 className="text-3xl font-bold text-neutral-900 leading-tight">{book.title}</h1>
            {book.authors && (
              <p className="mt-1 text-lg text-neutral-500">
                by <span className="text-brand-600 font-medium">{book.authors.name}</span>
              </p>
            )}
          </div>

          {/* Rating */}
          {book.avg_rating > 0 && (
            <StarRating rating={book.avg_rating} count={book.review_count} />
          )}

          {/* Meta */}
          <div className="flex flex-wrap gap-4 text-sm text-neutral-600">
            {book.page_count && (
              <div className="flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-neutral-400" />
                <span>{book.page_count} pages</span>
              </div>
            )}
            {book.estimated_reading_hours && (
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-neutral-400" />
                <span>{book.estimated_reading_hours}h read</span>
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-neutral-400" />
              <span>{book.language?.toUpperCase() ?? "EN"}</span>
            </div>
          </div>

          {/* Formats available */}
          {availableFormats.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {availableFormats.map((fmt) => (
                <span
                  key={fmt}
                  className="text-xs bg-neutral-100 text-neutral-600 px-3 py-1 rounded-full font-medium"
                >
                  {FORMAT_LABELS[fmt] ?? fmt}
                </span>
              ))}
            </div>
          )}

          {/* Description */}
          {book.description && (
            <p className="text-neutral-600 leading-relaxed border-t border-neutral-100 pt-5">
              {book.description}
            </p>
          )}

          {/* Add to cart */}
          <div className="border-t border-neutral-100 pt-5">
            <AddToCartButton book={book} />
          </div>

          {/* Author bio */}
          {book.authors?.bio && (
            <div className="bg-neutral-50 rounded-xl p-4 border border-neutral-100">
              <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1">About the Author</p>
              <p className="text-sm font-semibold text-neutral-800">{book.authors.name}</p>
              <p className="text-sm text-neutral-600 mt-1 leading-relaxed">{book.authors.bio}</p>
            </div>
          )}
        </div>
      </div>

      {/* Related books */}
      {relatedBooks.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-neutral-900 mb-5">You May Also Like</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
            {relatedBooks.map((b) => (
              <BookCard key={b.id} book={b} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
