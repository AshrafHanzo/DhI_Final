-- Add company_name column to jobs table if it doesn't exist
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS company_name VARCHAR(255);
