import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

const ResetPassword: React.FC = () => {
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // On mount, set the session from the access_token in the URL
  useEffect(() => {
    const hash = window.location.hash;
    if (hash.includes('access_token')) {
      const params = new URLSearchParams(hash.replace('#', ''));
      const access_token = params.get('access_token');
      const refresh_token = params.get('refresh_token');
      if (access_token && refresh_token) {
        supabase.auth.setSession({
          access_token,
          refresh_token,
        });
      }
    }
  }, []);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        toast({
          title: 'Klaida',
          description: error.message,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Sėkmingai atstatytas slaptažodis',
          description: 'Dabar galite prisijungti su nauju slaptažodžiu.',
        });
        navigate('/login');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleReset} className="max-w-md mx-auto mt-10 space-y-4">
      <h1 className="text-2xl font-bold">Nustatyti naują slaptažodį</h1>
      <Input
        type="password"
        placeholder="Naujas slaptažodis"
        value={password}
        onChange={e => setPassword(e.target.value)}
        required
      />
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Keičiama...' : 'Nustatyti slaptažodį'}
      </Button>
    </form>
  );
};

export default ResetPassword;
