import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import AuthorForm from "@/components/admin/AuthorForm";
import { createAuthor } from "../../actions";

export default function NewAuthorPage() {
  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <Link href="/admin/authors" className="flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-700 mb-3 transition-colors">
          <ChevronLeft className="w-4 h-4" /> Back to Authors
        </Link>
        <h1 className="text-2xl font-bold text-neutral-900">Add Author</h1>
        <p className="text-sm text-neutral-500 mt-0.5">Create a new author profile</p>
      </div>
      <AuthorForm action={createAuthor} submitLabel="Create Author" />
    </div>
  );
}
