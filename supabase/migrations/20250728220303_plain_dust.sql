/*
  # Add missing file_size_bytes column to files table

  1. Changes
    - Add file_size_bytes column to files table
    - This column was referenced in the application code but missing from the database schema

  2. Notes
    - Column allows NULL values for existing records
    - New uploads will populate this field with actual file sizes
*/

-- Add the missing file_size_bytes column to the files table
ALTER TABLE files ADD COLUMN IF NOT EXISTS file_size_bytes BIGINT;