import { notFound } from "next/navigation";
import { adminSupabase } from "@/lib/supabase/admin";
import BookForm from "@/components/admin/BookForm";
import { updateBook } from "../../../actions";

type Props = { params: Promise<{ id: string }> };

export default async function EditBookPage({ params }: Props) {
  const { id } = await params;

  const [bookRes, authorsRes, genresRes, publishersRes, genreLinksRes] = await Promise.all([
    adminSupabase.from("books").select("*").eq("id", id).single(),
    adminSupabase.from("authors").select("id, name").order("name"),
    adminSupabase.from("genres").select("id, name, slug, emoji").order("display_order"),
    adminSupabase.from("publishers").select("id, name").order("name"),
    adminSupabase.from("book_genres").select("genre_id").eq("book_id", id),
  ]);

  if (!bookRes.data) notFound();

  const book = {
    ...bookRes.data,
    authors: null,
    book_genres: genreLinksRes.data ?? [],
  };

  const updateWithId = updateBook.bind(null, id);

  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <p className="text-sm text-neutral-500 mb-1">Editing</p>
        <h1 className="text-2xl font-bold text-neutral-900">{book.title}</h1>
      </div>

      <BookForm
        book={book}
        authors={authorsRes.data ?? []}
        genres={genresRes.data ?? []}
        publishers={publishersRes.data ?? []}
        action={updateWithId}
        submitLabel="Save Changes"
      />
    </div>
  );
}
