import { User } from '@supabase/supabase-js';

export type AppUser = User & {
  user_metadata: {
    name: string;
    role?: 'admin' | 'user';
    totalPoints?: number;
  };
}; 