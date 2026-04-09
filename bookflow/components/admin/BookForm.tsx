"use client";

import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import type { BookWithAuthor } from "@/lib/types";

type Author = { id: string; name: string };
type Genre  = { id: string; name: string; slug: string; emoji: string | null };
type Publisher = { id: string; name: string };

type Props = {
  book?: BookWithAuthor & { book_genres?: { genre_id: string }[] };
  authors: Author[];
  genres: Genre[];
  publishers: Publisher[];
  action: (formData: FormData) => Promise<void>;
  submitLabel: string;
};

const FORMATS = [
  { key: "fmt_paperback", label: "Paperback" },
  { key: "fmt_hardcover", label: "Hardcover" },
  { key: "fmt_pdf",       label: "PDF" },
  { key: "fmt_epub",      label: "EPUB" },
  { key: "fmt_mobi",      label: "MOBI" },
  { key: "fmt_audiobook", label: "Audiobook" },
];

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <div>
      <label className="block text-sm font-medium text-neutral-700 mb-1.5">{label}</label>
      {children}
      {hint && <p className="text-xs text-neutral-400 mt-1">{hint}</p>}
    </div>
  );
}

const inputClass = "w-full border border-neutral-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500";

export default function BookForm({ book, authors, genres, publishers, action, submitLabel }: Props) {
  const [, formAction, pending] = useActionState(async (_: unknown, formData: FormData) => {
    await action(formData);
    return null;
  }, null);

  const selectedGenreIds = book?.book_genres?.map((bg) => bg.genre_id) ?? [];

  return (
    <form action={formAction} className="space-y-8">
      {book?.slug && <input type="hidden" name="slug" value={book.slug} />}

      {/* Core Info */}
      <section className="bg-white border border-neutral-200 rounded-xl p-6 space-y-5">
        <h2 className="font-semibold text-neutral-900 text-base">Book Details</h2>

        <Field label="Title *">
          <input name="title" required defaultValue={book?.title} className={inputClass} placeholder="e.g. The Power of Habit" />
        </Field>

        <Field label="Description">
          <textarea
            name="description"
            rows={5}
            defaultValue={book?.description ?? ""}
            className={inputClass}
            placeholder="Write a compelling book description…"
          />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Author">
            <select name="author_id" defaultValue={book?.author_id ?? ""} className={inputClass}>
              <option value="">— Select author —</option>
              {authors.map((a) => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </Field>
          <Field label="Publisher">
            <select name="publisher_id" defaultValue={book?.publisher_id ?? ""} className={inputClass}>
              <option value="">— Select publisher —</option>
              {publishers.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </Field>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Field label="ISBN">
            <input name="isbn" defaultValue={book?.isbn ?? ""} className={inputClass} placeholder="978-..." />
          </Field>
          <Field label="Pages">
            <input name="page_count" type="number" defaultValue={book?.page_count ?? ""} className={inputClass} placeholder="320" />
          </Field>
          <Field label="Language">
            <select name="language" defaultValue={book?.language ?? "en"} className={inputClass}>
              <option value="en">English</option>
              <option value="fr">French</option>
              <option value="es">Spanish</option>
              <option value="de">German</option>
              <option value="pt">Portuguese</option>
            </select>
          </Field>
        </div>

        <Field label="Publication Date">
          <input name="publication_date" type="date" defaultValue={book?.publication_date?.toString().split("T")[0] ?? ""} className={inputClass} />
        </Field>

        <Field label="Cover Image URL" hint="Paste a direct image URL (e.g. from Unsplash or your CDN)">
          <input name="cover_image_url" defaultValue={book?.cover_image_url ?? ""} className={inputClass} placeholder="https://..." />
        </Field>
      </section>

      {/* Genres */}
      <section className="bg-white border border-neutral-200 rounded-xl p-6 space-y-4">
        <h2 className="font-semibold text-neutral-900 text-base">Genres</h2>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {genres.map((g) => (
            <label key={g.id} className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                name="genre_ids"
                value={g.id}
                defaultChecked={selectedGenreIds.includes(g.id)}
                className="rounded border-neutral-300 text-brand-500 focus:ring-brand-500"
              />
              <span>{g.emoji} {g.name}</span>
            </label>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="bg-white border border-neutral-200 rounded-xl p-6 space-y-4">
        <h2 className="font-semibold text-neutral-900 text-base">Pricing (GHS)</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { name: "price_paperback", label: "Paperback" },
            { name: "price_hardcover", label: "Hardcover" },
            { name: "price_digital",   label: "Digital (PDF/EPUB)" },
            { name: "price_audiobook", label: "Audiobook" },
          ].map((f) => (
            <Field key={f.name} label={f.label}>
              <input
                name={f.name}
                type="number"
                step="0.01"
                min="0"
                defaultValue={book?.[f.name as keyof BookWithAuthor]?.toString() ?? ""}
                className={inputClass}
                placeholder="0.00"
              />
            </Field>
          ))}
        </div>
        <div className="flex items-center gap-6 pt-2">
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" name="is_on_sale" defaultChecked={book?.is_on_sale} className="rounded border-neutral-300 text-red-500" />
            <span className="font-medium">On Sale</span>
          </label>
          <Field label="Sale Price">
            <input name="sale_price" type="number" step="0.01" min="0" defaultValue={book?.sale_price?.toString() ?? ""} className={`${inputClass} w-32`} placeholder="0.00" />
          </Field>
        </div>
      </section>

      {/* Formats */}
      <section className="bg-white border border-neutral-200 rounded-xl p-6 space-y-4">
        <h2 className="font-semibold text-neutral-900 text-base">Available Formats</h2>
        <div className="flex flex-wrap gap-4">
          {FORMATS.map((fmt) => (
            <label key={fmt.key} className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                name={fmt.key}
                defaultChecked={book?.formats?.[fmt.key.replace("fmt_", "") as keyof typeof book.formats]}
                className="rounded border-neutral-300 text-brand-500"
              />
              <span>{fmt.label}</span>
            </label>
          ))}
        </div>
      </section>

      {/* Visibility & Flags */}
      <section className="bg-white border border-neutral-200 rounded-xl p-6 space-y-4">
        <h2 className="font-semibold text-neutral-900 text-base">Visibility & Labels</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {[
            { name: "published",  label: "Published",  hint: "Visible on storefront",       checked: book?.published ?? true },
            { name: "featured",   label: "Featured",   hint: "Show in featured sections",   checked: book?.featured ?? false },
            { name: "bestseller", label: "Bestseller", hint: "Show bestseller badge",        checked: book?.bestseller ?? false },
          ].map((flag) => (
            <label key={flag.name} className="flex items-start gap-3 border border-neutral-200 rounded-xl p-4 cursor-pointer hover:border-brand-300 transition-colors">
              <input
                type="checkbox"
                name={flag.name}
                defaultChecked={flag.checked}
                className="mt-0.5 rounded border-neutral-300 text-brand-500"
              />
              <div>
                <p className="text-sm font-medium text-neutral-900">{flag.label}</p>
                <p className="text-xs text-neutral-500">{flag.hint}</p>
              </div>
            </label>
          ))}
        </div>
      </section>

      {/* Submit */}
      <div className="flex items-center gap-3 justify-end">
        <a href="/admin/books" className="px-5 py-2.5 text-sm text-neutral-600 hover:text-neutral-900 border border-neutral-200 rounded-lg">
          Cancel
        </a>
        <button
          type="submit"
          disabled={pending}
          className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 disabled:opacity-60 text-white font-semibold px-6 py-2.5 rounded-lg text-sm transition-colors"
        >
          {pending && <Loader2 className="w-4 h-4 animate-spin" />}
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
