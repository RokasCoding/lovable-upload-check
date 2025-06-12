import { supabase } from '@/lib/supabase';

export const sendInviteEmail = async (email: string, name: string, inviteLink: string) => {
  try {
    const response = await fetch('/api/send-invite', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: email,
        name,
        inviteLink,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Nepavyko išsiųsti kvietimo');
    }

    return { success: true };
  } catch (error: any) {
    return { 
      success: false, 
      error: error.message || 'Nepavyko išsiųsti kvietimo' 
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
    const statusText = status === 'approved' ? 'patvirtintas' : 'atmestas';
    const html = `
      <h2>Prizo iškeitimo statusas</h2>
      <p>Sveiki, ${name}!</p>
      <p>Jūsų prizo "${prizeName}" iškeitimo prašymas buvo ${statusText}.</p>
      ${comment ? `<p>Komentaras: ${comment}</p>` : ''}
      <p>Dėkojame už dalyvavimą!</p>
    `;

    return sendEmail({
      to: userId, // This should be email, but keeping for compatibility
      subject: `Prizo iškeitimo statusas: ${statusText}`,
      html,
    });
  } catch (error: any) {
    return { 
      success: false, 
      error: error.message || 'Nepavyko išsiųsti el. laiško' 
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
    const html = `
      <h2>Taškų atėmimas</h2>
      <p>Iš naudotojo ${userName} buvo atimta ${points} taškų.</p>
      <p>Priežastis: ${reason}</p>
      <p>Šis veiksmas buvo atliktas automatiškai.</p>
    `;

    return sendEmail({
      to: adminEmail,
      subject: 'Taškų atėmimas',
      html,
    });
  } catch (error: any) {
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
    console.log('sendPrizeRedemptionEmail called with:', {
      adminEmail,
      userName,
      userEmail,
      prizeName,
      redemptionId
    });

    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError) {
      console.error('Authentication error:', authError);
      return { success: false, error: `Authentication error: ${authError.message}` };
    }

    console.log('Authentication successful, calling edge function...');

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
      console.error('Edge function error details:', emailError);
      return { success: false, error: `Edge function error: ${emailError.message}` };
    }

    if (emailResult?.success) {
      console.log('Email sent successfully');
      return { success: true };
    }

    console.error('Email result indicates failure:', emailResult);
    return { success: false, error: emailResult?.error || 'Unknown error sending email' };
  } catch (error: any) {
    console.error('Exception in sendPrizeRedemptionEmail:', error);
    return { 
      success: false, 
      error: `Exception: ${error.message || 'Nepavyko išsiųsti el. laiško'}` 
    };
  }
};

export const sendNewUserRegistrationEmail = async (adminEmail: string, userName: string) => {
  try {
    const { data: adminData, error: adminError } = await supabase
      .from('users')
      .select('user_metadata')
      .eq('email', adminEmail)
      .single();

    if (adminError) throw adminError;

    const settings = adminData?.user_metadata?.notificationSettings;
    if (!settings?.newUserRegistrations) {
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
    return { 
      success: false, 
      error: error.message || 'Nepavyko išsiųsti el. laiško' 
    };
  }
};

export const sendSystemUpdateEmail = async (adminEmail: string, updateMessage: string) => {
  try {
    const { data: adminData, error: adminError } = await supabase
      .from('users')
      .select('user_metadata')
      .eq('email', adminEmail)
      .single();

    if (adminError) throw adminError;

    const settings = adminData?.user_metadata?.notificationSettings;
    if (!settings?.systemUpdates) {
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
    return { 
      success: false, 
      error: error.message || 'Nepavyko išsiųsti el. laiško' 
    };
  }
}; 