import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import GenreForm from "@/components/admin/GenreForm";
import { createGenre } from "../../actions";

export default function NewGenrePage() {
  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <Link
          href="/admin/genres"
          className="flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-700 mb-3 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Genres
        </Link>
        <h1 className="text-2xl font-bold text-neutral-900">Add Genre</h1>
        <p className="text-sm text-neutral-500 mt-0.5">Create a new category for your catalog</p>
      </div>

      <GenreForm action={createGenre} submitLabel="Create Genre" />
    </div>
  );
}
