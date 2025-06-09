
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
        title: "Not enough points",
        description: `You need ${prize.pointCost - currentUser.totalPoints} more points to redeem this prize.`,
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
        title: "Redemption requested",
        description: "Your prize redemption request has been submitted for approval.",
      });
      
      setIsDialogOpen(false);
      
      // Update user's points client-side for immediate feedback
      currentUser.totalPoints -= selectedPrize.pointCost;
    } catch (error: any) {
      console.error('Failed to redeem prize:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to process your redemption request. Please try again.",
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
            <h1 className="text-3xl font-bold text-white">Available Prizes</h1>
            <p className="text-gray-400 mt-1">Exchange your bonus points for these rewards</p>
          </div>
          <div className="bg-vcs-gray px-4 py-2 rounded-md">
            <span className="text-sm text-gray-300">Your Points:</span>
            <span className="ml-2 font-bold text-vcs-green">{currentUser?.totalPoints || 0}</span>
          </div>
        </div>
        
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="bg-vcs-dark border-vcs-gray h-80">
                <CardHeader>
                  <Skeleton className="h-32 w-full bg-vcs-gray" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-6 w-3/4 mb-2 bg-vcs-gray" />
                  <Skeleton className="h-4 w-full mb-1 bg-vcs-gray" />
                  <Skeleton className="h-4 w-2/3 bg-vcs-gray" />
                </CardContent>
                <CardFooter>
                  <Skeleton className="h-9 w-full bg-vcs-gray" />
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
                  className={`bg-vcs-dark border-vcs-gray hover-scale ${!canAfford ? 'opacity-70' : ''}`}
                >
                  <CardHeader>
                    <div className="h-32 w-full overflow-hidden rounded-md mb-2 flex items-center justify-center bg-vcs-gray">
                      {prize.imageUrl ? (
                        <img 
                          src={prize.imageUrl} 
                          alt={prize.name} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full w-full bg-vcs-gray text-gray-400">
                          No Image
                        </div>
                      )}
                    </div>
                    <CardTitle className="text-white">{prize.name}</CardTitle>
                    <CardDescription>{prize.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-gray-400">Point cost:</div>
                      <div className="point-badge">{prize.pointCost} points</div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      className={`w-full ${canAfford ? 'bg-vcs-green hover:bg-vcs-green/90' : 'bg-gray-600 cursor-not-allowed'}`}
                      onClick={() => canAfford && handlePrizeSelect(prize)}
                      disabled={!canAfford}
                    >
                      {canAfford ? 'Redeem Prize' : 'Not Enough Points'}
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="bg-vcs-dark text-white border-vcs-gray">
            <DialogHeader>
              <DialogTitle>Confirm Prize Redemption</DialogTitle>
              <DialogDescription>
                Are you sure you want to redeem this prize? This request will need to be approved by an administrator.
              </DialogDescription>
            </DialogHeader>
            
            {selectedPrize && (
              <div className="space-y-4 py-4">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded overflow-hidden bg-vcs-gray">
                    {selectedPrize.imageUrl && (
                      <img 
                        src={selectedPrize.imageUrl} 
                        alt={selectedPrize.name} 
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{selectedPrize.name}</h3>
                    <p className="text-sm text-gray-400">{selectedPrize.description}</p>
                  </div>
                </div>
                
                <div className="flex justify-between items-center pt-2 border-t border-gray-700">
                  <span className="text-sm text-gray-400">Cost:</span>
                  <span className="point-badge">{selectedPrize.pointCost} points</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Your balance after redemption:</span>
                  <span className="font-medium text-vcs-green">
                    {currentUser ? currentUser.totalPoints - selectedPrize.pointCost : 0} points
                  </span>
                </div>
              </div>
            )}
            
            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                className="border-gray-600 text-white hover:bg-gray-700"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleRedeemPrize} 
                className="bg-vcs-green hover:bg-vcs-green/90"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Processing...' : 'Confirm Redemption'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default Prizes;
