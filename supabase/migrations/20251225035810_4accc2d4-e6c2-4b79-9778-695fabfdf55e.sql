-- Create allowed_emails table for email whitelist
CREATE TABLE public.allowed_emails (
  email TEXT NOT NULL PRIMARY KEY,
  is_admin BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Enable RLS
ALTER TABLE public.allowed_emails ENABLE ROW LEVEL SECURITY;

-- Policy: master_admin can do anything
CREATE POLICY "Master admin can manage allowed emails"
ON public.allowed_emails
FOR ALL
USING (public.is_master_admin(auth.uid()));

-- Policy: Anyone can check if their email is allowed (for login flow)
CREATE POLICY "Anyone can check if email allowed"
ON public.allowed_emails
FOR SELECT
USING (true);

-- Seed admin email
INSERT INTO public.allowed_emails (email, is_admin)
VALUES ('akkakar125@gmail.com', true);