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
      from: "Admin <adilurrehmanofficial@gmail.com>",
      to: [normalizedEmail],
      subject: "🔐 Your Secure Access Code",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verification Code</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: #030712; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(180deg, #030712 0%, #0f172a 100%); min-height: 100vh;">
            <tr>
              <td align="center" style="padding: 48px 24px;">
                <!-- Main Card -->
                <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 440px; background: linear-gradient(145deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.8) 100%); border: 1px solid rgba(0, 245, 212, 0.2); border-radius: 24px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 80px rgba(0, 245, 212, 0.1);">
                  
                  <!-- Accent Bar -->
                  <tr>
                    <td style="height: 4px; background: linear-gradient(90deg, #00f5d4 0%, #7c3aed 50%, #00f5d4 100%);"></td>
                  </tr>
                  
                  <!-- Logo Section -->
                  <tr>
                    <td align="center" style="padding: 40px 40px 24px 40px;">
                      <table cellpadding="0" cellspacing="0">
                        <tr>
                          <td style="width: 72px; height: 72px; background: linear-gradient(135deg, rgba(0, 245, 212, 0.2) 0%, rgba(124, 58, 237, 0.2) 100%); border-radius: 20px; border: 1px solid rgba(0, 245, 212, 0.3);" align="center" valign="middle">
                            <span style="font-size: 36px; line-height: 72px;">🛡️</span>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  
                  <!-- Title -->
                  <tr>
                    <td align="center" style="padding: 0 40px 8px 40px;">
                      <h1 style="margin: 0; color: #f8fafc; font-size: 26px; font-weight: 700; letter-spacing: -0.5px;">
                        Secure Access Code
                      </h1>
                    </td>
                  </tr>
                  
                  <!-- Subtitle -->
                  <tr>
                    <td align="center" style="padding: 0 40px 32px 40px;">
                      <p style="margin: 0; color: #94a3b8; font-size: 15px; line-height: 1.6;">
                        Enter this code to verify your identity and access the admin panel
                      </p>
                    </td>
                  </tr>
                  
                  <!-- OTP Code Box -->
                  <tr>
                    <td align="center" style="padding: 0 40px 32px 40px;">
                      <table cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, rgba(0, 0, 0, 0.4) 0%, rgba(0, 0, 0, 0.2) 100%); border: 2px solid #00f5d4; border-radius: 16px; box-shadow: 0 0 30px rgba(0, 245, 212, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.05);">
                        <tr>
                          <td style="padding: 24px 48px;">
                            <span style="color: #00f5d4; font-size: 42px; font-weight: 800; letter-spacing: 12px; font-family: 'SF Mono', 'Fira Code', 'Courier New', monospace; text-shadow: 0 0 20px rgba(0, 245, 212, 0.5);">
                              ${otp}
                            </span>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  
                  <!-- Timer Badge -->
                  <tr>
                    <td align="center" style="padding: 0 40px 32px 40px;">
                      <table cellpadding="0" cellspacing="0" style="background: rgba(124, 58, 237, 0.15); border: 1px solid rgba(124, 58, 237, 0.3); border-radius: 100px;">
                        <tr>
                          <td style="padding: 10px 20px;">
                            <span style="color: #c4b5fd; font-size: 13px; font-weight: 500;">
                              ⏱️ Expires in <strong style="color: #a78bfa;">10 minutes</strong>
                            </span>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  
                  <!-- Divider -->
                  <tr>
                    <td style="padding: 0 40px;">
                      <div style="height: 1px; background: linear-gradient(90deg, transparent, rgba(148, 163, 184, 0.2), transparent);"></div>
                    </td>
                  </tr>
                  
                  <!-- Security Notice -->
                  <tr>
                    <td align="center" style="padding: 24px 40px 32px 40px;">
                      <table cellpadding="0" cellspacing="0" style="background: rgba(251, 191, 36, 0.08); border: 1px solid rgba(251, 191, 36, 0.2); border-radius: 12px;">
                        <tr>
                          <td style="padding: 16px 20px;">
                            <p style="margin: 0; color: #fcd34d; font-size: 12px; line-height: 1.5;">
                              🔒 <strong>Security tip:</strong> Never share this code with anyone. Our team will never ask for it.
                            </p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="background: rgba(0, 0, 0, 0.3); padding: 24px 40px;" align="center">
                      <p style="margin: 0 0 8px 0; color: #64748b; font-size: 12px;">
                        Didn't request this code? You can safely ignore this email.
                      </p>
                      <p style="margin: 0; color: #475569; font-size: 11px;">
                        © ${new Date().getFullYear()} Admin Portal • Secure Authentication
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
