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
import { sendNewUserRegistrationEmail } from '@/lib/email';

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
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isEmailFromInvite, setIsEmailFromInvite] = useState(false);

  useEffect(() => {
    // If user is already logged in, redirect to dashboard
    if (!loading && user) {
      navigate('/dashboard', { replace: true });
      return;
    }

    // Validate registration link and handle email parameter
    const validateLink = async () => {
      const linkToken = searchParams.get('token');
      const invitedEmail = searchParams.get('email');
      
      if (!linkToken) {
        toast({
          title: 'Klaida',
          description: 'Netinkama registracijos nuoroda',
          variant: 'destructive',
        });
        navigate('/login');
        return;
      }

      // Pre-fill email if provided in URL
      if (invitedEmail) {
        setEmail(decodeURIComponent(invitedEmail));
        setIsEmailFromInvite(true);
      }

      try {
        // Validate the registration link with email if provided
        const { data, error } = await supabase
          .rpc('validate_registration_link', { 
            token_param: linkToken,
            email_param: invitedEmail ? decodeURIComponent(invitedEmail) : null
          });

        if (error || !data) {
          console.error('Validation failed:', error);
          throw new Error(error?.message || 'Netinkama arba nebegaliojanti registracijos nuoroda');
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
      const invitedEmail = searchParams.get('email');
      
      // If there's an invited email, verify the user is using the correct email
      if (invitedEmail && email !== decodeURIComponent(invitedEmail)) {
        throw new Error('Turite naudoti el. pašto adresą, kuriam buvo išsiųstas pakvietimas');
      }
      
      // Validate the registration link with the email one more time before registration
      if (invitedEmail) {
        const { data: isValid, error: validationError } = await supabase
          .rpc('validate_registration_link', { 
            token_param: linkToken,
            email_param: email
          });

        if (validationError || !isValid) {
          throw new Error('Ši registracijos nuoroda nėra skirta jūsų el. pašto adresui');
        }
      }
      
      const { data, error } = await AuthService.signUp(email, password, { 
        name,
        phone,
        linkToken,
      });
      
      if (error) throw error;

      // Get all admin users to send notifications
      const { data: adminUsers, error: adminError } = await supabase
        .from('users')
        .select('email')
        .eq('role', 'admin');

      if (!adminError && adminUsers) {
        // Send notifications to all admin users
        await Promise.all(
          adminUsers.map(admin => 
            sendNewUserRegistrationEmail(admin.email, name)
          )
        );
      }

      toast({ 
        title: 'Registracija sėkminga', 
        description: 'Jūsų paskyra sukurta! Galite prisijungti su savo duomenimis.' 
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
          <div className="bg-black p-4 rounded-lg inline-block mb-4">
            <img 
              src="https://www.vilniuscoding.lt/wp-content/uploads/2023/08/VCS-Logo-2023-PNG-be-fono-08-130x57.png" 
              alt="Vilnius Coding School Logo" 
              className="h-16 object-contain"
            />
          </div>
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
                  readOnly={isEmailFromInvite}
                  className={isEmailFromInvite ? "bg-gray-100 text-gray-600" : ""}
                />
                {isEmailFromInvite && (
                  <p className="text-sm text-blue-600">
                    ✅ El. paštas užpildytas automatiškai iš pakvietimo
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Telefono numeris</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+370 xxx xxxxx"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
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