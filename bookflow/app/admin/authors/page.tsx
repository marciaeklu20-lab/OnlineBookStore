import Link from "next/link";
import { Plus, User } from "lucide-react";
import { adminSupabase } from "@/lib/supabase/admin";
import AuthorsTable from "./AuthorsTable";

export default async function AdminAuthorsPage() {
  const { data: authors } = await adminSupabase
    .from("authors")
    .select("id, name, bio, nationality, photo_url, website_url")
    .order("name");

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Authors</h1>
          <p className="text-sm text-neutral-500 mt-0.5">{authors?.length ?? 0} author{(authors?.length ?? 0) !== 1 ? "s" : ""}</p>
        </div>
        <Link
          href="/admin/authors/new"
          className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-semibold px-4 py-2.5 rounded-lg text-sm transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Author
        </Link>
      </div>

      {authors && authors.length > 0 ? (
        <AuthorsTable authors={authors} />
      ) : (
        <div className="bg-white border border-neutral-200 rounded-xl py-16 text-center">
          <User className="w-10 h-10 text-neutral-200 mx-auto mb-3" />
          <p className="text-neutral-400 text-sm font-medium">No authors yet.</p>
          <Link href="/admin/authors/new" className="mt-3 inline-block text-brand-500 font-medium text-sm hover:text-brand-600">
            Add your first author →
          </Link>
        </div>
      )}
    </div>
  );
}
