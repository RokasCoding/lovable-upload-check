import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/Layout';
import { getPrizes, createRedemption, getUserById } from '@/services/dataService';
import { Prize, User } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

const Prizes: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [prizes, setPrizes] = useState<Prize[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingUserPoints, setIsLoadingUserPoints] = useState(true);
  const [selectedPrize, setSelectedPrize] = useState<Prize | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isAdmin = user?.user_metadata?.role === 'admin';

  useEffect(() => {
    const fetchPrizes = async () => {
      setIsLoading(true);
      try {
        const data = await getPrizes();
        setPrizes(data);
      } catch (error) {
        console.error('Failed to fetch prizes:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPrizes();
  }, []);

  useEffect(() => {
    const fetchUserPoints = async () => {
      if (!user?.id) return;
      
      setIsLoadingUserPoints(true);
      try {
        const userData = await getUserById(user.id);
        setCurrentUser(userData);
      } catch (error) {
        console.error('Failed to fetch user points:', error);
      } finally {
        setIsLoadingUserPoints(false);
      }
    };

    fetchUserPoints();
  }, [user?.id]);

  const userPoints = currentUser?.totalPoints || 0;

  const handlePrizeSelect = (prize: Prize) => {
    if (!user) return;
    
    if (userPoints < prize.points) {
      toast({
        title: "Nepakankamai taškų",
        description: `Jums reikia dar ${prize.points - userPoints} taškų, kad galėtumėte iškeisti šį prizą.`,
        variant: "destructive",
      });
      return;
    }
    
    setSelectedPrize(prize);
    setIsDialogOpen(true);
  };

  const handleRedemption = async () => {
    if (!user || !selectedPrize) return;
    
    setIsSubmitting(true);
    try {
      await createRedemption(user.id, selectedPrize.id);
      
      toast({
        title: "Prašymas išsiųstas",
        description: "Jūsų prizo iškeitimo prašymas sėkmingai užregistruotas. Administratorius jį peržiūrės artimiausiu metu.",
      });
      
      setIsDialogOpen(false);
      
      // Refresh user points after redemption
      try {
        const userData = await getUserById(user.id);
        setCurrentUser(userData);
      } catch (error) {
        console.error('Failed to refresh user points:', error);
      }
    } catch (error: any) {
      toast({
        title: "Klaida",
        description: error.message || "Nepavyko išsiųsti prizo iškeitimo prašymo",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8 bg-[#2D2D35] rounded-lg px-6 py-5">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Galimi prizai</h1>
            <p className="text-muted-foreground mt-1">Iškeiskite savo premijos taškus į šiuos prizus</p>
          </div>
          {!isAdmin && (
            <div className="bg-muted px-4 py-2 rounded-md">
              <span className="text-sm text-foreground">Jūsų taškai:</span>
              {isLoadingUserPoints ? (
                <Skeleton className="ml-2 h-5 w-12 inline-block bg-muted-foreground/20" />
              ) : (
                <span className="ml-2 font-bold text-primary">{userPoints}</span>
              )}
            </div>
          )}
        </div>
        
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="bg-background border-border h-80">
                <CardHeader>
                  <Skeleton className="h-32 w-full bg-muted" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-6 w-3/4 mb-2 bg-muted" />
                  <Skeleton className="h-4 w-full mb-1 bg-muted" />
                  <Skeleton className="h-4 w-2/3 bg-muted" />
                </CardContent>
                <CardFooter>
                  <Skeleton className="h-9 w-full bg-muted" />
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {prizes.map((prize) => (
              <Card key={prize.id} className="h-[420px] flex flex-col justify-between">
                <div>
                  {prize.imageUrl && (
                    <img src={prize.imageUrl} alt={prize.name} className="w-full h-40 object-cover rounded-t mb-2" />
                  )}
                  <div className="px-6 pt-2 pb-0">
                    <CardTitle className="text-lg font-bold mb-1">{prize.name}</CardTitle>
                    <CardDescription className="line-clamp-2 mb-2 min-h-[40px]">{prize.description}</CardDescription>
                    {!isAdmin && (
                      <div className="mb-2">
                        <span className="font-semibold">Taškų kaina: </span>
                        <span className="point-badge">{prize.points}</span>
                      </div>
                    )}
                  </div>
                </div>
                <CardFooter className="flex justify-between items-center min-h-[48px] mt-auto">
                  {!isAdmin ? (
                    <Button
                      onClick={() => {
                        setSelectedPrize(prize);
                        setIsDialogOpen(true);
                      }}
                      disabled={userPoints < prize.points}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Iškeisti prizą
                    </Button>
                  ) : (
                    <div />
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        )}

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="bg-background text-foreground border-border">
            <DialogHeader>
              {!isAdmin && (
                <>
                  <DialogTitle>Patvirtinti prizo iškeitimą</DialogTitle>
                  <DialogDescription className="text-muted-foreground">
                    Ar tikrai norite iškeisti šį prizą? Ši užklausa turės būti patvirtinta administratoriaus.
                  </DialogDescription>
                </>
              )}
            </DialogHeader>
            {selectedPrize && !isAdmin && (
              <div className="space-y-4 py-4">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded overflow-hidden bg-muted">
                    {selectedPrize.imageUrl && (
                      <img 
                        src={selectedPrize.imageUrl} 
                        alt={selectedPrize.name} 
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">{selectedPrize.name}</h3>
                    <p className="text-sm text-muted-foreground">{selectedPrize.description}</p>
                  </div>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-border">
                  <span className="text-sm text-muted-foreground">Kaina:</span>
                  <span className="point-badge">{selectedPrize.points} taškų</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Jūsų likutis po iškeitimo:</span>
                  <span className="font-medium text-primary">
                    {userPoints - selectedPrize.points} taškų
                  </span>
                </div>
              </div>
            )}
            <DialogFooter className="gap-2 sm:gap-0">
              {!isAdmin && (
                <>
                  <Button
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                    className="border-border text-foreground hover:bg-muted"
                  >
                    Atšaukti
                  </Button>
                  <Button 
                    onClick={handleRedemption} 
                    className="bg-primary hover:bg-primary/90 text-primary-foreground"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Apdorojama...' : 'Patvirtinti iškeitimą'}
                  </Button>
                </>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default Prizes;
