import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';

interface PrizeNotificationRequest {
  adminEmail: string;
  userName: string;
  prizeName: string;
  redemptionId: string;
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    });
  }

  try {
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        {
          status: 405,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }

    // Initialize Supabase client with service role key for admin operations
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { adminEmail, userName, prizeName, redemptionId }: PrizeNotificationRequest = await req.json();

    if (!adminEmail || !userName || !prizeName || !redemptionId) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }

    // Get admin user to check notification settings
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
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            },
          }
        );
      }
    }

    // Prepare email content
    const html = `
      <h2>Naujas prizo iškeitimo prašymas</h2>
      <p>Naudotojas <strong>${userName}</strong> prašo iškeisti prizą <strong>"${prizeName}"</strong>.</p>
      <p>Peržiūrėkite ir patvirtinkite arba atmeskite šį prašymą administratoriaus skydelyje.</p>
      <p>Prašymo ID: ${redemptionId}</p>
      <br>
      <p>Prisijunkite prie sistemos ir peržiūrėkite prašymą "Prizų iškeitimo prašymai" skiltyje.</p>
    `;

    // Send email using the send-email function
    const { data: emailResult, error: emailError } = await supabase.functions.invoke('send-email', {
      body: {
        to: adminEmail,
        subject: `Naujas prizo iškeitimo prašymas - ${prizeName}`,
        html: html,
      }
    });

    if (emailError) {
      console.error('Failed to send email:', emailError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Failed to send email',
          details: emailError.message
        }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }

    console.log('Prize notification email sent successfully');
    
    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Prize notification email sent successfully',
        recipient: adminEmail,
        prizeName: prizeName
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );

  } catch (error) {
    console.error('Prize notification error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to send prize notification',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
}); 