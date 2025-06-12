import { supabase } from './supabase';

export const sendInviteEmail = async (email: string, name: string, inviteLink: string) => {
  try {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        data: {
          name,
          inviteLink,
          type: 'invite'
        }
      }
    });

    if (error) {
      console.error('Error sending invite email:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    console.error('Failed to send invite email:', error);
    return { 
      success: false, 
      error: error.message || 'Nepavyko išsiųsti el. laiško' 
    };
  }
};

export const sendRedemptionStatusEmail = async (
  userId: string,
  name: string,
  prizeName: string,
  status: 'approved' | 'rejected',
  comment?: string
) => {
  try {
    // Update user metadata to trigger email notification
    const { error } = await supabase.auth.updateUser({
      data: {
        notification: {
          type: 'redemption_status',
          name,
          prizeName,
          status,
          comment,
          timestamp: new Date().toISOString()
        }
      }
    });

    if (error) {
      console.error('Error sending redemption status notification:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    console.error('Failed to send redemption status notification:', error);
    return { 
      success: false, 
      error: error.message || 'Nepavyko išsiųsti pranešimo' 
    };
  }
};

export const sendPointsDeductionEmail = async (
  adminEmail: string,
  userName: string,
  points: number,
  reason: string
) => {
  try {
    // Get admin user to check notification settings
    const { data: adminData, error: adminError } = await supabase
      .from('users')
      .select('user_metadata')
      .eq('email', adminEmail)
      .single();

    if (adminError) throw adminError;

    // Check if points deduction notifications are enabled
    const settings = adminData?.user_metadata?.notificationSettings;
    if (!settings?.pointsDeductions) {
      console.log('Points deduction notifications are disabled for this admin');
      return { success: true };
    }

    const html = `
      <h2>Taškų atėmimas</h2>
      <p>Naudotojui ${userName} buvo atimta ${points} taškų.</p>
      <p>Priežastis: ${reason}</p>
      <p>Galite peržiūrėti detalesnę informaciją administratoriaus skydelyje.</p>
    `;

    return sendEmail({
      to: adminEmail,
      subject: 'Taškų atėmimas',
      html,
    });
  } catch (error: any) {
    console.error('Failed to send points deduction email:', error);
    return { 
      success: false, 
      error: error.message || 'Nepavyko išsiųsti el. laiško' 
    };
  }
};

interface EmailData {
  to: string;
  subject: string;
  html: string;
}

export const sendEmail = async (data: EmailData) => {
  try {
    const { error } = await supabase.functions.invoke('send-email', {
      body: data,
    });

    if (error) throw error;
    return { error: null };
  } catch (error: any) {
    console.error('Email sending error:', error);
    return { error: error.message || 'Failed to send email' };
  }
};

export const sendPrizeRedemptionEmail = async (
  adminEmail: string,
  userName: string,
  userEmail: string,
  prizeName: string,
  redemptionId: string
) => {
  try {
    console.log('About to call send-prize-notification-emailjs edge function with:', {
      adminEmail,
      userName,
      userEmail,
      prizeName,
      redemptionId
    });

    // Check if user is authenticated
    const { data: authData, error: authError } = await supabase.auth.getUser();
    console.log('Current auth state:', { 
      user: authData?.user?.id, 
      email: authData?.user?.email,
      authError 
    });

    const { data: emailResult, error: emailError } = await supabase.functions.invoke('send-prize-notification-emailjs', {
      body: {
        adminEmail: adminEmail,
        userName: userName,
        userEmail: userEmail,
        prizeName: prizeName,
        redemptionId: redemptionId
      }
    });

    console.log('Edge function response:', { emailResult, emailError });

    if (emailError) {
      console.error('Failed to send prize notification email:', emailError);
      return { success: false, error: `Edge function error: ${emailError.message}` };
    }

    if (emailResult?.success) {
      console.log('Prize notification email sent successfully via edge function');
      return { success: true };
    }

    // If we get here, there was no error but also no success
    console.error('Edge function returned unexpected result:', emailResult);
    return { success: false, error: emailResult?.error || 'Unknown error sending email' };
  } catch (error: any) {
    console.error('Failed to send prize notification email:', error);
    return { 
      success: false, 
      error: `Exception: ${error.message || 'Nepavyko išsiųsti el. laiško'}` 
    };
  }
};

export const sendNewUserRegistrationEmail = async (adminEmail: string, userName: string) => {
  try {
    // Get admin user to check notification settings
    const { data: adminData, error: adminError } = await supabase
      .from('users')
      .select('user_metadata')
      .eq('email', adminEmail)
      .single();

    if (adminError) throw adminError;

    // Check if new user registration notifications are enabled
    const settings = adminData?.user_metadata?.notificationSettings;
    if (!settings?.newUserRegistrations) {
      console.log('New user registration notifications are disabled for this admin');
      return { success: true };
    }

    const html = `
      <h2>Naujas naudotojas užsiregistravo</h2>
      <p>Naudotojas ${userName} ką tik užsiregistravo sistemoje.</p>
      <p>Galite peržiūrėti naujo naudotojo informaciją administratoriaus skydelyje.</p>
    `;

    return sendEmail({
      to: adminEmail,
      subject: 'Naujas naudotojas užsiregistravo',
      html,
    });
  } catch (error: any) {
    console.error('Failed to send new user registration email:', error);
    return { 
      success: false, 
      error: error.message || 'Nepavyko išsiųsti el. laiško' 
    };
  }
};

export const sendSystemUpdateEmail = async (adminEmail: string, updateMessage: string) => {
  try {
    // Get admin user to check notification settings
    const { data: adminData, error: adminError } = await supabase
      .from('users')
      .select('user_metadata')
      .eq('email', adminEmail)
      .single();

    if (adminError) throw adminError;

    // Check if system update notifications are enabled
    const settings = adminData?.user_metadata?.notificationSettings;
    if (!settings?.systemUpdates) {
      console.log('System update notifications are disabled for this admin');
      return { success: true };
    }

    const html = `
      <h2>Sistemos atnaujinimas</h2>
      <p>${updateMessage}</p>
      <p>Galite peržiūrėti detalesnę informaciją administratoriaus skydelyje.</p>
    `;

    return sendEmail({
      to: adminEmail,
      subject: 'Sistemos atnaujinimas',
      html,
    });
  } catch (error: any) {
    console.error('Failed to send system update email:', error);
    return { 
      success: false, 
      error: error.message || 'Nepavyko išsiųsti el. laiško' 
    };
  }
};

export const testEmailSending = async (email: string) => {
  try {
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: email,
        subject: 'Testinis el. laiškas',
        html: `
          <h1>Testinis el. laiškas</h1>
          <p>Šis yra testinis el. laiškas, skirtas patikrinti el. pašto siuntimo funkcionalumą.</p>
          <p>Jei gavote šį laišką, tai reiškia, kad el. pašto siuntimas veikia tinkamai.</p>
        `,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Nepavyko išsiųsti el. laiško');
    }

    return { success: true };
  } catch (error: any) {
    console.error('Error sending test email:', error);
    return { error: error.message || 'Nepavyko išsiųsti el. laiško' };
  }
};

export const testPrizeNotificationEmail = async (adminEmail: string) => {
  try {
    const { data: emailResult, error: emailError } = await supabase.functions.invoke('send-prize-notification-emailjs', {
      body: {
        adminEmail: adminEmail,
        userName: 'Test User',
        userEmail: 'test@example.com',
        prizeName: 'Test Prize',
        redemptionId: 'test-redemption-123'
      }
    });

    if (emailError) {
      console.error('Failed to send test prize notification email:', emailError);
      return { success: false, error: emailError.message };
    }

    if (emailResult?.success) {
      console.log('Test prize notification email sent successfully via edge function');
      return { success: true };
    }

    return { success: false, error: 'Unknown error sending test email' };
  } catch (error: any) {
    console.error('Failed to send test prize notification email:', error);
    return { 
      success: false, 
      error: error.message || 'Nepavyko išsiųsti testinio el. laiško' 
    };
  }
};

export const testPrizeNotificationEmailDirect = async (adminEmail: string) => {
  try {
    // Get the current user session to include auth headers
    const { data: { session } } = await supabase.auth.getSession();
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (session?.access_token) {
      headers['Authorization'] = `Bearer ${session.access_token}`;
    }

    console.log('Testing direct HTTP call to edge function with headers:', headers);

    const response = await fetch('https://gvitpmixijacetppzusx.supabase.co/functions/v1/send-prize-notification-emailjs', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        adminEmail: adminEmail,
        userName: 'Direct Test User',
        userEmail: 'directtest@example.com',
        prizeName: 'Direct Test Prize',
        redemptionId: 'direct-test-123'
      })
    });

    const responseText = await response.text();
    console.log('Direct HTTP response:', {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
      body: responseText
    });

    if (!response.ok) {
      return { 
        success: false, 
        error: `HTTP ${response.status}: ${responseText}` 
      };
    }

    const result = JSON.parse(responseText);
    return result;
  } catch (error: any) {
    console.error('Direct HTTP test failed:', error);
    return { 
      success: false, 
      error: `Direct test error: ${error.message}` 
    };
  }
}; 