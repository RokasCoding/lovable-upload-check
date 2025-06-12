import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Prize } from '@/types';
import { Edit2, Trash2, Eye, ToggleLeft, ToggleRight } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

interface AdminPrizesProps {
  prizes: Prize[];
  isLoading: boolean;
  onCreatePrize: () => void;
  onRefreshPrizes: () => void;
}

export const AdminPrizes: React.FC<AdminPrizesProps> = ({ 
  prizes, 
  isLoading, 
  onCreatePrize,
  onRefreshPrizes
}) => {
  const { toast } = useToast();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedPrize, setSelectedPrize] = useState<Prize | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Edit form states
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editPoints, setEditPoints] = useState('');
  const [editImageUrl, setEditImageUrl] = useState('');
  const [editIsActive, setEditIsActive] = useState(true);

  const { user } = useAuth ? useAuth() : { user: null };
  const isAdmin = user?.user_metadata?.role === 'admin';

  const handleEditPrize = (prize: Prize) => {
    setSelectedPrize(prize);
    setEditName(prize.name);
    setEditDescription(prize.description);
    setEditPoints(prize.points.toString());
    setEditImageUrl(prize.imageUrl || '');
    setEditIsActive(prize.isActive);
    setEditDialogOpen(true);
  };

  const handleViewPrize = (prize: Prize) => {
    setSelectedPrize(prize);
    setViewDialogOpen(true);
  };

  const handleDeletePrize = (prize: Prize) => {
    setSelectedPrize(prize);
    setDeleteDialogOpen(true);
  };

  const handleToggleActive = async (prize: Prize) => {
    setIsProcessing(true);
    try {
      const { error } = await supabase
        .from('prizes')
        .update({ is_active: !prize.isActive })
        .eq('id', prize.id);

      if (error) throw error;

      toast({
        title: 'Sėkmė',
        description: `Prizas ${!prize.isActive ? 'aktyvuotas' : 'deaktyvuotas'}`,
      });

      onRefreshPrizes();
    } catch (error: any) {
      toast({
        title: 'Klaida',
        description: 'Nepavyko pakeisti prizą',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const saveEditedPrize = async () => {
    if (!selectedPrize || !editName || !editDescription || !editPoints) {
      toast({
        title: 'Klaida',
        description: 'Prašome užpildyti visus privalomus laukus',
        variant: 'destructive',
      });
      return;
    }

    setIsProcessing(true);
    try {
      const { error } = await supabase
        .from('prizes')
        .update({
          name: editName,
          description: editDescription,
          points: parseInt(editPoints),
          image_url: editImageUrl || null,
          is_active: editIsActive,
          updated_at: new Date().toISOString(),
        })
        .eq('id', selectedPrize.id);

      if (error) throw error;

      toast({
        title: 'Sėkmė',
        description: 'Prizas sėkmingai atnaujintas',
      });

      setEditDialogOpen(false);
      onRefreshPrizes();
    } catch (error: any) {
      toast({
        title: 'Klaida',
        description: 'Nepavyko atnaujinti prizą',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const deletePrize = async () => {
    if (!selectedPrize) return;

    setIsProcessing(true);
    try {
      const { error } = await supabase
        .from('prizes')
        .delete()
        .eq('id', selectedPrize.id);

      if (error) throw error;

      toast({
        title: 'Sėkmė',
        description: 'Prizas sėkmingai ištrintas',
      });

      setDeleteDialogOpen(false);
      onRefreshPrizes();
    } catch (error: any) {
      toast({
        title: 'Klaida',
        description: 'Nepavyko ištrinti prizą',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const activePrizes = prizes.filter(prize => prize.isActive);
  const inactivePrizes = prizes.filter(prize => !prize.isActive);

  const renderPrizeTable = (prizeList: Prize[], title: string, emptyMessage: string) => (
    <Card className="bg-white border-gray-200 animate-fade-in">
      <CardHeader>
        <CardTitle className="text-black">{title}</CardTitle>
        <CardDescription>
          {title.includes('Aktyvūs') ? 'Šie prizai yra matomi naudotojams' : 'Šie prizai nematomi naudotojams'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {prizeList.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {emptyMessage}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table className="vcs-table">
              <TableHeader>
                <TableRow className="hover:bg-gray-50 border-black">
                  <TableHead className="text-black font-bold">Prizas</TableHead>
                  <TableHead className="text-black font-bold">Aprašymas</TableHead>
                  <TableHead className="text-black font-bold">Būsena</TableHead>
                  <TableHead className="text-black font-bold text-right">Taškų Kaina</TableHead>
                  <TableHead className="text-black font-bold text-center">Veiksmai</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {prizeList.map((prize) => (
                  <TableRow key={prize.id} className="hover:bg-gray-50 border-black">
                    <TableCell className="font-medium text-black">
                      <div className="flex items-center gap-2">
                        {prize.imageUrl && (
                          <img 
                            src={prize.imageUrl} 
                            alt={prize.name}
                            className="h-8 w-8 object-cover rounded"
                          />
                        )}
                        {prize.name}
                      </div>
                    </TableCell>
                    <TableCell className="text-black max-w-xs">
                      <div className="truncate" title={prize.description}>
                        {prize.description}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge variant={prize.isActive ? 'outline' : 'secondary'} className={
                          prize.isActive 
                            ? 'bg-green-100 text-green-800 border-green-300' 
                            : 'bg-gray-100 text-gray-800 border-gray-300'
                        }>
                          {prize.isActive ? 'Aktyvus' : 'Neaktyvus'}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleActive(prize)}
                          disabled={isProcessing}
                          className="p-1"
                        >
                          {prize.isActive ? (
                            <ToggleRight className="h-4 w-4 text-green-600" />
                          ) : (
                            <ToggleLeft className="h-4 w-4 text-gray-400" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {!isAdmin && <span className="point-badge">{prize.points}</span>}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewPrize(prize)}
                          className="p-2"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditPrize(prize)}
                          className="p-2"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeletePrize(prize)}
                          className="p-2 text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <>
      {/* Header with Add Prize Button */}
      <div className="flex flex-row items-center justify-between mb-6 p-4 bg-white border border-gray-200 rounded-lg">
        <div>
          <h2 className="text-xl font-semibold text-black">Prizų Katalogas</h2>
          <p className="text-gray-600">Valdyti galimus prizus iškeitimui</p>
        </div>
        <Button 
          onClick={onCreatePrize}
          className="bg-vcs-blue hover:bg-vcs-blue/90"
        >
          Pridėti Naują Prizą
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-6">
          <Card className="bg-white border-gray-200">
            <CardContent className="p-6">
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-12 w-full bg-gray-200" />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="space-y-6">
          {renderPrizeTable(activePrizes, 'Aktyvūs Prizai', 'Nėra aktyvių prizų')}
          {renderPrizeTable(inactivePrizes, 'Neaktyvūs Prizai', 'Nėra neaktyvių prizų')}
        </div>
      )}

      {/* View Prize Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Prizas: {selectedPrize?.name}</DialogTitle>
          </DialogHeader>
          {selectedPrize && (
            <div className="space-y-4">
              {selectedPrize.imageUrl && (
                <img 
                  src={selectedPrize.imageUrl} 
                  alt={selectedPrize.name}
                  className="w-full h-48 object-cover rounded"
                />
              )}
              <div>
                <Label className="font-semibold">Aprašymas:</Label>
                <p className="mt-1">{selectedPrize.description}</p>
              </div>
              <div className="flex justify-between">
                <div>
                  <Label className="font-semibold">Taškų kaina:</Label>
                  <p className="mt-1">{selectedPrize.points}</p>
                </div>
                <div>
                  <Label className="font-semibold">Būsena:</Label>
                  <p className="mt-1">{selectedPrize.isActive ? 'Aktyvus' : 'Neaktyvus'}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Prize Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Redaguoti Prizą</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Pavadinimas</Label>
              <Input
                id="edit-name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Prizas pavadinimas"
              />
            </div>
            <div>
              <Label htmlFor="edit-description">Aprašymas</Label>
              <Textarea
                id="edit-description"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="Prizas aprašymas"
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="edit-points">Taškų kaina</Label>
              <Input
                id="edit-points"
                type="number"
                value={editPoints}
                onChange={(e) => setEditPoints(e.target.value)}
                placeholder="0"
                min="1"
              />
            </div>
            <div>
              <Label htmlFor="edit-image">Nuotraukos URL</Label>
              <Input
                id="edit-image"
                value={editImageUrl}
                onChange={(e) => setEditImageUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="edit-active"
                checked={editIsActive}
                onCheckedChange={setEditIsActive}
              />
              <Label htmlFor="edit-active">Aktyvus</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Atšaukti
            </Button>
            <Button onClick={saveEditedPrize} disabled={isProcessing}>
              {isProcessing ? 'Išsaugoma...' : 'Išsaugoti'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Prize Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Ar tikrai norite ištrinti šį prizą?</AlertDialogTitle>
            <AlertDialogDescription>
              Šis veiksmas negalės būti anuliuotas. Prizas "{selectedPrize?.name}" bus visam laikui ištrintas iš sistemos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Atšaukti</AlertDialogCancel>
            <AlertDialogAction 
              onClick={deletePrize}
              disabled={isProcessing}
              className="bg-red-600 hover:bg-red-700"
            >
              {isProcessing ? 'Trinamas...' : 'Ištrinti'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
