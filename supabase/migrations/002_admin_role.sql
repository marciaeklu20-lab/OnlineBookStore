-- ============================================================
-- Migration 002: Admin role + published flag on books
-- Run in Supabase SQL Editor
-- ============================================================

-- Add is_admin to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- Add published flag to books (unpublished books won't show on the storefront)
ALTER TABLE books ADD COLUMN IF NOT EXISTS published BOOLEAN DEFAULT TRUE;

-- Index for fast storefront queries (only show published)
CREATE INDEX IF NOT EXISTS idx_books_published ON books(published);

-- Update RLS on books: storefront only sees published books
DROP POLICY IF EXISTS "Books are publicly readable" ON books;
CREATE POLICY "Published books are publicly readable" ON books
  FOR SELECT USING (published = TRUE);

-- Admins can do everything on books (uses service role in app, but just in case)
CREATE POLICY "Admins can manage books" ON books
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE
    )
  );

-- Admins can manage authors
CREATE POLICY "Admins can manage authors" ON authors
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE
    )
  );

-- Admins can manage publishers
CREATE POLICY "Admins can manage publishers" ON publishers
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE
    )
  );

-- Admins can manage genres
CREATE POLICY "Admins can manage genres" ON genres
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE
    )
  );
