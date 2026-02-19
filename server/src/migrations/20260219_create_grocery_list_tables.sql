-- 20260219_create_grocery_list_tables.sql
-- Migration: Create tables for shared grocery list and purchase history

CREATE TABLE grocery_items (
    item_id SERIAL PRIMARY KEY,
    group_id INTEGER NOT NULL REFERENCES groups(group_id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50),
    added_by INTEGER REFERENCES users(id),
    is_suggested BOOLEAN NOT NULL DEFAULT FALSE,
    is_purchased BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE grocery_purchases (
    purchase_id SERIAL PRIMARY KEY,
    group_id INTEGER NOT NULL REFERENCES groups(group_id) ON DELETE CASCADE,
    item_name VARCHAR(100) NOT NULL,
    purchased_by INTEGER REFERENCES users(id),
    purchase_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for quick lookup of group grocery items
CREATE INDEX idx_grocery_items_group_id ON grocery_items(group_id);
CREATE INDEX idx_grocery_purchases_group_id ON grocery_purchases(group_id);