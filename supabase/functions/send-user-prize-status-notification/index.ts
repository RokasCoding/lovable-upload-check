import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';

interface UserPrizeStatusNotificationRequest {
  userEmail: string;
  userName: string;
  prizeName: string;
  status: 'confirmed' | 'rejected';
  redemptionId: string;
  rejectionReason?: string;
  adminMessage?: string;
}

const EMAILJS_SERVICE_ID = Deno.env.get('EMAILJS_SERVICE_ID');
const EMAILJS_USER_PRIZE_STATUS_TEMPLATE_ID = Deno.env.get('EMAILJS_USER_PRIZE_STATUS_TEMPLATE_ID');
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
    if (!EMAILJS_SERVICE_ID || !EMAILJS_USER_PRIZE_STATUS_TEMPLATE_ID || !EMAILJS_PUBLIC_KEY || !EMAILJS_PRIVATE_KEY) {
      console.error('Missing EmailJS environment variables:', {
        EMAILJS_SERVICE_ID: !!EMAILJS_SERVICE_ID,
        EMAILJS_USER_PRIZE_STATUS_TEMPLATE_ID: !!EMAILJS_USER_PRIZE_STATUS_TEMPLATE_ID,
        EMAILJS_PUBLIC_KEY: !!EMAILJS_PUBLIC_KEY,
        EMAILJS_PRIVATE_KEY: !!EMAILJS_PRIVATE_KEY
      });
      throw new Error('EmailJS environment variables are not set');
    }

    const { 
      userEmail, 
      userName, 
      prizeName, 
      status, 
      redemptionId, 
      rejectionReason, 
      adminMessage 
    }: UserPrizeStatusNotificationRequest = await req.json();

    // Validate all required fields
    if (!userEmail || !userName || !prizeName || !status || !redemptionId) {
      console.error('Missing required fields:', {
        userEmail: !!userEmail,
        userName: !!userName,
        prizeName: !!prizeName,
        status: !!status,
        redemptionId: !!redemptionId
      });
      return new Response(
        JSON.stringify({ error: 'Missing required fields: userEmail, userName, prizeName, status, redemptionId' }),
        {
          status: 400,
          headers: corsHeaders
        }
      );
    }

    // Validate status
    if (status !== 'confirmed' && status !== 'rejected') {
      return new Response(
        JSON.stringify({ error: 'Status must be either "confirmed" or "rejected"' }),
        {
          status: 400,
          headers: corsHeaders
        }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userEmail)) {
      console.error('Invalid email format:', { userEmail });
      return new Response(
        JSON.stringify({ error: 'Invalid email format' }),
        {
          status: 400,
          headers: corsHeaders
        }
      );
    }

    // Get Supabase client with service role permissions to check user notification settings
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user data to check notification settings
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', userEmail)
      .single();

    if (userError) {
      console.error('Failed to get user data:', userError);
      // Continue anyway - notification settings check is not critical
    } else {
      // Get user metadata from auth to check notification settings
      const { data: authUserData } = await supabase.auth.admin.getUserById(userData.id);
      const settings = authUserData?.user?.user_metadata?.notificationSettings;
      
      // Check if prize status notifications are enabled (default to true for backwards compatibility)
      if (settings?.prizeStatusUpdates === false) {
        console.log('Prize status notifications are disabled for this user');
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'Notifications disabled for this user' 
          }),
          {
            status: 200,
            headers: corsHeaders
          }
        );
      }
    }

    // Prepare template parameters based on status
    const isConfirmed = status === 'confirmed';
    const statusText = isConfirmed ? 'patvirtintas' : 'atmestas';
    const statusColor = isConfirmed ? '#22c55e' : '#ef4444';
    
    let emailSubject = `Prizo iškeitimo statusas: ${statusText}`;
    let emailMessage = '';
    
    if (isConfirmed) {
      emailMessage = `Sveikiname! Jūsų prizo "${prizeName}" iškeitimas buvo sėkmingai patvirtintas. Administratorius susisieks su Jumis dėl prizo atsiėmimo detalių.`;
    } else {
      emailMessage = `Deja, Jūsų prizo "${prizeName}" iškeitimas buvo atmestas.`;
      if (rejectionReason) {
        emailMessage += ` Priežastis: ${rejectionReason}`;
      }
    }
    
    if (adminMessage) {
      emailMessage += `\n\nAdministratoriaus žinutė: ${adminMessage}`;
    }

    const templateParams = {
      to_email: userEmail,
      user_name: userName,
      prize_name: prizeName,
      status: statusText,
      status_color: statusColor,
      email_subject: emailSubject,
      email_message: emailMessage,
      redemption_id: redemptionId,
      rejection_reason: rejectionReason || '',
      admin_message: adminMessage || '',
      is_confirmed: isConfirmed.toString(),
      website_url: 'https://gvitpmixijacetppzusx.supabase.co'
    };

    console.log('Sending user prize status notification email with params:', {
      ...templateParams,
      to_email: userEmail
    });

    // Send email via EmailJS
    const emailPayload = {
      service_id: EMAILJS_SERVICE_ID,
      template_id: EMAILJS_USER_PRIZE_STATUS_TEMPLATE_ID,
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
    console.log('User prize status notification email sent successfully:', {
      result,
      recipient: userEmail,
      status: statusText,
      prize: prizeName
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Prize status notification email sent successfully',
        recipient: userEmail,
        status: statusText
      }),
      {
        headers: corsHeaders
      }
    );
  } catch (error) {
    console.error('Error in send-user-prize-status-notification function:', error);
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