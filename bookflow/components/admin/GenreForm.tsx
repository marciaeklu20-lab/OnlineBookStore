"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";

type Genre = {
  name?: string;
  slug?: string;
  description?: string | null;
  emoji?: string | null;
  display_order?: number;
};

type Props = {
  genre?: Genre;
  action: (formData: FormData) => Promise<void>;
  submitLabel: string;
};

const EMOJI_SUGGESTIONS = [
  "📚", "🔬", "🌍", "💼", "🧠", "❤️", "👶", "🙏", "✏️", "💻",
  "🎭", "🗺️", "🎨", "🎵", "⚽", "🍳", "🌿", "✈️", "💡", "🦸",
];

export default function GenreForm({ genre, action, submitLabel }: Props) {
  const [name, setName] = useState(genre?.name ?? "");
  const [emoji, setEmoji] = useState(genre?.emoji ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
            Genre Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Science Fiction"
            className="w-full border border-neutral-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
          />
          {name && (
            <p className="mt-1 text-xs text-neutral-400">
              Slug: <span className="font-mono">{name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}</span>
            </p>
          )}
        </div>

        {/* Emoji */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1.5">Emoji</label>
          <div className="flex items-center gap-3">
            <input
              type="text"
              name="emoji"
              value={emoji}
              onChange={(e) => setEmoji(e.target.value)}
              placeholder="📚"
              maxLength={2}
              className="w-20 border border-neutral-300 rounded-lg px-3 py-2.5 text-xl text-center focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            />
            <div className="flex flex-wrap gap-1.5">
              {EMOJI_SUGGESTIONS.map((e) => (
                <button
                  key={e}
                  type="button"
                  onClick={() => setEmoji(e)}
                  className={`text-xl p-1.5 rounded-lg border transition-colors ${
                    emoji === e
                      ? "border-brand-400 bg-brand-50"
                      : "border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50"
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1.5">Description</label>
          <textarea
            name="description"
            rows={3}
            defaultValue={genre?.description ?? ""}
            placeholder="A short description shown on the shop page…"
            className="w-full border border-neutral-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 resize-none"
          />
        </div>

        {/* Display Order */}
        <div className="max-w-xs">
          <label className="block text-sm font-medium text-neutral-700 mb-1.5">Display Order</label>
          <input
            type="number"
            name="display_order"
            defaultValue={genre?.display_order ?? 0}
            min={0}
            className="w-full border border-neutral-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
          />
          <p className="mt-1 text-xs text-neutral-400">Lower numbers appear first in the shop menu.</p>
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
        <Link
          href="/admin/genres"
          className="text-sm text-neutral-500 hover:text-neutral-700 transition-colors"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
