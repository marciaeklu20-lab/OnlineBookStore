# BOOKSTORE PRD — PART 5: DATA MODELS & DATABASE SCHEMA

**Document Version:** 1.0  
**Date:** April 8, 2026  
**Section:** PostgreSQL Schema, Entity Relationships  
**Database:** Supabase PostgreSQL

---

## 1. DATABASE ARCHITECTURE

### Primary Database (Supabase PostgreSQL)
- **Users, Authentication, Profiles**
- **Books, Catalog, Inventory**
- **Orders, Line Items, Transactions**
- **Reviews, Ratings, Social Data**
- **Reading Progress, User Activity**
- **Gamification (Points, Badges, Leaderboards)**

### Caching Layer (Redis)
- Session management
- Rate limiting counters
- Hot searches cache
- Leaderboard snapshots

### Vector Database (Pinecone)
- Book embeddings for AI recommendations
- Semantic search

---

## 2. CORE DATA MODELS

### 2.1 Users Table

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  bio TEXT,
  profile_picture_url VARCHAR(512),
  
  -- Preferences
  preferred_genres JSONB DEFAULT '[]',
  age_group VARCHAR(20), -- "18-25", "26-35", etc.
  reading_level VARCHAR(20), -- "beginner", "intermediate", "advanced"
  preferred_language VARCHAR(10) DEFAULT 'en',
  
  -- Status
  account_status VARCHAR(20) DEFAULT 'active', -- 'active', 'suspended', 'deleted'
  email_verified BOOLEAN DEFAULT FALSE,
  email_verified_at TIMESTAMP WITH TIME ZONE,
  
  -- Blockchain
  wallet_address VARCHAR(255), -- Ethereum address for NFT ownership
  wallet_verified BOOLEAN DEFAULT FALSE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE,
  
  -- Privacy & Settings
  is_public BOOLEAN DEFAULT TRUE,
  newsletter_subscribe BOOLEAN DEFAULT TRUE,
  two_factor_enabled BOOLEAN DEFAULT FALSE
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_wallet ON users(wallet_address);
```

---

### 2.2 Books Table

```sql
CREATE TABLE books (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  isbn VARCHAR(20) UNIQUE NOT NULL,
  title VARCHAR(500) NOT NULL,
  description TEXT,
  cover_image_url VARCHAR(512),
  
  -- Authorship
  author_id UUID REFERENCES authors(id),
  publisher_id UUID REFERENCES publishers(id),
  publication_date DATE,
  
  -- Content
  genre_ids UUID[] DEFAULT '{}', -- Array of genre IDs
  language VARCHAR(10) DEFAULT 'en',
  page_count INTEGER,
  estimated_reading_hours DECIMAL(5,2),
  
  -- Format & Availability
  formats JSONB DEFAULT '{
    "pdf": false,
    "epub": false,
    "mobi": false,
    "hardcover": false,
    "paperback": false,
    "audiobook": false
  }',
  
  -- Pricing
  price_digital DECIMAL(10,2) DEFAULT 9.99,
  price_physical_hardcover DECIMAL(10,2),
  price_physical_paperback DECIMAL(10,2),
  price_audiobook DECIMAL(10,2),
  currency VARCHAR(3) DEFAULT 'EUR',
  
  -- NFT & Blockchain
  nft_enabled BOOLEAN DEFAULT FALSE,
  nft_contract_address VARCHAR(255),
  nft_metadata_uri VARCHAR(512),
  blockchain_network VARCHAR(50) DEFAULT 'polygon',
  
  -- Inventory
  physical_stock INTEGER DEFAULT 0,
  digital_stock INTEGER DEFAULT -1, -- -1 = unlimited
  
  -- Metadata for Search & Recommendations
  keywords TEXT[],
  themes TEXT[],
  content_warnings TEXT[],
  
  -- Ratings & Reviews
  avg_rating DECIMAL(3,2) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  published_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_books_isbn ON books(isbn);
CREATE INDEX idx_books_title ON books USING gin(to_tsvector('english', title));
CREATE INDEX idx_books_genre ON books USING gin(genre_ids);
CREATE INDEX idx_books_author ON books(author_id);
```

---

### 2.3 Orders Table

```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  order_number VARCHAR(50) UNIQUE NOT NULL,
  
  -- Status
  status VARCHAR(20) DEFAULT 'pending', 
  -- 'pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled'
  payment_status VARCHAR(20) DEFAULT 'pending',
  -- 'pending', 'completed', 'failed', 'refunded'
  
  -- Pricing
  subtotal DECIMAL(12,2) NOT NULL,
  tax DECIMAL(12,2) DEFAULT 0,
  shipping_cost DECIMAL(12,2) DEFAULT 0,
  discount_amount DECIMAL(12,2) DEFAULT 0,
  discount_code VARCHAR(50),
  total_amount DECIMAL(12,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'EUR',
  
  -- Payment
  payment_method VARCHAR(50), -- 'stripe', 'paypal', 'apple_pay'
  stripe_payment_intent_id VARCHAR(255),
  payment_processed_at TIMESTAMP WITH TIME ZONE,
  
  -- Delivery
  shipping_address JSONB,
  delivery_tracking_id VARCHAR(255),
  estimated_delivery_date DATE,
  
  -- Fulfillment
  digital_delivery_sent BOOLEAN DEFAULT FALSE,
  digital_delivery_sent_at TIMESTAMP WITH TIME ZONE,
  
  -- Blockchain
  order_tx_hash VARCHAR(255), -- Transaction hash for NFT minting
  nft_mint_status VARCHAR(20) DEFAULT 'pending',
  -- 'pending', 'processing', 'minted', 'failed'
  
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
```

---

### 2.4 Order Line Items Table

```sql
CREATE TABLE order_line_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  book_id UUID NOT NULL REFERENCES books(id),
  
  -- Purchase Details
  book_format VARCHAR(50), -- 'pdf', 'epub', 'hardcover', 'audiobook'
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(12,2) NOT NULL,
  
  -- Digital Distribution
  download_url VARCHAR(512), -- For digital books
  license_key VARCHAR(255), -- Unique license per copy
  activation_code VARCHAR(100),
  
  -- NFT Metadata
  nft_token_id VARCHAR(255), -- If NFT minted for this item
  nft_owner_address VARCHAR(255),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_line_items_order ON order_line_items(order_id);
CREATE INDEX idx_line_items_book ON order_line_items(book_id);
```

---

### 2.5 Reviews Table

```sql
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  book_id UUID NOT NULL REFERENCES books(id),
  order_line_item_id UUID REFERENCES order_line_items(id),
  
  -- Review Content
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title VARCHAR(200),
  content TEXT NOT NULL,
  
  -- Metadata
  is_verified_purchase BOOLEAN DEFAULT FALSE,
  contains_spoilers BOOLEAN DEFAULT FALSE,
  
  -- Moderation
  moderation_status VARCHAR(20) DEFAULT 'pending',
  -- 'pending', 'approved', 'rejected', 'hidden'
  moderation_notes TEXT,
  
  -- Engagement
  helpful_count INTEGER DEFAULT 0,
  unhelpful_count INTEGER DEFAULT 0,
  reply_count INTEGER DEFAULT 0,
  
  -- Tags
  tags TEXT[],
  -- e.g., ["spoiler-free", "moved-me", "page-turner"]
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  moderated_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_reviews_book ON reviews(book_id);
CREATE INDEX idx_reviews_user ON reviews(user_id);
CREATE INDEX idx_reviews_status ON reviews(moderation_status);
```

---

### 2.6 Reading Progress Table

```sql
CREATE TABLE reading_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  book_id UUID NOT NULL REFERENCES books(id),
  order_line_item_id UUID REFERENCES order_line_items(id),
  
  -- Progress Tracking
  current_page INTEGER DEFAULT 0,
  total_pages INTEGER NOT NULL,
  percent_complete DECIMAL(5,2) DEFAULT 0,
  current_chapter VARCHAR(255),
  
  -- Time Tracking
  total_reading_minutes INTEGER DEFAULT 0,
  estimated_completion_date DATE,
  reading_streak_days INTEGER DEFAULT 0,
  
  -- Status
  status VARCHAR(20) DEFAULT 'reading',
  -- 'reading', 'paused', 'completed', 'abandoned', 'wishlist'
  
  -- Highlights & Bookmarks
  bookmarks JSONB DEFAULT '{
    "current": 0,
    "list": []
  }',
  highlights JSONB DEFAULT '[]',
  -- Each: { page, text, color, note, timestamp }
  
  -- Notes
  notes TEXT,
  
  -- Timestamps
  started_at TIMESTAMP WITH TIME ZONE,
  resumed_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  last_read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_reading_user_book ON reading_progress(user_id, book_id);
CREATE INDEX idx_reading_status ON reading_progress(status);
```

---

### 2.7 Wishlist Table

```sql
CREATE TABLE wishlists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  book_id UUID NOT NULL REFERENCES books(id),
  
  -- Priority
  priority_order INTEGER DEFAULT 0,
  
  -- Reason for Wishlist
  reason TEXT,
  category VARCHAR(50), -- 'to-read', 'gifts', 'research'
  
  -- Notification
  notify_on_discount BOOLEAN DEFAULT FALSE,
  
  -- Timestamps
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, book_id)
);

CREATE INDEX idx_wishlist_user ON wishlists(user_id);
```

---

### 2.8 Book Clubs Table

```sql
CREATE TABLE book_clubs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(200) NOT NULL,
  slug VARCHAR(200) UNIQUE NOT NULL,
  description TEXT,
  cover_image_url VARCHAR(512),
  
  -- Membership
  created_by_user_id UUID NOT NULL REFERENCES users(id),
  is_official BOOLEAN DEFAULT FALSE,
  membership_count INTEGER DEFAULT 0,
  
  -- Book Schedule
  current_book_id UUID REFERENCES books(id),
  next_book_id UUID REFERENCES books(id),
  reading_start_date DATE,
  reading_end_date DATE,
  chapters_per_week INTEGER DEFAULT 5,
  
  -- Discussion Settings
  discussion_enabled BOOLEAN DEFAULT TRUE,
  moderation_required BOOLEAN DEFAULT FALSE,
  
  -- Engagement
  discussion_count INTEGER DEFAULT 0,
  member_activity_score DECIMAL(8,2) DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_clubs_slug ON book_clubs(slug);
CREATE INDEX idx_clubs_current_book ON book_clubs(current_book_id);
```

---

### 2.9 Book Club Members Table

```sql
CREATE TABLE book_club_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  book_club_id UUID NOT NULL REFERENCES book_clubs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id),
  
  -- Membership
  role VARCHAR(20) DEFAULT 'member', -- 'admin', 'moderator', 'member'
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Activity
  discussion_posts INTEGER DEFAULT 0,
  reading_progress DECIMAL(5,2) DEFAULT 0,
  last_active_at TIMESTAMP WITH TIME ZONE,
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  
  UNIQUE(book_club_id, user_id)
);

CREATE INDEX idx_club_members_club ON book_club_members(book_club_id);
CREATE INDEX idx_club_members_user ON book_club_members(user_id);
```

---

### 2.10 Discussion Posts/Comments Table

```sql
CREATE TABLE discussion_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  book_club_id UUID NOT NULL REFERENCES book_clubs(id),
  user_id UUID NOT NULL REFERENCES users(id),
  
  -- Content
  title VARCHAR(255),
  content TEXT NOT NULL,
  
  -- Threading
  parent_post_id UUID REFERENCES discussion_posts(id),
  
  -- Moderation
  moderation_status VARCHAR(20) DEFAULT 'approved',
  is_pinned BOOLEAN DEFAULT FALSE,
  is_locked BOOLEAN DEFAULT FALSE,
  
  -- Engagement
  like_count INTEGER DEFAULT 0,
  reply_count INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_posts_club ON discussion_posts(book_club_id);
CREATE INDEX idx_posts_user ON discussion_posts(user_id);
CREATE INDEX idx_posts_parent ON discussion_posts(parent_post_id);
```

---

### 2.11 Gamification Tables

#### Points Table
```sql
CREATE TABLE user_points (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id),
  
  -- Point Categories
  reading_points INTEGER DEFAULT 0,
  review_points INTEGER DEFAULT 0,
  social_points INTEGER DEFAULT 0,
  achievement_points INTEGER DEFAULT 0,
  total_points INTEGER DEFAULT 0,
  
  -- Level/Tier
  level INTEGER DEFAULT 1,
  xp DECIMAL(12,2) DEFAULT 0,
  lifetime_xp DECIMAL(12,2) DEFAULT 0,
  
  -- Streaks
  reading_streak_days INTEGER DEFAULT 0,
  reading_streak_record INTEGER DEFAULT 0,
  
  -- Updated
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_points_user ON user_points(user_id);
```

#### Badges Table
```sql
CREATE TABLE badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Badge Definition
  slug VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  icon_url VARCHAR(512),
  
  -- Unlock Condition
  condition_rule JSONB,
  -- e.g., { "type": "total_reads", "value": 5 }
  
  tier VARCHAR(20) DEFAULT 'bronze', -- 'bronze', 'silver', 'gold', 'platinum'
  rarity VARCHAR(20) DEFAULT 'common' -- 'common', 'uncommon', 'rare', 'legendary'
);

CREATE TABLE user_badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  badge_id UUID NOT NULL REFERENCES badges(id),
  
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, badge_id)
);

CREATE INDEX idx_user_badges ON user_badges(user_id);
```

#### Leaderboards Table
```sql
CREATE TABLE leaderboard_snapshots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Leaderboard Type
  type VARCHAR(50), -- 'monthly', 'all_time', 'weekly'
  category VARCHAR(50), -- 'points', 'books_read', 'reviews'
  
  -- Snapshot Data
  user_id UUID NOT NULL REFERENCES users(id),
  rank INTEGER,
  score DECIMAL(12,2),
  
  -- Time Window
  period_start_date DATE,
  period_end_date DATE,
  snapshot_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_leaderboard_type ON leaderboard_snapshots(type, category, snapshot_date);
```

---

### 2.12 NFT Ownership Tracking Table

```sql
CREATE TABLE nft_ownership (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- NFT Identity
  book_id UUID NOT NULL REFERENCES books(id),
  token_id VARCHAR(255) NOT NULL,
  contract_address VARCHAR(255) NOT NULL,
  network VARCHAR(50) NOT NULL DEFAULT 'polygon',
  
  -- Current Owner
  current_owner_user_id UUID REFERENCES users(id),
  current_owner_wallet_address VARCHAR(255),
  
  -- Provenance Chain
  original_owner_user_id UUID REFERENCES users(id),
  original_purchase_date DATE,
  
  -- Transfer History
  transfer_history JSONB DEFAULT '[]',
  -- Each: { from_address, to_address, timestamp, tx_hash }
  
  -- Rights
  resale_enabled BOOLEAN DEFAULT TRUE,
  lending_enabled BOOLEAN DEFAULT TRUE,
  lending_period_days INTEGER DEFAULT 30,
  
  current_status VARCHAR(20) DEFAULT 'active',
  -- 'active', 'lent', 'listed_for_sale', 'burned'
  
  -- Timestamps
  minted_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_nft_token ON nft_ownership(token_id, contract_address);
CREATE INDEX idx_nft_owner ON nft_ownership(current_owner_wallet_address);
```

---

## 3. RELATIONAL DIAGRAM

```
users
  ├── orders (one user → many orders)
  ├── reviews (one user → many reviews)
  ├── reading_progress (one user → many)
  ├── wishlists (one user → many)
  ├── user_points (one user → one record)
  ├── user_badges (one user → many badges)
  └── book_club_members → book_clubs

books
  ├── reviews (one book → many reviews)
  ├── reading_progress (one book → many)
  ├── order_line_items (one book → many orders)
  ├── wishlists (one book → many users)
  ├── book_club (one book → current club)
  ├── authors (many books → one author)
  ├── publishers (many books → one publisher)
  ├── nft_ownership (one book → many NFTs/owners)

orders
  └── order_line_items (one order → many items)

book_clubs
  ├── book_club_members (one club → many members)
  └── discussion_posts (one club → many posts)
```

---

## 4. KEY QUERIES (OPTIMIZATION)

### Query 1: Homepage Trending Books
```sql
SELECT b.*, COUNT(ol.id) as sales_count, AVG(r.rating) as avg_rating
FROM books b
LEFT JOIN order_line_items ol ON b.id = ol.book_id
LEFT JOIN reviews r ON b.id = r.book_id
WHERE ol.created_at >= NOW() - INTERVAL '7 days'
GROUP BY b.id
ORDER BY sales_count DESC
LIMIT 20;
```

### Query 2: User Recommendations (based on history)
```sql
SELECT b.* FROM books b
WHERE b.genre_ids && (
  SELECT ARRAY_AGG(DISTINCT genre_id)
  FROM reading_progress rp
  JOIN books b2 ON rp.book_id = b2.id,
  LATERAL UNNEST(b2.genre_ids) AS genre_id
  WHERE rp.user_id = $1 AND rp.status = 'completed'
)
AND b.id NOT IN (
  SELECT book_id FROM reading_progress WHERE user_id = $1
)
LIMIT 20;
```

### Query 3: Leaderboard Scores
```sql
SELECT u.id, u.username, SUM(up.total_points) as total_score,
       ROW_NUMBER() OVER (ORDER BY SUM(up.total_points) DESC) as rank
FROM users u
JOIN user_points up ON u.id = up.user_id
WHERE u.created_at >= NOW() - INTERVAL '30 days'
GROUP BY u.id, u.username
ORDER BY total_score DESC
LIMIT 100;
```

---

## NEXT SECTION  
→ PRD-06-Roadmap.md (MVP vs Phase 2 implementation timeline)
