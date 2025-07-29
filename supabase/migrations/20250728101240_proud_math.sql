/*
  # Update database schema to match application code

  1. Schema Updates
    - Add missing columns to profiles table (is_creator, username, profile_image, stripe_connected_account_id)
    - Add missing columns to transactions table (payment_status, buyer_id, payment_link, expiry_date)
    - Update files table structure to match expected schema
    - Add additional_files table if not exists

  2. Security
    - Update RLS policies for new columns
    - Ensure proper access controls

  3. Data Migration
    - Set default values for existing records
    - Ensure data consistency
*/

-- Update profiles table
DO $$
BEGIN
  -- Add username column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'username'
  ) THEN
    ALTER TABLE profiles ADD COLUMN username text;
  END IF;

  -- Add profile_image column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'profile_image'
  ) THEN
    ALTER TABLE profiles ADD COLUMN profile_image text;
  END IF;

  -- Add is_creator column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'is_creator'
  ) THEN
    ALTER TABLE profiles ADD COLUMN is_creator boolean DEFAULT false;
  END IF;

  -- Add stripe_connected_account_id column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'stripe_connected_account_id'
  ) THEN
    ALTER TABLE profiles ADD COLUMN stripe_connected_account_id text;
  END IF;
END $$;

-- Update files table
DO $$
BEGIN
  -- Add file_name column if it doesn't exist (rename from name if needed)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'files' AND column_name = 'file_name'
  ) THEN
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'files' AND column_name = 'name'
    ) THEN
      ALTER TABLE files RENAME COLUMN name TO file_name;
    ELSE
      ALTER TABLE files ADD COLUMN file_name text NOT NULL DEFAULT '';
    END IF;
  END IF;

  -- Add file_url column if it doesn't exist (rename from file_path if needed)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'files' AND column_name = 'file_url'
  ) THEN
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'files' AND column_name = 'file_path'
    ) THEN
      ALTER TABLE files RENAME COLUMN file_path TO file_url;
    ELSE
      ALTER TABLE files ADD COLUMN file_url text NOT NULL DEFAULT '';
    END IF;
  END IF;

  -- Add price column if it doesn't exist (rename from price_cents if needed)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'files' AND column_name = 'price'
  ) THEN
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'files' AND column_name = 'price_cents'
    ) THEN
      ALTER TABLE files RENAME COLUMN price_cents TO price;
    ELSE
      ALTER TABLE files ADD COLUMN price integer NOT NULL DEFAULT 0;
    END IF;
  END IF;

  -- Add expiry_date column if it doesn't exist (rename from expires_at if needed)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'files' AND column_name = 'expiry_date'
  ) THEN
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'files' AND column_name = 'expires_at'
    ) THEN
      ALTER TABLE files RENAME COLUMN expires_at TO expiry_date;
    ELSE
      ALTER TABLE files ADD COLUMN expiry_date timestamptz;
    END IF;
  END IF;

  -- Add allow_screenshots column if it doesn't exist (rename from screenshot_prevention if needed)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'files' AND column_name = 'allow_screenshots'
  ) THEN
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'files' AND column_name = 'screenshot_prevention'
    ) THEN
      ALTER TABLE files ADD COLUMN allow_screenshots boolean DEFAULT true;
      UPDATE files SET allow_screenshots = NOT screenshot_prevention;
      ALTER TABLE files DROP COLUMN screenshot_prevention;
    ELSE
      ALTER TABLE files ADD COLUMN allow_screenshots boolean DEFAULT true;
    END IF;
  END IF;
END $$;

-- Update transactions table
DO $$
BEGIN
  -- Add buyer_id column if it doesn't exist (rename from buyer_email if needed)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'transactions' AND column_name = 'buyer_id'
  ) THEN
    ALTER TABLE transactions ADD COLUMN buyer_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;
  END IF;

  -- Add amount_paid column if it doesn't exist (rename from amount_cents if needed)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'transactions' AND column_name = 'amount_paid'
  ) THEN
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'transactions' AND column_name = 'amount_cents'
    ) THEN
      ALTER TABLE transactions RENAME COLUMN amount_cents TO amount_paid;
    ELSE
      ALTER TABLE transactions ADD COLUMN amount_paid integer NOT NULL DEFAULT 0;
    END IF;
  END IF;

  -- Add payment_status column if it doesn't exist (rename from status if needed)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'transactions' AND column_name = 'payment_status'
  ) THEN
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'transactions' AND column_name = 'status'
    ) THEN
      ALTER TABLE transactions RENAME COLUMN status TO payment_status;
    ELSE
      ALTER TABLE transactions ADD COLUMN payment_status text DEFAULT 'pending';
    END IF;
  END IF;

  -- Add payment_link column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'transactions' AND column_name = 'payment_link'
  ) THEN
    ALTER TABLE transactions ADD COLUMN payment_link text;
  END IF;

  -- Add expiry_date column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'transactions' AND column_name = 'expiry_date'
  ) THEN
    ALTER TABLE transactions ADD COLUMN expiry_date timestamptz;
  END IF;
END $$;

-- Create additional_files table if it doesn't exist
CREATE TABLE IF NOT EXISTS additional_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  file_id uuid NOT NULL REFERENCES files(id) ON DELETE CASCADE,
  file_name text NOT NULL,
  file_url text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on additional_files
ALTER TABLE additional_files ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for additional_files
CREATE POLICY "Creators can manage additional files for their content"
  ON additional_files
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM files
      WHERE files.id = additional_files.file_id
      AND files.creator_id = auth.uid()
    )
  );

CREATE POLICY "Buyers can view additional files for purchased content"
  ON additional_files
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM files
      JOIN transactions ON transactions.file_id = files.id
      WHERE files.id = additional_files.file_id
      AND transactions.buyer_id = auth.uid()
      AND transactions.payment_status = 'completed'
    )
  );

-- Update existing data to have proper defaults
UPDATE profiles SET username = split_part(email, '@', 1) WHERE username IS NULL;
UPDATE profiles SET is_creator = false WHERE is_creator IS NULL;