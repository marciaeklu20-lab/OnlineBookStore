"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";

type Author = {
  name?: string;
  bio?: string | null;
  nationality?: string | null;
  photo_url?: string | null;
  website_url?: string | null;
  birth_date?: string | null;
};

type Props = {
  author?: Author;
  action: (formData: FormData) => Promise<void>;
  submitLabel: string;
};

export default function AuthorForm({ author, action, submitLabel }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [photoPreview, setPhotoPreview] = useState(author?.photo_url ?? "");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await action(new FormData(e.currentTarget));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white border border-neutral-200 rounded-xl p-6 space-y-5">

        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1.5">
            Full Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="name"
            required
            defaultValue={author?.name ?? ""}
            placeholder="e.g. Chinua Achebe"
            className="w-full border border-neutral-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
          />
        </div>

        {/* Nationality + Birth Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">Nationality</label>
            <input
              type="text"
              name="nationality"
              defaultValue={author?.nationality ?? ""}
              placeholder="e.g. Nigerian"
              className="w-full border border-neutral-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">Date of Birth</label>
            <input
              type="date"
              name="birth_date"
              defaultValue={author?.birth_date ?? ""}
              className="w-full border border-neutral-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            />
          </div>
        </div>

        {/* Bio */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1.5">Biography</label>
          <textarea
            name="bio"
            rows={4}
            defaultValue={author?.bio ?? ""}
            placeholder="A short biography shown on the author's page…"
            className="w-full border border-neutral-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 resize-none"
          />
        </div>

        {/* Photo URL */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1.5">Photo URL</label>
          <div className="flex gap-3">
            {photoPreview && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={photoPreview}
                alt="Preview"
                className="w-14 h-14 rounded-full object-cover border border-neutral-200 shrink-0"
                onError={() => setPhotoPreview("")}
              />
            )}
            <input
              type="url"
              name="photo_url"
              value={photoPreview}
              onChange={(e) => setPhotoPreview(e.target.value)}
              placeholder="https://…"
              className="flex-1 border border-neutral-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            />
          </div>
        </div>

        {/* Website */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1.5">Website</label>
          <input
            type="url"
            name="website_url"
            defaultValue={author?.website_url ?? ""}
            placeholder="https://authorwebsite.com"
            className="w-full border border-neutral-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
          />
        </div>

      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
          {error}
        </div>
      )}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 disabled:opacity-60 text-white font-semibold px-5 py-2.5 rounded-lg text-sm transition-colors"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {submitLabel}
        </button>
        <Link href="/admin/authors" className="text-sm text-neutral-500 hover:text-neutral-700 transition-colors">
          Cancel
        </Link>
      </div>
    </form>
  );
}
