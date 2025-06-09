
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Users, Gift, Award } from 'lucide-react';
import { Stats } from '@/types';

interface AdminStatsProps {
  stats: Stats | null;
  isLoading: boolean;
}

const COLORS = ['#3535FF', '#5A5AFF', '#7A7AFF', '#9A9AFF', '#BABEFF'];

export const AdminStats: React.FC<AdminStatsProps> = ({ stats, isLoading }) => {
  // Format data for charts
  const prizeDistributionData = stats?.popularPrizes.map(prize => ({
    name: prize.name,
    value: prize.count,
  })) || [];

  const userPointsData = stats?.topUsers.map(user => ({
    name: user.name,
    points: user.points,
  })) || [];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card className="bg-white border-gray-200 animate-fade-in">
          <CardHeader className="pb-2">
            <CardTitle className="text-black text-lg flex items-center">
              <Users className="h-5 w-5 mr-2 text-vcs-blue" />
              Iš Viso Naudotojų
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-vcs-blue">
              {isLoading ? <Skeleton className="h-9 w-16 bg-gray-200" /> : stats?.totalUsers}
            </div>
            <p className="text-sm text-gray-600 mt-1">Registruotų naudotojų skaičius</p>
          </CardContent>
        </Card>
        
        <Card className="bg-white border-gray-200 animate-fade-in">
          <CardHeader className="pb-2">
            <CardTitle className="text-black text-lg flex items-center">
              <Award className="h-5 w-5 mr-2 text-vcs-blue" />
              Suteikta Taškų
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-vcs-blue">
              {isLoading ? <Skeleton className="h-9 w-16 bg-gray-200" /> : stats?.totalPointsAwarded}
            </div>
            <p className="text-sm text-gray-600 mt-1">Iš viso suteiktų bonus taškų</p>
          </CardContent>
        </Card>
        
        <Card className="bg-white border-gray-200 animate-fade-in">
          <CardHeader className="pb-2">
            <CardTitle className="text-black text-lg flex items-center">
              <Gift className="h-5 w-5 mr-2 text-vcs-blue" />
              Iškeista Taškų
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-vcs-blue">
              {isLoading ? <Skeleton className="h-9 w-16 bg-gray-200" /> : stats?.totalPointsRedeemed}
            </div>
            <p className="text-sm text-gray-600 mt-1">Iš viso iškeistų taškų prizams</p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Prize Distribution Chart */}
        <Card className="bg-white border-gray-200 animate-fade-in">
          <CardHeader>
            <CardTitle className="text-black">Populiariausi Prizai</CardTitle>
            <CardDescription>Dažniausiai iškeičiami prizai</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <Skeleton className="h-64 w-64 rounded-full bg-gray-200" />
              </div>
            ) : prizeDistributionData.length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-500">
                Nėra prizų iškeitimo duomenų
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={prizeDistributionData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {prizeDistributionData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} iškeičimai`, 'Kiekis']} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
        
        {/* Top Users Chart */}
        <Card className="bg-white border-gray-200 animate-fade-in">
          <CardHeader>
            <CardTitle className="text-black">TOP Naudotojai</CardTitle>
            <CardDescription>Naudotojai su daugiausiai taškų</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-64 w-full bg-gray-200" />
              </div>
            ) : userPointsData.length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-500">
                Nėra naudotojų taškų duomenų
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={userPointsData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fill: '#666' }} 
                    angle={-45} 
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis tick={{ fill: '#666' }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '4px' }}
                    labelStyle={{ color: '#000' }}
                  />
                  <Bar dataKey="points" fill="#3535FF" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
