import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { AuthService } from '@/lib/auth';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

const Register: React.FC = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValidatingLink, setIsValidatingLink] = useState(true);
  const [isValidLink, setIsValidLink] = useState(false);
  
  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    // If user is already logged in, redirect to dashboard
    if (!loading && user) {
      navigate('/dashboard', { replace: true });
      return;
    }

    // Validate registration link
    const validateLink = async () => {
      const linkToken = searchParams.get('token');
      if (!linkToken) {
        toast({
          title: 'Klaida',
          description: 'Netinkama registracijos nuoroda',
          variant: 'destructive',
        });
        navigate('/login');
        return;
      }

      try {
        const { data, error } = await supabase
          .rpc('validate_registration_link', { link_token: linkToken });

        if (error || !data) {
          throw new Error('Netinkama arba nebegaliojanti registracijos nuoroda');
        }

        setIsValidLink(true);
      } catch (error: any) {
        toast({
          title: 'Klaida',
          description: error.message || 'Netinkama registracijos nuoroda',
          variant: 'destructive',
        });
        navigate('/login');
      } finally {
        setIsValidatingLink(false);
      }
    };

    validateLink();
  }, [user, loading, navigate, searchParams, toast]);

  const validatePassword = (password: string) => {
    if (!AuthService.validatePassword(password)) {
      setPasswordError('Slaptažodis turi būti bent 8 simbolių ilgio, turėti bent vieną didžiąją ir mažąją raidę, skaičių ir specialų simbolį');
      return false;
    }
    setPasswordError('');
    return true;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validatePassword(password)) {
      return;
    }
    
    setIsSubmitting(true);
    try {
      const linkToken = searchParams.get('token');
      const { data, error } = await AuthService.signUp(email, password, { 
        name,
        linkToken,
      });
      
      if (error) throw error;

      toast({ 
        title: 'Registracija sėkminga', 
        description: 'Patikrinkite savo el. paštą, kad patvirtintumėte paskyrą.' 
      });
      navigate('/login');
    } catch (error: any) {
      toast({ 
        title: 'Klaida', 
        description: error.message || 'Nepavyko užregistruoti',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading || isValidatingLink) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!isValidLink) {
    return null; // The useEffect will handle navigation
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <img 
            src="https://www.vilniuscoding.lt/wp-content/uploads/2023/08/VCS-Logo-2023-PNG-be-fono-08-130x57.png" 
            alt="Vilnius Coding School Logo" 
            className="h-16 object-contain mx-auto mb-4"
          />
          <h1 className="text-4xl font-bold text-foreground">Vilnius Coding School Bonus Sistema</h1>
          <p className="text-primary mt-2">Sukurkite savo paskyrą</p>
        </div>
        
        <Card className="bg-background border-border shadow-lg">
          <CardHeader>
            <CardTitle className="text-foreground">Registracija</CardTitle>
            <CardDescription className="text-muted-foreground">
              Užpildykite formą, kad sukurtumėte paskyrą
            </CardDescription>
          </CardHeader>
          
          <form onSubmit={handleRegister}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Vardas ir pavardė</Label>
                <Input
                  id="name"
                  placeholder="Jonas Jonaitis"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">El. paštas</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="jus@pvz.lt"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Slaptažodis</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    validatePassword(e.target.value);
                  }}
                  required
                />
                {passwordError && (
                  <Alert variant="destructive" className="mt-2">
                    <Info className="h-4 w-4" />
                    <AlertDescription>{passwordError}</AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={isSubmitting || !!passwordError}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Registruojama...
                  </>
                ) : (
                  'Registruotis'
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Register; 