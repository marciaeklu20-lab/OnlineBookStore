"use client";

import Link from "next/link";
import { Pencil, Trash2, Globe, BookOpen, Building2 } from "lucide-react";
import { deletePublisher } from "../actions";

type Publisher = {
  id: string;
  name: string;
  country: string | null;
  website_url: string | null;
  book_count: number;
};

export default function PublishersTable({ publishers }: { publishers: Publisher[] }) {
  return (
    <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-neutral-100 bg-neutral-50">
            <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Publisher</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider hidden sm:table-cell">Country</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider hidden md:table-cell">Books</th>
            <th className="px-4 py-3 text-right text-xs font-semibold text-neutral-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-100">
          {publishers.map((pub) => (
            <tr key={pub.id} className="hover:bg-neutral-50 transition-colors">
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-neutral-100 flex items-center justify-center shrink-0">
                    <Building2 className="w-4 h-4 text-neutral-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-neutral-900 truncate">{pub.name}</p>
                    {pub.website_url && (
                      <a
                        href={pub.website_url}
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
              <td className="px-4 py-3 text-neutral-500 hidden sm:table-cell">{pub.country ?? "—"}</td>
              <td className="px-4 py-3 hidden md:table-cell">
                <div className="flex items-center gap-1.5 text-neutral-500">
                  <BookOpen className="w-3.5 h-3.5 text-neutral-400" />
                  {pub.book_count} {pub.book_count === 1 ? "book" : "books"}
                </div>
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-1 justify-end">
                  <Link
                    href={`/admin/publishers/${pub.id}/edit`}
                    className="p-2 text-neutral-400 hover:text-brand-500 hover:bg-brand-50 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <Pencil className="w-4 h-4" />
                  </Link>
                  <form
                    action={deletePublisher.bind(null, pub.id)}
                    onSubmit={(e) => {
                      if (!confirm(`Delete publisher "${pub.name}"?${pub.book_count > 0 ? ` It is linked to ${pub.book_count} book(s).` : ""}`))
                        e.preventDefault();
                    }}
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
