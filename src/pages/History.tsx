
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/Layout';
import { getRedemptions } from '@/services/dataService';
import { PrizeRedemption } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

const History: React.FC = () => {
  const { currentUser, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [redemptions, setRedemptions] = useState<PrizeRedemption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    if (!isAuthenticated || !currentUser) {
      navigate('/login');
      return;
    }

    const fetchRedemptions = async () => {
      setIsLoading(true);
      try {
        const data = await getRedemptions(currentUser.id);
        setRedemptions(data);
      } catch (error) {
        console.error('Failed to fetch redemptions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRedemptions();
  }, [currentUser, isAuthenticated, navigate]);

  const getStatusBadge = (status: 'pending' | 'approved' | 'rejected') => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-500/20 text-yellow-300 border-yellow-500">Pending</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-green-500/20 text-green-300 border-green-500">Approved</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-500/20 text-red-300 border-red-500">Rejected</Badge>;
      default:
        return null;
    }
  };

  const filteredRedemptions = redemptions.filter(r => {
    if (activeTab === 'all') return true;
    return r.status === activeTab;
  });

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-white mb-6">Redemption History</h1>
        
        <Card className="bg-vcs-dark border-vcs-gray animate-fade-in">
          <CardHeader>
            <CardTitle className="text-white">Your Prize Redemptions</CardTitle>
            <CardDescription>View all your prize redemption requests and their status</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
              <TabsList className="bg-vcs-gray">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="pending">Pending</TabsTrigger>
                <TabsTrigger value="approved">Approved</TabsTrigger>
                <TabsTrigger value="rejected">Rejected</TabsTrigger>
              </TabsList>
            </Tabs>
            
            {isLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-12 w-full bg-vcs-gray" />
                ))}
              </div>
            ) : filteredRedemptions.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                No {activeTab === 'all' ? '' : activeTab} redemption requests found.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-vcs-gray/50 border-gray-700">
                      <TableHead className="text-gray-300">Date</TableHead>
                      <TableHead className="text-gray-300">Prize</TableHead>
                      <TableHead className="text-gray-300 text-right">Points</TableHead>
                      <TableHead className="text-gray-300 text-center">Status</TableHead>
                      <TableHead className="text-gray-300">Comments</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRedemptions.map((redemption) => (
                      <TableRow key={redemption.id} className="hover:bg-vcs-gray/50 border-gray-700">
                        <TableCell className="font-medium text-gray-300">
                          {format(new Date(redemption.requestedAt), 'dd MMM yyyy')}
                        </TableCell>
                        <TableCell className="text-gray-300">
                          {redemption.prizeName}
                        </TableCell>
                        <TableCell className="text-right">
                          <span className="point-badge">-{redemption.pointCost}</span>
                        </TableCell>
                        <TableCell className="text-center">
                          {getStatusBadge(redemption.status)}
                        </TableCell>
                        <TableCell className="text-gray-300">
                          {redemption.comment || (redemption.status === 'pending' ? 'Awaiting review' : '')}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default History;
