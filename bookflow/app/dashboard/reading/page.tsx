"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BookOpen, CheckCircle, Clock, BookMarked } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type ProgressItem = {
  id: string;
  status: "want_to_read" | "reading" | "completed" | "abandoned";
  current_page: number | null;
  rating: number | null;
  notes: string | null;
  updated_at: string;
  books: {
    id: string; title: string; slug: string; cover_image_url: string | null;
    page_count: number | null; authors: { name: string } | null;
  };
};

const STATUS_META = {
  reading:      { label: "Currently Reading", color: "bg-green-100 text-green-700",  icon: BookOpen },
  want_to_read: { label: "Want to Read",       color: "bg-blue-100 text-blue-700",    icon: BookMarked },
  completed:    { label: "Completed",           color: "bg-amber-100 text-amber-700",  icon: CheckCircle },
  abandoned:    { label: "Abandoned",           color: "bg-neutral-100 text-neutral-500", icon: Clock },
};

const COVER_COLORS = [
  "bg-orange-200", "bg-amber-200", "bg-blue-200", "bg-green-200",
  "bg-purple-200", "bg-red-200", "bg-gray-300", "bg-teal-200",
];
function coverColor(id: string) {
  const sum = id.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return COVER_COLORS[sum % COVER_COLORS.length];
}

const STATUSES = ["reading", "want_to_read", "completed", "abandoned"] as const;

export default function ReadingPage() {
  const supabase = createClient();
  const [items, setItems] = useState<ProgressItem[]>([]);
  const [filter, setFilter] = useState<string>("reading");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("reading_progress")
        .select("id, status, current_page, rating, notes, updated_at, books(id, title, slug, cover_image_url, page_count, authors(name))")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false });
      setItems((data as unknown as ProgressItem[]) ?? []);
      setLoading(false);
    }
    load();
  }, [supabase]);

  async function updateStatus(id: string, status: ProgressItem["status"]) {
    await supabase.from("reading_progress").update({ status, updated_at: new Date().toISOString() }).eq("id", id);
    setItems((prev) => prev.map((i) => i.id === id ? { ...i, status } : i));
  }

  const filtered = items.filter((i) => i.status === filter);
  const counts = Object.fromEntries(STATUSES.map((s) => [s, items.filter((i) => i.status === s).length]));

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-40 bg-neutral-100 rounded animate-pulse" />
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-64 bg-neutral-100 rounded-xl animate-pulse" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Reading List</h1>
        <p className="text-sm text-neutral-500 mt-1">{items.length} book{items.length !== 1 ? "s" : ""} tracked</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        {STATUSES.map((s) => {
          const meta = STATUS_META[s];
          const Icon = meta.icon;
          return (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                filter === s ? "bg-brand-500 text-white" : "bg-white border border-neutral-200 text-neutral-600 hover:border-brand-300"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {meta.label}
              <span className={`text-xs ${filter === s ? "text-brand-100" : "text-neutral-400"}`}>({counts[s]})</span>
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white border border-neutral-200 rounded-xl py-16 text-center">
          <BookOpen className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
          <p className="text-neutral-500 font-medium">No books in this list yet</p>
          <Link href="/shop" className="mt-3 inline-block text-brand-500 hover:text-brand-600 text-sm font-medium">
            Find books to read →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {filtered.map((item) => {
            const book = item.books;
            const progress = book.page_count && item.current_page
              ? Math.round((item.current_page / book.page_count) * 100)
              : null;
            return (
              <div key={item.id} className="bg-white border border-neutral-200 rounded-xl overflow-hidden hover:border-brand-300 transition-colors">
                <Link href={`/books/${book.slug}`}>
                  <div className={`${coverColor(book.id)} h-44 overflow-hidden`}>
                    {book.cover_image_url ? (
                      <img src={book.cover_image_url} alt={book.title} className="w-full h-full object-cover" />
                    ) : null}
                  </div>
                </Link>
                <div className="p-3">
                  <Link href={`/books/${book.slug}`} className="font-semibold text-neutral-900 text-sm line-clamp-2 hover:text-brand-600 transition-colors">
                    {book.title}
                  </Link>
                  <p className="text-xs text-neutral-500 mt-0.5">{book.authors?.name}</p>

                  {progress !== null && (
                    <div className="mt-2">
                      <div className="flex justify-between text-xs text-neutral-400 mb-1">
                        <span>Progress</span><span>{progress}%</span>
                      </div>
                      <div className="h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                        <div className="h-full bg-brand-500 rounded-full" style={{ width: `${progress}%` }} />
                      </div>
                    </div>
                  )}

                  <select
                    value={item.status}
                    onChange={(e) => updateStatus(item.id, e.target.value as ProgressItem["status"])}
                    className="mt-3 w-full text-xs border border-neutral-200 rounded-lg px-2 py-1.5 text-neutral-600 bg-white focus:outline-none focus:border-brand-400"
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>{STATUS_META[s].label}</option>
                    ))}
                  </select>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
