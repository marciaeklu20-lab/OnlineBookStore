-- Inventory tracking per book/format
CREATE TABLE IF NOT EXISTS inventory (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id       UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  format        TEXT NOT NULL CHECK (format IN ('paperback', 'hardcover', 'audiobook')),
  stock_qty     INTEGER NOT NULL DEFAULT 0 CHECK (stock_qty >= 0),
  reorder_level INTEGER NOT NULL DEFAULT 5,   -- trigger reorder when qty falls below this
  reorder_qty   INTEGER NOT NULL DEFAULT 20,  -- how many to order
  cost_price    NUMERIC(10,2),
  supplier_id   UUID REFERENCES suppliers(id) ON DELETE SET NULL,
  last_restocked_at TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(book_id, format)
);

-- Suppliers table
CREATE TABLE IF NOT EXISTS suppliers (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name         TEXT NOT NULL,
  contact_name TEXT,
  email        TEXT,
  phone        TEXT,
  address      TEXT,
  country      TEXT DEFAULT 'Ghana',
  notes        TEXT,
  active       BOOLEAN NOT NULL DEFAULT true,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Purchase orders (restocking requests)
CREATE TABLE IF NOT EXISTS purchase_orders (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  po_number     TEXT NOT NULL UNIQUE,
  supplier_id   UUID REFERENCES suppliers(id) ON DELETE SET NULL,
  status        TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'confirmed', 'received', 'cancelled')),
  total_cost    NUMERIC(12,2) DEFAULT 0,
  notes         TEXT,
  expected_at   DATE,
  received_at   TIMESTAMPTZ,
  created_by    UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Purchase order line items
CREATE TABLE IF NOT EXISTS purchase_order_items (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_order_id UUID NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
  book_id          UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  format           TEXT NOT NULL,
  quantity_ordered INTEGER NOT NULL DEFAULT 1,
  quantity_received INTEGER NOT NULL DEFAULT 0,
  unit_cost        NUMERIC(10,2) NOT NULL DEFAULT 0,
  total_cost       NUMERIC(10,2) GENERATED ALWAYS AS (quantity_ordered * unit_cost) STORED
);

-- Add tracking columns to orders (if not already present)
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS tracking_number  TEXT,
  ADD COLUMN IF NOT EXISTS shipping_carrier TEXT,
  ADD COLUMN IF NOT EXISTS shipped_at       TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS delivered_at     TIMESTAMPTZ;

-- RLS
ALTER TABLE inventory        ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers        ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_orders  ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_order_items ENABLE ROW LEVEL SECURITY;

-- Admins only
CREATE POLICY "Admin full access inventory"        ON inventory        FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));
CREATE POLICY "Admin full access suppliers"        ON suppliers        FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));
CREATE POLICY "Admin full access purchase_orders"  ON purchase_orders  FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));
CREATE POLICY "Admin full access po_items"         ON purchase_order_items FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));

-- Updated_at trigger helper
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$;

CREATE TRIGGER inventory_updated_at        BEFORE UPDATE ON inventory        FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER suppliers_updated_at        BEFORE UPDATE ON suppliers        FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER purchase_orders_updated_at  BEFORE UPDATE ON purchase_orders  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Decrement inventory when an order is placed (fires on order_line_items insert)
CREATE OR REPLACE FUNCTION decrement_inventory()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  UPDATE inventory
  SET stock_qty = GREATEST(stock_qty - NEW.quantity, 0),
      updated_at = NOW()
  WHERE book_id = NEW.book_id
    AND format   = LOWER(NEW.book_format);
  RETURN NEW;
END;
$$;

CREATE TRIGGER order_item_decrement_inventory
  AFTER INSERT ON order_line_items
  FOR EACH ROW EXECUTE FUNCTION decrement_inventory();

-- RPC: increment sales count
CREATE OR REPLACE FUNCTION increment_sales_count(book_id UUID, amount INTEGER)
RETURNS VOID LANGUAGE plpgsql AS $$
BEGIN
  UPDATE books SET sales_count = sales_count + amount WHERE id = book_id;
END;
$$;
