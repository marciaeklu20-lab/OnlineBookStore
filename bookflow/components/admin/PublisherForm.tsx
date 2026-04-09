"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";

type Publisher = {
  name?: string;
  website_url?: string | null;
  country?: string | null;
};

type Props = {
  publisher?: Publisher;
  action: (formData: FormData) => Promise<void>;
  submitLabel: string;
};

export default function PublisherForm({ publisher, action, submitLabel }: Props) {
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

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1.5">
            Publisher Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="name"
            required
            defaultValue={publisher?.name ?? ""}
            placeholder="e.g. Penguin Random House"
            className="w-full border border-neutral-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1.5">Country</label>
          <input
            type="text"
            name="country"
            defaultValue={publisher?.country ?? ""}
            placeholder="e.g. United Kingdom"
            className="w-full border border-neutral-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1.5">Website</label>
          <input
            type="url"
            name="website_url"
            defaultValue={publisher?.website_url ?? ""}
            placeholder="https://publisher.com"
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
        <Link href="/admin/publishers" className="text-sm text-neutral-500 hover:text-neutral-700 transition-colors">
          Cancel
        </Link>
      </div>
    </form>
  );
}
