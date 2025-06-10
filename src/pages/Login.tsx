import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { AuthService } from '@/lib/auth';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';

const Login: React.FC = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState('login');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form states
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [forgotEmail, setForgotEmail] = useState('');

  useEffect(() => {
    // If user is already logged in, redirect to dashboard
    if (!loading && user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, loading, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const { data, error } = await AuthService.signIn(loginEmail, loginPassword);
    
    if (error) {
      toast({ title: 'Klaida', description: error, variant: 'destructive' });
    }
    setIsSubmitting(false);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const { error } = await AuthService.resetPassword(forgotEmail);
    
    if (error) {
      toast({ title: 'Klaida', description: error, variant: 'destructive' });
    } else {
      toast({ 
        title: 'Slaptažodžio atstatymas', 
        description: 'Patikrinkite savo el. paštą ir sekite instrukcijas.' 
      });
    }
    setIsSubmitting(false);
  };

  if (loading) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-foreground">Vilnius Coding School Bonus Sistema</h1>
          <p className="text-primary mt-2">Iškeiskite taškus į prizus</p>
        </div>
        
        <Card className="bg-background border-border shadow-lg">
          <CardHeader>
            <CardTitle className="text-foreground">Sveiki atvykę</CardTitle>
            <CardDescription className="text-muted-foreground">
              Prisijunkite prie savo paskyros
            </CardDescription>
          </CardHeader>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-2 mb-4 bg-muted border-border">
              <TabsTrigger value="login">Prisijungimas</TabsTrigger>
              <TabsTrigger value="forgot">Pamiršau</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <form onSubmit={handleLogin}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">El. paštas</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="jus@pvz.lt" 
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Slaptažodis</Label>
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
                <CardFooter>
                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? 'Prisijungiama...' : 'Prisijungti'}
                  </Button>
                </CardFooter>
              </form>
            </TabsContent>
            
            <TabsContent value="forgot">
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <CardContent>
                  <div className="space-y-2">
                    <Label htmlFor="reset-email">El. paštas</Label>
                    <Input
                      id="reset-email"
                      type="email"
                      placeholder="jus@pvz.lt"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      required
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex-col gap-2">
                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? 'Siunčiama...' : 'Siųsti atstatymo nuorodą'}
                  </Button>
                  <Button type="button" variant="ghost" onClick={() => setActiveTab('login')}>
                    Grįžti į prisijungimą
                  </Button>
                </CardFooter>
              </form>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
};

export default Login;
