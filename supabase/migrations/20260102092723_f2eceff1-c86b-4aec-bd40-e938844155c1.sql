-- Create table for storing OTP codes
CREATE TABLE public.otp_codes (
  email TEXT PRIMARY KEY,
  code TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  attempts INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS (no policies needed as it's only accessed via service role in edge functions)
ALTER TABLE public.otp_codes ENABLE ROW LEVEL SECURITY;