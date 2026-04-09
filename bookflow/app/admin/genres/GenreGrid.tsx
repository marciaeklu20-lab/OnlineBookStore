"use client";

import Link from "next/link";
import { Pencil, Trash2, BookOpen, Hash, GripVertical } from "lucide-react";
import { deleteGenre } from "../actions";

type Genre = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  emoji: string | null;
  display_order: number;
  book_count: number;
};

export default function GenreGrid({ genres }: { genres: Genre[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {genres.map((genre) => (
        <div
          key={genre.id}
          className="bg-white border border-neutral-200 rounded-xl p-4 flex flex-col gap-3 hover:border-brand-300 hover:shadow-sm transition-all"
        >
          {/* Top row */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              {genre.emoji ? (
                <span className="text-2xl leading-none shrink-0">{genre.emoji}</span>
              ) : (
                <div className="w-9 h-9 rounded-lg bg-brand-50 flex items-center justify-center shrink-0">
                  <Hash className="w-4 h-4 text-brand-400" />
                </div>
              )}
              <div className="min-w-0">
                <p className="font-semibold text-neutral-900 truncate">{genre.name}</p>
                <p className="text-xs text-neutral-400 font-mono truncate">/{genre.slug}</p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-neutral-300 shrink-0">
              <GripVertical className="w-3.5 h-3.5" />
              <span className="text-xs">{genre.display_order}</span>
            </div>
          </div>

          {/* Description */}
          {genre.description && (
            <p className="text-xs text-neutral-500 leading-relaxed line-clamp-2">{genre.description}</p>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-1 border-t border-neutral-100 mt-auto">
            <div className="flex items-center gap-1.5 text-xs text-neutral-500">
              <BookOpen className="w-3.5 h-3.5 text-neutral-400" />
              <span>{genre.book_count} {genre.book_count === 1 ? "book" : "books"}</span>
            </div>
            <div className="flex items-center gap-1">
              <Link
                href={`/shop?category=${genre.slug}`}
                target="_blank"
                className="p-1.5 text-neutral-400 hover:text-brand-500 hover:bg-brand-50 rounded-lg transition-colors"
                title="View on storefront"
              >
                <BookOpen className="w-3.5 h-3.5" />
              </Link>
              <Link
                href={`/admin/genres/${genre.id}/edit`}
                className="p-1.5 text-neutral-400 hover:text-brand-500 hover:bg-brand-50 rounded-lg transition-colors"
                title="Edit"
              >
                <Pencil className="w-3.5 h-3.5" />
              </Link>
              <form
                action={deleteGenre.bind(null, genre.id)}
                onSubmit={(e) => {
                  if (!confirm(`Delete "${genre.name}"? This will remove it from ${genre.book_count} book(s).`))
                    e.preventDefault();
                }}
              >
                <button
                  type="submit"
                  className="p-1.5 text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
