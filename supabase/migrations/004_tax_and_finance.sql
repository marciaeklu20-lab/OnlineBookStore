-- Add tax columns to orders table
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS tax_amount   NUMERIC(12,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS tax_rate     NUMERIC(5,4)  NOT NULL DEFAULT 0.175,
  ADD COLUMN IF NOT EXISTS tax_breakdown JSONB;

-- Ghana tax breakdown stored in tax_breakdown:
-- { "vat": 0.125, "nhil": 0.025, "getfund": 0.025, "total": 0.175 }

COMMENT ON COLUMN orders.tax_amount IS 'Total tax collected (VAT 12.5% + NHIL 2.5% + GETFund 2.5% = 17.5%)';
COMMENT ON COLUMN orders.tax_rate IS 'Effective tax rate applied at time of order';
COMMENT ON COLUMN orders.tax_breakdown IS 'Itemised tax components (vat, nhil, getfund)';
