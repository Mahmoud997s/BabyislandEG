-- Recommended Indexes for Orders Table
-- Run this in Supabase SQL Editor for optimal query performance

-- Primary indexes for filtering & sorting
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_method ON orders(payment_method);

-- Index for user lookups
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);

-- Composite index for common filter+sort combinations
CREATE INDEX IF NOT EXISTS idx_orders_status_created_at ON orders(status, created_at DESC);

-- Phone lookup (commonly searched)
CREATE INDEX IF NOT EXISTS idx_orders_phone ON orders(phone);

-- Optional: Enable trigram extension for fuzzy search on customer_name/email
-- CREATE EXTENSION IF NOT EXISTS pg_trgm;
-- CREATE INDEX idx_orders_customer_name_trgm ON orders USING gin(customer_name gin_trgm_ops);
-- CREATE INDEX idx_orders_email_trgm ON orders USING gin(email gin_trgm_ops);
