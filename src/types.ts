export type UserRole = 'admin' | 'user';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  totalPoints: number;
  isVerified: boolean;
  createdAt?: Date;
}

export interface BonusEntry {
  id: string;
  userId: string;
  userName: string;
  courseName: string;
  price: number;
  pointsAwarded: number;
  createdAt: string;
}

export interface Prize {
  id: string;
  name: string;
  description: string;
  points: number;
  imageUrl: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface PrizeRedemption {
  id: string;
  userId: string;
  userName: string;
  prizeId: string;
  prizeName: string;
  pointCost: number;
  status: 'pending' | 'approved' | 'rejected';
  comment?: string;
  requestedAt: string;
  updatedAt?: string;
}

export interface Stats {
  totalUsers: number;
  totalPoints: number;
  totalPrizes: number;
  totalRedemptions: number;
  averagePoints: number;
  topUsers: {
    name: string;
    points: number;
  }[];
  popularPrizes: {
    name: string;
    count: number;
  }[];
}

export interface RegistrationLink {
  id: string;
  created_at: string;
  created_by: string;
  link_token: string;
  is_active: boolean;
  points: number;
  invited_email: string | null;
}
