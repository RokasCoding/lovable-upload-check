import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/Layout';
import { 
  getUsers, 
  getPrizes, 
  getRedemptions,
  getStats,
  createBonusEntry,
  inviteUser,
  createPrize,
  processRedemption,
  deductPoints,
  getUserPointHistory,
  createRegistrationLink,
  deleteUser,
  getAllPrizes
} from '@/services/dataService';
import { User, Prize, PrizeRedemption, Stats, BonusEntry } from '@/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { UserPlus, Award, Link2, MinusCircle, History } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableCell, TableRow, TableHead } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';

// Import the new components
import { AdminStats } from '@/components/admin/AdminStats';
import { AdminNewMembers } from '@/components/admin/AdminNewMembers';
import { AdminUsers } from '@/components/admin/AdminUsers';
import { AdminPrizes } from '@/components/admin/AdminPrizes';
import { AdminRedemptions } from '@/components/admin/AdminRedemptions';
import { AdminDialogs } from '@/components/admin/AdminDialogs';
import { AdminSettings } from '@/components/admin/AdminSettings';

interface RegistrationLink {
  id: string;
  created_at: string;
  created_by: string;
  link_token: string;
  is_active: boolean;
  used_at: string | null;
  used_by: string | null;
}

const Admin: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [prizes, setPrizes] = useState<Prize[]>([]);
  const [redemptions, setRedemptions] = useState<PrizeRedemption[]>([]);
  const [registrationLinks, setRegistrationLinks] = useState<RegistrationLink[]>([]);
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);

  // Dialog states
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [newPrizeDialogOpen, setNewPrizeDialogOpen] = useState(false);
  const [newBonusDialogOpen, setNewBonusDialogOpen] = useState(false);
  const [redemptionDialogOpen, setRedemptionDialogOpen] = useState(false);
  const [linkGeneratorOpen, setLinkGeneratorOpen] = useState(false);
  const [selectedRedemption, setSelectedRedemption] = useState<PrizeRedemption | null>(null);

  // Form states
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'user' | 'admin'>('user');
  
  const [prizeName, setPrizeName] = useState('');
  const [prizeDescription, setPrizeDescription] = useState('');
  const [prizePoints, setPrizePoints] = useState('');
  const [prizeImage, setPrizeImage] = useState('');
  
  const [bonusUserId, setBonusUserId] = useState('');
  const [bonusCourseName, setBonusCourseName] = useState('');
  const [bonusCoursePrice, setBonusCoursePrice] = useState('');
  const [bonusPointsAwarded, setBonusPointsAwarded] = useState('');
  
  const [rejectionComment, setRejectionComment] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Link generator states
  const [linkType, setLinkType] = useState<'no-points' | 'with-points'>('no-points');
  const [linkPoints, setLinkPoints] = useState('');
  const [generatedLink, setGeneratedLink] = useState('');
  const [linkCopied, setLinkCopied] = useState(false);

  // New state variables for point deduction
  const [deductPointsDialogOpen, setDeductPointsDialogOpen] = useState(false);
  const [selectedUserForDeduction, setSelectedUserForDeduction] = useState<User | null>(null);
  const [pointsToDeduct, setPointsToDeduct] = useState('');
  const [deductionReason, setDeductionReason] = useState('');

  // New state variables for point history
  const [pointHistoryDialogOpen, setPointHistoryDialogOpen] = useState(false);
  const [selectedUserForHistory, setSelectedUserForHistory] = useState<User | null>(null);
  const [pointHistory, setPointHistory] = useState<BonusEntry[]>([]);

  // New state variables for user deletion
  const [deleteUserDialogOpen, setDeleteUserDialogOpen] = useState(false);
  const [selectedUserForDeletion, setSelectedUserForDeletion] = useState<User | null>(null);

  const isAdmin = user?.user_metadata.role === 'admin';

  useEffect(() => {
    if (!isAdmin) {
      navigate('/dashboard');
      return;
    }
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [statsData, usersData, prizesData, redemptionsData] = await Promise.all([
          getStats(),
          getUsers(),
          getAllPrizes(),
          getRedemptions(),
        ]);
        
        setStats(statsData);
        setUsers(usersData);
        setPrizes(prizesData);
        setRedemptions(redemptionsData);
      } catch (error) {
        console.error('Failed to fetch admin data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [isAdmin, navigate]);

  useEffect(() => {
    const fetchRegistrationLinks = async () => {
      const { data, error } = await supabase
        .from('registration_links')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        toast({
          title: 'Klaida',
          description: 'Nepavyko gauti registracijos nuorodų',
          variant: 'destructive',
        });
        return;
      }

      setRegistrationLinks(data);
    };

    fetchRegistrationLinks();
  }, [toast]);

  const handleInviteUser = async () => {
    if (!inviteName.trim() || !inviteEmail.trim()) {
      toast({
        title: "Klaida",
        description: "Prašome užpildyti visus privalomus laukus",
        variant: "destructive",
      });
      return;
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(inviteEmail)) {
      toast({
        title: "Klaida",
        description: "Neteisingas el. pašto formato",
        variant: "destructive",
      });
      return;
    }
    
    setIsProcessing(true);
    try {
      const success = await inviteUser(inviteEmail, inviteName, inviteRole);
      if (success) {
        toast({
          title: "Sėkmė",
          description: `Pakvietimas išsiųstas adresu ${inviteEmail}`,
        });
        setInviteDialogOpen(false);
        setInviteName('');
        setInviteEmail('');
        setInviteRole('user');
      }
    } catch (error: any) {
      console.error('Nepavyko pakviesti naudotojo:', error);
      toast({
        title: "Klaida",
        description: error.message || "Nepavyko išsiųsti pakvietimo",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCreatePrize = async () => {
    if (!prizeName.trim() || !prizeDescription.trim()) {
      toast({
        title: "Klaida",
        description: "Pavadinimas ir aprašymas negali būti tušti",
        variant: "destructive",
      });
      return;
    }
    
    setIsProcessing(true);
    try {
      const points = parseInt(prizePoints);
      if (isNaN(points) || points <= 0) {
        throw new Error('Taškų kaina turi būti teigiamas skaičius');
      }
      
      await createPrize({
        name: prizeName,
        description: prizeDescription,
        points: points,
        imageUrl: prizeImage,
        isActive: true,
      });
      
      toast({
        title: 'Prizas sukurtas',
        description: `Prizas "${prizeName}" sėkmingai sukurtas`,
      });
      
      // Reset form and close dialog
      setPrizeName('');
      setPrizeDescription('');
      setPrizePoints('');
      setPrizeImage('');
      setNewPrizeDialogOpen(false);
      
      // Refresh prizes list
      const refreshedPrizes = await getAllPrizes();
      setPrizes(refreshedPrizes);
    } catch (error: any) {
      toast({
        title: 'Klaida',
        description: error.message || 'Nepavyko sukurti prizo',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAddBonus = async () => {
    if (!bonusUserId || !bonusCourseName || !bonusCoursePrice || !bonusPointsAwarded) {
      toast({
        title: "Klaida",
        description: "Prašome užpildyti visus privalomus laukus",
        variant: "destructive",
      });
      return;
    }
    
    const price = parseFloat(bonusCoursePrice);
    const points = parseInt(bonusPointsAwarded);
    
    if (isNaN(price) || price <= 0 || isNaN(points) || points <= 0) {
      toast({
        title: "Klaida",
        description: "Kaina ir taškai turi būti teigiami skaičiai",
        variant: "destructive",
      });
      return;
    }
    
    setIsProcessing(true);
    try {
      const selectedUser = users.find(u => u.id === bonusUserId);
      if (!selectedUser) throw new Error("Naudotojas nerastas");
      
      await createBonusEntry({
        userId: bonusUserId,
        userName: selectedUser.name,
        courseName: bonusCourseName,
        price,
        pointsAwarded: points,
      });
      
      toast({
        title: "Sėkmė",
        description: "Bonus taškai sėkmingai pridėti",
      });
      
      // Refresh users list for updated points
      const updatedUsers = await getUsers();
      setUsers(updatedUsers);
      
      // Refresh stats
      const updatedStats = await getStats();
      setStats(updatedStats);
      
      setNewBonusDialogOpen(false);
      setBonusUserId('');
      setBonusCourseName('');
      setBonusCoursePrice('');
      setBonusPointsAwarded('');
    } catch (error) {
      console.error('Nepavyko pridėti bonus taškų:', error);
      toast({
        title: "Klaida",
        description: "Nepavyko pridėti bonus taškų",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRedemptionAction = async (action: 'approved' | 'rejected') => {
    if (!selectedRedemption) return;
    
    setIsProcessing(true);
    try {
      await processRedemption(
        selectedRedemption.id, 
        action, 
        action === 'rejected' ? rejectionComment : undefined
      );
      
      // Update user points if approved
      if (action === 'approved') {
        const user = users.find(u => u.id === selectedRedemption.userId);
        if (user) {
          await deductPoints(
            selectedRedemption.userId, 
            selectedRedemption.pointCost, 
            `Iškeistas prizas: ${selectedRedemption.prizeName}`
          );
        }
      }
      
      toast({
        title: action === 'approved' ? 'Prašymas patvirtintas' : 'Prašymas atmestas',
        description: action === 'approved' 
          ? `Prizo "${selectedRedemption.prizeName}" iškeitimas patvirtintas` 
          : `Prizo "${selectedRedemption.prizeName}" iškeitimas atmestas`,
      });
      
      // Refresh redemptions list
      const updatedRedemptions = await getRedemptions();
      setRedemptions(updatedRedemptions);
      
      // Close dialog
      setRedemptionDialogOpen(false);
      setRejectionComment('');
    } catch (error: any) {
      toast({
        title: 'Klaida',
        description: error.message || 'Nepavyko apdoroti prašymo',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleViewRedemption = (redemption: PrizeRedemption) => {
    setSelectedRedemption(redemption);
    setRedemptionDialogOpen(true);
  };

  const handleRedemptionQuickAction = (redemption: PrizeRedemption, action: 'approved' | 'rejected') => {
    setSelectedRedemption(redemption);
    if (action === 'approved') {
      handleRedemptionAction('approved');
    } else {
      setRedemptionDialogOpen(true);
    }
  };

  const generateRegistrationLink = async () => {
    setIsGeneratingLink(true);
    try {
      if (!user) throw new Error('User not authenticated');
      
      const data = await createRegistrationLink(user.id);
      setRegistrationLinks(prev => [data, ...prev]);
      
      // Copy link to clipboard
      const link = `${window.location.origin}/register?token=${data.link_token}`;
      await navigator.clipboard.writeText(link);

      toast({
        title: 'Nuoroda sugeneruota',
        description: 'Registracijos nuoroda nukopijuota į iškarpinę',
      });
    } catch (error: any) {
      toast({
        title: 'Klaida',
        description: error.message || 'Nepavyko sugeneruoti nuorodos',
        variant: 'destructive',
      });
    } finally {
      setIsGeneratingLink(false);
    }
  };

  const deactivateRegistrationLink = async (linkId: string) => {
    try {
      const { error } = await supabase
        .from('registration_links')
        .update({ is_active: false })
        .eq('id', linkId);

      if (error) throw error;

      setRegistrationLinks(prev =>
        prev.map(link =>
          link.id === linkId ? { ...link, is_active: false } : link
        )
      );

      toast({
        title: 'Nuoroda deaktyvuota',
        description: 'Registracijos nuoroda sėkmingai deaktyvuota',
      });
    } catch (error: any) {
      toast({
        title: 'Klaida',
        description: error.message || 'Nepavyko deaktyvuoti nuorodos',
        variant: 'destructive',
      });
    }
  };

  const handleDeductPoints = async () => {
    if (!selectedUserForDeduction || !pointsToDeduct || !deductionReason) {
      toast({
        title: "Klaida",
        description: "Prašome užpildyti visus privalomus laukus",
        variant: "destructive",
      });
      return;
    }

    const points = parseInt(pointsToDeduct);
    if (isNaN(points) || points <= 0) {
      toast({
        title: "Klaida",
        description: "Taškai turi būti teigiamas skaičius",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      await deductPoints(selectedUserForDeduction.id, points, deductionReason);
      
      toast({
        title: "Sėkmė",
        description: `Taškai sėkmingai atimti iš ${selectedUserForDeduction.name}`,
      });

      // Refresh users list
      const updatedUsers = await getUsers();
      setUsers(updatedUsers);

      setDeductPointsDialogOpen(false);
      setSelectedUserForDeduction(null);
      setPointsToDeduct('');
      setDeductionReason('');
    } catch (error) {
      console.error('Nepavyko atimti taškų:', error);
      toast({
        title: "Klaida",
        description: error instanceof Error ? error.message : "Nepavyko atimti taškų",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleViewPointHistory = async (user: User) => {
    setSelectedUserForHistory(user);
    setPointHistoryDialogOpen(true);
    
    try {
      const history = await getUserPointHistory(user.id);
      setPointHistory(history);
    } catch (error) {
      console.error('Nepavyko gauti taškų istorijos:', error);
      toast({
        title: "Klaida",
        description: "Nepavyko gauti taškų istorijos",
        variant: "destructive",
      });
    }
  };

  const handleDeleteUser = (user: User) => {
    setSelectedUserForDeletion(user);
    setDeleteUserDialogOpen(true);
  };

  const confirmDeleteUser = async () => {
    if (!selectedUserForDeletion) return;
    
    setIsProcessing(true);
    try {
      await deleteUser(selectedUserForDeletion.id);
      
      toast({
        title: "Sėkmė",
        description: `Naudotojas ${selectedUserForDeletion.name} sėkmingai ištrintas`,
      });
      
      // Refresh users list
      const updatedUsers = await getUsers();
      setUsers(updatedUsers);
      
      // Refresh stats
      const updatedStats = await getStats();
      setStats(updatedStats);
      
      setDeleteUserDialogOpen(false);
      setSelectedUserForDeletion(null);
    } catch (error) {
      console.error('Nepavyko ištrinti naudotojo:', error);
      toast({
        title: "Klaida",
        description: "Nepavyko ištrinti naudotojo",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBonusDialogClose = () => {
    setBonusUserId('');
    setBonusCourseName('');
    setBonusCoursePrice('');
    setBonusPointsAwarded('');
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 bg-white min-h-screen">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-black">Administratoriaus Panelė</h1>
          <div className="flex gap-3">
            <Button 
              onClick={() => setInviteDialogOpen(true)}
              className="bg-vcs-blue hover:bg-vcs-blue/90"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Pakviesti Naudotoją
            </Button>
            <Button 
              onClick={() => setLinkGeneratorOpen(true)}
              variant="outline" 
              className="border-vcs-blue text-vcs-blue hover:bg-vcs-blue hover:text-white"
            >
              <Link2 className="h-4 w-4 mr-2" />
              Generuoti Nuorodą
            </Button>
            <Button 
              onClick={() => setNewBonusDialogOpen(true)}
              variant="outline" 
              className="border-vcs-blue text-vcs-blue hover:bg-vcs-blue hover:text-white"
            >
              <Award className="h-4 w-4 mr-2" />
              Pridėti Taškų
            </Button>
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-gray-100">
            <TabsTrigger value="dashboard">Pagrindinis</TabsTrigger>
            <TabsTrigger value="new-members">Nauji Nariai</TabsTrigger>
            <TabsTrigger value="users">Naudotojai</TabsTrigger>
            <TabsTrigger value="prizes">Prizai</TabsTrigger>
            <TabsTrigger value="redemptions">Iškeičiami Prizai</TabsTrigger>
            <TabsTrigger value="registration-links">Registracijos nuorodos</TabsTrigger>
            <TabsTrigger value="settings">Nustatymai</TabsTrigger>
          </TabsList>
          
          <TabsContent value="dashboard">
            <AdminStats stats={stats} isLoading={isLoading} />
          </TabsContent>
          
          <TabsContent value="new-members">
            <AdminNewMembers 
              users={users} 
              isLoading={isLoading} 
            />
          </TabsContent>
          
          <TabsContent value="users">
            <AdminUsers
              users={users}
              isLoading={isLoading}
              onInviteUser={() => setInviteDialogOpen(true)}
              onAddBonus={(userId) => {
                setBonusUserId(userId);
                setNewBonusDialogOpen(true);
              }}
              onDeductPoints={(user) => {
                setSelectedUserForDeduction(user);
                setDeductPointsDialogOpen(true);
              }}
              onViewHistory={(user) => handleViewPointHistory(user)}
              onDeleteUser={(user) => handleDeleteUser(user)}
            />
          </TabsContent>
          
          <TabsContent value="prizes">
            <AdminPrizes 
              prizes={prizes} 
              isLoading={isLoading} 
              onCreatePrize={() => setNewPrizeDialogOpen(true)}
              onRefreshPrizes={async () => {
                try {
                  const prizesData = await getAllPrizes();
                  setPrizes(prizesData);
                } catch (error) {
                  console.error('Failed to refresh prizes:', error);
                }
              }}
            />
          </TabsContent>
          
          <TabsContent value="redemptions">
            <AdminRedemptions 
              redemptions={redemptions} 
              isLoading={isLoading} 
              onViewRedemption={handleViewRedemption}
              onRedemptionAction={handleRedemptionQuickAction}
            />
          </TabsContent>
          
          <TabsContent value="registration-links">
            <Card>
              <CardHeader>
                <CardTitle>Registracijos nuorodos</CardTitle>
                <CardDescription>
                  Valdykite registracijos nuorodas naujiems naudotojams
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Sukurta</TableHead>
                          <TableHead>Nuoroda</TableHead>
                          <TableHead>Būsena</TableHead>
                          <TableHead>Panaudota</TableHead>
                          <TableHead>Veiksmai</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {registrationLinks.map((link) => (
                          <TableRow key={link.id}>
                            <TableCell>
                              {new Date(link.created_at).toLocaleString('lt-LT')}
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                className="h-auto p-0 font-mono"
                                onClick={() => {
                                  const url = `${window.location.origin}/register?token=${link.link_token}`;
                                  navigator.clipboard.writeText(url);
                                  toast({
                                    title: 'Nukopijuota',
                                    description: 'Nuoroda nukopijuota į iškarpinę',
                                  });
                                }}
                              >
                                {link.link_token}
                              </Button>
                            </TableCell>
                            <TableCell>
                              <Badge variant={link.is_active ? 'default' : 'secondary'}>
                                {link.is_active ? 'Aktyvi' : 'Neaktyvi'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {link.used_at ? (
                                new Date(link.used_at).toLocaleString('lt-LT')
                              ) : (
                                'Nepanaudota'
                              )}
                            </TableCell>
                            <TableCell>
                              {link.is_active && !link.used_at && (
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => deactivateRegistrationLink(link.id)}
                                >
                                  Deaktyvuoti
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="settings">
            <AdminSettings />
          </TabsContent>
        </Tabs>
      </div>

      <AdminDialogs
        inviteDialogOpen={inviteDialogOpen}
        setInviteDialogOpen={setInviteDialogOpen}
        inviteName={inviteName}
        setInviteName={setInviteName}
        inviteEmail={inviteEmail}
        setInviteEmail={setInviteEmail}
        inviteRole={inviteRole}
        setInviteRole={setInviteRole}
        onInviteUser={handleInviteUser}

        newPrizeDialogOpen={newPrizeDialogOpen}
        setNewPrizeDialogOpen={setNewPrizeDialogOpen}
        prizeName={prizeName}
        setPrizeName={setPrizeName}
        prizeDescription={prizeDescription}
        setPrizeDescription={setPrizeDescription}
        prizePoints={prizePoints}
        setPrizePoints={setPrizePoints}
        prizeImage={prizeImage}
        setPrizeImage={setPrizeImage}
        onCreatePrize={handleCreatePrize}

        newBonusDialogOpen={newBonusDialogOpen}
        setNewBonusDialogOpen={setNewBonusDialogOpen}
        bonusUserId={bonusUserId}
        setBonusUserId={setBonusUserId}
        bonusCourseName={bonusCourseName}
        setBonusCourseName={setBonusCourseName}
        bonusCoursePrice={bonusCoursePrice}
        setBonusCoursePrice={setBonusCoursePrice}
        bonusPointsAwarded={bonusPointsAwarded}
        setBonusPointsAwarded={setBonusPointsAwarded}
        users={users}
        onAddBonus={handleAddBonus}
        onBonusDialogClose={handleBonusDialogClose}

        redemptionDialogOpen={redemptionDialogOpen}
        setRedemptionDialogOpen={setRedemptionDialogOpen}
        selectedRedemption={selectedRedemption}
        rejectionComment={rejectionComment}
        setRejectionComment={setRejectionComment}
        onRedemptionAction={handleRedemptionAction}

        linkGeneratorOpen={linkGeneratorOpen}
        setLinkGeneratorOpen={setLinkGeneratorOpen}
        linkType={linkType}
        setLinkType={setLinkType}
        linkPoints={linkPoints}
        setLinkPoints={setLinkPoints}
        generatedLink={generatedLink}
        linkCopied={linkCopied}
        onGenerateLink={generateRegistrationLink}
        onCopyLink={() => {}}

        isProcessing={isProcessing}
      />

      {/* New Point Deduction Dialog */}
      <Dialog open={deductPointsDialogOpen} onOpenChange={setDeductPointsDialogOpen}>
        <DialogContent className="bg-white text-black border-gray-300">
          <DialogHeader>
            <DialogTitle>Atimti Bonus Taškų</DialogTitle>
            <DialogDescription>
              Atimkite bonus taškus iš naudotojo už pažeidimus ar kitas priežastis.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* Show selected user info */}
            {selectedUserForDeduction && (
              <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                <h4 className="font-medium text-red-900 mb-1">Pasirinktas naudotojas:</h4>
                <p className="text-red-800 font-semibold">{selectedUserForDeduction.name}</p>
                <p className="text-sm text-red-600">
                  Dabartiniai taškai: {selectedUserForDeduction.totalPoints || 0}
                </p>
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="deduct-points">Atimamų Taškų Kiekis</Label>
              <Input
                id="deduct-points"
                type="number"
                value={pointsToDeduct}
                onChange={(e) => setPointsToDeduct(e.target.value)}
                placeholder="50"
                className="bg-gray-50 text-black border-gray-300"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="deduct-reason">Priežastis</Label>
              <Textarea
                id="deduct-reason"
                value={deductionReason}
                onChange={(e) => setDeductionReason(e.target.value)}
                placeholder="Pažeidė taisykles arba netinkamas elgesys"
                className="bg-gray-50 text-black border-gray-300"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeductPointsDialogOpen(false)}
              disabled={isProcessing}
              className="border-gray-300 text-black hover:bg-gray-100"
            >
              Atšaukti
            </Button>
            <Button
              onClick={handleDeductPoints}
              disabled={isProcessing}
              className="bg-red-600 hover:bg-red-700"
            >
              {isProcessing ? "Atimuama..." : "Atimti Taškus"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Point History Dialog */}
      <Dialog open={pointHistoryDialogOpen} onOpenChange={setPointHistoryDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              Taškų istorija - {selectedUserForHistory?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="max-h-[400px] overflow-y-auto">
              {pointHistory.map((entry) => (
                <div
                  key={entry.id}
                  className={`p-4 border rounded-lg mb-2 ${
                    entry.pointsAwarded > 0 ? 'bg-green-50' : 'bg-red-50'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-foreground">
                        {entry.courseName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(entry.createdAt).toLocaleString('lt-LT')}
                      </p>
                    </div>
                    <p className={`font-medium ${
                      entry.pointsAwarded > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {entry.pointsAwarded > 0 ? '+' : ''}{entry.pointsAwarded} taškų
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setPointHistoryDialogOpen(false)}
            >
              Uždaryti
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User Confirmation Dialog */}
      <Dialog open={deleteUserDialogOpen} onOpenChange={setDeleteUserDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-destructive">Ištrinti Naudotoją</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-foreground">
              Ar tikrai norite ištrinti naudotoją <strong>{selectedUserForDeletion?.name}</strong>?
            </p>
            <p className="text-sm text-muted-foreground">
              Šis veiksmas negrįžtamas. Naudotojo paskyra, visi jo taškai ir istorija bus visam laikui pašalinti.
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteUserDialogOpen(false)}
              disabled={isProcessing}
            >
              Atšaukti
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDeleteUser}
              disabled={isProcessing}
            >
              {isProcessing ? 'Trinamas...' : 'Ištrinti'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default Admin;
