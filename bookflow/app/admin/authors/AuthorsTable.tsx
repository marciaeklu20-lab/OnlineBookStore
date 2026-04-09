"use client";

import Link from "next/link";
import { Pencil, Trash2, Globe, User } from "lucide-react";
import { deleteAuthor } from "../actions";

type Author = {
  id: string;
  name: string;
  bio: string | null;
  nationality: string | null;
  photo_url: string | null;
  website_url: string | null;
};

export default function AuthorsTable({ authors }: { authors: Author[] }) {
  return (
    <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-neutral-100 bg-neutral-50">
            <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Author</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider hidden sm:table-cell">Nationality</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider hidden md:table-cell">Bio</th>
            <th className="px-4 py-3 text-right text-xs font-semibold text-neutral-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-100">
          {authors.map((author) => (
            <tr key={author.id} className="hover:bg-neutral-50 transition-colors">
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  {author.photo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={author.photo_url}
                      alt={author.name}
                      className="w-9 h-9 rounded-full object-cover border border-neutral-100 shrink-0"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-brand-50 border border-neutral-100 flex items-center justify-center shrink-0">
                      <User className="w-4 h-4 text-brand-300" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="font-medium text-neutral-900 truncate">{author.name}</p>
                    {author.website_url && (
                      <a
                        href={author.website_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-neutral-400 hover:text-brand-500 flex items-center gap-0.5 mt-0.5"
                      >
                        <Globe className="w-3 h-3" /> Website
                      </a>
                    )}
                  </div>
                </div>
              </td>
              <td className="px-4 py-3 text-neutral-500 hidden sm:table-cell">{author.nationality ?? "—"}</td>
              <td className="px-4 py-3 text-neutral-500 hidden md:table-cell max-w-xs">
                <p className="truncate">{author.bio ?? "—"}</p>
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-1 justify-end">
                  <Link
                    href={`/admin/authors/${author.id}/edit`}
                    className="p-2 text-neutral-400 hover:text-brand-500 hover:bg-brand-50 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <Pencil className="w-4 h-4" />
                  </Link>
                  <form
                    action={deleteAuthor.bind(null, author.id)}
                    onSubmit={(e) => { if (!confirm(`Delete author "${author.name}"?`)) e.preventDefault(); }}
                  >
                    <button
                      type="submit"
                      className="p-2 text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </form>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
