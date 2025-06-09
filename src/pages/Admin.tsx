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
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    
    setIsProcessing(true);
    try {
      const success = await inviteUser(inviteEmail, inviteName, inviteRole);
      if (success) {
        toast({
          title: "Success",
          description: `Invitation sent to ${inviteEmail}`,
        });
        setInviteDialogOpen(false);
        setInviteName('');
        setInviteEmail('');
        setInviteRole('user');
      }
    } catch (error) {
      console.error('Failed to invite user:', error);
      toast({
        title: "Error",
        description: "Failed to send invitation",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCreatePrize = async () => {
    if (!prizeName || !prizeDescription || !prizePoints) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    
    const points = parseInt(prizePoints);
    if (isNaN(points) || points <= 0) {
      toast({
        title: "Error",
        description: "Points must be a positive number",
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
        title: "Success",
        description: "Prize created successfully",
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
      console.error('Failed to create prize:', error);
      toast({
        title: "Error",
        description: "Failed to create prize",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAddBonus = async () => {
    if (!bonusUserId || !bonusCourseName || !bonusCoursePrice || !bonusPointsAwarded) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    
    const price = parseFloat(bonusCoursePrice);
    const points = parseInt(bonusPointsAwarded);
    
    if (isNaN(price) || price <= 0 || isNaN(points) || points <= 0) {
      toast({
        title: "Error",
        description: "Price and points must be positive numbers",
        variant: "destructive",
      });
      return;
    }
    
    setIsProcessing(true);
    try {
      const selectedUser = users.find(u => u.id === bonusUserId);
      if (!selectedUser) throw new Error("User not found");
      
      await createBonusEntry({
        userId: bonusUserId,
        userName: selectedUser.name,
        courseName: bonusCourseName,
        price,
        pointsAwarded: points,
      });
      
      toast({
        title: "Success",
        description: "Bonus points added successfully",
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
      console.error('Failed to add bonus points:', error);
      toast({
        title: "Error",
        description: "Failed to add bonus points",
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
        title: "Success",
        description: `Redemption ${action === 'approved' ? 'approved' : 'rejected'} successfully`,
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
      console.error(`Failed to ${action} redemption:`, error);
      toast({
        title: "Error",
        description: `Failed to ${action} redemption`,
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

  // Colors for charts
  const COLORS = ['#7FC32E', '#5DA421', '#3E7416', '#29500E', '#192E08'];

  // Format data for prize distribution chart
  const prizeDistributionData = stats?.popularPrizes.map(prize => ({
    name: prize.name,
    value: prize.count,
  })) || [];

  // Format data for user points chart
  const userPointsData = stats?.topUsers.map(user => ({
    name: user.name,
    points: user.points,
  })) || [];

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-white">Admin Panel</h1>
          <div className="flex gap-3">
            <Button 
              onClick={() => setInviteDialogOpen(true)}
              className="bg-vcs-green hover:bg-vcs-green/90"
            >
              Invite User
            </Button>
            <Button 
              onClick={() => setNewBonusDialogOpen(true)}
              variant="outline" 
              className="border-vcs-green text-vcs-green hover:bg-vcs-green hover:text-white"
            >
              Add Bonus Points
            </Button>
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-vcs-gray">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="prizes">Prizes</TabsTrigger>
            <TabsTrigger value="redemptions">Redemptions</TabsTrigger>
          </TabsList>
          
          {/* Dashboard Tab */}
          <TabsContent value="dashboard">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              {/* Stats Cards */}
              <Card className="bg-vcs-dark border-vcs-gray animate-fade-in">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white text-lg">Total Users</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold text-vcs-green">
                    {isLoading ? <Skeleton className="h-9 w-16 bg-vcs-gray" /> : stats?.totalUsers}
                  </div>
                  <p className="text-sm text-gray-400 mt-1">Registered platform users</p>
                </CardContent>
              </Card>
              
              <Card className="bg-vcs-dark border-vcs-gray animate-fade-in">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white text-lg">Points Awarded</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold text-vcs-green">
                    {isLoading ? <Skeleton className="h-9 w-16 bg-vcs-gray" /> : stats?.totalPointsAwarded}
                  </div>
                  <p className="text-sm text-gray-400 mt-1">Total bonus points given</p>
                </CardContent>
              </Card>
              
              <Card className="bg-vcs-dark border-vcs-gray animate-fade-in">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white text-lg">Points Redeemed</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold text-vcs-green">
                    {isLoading ? <Skeleton className="h-9 w-16 bg-vcs-gray" /> : stats?.totalPointsRedeemed}
                  </div>
                  <p className="text-sm text-gray-400 mt-1">Total points exchanged for prizes</p>
                </CardContent>
              </Card>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Prize Distribution Chart */}
              <Card className="bg-vcs-dark border-vcs-gray animate-fade-in">
                <CardHeader>
                  <CardTitle className="text-white">Prize Distribution</CardTitle>
                  <CardDescription>Most popular prizes by redemption count</CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  {isLoading ? (
                    <div className="flex items-center justify-center h-full">
                      <Skeleton className="h-64 w-64 rounded-full bg-vcs-gray" />
                    </div>
                  ) : prizeDistributionData.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-gray-400">
                      No prize redemption data available
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
                        <Tooltip formatter={(value) => [`${value} redemptions`, 'Count']} />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
              
              {/* Top Users Chart */}
              <Card className="bg-vcs-dark border-vcs-gray animate-fade-in">
                <CardHeader>
                  <CardTitle className="text-white">Top Users by Points</CardTitle>
                  <CardDescription>Users with the most bonus points</CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  {isLoading ? (
                    <div className="space-y-4">
                      <Skeleton className="h-64 w-full bg-vcs-gray" />
                    </div>
                  ) : userPointsData.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-gray-400">
                      No user points data available
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={userPointsData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#444" vertical={false} />
                        <XAxis 
                          dataKey="name" 
                          tick={{ fill: '#aaa' }} 
                          angle={-45} 
                          textAnchor="end"
                          height={60}
                        />
                        <YAxis tick={{ fill: '#aaa' }} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#2B2C36', border: '1px solid #444', borderRadius: '4px' }}
                          labelStyle={{ color: '#fff' }}
                        />
                        <Bar dataKey="points" fill="#7FC32E" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          {/* Users Tab */}
          <TabsContent value="users">
            <Card className="bg-vcs-dark border-vcs-gray animate-fade-in">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-white">User Management</CardTitle>
                  <CardDescription>Manage user accounts and bonus points</CardDescription>
                </div>
                <Button 
                  onClick={() => setInviteDialogOpen(true)}
                  className="bg-vcs-green hover:bg-vcs-green/90"
                >
                  Invite User
                </Button>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-12 w-full bg-vcs-gray" />
                    ))}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="hover:bg-vcs-gray/50 border-gray-700">
                          <TableHead className="text-gray-300">Name</TableHead>
                          <TableHead className="text-gray-300">Email</TableHead>
                          <TableHead className="text-gray-300">Role</TableHead>
                          <TableHead className="text-gray-300 text-right">Points</TableHead>
                          <TableHead className="text-gray-300">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {users.map((user) => (
                          <TableRow key={user.id} className="hover:bg-vcs-gray/50 border-gray-700">
                            <TableCell className="font-medium text-white">
                              {user.name}
                            </TableCell>
                            <TableCell className="text-gray-300">
                              {user.email}
                            </TableCell>
                            <TableCell>
                              <Badge variant={user.role === 'admin' ? 'default' : 'outline'} className={
                                user.role === 'admin' 
                                  ? 'bg-purple-500/20 text-purple-300 border-purple-500' 
                                  : 'bg-blue-500/20 text-blue-300 border-blue-500'
                              }>
                                {user.role === 'admin' ? 'Admin' : 'User'}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <span className="point-badge">{user.totalPoints}</span>
                            </TableCell>
                            <TableCell>
                              <Button 
                                variant="ghost"
                                size="sm"
                                className="text-vcs-green hover:text-white hover:bg-vcs-green/20"
                                onClick={() => {
                                  setBonusUserId(user.id);
                                  setNewBonusDialogOpen(true);
                                }}
                              >
                                Add Points
                              </Button>
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
            <Card className="bg-vcs-dark border-vcs-gray animate-fade-in">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-white">Prize Management</CardTitle>
                  <CardDescription>Manage available prizes for redemption</CardDescription>
                </div>
                <Button 
                  onClick={() => setNewPrizeDialogOpen(true)}
                  className="bg-vcs-green hover:bg-vcs-green/90"
                >
                  Add New Prize
                </Button>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-12 w-full bg-vcs-gray" />
                    ))}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="hover:bg-vcs-gray/50 border-gray-700">
                          <TableHead className="text-gray-300">Prize</TableHead>
                          <TableHead className="text-gray-300">Description</TableHead>
                          <TableHead className="text-gray-300">Status</TableHead>
                          <TableHead className="text-gray-300 text-right">Points Cost</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {prizes.map((prize) => (
                          <TableRow key={prize.id} className="hover:bg-vcs-gray/50 border-gray-700">
                            <TableCell className="font-medium text-white">
                              {prize.name}
                            </TableCell>
                            <TableCell className="text-gray-300">
                              {prize.description}
                            </TableCell>
                            <TableCell>
                              <Badge variant={prize.active ? 'outline' : 'secondary'} className={
                                prize.active 
                                  ? 'bg-green-500/20 text-green-300 border-green-500' 
                                  : 'bg-gray-500/20 text-gray-300 border-gray-500'
                              }>
                                {prize.active ? 'Active' : 'Inactive'}
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
            <Card className="bg-vcs-dark border-vcs-gray animate-fade-in">
              <CardHeader>
                <CardTitle className="text-white">Redemption Requests</CardTitle>
                <CardDescription>Manage user prize redemption requests</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-12 w-full bg-vcs-gray" />
                    ))}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="hover:bg-vcs-gray/50 border-gray-700">
                          <TableHead className="text-gray-300">Date</TableHead>
                          <TableHead className="text-gray-300">User</TableHead>
                          <TableHead className="text-gray-300">Prize</TableHead>
                          <TableHead className="text-gray-300 text-right">Points</TableHead>
                          <TableHead className="text-gray-300">Status</TableHead>
                          <TableHead className="text-gray-300">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {redemptions.map((redemption) => (
                          <TableRow key={redemption.id} className="hover:bg-vcs-gray/50 border-gray-700">
                            <TableCell className="font-medium text-gray-300">
                              {format(new Date(redemption.requestedAt), 'dd MMM yyyy')}
                            </TableCell>
                            <TableCell className="text-white">
                              {redemption.userName}
                            </TableCell>
                            <TableCell className="text-gray-300">
                              {redemption.prizeName}
                            </TableCell>
                            <TableCell className="text-right">
                              <span className="point-badge">{redemption.pointCost}</span>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className={
                                redemption.status === 'pending' 
                                  ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500' 
                                  : redemption.status === 'approved' 
                                    ? 'bg-green-500/20 text-green-300 border-green-500' 
                                    : 'bg-red-500/20 text-red-300 border-red-500'
                              }>
                                {redemption.status.charAt(0).toUpperCase() + redemption.status.slice(1)}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {redemption.status === 'pending' ? (
                                <div className="flex gap-2">
                                  <Button 
                                    variant="ghost"
                                    size="sm"
                                    className="text-green-400 hover:text-white hover:bg-green-500/20"
                                    onClick={() => {
                                      setSelectedRedemption(redemption);
                                      handleRedemptionAction('approved');
                                    }}
                                  >
                                    Approve
                                  </Button>
                                  <Button 
                                    variant="ghost"
                                    size="sm"
                                    className="text-red-400 hover:text-white hover:bg-red-500/20"
                                    onClick={() => {
                                      setSelectedRedemption(redemption);
                                      setRedemptionDialogOpen(true);
                                    }}
                                  >
                                    Reject
                                  </Button>
                                </div>
                              ) : (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-blue-400 hover:text-white hover:bg-blue-500/20"
                                  onClick={() => handleViewRedemption(redemption)}
                                >
                                  View Details
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
        <DialogContent className="bg-vcs-dark text-white border-vcs-gray">
          <DialogHeader>
            <DialogTitle>Invite User</DialogTitle>
            <DialogDescription>
              Send an invitation email to add a new user to the platform.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={inviteName}
                onChange={(e) => setInviteName(e.target.value)}
                placeholder="John Doe"
                className="bg-vcs-gray text-white border-vcs-gray"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="user@example.com"
                className="bg-vcs-gray text-white border-vcs-gray"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select value={inviteRole} onValueChange={(value: 'admin' | 'user') => setInviteRole(value)}>
                <SelectTrigger className="bg-vcs-gray text-white border-vcs-gray">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent className="bg-vcs-gray text-white border-vcs-gray">
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setInviteDialogOpen(false)}
              className="border-gray-600 text-white hover:bg-gray-700"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleInviteUser} 
              className="bg-vcs-green hover:bg-vcs-green/90"
              disabled={isProcessing}
            >
              {isProcessing ? 'Sending...' : 'Send Invitation'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Prize Dialog */}
      <Dialog open={newPrizeDialogOpen} onOpenChange={setNewPrizeDialogOpen}>
        <DialogContent className="bg-vcs-dark text-white border-vcs-gray">
          <DialogHeader>
            <DialogTitle>Add New Prize</DialogTitle>
            <DialogDescription>
              Create a new prize that users can redeem with their bonus points.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="prize-name">Prize Name</Label>
              <Input
                id="prize-name"
                value={prizeName}
                onChange={(e) => setPrizeName(e.target.value)}
                placeholder="VCS T-Shirt"
                className="bg-vcs-gray text-white border-vcs-gray"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="prize-description">Description</Label>
              <Textarea
                id="prize-description"
                value={prizeDescription}
                onChange={(e) => setPrizeDescription(e.target.value)}
                placeholder="High quality cotton t-shirt with VCS logo"
                className="bg-vcs-gray text-white border-vcs-gray"
                rows={3}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="prize-points">Point Cost</Label>
              <Input
                id="prize-points"
                type="number"
                value={prizePoints}
                onChange={(e) => setPrizePoints(e.target.value)}
                placeholder="100"
                className="bg-vcs-gray text-white border-vcs-gray"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="prize-image">Image URL (Optional)</Label>
              <Input
                id="prize-image"
                value={prizeImage}
                onChange={(e) => setPrizeImage(e.target.value)}
                placeholder="https://example.com/image.png"
                className="bg-vcs-gray text-white border-vcs-gray"
              />
            </div>
          </div>
          
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setNewPrizeDialogOpen(false)}
              className="border-gray-600 text-white hover:bg-gray-700"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleCreatePrize} 
              className="bg-vcs-green hover:bg-vcs-green/90"
              disabled={isProcessing}
            >
              {isProcessing ? 'Creating...' : 'Create Prize'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Bonus Points Dialog */}
      <Dialog open={newBonusDialogOpen} onOpenChange={setNewBonusDialogOpen}>
        <DialogContent className="bg-vcs-dark text-white border-vcs-gray">
          <DialogHeader>
            <DialogTitle>Add Bonus Points</DialogTitle>
            <DialogDescription>
              Award bonus points to a user for completing a course.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="user">Select User</Label>
              <Select value={bonusUserId} onValueChange={setBonusUserId}>
                <SelectTrigger className="bg-vcs-gray text-white border-vcs-gray">
                  <SelectValue placeholder="Select user" />
                </SelectTrigger>
                <SelectContent className="bg-vcs-gray text-white border-vcs-gray">
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
              <Label htmlFor="course-name">Course Name</Label>
              <Input
                id="course-name"
                value={bonusCourseName}
                onChange={(e) => setBonusCourseName(e.target.value)}
                placeholder="JavaScript Fundamentals"
                className="bg-vcs-gray text-white border-vcs-gray"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="course-price">Course Price (€)</Label>
              <Input
                id="course-price"
                type="number"
                value={bonusCoursePrice}
                onChange={(e) => setBonusCoursePrice(e.target.value)}
                placeholder="399"
                className="bg-vcs-gray text-white border-vcs-gray"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="points-awarded">Points to Award</Label>
              <Input
                id="points-awarded"
                type="number"
                value={bonusPointsAwarded}
                onChange={(e) => setBonusPointsAwarded(e.target.value)}
                placeholder="200"
                className="bg-vcs-gray text-white border-vcs-gray"
              />
            </div>
          </div>
          
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setNewBonusDialogOpen(false)}
              className="border-gray-600 text-white hover:bg-gray-700"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleAddBonus} 
              className="bg-vcs-green hover:bg-vcs-green/90"
              disabled={isProcessing}
            >
              {isProcessing ? 'Adding...' : 'Add Points'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Redemption Dialog */}
      <Dialog open={redemptionDialogOpen} onOpenChange={setRedemptionDialogOpen}>
        <DialogContent className="bg-vcs-dark text-white border-vcs-gray">
          <DialogHeader>
            <DialogTitle>
              {selectedRedemption?.status === 'pending' ? 'Review Redemption Request' : 'Redemption Details'}
            </DialogTitle>
            <DialogDescription>
              {selectedRedemption?.status === 'pending' 
                ? 'Approve or reject this user\'s prize redemption request.'
                : `This redemption request has been ${selectedRedemption?.status}.`
              }
            </DialogDescription>
          </DialogHeader>
          
          {selectedRedemption && (
            <div className="space-y-4 py-4">
              <div className="flex flex-col space-y-1">
                <span className="text-sm text-gray-400">User:</span>
                <span className="font-medium">{selectedRedemption.userName}</span>
              </div>
              
              <div className="flex flex-col space-y-1">
                <span className="text-sm text-gray-400">Prize:</span>
                <span className="font-medium">{selectedRedemption.prizeName}</span>
              </div>
              
              <div className="flex flex-col space-y-1">
                <span className="text-sm text-gray-400">Point Cost:</span>
                <span className="point-badge">{selectedRedemption.pointCost}</span>
              </div>
              
              <div className="flex flex-col space-y-1">
                <span className="text-sm text-gray-400">Requested Date:</span>
                <span className="font-medium">
                  {format(new Date(selectedRedemption.requestedAt), 'dd MMM yyyy, HH:mm')}
                </span>
              </div>
              
              {selectedRedemption.status !== 'pending' && selectedRedemption.updatedAt && (
                <div className="flex flex-col space-y-1">
                  <span className="text-sm text-gray-400">
                    {selectedRedemption.status === 'approved' ? 'Approved' : 'Rejected'} Date:
                  </span>
                  <span className="font-medium">
                    {format(new Date(selectedRedemption.updatedAt), 'dd MMM yyyy, HH:mm')}
                  </span>
                </div>
              )}
              
              {selectedRedemption.status === 'rejected' && selectedRedemption.comment && (
                <div className="flex flex-col space-y-1">
                  <span className="text-sm text-gray-400">Rejection Reason:</span>
                  <span className="font-medium">{selectedRedemption.comment}</span>
                </div>
              )}
              
              {selectedRedemption.status === 'pending' && (
                <div className="space-y-2">
                  <Label htmlFor="rejection-comment">Rejection Reason (Required only if rejecting)</Label>
                  <Textarea
                    id="rejection-comment"
                    value={rejectionComment}
                    onChange={(e) => setRejectionComment(e.target.value)}
                    placeholder="Explain why you're rejecting this request..."
                    className="bg-vcs-gray text-white border-vcs-gray"
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
                  className="border-gray-600 text-white hover:bg-gray-700"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={() => handleRedemptionAction('rejected')}
                  variant="destructive"
                  disabled={isProcessing || !rejectionComment.trim()}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {isProcessing ? 'Processing...' : 'Reject'}
                </Button>
                <Button 
                  onClick={() => handleRedemptionAction('approved')}
                  className="bg-vcs-green hover:bg-vcs-green/90"
                  disabled={isProcessing}
                >
                  {isProcessing ? 'Processing...' : 'Approve'}
                </Button>
              </>
            ) : (
              <Button
                onClick={() => setRedemptionDialogOpen(false)}
                className="bg-vcs-green hover:bg-vcs-green/90"
              >
                Close
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default Admin;
