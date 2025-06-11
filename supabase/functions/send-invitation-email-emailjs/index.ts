import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';

interface InvitationRequest {
  to: string;
  name: string;
  registrationUrl: string;
  inviterName: string;
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

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { to, name, registrationUrl, inviterName }: InvitationRequest = await req.json();

    if (!to || !name || !registrationUrl || !inviterName) {
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

    // Prepare email content
    const html = `
      <h2>Pakvietimas prisijungti prie sistemos</h2>
      <p>Sveiki, ${name}!</p>
      <p>${inviterName} jus pakviete prisijungti prie mūsų taškų sistemos.</p>
      <p>Norėdami sukurti paskyrą, spauskite šią nuorodą:</p>
      <p><a href="${registrationUrl}" style="color: #007bff; text-decoration: none; font-weight: bold;">${registrationUrl}</a></p>
      <br>
      <p>Jeigu nuoroda neveikia, nukopijuokite ir įklijuokite ją į naršyklės adreso juostą.</p>
      <p>Su pagarba,<br>Taškų sistemos komanda</p>
    `;

    // Send email using the send-email function
    const { data: emailResult, error: emailError } = await supabase.functions.invoke('send-email', {
      body: {
        to: to,
        subject: 'Pakvietimas prisijungti prie taškų sistemos',
        html: html,
      }
    });

    if (emailError) {
      console.error('Failed to send invitation email:', emailError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Failed to send invitation email',
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

    console.log('Invitation email sent successfully');
    
    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Invitation email sent successfully',
        recipient: to,
        name: name
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
    console.error('Invitation email error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to send invitation email',
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