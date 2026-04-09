import { adminSupabase } from "@/lib/supabase/admin";
import BookForm from "@/components/admin/BookForm";
import { createBook } from "../../actions";

export default async function NewBookPage() {
  const [authorsRes, genresRes, publishersRes] = await Promise.all([
    adminSupabase.from("authors").select("id, name").order("name"),
    adminSupabase.from("genres").select("id, name, slug, emoji").order("display_order"),
    adminSupabase.from("publishers").select("id, name").order("name"),
  ]);

  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-neutral-900">Add New Book</h1>
        <p className="text-sm text-neutral-500 mt-1">Fill in the details and publish when ready</p>
      </div>

      <BookForm
        authors={authorsRes.data ?? []}
        genres={genresRes.data ?? []}
        publishers={publishersRes.data ?? []}
        action={createBook}
        submitLabel="Create Book"
      />
    </div>
  );
}
