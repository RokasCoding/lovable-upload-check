
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getBonusEntries } from '@/services/dataService';
import { BonusEntry } from '@/types';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

const Dashboard: React.FC = () => {
  const { currentUser, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [bonusEntries, setBonusEntries] = useState<BonusEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const fetchBonusEntries = async () => {
      setIsLoading(true);
      try {
        if (currentUser) {
          const entries = await getBonusEntries(currentUser.id);
          setBonusEntries(entries);
        }
      } catch (error) {
        console.error('Failed to fetch bonus entries:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBonusEntries();
  }, [currentUser?.id, isAuthenticated, navigate]);

  const totalPoints = bonusEntries.reduce(
    (sum, entry) => sum + entry.pointsAwarded,
    0
  );

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-6 mb-8">
          {/* Points summary card */}
          <Card className="flex-1 bg-vcs-dark border-vcs-gray animate-fade-in">
            <CardHeader>
              <CardTitle className="text-white">Your Bonus Points</CardTitle>
              <CardDescription>Current balance and summary</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center flex-col">
                <div className="text-5xl font-bold text-vcs-green mb-2">
                  {isLoading ? (
                    <Skeleton className="h-12 w-24 bg-vcs-gray" />
                  ) : (
                    currentUser?.totalPoints
                  )}
                </div>
                <div className="text-sm text-gray-400">Total Available Points</div>
              </div>
            </CardContent>
            <CardFooter className="border-t border-gray-700 flex justify-between">
              <div className="text-sm text-gray-400">
                <span className="font-medium">
                  {isLoading ? (
                    <Skeleton className="h-5 w-16 inline-block bg-vcs-gray" />
                  ) : (
                    bonusEntries.length
                  )}
                </span>{" "}
                courses completed
              </div>
              <div className="text-sm text-gray-400">
                <span className="font-medium">
                  {isLoading ? (
                    <Skeleton className="h-5 w-16 inline-block bg-vcs-gray" />
                  ) : (
                    totalPoints
                  )}
                </span>{" "}
                points earned
              </div>
            </CardFooter>
          </Card>

          {/* Quick actions card */}
          <Card className="flex-1 bg-vcs-dark border-vcs-gray animate-fade-in">
            <CardHeader>
              <CardTitle className="text-white">Quick Actions</CardTitle>
              <CardDescription>Things you can do</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <div 
                className="bg-vcs-gray p-4 rounded-md flex items-center hover:bg-vcs-green/20 cursor-pointer transition-colors"
                onClick={() => navigate('/prizes')}
              >
                <div className="mr-4 p-2 rounded-full bg-vcs-green/20">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-vcs-green"><path d="M12 2v20M2 12h20"></path></svg>
                </div>
                <div>
                  <h3 className="font-medium text-white">Redeem Points</h3>
                  <p className="text-sm text-gray-400">Exchange your points for rewards</p>
                </div>
              </div>
              
              <div 
                className="bg-vcs-gray p-4 rounded-md flex items-center hover:bg-vcs-green/20 cursor-pointer transition-colors"
                onClick={() => navigate('/history')}
              >
                <div className="mr-4 p-2 rounded-full bg-vcs-green/20">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-vcs-green"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                </div>
                <div>
                  <h3 className="font-medium text-white">View History</h3>
                  <p className="text-sm text-gray-400">See your redemption history</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bonus entries table */}
        <Card className="bg-vcs-dark border-vcs-gray animate-fade-in">
          <CardHeader>
            <CardTitle className="text-white">Bonus Points Transactions</CardTitle>
            <CardDescription>Your course completions and earned points</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-12 w-full bg-vcs-gray" />
                ))}
              </div>
            ) : bonusEntries.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                No bonus points entries yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-vcs-gray/50 border-gray-700">
                      <TableHead className="text-gray-300">Date</TableHead>
                      <TableHead className="text-gray-300">Course</TableHead>
                      <TableHead className="text-gray-300 text-right">Course Price</TableHead>
                      <TableHead className="text-gray-300 text-right">Points Earned</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bonusEntries.map((entry) => (
                      <TableRow key={entry.id} className="hover:bg-vcs-gray/50 border-gray-700">
                        <TableCell className="font-medium text-gray-300">
                          {format(new Date(entry.createdAt), 'dd MMM yyyy')}
                        </TableCell>
                        <TableCell className="text-gray-300">
                          {entry.courseName}
                        </TableCell>
                        <TableCell className="text-right text-gray-300">
                          €{entry.price}
                        </TableCell>
                        <TableCell className="text-right">
                          <span className="point-badge">+{entry.pointsAwarded}</span>
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

export default Dashboard;
