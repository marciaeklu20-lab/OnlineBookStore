import Link from "next/link";
import { Plus, Building2 } from "lucide-react";
import { adminSupabase } from "@/lib/supabase/admin";
import PublishersTable from "./PublishersTable";

export default async function AdminPublishersPage() {
  const { data: publishers } = await adminSupabase
    .from("publishers")
    .select("id, name, country, website_url, created_at")
    .order("name");

  // Count books per publisher
  const { data: books } = await adminSupabase
    .from("books")
    .select("publisher_id");

  const countMap: Record<string, number> = {};
  (books ?? []).forEach(({ publisher_id }) => {
    if (publisher_id) countMap[publisher_id] = (countMap[publisher_id] ?? 0) + 1;
  });

  const rows = (publishers ?? []).map((p) => ({ ...p, book_count: countMap[p.id] ?? 0 }));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Publishers</h1>
          <p className="text-sm text-neutral-500 mt-0.5">{rows.length} publisher{rows.length !== 1 ? "s" : ""}</p>
        </div>
        <Link
          href="/admin/publishers/new"
          className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-semibold px-4 py-2.5 rounded-lg text-sm transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Publisher
        </Link>
      </div>

      {rows.length > 0 ? (
        <PublishersTable publishers={rows} />
      ) : (
        <div className="bg-white border border-neutral-200 rounded-xl py-16 text-center">
          <Building2 className="w-10 h-10 text-neutral-200 mx-auto mb-3" />
          <p className="text-neutral-400 text-sm font-medium">No publishers yet.</p>
          <Link href="/admin/publishers/new" className="mt-3 inline-block text-brand-500 font-medium text-sm hover:text-brand-600">
            Add your first publisher →
          </Link>
        </div>
      )}
    </div>
  );
}
