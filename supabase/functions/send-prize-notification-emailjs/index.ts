import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';

interface PrizeNotificationRequest {
  adminEmail: string; // Can be 'system' to send to all admins
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

    // Get Supabase client with service role permissions
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Determine recipient emails
    let recipientEmails: string[] = [];
    
    if (adminEmail === 'system') {
      // Find all admin users
      console.log('Finding all admin users...');
      const { data: adminUsers, error: adminError } = await supabase
        .from('profiles')
        .select('email')
        .eq('role', 'admin');

      if (adminError) {
        console.error('Failed to get admin users:', adminError);
        return new Response(
          JSON.stringify({ error: 'Failed to get admin users: ' + adminError.message }),
          {
            status: 500,
            headers: corsHeaders
          }
        );
      }

      if (!adminUsers || adminUsers.length === 0) {
        console.error('No admin users found');
        return new Response(
          JSON.stringify({ error: 'No admin users found' }),
          {
            status: 404,
            headers: corsHeaders
          }
        );
      }

      recipientEmails = adminUsers.map(admin => admin.email);
      console.log(`Found ${recipientEmails.length} admin users:`, recipientEmails);
    } else {
      // Validate email format for single recipient
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
      recipientEmails = [adminEmail];
    }

    // Send emails to all recipients
    const emailResults: Array<{
      recipient: string;
      success: boolean;
      message?: string;
      error?: string;
    }> = [];
    
    for (const recipientEmail of recipientEmails) {
      try {
        // Get admin user to check notification settings
        const { data: adminData, error: adminError } = await supabase
          .from('profiles')
          .select('id')
          .eq('email', recipientEmail)
          .single();

        if (adminError) {
          console.error(`Failed to get admin data for ${recipientEmail}:`, adminError);
          // Fallback: send email anyway if we can't check settings
        } else {
          // Get user metadata from auth to check notification settings
          const { data: adminUserData } = await supabase.auth.admin.getUserById(adminData.id);
          const settings = adminUserData?.user?.user_metadata?.notificationSettings;
          
          // Check if prize redemption notifications are enabled (default to true for backwards compatibility)
          if (settings?.prizeRedemptions === false) {
            console.log(`Prize redemption notifications are disabled for ${recipientEmail}`);
            emailResults.push({
              recipient: recipientEmail,
              success: true,
              message: 'Notifications disabled for this admin'
            });
            continue;
          }
        }

        // Prepare template parameters that match the EmailJS template exactly
        const templateParams = {
          to_email: recipientEmail,       // Required for EmailJS recipient
          user_name: userName,            // {{user_name}} in template
          user_email: userEmail,          // {{user_email}} in template  
          prize_name: prizeName,          // {{prize_name}} in template
          redemption_id: redemptionId,    // {{redemption_id}} in template
          admin_panel_url: 'https://gvitpmixijacetppzusx.supabase.co'  // {{admin_panel_url}} in template
        };

        console.log(`Sending prize notification email to ${recipientEmail} with params:`, templateParams);

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
          console.error(`EmailJS API error for ${recipientEmail}:`, {
            status: emailResponse.status,
            statusText: emailResponse.statusText,
            error: errorText,
            payload: emailPayload
          });
          emailResults.push({
            recipient: recipientEmail,
            success: false,
            error: `EmailJS API error: ${emailResponse.status} ${errorText}`
          });
        } else {
          const result = await emailResponse.text();
          console.log(`Prize notification email sent successfully to ${recipientEmail}:`, {
            result,
            user: userName,
            prize: prizeName
          });
          emailResults.push({
            recipient: recipientEmail,
            success: true,
            message: 'Email sent successfully'
          });
        }
      } catch (error) {
        console.error(`Error sending email to ${recipientEmail}:`, error);
        emailResults.push({
          recipient: recipientEmail,
          success: false,
          error: error.message
        });
      }
    }

    // Summarize results
    const successCount = emailResults.filter(r => r.success).length;
    const failureCount = emailResults.filter(r => !r.success).length;
    const overallSuccess = failureCount === 0;

    console.log('Email sending summary:', {
      total: emailResults.length,
      success: successCount,
      failures: failureCount,
      results: emailResults
    });

    return new Response(
      JSON.stringify({
        success: overallSuccess,
        message: `Sent ${successCount}/${emailResults.length} emails successfully`,
        results: emailResults
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