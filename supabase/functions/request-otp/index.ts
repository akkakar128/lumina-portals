import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RequestOtpPayload {
  email: string;
}

// Generate a 6-digit OTP
function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email }: RequestOtpPayload = await req.json();

    if (!email || typeof email !== "string") {
      console.error("Missing or invalid email");
      return new Response(
        JSON.stringify({ error: "Email is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();
    console.log(`OTP request for email: ${normalizedEmail}`);

    // Create Supabase client with service role to bypass RLS
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

    // Generate OTP
    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    console.log(`Generated OTP for ${normalizedEmail}, expires at ${expiresAt.toISOString()}`);

    // Store OTP in database
    const { error: upsertError } = await supabase
      .from("otp_codes")
      .upsert({
        email: normalizedEmail,
        code: otp,
        expires_at: expiresAt.toISOString(),
        attempts: 0,
      }, { onConflict: "email" });

    if (upsertError) {
      console.error("Error storing OTP:", upsertError);
      return new Response(
        JSON.stringify({ error: "Failed to generate verification code" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Send OTP via Resend
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      console.error("RESEND_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "Email service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const resend = new Resend(resendApiKey);

    const { error: emailError } = await resend.emails.send({
      from: "Portfolio Admin <onboarding@resend.dev>",
      to: [normalizedEmail],
      subject: "Your Verification Code",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; background-color: #0a0a0f; font-family: 'Courier New', monospace;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0a0f; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table width="100%" max-width="480" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, rgba(0, 245, 212, 0.1) 0%, rgba(0, 245, 212, 0.05) 100%); border: 1px solid rgba(0, 245, 212, 0.3); border-radius: 12px; padding: 40px;">
                  <tr>
                    <td align="center" style="padding-bottom: 24px;">
                      <div style="width: 64px; height: 64px; background: rgba(0, 245, 212, 0.2); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                        <span style="font-size: 32px;">🔐</span>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td align="center" style="padding-bottom: 16px;">
                      <h1 style="color: #00f5d4; font-size: 24px; margin: 0; text-transform: uppercase; letter-spacing: 2px;">
                        Verification Code
                      </h1>
                    </td>
                  </tr>
                  <tr>
                    <td align="center" style="padding-bottom: 32px;">
                      <p style="color: #888; font-size: 14px; margin: 0;">
                        Enter this code to access the admin panel
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td align="center" style="padding-bottom: 32px;">
                      <div style="background: rgba(0, 0, 0, 0.5); border: 2px solid #00f5d4; border-radius: 8px; padding: 20px 40px; display: inline-block;">
                        <span style="color: #00f5d4; font-size: 36px; font-weight: bold; letter-spacing: 8px;">
                          ${otp}
                        </span>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td align="center" style="padding-bottom: 16px;">
                      <p style="color: #666; font-size: 12px; margin: 0;">
                        This code expires in <strong style="color: #00f5d4;">10 minutes</strong>
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td align="center">
                      <p style="color: #444; font-size: 11px; margin: 0;">
                        If you didn't request this code, please ignore this email.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    });

    if (emailError) {
      console.error("Error sending email:", emailError);
      return new Response(
        JSON.stringify({ error: "Failed to send verification email" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`OTP email sent successfully to ${normalizedEmail}`);
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Verification code sent to your email",
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
