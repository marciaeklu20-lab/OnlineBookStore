import { createClient } from "@supabase/supabase-js";
import type { Book, Genre, BookWithAuthor } from "@/lib/types";

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

// ─────────────────────────────────────────────────────────────
// RECOMMENDATIONS
//
// Logic (in priority order):
//  1. User has wishlist entries → find genres of those books →
//     return other books in same genres, excluding already-wishlisted
//  2. User has reading progress → same genre approach
//  3. User has past orders → same genre approach
//  4. Fallback → featured + bestsellers (for new / logged-out users)
// ─────────────────────────────────────────────────────────────

type RecommendationResult = {
  books: BookWithAuthor[];
  reason: string; // shown as section subtitle
};

export async function getRecommendations(
  userId: string | null,
  limit = 8
): Promise<RecommendationResult> {
  // ── No user → return featured/bestsellers ──────────────────
  if (!userId) {
    const books = await getFeaturedBooks(limit);
    return { books, reason: "Handpicked favourites" };
  }

  // ── Step 1: collect genre IDs the user is interested in ────
  // Gather book IDs the user already engaged with (wishlist + progress + orders)
  const [wishlistRes, progressRes, ordersRes] = await Promise.all([
    supabase
      .from("wishlists")
      .select("book_id")
      .eq("user_id", userId),
    supabase
      .from("reading_progress")
      .select("book_id")
      .eq("user_id", userId),
    supabase
      .from("order_line_items")
      .select("book_id, orders!inner(user_id)")
      .eq("orders.user_id", userId),
  ]);

  const engagedBookIds = Array.from(
    new Set([
      ...(wishlistRes.data ?? []).map((r: { book_id: string }) => r.book_id),
      ...(progressRes.data ?? []).map((r: { book_id: string }) => r.book_id),
      ...(ordersRes.data ?? []).map((r: { book_id: string }) => r.book_id),
    ])
  );

  // No engagement yet → trending fallback
  if (engagedBookIds.length === 0) {
    const books = await getBestsellers(limit);
    return { books, reason: "Trending right now" };
  }

  // ── Step 2: get genres of engaged books ────────────────────
  const { data: genreLinks } = await supabase
    .from("book_genres")
    .select("genre_id")
    .in("book_id", engagedBookIds);

  const genreIds = Array.from(
    new Set((genreLinks ?? []).map((r: { genre_id: string }) => r.genre_id))
  );

  if (genreIds.length === 0) {
    const books = await getBestsellers(limit);
    return { books, reason: "Popular picks" };
  }

  // ── Step 3: find books in those genres, exclude engaged ────
  const { data: candidateLinks } = await supabase
    .from("book_genres")
    .select("book_id")
    .in("genre_id", genreIds)
    .not("book_id", "in", `(${engagedBookIds.join(",")})`);

  const candidateIds = Array.from(
    new Set((candidateLinks ?? []).map((r: { book_id: string }) => r.book_id))
  );

  if (candidateIds.length === 0) {
    const books = await getBestsellers(limit);
    return { books, reason: "Popular picks" };
  }

  // ── Step 4: fetch those books, rank by avg_rating ──────────
  const { data, error } = await supabase
    .from("books")
    .select("*, authors(id, name)")
    .in("id", candidateIds)
    .order("avg_rating", { ascending: false })
    .order("sales_count", { ascending: false })
    .limit(limit);

  if (error || !data?.length) {
    const books = await getBestsellers(limit);
    return { books, reason: "Popular picks" };
  }

  return {
    books: data as BookWithAuthor[],
    reason: "Based on your reading interests",
  };
}
