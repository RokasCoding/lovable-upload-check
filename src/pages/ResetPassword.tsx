import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

const ResetPassword: React.FC = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasValidToken, setHasValidToken] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Password validation
  const validatePassword = (pass: string): string[] => {
    const errors: string[] = [];
    if (pass.length < 8) errors.push('Slaptažodis turi būti bent 8 simbolių ilgio');
    if (!/[A-Z]/.test(pass)) errors.push('Slaptažodyje turi būti bent viena didžioji raidė');
    if (!/[a-z]/.test(pass)) errors.push('Slaptažodyje turi būti bent viena mažoji raidė');
    if (!/[0-9]/.test(pass)) errors.push('Slaptažodyje turi būti bent vienas skaičius');
    return errors;
  };

  // On mount, validate the token from the URL
  useEffect(() => {
    const validateToken = async () => {
      try {
        const hash = window.location.hash;
        if (!hash.includes('access_token')) {
          throw new Error('Nerastas atstatymo raktas');
        }

        const params = new URLSearchParams(hash.replace('#', ''));
        const access_token = params.get('access_token');
        const refresh_token = params.get('refresh_token');

        if (!access_token || !refresh_token) {
          throw new Error('Neteisingas atstatymo raktas');
        }

        // Try to set the session
        const { error } = await supabase.auth.setSession({
          access_token,
          refresh_token,
        });

        if (error) throw error;
        
        // Clear the URL hash for security
        window.history.replaceState(null, '', window.location.pathname);
        setHasValidToken(true);
      } catch (error) {
        console.error('Token validation error:', error);
        toast({
          title: 'Klaida',
          description: 'Neteisingas arba pasibaigęs atstatymo raktas. Bandykite dar kartą.',
          variant: 'destructive',
        });
        navigate('/login');
      } finally {
        setIsLoading(false);
      }
    };

    validateToken();
  }, [navigate, toast]);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate passwords match
    if (password !== confirmPassword) {
      toast({
        title: 'Klaida',
        description: 'Slaptažodžiai nesutampa',
        variant: 'destructive',
      });
      return;
    }

    // Validate password strength
    const passwordErrors = validatePassword(password);
    if (passwordErrors.length > 0) {
      toast({
        title: 'Netinkamas slaptažodis',
        description: passwordErrors.join('. '),
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;

      toast({
        title: 'Sėkmingai atstatytas slaptažodis',
        description: 'Dabar galite prisijungti su nauju slaptažodžiu.',
      });
      
      // Sign out to clear the reset token session
      await supabase.auth.signOut();
      navigate('/login');
    } catch (error: any) {
      console.error('Password reset error:', error);
      toast({
        title: 'Klaida',
        description: error.message || 'Nepavyko atstatyti slaptažodžio',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!hasValidToken) {
    return null; // The useEffect will handle navigation
  }

  return (
    <div className="container max-w-md mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Nustatyti naują slaptažodį</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleReset} className="space-y-4">
            <div className="space-y-2">
              <Input
                type="password"
                placeholder="Naujas slaptažodis"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength={8}
                className="w-full"
              />
              <Input
                type="password"
                placeholder="Pakartokite slaptažodį"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
                minLength={8}
                className="w-full"
              />
            </div>
            <div className="text-sm text-muted-foreground">
              Slaptažodis turi būti bent:
              <ul className="list-disc list-inside mt-1">
                <li>8 simbolių ilgio</li>
                <li>Turėti bent vieną didžiąją raidę</li>
                <li>Turėti bent vieną mažąją raidę</li>
                <li>Turėti bent vieną skaičių</li>
              </ul>
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Keičiama...
                </>
              ) : (
                'Nustatyti slaptažodį'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResetPassword;
