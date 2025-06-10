import { BonusEntry, Prize, PrizeRedemption, Stats, User } from '@/types';
import * as supabaseService from './supabaseService';
import { sendInviteEmail, sendPrizeRedemptionEmail } from '@/lib/email';
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

export const inviteUser = async (email: string, name: string, role: 'admin' | 'user'): Promise<boolean> => {
  try {
    // Check if user already exists in Supabase
    const existingUser = await supabaseService.getUserByEmail(email);

    if (existingUser) {
      throw new Error('Naudotojas su šiuo el. paštu jau egzistuoja');
    }

    // Generate a temporary password
    const tempPassword = Math.random().toString(36).slice(-12);

    // Create user account with Supabase Auth
    const { data, error: signUpError } = await supabaseService.signUp({
      email,
      password: tempPassword,
      metadata: {
        name,
        role,
        isInvited: true,
        emailRedirectTo: `${window.location.origin}/reset-password`
      }
    });

    if (signUpError) {
      throw signUpError;
    }

    // Create a profile record using our secure function
    if (data.user) {
      const { data: profileData, error: profileError } = await supabase.rpc('create_user_profile', {
        user_id: data.user.id,
        user_email: email,
        user_name: name,
        user_role: role,
        initial_points: 0
      });

      if (profileError) {
        // If profile creation fails, delete the auth user
        await supabaseService.deleteUser(data.user.id);
        throw profileError;
      }
    }

    return true;
      } catch (error: any) {
      console.error('Failed to invite user:', error);
      const errorMessage = error.message || 'Nepavyko išsiųsti pakvietimo';
      
      // Provide more specific error messages
      if (error.message?.includes('duplicate')) {
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
  const user = await getUserById(userId);
  const prize = await getPrizeById(prizeId);

  if (!user || !prize) {
    throw new Error('User or prize not found');
  }

  if (user.totalPoints < prize.points) {
    throw new Error('Not enough points');
  }

  const redemption = await supabaseService.createRedemption({
    userId,
    userName: user.name,
    prizeId,
    prizeName: prize.name,
    pointCost: prize.points,
  });

  // Send email to admin
  await sendPrizeRedemptionEmail(
    'akvile.n@vilniuscoding.lt',
    user.name,
    prize.name,
    redemption.id
  );

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
