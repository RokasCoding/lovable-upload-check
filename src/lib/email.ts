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
  userId: string,
  name: string,
  points: number,
  reason: string
) => {
  try {
    // Update user metadata to trigger email notification
    const { error } = await supabase.auth.updateUser({
      data: {
        notification: {
          type: 'points_deduction',
          name,
          points,
          reason,
          timestamp: new Date().toISOString()
        }
      }
    });

    if (error) {
      console.error('Error sending points deduction notification:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    console.error('Failed to send points deduction notification:', error);
    return { 
      success: false, 
      error: error.message || 'Nepavyko išsiųsti pranešimo' 
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
  prizeName: string,
  redemptionId: string
) => {
  const confirmUrl = `${window.location.origin}/admin?tab=redemptions&confirm=${redemptionId}`;
  const rejectUrl = `${window.location.origin}/admin?tab=redemptions&reject=${redemptionId}`;

  const html = `
    <h2>Naujas prizo išpirkimo prašymas</h2>
    <p>Naudotojas ${userName} nori išpirkti prizą "${prizeName}".</p>
    <p>Norėdami patvirtinti arba atmesti prašymą, spauskite vieną iš šių nuorodų:</p>
    <p>
      <a href="${confirmUrl}" style="display: inline-block; padding: 10px 20px; margin-right: 10px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px;">Patvirtinti</a>
      <a href="${rejectUrl}" style="display: inline-block; padding: 10px 20px; background-color: #f44336; color: white; text-decoration: none; border-radius: 5px;">Atmesti</a>
    </p>
    <p>Arba galite tai padaryti administratoriaus skydelyje.</p>
  `;

  return sendEmail({
    to: adminEmail,
    subject: `Naujas prizo išpirkimo prašymas - ${prizeName}`,
    html,
  });
}; 