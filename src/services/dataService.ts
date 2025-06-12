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

export const inviteUser = async (email: string, name: string, role: 'admin' | 'user'): Promise<{success: boolean, registrationUrl?: string, emailSent?: boolean}> => {
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

    // Create invitation using our secure function
    const { data: inviteResult, error: inviteError } = await supabase
      .rpc('invite_user', {
        inviter_id: user.id,
        invite_email: email,
        invite_name: name,
        invite_role: role
      });

    if (inviteError) {
      throw inviteError;
    }

    // Generate registration URL
    const registrationUrl = `${window.location.origin}/register?token=${inviteResult.link_token}`;
    
    console.log('Registration link created:', registrationUrl);

    // Try to send email via Edge Function
    let emailSent = false;
    try {
      const { data: emailResult, error: emailError } = await supabase.functions.invoke('send-invitation-email-emailjs', {
        body: {
          to: email,
          name: name,
          registrationUrl: registrationUrl,
          inviterName: user.user_metadata?.name || 'Administratorius'
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
    const errorMessage = error.message || 'Nepavyko išsiųsti pakvietimo';
    
    // Provide more specific error messages
    if (error.message?.includes('already exists')) {
      throw new Error('Naudotojas su šiuo el. paštu jau egzistuoja');
    } else if (error.message?.includes('invalid email')) {
      throw new Error('Neteisingas el. pašto formatas');
    }
    
    throw new Error(errorMessage);
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
  console.log('createRedemption called with:', { userId, prizeId });
  
  const user = await getUserById(userId);
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

  // Get all admin users to send notifications
  const { data: adminUsers, error: adminError } = await supabase
    .from('profiles')
    .select('email')
    .eq('role', 'admin');

  console.log('Found admin users:', adminUsers, 'Error:', adminError);

  if (!adminError && adminUsers && adminUsers.length > 0) {
    console.log(`Sending prize redemption emails to ${adminUsers.length} admin(s)`);
    
    // Send notifications to all admin users (each email function will check individual settings)
    const emailPromises = adminUsers.map(async (admin) => {
      try {
        console.log(`Sending email to admin: ${admin.email}`);
        const result = await sendPrizeRedemptionEmail(
          admin.email,
          user.name,
          user.email,
          prize.name,
          redemption.id
        );
        console.log(`Email result for ${admin.email}:`, result);
        return result;
      } catch (error) {
        console.error(`Failed to send email to admin ${admin.email}:`, error);
        return { success: false, error: error.message };
      }
    });

    try {
      const emailResults = await Promise.all(emailPromises);
      console.log('All email results:', emailResults);
      
      const failedEmails = emailResults.filter(result => !result.success);
      if (failedEmails.length > 0) {
        console.warn('Some emails failed to send:', failedEmails);
        // Show an alert about email failures (temporary for debugging)
        alert(`Emails failed: ${JSON.stringify(failedEmails)}`);
      } else {
        console.log('All prize redemption emails sent successfully');
        // Show success alert (temporary for debugging)
        alert('All prize redemption emails sent successfully');
      }
    } catch (error) {
      console.error('Error sending prize redemption emails:', error);
      alert(`Email error: ${error.message}`);
      // Don't throw here - redemption should still be created even if emails fail
    }
  } else {
    console.warn('No admin users found or error fetching admin users:', { adminUsers, adminError });
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
  await delay(400);
  
  const user = await supabaseService.getUserById(userId);
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
export const createRegistrationLink = async (userId: string) => {
  try {
    const { data: adminData } = await supabase.auth.getUser();
    const adminUser = adminData.user;
    
    if (!adminUser || adminUser.user_metadata.role !== 'admin') {
      throw new Error('Only admins can create registration links');
    }
    
    // Create the registration link with direct SQL query to bypass RLS
    const { data, error } = await supabase.rpc('create_registration_link', {
      creator_id: userId
    });
    
    if (error) throw error;
    return data;
  } catch (error: any) {
    console.error('Failed to create registration link:', error);
    throw new Error(error.message || 'Failed to create registration link');
  }
};
