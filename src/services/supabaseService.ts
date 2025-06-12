import { supabase } from '@/lib/supabase';
import { BonusEntry, Prize, PrizeRedemption, Stats, User } from '@/types';

// User related functions
export const getUsers = async (): Promise<User[]> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('name');
    
  if (error) throw error;
  return data.map(profile => ({
    id: profile.id,
    name: profile.name,
    email: profile.email,
    phone: profile.phone,
    role: profile.role,
    totalPoints: profile.total_points,
    isVerified: profile.is_verified,
    createdAt: profile.created_at,
  }));
};

export const getUserById = async (id: string): Promise<User | null> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single();
    
  if (error) return null;
  return {
    id: data.id,
    name: data.name,
    email: data.email,
    phone: data.phone,
    role: data.role,
    totalPoints: data.total_points,
    isVerified: data.is_verified,
    createdAt: data.created_at,
  };
};

export const getUserByEmail = async (email: string): Promise<User | null> => {
  // Use RPC function to bypass RLS for admin operations
  const { data: exists, error } = await supabase
    .rpc('check_user_exists_by_email', { user_email: email });
    
  if (error) {
    console.error('Error checking user existence:', error);
    return null;
  }
  
  // If user exists, we return a simple indicator - we don't need full user data for invitation checking
  return exists ? { email } as any : null;
};

export const signUp = async (params: { 
  email: string; 
  password: string; 
  metadata: { 
    name: string;
    role: 'admin' | 'user';
    isInvited?: boolean;
    emailRedirectTo?: string;
  }
}) => {
  return supabase.auth.signUp({
    email: params.email,
    password: params.password,
    options: {
      data: params.metadata,
      emailRedirectTo: params.metadata.emailRedirectTo
    },
  });
};

export const createProfile = async (profile: {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
  total_points: number;
}) => {
  return supabase
    .from('profiles')
    .insert([profile])
    .select()
    .single();
};

export const deleteUser = async (userId: string) => {
  const { data, error } = await supabase.functions.invoke('delete-user', {
    body: { userId }
  });

  if (error) {
    throw new Error(error.message || 'Failed to delete user');
  }

  if (!data.success) {
    throw new Error(data.error || 'Failed to delete user');
  }

  return { data, error: null };
};

export const updateUserPoints = async (userId: string, newPoints: number) => {
  const { error } = await supabase
    .from('profiles')
    .update({ total_points: newPoints })
    .eq('id', userId);
    
  if (error) throw error;
};

// Bonus entries related functions
export const getBonusEntries = async (userId?: string): Promise<BonusEntry[]> => {
  let query = supabase
    .from('bonus_entries')
    .select('*')
    .order('created_at', { ascending: false });
    
  if (userId) {
    query = query.eq('user_id', userId);
  }
  
  const { data, error } = await query;
  if (error) throw error;
  
  return data.map(entry => ({
    id: entry.id,
    userId: entry.user_id,
    userName: entry.user_name,
    courseName: entry.course_name,
    price: entry.price,
    pointsAwarded: entry.points_awarded,
    createdAt: entry.created_at,
  }));
};

export const createBonusEntry = async (entry: Omit<BonusEntry, 'id' | 'createdAt'>): Promise<BonusEntry> => {
  const { data, error } = await supabase
    .from('bonus_entries')
    .insert([{
      user_id: entry.userId,
      user_name: entry.userName,
      course_name: entry.courseName,
      price: entry.price,
      points_awarded: entry.pointsAwarded,
    }])
    .select()
    .single();
    
  if (error) throw error;
  
  return {
    id: data.id,
    userId: data.user_id,
    userName: data.user_name,
    courseName: data.course_name,
    price: data.price,
    pointsAwarded: data.points_awarded,
    createdAt: data.created_at,
  };
};

// Prize related functions
export const getPrizes = async (): Promise<Prize[]> => {
  const { data, error } = await supabase
    .from('prizes')
    .select('*')
    .eq('is_active', true)
    .order('points');
    
  if (error) throw error;
  
  return data.map(prize => ({
    id: prize.id,
    name: prize.name,
    description: prize.description,
    points: prize.points,
    imageUrl: prize.image_url || '',
    isActive: prize.is_active,
    createdAt: prize.created_at,
    updatedAt: prize.updated_at,
  }));
};

export const getAllPrizes = async (): Promise<Prize[]> => {
  const { data, error } = await supabase
    .from('prizes')
    .select('*')
    .order('points');
    
  if (error) throw error;
  
  return data.map(prize => ({
    id: prize.id,
    name: prize.name,
    description: prize.description,
    points: prize.points,
    imageUrl: prize.image_url || '',
    isActive: prize.is_active,
    createdAt: prize.created_at,
    updatedAt: prize.updated_at,
  }));
};

export const createPrize = async (prize: Omit<Prize, 'id' | 'createdAt' | 'updatedAt'>): Promise<Prize> => {
  const { data, error } = await supabase
    .from('prizes')
    .insert([{
      name: prize.name,
      description: prize.description,
      points: prize.points,
      image_url: prize.imageUrl,
      is_active: prize.isActive,
    }])
    .select()
    .single();
    
  if (error) throw error;
  
  return {
    id: data.id,
    name: data.name,
    description: data.description,
    points: data.points,
    imageUrl: data.image_url || '',
    isActive: data.is_active,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
};

export const updatePrize = async (prize: Prize): Promise<Prize> => {
  const { data, error } = await supabase
    .from('prizes')
    .update({
      name: prize.name,
      description: prize.description,
      points: prize.points,
      image_url: prize.imageUrl,
      is_active: prize.isActive,
    })
    .eq('id', prize.id)
    .select()
    .single();
    
  if (error) throw error;
  
  return {
    id: data.id,
    name: data.name,
    description: data.description,
    points: data.points,
    imageUrl: data.image_url || '',
    isActive: data.is_active,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
};

export const getPrizeById = async (id: string): Promise<Prize | null> => {
  const { data, error } = await supabase
    .from('prizes')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching prize:', error);
    return null;
  }

  return {
    id: data.id,
    name: data.name,
    description: data.description,
    points: data.points,
    imageUrl: data.image_url || '',
    isActive: data.is_active,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
};

// Redemption related functions
export const getRedemptions = async (userId?: string): Promise<PrizeRedemption[]> => {
  let query = supabase
    .from('prize_redemptions')
    .select('*')
    .order('requested_at', { ascending: false });
    
  if (userId) {
    query = query.eq('user_id', userId);
  }
  
  const { data, error } = await query;
  if (error) throw error;
  
  return data.map(redemption => ({
    id: redemption.id,
    userId: redemption.user_id,
    userName: redemption.user_name,
    prizeId: redemption.prize_id,
    prizeName: redemption.prize_name,
    pointCost: redemption.point_cost,
    status: redemption.status,
    comment: redemption.comment || undefined,
    requestedAt: redemption.requested_at,
    updatedAt: redemption.updated_at || undefined,
  }));
};

export const createRedemption = async (redemption: Omit<PrizeRedemption, 'id' | 'status' | 'requestedAt' | 'updatedAt' | 'comment'>): Promise<PrizeRedemption> => {
  const { data, error } = await supabase
    .from('prize_redemptions')
    .insert({
      user_id: redemption.userId,
      user_name: redemption.userName,
      prize_id: redemption.prizeId,
      prize_name: redemption.prizeName,
      point_cost: redemption.pointCost,
      status: 'pending',
      requested_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating redemption:', error);
    throw error;
  }

  return {
    id: data.id,
    userId: data.user_id,
    userName: data.user_name,
    prizeId: data.prize_id,
    prizeName: data.prize_name,
    pointCost: data.point_cost,
    status: data.status,
    comment: data.comment || undefined,
    requestedAt: data.requested_at,
    updatedAt: data.updated_at || undefined,
  };
};

export const processRedemption = async (id: string, status: 'approved' | 'rejected', comment?: string): Promise<PrizeRedemption> => {
  const { data, error } = await supabase
    .from('prize_redemptions')
    .update({
      status,
      comment,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();
    
  if (error) throw error;
  
  return {
    id: data.id,
    userId: data.user_id,
    userName: data.user_name,
    prizeId: data.prize_id,
    prizeName: data.prize_name,
    pointCost: data.point_cost,
    status: data.status,
    comment: data.comment || undefined,
    requestedAt: data.requested_at,
    updatedAt: data.updated_at || undefined,
  };
};

// Stats related functions
export const getStats = async (): Promise<Stats> => {
  const [usersResult, entriesResult, prizesResult, redemptionsResult] = await Promise.all([
    supabase
      .from('profiles')
      .select('id, name, total_points, role'),
    supabase
      .from('bonus_entries')
      .select('points_awarded'),
    supabase
      .from('prizes')
      .select('id'),
    supabase
      .from('prize_redemptions')
      .select('prize_id, prize_name, point_cost, status'),
  ]);

  if (usersResult.error) throw usersResult.error;
  if (entriesResult.error) throw entriesResult.error;
  if (prizesResult.error) throw prizesResult.error;
  if (redemptionsResult.error) throw redemptionsResult.error;

  // Only count non-admin users for stats
  const nonAdminUsers = usersResult.data.filter(user => user.role !== 'admin');
  const totalUsers = nonAdminUsers.length;
  const totalPoints = nonAdminUsers.reduce((sum, user) => sum + (user.total_points || 0), 0);
  const totalPrizes = prizesResult.data.length;
  const totalRedemptions = redemptionsResult.data.filter(r => r.status === 'approved').length;
  const averagePoints = totalUsers > 0 ? Math.round(totalPoints / totalUsers) : 0;

  const topUsers = nonAdminUsers
    .filter(user => user.name)
    .sort((a, b) => b.total_points - a.total_points)
    .slice(0, 5)
    .map(user => ({
      name: user.name,
      points: user.total_points || 0,
    }));

  // Calculate popular prizes
  const prizeOccurrences: Record<string, { count: number; name: string }> = {};
  redemptionsResult.data
    .filter(r => r.status === 'approved')
    .forEach(r => {
      if (!prizeOccurrences[r.prize_id]) {
        prizeOccurrences[r.prize_id] = { count: 0, name: r.prize_name };
      }
      prizeOccurrences[r.prize_id].count++;
    });

  const popularPrizes = Object.entries(prizeOccurrences)
    .map(([_, { count, name }]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return {
    totalUsers,
    totalPoints,
    totalPrizes,
    totalRedemptions,
    averagePoints,
    topUsers,
    popularPrizes,
  };
}; 