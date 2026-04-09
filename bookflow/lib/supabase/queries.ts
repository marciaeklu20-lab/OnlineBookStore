import { createClient } from "@supabase/supabase-js";
import type { Book, Genre, BookWithAuthor } from "@/lib/types";

// Server-side client (uses service role for server components)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function getBestsellers(limit = 8): Promise<BookWithAuthor[]> {
  const { data, error } = await supabase
    .from("books")
    .select("*, authors(id, name)")
    .eq("bestseller", true)
    .order("sales_count", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("getBestsellers error:", error.message);
    return [];
  }
  return (data as BookWithAuthor[]) ?? [];
}

export async function getFeaturedBooks(limit = 4): Promise<BookWithAuthor[]> {
  const { data, error } = await supabase
    .from("books")
    .select("*, authors(id, name)")
    .eq("featured", true)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("getFeaturedBooks error:", error.message);
    return [];
  }
  return (data as BookWithAuthor[]) ?? [];
}

export async function getGenres(): Promise<Genre[]> {
  const { data, error } = await supabase
    .from("genres")
    .select("*")
    .order("display_order", { ascending: true });

  if (error) {
    console.error("getGenres error:", error.message);
    return [];
  }
  return data ?? [];
}

export async function getBooks({
  genre,
  sort = "newest",
  search,
  sale,
  limit = 24,
  offset = 0,
}: {
  genre?: string;
  sort?: "newest" | "bestselling" | "price_asc" | "price_desc" | "rating";
  search?: string;
  sale?: boolean;
  limit?: number;
  offset?: number;
} = {}): Promise<{ books: BookWithAuthor[]; count: number }> {
  let query = supabase
    .from("books")
    .select("*, authors(id, name)", { count: "exact" });

  if (search) {
    query = query.ilike("title", `%${search}%`);
  }

  if (sale) {
    query = query.eq("is_on_sale", true);
  }

  if (genre) {
    // filter via book_genres junction
    const { data: genreData } = await supabase
      .from("genres")
      .select("id")
      .eq("slug", genre)
      .single();

    if (genreData) {
      const { data: bookIds } = await supabase
        .from("book_genres")
        .select("book_id")
        .eq("genre_id", genreData.id);

      const ids = (bookIds ?? []).map((r: { book_id: string }) => r.book_id);
      if (ids.length === 0) return { books: [], count: 0 };
      query = query.in("id", ids);
    }
  }

  switch (sort) {
    case "bestselling":
      query = query.order("sales_count", { ascending: false });
      break;
    case "price_asc":
      query = query.order("price_paperback", { ascending: true });
      break;
    case "price_desc":
      query = query.order("price_paperback", { ascending: false });
      break;
    case "rating":
      query = query.order("avg_rating", { ascending: false });
      break;
    default:
      query = query.order("created_at", { ascending: false });
  }

  const { data, error, count } = await query.range(offset, offset + limit - 1);

  if (error) {
    console.error("getBooks error:", error.message);
    return { books: [], count: 0 };
  }

  return { books: (data as BookWithAuthor[]) ?? [], count: count ?? 0 };
}

export async function getBookBySlug(slug: string): Promise<BookWithAuthor | null> {
  const { data, error } = await supabase
    .from("books")
    .select("*, authors(id, name, bio, photo_url, nationality)")
    .eq("slug", slug)
    .single();

  if (error) return null;
  return data as BookWithAuthor;
}
