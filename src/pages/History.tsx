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
        return <Badge variant="outline" className="bg-yellow-500/20 text-yellow-700 border-yellow-500">Laukiama</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-green-500/20 text-green-700 border-green-500">Patvirtinta</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-500/20 text-red-700 border-red-500">Atmesta</Badge>;
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
        <h1 className="text-3xl font-bold text-foreground mb-6">Iškeitimų istorija</h1>
        
        <Card className="bg-background border-border animate-fade-in">
          <CardHeader>
            <CardTitle className="text-foreground">Jūsų prizų iškeitimai</CardTitle>
            <CardDescription className="text-muted-foreground">Peržiūrėkite visus savo prizų iškeitimo užklausas ir jų būsenas</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
              <TabsList className="bg-muted">
                <TabsTrigger value="all">Visi</TabsTrigger>
                <TabsTrigger value="pending">Laukiami</TabsTrigger>
                <TabsTrigger value="approved">Patvirtinti</TabsTrigger>
                <TabsTrigger value="rejected">Atmesti</TabsTrigger>
              </TabsList>
            </Tabs>
            
            {isLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-12 w-full bg-muted" />
                ))}
              </div>
            ) : filteredRedemptions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {activeTab === 'all' ? 'Nėra' : activeTab === 'pending' ? 'Nėra laukiamų' : activeTab === 'approved' ? 'Nėra patvirtintų' : 'Nėra atmestų'} iškeitimo užklausų.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-muted/50 border-border">
                      <TableHead className="text-foreground">Data</TableHead>
                      <TableHead className="text-foreground">Prizas</TableHead>
                      <TableHead className="text-foreground text-right">Taškai</TableHead>
                      <TableHead className="text-foreground text-center">Būsena</TableHead>
                      <TableHead className="text-foreground">Komentarai</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRedemptions.map((redemption) => (
                      <TableRow key={redemption.id} className="hover:bg-muted/50 border-border">
                        <TableCell className="font-medium text-foreground">
                          {format(new Date(redemption.requestedAt), 'dd MMM yyyy')}
                        </TableCell>
                        <TableCell className="text-foreground">
                          {redemption.prizeName}
                        </TableCell>
                        <TableCell className="text-right">
                          <span className="point-badge">-{redemption.pointCost}</span>
                        </TableCell>
                        <TableCell className="text-center">
                          {getStatusBadge(redemption.status)}
                        </TableCell>
                        <TableCell className="text-foreground">
                          {redemption.comment || (redemption.status === 'pending' ? 'Laukiama peržiūros' : '')}
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
