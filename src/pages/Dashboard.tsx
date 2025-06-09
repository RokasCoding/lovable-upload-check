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
          <Card className="flex-1 bg-background border-border animate-fade-in">
            <CardHeader>
              <CardTitle className="text-foreground">Jūsų premijos taškai</CardTitle>
              <CardDescription>Dabartinis likutis ir suvestinė</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center flex-col">
                <div className="text-5xl font-bold text-primary mb-2">
                  {isLoading ? (
                    <Skeleton className="h-12 w-24 bg-muted" />
                  ) : (
                    currentUser?.totalPoints
                  )}
                </div>
                <div className="text-sm text-muted-foreground">Iš viso turimų taškų</div>
              </div>
            </CardContent>
            <CardFooter className="border-t border-border flex justify-between">
              <div className="text-sm text-muted-foreground">
                <span className="font-medium">
                  {isLoading ? (
                    <Skeleton className="h-5 w-16 inline-block bg-muted" />
                  ) : (
                    bonusEntries.length
                  )}
                </span>{" "}
                baigti kursai
              </div>
              <div className="text-sm text-muted-foreground">
                <span className="font-medium">
                  {isLoading ? (
                    <Skeleton className="h-5 w-16 inline-block bg-muted" />
                  ) : (
                    totalPoints
                  )}
                </span>{" "}
                uždirbti taškai
              </div>
            </CardFooter>
          </Card>

          {/* Quick actions card */}
          <Card className="flex-1 bg-background border-border animate-fade-in">
            <CardHeader>
              <CardTitle className="text-foreground">Greiti veiksmai</CardTitle>
              <CardDescription>Ką galite padaryti</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <div 
                className="bg-muted p-4 rounded-md flex items-center hover:bg-primary/10 cursor-pointer transition-colors"
                onClick={() => navigate('/prizes')}
              >
                <div className="mr-4 p-2 rounded-full bg-primary/10">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M12 2v20M2 12h20"></path></svg>
                </div>
                <div>
                  <h3 className="font-medium text-foreground">Iškeisti taškus</h3>
                  <p className="text-sm text-muted-foreground">Pakeiskite savo taškus į prizus</p>
                </div>
              </div>
              
              <div 
                className="bg-muted p-4 rounded-md flex items-center hover:bg-primary/10 cursor-pointer transition-colors"
                onClick={() => navigate('/history')}
              >
                <div className="mr-4 p-2 rounded-full bg-primary/10">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                </div>
                <div>
                  <h3 className="font-medium text-foreground">Peržiūrėti istoriją</h3>
                  <p className="text-sm text-muted-foreground">Žiūrėkite savo iškeitimų istoriją</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bonus entries table */}
        <Card className="bg-background border-border animate-fade-in">
          <CardHeader>
            <CardTitle className="text-foreground">Premijos taškų operacijos</CardTitle>
            <CardDescription>Jūsų baigti kursai ir uždirbti taškai</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-12 w-full bg-muted" />
                ))}
              </div>
            ) : bonusEntries.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Kol kas nėra premijos taškų įrašų.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-muted/50 border-border">
                      <TableHead className="text-foreground">Data</TableHead>
                      <TableHead className="text-foreground">Kursas</TableHead>
                      <TableHead className="text-foreground text-right">Kurso kaina</TableHead>
                      <TableHead className="text-foreground text-right">Uždirbti taškai</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bonusEntries.map((entry) => (
                      <TableRow key={entry.id} className="hover:bg-muted/50 border-border">
                        <TableCell className="font-medium text-foreground">
                          {format(new Date(entry.createdAt), 'dd MMM yyyy')}
                        </TableCell>
                        <TableCell className="text-foreground">
                          {entry.courseName}
                        </TableCell>
                        <TableCell className="text-right text-foreground">
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
