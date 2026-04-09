import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import PublisherForm from "@/components/admin/PublisherForm";
import { createPublisher } from "../../actions";

export default function NewPublisherPage() {
  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <Link href="/admin/publishers" className="flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-700 mb-3 transition-colors">
          <ChevronLeft className="w-4 h-4" /> Back to Publishers
        </Link>
        <h1 className="text-2xl font-bold text-neutral-900">Add Publisher</h1>
        <p className="text-sm text-neutral-500 mt-0.5">Create a new publisher</p>
      </div>
      <PublisherForm action={createPublisher} submitLabel="Create Publisher" />
    </div>
  );
}
