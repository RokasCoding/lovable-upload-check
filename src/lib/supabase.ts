import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file contains VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Auth helpers
export const signInWithEmail = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
};

export const signUpWithEmail = async (email: string, password: string, metadata: { name: string }) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: metadata,
    },
  });
  return { data, error };
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  return { user, error };
};

// Database helpers
export const getUserProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  return { data, error };
};

export const updateUserProfile = async (userId: string, updates: any) => {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();
  return { data, error };
};

export const getBonusEntries = async (userId?: string) => {
  let query = supabase
    .from('bonus_entries')
    .select('*')
    .order('created_at', { ascending: false });

  if (userId) {
    query = query.eq('user_id', userId);
  }

  const { data, error } = await query;
  return { data, error };
};

export const createBonusEntry = async (entry: {
  user_id: string;
  user_name: string;
  course_name: string;
  price: number;
  points_awarded: number;
}) => {
  const { data, error } = await supabase
    .from('bonus_entries')
    .insert([entry])
    .select()
    .single();
  return { data, error };
};

export const getPrizes = async () => {
  const { data, error } = await supabase
    .from('prizes')
    .select('*')
    .eq('is_active', true);
  return { data, error };
};

export const createPrize = async (prize: {
  name: string;
  description: string;
  points: number;
  image_url?: string;
  is_active: boolean;
}) => {
  const { data, error } = await supabase
    .from('prizes')
    .insert([prize])
    .select()
    .single();
  return { data, error };
};

export const getRedemptions = async (userId?: string) => {
  let query = supabase
    .from('prize_redemptions')
    .select('*')
    .order('requested_at', { ascending: false });

  if (userId) {
    query = query.eq('user_id', userId);
  }

  const { data, error } = await query;
  return { data, error };
};

export const createRedemption = async (redemption: {
  user_id: string;
  user_name: string;
  prize_id: string;
  prize_name: string;
  point_cost: number;
}) => {
  const { data, error } = await supabase
    .from('prize_redemptions')
    .insert([{
      ...redemption,
      status: 'pending',
      requested_at: new Date().toISOString(),
    }])
    .select()
    .single();
  return { data, error };
};

export const updateRedemptionStatus = async (
  id: string,
  status: 'approved' | 'rejected',
  comment?: string
) => {
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
  return { data, error };
}; 