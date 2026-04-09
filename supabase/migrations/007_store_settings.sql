-- ============================================================
-- Migration 007: Store Settings
-- Run in Supabase SQL Editor
-- ============================================================

CREATE TABLE IF NOT EXISTS store_settings (
  id           INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1), -- singleton row
  store_name   VARCHAR(200) NOT NULL DEFAULT 'BookFlow',
  store_tagline TEXT DEFAULT 'Your premier online bookstore',
  store_email  VARCHAR(255),
  store_phone  VARCHAR(50),
  store_address TEXT,
  store_city   VARCHAR(100) DEFAULT 'Accra',
  store_country VARCHAR(100) DEFAULT 'Ghana',
  currency     VARCHAR(10) DEFAULT 'GHS',
  -- Tax
  tax_enabled  BOOLEAN DEFAULT TRUE,
  tax_rate     NUMERIC(5,4) DEFAULT 0.175,
  tax_label    VARCHAR(100) DEFAULT 'VAT + NHIL + GETFund (17.5%)',
  -- Shipping
  free_shipping_threshold NUMERIC(10,2) DEFAULT 200.00,
  flat_shipping_rate      NUMERIC(10,2) DEFAULT 15.00,
  -- Misc
  maintenance_mode BOOLEAN DEFAULT FALSE,
  updated_at   TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert the one settings row if it doesn't exist
INSERT INTO store_settings (id) VALUES (1) ON CONFLICT DO NOTHING;

-- RLS: only authenticated admins should read/write
ALTER TABLE store_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin can manage store settings"
  ON store_settings FOR ALL
  USING (true)
  WITH CHECK (true);
