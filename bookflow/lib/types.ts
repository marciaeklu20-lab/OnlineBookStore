export type Author = {
  id: string;
  name: string;
  bio: string | null;
  photo_url: string | null;
  nationality: string | null;
};

export type Genre = {
  id: string;
  name: string;
  slug: string;
  emoji: string | null;
  display_order: number;
};

export type Book = {
  id: string;
  isbn: string | null;
  title: string;
  slug: string;
  description: string | null;
  cover_image_url: string | null;
  author_id: string | null;
  page_count: number | null;
  estimated_reading_hours: number | null;
  language: string | null;
  price_digital: number | null;
  price_paperback: number | null;
  price_hardcover: number | null;
  price_audiobook: number | null;
  currency: string;
  is_on_sale: boolean;
  sale_price: number | null;
  featured: boolean;
  bestseller: boolean;
  avg_rating: number;
  review_count: number;
  sales_count: number;
  formats: {
    pdf: boolean;
    epub: boolean;
    mobi: boolean;
    hardcover: boolean;
    paperback: boolean;
    audiobook: boolean;
  };
  authors?: Author;
};

export type BookWithAuthor = Book & {
  authors: Author;
};
