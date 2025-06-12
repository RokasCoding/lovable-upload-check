import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { Mail, Settings, Bell } from 'lucide-react';

interface NotificationSettings {
  newUserRegistrations: boolean;
  prizeRedemptions: boolean;
  systemUpdates: boolean;
  prizeStatusUpdates: boolean;
}

interface SystemSettings {
  domainName: string;
  companyName: string;
}

export const AdminSettings: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [settings, setSettings] = useState<NotificationSettings>({
    newUserRegistrations: true,
    prizeRedemptions: true,
    systemUpdates: true,
    prizeStatusUpdates: true,
  });
  const [systemSettings, setSystemSettings] = useState<SystemSettings>({
    domainName: '',
    companyName: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [newEmail, setNewEmail] = useState(user?.email || '');
  const [isEmailLoading, setIsEmailLoading] = useState(false);

  useEffect(() => {
    loadSettings();
    loadSystemSettings();
    setNewEmail(user?.email || '');
  }, [user]);

  const loadSettings = async () => {
    if (!user?.id) return;

    try {
      const { data: userData, error } = await supabase.auth.admin.getUserById(user.id);
      if (error) throw error;

      const notificationSettings = userData?.user?.user_metadata?.notificationSettings;
      if (notificationSettings) {
        setSettings(notificationSettings);
      }
    } catch (error) {
      console.error('Failed to load notification settings:', error);
    }
  };

  const loadSystemSettings = async () => {
    try {
      const { data: domainData } = await supabase
        .from('system_settings')
        .select('setting_value')
        .eq('setting_key', 'domain_name')
        .single();

      const { data: companyData } = await supabase
        .from('system_settings')
        .select('setting_value')
        .eq('setting_key', 'company_name')
        .single();

      setSystemSettings({
        domainName: domainData?.setting_value || '',
        companyName: companyData?.setting_value || 'VCS Taškų Sistema',
      });
    } catch (error) {
      console.error('Failed to load system settings:', error);
    }
  };

  const saveSettings = async () => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.admin.updateUserById(user.id, {
        user_metadata: {
          ...user.user_metadata,
          notificationSettings: settings,
        },
      });

      if (error) throw error;

      toast({
        title: 'Nustatymai išsaugoti',
        description: 'Pranešimų nustatymai sėkmingai atnaujinti.',
      });
    } catch (error) {
      console.error('Failed to save notification settings:', error);
      toast({
        title: 'Klaida',
        description: 'Nepavyko išsaugoti nustatymų.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const saveSystemSettings = async () => {
    setIsLoading(true);
    try {
      // Validate domain format
      let domain = systemSettings.domainName.trim();
      if (domain && !domain.startsWith('http://') && !domain.startsWith('https://')) {
        domain = 'https://' + domain;
      }
      domain = domain.replace(/\/$/, ''); // Remove trailing slash

      // Update domain name
      await supabase
        .from('system_settings')
        .upsert({
          setting_key: 'domain_name',
          setting_value: domain,
          updated_by: user?.id,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'setting_key'
        });

      // Update company name
      await supabase
        .from('system_settings')
        .upsert({
          setting_key: 'company_name',
          setting_value: systemSettings.companyName.trim(),
          updated_by: user?.id,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'setting_key'
        });

      toast({
        title: 'Sistemos nustatymai išsaugoti',
        description: 'Domeno vardas ir įmonės pavadinimas atnaujinti.',
      });
    } catch (error) {
      console.error('Failed to save system settings:', error);
      toast({
        title: 'Klaida',
        description: 'Nepavyko išsaugoti sistemos nustatymų.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSettingChange = (key: keyof NotificationSettings, value: boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSystemSettingChange = (key: keyof SystemSettings, value: string) => {
    setSystemSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleEmailChange = async () => {
    if (!user?.id || !newEmail || newEmail === user.email) return;
    setIsEmailLoading(true);
    try {
      const { error } = await supabase.auth.admin.updateUserById(user.id, {
        email: newEmail.trim(),
      });
      if (error) throw error;
      toast({
        title: 'El. paštas atnaujintas',
        description: 'Jūsų el. pašto adresas sėkmingai atnaujintas.',
      });
    } catch (error) {
      toast({
        title: 'Klaida',
        description: error.message || 'Nepavyko atnaujinti el. pašto adreso.',
        variant: 'destructive',
      });
    } finally {
      setIsEmailLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Sistemos Nustatymai
          </CardTitle>
          <CardDescription>
            Konfigūruokite sistemos parametrus ir domeno nustatymus
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="domain-name">Domeno vardas</Label>
              <Input
                id="domain-name"
                value={systemSettings.domainName}
                onChange={(e) => handleSystemSettingChange('domainName', e.target.value)}
                placeholder="https://example.com"
                className="mt-1"
              />
              <p className="text-sm text-muted-foreground mt-1">
                Šis domenas bus naudojamas el. laiškuose ir nuorodose
              </p>
            </div>

            <div>
              <Label htmlFor="company-name">Įmonės pavadinimas</Label>
              <Input
                id="company-name"
                value={systemSettings.companyName}
                onChange={(e) => handleSystemSettingChange('companyName', e.target.value)}
                placeholder="Jūsų įmonės pavadinimas"
                className="mt-1"
              />
              <p className="text-sm text-muted-foreground mt-1">
                Pavadinimas rodomas el. laiškuose ir sąsajoje
              </p>
            </div>
          </div>

          <Button onClick={saveSystemSettings} disabled={isLoading}>
            {isLoading ? 'Išsaugoma...' : 'Išsaugoti sistemos nustatymus'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            El. pašto adresas
          </CardTitle>
          <CardDescription>
            Pakeiskite savo administratoriaus el. pašto adresą
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="admin-email">El. paštas</Label>
            <Input
              id="admin-email"
              type="email"
              value={newEmail}
              onChange={e => setNewEmail(e.target.value)}
              placeholder="naujas@email.lt"
              className="mt-1"
              autoComplete="email"
            />
          </div>
          <Button onClick={handleEmailChange} disabled={isEmailLoading || !newEmail || newEmail === user?.email}>
            {isEmailLoading ? 'Atnaujinama...' : 'Atnaujinti el. paštą'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}; 