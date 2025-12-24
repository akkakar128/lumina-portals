-- Create enum for theme types
CREATE TYPE public.portfolio_theme AS ENUM ('light', 'dark', 'cyberpunk', 'minimal', 'glass', 'neon');

-- Add theme column to portfolios table
ALTER TABLE public.portfolios 
ADD COLUMN theme public.portfolio_theme DEFAULT 'cyberpunk';

-- Update existing portfolios to use cyberpunk theme
UPDATE public.portfolios SET theme = 'cyberpunk' WHERE theme IS NULL;