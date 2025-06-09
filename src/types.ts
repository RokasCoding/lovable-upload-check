
export type UserRole = 'admin' | 'user';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  totalPoints: number;
  isVerified: boolean;
}

export interface BonusEntry {
  id: string;
  userId: string;
  userName: string;
  courseName: string;
  price: number;
  pointsAwarded: number;
  createdAt: Date;
}

export interface Prize {
  id: string;
  name: string;
  description: string;
  pointCost: number;
  imageUrl?: string;
  active: boolean;
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
  requestedAt: Date;
  updatedAt?: Date;
}

export interface Stats {
  totalUsers: number;
  totalPointsAwarded: number;
  totalPointsRedeemed: number;
  topUsers: {userId: string, name: string, points: number}[];
  popularPrizes: {prizeId: string, name: string, count: number}[];
}
