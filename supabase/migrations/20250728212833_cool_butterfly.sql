/*
  # Database Structure Optimization

  1. New Tables
    - Optimized ID handling with proper indexing
    - Improved foreign key relationships
    - Better data types and constraints
    - Added composite indexes for performance

  2. Security
    - Enhanced RLS policies
    - Better access control patterns
    - Secure ID generation

  3. Performance
    - Optimized indexes for common queries
    - Better query patterns
    - Reduced N+1 query issues
*/

-- Create optimized profiles table
CREATE TABLE IF NOT EXISTS profiles_new (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  username text UNIQUE,
  full_name text,
  profile_image_url text,
  is_creator boolean DEFAULT false,
  stripe_account_id text,
  stripe_onboarding_complete boolean DEFAULT false,
  total_earnings_cents integer DEFAULT 0,
  total_sales_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  CONSTRAINT profiles_username_format CHECK (username ~ '^[a-zA-Z0-9_]{3,20}$'),
  CONSTRAINT profiles_email_format CHECK (email ~ '^[^@]+@[^@]+\.[^@]+$')
);

-- Create optimized files table with better ID structure
CREATE TABLE IF NOT EXISTS files_new (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  slug text UNIQUE NOT NULL, -- Human-readable URL slug
  title text NOT NULL,
  description text,
  file_name text NOT NULL,
  file_path text NOT NULL,
  file_size_bytes bigint,
  content_type text,
  price_cents integer NOT NULL DEFAULT 0,
  currency text DEFAULT 'usd',
  
  -- Stripe integration
  stripe_product_id text,
  stripe_price_id text,
  
  -- Access control
  is_active boolean DEFAULT true,
  expires_at timestamptz,
  max_downloads integer,
  download_count integer DEFAULT 0,
  view_count integer DEFAULT 0,
  
  -- Content protection
  screenshot_protection boolean DEFAULT true,
  watermark_enabled boolean DEFAULT false,
  
  -- Grouping
  collection_id uuid REFERENCES files_new(id) ON DELETE SET NULL,
  sort_order integer DEFAULT 0,
  
  -- Analytics
  total_revenue_cents integer DEFAULT 0,
  purchase_count integer DEFAULT 0,
  
  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  CONSTRAINT files_price_positive CHECK (price_cents >= 0),
  CONSTRAINT files_slug_format CHECK (slug ~ '^[a-z0-9-]+$'),
  CONSTRAINT files_title_length CHECK (char_length(title) BETWEEN 1 AND 200)
);

-- Create optimized transactions table
CREATE TABLE IF NOT EXISTS transactions_new (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_number text UNIQUE NOT NULL, -- Human-readable transaction ID
  
  -- Relationships
  file_id uuid NOT NULL REFERENCES files_new(id) ON DELETE RESTRICT,
  buyer_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  seller_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  
  -- Payment details
  amount_cents integer NOT NULL,
  currency text DEFAULT 'usd',
  platform_fee_cents integer NOT NULL DEFAULT 0,
  seller_earnings_cents integer NOT NULL,
  
  -- Stripe integration
  stripe_session_id text UNIQUE,
  stripe_payment_intent_id text,
  stripe_charge_id text,
  
  -- Status and metadata
  status text NOT NULL DEFAULT 'pending',
  payment_method text,
  buyer_email text NOT NULL,
  buyer_country text,
  
  -- Access control
  access_expires_at timestamptz,
  download_limit integer,
  downloads_used integer DEFAULT 0,
  
  -- Timestamps
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  expires_at timestamptz,
  
  CONSTRAINT transactions_status_valid CHECK (status IN ('pending', 'completed', 'failed', 'refunded', 'cancelled')),
  CONSTRAINT transactions_amount_positive CHECK (amount_cents > 0),
  CONSTRAINT transactions_earnings_valid CHECK (seller_earnings_cents >= 0 AND seller_earnings_cents <= amount_cents)
);

-- Create file collections table for better grouping
CREATE TABLE IF NOT EXISTS file_collections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  description text,
  cover_image_url text,
  price_cents integer NOT NULL DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  CONSTRAINT collections_slug_format CHECK (slug ~ '^[a-z0-9-]+$')
);

-- Create download tracking table
CREATE TABLE IF NOT EXISTS file_downloads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  file_id uuid NOT NULL REFERENCES files_new(id) ON DELETE CASCADE,
  transaction_id uuid NOT NULL REFERENCES transactions_new(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ip_address inet,
  user_agent text,
  downloaded_at timestamptz DEFAULT now(),
  
  UNIQUE(file_id, transaction_id, downloaded_at)
);

-- Create analytics events table
CREATE TABLE IF NOT EXISTS analytics_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL,
  file_id uuid REFERENCES files_new(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id text,
  metadata jsonb DEFAULT '{}',
  ip_address inet,
  user_agent text,
  created_at timestamptz DEFAULT now(),
  
  CONSTRAINT analytics_event_type_valid CHECK (event_type IN ('view', 'download', 'purchase', 'share'))
);

-- Create indexes for optimal performance
CREATE INDEX IF NOT EXISTS idx_files_creator_active ON files_new(creator_id, is_active, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_files_slug ON files_new(slug) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_files_collection ON files_new(collection_id, sort_order) WHERE collection_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_files_price_range ON files_new(price_cents, created_at DESC) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_transactions_buyer ON transactions_new(buyer_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_seller ON transactions_new(seller_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_file ON transactions_new(file_id, status);
CREATE INDEX IF NOT EXISTS idx_transactions_stripe_session ON transactions_new(stripe_session_id) WHERE stripe_session_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles_new(username) WHERE username IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_creator ON profiles_new(is_creator, created_at DESC) WHERE is_creator = true;

CREATE INDEX IF NOT EXISTS idx_downloads_file_transaction ON file_downloads(file_id, transaction_id);
CREATE INDEX IF NOT EXISTS idx_downloads_user_date ON file_downloads(user_id, downloaded_at DESC);

CREATE INDEX IF NOT EXISTS idx_analytics_file_type ON analytics_events(file_id, event_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_user_events ON analytics_events(user_id, event_type, created_at DESC);

-- Enable RLS on all tables
ALTER TABLE profiles_new ENABLE ROW LEVEL SECURITY;
ALTER TABLE files_new ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions_new ENABLE ROW LEVEL SECURITY;
ALTER TABLE file_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE file_downloads ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles_new
CREATE POLICY "Users can view own profile" ON profiles_new
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update own profile" ON profiles_new
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can insert own profile" ON profiles_new
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Public can view creator profiles" ON profiles_new
  FOR SELECT USING (is_creator = true);

-- RLS Policies for files_new
CREATE POLICY "Creators can manage own files" ON files_new
  FOR ALL USING (creator_id = auth.uid());

CREATE POLICY "Public can view active files" ON files_new
  FOR SELECT USING (is_active = true);

-- RLS Policies for transactions_new
CREATE POLICY "Buyers can view own purchases" ON transactions_new
  FOR SELECT USING (buyer_id = auth.uid());

CREATE POLICY "Sellers can view own sales" ON transactions_new
  FOR SELECT USING (seller_id = auth.uid());

CREATE POLICY "System can manage transactions" ON transactions_new
  FOR ALL USING (auth.role() = 'service_role');

-- RLS Policies for file_collections
CREATE POLICY "Creators can manage own collections" ON file_collections
  FOR ALL USING (creator_id = auth.uid());

CREATE POLICY "Public can view active collections" ON file_collections
  FOR SELECT USING (is_active = true);

-- RLS Policies for file_downloads
CREATE POLICY "Users can view own downloads" ON file_downloads
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "System can track downloads" ON file_downloads
  FOR INSERT WITH CHECK (true);

-- RLS Policies for analytics_events
CREATE POLICY "System can manage analytics" ON analytics_events
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Users can view own analytics" ON analytics_events
  FOR SELECT USING (user_id = auth.uid());

-- Functions for ID generation
CREATE OR REPLACE FUNCTION generate_transaction_number()
RETURNS text AS $$
BEGIN
  RETURN 'TXN-' || UPPER(SUBSTRING(gen_random_uuid()::text FROM 1 FOR 8));
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION generate_file_slug(title text)
RETURNS text AS $$
BEGIN
  RETURN LOWER(REGEXP_REPLACE(
    REGEXP_REPLACE(title, '[^a-zA-Z0-9\s-]', '', 'g'),
    '\s+', '-', 'g'
  )) || '-' || SUBSTRING(gen_random_uuid()::text FROM 1 FOR 6);
END;
$$ LANGUAGE plpgsql;

-- Triggers for automatic field updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles_new
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_files_updated_at BEFORE UPDATE ON files_new
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_collections_updated_at BEFORE UPDATE ON file_collections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger for automatic transaction number generation
CREATE OR REPLACE FUNCTION set_transaction_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.transaction_number IS NULL THEN
    NEW.transaction_number = generate_transaction_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_transaction_number_trigger BEFORE INSERT ON transactions_new
  FOR EACH ROW EXECUTE FUNCTION set_transaction_number();

-- Trigger for automatic file slug generation
CREATE OR REPLACE FUNCTION set_file_slug()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.slug IS NULL THEN
    NEW.slug = generate_file_slug(NEW.title);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_file_slug_trigger BEFORE INSERT ON files_new
  FOR EACH ROW EXECUTE FUNCTION set_file_slug();

-- Function to update file statistics
CREATE OR REPLACE FUNCTION update_file_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.status = 'completed' THEN
    UPDATE files_new SET 
      purchase_count = purchase_count + 1,
      total_revenue_cents = total_revenue_cents + NEW.amount_cents
    WHERE id = NEW.file_id;
    
    UPDATE profiles_new SET
      total_sales_count = total_sales_count + 1,
      total_earnings_cents = total_earnings_cents + NEW.seller_earnings_cents
    WHERE user_id = NEW.seller_id;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_file_stats_trigger 
  AFTER INSERT OR UPDATE ON transactions_new
  FOR EACH ROW EXECUTE FUNCTION update_file_stats();

-- Create views for common queries
CREATE OR REPLACE VIEW file_details AS
SELECT 
  f.*,
  p.username as creator_username,
  p.profile_image_url as creator_avatar,
  COALESCE(f.purchase_count, 0) as sales_count,
  COALESCE(f.total_revenue_cents, 0) as revenue_cents
FROM files_new f
LEFT JOIN profiles_new p ON f.creator_id = p.user_id
WHERE f.is_active = true;

CREATE OR REPLACE VIEW transaction_details AS
SELECT 
  t.*,
  f.title as file_title,
  f.slug as file_slug,
  seller.username as seller_username,
  buyer.username as buyer_username
FROM transactions_new t
LEFT JOIN files_new f ON t.file_id = f.id
LEFT JOIN profiles_new seller ON t.seller_id = seller.user_id
LEFT JOIN profiles_new buyer ON t.buyer_id = buyer.user_id;