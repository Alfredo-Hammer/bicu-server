-- Migration: Add image_url column to equipments table
-- Date: 2026-02-15

-- Add image_url column to equipments table
ALTER TABLE equipments 
ADD COLUMN IF NOT EXISTS image_url VARCHAR(255);

-- Create index for image_url for better query performance
CREATE INDEX IF NOT EXISTS idx_equipments_image_url ON equipments(image_url);

-- Comment
COMMENT ON COLUMN equipments.image_url IS 'URL path to equipment image stored in /uploads folder';
