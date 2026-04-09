import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { adminSupabase } from "@/lib/supabase/admin";
import PublisherForm from "@/components/admin/PublisherForm";
import { updatePublisher } from "../../../actions";

type Props = { params: Promise<{ id: string }> };

export default async function EditPublisherPage({ params }: Props) {
  const { id } = await params;

  const { data: publisher } = await adminSupabase
    .from("publishers")
    .select("*")
    .eq("id", id)
    .single();

  if (!publisher) notFound();

  const updateWithId = updatePublisher.bind(null, id);

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <Link href="/admin/publishers" className="flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-700 mb-3 transition-colors">
          <ChevronLeft className="w-4 h-4" /> Back to Publishers
        </Link>
        <p className="text-sm text-neutral-500 mb-0.5">Editing</p>
        <h1 className="text-2xl font-bold text-neutral-900">{publisher.name}</h1>
      </div>
      <PublisherForm publisher={publisher} action={updateWithId} submitLabel="Save Changes" />
    </div>
  );
}
