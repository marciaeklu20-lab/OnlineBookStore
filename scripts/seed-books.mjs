/**
 * BookFlow — Book Seeder
 * Uses the Google Books API (no API key required for basic searches)
 * and Open Library covers as fallback.
 *
 * Usage (run from bookflow/ directory):
 *   cd bookflow && node ../scripts/seed-books.mjs
 *
 * Requires these env vars (copy from bookflow/.env.local):
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Parse .env.local manually (no dotenv dependency needed)
function loadEnv(filePath) {
  try {
    const content = readFileSync(filePath, "utf-8");
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      const val = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
      process.env[key] = val;
    }
  } catch { /* rely on existing env vars */ }
}

loadEnv(resolve(__dirname, ".env.local"));

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ── Books to seed ──────────────────────────────────────────────────────────────
// Each entry: { query, genre, featured?, bestseller?, price_paperback, price_digital }
const SEED_LIST = [
  // Fiction
  { query: "Harry Potter Philosopher's Stone Rowling",  genre: "Fiction",     featured: true,  bestseller: true,  price_paperback: 89,  price_digital: 45 },
  { query: "The Alchemist Paulo Coelho",                genre: "Fiction",     featured: true,  bestseller: true,  price_paperback: 75,  price_digital: 35 },
  { query: "To Kill a Mockingbird Harper Lee",          genre: "Fiction",     featured: false, bestseller: true,  price_paperback: 70,  price_digital: 32 },
  { query: "1984 George Orwell",                        genre: "Fiction",     featured: false, bestseller: true,  price_paperback: 68,  price_digital: 30 },
  { query: "The Great Gatsby F Scott Fitzgerald",       genre: "Fiction",     featured: false, bestseller: false, price_paperback: 60,  price_digital: 28 },
  { query: "Pride and Prejudice Jane Austen",           genre: "Fiction",     featured: false, bestseller: true,  price_paperback: 62,  price_digital: 29 },
  { query: "The Hunger Games Suzanne Collins",          genre: "Fiction",     featured: true,  bestseller: true,  price_paperback: 82,  price_digital: 40 },
  { query: "Gone Girl Gillian Flynn",                   genre: "Fiction",     featured: false, bestseller: false, price_paperback: 78,  price_digital: 38 },

  // Non-Fiction
  { query: "Sapiens A Brief History of Humankind Harari", genre: "Non-Fiction", featured: true, bestseller: true, price_paperback: 95, price_digital: 48 },
  { query: "Atomic Habits James Clear",                 genre: "Non-Fiction", featured: true,  bestseller: true,  price_paperback: 88,  price_digital: 44 },
  { query: "Thinking Fast and Slow Kahneman",           genre: "Non-Fiction", featured: false, bestseller: true,  price_paperback: 90,  price_digital: 45 },
  { query: "Educated Tara Westover memoir",             genre: "Non-Fiction", featured: false, bestseller: true,  price_paperback: 82,  price_digital: 40 },

  // Biography
  { query: "Steve Jobs Walter Isaacson biography",      genre: "Biography",   featured: true,  bestseller: true,  price_paperback: 98,  price_digital: 50 },
  { query: "Long Walk to Freedom Nelson Mandela",       genre: "Biography",   featured: true,  bestseller: true,  price_paperback: 95,  price_digital: 48 },
  { query: "Michelle Obama Becoming biography",         genre: "Biography",   featured: false, bestseller: true,  price_paperback: 92,  price_digital: 46 },
  { query: "The Diary of a Young Girl Anne Frank",      genre: "Biography",   featured: false, bestseller: true,  price_paperback: 65,  price_digital: 30 },

  // Business
  { query: "Think and Grow Rich Napoleon Hill",         genre: "Business",    featured: true,  bestseller: true,  price_paperback: 72,  price_digital: 35 },
  { query: "The Lean Startup Eric Ries",                genre: "Business",    featured: false, bestseller: true,  price_paperback: 85,  price_digital: 42 },
  { query: "Zero to One Peter Thiel",                   genre: "Business",    featured: false, bestseller: true,  price_paperback: 80,  price_digital: 40 },
  { query: "Rich Dad Poor Dad Robert Kiyosaki",         genre: "Business",    featured: true,  bestseller: true,  price_paperback: 75,  price_digital: 38 },

  // Science
  { query: "A Brief History of Time Stephen Hawking",   genre: "Science",     featured: true,  bestseller: true,  price_paperback: 85,  price_digital: 42 },
  { query: "The Selfish Gene Richard Dawkins",          genre: "Science",     featured: false, bestseller: false, price_paperback: 78,  price_digital: 38 },
  { query: "Cosmos Carl Sagan",                         genre: "Science",     featured: false, bestseller: true,  price_paperback: 88,  price_digital: 44 },

  // Self-Help
  { query: "The 7 Habits of Highly Effective People Covey", genre: "Self-Help", featured: true, bestseller: true, price_paperback: 80, price_digital: 40 },
  { query: "How to Win Friends and Influence People Carnegie", genre: "Self-Help", featured: false, bestseller: true, price_paperback: 72, price_digital: 35 },
  { query: "The Power of Now Eckhart Tolle",            genre: "Self-Help",   featured: false, bestseller: true,  price_paperback: 70,  price_digital: 34 },

  // Technology
  { query: "Clean Code Robert Martin software",        genre: "Technology",  featured: true,  bestseller: true,  price_paperback: 110, price_digital: 55 },
  { query: "The Pragmatic Programmer Hunt Thomas",      genre: "Technology",  featured: false, bestseller: true,  price_paperback: 105, price_digital: 52 },
  { query: "Deep Learning Ian Goodfellow textbook",    genre: "Technology",  featured: false, bestseller: false, price_paperback: 130, price_digital: 65 },

  // Children
  { query: "The Very Hungry Caterpillar Eric Carle",    genre: "Children",    featured: true,  bestseller: true,  price_paperback: 45,  price_digital: 20 },
  { query: "Charlotte's Web E.B. White",                genre: "Children",    featured: false, bestseller: true,  price_paperback: 50,  price_digital: 22 },
  { query: "Matilda Roald Dahl",                        genre: "Children",    featured: false, bestseller: true,  price_paperback: 52,  price_digital: 24 },
];

// ── Helpers ────────────────────────────────────────────────────────────────────

function slugify(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function fetchBook(query) {
  // Open Library search API — free, no key, no quota
  const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=1&fields=title,author_name,cover_i,number_of_pages_median,first_publish_year`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const json = await res.json();
  const doc = json.docs?.[0];
  if (!doc) return null;

  // Open Library cover CDN: https://covers.openlibrary.org/b/id/{cover_i}-L.jpg
  const cover = doc.cover_i
    ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg`
    : null;

  const pubDate = doc.first_publish_year ? `${doc.first_publish_year}-01-01` : null;

  return {
    title:            doc.title ?? query,
    author:           doc.author_name?.[0] ?? "Unknown",
    description:      null, // Open Library search doesn't return description reliably
    page_count:       doc.number_of_pages_median ?? null,
    publication_date: pubDate,
    isbn:             null,
    cover_image_url:  cover,
    language:         "en",
  };
}

// ── Main ───────────────────────────────────────────────────────────────────────

async function main() {
  console.log("🚀 BookFlow seeder starting…\n");

  // 1. Load or create genres
  const genreNames = [...new Set(SEED_LIST.map((b) => b.genre))];
  const genreMap = {};

  for (const name of genreNames) {
    const slug = slugify(name);
    const { data: existing } = await supabase.from("genres").select("id").eq("slug", slug).single();
    if (existing) {
      genreMap[name] = existing.id;
      console.log(`  ✓ genre exists: ${name}`);
    } else {
      const { data, error } = await supabase.from("genres").insert({ name, slug, display_order: 0 }).select("id").single();
      if (error) { console.error(`  ✗ genre insert failed: ${name}`, error.message); continue; }
      genreMap[name] = data.id;
      console.log(`  + created genre: ${name}`);
    }
  }

  console.log();

  // 2. Seed each book
  let inserted = 0;
  let skipped = 0;

  for (const seed of SEED_LIST) {
    const bookData = await fetchBook(seed.query);
    if (!bookData) {
      console.warn(`  ✗ not found: ${seed.query}`);
      skipped++;
      await sleep(300);
      continue;
    }

    const slug = slugify(bookData.title);

    // Check for duplicate slug
    const { data: dupe } = await supabase.from("books").select("id").eq("slug", slug).single();
    if (dupe) {
      console.log(`  ~ skip (exists): ${bookData.title}`);
      skipped++;
      await sleep(300);
      continue;
    }

    // Get or create author
    let authorId = null;
    const { data: existingAuthor } = await supabase.from("authors").select("id").ilike("name", bookData.author).single();
    if (existingAuthor) {
      authorId = existingAuthor.id;
    } else {
      const { data: newAuthor } = await supabase.from("authors").insert({ name: bookData.author }).select("id").single();
      authorId = newAuthor?.id ?? null;
    }

    // Insert book
    const { data: book, error } = await supabase.from("books").insert({
      title:            bookData.title,
      slug,
      description:      bookData.description,
      cover_image_url:  bookData.cover_image_url,
      author_id:        authorId,
      isbn:             bookData.isbn,
      page_count:       bookData.page_count,
      publication_date: bookData.publication_date,
      language:         bookData.language,
      price_paperback:  seed.price_paperback,
      price_digital:    seed.price_digital,
      featured:         seed.featured ?? false,
      bestseller:       seed.bestseller ?? false,
      is_on_sale:       false,
      published:        true,
      formats: { paperback: true, pdf: true, epub: true, mobi: false, hardcover: false, audiobook: false },
    }).select("id").single();

    if (error) {
      console.error(`  ✗ insert failed: ${bookData.title}`, error.message);
      skipped++;
    } else {
      // Link genre
      const genreId = genreMap[seed.genre];
      if (genreId && book?.id) {
        await supabase.from("book_genres").insert({ book_id: book.id, genre_id: genreId });
      }
      console.log(`  ✓ ${bookData.title} — by ${bookData.author}${bookData.cover_image_url ? " 🖼" : ""}`);
      inserted++;
    }

    // Respect Google's rate limit
    await sleep(400);
  }

  console.log(`\n✅ Done! ${inserted} inserted, ${skipped} skipped.\n`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
