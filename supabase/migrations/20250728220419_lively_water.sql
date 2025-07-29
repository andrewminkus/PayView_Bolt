/*
  # Add missing is_active column to files table

  1. Changes
    - Add `is_active` column to `files` table
    - Set default value to `true` for new records
    - Update existing records to have `is_active = true`

  2. Security
    - No RLS changes needed as this is just adding a column
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'files' AND column_name = 'is_active'
  ) THEN
    ALTER TABLE files ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT true;
  END IF;
END $$;