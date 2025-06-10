import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { to, subject, html } = await req.json()

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get admin user to check notification settings
    const { data: adminData, error: adminError } = await supabaseClient
      .from('users')
      .select('user_metadata')
      .eq('email', to)
      .single()

    if (adminError) throw adminError

    // Check if notifications are enabled for this type
    const notificationType = subject.includes('prizo') ? 'prizeRedemptions' :
                           subject.includes('registracija') ? 'newUserRegistrations' :
                           subject.includes('taškų') ? 'pointsDeductions' :
                           'systemUpdates'

    const settings = adminData?.user_metadata?.notificationSettings
    if (!settings?.[notificationType]) {
      return new Response(
        JSON.stringify({ message: 'Notifications disabled for this type' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Send email using Supabase's built-in email service
    const { error } = await supabaseClient.auth.admin.sendEmail({
      to,
      subject,
      html,
    })

    if (error) throw error

    return new Response(
      JSON.stringify({ message: 'Email sent successfully' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Email sending error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
}) 