-- 1. Add Tracking Columns
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS views_count BIGINT DEFAULT 0,
ADD COLUMN IF NOT EXISTS sales_count BIGINT DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_sale_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS ranking_score DOUBLE PRECISION DEFAULT 0;

-- 2. Create Index for Fast Sorting
CREATE INDEX IF NOT EXISTS idx_products_ranking_score ON products(ranking_score DESC);

-- 3. Measurement RPC (Stored Procedure) for Atomic Sales Increment
-- usage: await supabase.rpc('increment_sales', { p_id: 123, qty: 1 })
CREATE OR REPLACE FUNCTION increment_sales(p_id BIGINT, qty INT)
RETURNS VOID AS $$
BEGIN
  UPDATE products 
  SET sales_count = COALESCE(sales_count, 0) + qty,
      last_sale_at = NOW()
  WHERE id = p_id;
END;
$$ LANGUAGE plpgsql;

-- 4. Measurement RPC for Atomic View Increment
-- usage: await supabase.rpc('increment_view', { p_id: 123 })
CREATE OR REPLACE FUNCTION increment_view(p_id BIGINT)
RETURNS VOID AS $$
BEGIN
  UPDATE products 
  SET views_count = COALESCE(views_count, 0) + 1
  WHERE id = p_id;
END;
$$ LANGUAGE plpgsql;
