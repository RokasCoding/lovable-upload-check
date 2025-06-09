import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/Layout';
import { 
  getUsers, 
  getBonusEntries, 
  getPrizes, 
  getRedemptions,
  getStats,
  createBonusEntry,
  inviteUser,
  createPrize,
  processRedemption
} from '@/services/dataService';
import { User, BonusEntry, Prize, PrizeRedemption, Stats } from '@/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Copy, Check, Users, Gift, Calendar, UserPlus, Award, Link2, Mail } from 'lucide-react';

const Admin: React.FC = () => {
  const { currentUser, isAuthenticated, isAdmin } = useAuth();
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

  // Colors for charts
  const COLORS = ['#3535FF', '#5A5AFF', '#7A7AFF', '#9A9AFF', '#BABEFF'];

  // Format data for charts
  const prizeDistributionData = stats?.popularPrizes.map(prize => ({
    name: prize.name,
    value: prize.count,
  })) || [];

  const userPointsData = stats?.topUsers.map(user => ({
    name: user.name,
    points: user.points,
  })) || [];

  // Filter new members (registered in last 7 days)
  const newMembers = users.filter(user => {
    const registrationDate = new Date(user.createdAt || Date.now());
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return registrationDate > weekAgo;
  });

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
          
          {/* Dashboard Tab */}
          <TabsContent value="dashboard">
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
          </TabsContent>
          
          {/* New Members Tab */}
          <TabsContent value="new-members">
            <Card className="bg-white border-gray-200 animate-fade-in">
              <CardHeader>
                <CardTitle className="text-black flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-vcs-blue" />
                  Nauji Nariai (Paskutinės 7 Dienos)
                </CardTitle>
                <CardDescription>Nauji nariai, kuriems reikia paskirti prizą</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-12 w-full bg-gray-200" />
                    ))}
                  </div>
                ) : newMembers.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    Nėra naujų narių per pastarąsias 7 dienas
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table className="vcs-table">
                      <TableHeader>
                        <TableRow className="hover:bg-gray-50 border-black">
                          <TableHead className="text-black font-bold">Vardas</TableHead>
                          <TableHead className="text-black font-bold">El. paštas</TableHead>
                          <TableHead className="text-black font-bold">Registracijos data</TableHead>
                          <TableHead className="text-black font-bold">Taškai</TableHead>
                          <TableHead className="text-black font-bold">Veiksmai</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {newMembers.map((user) => (
                          <TableRow key={user.id} className="hover:bg-gray-50 border-black">
                            <TableCell className="font-medium text-black">
                              {user.name}
                            </TableCell>
                            <TableCell className="text-black">
                              {user.email}
                            </TableCell>
                            <TableCell className="text-black">
                              {format(new Date(user.createdAt || Date.now()), 'yyyy-MM-dd')}
                            </TableCell>
                            <TableCell>
                              <span className="point-badge">{user.totalPoints}</span>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button 
                                  variant="outline"
                                  size="sm"
                                  className="border-vcs-blue text-vcs-blue hover:bg-vcs-blue hover:text-white"
                                  onClick={() => handleAssignPrize(user.id, '')}
                                >
                                  <Mail className="h-4 w-4 mr-1" />
                                  Paskirti Prizą
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Users Tab */}
          <TabsContent value="users">
            <Card className="bg-white border-gray-200 animate-fade-in">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-black">Naudotojų Valdymas</CardTitle>
                  <CardDescription>Valdyti naudotojų paskyras ir bonus taškus</CardDescription>
                </div>
                <Button 
                  onClick={() => setInviteDialogOpen(true)}
                  className="bg-vcs-blue hover:bg-vcs-blue/90"
                >
                  Pakviesti Naudotoją
                </Button>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-12 w-full bg-gray-200" />
                    ))}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table className="vcs-table">
                      <TableHeader>
                        <TableRow className="hover:bg-gray-50 border-black">
                          <TableHead className="text-black font-bold">Vardas</TableHead>
                          <TableHead className="text-black font-bold">El. paštas</TableHead>
                          <TableHead className="text-black font-bold">Telefonas</TableHead>
                          <TableHead className="text-black font-bold">Rolė</TableHead>
                          <TableHead className="text-black font-bold text-right">Taškai</TableHead>
                          <TableHead className="text-black font-bold">Registracija</TableHead>
                          <TableHead className="text-black font-bold">Veiksmai</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {users.map((user) => (
                          <TableRow key={user.id} className="hover:bg-gray-50 border-black">
                            <TableCell className="font-medium text-black">
                              {user.name}
                            </TableCell>
                            <TableCell className="text-black">
                              {user.email}
                            </TableCell>
                            <TableCell className="text-black">
                              {user.phone || 'Nenurodyta'}
                            </TableCell>
                            <TableCell>
                              <Badge variant={user.role === 'admin' ? 'default' : 'outline'} className={
                                user.role === 'admin' 
                                  ? 'bg-purple-100 text-purple-800 border-purple-300' 
                                  : 'bg-blue-100 text-blue-800 border-blue-300'
                              }>
                                {user.role === 'admin' ? 'Administratorius' : 'Naudotojas'}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <span className="point-badge">{user.totalPoints}</span>
                            </TableCell>
                            <TableCell className="text-black">
                              {format(new Date(user.createdAt || Date.now()), 'yyyy-MM-dd')}
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button 
                                  variant="ghost"
                                  size="sm"
                                  className="text-vcs-blue hover:text-white hover:bg-vcs-blue"
                                  onClick={() => {
                                    setBonusUserId(user.id);
                                    setNewBonusDialogOpen(true);
                                  }}
                                >
                                  Pridėti Taškų
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Prizes Tab */}
          <TabsContent value="prizes">
            <Card className="bg-white border-gray-200 animate-fade-in">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-black">Prizų Katalogas</CardTitle>
                  <CardDescription>Valdyti galimus prizus iškeitimui</CardDescription>
                </div>
                <Button 
                  onClick={() => setNewPrizeDialogOpen(true)}
                  className="bg-vcs-blue hover:bg-vcs-blue/90"
                >
                  Pridėti Naują Prizą
                </Button>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-12 w-full bg-gray-200" />
                    ))}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table className="vcs-table">
                      <TableHeader>
                        <TableRow className="hover:bg-gray-50 border-black">
                          <TableHead className="text-black font-bold">Prizas</TableHead>
                          <TableHead className="text-black font-bold">Aprašymas</TableHead>
                          <TableHead className="text-black font-bold">Būsena</TableHead>
                          <TableHead className="text-black font-bold text-right">Taškų Kaina</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {prizes.map((prize) => (
                          <TableRow key={prize.id} className="hover:bg-gray-50 border-black">
                            <TableCell className="font-medium text-black">
                              {prize.name}
                            </TableCell>
                            <TableCell className="text-black">
                              {prize.description}
                            </TableCell>
                            <TableCell>
                              <Badge variant={prize.active ? 'outline' : 'secondary'} className={
                                prize.active 
                                  ? 'bg-green-100 text-green-800 border-green-300' 
                                  : 'bg-gray-100 text-gray-800 border-gray-300'
                              }>
                                {prize.active ? 'Aktyvus' : 'Neaktyvus'}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <span className="point-badge">{prize.pointCost}</span>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Redemptions Tab */}
          <TabsContent value="redemptions">
            <Card className="bg-white border-gray-200 animate-fade-in">
              <CardHeader>
                <CardTitle className="text-black">Prizų Iškeitimo Prašymai</CardTitle>
                <CardDescription>Valdyti naudotojų prizų iškeitimo prašymus</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-12 w-full bg-gray-200" />
                    ))}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table className="vcs-table">
                      <TableHeader>
                        <TableRow className="hover:bg-gray-50 border-black">
                          <TableHead className="text-black font-bold">Data</TableHead>
                          <TableHead className="text-black font-bold">Naudotojas</TableHead>
                          <TableHead className="text-black font-bold">Prizas</TableHead>
                          <TableHead className="text-black font-bold text-right">Taškai</TableHead>
                          <TableHead className="text-black font-bold">Būsena</TableHead>
                          <TableHead className="text-black font-bold">Veiksmai</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {redemptions.map((redemption) => (
                          <TableRow key={redemption.id} className="hover:bg-gray-50 border-black">
                            <TableCell className="font-medium text-black">
                              {format(new Date(redemption.requestedAt), 'yyyy-MM-dd')}
                            </TableCell>
                            <TableCell className="text-black">
                              {redemption.userName}
                            </TableCell>
                            <TableCell className="text-black">
                              {redemption.prizeName}
                            </TableCell>
                            <TableCell className="text-right">
                              <span className="point-badge">{redemption.pointCost}</span>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className={
                                redemption.status === 'pending' 
                                  ? 'bg-yellow-100 text-yellow-800 border-yellow-300' 
                                  : redemption.status === 'approved' 
                                    ? 'bg-green-100 text-green-800 border-green-300' 
                                    : 'bg-red-100 text-red-800 border-red-300'
                              }>
                                {redemption.status === 'pending' ? 'Laukia' : 
                                 redemption.status === 'approved' ? 'Patvirtinta' : 'Atmesta'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {redemption.status === 'pending' ? (
                                <div className="flex gap-2">
                                  <Button 
                                    variant="ghost"
                                    size="sm"
                                    className="text-green-600 hover:text-white hover:bg-green-500"
                                    onClick={() => {
                                      setSelectedRedemption(redemption);
                                      handleRedemptionAction('approved');
                                    }}
                                  >
                                    Patvirtinti
                                  </Button>
                                  <Button 
                                    variant="ghost"
                                    size="sm"
                                    className="text-red-600 hover:text-white hover:bg-red-500"
                                    onClick={() => {
                                      setSelectedRedemption(redemption);
                                      setRedemptionDialogOpen(true);
                                    }}
                                  >
                                    Atmesti
                                  </Button>
                                </div>
                              ) : (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-vcs-blue hover:text-white hover:bg-vcs-blue"
                                  onClick={() => handleViewRedemption(redemption)}
                                >
                                  Peržiūrėti
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Invite User Dialog */}
      <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
        <DialogContent className="bg-white text-black border-gray-300">
          <DialogHeader>
            <DialogTitle>Pakviesti Naudotoją</DialogTitle>
            <DialogDescription>
              Išsiųskite pakvietimą el. paštu naujam naudotojui prisijungti prie platformos.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Vardas ir Pavardė</Label>
              <Input
                id="name"
                value={inviteName}
                onChange={(e) => setInviteName(e.target.value)}
                placeholder="Jonas Jonaitis"
                className="bg-gray-50 text-black border-gray-300"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">El. paštas</Label>
              <Input
                id="email"
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="naudotojas@pavyzdys.lt"
                className="bg-gray-50 text-black border-gray-300"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="role">Rolė</Label>
              <Select value={inviteRole} onValueChange={(value: 'admin' | 'user') => setInviteRole(value)}>
                <SelectTrigger className="bg-gray-50 text-black border-gray-300">
                  <SelectValue placeholder="Pasirinkite rolę" />
                </SelectTrigger>
                <SelectContent className="bg-gray-50 text-black border-gray-300">
                  <SelectItem value="user">Naudotojas</SelectItem>
                  <SelectItem value="admin">Administratorius</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setInviteDialogOpen(false)}
              className="border-gray-300 text-black hover:bg-gray-100"
            >
              Atšaukti
            </Button>
            <Button 
              onClick={handleInviteUser} 
              className="bg-vcs-blue hover:bg-vcs-blue/90"
              disabled={isProcessing}
            >
              {isProcessing ? 'Siunčiama...' : 'Siųsti Pakvietimą'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Prize Dialog */}
      <Dialog open={newPrizeDialogOpen} onOpenChange={setNewPrizeDialogOpen}>
        <DialogContent className="bg-white text-black border-gray-300">
          <DialogHeader>
            <DialogTitle>Pridėti Naują Prizą</DialogTitle>
            <DialogDescription>
              Sukurkite naują prizą, kurį naudotojai galės iškeisti savo taškams.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="prize-name">Prizo Pavadinimas</Label>
              <Input
                id="prize-name"
                value={prizeName}
                onChange={(e) => setPrizeName(e.target.value)}
                placeholder="VCS Marškinėliai"
                className="bg-gray-50 text-black border-gray-300"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="prize-description">Aprašymas</Label>
              <Textarea
                id="prize-description"
                value={prizeDescription}
                onChange={(e) => setPrizeDescription(e.target.value)}
                placeholder="Aukštos kokybės medvilniniai marškinėliai su VCS logotipu"
                className="bg-gray-50 text-black border-gray-300"
                rows={3}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="prize-points">Taškų Kaina</Label>
              <Input
                id="prize-points"
                type="number"
                value={prizePoints}
                onChange={(e) => setPrizePoints(e.target.value)}
                placeholder="100"
                className="bg-gray-50 text-black border-gray-300"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="prize-image">Paveikslėlio URL (neprivaloma)</Label>
              <Input
                id="prize-image"
                value={prizeImage}
                onChange={(e) => setPrizeImage(e.target.value)}
                placeholder="https://pavyzdys.lt/image.png"
                className="bg-gray-50 text-black border-gray-300"
              />
            </div>
          </div>
          
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setNewPrizeDialogOpen(false)}
              className="border-gray-300 text-black hover:bg-gray-100"
            >
              Atšaukti
            </Button>
            <Button 
              onClick={handleCreatePrize} 
              className="bg-vcs-blue hover:bg-vcs-blue/90"
              disabled={isProcessing}
            >
              {isProcessing ? 'Kuriama...' : 'Sukurti Prizą'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Bonus Points Dialog */}
      <Dialog open={newBonusDialogOpen} onOpenChange={setNewBonusDialogOpen}>
        <DialogContent className="bg-white text-black border-gray-300">
          <DialogHeader>
            <DialogTitle>Pridėti Bonus Taškų</DialogTitle>
            <DialogDescription>
              Suteikite bonus taškus naudotojui už kursų baigimą.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="user">Pasirinkite Naudotoją</Label>
              <Select value={bonusUserId} onValueChange={setBonusUserId}>
                <SelectTrigger className="bg-gray-50 text-black border-gray-300">
                  <SelectValue placeholder="Pasirinkite naudotoją" />
                </SelectTrigger>
                <SelectContent className="bg-gray-50 text-black border-gray-300">
                  {users
                    .filter(user => user.role === 'user')
                    .map(user => (
                      <SelectItem key={user.id} value={user.id}>{user.name}</SelectItem>
                    ))
                  }
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="course-name">Kurso Pavadinimas</Label>
              <Input
                id="course-name"
                value={bonusCourseName}
                onChange={(e) => setBonusCourseName(e.target.value)}
                placeholder="JavaScript Pagrindai"
                className="bg-gray-50 text-black border-gray-300"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="course-price">Kurso Kaina (€)</Label>
              <Input
                id="course-price"
                type="number"
                value={bonusCoursePrice}
                onChange={(e) => setBonusCoursePrice(e.target.value)}
                placeholder="399"
                className="bg-gray-50 text-black border-gray-300"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="points-awarded">Suteikiami Taškai</Label>
              <Input
                id="points-awarded"
                type="number"
                value={bonusPointsAwarded}
                onChange={(e) => setBonusPointsAwarded(e.target.value)}
                placeholder="200"
                className="bg-gray-50 text-black border-gray-300"
              />
            </div>
          </div>
          
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setNewBonusDialogOpen(false)}
              className="border-gray-300 text-black hover:bg-gray-100"
            >
              Atšaukti
            </Button>
            <Button 
              onClick={handleAddBonus} 
              className="bg-vcs-blue hover:bg-vcs-blue/90"
              disabled={isProcessing}
            >
              {isProcessing ? 'Pridedama...' : 'Pridėti Taškus'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Redemption Dialog */}
      <Dialog open={redemptionDialogOpen} onOpenChange={setRedemptionDialogOpen}>
        <DialogContent className="bg-white text-black border-gray-300">
          <DialogHeader>
            <DialogTitle>
              {selectedRedemption?.status === 'pending' ? 'Peržiūrėti Iškeitimo Prašymą' : 'Iškeitimo Detalės'}
            </DialogTitle>
            <DialogDescription>
              {selectedRedemption?.status === 'pending' 
                ? 'Patvirtinkite arba atminkite naudotojo prizų iškeitimo prašymą.'
                : `Šis iškeitimo prašymas buvo ${selectedRedemption?.status}.`
              }
            </DialogDescription>
          </DialogHeader>
          
          {selectedRedemption && (
            <div className="space-y-4 py-4">
              <div className="flex flex-col space-y-1">
                <span className="text-sm text-gray-600">Naudotojas:</span>
                <span className="font-medium">{selectedRedemption.userName}</span>
              </div>
              
              <div className="flex flex-col space-y-1">
                <span className="text-sm text-gray-600">Prizas:</span>
                <span className="font-medium">{selectedRedemption.prizeName}</span>
              </div>
              
              <div className="flex flex-col space-y-1">
                <span className="text-sm text-gray-600">Taškų Kaina:</span>
                <span className="point-badge">{selectedRedemption.pointCost}</span>
              </div>
              
              <div className="flex flex-col space-y-1">
                <span className="text-sm text-gray-600">Prašymo Data:</span>
                <span className="font-medium">
                  {format(new Date(selectedRedemption.requestedAt), 'yyyy-MM-dd, HH:mm')}
                </span>
              </div>
              
              {selectedRedemption.status !== 'pending' && selectedRedemption.updatedAt && (
                <div className="flex flex-col space-y-1">
                  <span className="text-sm text-gray-600">
                    {selectedRedemption.status === 'approved' ? 'Patvirtinimo' : 'Atmetimo'} Data:
                  </span>
                  <span className="font-medium">
                    {format(new Date(selectedRedemption.updatedAt), 'yyyy-MM-dd, HH:mm')}
                  </span>
                </div>
              )}
              
              {selectedRedemption.status === 'rejected' && selectedRedemption.comment && (
                <div className="flex flex-col space-y-1">
                  <span className="text-sm text-gray-600">Atmetimo Priežastis:</span>
                  <span className="font-medium">{selectedRedemption.comment}</span>
                </div>
              )}
              
              {selectedRedemption.status === 'pending' && (
                <div className="space-y-2">
                  <Label htmlFor="rejection-comment">Atmetimo Priežastis (privaloma tik atmetant)</Label>
                  <Textarea
                    id="rejection-comment"
                    value={rejectionComment}
                    onChange={(e) => setRejectionComment(e.target.value)}
                    placeholder="Paaiškinkite, kodėl atmetate šį prašymą..."
                    className="bg-gray-50 text-black border-gray-300"
                    rows={3}
                  />
                </div>
              )}
            </div>
          )}
          
          <DialogFooter className="gap-2 sm:gap-0">
            {selectedRedemption?.status === 'pending' ? (
              <>
                <Button
                  variant="outline"
                  onClick={() => setRedemptionDialogOpen(false)}
                  className="border-gray-300 text-black hover:bg-gray-100"
                >
                  Atšaukti
                </Button>
                <Button 
                  onClick={() => handleRedemptionAction('rejected')}
                  variant="destructive"
                  disabled={isProcessing || !rejectionComment.trim()}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {isProcessing ? 'Vykdoma...' : 'Atmesti'}
                </Button>
                <Button 
                  onClick={() => handleRedemptionAction('approved')}
                  className="bg-vcs-blue hover:bg-vcs-blue/90"
                  disabled={isProcessing}
                >
                  {isProcessing ? 'Vykdoma...' : 'Patvirtinti'}
                </Button>
              </>
            ) : (
              <Button
                onClick={() => setRedemptionDialogOpen(false)}
                className="bg-vcs-blue hover:bg-vcs-blue/90"
              >
                Uždaryti
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Link Generator Dialog */}
      <Dialog open={linkGeneratorOpen} onOpenChange={setLinkGeneratorOpen}>
        <DialogContent className="bg-white text-black border-gray-300">
          <DialogHeader>
            <DialogTitle>Generuoti Registracijos Nuorodą</DialogTitle>
            <DialogDescription>
              Sukurkite registracijos nuorodą su arba be bonus taškų
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="link-type">Nuorodos tipas</Label>
              <Select value={linkType} onValueChange={(value: 'no-points' | 'with-points') => setLinkType(value)}>
                <SelectTrigger className="bg-gray-50 text-black border-gray-300">
                  <SelectValue placeholder="Pasirinkite tipą" />
                </SelectTrigger>
                <SelectContent className="bg-gray-50 text-black border-gray-300">
                  <SelectItem value="no-points">Be taškų (kampanijoms)</SelectItem>
                  <SelectItem value="with-points">Su taškais</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {linkType === 'with-points' && (
              <div className="space-y-2">
                <Label htmlFor="link-points">Taškų kiekis</Label>
                <Input
                  id="link-points"
                  type="number"
                  value={linkPoints}
                  onChange={(e) => setLinkPoints(e.target.value)}
                  placeholder="10"
                  className="bg-gray-50 text-black border-gray-300"
                />
              </div>
            )}
            
            {generatedLink && (
              <div className="space-y-2">
                <Label htmlFor="generated-link">Sugeneruota nuoroda</Label>
                <div className="flex gap-2">
                  <Input
                    id="generated-link"
                    value={generatedLink}
                    readOnly
                    className="bg-gray-100 text-black border-gray-300"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyLinkToClipboard}
                    className="border-vcs-blue text-vcs-blue hover:bg-vcs-blue hover:text-white"
                  >
                    {linkCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            )}
          </div>
          
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setLinkGeneratorOpen(false)}
              className="border-gray-300 text-black hover:bg-gray-100"
            >
              Uždaryti
            </Button>
            <Button 
              onClick={generateRegistrationLink} 
              className="bg-vcs-blue hover:bg-vcs-blue/90"
            >
              Generuoti Nuorodą
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default Admin;
