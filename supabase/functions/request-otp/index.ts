import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RequestOtpPayload {
  email: string;
  redirectTo?: string;
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, redirectTo }: RequestOtpPayload = await req.json();

    if (!email || typeof email !== "string") {
      console.error("Missing or invalid email");
      return new Response(
        JSON.stringify({ error: "Email is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();
    console.log(`OTP request for email: ${normalizedEmail}`);

    // Create Supabase client with service role to bypass RLS for admin operations
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check if email is in allowed_emails
    const { data: allowedEmail, error: lookupError } = await supabase
      .from("allowed_emails")
      .select("email, is_admin")
      .eq("email", normalizedEmail)
      .maybeSingle();

    if (lookupError) {
      console.error("Error looking up allowed email:", lookupError);
      return new Response(
        JSON.stringify({ error: "Failed to verify email authorization" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!allowedEmail) {
      console.log(`Email not allowed: ${normalizedEmail}`);
      return new Response(
        JSON.stringify({ 
          error: "This email is not authorized to access this application. Please contact the administrator." 
        }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Email authorized. Is admin: ${allowedEmail.is_admin}`);

    // Send OTP using Supabase Auth
    const { error: otpError } = await supabase.auth.signInWithOtp({
      email: normalizedEmail,
      options: {
        emailRedirectTo: redirectTo || `${supabaseUrl.replace('.supabase.co', '.lovableproject.com')}/admin`,
      },
    });

    if (otpError) {
      console.error("Error sending OTP:", otpError);
      return new Response(
        JSON.stringify({ error: otpError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`OTP sent successfully to ${normalizedEmail}`);
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Magic link sent to your email",
        isAdmin: allowedEmail.is_admin 
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Unexpected error in request-otp:", error);
    return new Response(
      JSON.stringify({ error: "An unexpected error occurred" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
