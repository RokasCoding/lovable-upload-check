import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/Layout';
import { getPrizes, requestRedemption } from '@/services/dataService';
import { Prize } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

const Prizes: React.FC = () => {
  const { currentUser, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [prizes, setPrizes] = useState<Prize[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPrize, setSelectedPrize] = useState<Prize | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

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
  }, [isAuthenticated, navigate]);

  const handlePrizeSelect = (prize: Prize) => {
    if (!currentUser) return;
    
    if (currentUser.totalPoints < prize.pointCost) {
      toast({
        title: "Nepakankamai taškų",
        description: `Jums reikia dar ${prize.pointCost - currentUser.totalPoints} taškų, kad galėtumėte iškeisti šį prizą.`,
        variant: "destructive",
      });
      return;
    }
    
    setSelectedPrize(prize);
    setIsDialogOpen(true);
  };

  const handleRedeemPrize = async () => {
    if (!currentUser || !selectedPrize) return;
    
    setIsSubmitting(true);
    
    try {
      await requestRedemption({
        userId: currentUser.id,
        userName: currentUser.name,
        prizeId: selectedPrize.id,
        prizeName: selectedPrize.name,
        pointCost: selectedPrize.pointCost,
      });
      
      toast({
        title: "Užklausa pateikta",
        description: "Jūsų prizo iškeitimo užklausa pateikta patvirtinimui.",
      });
      
      setIsDialogOpen(false);
      
      // Update user's points client-side for immediate feedback
      currentUser.totalPoints -= selectedPrize.pointCost;
    } catch (error: any) {
      console.error('Failed to redeem prize:', error);
      toast({
        title: "Klaida",
        description: error.message || "Nepavyko apdoroti jūsų užklausos. Bandykite dar kartą.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Galimi prizai</h1>
            <p className="text-muted-foreground mt-1">Iškeiskite savo premijos taškus į šiuos prizus</p>
          </div>
          <div className="bg-muted px-4 py-2 rounded-md">
            <span className="text-sm text-foreground">Jūsų taškai:</span>
            <span className="ml-2 font-bold text-primary">{currentUser?.totalPoints || 0}</span>
          </div>
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
            {prizes.map((prize) => {
              const canAfford = currentUser?.totalPoints && currentUser.totalPoints >= prize.pointCost;
              
              return (
                <Card 
                  key={prize.id} 
                  className={`bg-background border-border hover-scale ${!canAfford ? 'opacity-70' : ''}`}
                >
                  <CardHeader>
                    <div className="h-32 w-full overflow-hidden rounded-md mb-2 flex items-center justify-center bg-muted">
                      {prize.imageUrl ? (
                        <img 
                          src={prize.imageUrl} 
                          alt={prize.name} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full w-full bg-muted text-muted-foreground">
                          Nėra nuotraukos
                        </div>
                      )}
                    </div>
                    <CardTitle className="text-foreground">{prize.name}</CardTitle>
                    <CardDescription className="text-muted-foreground">{prize.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-muted-foreground">Taškų kaina:</div>
                      <div className="point-badge">{prize.pointCost} taškų</div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      className={`w-full ${canAfford ? 'bg-primary hover:bg-primary/90 text-primary-foreground' : 'bg-muted text-muted-foreground cursor-not-allowed'}`}
                      onClick={() => canAfford && handlePrizeSelect(prize)}
                      disabled={!canAfford}
                    >
                      {canAfford ? 'Iškeisti prizą' : 'Nepakankamai taškų'}
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="bg-background text-foreground border-border">
            <DialogHeader>
              <DialogTitle>Patvirtinti prizo iškeitimą</DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Ar tikrai norite iškeisti šį prizą? Ši užklausa turės būti patvirtinta administratoriaus.
              </DialogDescription>
            </DialogHeader>
            
            {selectedPrize && (
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
                  <span className="point-badge">{selectedPrize.pointCost} taškų</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Jūsų likutis po iškeitimo:</span>
                  <span className="font-medium text-primary">
                    {currentUser ? currentUser.totalPoints - selectedPrize.pointCost : 0} taškų
                  </span>
                </div>
              </div>
            )}
            
            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                className="border-border text-foreground hover:bg-muted"
              >
                Atšaukti
              </Button>
              <Button 
                onClick={handleRedeemPrize} 
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Apdorojama...' : 'Patvirtinti iškeitimą'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default Prizes;
