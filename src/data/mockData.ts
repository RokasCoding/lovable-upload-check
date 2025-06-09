
import { User, BonusEntry, Prize, PrizeRedemption, Stats } from '../types';

// Mock users data
export const mockUsers: User[] = [
  {
    id: 'admin1',
    name: 'Main Admin',
    email: 'admin1@example.com',
    role: 'admin',
    totalPoints: 999,
    isVerified: true,
  },
  {
    id: 'admin2',
    name: 'Secondary Admin',
    email: 'admin2@example.com',
    role: 'admin',
    totalPoints: 750,
    isVerified: true,
  },
  {
    id: 'highpoints',
    name: 'John Smith',
    email: 'highpoints@example.com',
    role: 'user',
    totalPoints: 1200,
    isVerified: true,
  },
  {
    id: 'mediumpoints',
    name: 'Sarah Johnson',
    email: 'mediumpoints@example.com',
    role: 'user',
    totalPoints: 500,
    isVerified: true,
  },
  {
    id: 'lowpoints',
    name: 'Mike Wilson',
    email: 'lowpoints@example.com',
    role: 'user',
    totalPoints: 100,
    isVerified: true,
  },
  {
    id: 'activeuser',
    name: 'Emily Davis',
    email: 'activeuser@example.com',
    role: 'user',
    totalPoints: 850,
    isVerified: true,
  },
  {
    id: 'newuser',
    name: 'Alex Chen',
    email: 'newuser@example.com',
    role: 'user',
    totalPoints: 0,
    isVerified: true,
  },
];

// Mock bonus entries
export const mockBonusEntries: BonusEntry[] = [
  {
    id: '1',
    userId: 'highpoints',
    userName: 'John Smith',
    courseName: 'Advanced React Patterns',
    price: 199,
    pointsAwarded: 400,
    createdAt: new Date('2024-01-15'),
  },
  {
    id: '2',
    userId: 'activeuser',
    userName: 'Emily Davis',
    courseName: 'TypeScript Mastery',
    price: 149,
    pointsAwarded: 300,
    createdAt: new Date('2024-01-20'),
  },
  {
    id: '3',
    userId: 'mediumpoints',
    userName: 'Sarah Johnson',
    courseName: 'Node.js Backend Development',
    price: 179,
    pointsAwarded: 350,
    createdAt: new Date('2024-01-25'),
  },
  {
    id: '4',
    userId: 'highpoints',
    userName: 'John Smith',
    courseName: 'GraphQL Fundamentals',
    price: 129,
    pointsAwarded: 250,
    createdAt: new Date('2024-02-01'),
  },
  {
    id: '5',
    userId: 'lowpoints',
    userName: 'Mike Wilson',
    courseName: 'CSS Grid & Flexbox',
    price: 99,
    pointsAwarded: 200,
    createdAt: new Date('2024-02-05'),
  },
];

// Mock prizes
export const mockPrizes: Prize[] = [
  {
    id: '1',
    name: 'Wireless Headphones',
    description: 'Premium noise-cancelling wireless headphones',
    pointCost: 500,
    imageUrl: '/placeholder.svg',
    active: true,
  },
  {
    id: '2',
    name: 'Tech Conference Ticket',
    description: 'Ticket to annual tech conference',
    pointCost: 800,
    imageUrl: '/placeholder.svg',
    active: true,
  },
  {
    id: '3',
    name: 'Gift Card $50',
    description: '$50 Amazon gift card',
    pointCost: 300,
    imageUrl: '/placeholder.svg',
    active: true,
  },
  {
    id: '4',
    name: 'Mechanical Keyboard',
    description: 'Premium mechanical keyboard for developers',
    pointCost: 600,
    imageUrl: '/placeholder.svg',
    active: true,
  },
  {
    id: '5',
    name: 'Online Course Bundle',
    description: 'Access to premium course collection',
    pointCost: 400,
    imageUrl: '/placeholder.svg',
    active: true,
  },
  {
    id: '6',
    name: 'Coffee Subscription',
    description: '3-month premium coffee subscription',
    pointCost: 250,
    imageUrl: '/placeholder.svg',
    active: false,
  },
];

// Mock redemptions
export const mockRedemptions: PrizeRedemption[] = [
  {
    id: '1',
    userId: 'highpoints',
    userName: 'John Smith',
    prizeId: '1',
    prizeName: 'Wireless Headphones',
    pointCost: 500,
    status: 'approved',
    comment: 'Delivered successfully',
    requestedAt: new Date('2024-01-30'),
    updatedAt: new Date('2024-02-02'),
  },
  {
    id: '2',
    userId: 'activeuser',
    userName: 'Emily Davis',
    prizeId: '3',
    prizeName: 'Gift Card $50',
    pointCost: 300,
    status: 'pending',
    requestedAt: new Date('2024-02-10'),
  },
  {
    id: '3',
    userId: 'mediumpoints',
    userName: 'Sarah Johnson',
    prizeId: '5',
    prizeName: 'Online Course Bundle',
    pointCost: 400,
    status: 'approved',
    comment: 'Access granted',
    requestedAt: new Date('2024-02-05'),
    updatedAt: new Date('2024-02-06'),
  },
];

// Mock stats
export const mockStats: Stats = {
  totalUsers: 5,
  totalPointsAwarded: 1500,
  totalPointsRedeemed: 1200,
  topUsers: [
    { userId: 'highpoints', name: 'John Smith', points: 1200 },
    { userId: 'activeuser', name: 'Emily Davis', points: 850 },
    { userId: 'mediumpoints', name: 'Sarah Johnson', points: 500 },
    { userId: 'lowpoints', name: 'Mike Wilson', points: 100 },
    { userId: 'newuser', name: 'Alex Chen', points: 0 },
  ],
  popularPrizes: [
    { prizeId: '1', name: 'Wireless Headphones', count: 3 },
    { prizeId: '3', name: 'Gift Card $50', count: 2 },
    { prizeId: '5', name: 'Online Course Bundle', count: 2 },
    { prizeId: '2', name: 'Tech Conference Ticket', count: 1 },
    { prizeId: '4', name: 'Mechanical Keyboard', count: 1 },
  ],
};
