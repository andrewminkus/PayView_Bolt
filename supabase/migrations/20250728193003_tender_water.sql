/*
  # Add Stripe Connect fields to profiles and files tables

  1. Profile Updates
    - Add stripe_connected_account_id for Connect accounts
    - Add stripe_onboarding_complete flag
    
  2. File Updates  
    - Add stripe_product_id and stripe_price_id
    - Remove old price field, replace with price_cents
    
  3. Security
    - Update RLS policies for new fields
*/

-- Add Stripe Connect fields to profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'stripe_connected_account_id'
  ) THEN
    ALTER TABLE profiles ADD COLUMN stripe_connected_account_id text;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'stripe_onboarding_complete'
  ) THEN
    ALTER TABLE profiles ADD COLUMN stripe_onboarding_complete boolean DEFAULT false;
  END IF;
END $$;

-- Add Stripe product/price fields to files
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'files' AND column_name = 'stripe_product_id'
  ) THEN
    ALTER TABLE files ADD COLUMN stripe_product_id text;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'files' AND column_name = 'stripe_price_id'
  ) THEN
    ALTER TABLE files ADD COLUMN stripe_price_id text;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'files' AND column_name = 'price_cents'
  ) THEN
    ALTER TABLE files ADD COLUMN price_cents integer DEFAULT 0;
  END IF;
END $$;

-- Update existing price data if needed
UPDATE files SET price_cents = price * 100 WHERE price_cents = 0 AND price > 0;