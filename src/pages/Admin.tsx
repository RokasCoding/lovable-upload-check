
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  processRedemption
} from '@/services/dataService';
import { User, Prize, PrizeRedemption, Stats } from '@/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { UserPlus, Award, Link2 } from 'lucide-react';

// Import the new components
import { AdminStats } from '@/components/admin/AdminStats';
import { AdminNewMembers } from '@/components/admin/AdminNewMembers';
import { AdminUsers } from '@/components/admin/AdminUsers';
import { AdminPrizes } from '@/components/admin/AdminPrizes';
import { AdminRedemptions } from '@/components/admin/AdminRedemptions';
import { AdminDialogs } from '@/components/admin/AdminDialogs';

const Admin: React.FC = () => {
  const { isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [prizes, setPrizes] = useState<Prize[]>([]);
  const [redemptions, setRedemptions] = useState<PrizeRedemption[]>([]);

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

  useEffect(() => {
    if (!isAuthenticated || !isAdmin) {
      navigate('/dashboard');
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [statsData, usersData, prizesData, redemptionsData] = await Promise.all([
          getStats(),
          getUsers(),
          getPrizes(),
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
  }, [isAdmin, isAuthenticated, navigate]);

  const handleInviteUser = async () => {
    if (!inviteName || !inviteEmail) {
      toast({
        title: "Klaida",
        description: "Prašome užpildyti visus privalomus laukus",
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
    } catch (error) {
      console.error('Nepavyko pakviesti naudotojo:', error);
      toast({
        title: "Klaida",
        description: "Nepavyko išsiųsti pakvietimo",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCreatePrize = async () => {
    if (!prizeName || !prizeDescription || !prizePoints) {
      toast({
        title: "Klaida",
        description: "Prašome užpildyti visus privalomus laukus",
        variant: "destructive",
      });
      return;
    }
    
    const points = parseInt(prizePoints);
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
      await createPrize({
        name: prizeName,
        description: prizeDescription,
        pointCost: points,
        imageUrl: prizeImage || undefined,
        active: true,
      });
      
      toast({
        title: "Sėkmė",
        description: "Prizas sėkmingai sukurtas",
      });
      
      // Refresh prizes list
      const updatedPrizes = await getPrizes();
      setPrizes(updatedPrizes);
      
      setNewPrizeDialogOpen(false);
      setPrizeName('');
      setPrizeDescription('');
      setPrizePoints('');
      setPrizeImage('');
    } catch (error) {
      console.error('Nepavyko sukurti prizo:', error);
      toast({
        title: "Klaida",
        description: "Nepavyko sukurti prizo",
        variant: "destructive",
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
      
      toast({
        title: "Sėkmė",
        description: `Iškeitimas sėkmingai ${action === 'approved' ? 'patvirtintas' : 'atmestas'}`,
      });
      
      // Refresh redemptions list
      const updatedRedemptions = await getRedemptions();
      setRedemptions(updatedRedemptions);
      
      // Refresh users list for updated points
      const updatedUsers = await getUsers();
      setUsers(updatedUsers);
      
      // Refresh stats
      const updatedStats = await getStats();
      setStats(updatedStats);
      
      setRedemptionDialogOpen(false);
      setSelectedRedemption(null);
      setRejectionComment('');
    } catch (error) {
      console.error(`Nepavyko ${action} iškeitimo:`, error);
      toast({
        title: "Klaida",
        description: `Nepavyko ${action} iškeitimo`,
        variant: "destructive",
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

  const generateRegistrationLink = () => {
    const baseUrl = window.location.origin;
    const points = linkType === 'with-points' ? parseInt(linkPoints) : 0;
    const linkId = Math.random().toString(36).substring(2, 15);
    
    if (linkType === 'with-points' && (isNaN(points) || points <= 0)) {
      toast({
        title: "Klaida",
        description: "Prašome įvesti teisingą taškų skaičių",
        variant: "destructive",
      });
      return;
    }
    
    const link = `${baseUrl}/register?ref=${linkId}&points=${points}`;
    setGeneratedLink(link);
    
    toast({
      title: "Sėkmė",
      description: "Registracijos nuoroda sugeneruota",
    });
  };

  const copyLinkToClipboard = () => {
    navigator.clipboard.writeText(generatedLink);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
    
    toast({
      title: "Nukopijuota",
      description: "Nuoroda nukopijuota į iškarpinę",
    });
  };

  const handleAssignPrize = async (userId: string, prizeId: string) => {
    try {
      // This would be implemented to assign a prize to a new member
      // and send email to akvile.n@vilniuscoding.lt
      toast({
        title: "Sėkmė",
        description: "Prizas paskirtas ir el. laiškas išsiųstas",
      });
    } catch (error) {
      toast({
        title: "Klaida",
        description: "Nepavyko paskirti prizo",
        variant: "destructive",
      });
    }
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
          </TabsList>
          
          <TabsContent value="dashboard">
            <AdminStats stats={stats} isLoading={isLoading} />
          </TabsContent>
          
          <TabsContent value="new-members">
            <AdminNewMembers 
              users={users} 
              isLoading={isLoading} 
              onAssignPrize={handleAssignPrize} 
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
            />
          </TabsContent>
          
          <TabsContent value="prizes">
            <AdminPrizes 
              prizes={prizes} 
              isLoading={isLoading} 
              onCreatePrize={() => setNewPrizeDialogOpen(true)}
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
        onCopyLink={copyLinkToClipboard}

        isProcessing={isProcessing}
      />
    </Layout>
  );
};

export default Admin;
