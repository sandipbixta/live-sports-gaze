import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SubscriptionEmailRequest {
  email: string;
  selectedTeams: string[];
}

// Generate a secure random token
function generateToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

// Hash the token using SHA-256
async function hashToken(token: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(token);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, selectedTeams }: SubscriptionEmailRequest = await req.json();

    // Input validation
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid email address" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Sanitize email - trim and lowercase
    const sanitizedEmail = email.trim().toLowerCase();

    console.log("Processing subscription for:", sanitizedEmail);

    // Generate verification token and hash it
    const rawToken = generateToken();
    const hashedToken = await hashToken(rawToken);

    // Create Supabase client with service role key
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Update the subscription with the hashed verification token
    const { error: updateError } = await supabase
      .from('email_subscriptions')
      .update({ verification_token: hashedToken })
      .eq('email', sanitizedEmail);

    if (updateError) {
      console.error("Error updating verification token:", updateError);
      // Continue anyway - email might still be useful
    }

    const teamsText = selectedTeams && selectedTeams.length > 0 
      ? `<p>You've subscribed to match alerts for: <strong>${selectedTeams.map(t => t.replace(/[<>]/g, '')).join(", ")}</strong></p>`
      : `<p>You'll receive alerts for all major matches.</p>`;

    // Create verification URL with the raw token (user will click this)
    const verificationUrl = `${supabaseUrl}/functions/v1/verify-email?token=${encodeURIComponent(rawToken)}&email=${encodeURIComponent(sanitizedEmail)}`;

    const emailResponse = await resend.emails.send({
      from: "Sports Stream <onboarding@resend.dev>",
      to: [sanitizedEmail],
      subject: "Verify your Match Alerts subscription! 🏆",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .header h1 { color: white; margin: 0; font-size: 28px; }
              .content { background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px; }
              .icon { font-size: 48px; margin-bottom: 10px; }
              .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
              .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <div class="icon">🏆</div>
                <h1>Verify Your Subscription</h1>
              </div>
              <div class="content">
                <h2>Almost there! 🎉</h2>
                <p>Thank you for subscribing to our match alert service. Please click the button below to verify your email address:</p>
                <p style="text-align: center;">
                  <a href="${verificationUrl}" class="button" style="color: white;">Verify Email Address</a>
                </p>
                ${teamsText}
                <p>Once verified, we'll send you notifications about:</p>
                <ul>
                  <li>📅 Upcoming matches</li>
                  <li>🔴 Live match streams</li>
                  <li>⚽ Match results and highlights</li>
                </ul>
                <p><small>This verification link will expire in 24 hours.</small></p>
              </div>
              <div class="footer">
                <p>You're receiving this email because you subscribed to match alerts.</p>
                <p>If you didn't subscribe, you can safely ignore this email.</p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, data: emailResponse }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-subscription-confirmation function:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
