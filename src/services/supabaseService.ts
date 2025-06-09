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
    role: profile.role,
    totalPoints: profile.total_points,
    isVerified: profile.is_verified,
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
    role: data.role,
    totalPoints: data.total_points,
    isVerified: data.is_verified,
  };
};

export const getUserByEmail = async (email: string): Promise<User | null> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('email', email)
    .single();
    
  if (error) return null;
  return {
    id: data.id,
    name: data.name,
    email: data.email,
    role: data.role,
    totalPoints: data.total_points,
    isVerified: data.is_verified,
  };
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
  return supabase.auth.admin.deleteUser(userId);
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
    .eq('active', true)
    .order('point_cost');
    
  if (error) throw error;
  
  return data.map(prize => ({
    id: prize.id,
    name: prize.name,
    description: prize.description,
    pointCost: prize.point_cost,
    imageUrl: prize.image_url || undefined,
    active: prize.active,
  }));
};

export const getAllPrizes = async (): Promise<Prize[]> => {
  const { data, error } = await supabase
    .from('prizes')
    .select('*')
    .order('point_cost');
    
  if (error) throw error;
  
  return data.map(prize => ({
    id: prize.id,
    name: prize.name,
    description: prize.description,
    pointCost: prize.point_cost,
    imageUrl: prize.image_url || undefined,
    active: prize.active,
  }));
};

export const createPrize = async (prize: Omit<Prize, 'id'>): Promise<Prize> => {
  const { data, error } = await supabase
    .from('prizes')
    .insert([{
      name: prize.name,
      description: prize.description,
      point_cost: prize.pointCost,
      image_url: prize.imageUrl,
      active: prize.active,
    }])
    .select()
    .single();
    
  if (error) throw error;
  
  return {
    id: data.id,
    name: data.name,
    description: data.description,
    pointCost: data.point_cost,
    imageUrl: data.image_url || undefined,
    active: data.active,
  };
};

export const updatePrize = async (prize: Prize): Promise<Prize> => {
  const { data, error } = await supabase
    .from('prizes')
    .update({
      name: prize.name,
      description: prize.description,
      point_cost: prize.pointCost,
      image_url: prize.imageUrl,
      active: prize.active,
    })
    .eq('id', prize.id)
    .select()
    .single();
    
  if (error) throw error;
  
  return {
    id: data.id,
    name: data.name,
    description: data.description,
    pointCost: data.point_cost,
    imageUrl: data.image_url || undefined,
    active: data.active,
  };
};

// Redemption related functions
export const getRedemptions = async (userId?: string): Promise<PrizeRedemption[]> => {
  let query = supabase
    .from('redemptions')
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
    .from('redemptions')
    .insert([{
      user_id: redemption.userId,
      user_name: redemption.userName,
      prize_id: redemption.prizeId,
      prize_name: redemption.prizeName,
      point_cost: redemption.pointCost,
      status: 'pending',
      requested_at: new Date().toISOString(),
    }])
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

export const processRedemption = async (id: string, status: 'approved' | 'rejected', comment?: string): Promise<PrizeRedemption> => {
  const { data, error } = await supabase
    .from('redemptions')
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
  const [usersResult, entriesResult, redemptionsResult] = await Promise.all([
    supabase
      .from('profiles')
      .select('id, name, total_points')
      .eq('role', 'user'),
    supabase
      .from('bonus_entries')
      .select('points_awarded'),
    supabase
      .from('redemptions')
      .select('prize_id, prize_name, point_cost, status'),
  ]);

  if (usersResult.error) throw usersResult.error;
  if (entriesResult.error) throw entriesResult.error;
  if (redemptionsResult.error) throw redemptionsResult.error;

  const totalUsers = usersResult.data.length;
  const totalPointsAwarded = entriesResult.data.reduce((sum, entry) => sum + entry.points_awarded, 0);
  const totalPointsRedeemed = redemptionsResult.data
    .filter(r => r.status === 'approved')
    .reduce((sum, r) => sum + r.point_cost, 0);

  const topUsers = usersResult.data
    .sort((a, b) => b.total_points - a.total_points)
    .slice(0, 5)
    .map(user => ({
      userId: user.id,
      name: user.name,
      points: user.total_points,
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