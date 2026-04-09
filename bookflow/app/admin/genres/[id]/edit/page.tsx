import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { adminSupabase } from "@/lib/supabase/admin";
import GenreForm from "@/components/admin/GenreForm";
import { updateGenre } from "../../../actions";

type Props = { params: Promise<{ id: string }> };

export default async function EditGenrePage({ params }: Props) {
  const { id } = await params;

  const { data: genre } = await adminSupabase
    .from("genres")
    .select("*")
    .eq("id", id)
    .single();

  if (!genre) notFound();

  const updateWithId = updateGenre.bind(null, id);

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <Link
          href="/admin/genres"
          className="flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-700 mb-3 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Genres
        </Link>
        <p className="text-sm text-neutral-500 mb-0.5">Editing</p>
        <h1 className="text-2xl font-bold text-neutral-900">
          {genre.emoji && <span className="mr-2">{genre.emoji}</span>}
          {genre.name}
        </h1>
      </div>

      <GenreForm genre={genre} action={updateWithId} submitLabel="Save Changes" />
    </div>
  );
}
