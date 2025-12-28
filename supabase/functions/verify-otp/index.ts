import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface VerifyOtpPayload {
  email: string;
  code: string;
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, code }: VerifyOtpPayload = await req.json();

    if (!email || !code) {
      return new Response(
        JSON.stringify({ error: "Email and code are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();
    const normalizedCode = code.trim();

    console.log(`Verifying OTP for email: ${normalizedEmail}`);

    // Create Supabase client with service role
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get stored OTP
    const { data: otpRecord, error: fetchError } = await supabase
      .from("otp_codes")
      .select("*")
      .eq("email", normalizedEmail)
      .maybeSingle();

    if (fetchError) {
      console.error("Error fetching OTP:", fetchError);
      return new Response(
        JSON.stringify({ error: "Failed to verify code" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!otpRecord) {
      console.log(`No OTP found for: ${normalizedEmail}`);
      return new Response(
        JSON.stringify({ error: "No verification code found. Please request a new one." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if OTP has expired
    if (new Date(otpRecord.expires_at) < new Date()) {
      console.log(`OTP expired for: ${normalizedEmail}`);
      // Delete expired OTP
      await supabase.from("otp_codes").delete().eq("email", normalizedEmail);
      return new Response(
        JSON.stringify({ error: "Verification code has expired. Please request a new one." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check attempts (max 5)
    if (otpRecord.attempts >= 5) {
      console.log(`Too many attempts for: ${normalizedEmail}`);
      await supabase.from("otp_codes").delete().eq("email", normalizedEmail);
      return new Response(
        JSON.stringify({ error: "Too many failed attempts. Please request a new code." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify code
    if (otpRecord.code !== normalizedCode) {
      console.log(`Invalid code attempt for: ${normalizedEmail}`);
      // Increment attempts
      await supabase
        .from("otp_codes")
        .update({ attempts: otpRecord.attempts + 1 })
        .eq("email", normalizedEmail);
      return new Response(
        JSON.stringify({ error: "Invalid verification code. Please try again." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`OTP verified successfully for: ${normalizedEmail}`);

    // Delete used OTP
    await supabase.from("otp_codes").delete().eq("email", normalizedEmail);

    // Check if user exists
    const { data: existingUsers, error: listError } = await supabase.auth.admin.listUsers();
    
    if (listError) {
      console.error("Error listing users:", listError);
      return new Response(
        JSON.stringify({ error: "Failed to verify user" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const existingUser = existingUsers.users.find(u => u.email === normalizedEmail);

    let userId: string;
    let accessToken: string;
    let refreshToken: string;

    if (existingUser) {
      console.log(`User exists, generating session for: ${normalizedEmail}`);
      // Generate a session for existing user
      const { data: sessionData, error: signInError } = await supabase.auth.admin.generateLink({
        type: 'magiclink',
        email: normalizedEmail,
      });

      if (signInError || !sessionData) {
        console.error("Error generating link:", signInError);
        return new Response(
          JSON.stringify({ error: "Failed to authenticate" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Use the token_hash to sign in
      const { data: verifyData, error: verifyError } = await supabase.auth.verifyOtp({
        token_hash: sessionData.properties.hashed_token,
        type: 'magiclink',
      });

      if (verifyError || !verifyData.session) {
        console.error("Error verifying:", verifyError);
        return new Response(
          JSON.stringify({ error: "Failed to create session" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      accessToken = verifyData.session.access_token;
      refreshToken = verifyData.session.refresh_token;
      userId = existingUser.id;
    } else {
      console.log(`Creating new user: ${normalizedEmail}`);
      // Create new user with auto-confirm
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email: normalizedEmail,
        email_confirm: true,
      });

      if (createError || !newUser.user) {
        console.error("Error creating user:", createError);
        return new Response(
          JSON.stringify({ error: "Failed to create user account" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      userId = newUser.user.id;

      // Generate session for new user
      const { data: sessionData, error: linkError } = await supabase.auth.admin.generateLink({
        type: 'magiclink',
        email: normalizedEmail,
      });

      if (linkError || !sessionData) {
        console.error("Error generating link:", linkError);
        return new Response(
          JSON.stringify({ error: "Failed to authenticate" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { data: verifyData, error: verifyError } = await supabase.auth.verifyOtp({
        token_hash: sessionData.properties.hashed_token,
        type: 'magiclink',
      });

      if (verifyError || !verifyData.session) {
        console.error("Error verifying:", verifyError);
        return new Response(
          JSON.stringify({ error: "Failed to create session" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      accessToken = verifyData.session.access_token;
      refreshToken = verifyData.session.refresh_token;
    }

    console.log(`Session created for user: ${userId}`);

    return new Response(
      JSON.stringify({ 
        success: true,
        access_token: accessToken,
        refresh_token: refreshToken,
        user_id: userId,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Unexpected error in verify-otp:", error);
    return new Response(
      JSON.stringify({ error: "An unexpected error occurred" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
