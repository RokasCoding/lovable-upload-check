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
    <div className="min-h-screen flex flex-col items-center justify-center bg-black p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white">Bonus Points</h1>
          <p className="text-vcs-green mt-2">Earn and redeem points for completing courses</p>
        </div>
        
        <Card className="bg-vcs-dark border-vcs-gray">
          <CardHeader>
            <CardTitle className="text-white">Welcome</CardTitle>
            <CardDescription>Sign in to your account or create a new one</CardDescription>
          </CardHeader>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-3 mb-4 bg-vcs-gray">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
              <TabsTrigger value="forgot">Forgot</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <form onSubmit={handleLogin}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm text-gray-300" htmlFor="email">Email</label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com" 
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-gray-300" htmlFor="password">Password</label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      required
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex-col space-y-4">
                  <Button 
                    type="submit" 
                    className="w-full bg-vcs-green hover:bg-vcs-green/90"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Signing In...' : 'Sign In'}
                  </Button>
                </CardFooter>
              </form>
            </TabsContent>
            
            <TabsContent value="register">
              <Card className="bg-vcs-dark border-vcs-gray">
                <CardHeader>
                  <CardTitle className="text-white">Create an account</CardTitle>
                  <CardDescription>Enter your details to register</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleRegister} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="register-name" className="text-white">Full Name</Label>
                      <Input
                        id="register-name"
                        placeholder="John Doe"
                        value={registerName}
                        onChange={(e) => setRegisterName(e.target.value)}
                        className="bg-vcs-gray text-white border-vcs-gray"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-email" className="text-white">Email</Label>
                      <Input
                        id="register-email"
                        type="email"
                        placeholder="you@example.com"
                        value={registerEmail}
                        onChange={(e) => setRegisterEmail(e.target.value)}
                        className="bg-vcs-gray text-white border-vcs-gray"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-password" className="text-white">Password</Label>
                      <Input
                        id="register-password"
                        type="password"
                        placeholder="••••••••"
                        value={registerPassword}
                        onChange={(e) => setRegisterPassword(e.target.value)}
                        className="bg-vcs-gray text-white border-vcs-gray"
                        required
                      />
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full bg-vcs-green hover:bg-vcs-green/90 text-white" 
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Registering...' : 'Register'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="forgot">
              <Card className="bg-vcs-dark border-vcs-gray">
                <CardHeader>
                  <CardTitle className="text-white">Reset Password</CardTitle>
                  <CardDescription>Enter your email to receive reset instructions</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleForgotPassword} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="reset-email" className="text-white">Email</Label>
                      <Input
                        id="reset-email"
                        type="email"
                        placeholder="you@example.com"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        className="bg-vcs-gray text-white border-vcs-gray"
                        required
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button 
                        type="submit" 
                        className="w-full bg-vcs-green hover:bg-vcs-green/90 text-white" 
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? 'Sending...' : 'Send Reset Link'}
                      </Button>
                      <Button 
                        type="button" 
                        variant="ghost" 
                        className="text-white" 
                        onClick={() => setActiveTab('login')}
                      >
                        Back to Login
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
          
          <div className="px-6 pb-6 pt-2">
            <Separator className="my-4 bg-vcs-gray" />
            
            <div className="space-y-4">
              <div className="text-sm text-gray-400 text-center">Don't want to create an account?</div>
              <div className="grid grid-cols-2 gap-4">
                <Button 
                  variant="outline" 
                  className="bg-vcs-gray border-vcs-green text-vcs-green hover:bg-vcs-green/20"
                  onClick={() => loginAsDemo('user')}
                  disabled={isSubmitting}
                >
                  Demo User
                </Button>
                <Button 
                  variant="outline" 
                  className="bg-vcs-gray border-purple-500 text-purple-400 hover:bg-purple-500/20"
                  onClick={() => loginAsDemo('admin')}
                  disabled={isSubmitting}
                >
                  Demo Admin
                </Button>
              </div>
            </div>
            
            <Separator className="my-4 bg-vcs-gray" />
            
            <div className="space-y-4">
              <div className="text-sm text-gray-400 text-center">Test Users</div>
              <div className="space-y-2">
                <div className="text-xs font-medium text-gray-500 uppercase">Admin Users:</div>
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="bg-vcs-gray border-purple-500 text-purple-400 hover:bg-purple-500/20 text-xs"
                    onClick={() => loginAsTestUser('admin1@example.com')}
                    disabled={isSubmitting}
                  >
                    Main Admin
                  </Button>
                  <Button 
                    variant="outline"
                    size="sm"
                    className="bg-vcs-gray border-purple-500 text-purple-400 hover:bg-purple-500/20 text-xs"
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
                    className="bg-vcs-gray border-vcs-green text-vcs-green hover:bg-vcs-green/20 text-xs"
                    onClick={() => loginAsTestUser('highpoints@example.com')}
                    disabled={isSubmitting}
                  >
                    High Points (1200)
                  </Button>
                  <Button 
                    variant="outline"
                    size="sm"
                    className="bg-vcs-gray border-vcs-green text-vcs-green hover:bg-vcs-green/20 text-xs"
                    onClick={() => loginAsTestUser('mediumpoints@example.com')}
                    disabled={isSubmitting}
                  >
                    Medium Points (500)
                  </Button>
                  <Button 
                    variant="outline"
                    size="sm"
                    className="bg-vcs-gray border-vcs-green text-vcs-green hover:bg-vcs-green/20 text-xs"
                    onClick={() => loginAsTestUser('lowpoints@example.com')}
                    disabled={isSubmitting}
                  >
                    Low Points (100)
                  </Button>
                  <Button 
                    variant="outline"
                    size="sm"
                    className="bg-vcs-gray border-vcs-green text-vcs-green hover:bg-vcs-green/20 text-xs"
                    onClick={() => loginAsTestUser('activeuser@example.com')}
                    disabled={isSubmitting}
                  >
                    Active User (850)
                  </Button>
                  <Button 
                    variant="outline"
                    size="sm"
                    className="bg-vcs-gray border-vcs-green text-vcs-green hover:bg-vcs-green/20 text-xs"
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
