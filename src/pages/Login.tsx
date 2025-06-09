
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, register, forgotPassword, setDemoUser } = useAuth();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState('login');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // Register form state
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  
  // Forgot password state
  const [forgotEmail, setForgotEmail] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const success = await login(loginEmail, loginPassword);
      if (success) {
        navigate('/dashboard');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const success = await register(registerEmail, registerName, registerPassword);
      if (success) {
        setActiveTab('login');
        setLoginEmail(registerEmail);
        setLoginPassword(registerPassword);
        
        toast({
          title: "Registration Successful",
          description: "Please log in with your new account.",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await forgotPassword(forgotEmail);
      setForgotEmail('');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const loginAsDemo = async (type: 'admin' | 'user') => {
    setIsSubmitting(true);
    try {
      setDemoUser(type);
      navigate('/dashboard');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Function to automatically log in as test user
  const loginAsTestUser = async (email: string) => {
    setIsSubmitting(true);
    try {
      const success = await login(email, 'password123');
      if (success) {
        navigate('/dashboard');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-vcs-black">Bonus Points</h1>
          <p className="text-vcs-blue mt-2">Earn and redeem points for completing courses</p>
        </div>
        
        <Card className="bg-white border-2 border-vcs-black shadow-lg">
          <CardHeader>
            <CardTitle className="text-vcs-black">Welcome</CardTitle>
            <CardDescription className="text-gray-600">Sign in to your account or create a new one</CardDescription>
          </CardHeader>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-3 mb-4 bg-gray-100 border border-gray-300">
              <TabsTrigger value="login" className="text-vcs-black data-[state=active]:bg-white data-[state=active]:text-vcs-blue">Login</TabsTrigger>
              <TabsTrigger value="register" className="text-vcs-black data-[state=active]:bg-white data-[state=active]:text-vcs-blue">Register</TabsTrigger>
              <TabsTrigger value="forgot" className="text-vcs-black data-[state=active]:bg-white data-[state=active]:text-vcs-blue">Forgot</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <form onSubmit={handleLogin}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm text-vcs-black font-medium" htmlFor="email">Email</label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com" 
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      className="border-2 border-gray-300 focus:border-vcs-blue text-vcs-black"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-vcs-black font-medium" htmlFor="password">Password</label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="border-2 border-gray-300 focus:border-vcs-blue text-vcs-black"
                      required
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex-col space-y-4">
                  <Button 
                    type="submit" 
                    className="w-full bg-vcs-blue hover:bg-vcs-blue/90 text-white border-0"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Signing In...' : 'Sign In'}
                  </Button>
                </CardFooter>
              </form>
            </TabsContent>
            
            <TabsContent value="register">
              <CardContent>
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="register-name" className="text-vcs-black font-medium">Full Name</Label>
                    <Input
                      id="register-name"
                      placeholder="John Doe"
                      value={registerName}
                      onChange={(e) => setRegisterName(e.target.value)}
                      className="border-2 border-gray-300 focus:border-vcs-blue text-vcs-black"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-email" className="text-vcs-black font-medium">Email</Label>
                    <Input
                      id="register-email"
                      type="email"
                      placeholder="you@example.com"
                      value={registerEmail}
                      onChange={(e) => setRegisterEmail(e.target.value)}
                      className="border-2 border-gray-300 focus:border-vcs-blue text-vcs-black"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-password" className="text-vcs-black font-medium">Password</Label>
                    <Input
                      id="register-password"
                      type="password"
                      placeholder="••••••••"
                      value={registerPassword}
                      onChange={(e) => setRegisterPassword(e.target.value)}
                      className="border-2 border-gray-300 focus:border-vcs-blue text-vcs-black"
                      required
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-vcs-blue hover:bg-vcs-blue/90 text-white border-0" 
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Registering...' : 'Register'}
                  </Button>
                </form>
              </CardContent>
            </TabsContent>
            
            <TabsContent value="forgot">
              <CardContent>
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="reset-email" className="text-vcs-black font-medium">Email</Label>
                    <Input
                      id="reset-email"
                      type="email"
                      placeholder="you@example.com"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      className="border-2 border-gray-300 focus:border-vcs-blue text-vcs-black"
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button 
                      type="submit" 
                      className="w-full bg-vcs-blue hover:bg-vcs-blue/90 text-white border-0" 
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Sending...' : 'Send Reset Link'}
                    </Button>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      className="text-vcs-black hover:bg-gray-100" 
                      onClick={() => setActiveTab('login')}
                    >
                      Back to Login
                    </Button>
                  </div>
                </form>
              </CardContent>
            </TabsContent>
          </Tabs>
          
          <div className="px-6 pb-6 pt-2">
            <Separator className="my-4 bg-gray-300" />
            
            <div className="space-y-4">
              <div className="text-sm text-gray-600 text-center">Don't want to create an account?</div>
              <div className="grid grid-cols-2 gap-4">
                <Button 
                  variant="outline" 
                  className="border-2 border-vcs-blue text-vcs-blue hover:bg-vcs-blue hover:text-white"
                  onClick={() => loginAsDemo('user')}
                  disabled={isSubmitting}
                >
                  Demo User
                </Button>
                <Button 
                  variant="outline" 
                  className="border-2 border-purple-500 text-purple-600 hover:bg-purple-500 hover:text-white"
                  onClick={() => loginAsDemo('admin')}
                  disabled={isSubmitting}
                >
                  Demo Admin
                </Button>
              </div>
            </div>
            
            <Separator className="my-4 bg-gray-300" />
            
            <div className="space-y-4">
              <div className="text-sm text-gray-600 text-center">Test Users</div>
              <div className="space-y-2">
                <div className="text-xs font-medium text-gray-500 uppercase">Admin Users:</div>
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="border border-purple-500 text-purple-600 hover:bg-purple-500 hover:text-white text-xs"
                    onClick={() => loginAsTestUser('admin1@example.com')}
                    disabled={isSubmitting}
                  >
                    Main Admin
                  </Button>
                  <Button 
                    variant="outline"
                    size="sm"
                    className="border border-purple-500 text-purple-600 hover:bg-purple-500 hover:text-white text-xs"
                    onClick={() => loginAsTestUser('admin2@example.com')}
                    disabled={isSubmitting}
                  >
                    Secondary Admin
                  </Button>
                </div>
                
                <div className="text-xs font-medium text-gray-500 uppercase mt-3">Regular Users:</div>
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    variant="outline"
                    size="sm"
                    className="border border-vcs-blue text-vcs-blue hover:bg-vcs-blue hover:text-white text-xs"
                    onClick={() => loginAsTestUser('highpoints@example.com')}
                    disabled={isSubmitting}
                  >
                    High Points (1200)
                  </Button>
                  <Button 
                    variant="outline"
                    size="sm"
                    className="border border-vcs-blue text-vcs-blue hover:bg-vcs-blue hover:text-white text-xs"
                    onClick={() => loginAsTestUser('mediumpoints@example.com')}
                    disabled={isSubmitting}
                  >
                    Medium Points (500)
                  </Button>
                  <Button 
                    variant="outline"
                    size="sm"
                    className="border border-vcs-blue text-vcs-blue hover:bg-vcs-blue hover:text-white text-xs"
                    onClick={() => loginAsTestUser('lowpoints@example.com')}
                    disabled={isSubmitting}
                  >
                    Low Points (100)
                  </Button>
                  <Button 
                    variant="outline"
                    size="sm"
                    className="border border-vcs-blue text-vcs-blue hover:bg-vcs-blue hover:text-white text-xs"
                    onClick={() => loginAsTestUser('activeuser@example.com')}
                    disabled={isSubmitting}
                  >
                    Active User (850)
                  </Button>
                  <Button 
                    variant="outline"
                    size="sm"
                    className="border border-vcs-blue text-vcs-blue hover:bg-vcs-blue hover:text-white text-xs"
                    onClick={() => loginAsTestUser('newuser@example.com')}
                    disabled={isSubmitting}
                  >
                    New User (0)
                  </Button>
                </div>
              </div>
              <div className="text-xs text-center text-gray-500 mt-2">
                All test accounts use password: "password123"
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Login;
