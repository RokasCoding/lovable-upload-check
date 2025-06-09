import { BonusEntry, Prize, PrizeRedemption, Stats, User } from '@/types';
import { mockUsers, mockBonusEntries, mockPrizes, mockRedemptions, mockStats } from '@/data/mockData';
import { supabase } from '@/lib/supabase';
import { sendInviteEmail } from '@/lib/email';

// Helper function to simulate API call delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// In-memory storage for dynamic data
let users = [...mockUsers];
let bonusEntries = [...mockBonusEntries];
let prizes = [...mockPrizes];
let redemptions = [...mockRedemptions];

// User related functions
export const getUsers = async (): Promise<User[]> => {
  await delay(300);
  return users.filter(user => !user.id.startsWith('demo-'));
};

export const getUserById = async (id: string): Promise<User | null> => {
  await delay(200);
  
  // Handle demo users
  if (id.startsWith('demo-')) {
    return null;
  }
  
  return users.find(user => user.id === id) || null;
};

export const inviteUser = async (email: string, name: string, role: 'admin' | 'user'): Promise<boolean> => {
  try {
    // Check if user already exists in Supabase
    const { data: existingUser } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      throw new Error('Naudotojas su šiuo el. paštu jau egzistuoja');
    }

    // Generate a temporary password
    const tempPassword = Math.random().toString(36).slice(-12);

    // Create user account with Supabase Auth
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password: tempPassword,
      options: {
        data: {
          name,
          role,
          isInvited: true
        },
        emailRedirectTo: `${window.location.origin}/reset-password`
      }
    });

    if (signUpError) {
      throw signUpError;
    }

    // Create a profile record
    if (data.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([
          {
            id: data.user.id,
            email,
            name,
            role,
            total_points: 0
          }
        ]);

      if (profileError) {
        // If profile creation fails, delete the auth user
        await supabase.auth.admin.deleteUser(data.user.id);
        throw profileError;
      }
    }

    return true;
  } catch (error: any) {
    console.error('Failed to invite user:', error);
    throw new Error(error.message || 'Nepavyko išsiųsti pakvietimo');
  }
};

// Bonus entries related functions
export const getBonusEntries = async (userId?: string): Promise<BonusEntry[]> => {
  await delay(300);
  
  // For demo users, return empty array
  if (userId?.startsWith('demo-')) {
    return [];
  }
  
  if (userId) {
    return bonusEntries.filter(entry => entry.userId === userId);
  }
  
  return bonusEntries;
};

export const createBonusEntry = async (entry: Omit<BonusEntry, 'id' | 'createdAt'>): Promise<BonusEntry> => {
  await delay(400);
  
  const newEntry: BonusEntry = {
    ...entry,
    id: `entry-${Date.now()}`,
    createdAt: new Date(),
  };
  
  bonusEntries.push(newEntry);
  
  // Update user's total points
  const userIndex = users.findIndex(user => user.id === entry.userId);
  if (userIndex !== -1) {
    users[userIndex].totalPoints += entry.pointsAwarded;
  }
  
  return newEntry;
};

// Prize related functions
export const getPrizes = async (): Promise<Prize[]> => {
  await delay(250);
  return prizes.filter(prize => prize.active);
};

export const getAllPrizes = async (): Promise<Prize[]> => {
  await delay(250);
  return prizes;
};

export const createPrize = async (prize: Omit<Prize, 'id'>): Promise<Prize> => {
  await delay(400);
  
  const newPrize: Prize = {
    ...prize,
    id: `prize-${Date.now()}`,
  };
  
  prizes.push(newPrize);
  return newPrize;
};

export const updatePrize = async (prize: Prize): Promise<Prize> => {
  await delay(400);
  
  const index = prizes.findIndex(p => p.id === prize.id);
  if (index === -1) {
    throw new Error('Prize not found');
  }
  
  prizes[index] = prize;
  return prize;
};

// Redemption related functions
export const getRedemptions = async (userId?: string): Promise<PrizeRedemption[]> => {
  await delay(300);
  
  // For demo users, return empty array
  if (userId?.startsWith('demo-')) {
    return [];
  }
  
  if (userId) {
    return redemptions.filter(redemption => redemption.userId === userId);
  }
  
  return redemptions;
};

export const requestRedemption = async (redemption: Omit<PrizeRedemption, 'id' | 'status' | 'requestedAt' | 'updatedAt'>): Promise<PrizeRedemption> => {
  await delay(400);
  
  // Check if user has enough points
  const user = users.find(user => user.id === redemption.userId);
  if (!user || user.totalPoints < redemption.pointCost) {
    throw new Error('Not enough points to redeem this prize');
  }
  
  const newRedemption: PrizeRedemption = {
    ...redemption,
    id: `redemption-${Date.now()}`,
    status: 'pending',
    requestedAt: new Date(),
  };
  
  redemptions.push(newRedemption);
  return newRedemption;
};

export const processRedemption = async (
  id: string, 
  status: 'approved' | 'rejected', 
  comment?: string
): Promise<PrizeRedemption> => {
  await delay(400);
  
  const index = redemptions.findIndex(r => r.id === id);
  if (index === -1) {
    throw new Error('Redemption not found');
  }
  
  redemptions[index] = {
    ...redemptions[index],
    status,
    comment,
    updatedAt: new Date(),
  };
  
  // If approved, deduct points from user
  if (status === 'approved') {
    const userIndex = users.findIndex(user => user.id === redemptions[index].userId);
    if (userIndex !== -1) {
      users[userIndex].totalPoints -= redemptions[index].pointCost;
    }
  }
  
  return redemptions[index];
};

// Stats related functions
export const getStats = async (): Promise<Stats> => {
  await delay(300);
  
  const totalUsers = users.filter(user => user.role === 'user' && !user.id.startsWith('demo-')).length;
  const totalPointsAwarded = bonusEntries.reduce((sum, entry) => sum + entry.pointsAwarded, 0);
  const totalPointsRedeemed = redemptions
    .filter(r => r.status === 'approved')
    .reduce((sum, r) => sum + r.pointCost, 0);
  
  const topUsers = users
    .filter(user => user.role === 'user' && !user.id.startsWith('demo-'))
    .sort((a, b) => b.totalPoints - a.totalPoints)
    .slice(0, 5)
    .map(user => ({
      userId: user.id,
      name: user.name,
      points: user.totalPoints,
    }));
  
  // Calculate popular prizes
  const prizeOccurrences: Record<string, { count: number; name: string }> = {};
  redemptions
    .filter(r => r.status === 'approved')
    .forEach(r => {
      if (!prizeOccurrences[r.prizeId]) {
        prizeOccurrences[r.prizeId] = { count: 0, name: r.prizeName };
      }
      prizeOccurrences[r.prizeId].count++;
    });
  
  const popularPrizes = Object.entries(prizeOccurrences)
    .map(([prizeId, { count, name }]) => ({ prizeId, name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
  
  return {
    totalUsers,
    totalPointsAwarded,
    totalPointsRedeemed,
    topUsers,
    popularPrizes,
  };
};

// Point deduction function
export const deductPoints = async (userId: string, points: number, reason: string): Promise<boolean> => {
  await delay(400);
  
  const userIndex = users.findIndex(user => user.id === userId);
  if (userIndex === -1) {
    throw new Error('User not found');
  }
  
  if (users[userIndex].totalPoints < points) {
    throw new Error('User does not have enough points');
  }
  
  // Create a bonus entry with negative points
  const newEntry: BonusEntry = {
    id: `entry-${Date.now()}`,
    userId,
    userName: users[userIndex].name,
    courseName: reason,
    price: 0,
    pointsAwarded: -points,
    createdAt: new Date(),
  };
  
  bonusEntries.push(newEntry);
  users[userIndex].totalPoints -= points;
  
  return true;
};

// Get user point history
export const getUserPointHistory = async (userId: string): Promise<BonusEntry[]> => {
  await delay(300);
  
  if (userId.startsWith('demo-')) {
    return [];
  }
  
  return bonusEntries
    .filter(entry => entry.userId === userId)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
};
