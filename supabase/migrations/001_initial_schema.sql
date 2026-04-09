-- ============================================================
-- BookFlow Database Schema — Migration 001
-- Run this in the Supabase SQL Editor
-- ============================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- for fuzzy text search

-- ============================================================
-- AUTHORS
-- ============================================================
CREATE TABLE authors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(300) NOT NULL,
  bio TEXT,
  photo_url VARCHAR(512),
  website_url VARCHAR(512),
  nationality VARCHAR(100),
  birth_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_authors_name ON authors USING gin(to_tsvector('english', name));

-- ============================================================
-- PUBLISHERS
-- ============================================================
CREATE TABLE publishers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(300) NOT NULL,
  website_url VARCHAR(512),
  country VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- GENRES
-- ============================================================
CREATE TABLE genres (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) UNIQUE NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  emoji VARCHAR(10),
  display_order INTEGER DEFAULT 0
);

-- ============================================================
-- PROFILES (extends Supabase auth.users)
-- ============================================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(100) UNIQUE,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  bio TEXT,
  profile_picture_url VARCHAR(512),

  -- Preferences
  preferred_genres JSONB DEFAULT '[]',
  age_group VARCHAR(20),
  reading_level VARCHAR(20) DEFAULT 'intermediate',
  preferred_language VARCHAR(10) DEFAULT 'en',

  -- Status
  account_status VARCHAR(20) DEFAULT 'active',
  newsletter_subscribed BOOLEAN DEFAULT TRUE,
  two_factor_enabled BOOLEAN DEFAULT FALSE,

  -- Blockchain
  wallet_address VARCHAR(255),
  wallet_verified BOOLEAN DEFAULT FALSE,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_profiles_username ON profiles(username);
CREATE INDEX idx_profiles_wallet ON profiles(wallet_address);

-- Auto-create profile when a user signs up via Supabase Auth
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- BOOKS
-- ============================================================
CREATE TABLE books (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  isbn VARCHAR(20) UNIQUE,
  title VARCHAR(500) NOT NULL,
  slug VARCHAR(600) UNIQUE NOT NULL,
  description TEXT,
  cover_image_url VARCHAR(512),

  -- Authorship
  author_id UUID REFERENCES authors(id),
  publisher_id UUID REFERENCES publishers(id),
  publication_date DATE,

  -- Genres (junction via book_genres)
  language VARCHAR(10) DEFAULT 'en',
  page_count INTEGER,
  estimated_reading_hours DECIMAL(5,2),

  -- Formats available
  formats JSONB DEFAULT '{"pdf": false, "epub": false, "mobi": false, "hardcover": false, "paperback": false, "audiobook": false}',

  -- Pricing (GHS)
  price_digital DECIMAL(10,2),
  price_hardcover DECIMAL(10,2),
  price_paperback DECIMAL(10,2),
  price_audiobook DECIMAL(10,2),
  currency VARCHAR(3) DEFAULT 'GHS',
  is_on_sale BOOLEAN DEFAULT FALSE,
  sale_price DECIMAL(10,2),

  -- Inventory
  physical_stock INTEGER DEFAULT 0,
  digital_stock INTEGER DEFAULT -1,

  -- Search & discovery
  keywords TEXT[],
  themes TEXT[],
  featured BOOLEAN DEFAULT FALSE,
  bestseller BOOLEAN DEFAULT FALSE,

  -- Ratings (denormalised for speed)
  avg_rating DECIMAL(3,2) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  sales_count INTEGER DEFAULT 0,

  -- NFT
  nft_enabled BOOLEAN DEFAULT FALSE,
  nft_contract_address VARCHAR(255),

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  published_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_books_isbn ON books(isbn);
CREATE INDEX idx_books_slug ON books(slug);
CREATE INDEX idx_books_author ON books(author_id);
CREATE INDEX idx_books_featured ON books(featured);
CREATE INDEX idx_books_bestseller ON books(bestseller);
CREATE INDEX idx_books_fts ON books USING gin(to_tsvector('english', title || ' ' || COALESCE(description, '')));

-- ============================================================
-- BOOK_GENRES (many-to-many)
-- ============================================================
CREATE TABLE book_genres (
  book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  genre_id UUID NOT NULL REFERENCES genres(id) ON DELETE CASCADE,
  PRIMARY KEY (book_id, genre_id)
);

CREATE INDEX idx_book_genres_genre ON book_genres(genre_id);

-- ============================================================
-- ORDERS
-- ============================================================
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id),
  order_number VARCHAR(50) UNIQUE NOT NULL,

  status VARCHAR(20) DEFAULT 'pending',
  -- 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  payment_status VARCHAR(20) DEFAULT 'pending',
  -- 'pending' | 'completed' | 'failed' | 'refunded'

  -- Pricing
  subtotal DECIMAL(12,2) NOT NULL,
  tax DECIMAL(12,2) DEFAULT 0,
  shipping_cost DECIMAL(12,2) DEFAULT 0,
  discount_amount DECIMAL(12,2) DEFAULT 0,
  discount_code VARCHAR(50),
  total_amount DECIMAL(12,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'GHS',

  -- Payment
  payment_method VARCHAR(50),
  stripe_payment_intent_id VARCHAR(255),
  payment_processed_at TIMESTAMP WITH TIME ZONE,

  -- Shipping
  shipping_address JSONB,
  delivery_tracking_id VARCHAR(255),
  estimated_delivery_date DATE,

  -- Digital delivery
  digital_delivery_sent BOOLEAN DEFAULT FALSE,
  digital_delivery_sent_at TIMESTAMP WITH TIME ZONE,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  paid_at TIMESTAMP WITH TIME ZONE,
  shipped_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created ON orders(created_at DESC);
CREATE INDEX idx_orders_number ON orders(order_number);

-- ============================================================
-- ORDER LINE ITEMS
-- ============================================================
CREATE TABLE order_line_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  book_id UUID NOT NULL REFERENCES books(id),

  book_format VARCHAR(50) NOT NULL, -- 'pdf' | 'epub' | 'hardcover' | 'paperback' | 'audiobook'
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(12,2) NOT NULL,

  -- Digital
  download_url VARCHAR(512),
  license_key VARCHAR(255),

  -- NFT
  nft_token_id VARCHAR(255),
  nft_owner_address VARCHAR(255),

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_line_items_order ON order_line_items(order_id);
CREATE INDEX idx_line_items_book ON order_line_items(book_id);

-- ============================================================
-- REVIEWS
-- ============================================================
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id),
  book_id UUID NOT NULL REFERENCES books(id),
  order_line_item_id UUID REFERENCES order_line_items(id),

  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title VARCHAR(200),
  content TEXT NOT NULL,

  is_verified_purchase BOOLEAN DEFAULT FALSE,
  contains_spoilers BOOLEAN DEFAULT FALSE,

  moderation_status VARCHAR(20) DEFAULT 'approved',
  -- 'pending' | 'approved' | 'rejected' | 'hidden'

  helpful_count INTEGER DEFAULT 0,
  unhelpful_count INTEGER DEFAULT 0,

  tags TEXT[],

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(user_id, book_id)
);

CREATE INDEX idx_reviews_book ON reviews(book_id);
CREATE INDEX idx_reviews_user ON reviews(user_id);
CREATE INDEX idx_reviews_status ON reviews(moderation_status);

-- Auto-update avg_rating on books when a review is added/updated/deleted
CREATE OR REPLACE FUNCTION update_book_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE books
  SET
    avg_rating = (SELECT AVG(rating) FROM reviews WHERE book_id = COALESCE(NEW.book_id, OLD.book_id) AND moderation_status = 'approved'),
    review_count = (SELECT COUNT(*) FROM reviews WHERE book_id = COALESCE(NEW.book_id, OLD.book_id) AND moderation_status = 'approved')
  WHERE id = COALESCE(NEW.book_id, OLD.book_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_review_change
  AFTER INSERT OR UPDATE OR DELETE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_book_rating();

-- ============================================================
-- WISHLISTS
-- ============================================================
CREATE TABLE wishlists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id),
  book_id UUID NOT NULL REFERENCES books(id),
  priority_order INTEGER DEFAULT 0,
  notify_on_discount BOOLEAN DEFAULT FALSE,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, book_id)
);

CREATE INDEX idx_wishlist_user ON wishlists(user_id);

-- ============================================================
-- READING PROGRESS
-- ============================================================
CREATE TABLE reading_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id),
  book_id UUID NOT NULL REFERENCES books(id),

  current_page INTEGER DEFAULT 0,
  total_pages INTEGER NOT NULL,
  percent_complete DECIMAL(5,2) DEFAULT 0,
  current_chapter VARCHAR(255),

  total_reading_minutes INTEGER DEFAULT 0,
  reading_streak_days INTEGER DEFAULT 0,

  status VARCHAR(20) DEFAULT 'reading',
  -- 'reading' | 'paused' | 'completed' | 'abandoned' | 'wishlist'

  bookmarks JSONB DEFAULT '{"current": 0, "list": []}',
  highlights JSONB DEFAULT '[]',
  notes TEXT,

  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  last_read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(user_id, book_id)
);

CREATE INDEX idx_reading_user_book ON reading_progress(user_id, book_id);
CREATE INDEX idx_reading_status ON reading_progress(status);

-- ============================================================
-- GAMIFICATION — USER POINTS
-- ============================================================
CREATE TABLE user_points (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES profiles(id),
  reading_points INTEGER DEFAULT 0,
  review_points INTEGER DEFAULT 0,
  social_points INTEGER DEFAULT 0,
  achievement_points INTEGER DEFAULT 0,
  total_points INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  xp DECIMAL(12,2) DEFAULT 0,
  lifetime_xp DECIMAL(12,2) DEFAULT 0,
  reading_streak_days INTEGER DEFAULT 0,
  reading_streak_record INTEGER DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- GAMIFICATION — BADGES
-- ============================================================
CREATE TABLE badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  icon_url VARCHAR(512),
  condition_rule JSONB,
  tier VARCHAR(20) DEFAULT 'bronze',
  rarity VARCHAR(20) DEFAULT 'common'
);

CREATE TABLE user_badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id),
  badge_id UUID NOT NULL REFERENCES badges(id),
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);

CREATE INDEX idx_user_badges ON user_badges(user_id);

-- ============================================================
-- BOOK CLUBS
-- ============================================================
CREATE TABLE book_clubs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(200) NOT NULL,
  slug VARCHAR(200) UNIQUE NOT NULL,
  description TEXT,
  cover_image_url VARCHAR(512),
  created_by_user_id UUID NOT NULL REFERENCES profiles(id),
  is_official BOOLEAN DEFAULT FALSE,
  membership_count INTEGER DEFAULT 0,
  current_book_id UUID REFERENCES books(id),
  next_book_id UUID REFERENCES books(id),
  reading_start_date DATE,
  reading_end_date DATE,
  chapters_per_week INTEGER DEFAULT 5,
  discussion_enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_clubs_slug ON book_clubs(slug);

CREATE TABLE book_club_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  book_club_id UUID NOT NULL REFERENCES book_clubs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id),
  role VARCHAR(20) DEFAULT 'member',
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE,
  UNIQUE(book_club_id, user_id)
);

CREATE INDEX idx_club_members_club ON book_club_members(book_club_id);
CREATE INDEX idx_club_members_user ON book_club_members(user_id);

CREATE TABLE discussion_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  book_club_id UUID NOT NULL REFERENCES book_clubs(id),
  user_id UUID NOT NULL REFERENCES profiles(id),
  title VARCHAR(255),
  content TEXT NOT NULL,
  parent_post_id UUID REFERENCES discussion_posts(id),
  moderation_status VARCHAR(20) DEFAULT 'approved',
  is_pinned BOOLEAN DEFAULT FALSE,
  like_count INTEGER DEFAULT 0,
  reply_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_posts_club ON discussion_posts(book_club_id);
CREATE INDEX idx_posts_parent ON discussion_posts(parent_post_id);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

-- Profiles: users can only update their own profile
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Books: anyone can read
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Books are publicly readable" ON books FOR SELECT USING (true);

-- Orders: users see only their own
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own orders" ON orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own orders" ON orders FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Reviews: approved reviews are public; users manage their own
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Approved reviews are public" ON reviews FOR SELECT USING (moderation_status = 'approved');
CREATE POLICY "Users can create reviews" ON reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own reviews" ON reviews FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own reviews" ON reviews FOR DELETE USING (auth.uid() = user_id);

-- Wishlists: private to owner
ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own wishlist" ON wishlists USING (auth.uid() = user_id);

-- Reading progress: private to owner
ALTER TABLE reading_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own reading progress" ON reading_progress USING (auth.uid() = user_id);

-- Genres, Authors, Publishers: public read
ALTER TABLE genres ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Genres are public" ON genres FOR SELECT USING (true);

ALTER TABLE authors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authors are public" ON authors FOR SELECT USING (true);

ALTER TABLE publishers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Publishers are public" ON publishers FOR SELECT USING (true);

ALTER TABLE book_genres ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Book genres are public" ON book_genres FOR SELECT USING (true);
