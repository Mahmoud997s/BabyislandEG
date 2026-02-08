-- =============================================
-- Smart Product Sync System - Schema Updates
-- Run this in Supabase SQL Editor
-- =============================================

-- 1. Add new columns to products table
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS source_url TEXT,
ADD COLUMN IF NOT EXISTS source_platform TEXT DEFAULT 'manual',
ADD COLUMN IF NOT EXISTS source_price DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS source_stock INTEGER,
ADD COLUMN IF NOT EXISTS last_synced_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS sync_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS price_margin DECIMAL(5,2) DEFAULT 20.00,
ADD COLUMN IF NOT EXISTS auto_update_price BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS auto_update_stock BOOLEAN DEFAULT false;

-- 2. Create sync_logs table
CREATE TABLE IF NOT EXISTS sync_logs (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT REFERENCES products(id) ON DELETE CASCADE,
    sync_type TEXT NOT NULL CHECK (sync_type IN ('price', 'stock', 'full')),
    old_value JSONB,
    new_value JSONB,
    status TEXT NOT NULL CHECK (status IN ('success', 'failed', 'skipped')),
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_sync_logs_product_id ON sync_logs(product_id);
CREATE INDEX IF NOT EXISTS idx_sync_logs_created_at ON sync_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_products_sync_enabled ON products(sync_enabled) WHERE sync_enabled = true;

-- 4. Update RLS Policies for products table
-- First, enable RLS if not already enabled
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Allow read for all" ON products;
DROP POLICY IF EXISTS "Allow all for authenticated" ON products;
DROP POLICY IF EXISTS "Allow insert for authenticated" ON products;
DROP POLICY IF EXISTS "Allow update for authenticated" ON products;
DROP POLICY IF EXISTS "Allow delete for authenticated" ON products;

-- Create new policies
-- Anyone can read products
CREATE POLICY "Allow read for all" ON products
    FOR SELECT USING (true);

-- Authenticated users can do everything
CREATE POLICY "Allow insert for authenticated" ON products
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow update for authenticated" ON products
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow delete for authenticated" ON products
    FOR DELETE USING (auth.role() = 'authenticated');

-- 5. RLS for sync_logs table
ALTER TABLE sync_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow read for authenticated" ON sync_logs;
DROP POLICY IF EXISTS "Allow insert for authenticated" ON sync_logs;

CREATE POLICY "Allow read for authenticated" ON sync_logs
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow insert for authenticated" ON sync_logs
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 6. Create a function to calculate final price based on margin
CREATE OR REPLACE FUNCTION calculate_final_price(source_price DECIMAL, margin DECIMAL)
RETURNS DECIMAL AS $$
BEGIN
    RETURN ROUND(source_price * (1 + margin / 100), 2);
END;
$$ LANGUAGE plpgsql;

-- 7. Create a view for products needing sync
CREATE OR REPLACE VIEW products_needing_sync AS
SELECT 
    id,
    name,
    source_url,
    source_platform,
    last_synced_at,
    CASE 
        WHEN last_synced_at IS NULL THEN 'never'
        WHEN last_synced_at < NOW() - INTERVAL '24 hours' THEN 'stale'
        ELSE 'fresh'
    END as sync_status
FROM products
WHERE sync_enabled = true
ORDER BY last_synced_at ASC NULLS FIRST;

-- =============================================
-- SUCCESS! Schema updated.
-- =============================================
