import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { adminSupabase } from "@/lib/supabase/admin";
import AuthorForm from "@/components/admin/AuthorForm";
import { updateAuthor } from "../../../actions";

type Props = { params: Promise<{ id: string }> };

export default async function EditAuthorPage({ params }: Props) {
  const { id } = await params;

  const { data: author } = await adminSupabase
    .from("authors")
    .select("*")
    .eq("id", id)
    .single();

  if (!author) notFound();

  const updateWithId = updateAuthor.bind(null, id);

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <Link href="/admin/authors" className="flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-700 mb-3 transition-colors">
          <ChevronLeft className="w-4 h-4" /> Back to Authors
        </Link>
        <p className="text-sm text-neutral-500 mb-0.5">Editing</p>
        <h1 className="text-2xl font-bold text-neutral-900">{author.name}</h1>
      </div>
      <AuthorForm author={author} action={updateWithId} submitLabel="Save Changes" />
    </div>
  );
}
