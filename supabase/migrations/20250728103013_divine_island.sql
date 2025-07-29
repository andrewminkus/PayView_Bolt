/*
  # Add group_id column to files table

  1. Changes
    - Add `group_id` column to `files` table to support file grouping
    - Column is nullable to support both individual and grouped files
    - Add index for better query performance

  2. Notes
    - Files with the same group_id will be displayed together
    - Individual files will have null group_id
*/

-- Add group_id column to files table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'files' AND column_name = 'group_id'
  ) THEN
    ALTER TABLE files ADD COLUMN group_id text;
  END IF;
END $$;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_files_group_id ON files(group_id);