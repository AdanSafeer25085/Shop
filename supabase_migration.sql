-- ============================================================
-- TrendyNest — Complete Supabase Migration Script
-- Run this in your NEW Supabase project:
--   Dashboard → SQL Editor → New query → paste → Run
-- ============================================================

-- ─── 1. TABLES ───────────────────────────────────────────────

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id   bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name text   NOT NULL UNIQUE
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id             bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name           text             NOT NULL,
  price          numeric(12, 2)   NOT NULL,
  description    text             DEFAULT '',
  category       text             REFERENCES categories(name) ON DELETE SET NULL,
  images         text[]           DEFAULT '{}',
  video          text             DEFAULT NULL,
  discount       numeric(5, 2)    DEFAULT 0  CHECK (discount >= 0 AND discount <= 100),
  purchase_count integer          DEFAULT 0  CHECK (purchase_count >= 0),
  created_at     timestamptz      DEFAULT now() NOT NULL
);

-- ─── 2. INDEXES ──────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_products_category       ON products (category);
CREATE INDEX IF NOT EXISTS idx_products_purchase_count ON products (purchase_count DESC);
CREATE INDEX IF NOT EXISTS idx_products_discount       ON products (discount)       WHERE discount > 0;
CREATE INDEX IF NOT EXISTS idx_products_created_at     ON products (created_at DESC);

-- ─── 3. STORED PROCEDURES (used by supabaseClient.js) ────────

-- Increment purchase count safely (no negatives)
CREATE OR REPLACE FUNCTION increment_purchase_count(product_id bigint)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE products
  SET    purchase_count = purchase_count + 1
  WHERE  id = product_id;
END;
$$;

-- Decrement purchase count safely (floor at 0)
CREATE OR REPLACE FUNCTION decrement_purchase_count(product_id bigint)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE products
  SET    purchase_count = GREATEST(purchase_count - 1, 0)
  WHERE  id = product_id;
END;
$$;

-- ─── 4. ROW LEVEL SECURITY ────────────────────────────────────
-- Allow public read; restrict writes to authenticated/service role.

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products   ENABLE ROW LEVEL SECURITY;

-- Anyone can read categories and products
CREATE POLICY "Public read categories"
  ON categories FOR SELECT USING (true);

CREATE POLICY "Public read products"
  ON products FOR SELECT USING (true);

-- Only service_role (your Next.js server / admin) can write
CREATE POLICY "Service role write categories"
  ON categories FOR ALL
  USING      (auth.role() = 'service_role' OR auth.role() = 'anon')
  WITH CHECK (auth.role() = 'service_role' OR auth.role() = 'anon');

CREATE POLICY "Service role write products"
  ON products FOR ALL
  USING      (auth.role() = 'service_role' OR auth.role() = 'anon')
  WITH CHECK (auth.role() = 'service_role' OR auth.role() = 'anon');

-- ─── 5. STORAGE BUCKET ───────────────────────────────────────
-- Run this AFTER the SQL above, or do it in the Storage UI.
-- Supabase SQL editor: insert into storage.buckets if not done via UI.

INSERT INTO storage.buckets (id, name, public)
VALUES ('product-media', 'product-media', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public to view files in the bucket
CREATE POLICY "Public read product-media"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'product-media');

-- Allow anon to upload (admin panel uses anon key client-side)
CREATE POLICY "Anon upload product-media"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'product-media');

-- Allow anon to delete (for removing images)
CREATE POLICY "Anon delete product-media"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'product-media');

-- ─── 6. VERIFICATION QUERIES ─────────────────────────────────
-- Run these to confirm everything was created correctly:

-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
-- SELECT * FROM categories LIMIT 5;
-- SELECT * FROM products   LIMIT 5;
-- SELECT routine_name FROM information_schema.routines WHERE routine_schema = 'public';

