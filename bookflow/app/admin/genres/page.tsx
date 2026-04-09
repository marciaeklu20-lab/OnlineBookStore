import Link from "next/link";
import { Plus, Hash } from "lucide-react";
import { adminSupabase } from "@/lib/supabase/admin";
import GenreGrid from "./GenreGrid";

type Genre = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  emoji: string | null;
  display_order: number;
  book_count: number;
};

async function getGenres(): Promise<Genre[]> {
  const { data: genres } = await adminSupabase
    .from("genres")
    .select("id, name, slug, description, emoji, display_order")
    .order("display_order", { ascending: true });

  if (!genres || genres.length === 0) return [];

  const { data: counts } = await adminSupabase
    .from("book_genres")
    .select("genre_id");

  const countMap: Record<string, number> = {};
  (counts ?? []).forEach(({ genre_id }) => {
    countMap[genre_id] = (countMap[genre_id] ?? 0) + 1;
  });

  return genres.map((g) => ({ ...g, book_count: countMap[g.id] ?? 0 }));
}

export default async function AdminGenresPage() {
  const genres = await getGenres();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Genres</h1>
          <p className="text-sm text-neutral-500 mt-0.5">
            {genres.length} genre{genres.length !== 1 ? "s" : ""} · used to categorise books
          </p>
        </div>
        <Link
          href="/admin/genres/new"
          className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-semibold px-4 py-2.5 rounded-lg text-sm transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Genre
        </Link>
      </div>

      {genres.length > 0 ? (
        <GenreGrid genres={genres} />
      ) : (
        <div className="bg-white border border-neutral-200 rounded-xl py-16 text-center">
          <Hash className="w-10 h-10 text-neutral-200 mx-auto mb-3" />
          <p className="text-neutral-400 text-sm font-medium">No genres yet.</p>
          <Link href="/admin/genres/new" className="mt-3 inline-block text-brand-500 font-medium text-sm hover:text-brand-600">
            Add your first genre →
          </Link>
        </div>
      )}
    </div>
  );
}
