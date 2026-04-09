import Link from "next/link";
import { Sparkles, ArrowRight } from "lucide-react";
import { getRecommendations } from "@/lib/supabase/queries";
import { getServerUser } from "@/lib/supabase/server";
import BookCard from "./BookCard";

export default async function RecommendedBooks() {
  const user = await getServerUser();
  const { books, reason } = await getRecommendations(user?.id ?? null, 8);

  if (books.length === 0) return null;

  const isPersonalised = reason === "Based on your reading interests";

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-brand-500" />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold text-neutral-900">
                {isPersonalised ? "Recommended for You" : "You Might Enjoy"}
              </h2>
              {isPersonalised && (
                <span className="text-xs bg-brand-100 text-brand-700 font-semibold px-2 py-0.5 rounded-full">
                  Personalised
                </span>
              )}
            </div>
            <p className="text-sm text-neutral-500 mt-0.5">{reason}</p>
          </div>
        </div>
        <Link
          href="/shop"
          className="text-sm text-brand-500 hover:text-brand-600 font-medium flex items-center gap-1"
        >
          View all <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
        {books.map((book) => (
          <BookCard key={book.id} book={book} />
        ))}
      </div>
    </section>
  );
}
