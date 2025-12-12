import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Hash the token using SHA-256 (same as in send-subscription-confirmation)
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
    const url = new URL(req.url);
    const token = url.searchParams.get('token');
    const email = url.searchParams.get('email');

    // Input validation
    if (!token || !email) {
      return new Response(
        generateHtmlResponse(false, "Invalid verification link. Please check your email for the correct link."),
        { status: 400, headers: { "Content-Type": "text/html", ...corsHeaders } }
      );
    }

    // Validate token format (should be 64 hex characters)
    if (!/^[a-f0-9]{64}$/i.test(token)) {
      return new Response(
        generateHtmlResponse(false, "Invalid token format."),
        { status: 400, headers: { "Content-Type": "text/html", ...corsHeaders } }
      );
    }

    // Sanitize email
    const sanitizedEmail = email.trim().toLowerCase();

    // Hash the provided token to compare with stored hash
    const hashedToken = await hashToken(token);

    // Create Supabase client with service role key
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Find subscription by email and hashed token
    const { data: subscription, error: fetchError } = await supabase
      .from('email_subscriptions')
      .select('id, verified, created_at')
      .eq('email', sanitizedEmail)
      .eq('verification_token', hashedToken)
      .single();

    if (fetchError || !subscription) {
      console.error("Verification failed - no matching subscription:", fetchError);
      return new Response(
        generateHtmlResponse(false, "Invalid or expired verification link. Please subscribe again."),
        { status: 400, headers: { "Content-Type": "text/html", ...corsHeaders } }
      );
    }

    // Check if already verified
    if (subscription.verified) {
      return new Response(
        generateHtmlResponse(true, "Your email is already verified! You're all set to receive match alerts."),
        { status: 200, headers: { "Content-Type": "text/html", ...corsHeaders } }
      );
    }

    // Check if token is expired (24 hours)
    const createdAt = new Date(subscription.created_at);
    const now = new Date();
    const hoursSinceCreation = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
    
    if (hoursSinceCreation > 24) {
      return new Response(
        generateHtmlResponse(false, "This verification link has expired. Please subscribe again to get a new link."),
        { status: 400, headers: { "Content-Type": "text/html", ...corsHeaders } }
      );
    }

    // Mark as verified and clear the token (one-time use)
    const { error: updateError } = await supabase
      .from('email_subscriptions')
      .update({ 
        verified: true, 
        verification_token: null,  // Clear token after use
        updated_at: new Date().toISOString()
      })
      .eq('id', subscription.id);

    if (updateError) {
      console.error("Error updating verification status:", updateError);
      return new Response(
        generateHtmlResponse(false, "An error occurred. Please try again."),
        { status: 500, headers: { "Content-Type": "text/html", ...corsHeaders } }
      );
    }

    console.log("Email verified successfully:", sanitizedEmail);

    return new Response(
      generateHtmlResponse(true, "Your email has been verified! You'll now receive match alerts."),
      { status: 200, headers: { "Content-Type": "text/html", ...corsHeaders } }
    );

  } catch (error: any) {
    console.error("Error in verify-email function:", error);
    return new Response(
      generateHtmlResponse(false, "An unexpected error occurred. Please try again."),
      { status: 500, headers: { "Content-Type": "text/html", ...corsHeaders } }
    );
  }
};

function generateHtmlResponse(success: boolean, message: string): string {
  const icon = success ? "✅" : "❌";
  const title = success ? "Verification Successful" : "Verification Failed";
  const bgColor = success ? "#10b981" : "#ef4444";

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
        <style>
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; 
            line-height: 1.6; 
            color: #333; 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            min-height: 100vh; 
            margin: 0; 
            background: #f5f5f5;
          }
          .container { 
            max-width: 500px; 
            margin: 20px; 
            padding: 40px; 
            background: white; 
            border-radius: 10px; 
            box-shadow: 0 4px 6px rgba(0,0,0,0.1); 
            text-align: center;
          }
          .icon { font-size: 64px; margin-bottom: 20px; }
          h1 { color: ${bgColor}; margin-bottom: 10px; }
          p { color: #666; margin-bottom: 20px; }
          .button { 
            display: inline-block; 
            background: #667eea; 
            color: white; 
            padding: 12px 30px; 
            text-decoration: none; 
            border-radius: 5px; 
            margin-top: 10px;
          }
          .button:hover { background: #5a6fd6; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="icon">${icon}</div>
          <h1>${title}</h1>
          <p>${message}</p>
          <a href="/" class="button">Go to Homepage</a>
        </div>
      </body>
    </html>
  `;
}

serve(handler);
