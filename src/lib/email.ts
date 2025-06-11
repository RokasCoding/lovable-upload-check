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
    const { data: emailResult, error: emailError } = await supabase.functions.invoke('send-prize-notification-emailjs', {
      body: {
        adminEmail: adminEmail,
        userName: userName,
        userEmail: userEmail,
        prizeName: prizeName,
        redemptionId: redemptionId
      }
    });

    if (emailError) {
      console.error('Failed to send prize notification email:', emailError);
      return { success: false, error: emailError.message };
    }

    if (emailResult?.success) {
      console.log('Prize notification email sent successfully via edge function');
      return { success: true };
    }

    return { success: false, error: 'Unknown error sending email' };
  } catch (error: any) {
    console.error('Failed to send prize notification email:', error);
    return { 
      success: false, 
      error: error.message || 'Nepavyko išsiųsti el. laiško' 
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