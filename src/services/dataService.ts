import { BonusEntry, Prize, PrizeRedemption, Stats, User } from '@/types';
import * as supabaseService from './supabaseService';
import { sendInviteEmail, sendPrizeRedemptionEmail, sendPointsDeductionEmail } from '@/lib/email';
import { supabase } from '@/lib/supabase';

// Helper function to simulate API call delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// User related functions
export const getUsers = async (): Promise<User[]> => {
  return supabaseService.getUsers();
};

export const getUserById = async (id: string): Promise<User | null> => {
  return supabaseService.getUserById(id);
};

export const deleteUser = async (userId: string): Promise<boolean> => {
  try {
    // Delete user from Supabase Auth (this will also trigger profile deletion via trigger)
    const { error } = await supabaseService.deleteUser(userId);
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Failed to delete user:', error);
    throw new Error('Nepavyko ištrinti naudotojo');
  }
};

export const inviteUser = async (
  email: string,
  name: string,
  role: 'admin' | 'user',
  registrationLink: { id: string; link_token: string; points: number }
): Promise<{success: boolean, registrationUrl?: string, emailSent?: boolean}> => {
  try {
    // Check if user already exists using our secure function
    const existingUser = await supabaseService.getUserByEmail(email);
    if (existingUser) {
      throw new Error('Naudotojas su šiuo el. paštu jau egzistuoja');
    }
    
    // Get current user ID for the invitation
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('Nepavyko nustatyti dabartinio naudotojo');
    }
    
    // Create a user invitation using the new system
    const { data: invitation, error: invitationError } = await supabase.rpc('create_user_invitation', {
      parent_link_id_param: registrationLink.id,
      invited_email_param: email,
      invited_name_param: name,
      creator_id_param: user.id
    });
    
    if (invitationError) {
      throw new Error(invitationError.message || 'Failed to create invitation');
    }
    
    // Generate registration URL with the unique invitation token
    const registrationUrl = `${window.location.origin}/register?token=${invitation.invitation_token}&email=${encodeURIComponent(email)}`;
    
    // Try to send email via Edge Function
    let emailSent = false;
    try {
      const { data: emailResult, error: emailError } = await supabase.functions.invoke('send-invitation-email-emailjs', {
        body: {
          to_email: email,
          user_name: name,
          registrationUrl: registrationUrl,
          points: invitation.points,
          email_type: 'registration_invite',
          adminEmail: user.email,
          companyName: 'Vilnius Coding School',
          year: new Date().getFullYear().toString(),
        }
      });
      
      if (emailError) {
        console.error('Email sending failed:', emailError);
      } else if (emailResult?.success) {
        emailSent = true;
        console.log('Invitation email sent successfully via edge function');
      }
    } catch (emailError) {
      console.error('Email sending error:', emailError);
      // Don't throw here - we still want to return the registration URL
    }
    
    return {
      success: true,
      registrationUrl,
      emailSent
    };
  } catch (error: any) {
    console.error('Failed to invite user:', error);
    throw new Error(error.message || 'Failed to invite user');
  }
};

// Bonus entries related functions
export const getBonusEntries = async (userId?: string): Promise<BonusEntry[]> => {
  return supabaseService.getBonusEntries(userId);
};

export const createBonusEntry = async (entry: Omit<BonusEntry, 'id' | 'createdAt'>): Promise<BonusEntry> => {
  return supabaseService.createBonusEntry(entry);
};

// Prize related functions
export const getPrizes = async (): Promise<Prize[]> => {
  return supabaseService.getPrizes();
};

export const getAllPrizes = async (): Promise<Prize[]> => {
  return supabaseService.getAllPrizes();
};

export const createPrize = async (prize: Omit<Prize, 'id' | 'createdAt' | 'updatedAt'>): Promise<Prize> => {
  return supabaseService.createPrize(prize);
};

export const updatePrize = async (prize: Prize): Promise<Prize> => {
  return supabaseService.updatePrize(prize);
};

export const getPrizeById = async (id: string): Promise<Prize | null> => {
  return supabaseService.getPrizeById(id);
};

// Redemption related functions
export const getRedemptions = async (userId?: string): Promise<PrizeRedemption[]> => {
  return supabaseService.getRedemptions(userId);
};

export const createRedemption = async (userId: string, prizeId: string): Promise<PrizeRedemption> => {
  const user = await getUserById(userId);
  if (user.role === 'admin') {
    throw new Error('Administratoriui negalima keisti prizų');
  }
  console.log('createRedemption called with:', { userId, prizeId });
  
  const prize = await getPrizeById(prizeId);

  console.log('User data:', user);
  console.log('Prize data:', prize);

  if (!user || !prize) {
    throw new Error('User or prize not found');
  }

  if (user.totalPoints < prize.points) {
    throw new Error('Not enough points');
  }

  // Reserve points immediately by creating a negative entry
  const reservationEntry = {
    userId,
    userName: user.name,
    courseName: `Rezervuoti taškai prizo "${prize.name}" iškeitimui`,
    price: 0,
    pointsAwarded: -prize.points,
  };
  
  await supabaseService.createBonusEntry(reservationEntry);

  const redemption = await supabaseService.createRedemption({
    userId,
    userName: user.name,
    prizeId,
    prizeName: prize.name,
    pointCost: prize.points,
  });

  // Send notification - the edge function will find admins using service role
  console.log('Sending prize redemption notification...');
  
  try {
    const result = await sendPrizeRedemptionEmail(
      'system',
      user.name,
      user.email,
      prize.name,
      redemption.id
    );
    console.log('Prize redemption email result:', result);
    
    if (!result.success) {
      console.error('Prize redemption email failed:', result.error);
    }
  } catch (error) {
    console.error('Prize redemption email error:', error);
    // Don't throw here - redemption should still be created even if emails fail
  }

  return redemption;
};

export const processRedemption = async (id: string, status: 'approved' | 'rejected', comment?: string): Promise<PrizeRedemption> => {
  return supabaseService.processRedemption(id, status, comment);
};

// Stats related functions
export const getStats = async (): Promise<Stats> => {
  return supabaseService.getStats();
};

// Point deduction function
export const deductPoints = async (userId: string, points: number, reason: string): Promise<boolean> => {
  const user = await supabaseService.getUserById(userId);
  if (user.role === 'admin') {
    throw new Error('Negalima atimti taškų iš administratoriaus');
  }
  await delay(400);
  
  if (!user || user.totalPoints < points) {
    throw new Error('User does not have enough points');
  }
  
  // Create a bonus entry with negative points
  const newEntry = {
    userId,
    userName: user.name,
    courseName: reason,
    price: 0,
    pointsAwarded: -points,
  };
  
  await supabaseService.createBonusEntry(newEntry);
  // Database trigger automatically updates user's total_points when bonus entries are created

  // Get all admin users to send notifications
  const { data: adminUsers, error: adminError } = await supabase
    .from('profiles')
    .select('email')
    .eq('role', 'admin');

  if (!adminError && adminUsers) {
    // Send notifications to all admin users
    await Promise.all(
      adminUsers.map(admin => 
        sendPointsDeductionEmail(
          admin.email,
          user.name,
          points,
          reason
        )
      )
    );
  }
  
  return true;
};

// Get user point history
export const getUserPointHistory = async (userId: string): Promise<BonusEntry[]> => {
  await delay(300);
  
  if (userId.startsWith('demo-')) {
    return [];
  }
  
  return await supabaseService.getBonusEntries(userId);
};

// Registration link functions
export const createRegistrationLink = async (userId: string, points: number, invitedEmail?: string) => {
  try {
    const { data: adminData } = await supabase.auth.getUser();
    const adminUser = adminData.user;
    
    if (!adminUser || adminUser.user_metadata.role !== 'admin') {
      throw new Error('Only admins can create registration links');
    }
    
    // Pass points and email to the RPC function
    const { data, error } = await supabase.rpc('create_registration_link', {
      creator_id: userId,
      points: points,
      invited_email: invitedEmail
    });
    
    if (error) throw error;
    return data;
  } catch (error: any) {
    console.error('Failed to create registration link:', error);
    throw new Error(error.message || 'Failed to create registration link');
  }
};
