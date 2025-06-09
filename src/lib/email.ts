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