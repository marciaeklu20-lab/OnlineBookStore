import Link from "next/link";
import { SlidersHorizontal } from "lucide-react";
import { getBooks, getGenres } from "@/lib/supabase/queries";
import BookCard from "@/components/books/BookCard";

const SORT_OPTIONS = [
  { value: "newest",      label: "Newest" },
  { value: "bestselling", label: "Best Selling" },
  { value: "price_asc",   label: "Price: Low to High" },
  { value: "price_desc",  label: "Price: High to Low" },
  { value: "rating",      label: "Top Rated" },
];

type ShopPageProps = {
  searchParams: Promise<{
    category?: string;
    sort?: string;
    search?: string;
    sale?: string;
    page?: string;
  }>;
};

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const params = await searchParams;
  const category = params.category;
  const sort = (params.sort as "newest" | "bestselling" | "price_asc" | "price_desc" | "rating") ?? "newest";
  const search = params.search;
  const sale = params.sale === "true";
  const page = Math.max(1, parseInt(params.page ?? "1", 10));
  const limit = 12;
  const offset = (page - 1) * limit;

  const [{ books, count }, genres] = await Promise.all([
    getBooks({ genre: category, sort, search, sale, limit, offset }),
    getGenres(),
  ]);

  const totalPages = Math.ceil(count / limit);

  const buildUrl = (overrides: Record<string, string | undefined>) => {
    const p = { category, sort, search, sale: sale ? "true" : undefined, ...overrides };
    const qs = Object.entries(p)
      .filter(([, v]) => v !== undefined && v !== "")
      .map(([k, v]) => `${k}=${encodeURIComponent(v!)}`)
      .join("&");
    return `/shop${qs ? `?${qs}` : ""}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-neutral-900">
          {category
            ? genres.find((g) => g.slug === category)?.name ?? category
            : search
            ? `Results for "${search}"`
            : sale
            ? "Books on Sale"
            : "All Books"}
        </h1>
        <p className="text-sm text-neutral-500 mt-1">
          {count} book{count !== 1 ? "s" : ""} found
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Filters */}
        <aside className="lg:w-56 shrink-0">
          <div className="bg-white border border-neutral-200 rounded-xl p-4 sticky top-24">
            <div className="flex items-center gap-2 mb-4">
              <SlidersHorizontal className="w-4 h-4 text-neutral-500" />
              <span className="font-semibold text-sm text-neutral-700">Filters</span>
            </div>

            {/* Sort */}
            <div className="mb-5">
              <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">Sort by</p>
              <div className="flex flex-col gap-1">
                {SORT_OPTIONS.map((opt) => (
                  <Link
                    key={opt.value}
                    href={buildUrl({ sort: opt.value, page: "1" })}
                    className={`text-sm px-3 py-1.5 rounded-lg transition-colors ${
                      sort === opt.value
                        ? "bg-brand-500 text-white font-medium"
                        : "text-neutral-600 hover:bg-neutral-100"
                    }`}
                  >
                    {opt.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Categories */}
            <div className="mb-5">
              <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">Category</p>
              <div className="flex flex-col gap-1">
                <Link
                  href={buildUrl({ category: undefined, page: "1" })}
                  className={`text-sm px-3 py-1.5 rounded-lg transition-colors ${
                    !category
                      ? "bg-brand-500 text-white font-medium"
                      : "text-neutral-600 hover:bg-neutral-100"
                  }`}
                >
                  All Categories
                </Link>
                {genres.map((genre) => (
                  <Link
                    key={genre.id}
                    href={buildUrl({ category: genre.slug, page: "1" })}
                    className={`text-sm px-3 py-1.5 rounded-lg transition-colors flex items-center gap-2 ${
                      category === genre.slug
                        ? "bg-brand-500 text-white font-medium"
                        : "text-neutral-600 hover:bg-neutral-100"
                    }`}
                  >
                    <span>{genre.emoji}</span> {genre.name}
                  </Link>
                ))}
              </div>
            </div>

            {/* Sale */}
            <div>
              <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">Deals</p>
              <Link
                href={buildUrl({ sale: sale ? undefined : "true", page: "1" })}
                className={`text-sm px-3 py-1.5 rounded-lg transition-colors block ${
                  sale
                    ? "bg-red-500 text-white font-medium"
                    : "text-neutral-600 hover:bg-neutral-100"
                }`}
              >
                🏷️ On Sale
              </Link>
            </div>
          </div>
        </aside>

        {/* Book Grid */}
        <div className="flex-1 min-w-0">
          {books.length === 0 ? (
            <div className="text-center py-24">
              <p className="text-4xl mb-3">📚</p>
              <p className="text-lg font-semibold text-neutral-700">No books found</p>
              <p className="text-sm text-neutral-500 mt-1">Try adjusting your filters</p>
              <Link href="/shop" className="mt-4 inline-block text-brand-500 hover:text-brand-600 font-medium text-sm">
                Clear all filters
              </Link>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 xl:grid-cols-4 gap-5">
                {books.map((book) => (
                  <BookCard key={book.id} book={book} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-10">
                  {page > 1 && (
                    <Link
                      href={buildUrl({ page: String(page - 1) })}
                      className="px-4 py-2 text-sm border border-neutral-300 rounded-lg hover:bg-neutral-50 text-neutral-700"
                    >
                      ← Previous
                    </Link>
                  )}
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                    .reduce<(number | "...")[]>((acc, p, idx, arr) => {
                      if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push("...");
                      acc.push(p);
                      return acc;
                    }, [])
                    .map((p, i) =>
                      p === "..." ? (
                        <span key={`ellipsis-${i}`} className="px-2 text-neutral-400">…</span>
                      ) : (
                        <Link
                          key={p}
                          href={buildUrl({ page: String(p) })}
                          className={`px-4 py-2 text-sm rounded-lg border transition-colors ${
                            p === page
                              ? "bg-brand-500 text-white border-brand-500"
                              : "border-neutral-300 hover:bg-neutral-50 text-neutral-700"
                          }`}
                        >
                          {p}
                        </Link>
                      )
                    )}
                  {page < totalPages && (
                    <Link
                      href={buildUrl({ page: String(page + 1) })}
                      className="px-4 py-2 text-sm border border-neutral-300 rounded-lg hover:bg-neutral-50 text-neutral-700"
                    >
                      Next →
                    </Link>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
