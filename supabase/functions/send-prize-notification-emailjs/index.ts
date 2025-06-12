import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';

interface PrizeNotificationRequest {
  adminEmail: string;
  userName: string;
  userEmail: string;
  prizeName: string;
  redemptionId: string;
}

const EMAILJS_SERVICE_ID = Deno.env.get('EMAILJS_SERVICE_ID');
const EMAILJS_PRIZE_NOTIFICATION_TEMPLATE_ID = Deno.env.get('EMAILJS_PRIZE_NOTIFICATION_TEMPLATE_ID');
const EMAILJS_PUBLIC_KEY = Deno.env.get('EMAILJS_PUBLIC_KEY');
const EMAILJS_PRIVATE_KEY = Deno.env.get('EMAILJS_PRIVATE_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json'
};

Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: corsHeaders,
      status: 200
    });
  }

  try {
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        {
          status: 405,
          headers: corsHeaders
        }
      );
    }

    // Check environment variables
    if (!EMAILJS_SERVICE_ID || !EMAILJS_PRIZE_NOTIFICATION_TEMPLATE_ID || !EMAILJS_PUBLIC_KEY || !EMAILJS_PRIVATE_KEY) {
      console.error('Missing EmailJS environment variables:', {
        EMAILJS_SERVICE_ID: !!EMAILJS_SERVICE_ID,
        EMAILJS_PRIZE_NOTIFICATION_TEMPLATE_ID: !!EMAILJS_PRIZE_NOTIFICATION_TEMPLATE_ID,
        EMAILJS_PUBLIC_KEY: !!EMAILJS_PUBLIC_KEY,
        EMAILJS_PRIVATE_KEY: !!EMAILJS_PRIVATE_KEY
      });
      throw new Error('EmailJS environment variables are not set');
    }

    const { adminEmail, userName, userEmail, prizeName, redemptionId }: PrizeNotificationRequest = await req.json();

    // Validate all required fields
    if (!adminEmail || !userName || !userEmail || !prizeName || !redemptionId) {
      console.error('Missing required fields:', {
        adminEmail: !!adminEmail,
        userName: !!userName,
        userEmail: !!userEmail,
        prizeName: !!prizeName,
        redemptionId: !!redemptionId
      });
      return new Response(
        JSON.stringify({ error: 'Missing required fields: adminEmail, userName, userEmail, prizeName, redemptionId' }),
        {
          status: 400,
          headers: corsHeaders
        }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(adminEmail) || !emailRegex.test(userEmail)) {
      console.error('Invalid email format:', { adminEmail, userEmail });
      return new Response(
        JSON.stringify({ error: 'Invalid email format' }),
        {
          status: 400,
          headers: corsHeaders
        }
      );
    }

    // Get admin user to check notification settings
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: adminData, error: adminError } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', adminEmail)
      .single();

    if (adminError) {
      console.error('Failed to get admin data:', adminError);
      // Fallback: send email anyway if we can't check settings
    } else {
      // Get user metadata from auth to check notification settings
      const { data: adminUserData } = await supabase.auth.admin.getUserById(adminData.id);
      const settings = adminUserData?.user?.user_metadata?.notificationSettings;
      
      // Check if prize redemption notifications are enabled (default to true for backwards compatibility)
      if (settings?.prizeRedemptions === false) {
        console.log('Prize redemption notifications are disabled for this admin');
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'Notifications disabled for this admin' 
          }),
          {
            status: 200,
            headers: corsHeaders
          }
        );
      }
    }

    // Prepare template parameters that match the EmailJS template exactly
    const templateParams = {
      to_email: adminEmail,           // Required for EmailJS recipient
      user_name: userName,            // {{user_name}} in template
      user_email: userEmail,          // {{user_email}} in template  
      prize_name: prizeName,          // {{prize_name}} in template
      redemption_id: redemptionId,    // {{redemption_id}} in template
      admin_panel_url: 'https://gvitpmixijacetppzusx.supabase.co'  // {{admin_panel_url}} in template
    };

    console.log('Sending prize notification email with params:', {
      ...templateParams,
      to_email: adminEmail // Log the recipient for debugging
    });

    // Send email via EmailJS
    const emailPayload = {
      service_id: EMAILJS_SERVICE_ID,
      template_id: EMAILJS_PRIZE_NOTIFICATION_TEMPLATE_ID,
      user_id: EMAILJS_PUBLIC_KEY,
      accessToken: EMAILJS_PRIVATE_KEY,
      template_params: templateParams
    };

    const emailResponse = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(emailPayload)
    });

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text();
      console.error('EmailJS API error:', {
        status: emailResponse.status,
        statusText: emailResponse.statusText,
        error: errorText,
        payload: emailPayload
      });
      return new Response(
        JSON.stringify({
          success: false,
          error: `EmailJS API error: ${emailResponse.status} ${errorText}`
        }),
        {
          status: 500,
          headers: corsHeaders
        }
      );
    }

    const result = await emailResponse.text();
    console.log('Prize notification email sent successfully:', {
      result,
      recipient: adminEmail,
      user: userName,
      prize: prizeName
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Prize notification email sent successfully',
        recipient: adminEmail
      }),
      {
        headers: corsHeaders
      }
    );
  } catch (error) {
    console.error('Error in send-prize-notification-emailjs function:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Unknown error'
      }),
      {
        status: 500,
        headers: corsHeaders
      }
    );
  }
}); 