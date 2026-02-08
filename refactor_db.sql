-- 1. Create Analytics Table (High Frequency Updates)
CREATE TABLE IF NOT EXISTS product_analytics (
    product_id BIGINT PRIMARY KEY REFERENCES products(id) ON DELETE CASCADE,
    views_count BIGINT DEFAULT 0,
    sales_count BIGINT DEFAULT 0,
    last_sale_at TIMESTAMPTZ,
    ranking_score DOUBLE PRECISION DEFAULT 0
);

-- 2. Create Sync Config Table (Technical/Backend Data)
CREATE TABLE IF NOT EXISTS product_sync_config (
    product_id BIGINT PRIMARY KEY REFERENCES products(id) ON DELETE CASCADE,
    source_url TEXT,
    source_platform TEXT DEFAULT 'manual',
    sync_enabled BOOLEAN DEFAULT false,
    auto_update_price BOOLEAN DEFAULT false,
    auto_update_stock BOOLEAN DEFAULT false,
    last_synced_at TIMESTAMPTZ
);

-- 3. Migrate Data (Move from products to new tables)
INSERT INTO product_analytics (product_id, views_count, sales_count, last_sale_at, ranking_score)
SELECT id, views_count, sales_count, last_sale_at, ranking_score
FROM products
ON CONFLICT (product_id) DO NOTHING;

INSERT INTO product_sync_config (product_id, source_url, source_platform, sync_enabled, auto_update_price, auto_update_stock, last_synced_at)
SELECT id, source_url, source_platform, sync_enabled, auto_update_price, auto_update_stock, last_synced_at
FROM products
ON CONFLICT (product_id) DO NOTHING;

-- 4. Clean up Products Table (Drop moved columns with CASCADE to handle views)
-- WARNING: This drops dependent views like products_needing_sync
ALTER TABLE products 
DROP COLUMN IF EXISTS views_count CASCADE,
DROP COLUMN IF EXISTS sales_count CASCADE,
DROP COLUMN IF EXISTS last_sale_at CASCADE,
DROP COLUMN IF EXISTS ranking_score CASCADE,
DROP COLUMN IF EXISTS source_url CASCADE,
DROP COLUMN IF EXISTS source_platform CASCADE,
DROP COLUMN IF EXISTS sync_enabled CASCADE,
DROP COLUMN IF EXISTS auto_update_price CASCADE,
DROP COLUMN IF EXISTS auto_update_stock CASCADE,
DROP COLUMN IF EXISTS last_synced_at CASCADE;

-- 5. Create Indices for Performance
CREATE INDEX IF NOT EXISTS idx_analytics_ranking ON product_analytics(ranking_score DESC);

-- 6. Update RPCs to target new tables
CREATE OR REPLACE FUNCTION increment_sales(p_id BIGINT, qty INT)
RETURNS VOID AS $$
BEGIN
  INSERT INTO product_analytics (product_id, sales_count, last_sale_at)
  VALUES (p_id, qty, NOW())
  ON CONFLICT (product_id) DO UPDATE 
  SET sales_count = product_analytics.sales_count + qty,
      last_sale_at = NOW();
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION increment_view(p_id BIGINT)
RETURNS VOID AS $$
BEGIN
  INSERT INTO product_analytics (product_id, views_count)
  VALUES (p_id, 1)
  ON CONFLICT (product_id) DO UPDATE 
  SET views_count = product_analytics.views_count + 1;
END;
$$ LANGUAGE plpgsql;

-- 7. Recreate Dependent Views (if needed)
CREATE OR REPLACE VIEW products_needing_sync AS
SELECT 
    p.id,
    p.name,
    s.source_url,
    s.source_platform,
    s.last_synced_at
FROM products p
JOIN product_sync_config s ON p.id = s.product_id
WHERE s.sync_enabled = true;
