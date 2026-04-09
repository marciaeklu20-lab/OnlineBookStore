"use server";

import { revalidatePath } from "next/cache";
import { adminSupabase } from "@/lib/supabase/admin";
import { getServerUser } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

async function requireAdmin() {
  const user = await getServerUser();
  if (!user) redirect("/account");

  const { data } = await adminSupabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!data?.is_admin) redirect("/");
  return user;
}

// ── Books ────────────────────────────────────────────────────

export async function createBook(formData: FormData) {
  await requireAdmin();

  const title = formData.get("title") as string;
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  const formats = {
    pdf:       formData.get("fmt_pdf") === "on",
    epub:      formData.get("fmt_epub") === "on",
    mobi:      formData.get("fmt_mobi") === "on",
    hardcover: formData.get("fmt_hardcover") === "on",
    paperback: formData.get("fmt_paperback") === "on",
    audiobook: formData.get("fmt_audiobook") === "on",
  };

  const { data, error } = await adminSupabase
    .from("books")
    .insert({
      title,
      slug,
      description:      formData.get("description") as string,
      cover_image_url:  formData.get("cover_image_url") as string || null,
      author_id:        formData.get("author_id") as string || null,
      publisher_id:     formData.get("publisher_id") as string || null,
      isbn:             formData.get("isbn") as string || null,
      page_count:       parseInt(formData.get("page_count") as string) || null,
      publication_date: formData.get("publication_date") as string || null,
      language:         formData.get("language") as string || "en",
      price_paperback:  parseFloat(formData.get("price_paperback") as string) || null,
      price_digital:    parseFloat(formData.get("price_digital") as string) || null,
      price_hardcover:  parseFloat(formData.get("price_hardcover") as string) || null,
      price_audiobook:  parseFloat(formData.get("price_audiobook") as string) || null,
      is_on_sale:       formData.get("is_on_sale") === "on",
      sale_price:       parseFloat(formData.get("sale_price") as string) || null,
      featured:         formData.get("featured") === "on",
      bestseller:       formData.get("bestseller") === "on",
      published:        formData.get("published") === "on",
      formats,
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);

  // Assign genres
  const genreIds = formData.getAll("genre_ids") as string[];
  if (genreIds.length > 0) {
    await adminSupabase.from("book_genres").insert(
      genreIds.map((genre_id) => ({ book_id: data.id, genre_id }))
    );
  }

  revalidatePath("/admin/books");
  revalidatePath("/");
  revalidatePath("/shop");
  redirect("/admin/books");
}

export async function updateBook(id: string, formData: FormData) {
  await requireAdmin();

  const formats = {
    pdf:       formData.get("fmt_pdf") === "on",
    epub:      formData.get("fmt_epub") === "on",
    mobi:      formData.get("fmt_mobi") === "on",
    hardcover: formData.get("fmt_hardcover") === "on",
    paperback: formData.get("fmt_paperback") === "on",
    audiobook: formData.get("fmt_audiobook") === "on",
  };

  const { error } = await adminSupabase
    .from("books")
    .update({
      title:            formData.get("title") as string,
      description:      formData.get("description") as string,
      cover_image_url:  formData.get("cover_image_url") as string || null,
      author_id:        formData.get("author_id") as string || null,
      publisher_id:     formData.get("publisher_id") as string || null,
      isbn:             formData.get("isbn") as string || null,
      page_count:       parseInt(formData.get("page_count") as string) || null,
      publication_date: formData.get("publication_date") as string || null,
      language:         formData.get("language") as string || "en",
      price_paperback:  parseFloat(formData.get("price_paperback") as string) || null,
      price_digital:    parseFloat(formData.get("price_digital") as string) || null,
      price_hardcover:  parseFloat(formData.get("price_hardcover") as string) || null,
      price_audiobook:  parseFloat(formData.get("price_audiobook") as string) || null,
      is_on_sale:       formData.get("is_on_sale") === "on",
      sale_price:       parseFloat(formData.get("sale_price") as string) || null,
      featured:         formData.get("featured") === "on",
      bestseller:       formData.get("bestseller") === "on",
      published:        formData.get("published") === "on",
      formats,
      updated_at:       new Date().toISOString(),
    })
    .eq("id", id);

  if (error) throw new Error(error.message);

  // Replace genres
  await adminSupabase.from("book_genres").delete().eq("book_id", id);
  const genreIds = formData.getAll("genre_ids") as string[];
  if (genreIds.length > 0) {
    await adminSupabase.from("book_genres").insert(
      genreIds.map((genre_id) => ({ book_id: id, genre_id }))
    );
  }

  revalidatePath("/admin/books");
  revalidatePath(`/books/${formData.get("slug")}`);
  revalidatePath("/");
  revalidatePath("/shop");
  redirect("/admin/books");
}

export async function togglePublished(id: string, published: boolean) {
  await requireAdmin();

  await adminSupabase
    .from("books")
    .update({ published, updated_at: new Date().toISOString() })
    .eq("id", id);

  revalidatePath("/admin/books");
  revalidatePath("/");
  revalidatePath("/shop");
}

export async function deleteBook(id: string) {
  await requireAdmin();

  await adminSupabase.from("book_genres").delete().eq("book_id", id);
  await adminSupabase.from("books").delete().eq("id", id);

  revalidatePath("/admin/books");
  revalidatePath("/");
  revalidatePath("/shop");
}

// ── Authors ──────────────────────────────────────────────────

export async function createAuthor(formData: FormData) {
  await requireAdmin();

  const { error } = await adminSupabase.from("authors").insert({
    name:        formData.get("name") as string,
    bio:         formData.get("bio") as string || null,
    nationality: formData.get("nationality") as string || null,
    photo_url:   formData.get("photo_url") as string || null,
    website_url: formData.get("website_url") as string || null,
  });

  if (error) throw new Error(error.message);
  revalidatePath("/admin/authors");
  redirect("/admin/authors");
}

export async function updateAuthor(id: string, formData: FormData) {
  await requireAdmin();

  const { error } = await adminSupabase.from("authors").update({
    name:        formData.get("name") as string,
    bio:         formData.get("bio") as string || null,
    nationality: formData.get("nationality") as string || null,
    photo_url:   formData.get("photo_url") as string || null,
    website_url: formData.get("website_url") as string || null,
  }).eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/admin/authors");
  redirect("/admin/authors");
}

export async function deleteAuthor(id: string) {
  await requireAdmin();
  await adminSupabase.from("authors").delete().eq("id", id);
  revalidatePath("/admin/authors");
}
