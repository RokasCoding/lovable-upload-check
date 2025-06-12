import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Mail, Settings, Bell } from 'lucide-react';
import { testEmailSending, testPrizeNotificationEmail, testPrizeNotificationEmailDirect } from '@/lib/email';

interface NotificationSettings {
  prizeRedemptions: boolean;
  newUserRegistrations: boolean;
  pointsDeductions: boolean;
  systemUpdates: boolean;
}

export const AdminSettings: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isTestingPrize, setIsTestingPrize] = useState(false);
  const [isTestingDirect, setIsTestingDirect] = useState(false);
  const [settings, setSettings] = useState<NotificationSettings>({
    prizeRedemptions: true,
    newUserRegistrations: true,
    pointsDeductions: true,
    systemUpdates: false,
  });

  useEffect(() => {
    const loadSettings = async () => {
      if (!user) return;

      try {
        // Try to get existing settings from user metadata
        const existingSettings = user.user_metadata?.notificationSettings;
        if (existingSettings) {
          setSettings(existingSettings);
        }
      } catch (error) {
        console.error('Failed to load notification settings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, [user]);

  const handleSettingChange = (setting: keyof NotificationSettings, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  const saveSettings = async () => {
    if (!user) return;

    setIsSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          ...user.user_metadata,
          notificationSettings: settings,
        }
      });

      if (error) throw error;

      toast({
        title: 'Sėkmė',
        description: 'Pranešimų nustatymai sėkmingai išsaugoti',
      });
    } catch (error: any) {
      toast({
        title: 'Klaida',
        description: 'Nepavyko išsaugoti nustatymų',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestEmail = async () => {
    if (!user?.email) return;
    
    setIsTesting(true);
    try {
      const result = await testEmailSending(user.email);
      
      if (result.error) {
        throw new Error(result.error);
      }

      toast({
        title: 'Testinis el. laiškas išsiųstas',
        description: 'Patikrinkite savo el. paštą',
      });
    } catch (error: any) {
      toast({
        title: 'Klaida',
        description: error.message || 'Nepavyko išsiųsti testinio el. laiško',
        variant: 'destructive',
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleTestPrizeEmail = async () => {
    if (!user?.email) return;
    
    setIsTestingPrize(true);
    try {
      const result = await testPrizeNotificationEmail(user.email);
      
      if (result.error) {
        throw new Error(result.error);
      }

      toast({
        title: 'Testinis prizo pranešimas išsiųstas',
        description: 'Patikrinkite savo el. paštą - turėtumėte gauti pranešimą apie testinį prizo iškeitimo prašymą',
      });
    } catch (error: any) {
      toast({
        title: 'Klaida',
        description: error.message || 'Nepavyko išsiųsti testinio prizo pranešimo',
        variant: 'destructive',
      });
    } finally {
      setIsTestingPrize(false);
    }
  };

  const handleTestPrizeEmailDirect = async () => {
    if (!user?.email) return;
    
    setIsTestingDirect(true);
    try {
      const result = await testPrizeNotificationEmailDirect(user.email);
      
      if (result.error) {
        throw new Error(result.error);
      }

      toast({
        title: 'Direct test successful',
        description: 'Direct HTTP call to edge function worked! Check console for details.',
      });
    } catch (error: any) {
      toast({
        title: 'Direct test failed',
        description: error.message || 'Direct HTTP test failed',
        variant: 'destructive',
      });
    } finally {
      setIsTestingDirect(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="bg-white border-gray-200 animate-fade-in">
        <CardHeader>
          <CardTitle className="text-black flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Administratoriaus Nustatymai
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-6 bg-gray-200 rounded animate-pulse" />
            <div className="h-6 bg-gray-200 rounded animate-pulse" />
            <div className="h-6 bg-gray-200 rounded animate-pulse" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white border-gray-200 animate-fade-in">
      <CardHeader>
        <CardTitle className="text-black flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Administratoriaus Nustatymai
        </CardTitle>
        <CardDescription>
          Konfigūruokite pranešimų nustatymus ir sistemos preferencijas
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Email Notifications Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-black" />
              <h3 className="text-lg font-semibold text-black">El. pašto pranešimai</h3>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleTestEmail}
                disabled={isTesting}
                variant="outline"
                className="text-sm"
              >
                {isTesting ? 'Siunčiama...' : 'Išbandyti el. paštą'}
              </Button>
              <Button
                onClick={handleTestPrizeEmail}
                disabled={isTestingPrize}
                variant="outline"
                className="text-sm"
              >
                {isTestingPrize ? 'Siunčiama...' : 'Testuoti prizo pranešimą'}
              </Button>
              <Button
                onClick={handleTestPrizeEmailDirect}
                disabled={isTestingDirect}
                variant="outline"
                className="text-sm"
              >
                {isTestingDirect ? 'Testuojama...' : 'Direct HTTP testas'}
              </Button>
            </div>
          </div>
          <p className="text-sm text-gray-600">
            Pasirinkite, apie kokius įvykius norite gauti el. pašto pranešimus
          </p>
          
          <div className="space-y-4 ml-7">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="prize-redemptions" className="text-black font-medium">
                  Prizų išpirkimo prašymai
                </Label>
                <p className="text-sm text-gray-600">
                  Gauti pranešimus, kai naudotojai prašo išpirkti prizus
                </p>
              </div>
              <Switch
                id="prize-redemptions"
                checked={settings.prizeRedemptions}
                onCheckedChange={(value) => handleSettingChange('prizeRedemptions', value)}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="new-registrations" className="text-black font-medium">
                  Naujos registracijos
                </Label>
                <p className="text-sm text-gray-600">
                  Gauti pranešimus apie naujus naudotojus
                </p>
              </div>
              <Switch
                id="new-registrations"
                checked={settings.newUserRegistrations}
                onCheckedChange={(value) => handleSettingChange('newUserRegistrations', value)}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="points-deductions" className="text-black font-medium">
                  Taškų atėmimas
                </Label>
                <p className="text-sm text-gray-600">
                  Gauti pranešimus apie taškų atėmimo veiksmus
                </p>
              </div>
              <Switch
                id="points-deductions"
                checked={settings.pointsDeductions}
                onCheckedChange={(value) => handleSettingChange('pointsDeductions', value)}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="system-updates" className="text-black font-medium">
                  Sistemos atnaujinimai
                </Label>
                <p className="text-sm text-gray-600">
                  Gauti pranešimus apie sistemos priežiūrą ir atnaujinimus
                </p>
              </div>
              <Switch
                id="system-updates"
                checked={settings.systemUpdates}
                onCheckedChange={(value) => handleSettingChange('systemUpdates', value)}
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Admin Information */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-black" />
            <h3 className="text-lg font-semibold text-black">Administratoriaus informacija</h3>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">El. paštas:</span>
              <span className="text-sm text-black font-medium">{user?.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Vardas:</span>
              <span className="text-sm text-black font-medium">{user?.user_metadata?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Rolė:</span>
              <span className="text-sm text-black font-medium">Administratorius</span>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="pt-4">
          <Button 
            onClick={saveSettings} 
            disabled={isSaving}
            className="bg-vcs-blue hover:bg-vcs-blue/90 w-full"
          >
            {isSaving ? 'Išsaugoma...' : 'Išsaugoti nustatymus'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}; 