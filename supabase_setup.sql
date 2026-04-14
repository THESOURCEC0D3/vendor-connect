-- VendorConnect: Supabase Setup
-- Run this in your Supabase SQL Editor (Database > SQL Editor > New Query)

-- 1. Create the vendors table
CREATE TABLE vendors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  business_name TEXT NOT NULL,
  products TEXT[] NOT NULL DEFAULT '{}',
  location TEXT NOT NULL,
  phone TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,

  -- One vendor profile per user
  CONSTRAINT unique_user_vendor UNIQUE (user_id)
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;

-- 3. Policies
-- Anyone can read vendor profiles (public directory)
CREATE POLICY "Public vendors are viewable by everyone"
ON vendors FOR SELECT
USING (true);

-- Users can only insert their own vendor profile
CREATE POLICY "Users can create their own vendor profile"
ON vendors FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can only update their own vendor profile
CREATE POLICY "Users can update their own vendor profile"
ON vendors FOR UPDATE
USING (auth.uid() = user_id);

-- Users can only delete their own vendor profile
CREATE POLICY "Users can delete their own vendor profile"
ON vendors FOR DELETE
USING (auth.uid() = user_id);

-- 4. Full-text search index on business_name and products
-- Enables fast search across both fields
CREATE INDEX vendors_search_idx ON vendors USING GIN (
  to_tsvector('english', business_name || ' ' || array_to_string(products, ' '))
);
