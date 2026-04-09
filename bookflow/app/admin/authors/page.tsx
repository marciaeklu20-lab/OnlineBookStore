import Link from "next/link";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { adminSupabase } from "@/lib/supabase/admin";
import { deleteAuthor } from "../actions";

export default async function AdminAuthorsPage() {
  const { data: authors } = await adminSupabase
    .from("authors")
    .select("id, name, bio, nationality, photo_url")
    .order("name");

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Authors</h1>
          <p className="text-sm text-neutral-500 mt-1">{authors?.length ?? 0} authors</p>
        </div>
        <Link
          href="/admin/authors/new"
          className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-semibold px-4 py-2.5 rounded-lg text-sm transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Author
        </Link>
      </div>

      <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-100 bg-neutral-50">
              <th className="text-left px-6 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Author</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Nationality</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Bio</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-neutral-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {(authors ?? []).map((author) => (
              <tr key={author.id} className="hover:bg-neutral-50 transition-colors">
                <td className="px-6 py-4 font-medium text-neutral-900">{author.name}</td>
                <td className="px-4 py-4 text-neutral-500">{author.nationality ?? "—"}</td>
                <td className="px-4 py-4 text-neutral-500 max-w-xs">
                  <p className="truncate">{author.bio ?? "—"}</p>
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-2 justify-end">
                    <Link
                      href={`/admin/authors/${author.id}/edit`}
                      className="p-2 text-neutral-400 hover:text-brand-500 hover:bg-brand-50 rounded-lg transition-colors"
                    >
                      <Pencil className="w-4 h-4" />
                    </Link>
                    <form action={deleteAuthor.bind(null, author.id)}>
                      <button type="submit" className="p-2 text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!authors?.length && (
          <div className="py-16 text-center text-neutral-400 text-sm">No authors yet.</div>
        )}
      </div>
    </div>
  );
}
