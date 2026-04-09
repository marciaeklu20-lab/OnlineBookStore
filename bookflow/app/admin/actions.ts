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

// ── Genres ───────────────────────────────────────────────────

export async function createGenre(formData: FormData) {
  await requireAdmin();

  const name = formData.get("name") as string;
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  const { error } = await adminSupabase.from("genres").insert({
    name,
    slug,
    description:   formData.get("description") as string || null,
    emoji:         formData.get("emoji") as string || null,
    display_order: parseInt(formData.get("display_order") as string) || 0,
  });

  if (error) throw new Error(error.message);
  revalidatePath("/admin/genres");
  revalidatePath("/shop");
  redirect("/admin/genres");
}

export async function updateGenre(id: string, formData: FormData) {
  await requireAdmin();

  const name = formData.get("name") as string;
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  const { error } = await adminSupabase.from("genres").update({
    name,
    slug,
    description:   formData.get("description") as string || null,
    emoji:         formData.get("emoji") as string || null,
    display_order: parseInt(formData.get("display_order") as string) || 0,
  }).eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/admin/genres");
  revalidatePath("/shop");
  redirect("/admin/genres");
}

export async function deleteGenre(id: string) {
  await requireAdmin();
  // book_genres rows cascade via FK; just delete the genre
  await adminSupabase.from("genres").delete().eq("id", id);
  revalidatePath("/admin/genres");
  revalidatePath("/shop");
}

// ── Publishers ───────────────────────────────────────────────

export async function createPublisher(formData: FormData) {
  await requireAdmin();

  const { error } = await adminSupabase.from("publishers").insert({
    name:        formData.get("name") as string,
    website_url: formData.get("website_url") as string || null,
    country:     formData.get("country") as string || null,
  });

  if (error) throw new Error(error.message);
  revalidatePath("/admin/publishers");
  redirect("/admin/publishers");
}

export async function updatePublisher(id: string, formData: FormData) {
  await requireAdmin();

  const { error } = await adminSupabase.from("publishers").update({
    name:        formData.get("name") as string,
    website_url: formData.get("website_url") as string || null,
    country:     formData.get("country") as string || null,
  }).eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/admin/publishers");
  redirect("/admin/publishers");
}

export async function deletePublisher(id: string) {
  await requireAdmin();
  await adminSupabase.from("publishers").delete().eq("id", id);
  revalidatePath("/admin/publishers");
}

// ── Settings ─────────────────────────────────────────────────

export async function saveStoreSettings(formData: FormData) {
  await requireAdmin();

  const { error } = await adminSupabase.from("store_settings").upsert({
    id: 1,
    store_name:               formData.get("store_name") as string,
    store_tagline:            formData.get("store_tagline") as string || null,
    store_email:              formData.get("store_email") as string || null,
    store_phone:              formData.get("store_phone") as string || null,
    store_address:            formData.get("store_address") as string || null,
    store_city:               formData.get("store_city") as string || null,
    store_country:            formData.get("store_country") as string || null,
    currency:                 formData.get("currency") as string || "GHS",
    tax_enabled:              formData.get("tax_enabled") === "on",
    tax_rate:                 parseFloat(formData.get("tax_rate") as string) / 100 || 0.175,
    tax_label:                formData.get("tax_label") as string || null,
    free_shipping_threshold:  parseFloat(formData.get("free_shipping_threshold") as string) || 200,
    flat_shipping_rate:       parseFloat(formData.get("flat_shipping_rate") as string) || 15,
    maintenance_mode:         formData.get("maintenance_mode") === "on",
    updated_at:               new Date().toISOString(),
  });

  if (error) throw new Error(error.message);
  revalidatePath("/admin/settings");
  revalidatePath("/");
}

export async function updateAdminProfile(formData: FormData) {
  const user = await requireAdmin();

  const { error } = await adminSupabase.from("profiles").update({
    first_name: formData.get("first_name") as string || null,
    last_name:  formData.get("last_name") as string || null,
  }).eq("id", user.id);

  if (error) throw new Error(error.message);
  revalidatePath("/admin/settings");
  revalidatePath("/admin");
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
    birth_date:  formData.get("birth_date") as string || null,
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
    birth_date:  formData.get("birth_date") as string || null,
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
