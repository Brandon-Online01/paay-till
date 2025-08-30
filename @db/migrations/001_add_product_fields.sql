-- Migration: Add new product fields for enhanced inventory management
-- Version: 001
-- Description: Adds barcode, qrCode, reorderQty, maxBuyQty, minBuyQty, resellerName, brand, information fields

-- Add new columns to products table
ALTER TABLE products ADD COLUMN barcode TEXT;
ALTER TABLE products ADD COLUMN qrCode TEXT;
ALTER TABLE products ADD COLUMN reorderQty INTEGER NOT NULL DEFAULT 10 CHECK (reorderQty >= 0);
ALTER TABLE products ADD COLUMN maxBuyQty INTEGER NOT NULL DEFAULT 100 CHECK (maxBuyQty > 0);
ALTER TABLE products ADD COLUMN minBuyQty INTEGER NOT NULL DEFAULT 1 CHECK (minBuyQty > 0);
ALTER TABLE products ADD COLUMN resellerName TEXT;
ALTER TABLE products ADD COLUMN brand TEXT;
ALTER TABLE products ADD COLUMN information TEXT; -- Additional product information/notes

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_products_barcode ON products(barcode);
CREATE INDEX IF NOT EXISTS idx_products_qrcode ON products(qrCode);
CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand);
CREATE INDEX IF NOT EXISTS idx_products_category_brand ON products(category, brand);
CREATE INDEX IF NOT EXISTS idx_products_reseller ON products(resellerName);

-- Create index for stock level queries (for reorder alerts)
CREATE INDEX IF NOT EXISTS idx_products_stock_reorder ON products(stockQuantity, reorderQty);

-- Update existing products with default values where applicable
UPDATE products SET 
    reorderQty = CASE 
        WHEN category = 'food' THEN 20
        WHEN category = 'electronics' THEN 5
        WHEN category = 'clothing' THEN 15
        ELSE 10
    END,
    maxBuyQty = CASE
        WHEN category = 'food' THEN 50
        WHEN category = 'electronics' THEN 10
        WHEN category = 'clothing' THEN 25
        ELSE 100
    END,
    minBuyQty = 1
WHERE reorderQty IS NULL OR reorderQty = 0;
