import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Copy, Check } from 'lucide-react';
import { format } from 'date-fns';
import { User, PrizeRedemption, RegistrationLink } from '@/types';

interface AdminDialogsProps {
  // Invite User Dialog
  inviteDialogOpen: boolean;
  setInviteDialogOpen: (open: boolean) => void;
  inviteName: string;
  setInviteName: (name: string) => void;
  inviteEmail: string;
  setInviteEmail: (email: string) => void;
  inviteRole: 'user' | 'admin';
  setInviteRole: (role: 'user' | 'admin') => void;
  onInviteUser: () => void;

  // New Prize Dialog
  newPrizeDialogOpen: boolean;
  setNewPrizeDialogOpen: (open: boolean) => void;
  prizeName: string;
  setPrizeName: (name: string) => void;
  prizeDescription: string;
  setPrizeDescription: (description: string) => void;
  prizePoints: string;
  setPrizePoints: (points: string) => void;
  prizeImage: string;
  setPrizeImage: (image: string) => void;
  onCreatePrize: () => void;

  // Bonus Dialog
  newBonusDialogOpen: boolean;
  setNewBonusDialogOpen: (open: boolean) => void;
  bonusUserId: string;
  setBonusUserId: (userId: string) => void;
  bonusCourseName: string;
  setBonusCourseName: (courseName: string) => void;
  bonusCoursePrice: string;
  setBonusCoursePrice: (price: string) => void;
  bonusPointsAwarded: string;
  setBonusPointsAwarded: (points: string) => void;
  users: User[];
  onAddBonus: () => void;
  onBonusDialogClose?: () => void;

  // Redemption Dialog
  redemptionDialogOpen: boolean;
  setRedemptionDialogOpen: (open: boolean) => void;
  selectedRedemption: PrizeRedemption | null;
  rejectionComment: string;
  setRejectionComment: (comment: string) => void;
  onRedemptionAction: (action: 'approved' | 'rejected') => void;

  // Link Generator Dialog
  linkGeneratorOpen: boolean;
  setLinkGeneratorOpen: (open: boolean) => void;
  linkType: 'no-points' | 'with-points';
  setLinkType: (type: 'no-points' | 'with-points') => void;
  linkPoints: string;
  setLinkPoints: (points: string) => void;
  generatedLink: string;
  linkCopied: boolean;
  onGenerateLink: () => void;
  onCopyLink: () => void;

  isProcessing: boolean;

  registrationLinks: RegistrationLink[];
  selectedRegistrationLinkId: string;
  setSelectedRegistrationLinkId: (id: string) => void;
}

export const AdminDialogs: React.FC<AdminDialogsProps> = ({
  inviteDialogOpen,
  setInviteDialogOpen,
  inviteName,
  setInviteName,
  inviteEmail,
  setInviteEmail,
  inviteRole,
  setInviteRole,
  onInviteUser,
  
  newPrizeDialogOpen,
  setNewPrizeDialogOpen,
  prizeName,
  setPrizeName,
  prizeDescription,
  setPrizeDescription,
  prizePoints,
  setPrizePoints,
  prizeImage,
  setPrizeImage,
  onCreatePrize,

  newBonusDialogOpen,
  setNewBonusDialogOpen,
  bonusUserId,
  setBonusUserId,
  bonusCourseName,
  setBonusCourseName,
  bonusCoursePrice,
  setBonusCoursePrice,
  bonusPointsAwarded,
  setBonusPointsAwarded,
  users,
  onAddBonus,
  onBonusDialogClose,

  redemptionDialogOpen,
  setRedemptionDialogOpen,
  selectedRedemption,
  rejectionComment,
  setRejectionComment,
  onRedemptionAction,

  linkGeneratorOpen,
  setLinkGeneratorOpen,
  linkType,
  setLinkType,
  linkPoints,
  setLinkPoints,
  generatedLink,
  linkCopied,
  onGenerateLink,
  onCopyLink,

  isProcessing,

  registrationLinks,
  selectedRegistrationLinkId,
  setSelectedRegistrationLinkId,
}) => {
  const handleBonusDialogClose = () => {
    setNewBonusDialogOpen(false);
    if (onBonusDialogClose) {
      onBonusDialogClose();
    }
  };

  const selectedLink = registrationLinks.find(l => l.id === selectedRegistrationLinkId);

  return (
    <>
      {/* Invite User Dialog */}
      <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
        <DialogContent className="bg-white text-black border-gray-300">
          <DialogHeader>
            <DialogTitle>Pakviesti Naudotoją</DialogTitle>
            <DialogDescription>
              Išsiųskite pakvietimą el. paštu naujam naudotojui prisijungti prie platformos.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Vardas ir Pavardė</Label>
              <Input
                id="name"
                value={inviteName}
                onChange={(e) => setInviteName(e.target.value)}
                placeholder="Jonas Jonaitis"
                className="bg-gray-50 text-black border-gray-300"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">El. paštas</Label>
              <Input
                id="email"
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="naudotojas@pavyzdys.lt"
                className="bg-gray-50 text-black border-gray-300"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="role">Rolė</Label>
              <Select value={inviteRole} onValueChange={(value: 'admin' | 'user') => setInviteRole(value)}>
                <SelectTrigger className="bg-gray-50 text-black border-gray-300">
                  <SelectValue placeholder="Pasirinkite rolę" />
                </SelectTrigger>
                <SelectContent className="bg-gray-50 text-black border-gray-300">
                  <SelectItem value="user">Naudotojas</SelectItem>
                  <SelectItem value="admin">Administratorius</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="invite-link">Registracijos nuoroda</Label>
              <Select value={selectedRegistrationLinkId} onValueChange={setSelectedRegistrationLinkId}>
                <SelectTrigger className="bg-gray-50 text-black border-gray-300">
                  <SelectValue placeholder="Pasirinkite nuorodą" />
                </SelectTrigger>
                <SelectContent className="bg-gray-50 text-black border-gray-300">
                  {registrationLinks.filter(l => l.is_active && !l.used_at).map(link => (
                    <SelectItem key={link.id} value={link.id}>
                      {link.link_token} ({link.points} taškų)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedLink && (
                <div className="text-sm text-gray-600 mt-1">Ši nuoroda suteiks: <b>{selectedLink.points}</b> taškų</div>
              )}
            </div>
          </div>
          
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setInviteDialogOpen(false)}
              className="border-gray-300 text-black hover:bg-gray-100"
            >
              Atšaukti
            </Button>
            <Button 
              onClick={onInviteUser} 
              className="bg-vcs-blue hover:bg-vcs-blue/90"
              disabled={isProcessing}
            >
              {isProcessing ? 'Siunčiama...' : 'Siųsti Pakvietimą'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Prize Dialog */}
      <Dialog open={newPrizeDialogOpen} onOpenChange={setNewPrizeDialogOpen}>
        <DialogContent className="bg-white text-black border-gray-300">
          <DialogHeader>
            <DialogTitle>Pridėti naują prizą</DialogTitle>
            <DialogDescription>
              Įveskite naujo prizo informaciją
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="prize-name">Pavadinimas</Label>
              <Input
                id="prize-name"
                value={prizeName}
                onChange={(e) => setPrizeName(e.target.value)}
                placeholder="Prizo pavadinimas"
                className="bg-gray-50 text-black border-gray-300"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="prize-description">Aprašymas</Label>
              <Textarea
                id="prize-description"
                value={prizeDescription}
                onChange={(e) => setPrizeDescription(e.target.value)}
                placeholder="Prizo aprašymas"
                className="bg-gray-50 text-black border-gray-300"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="prize-points">Taškų kaina</Label>
              <Input
                id="prize-points"
                type="number"
                value={prizePoints}
                onChange={(e) => setPrizePoints(e.target.value)}
                placeholder="100"
                className="bg-gray-50 text-black border-gray-300"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="prize-image">Nuotraukos URL (neprivaloma)</Label>
              <Input
                id="prize-image"
                type="url"
                value={prizeImage}
                onChange={(e) => setPrizeImage(e.target.value)}
                placeholder="https://example.com/image.jpg (neprivaloma)"
                className="bg-gray-50 text-black border-gray-300"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setNewPrizeDialogOpen(false)}
            >
              Atšaukti
            </Button>
            <Button
              type="button"
              onClick={onCreatePrize}
              disabled={!prizeName || !prizeDescription || !prizePoints}
            >
              Pridėti prizą
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Bonus Points Dialog */}
      <Dialog open={newBonusDialogOpen} onOpenChange={(open) => {
        if (!open) {
          handleBonusDialogClose();
        }
      }}>
        <DialogContent className="bg-white text-black border-gray-300">
          <DialogHeader>
            <DialogTitle>Pridėti Bonus Taškų</DialogTitle>
            <DialogDescription>
              Suteikite bonus taškus naudotojui už kursų baigimą.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Show selected user info */}
            {bonusUserId && (
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-medium text-blue-900 mb-1">Pasirinktas naudotojas:</h4>
                <p className="text-blue-800 font-semibold">{users.find(u => u.id === bonusUserId)?.name || 'Naudotojas nerastas'}</p>
                <p className="text-sm text-blue-600">
                  Dabartiniai taškai: {users.find(u => u.id === bonusUserId)?.totalPoints || 0}
                </p>
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="course-name">Kurso Pavadinimas</Label>
              <Input
                id="course-name"
                value={bonusCourseName}
                onChange={(e) => setBonusCourseName(e.target.value)}
                placeholder="JavaScript Pagrindai"
                className="bg-gray-50 text-black border-gray-300"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="course-price">Kurso Kaina (€)</Label>
              <Input
                id="course-price"
                type="number"
                value={bonusCoursePrice}
                onChange={(e) => setBonusCoursePrice(e.target.value)}
                placeholder="399"
                className="bg-gray-50 text-black border-gray-300"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="points-awarded">Suteikiami Taškai</Label>
              <Input
                id="points-awarded"
                type="number"
                value={bonusPointsAwarded}
                onChange={(e) => setBonusPointsAwarded(e.target.value)}
                placeholder="200"
                className="bg-gray-50 text-black border-gray-300"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleBonusDialogClose}
              className="border-gray-300 text-black hover:bg-gray-100"
            >
              Atšaukti
            </Button>
            <Button 
              onClick={onAddBonus} 
              className="bg-vcs-blue hover:bg-vcs-blue/90"
              disabled={isProcessing}
            >
              {isProcessing ? 'Pridedama...' : 'Pridėti Taškus'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Redemption Dialog */}
      <Dialog open={redemptionDialogOpen} onOpenChange={setRedemptionDialogOpen}>
        <DialogContent className="bg-white text-black border-gray-300">
          <DialogHeader>
            <DialogTitle>
              {selectedRedemption?.status === 'pending' ? 'Peržiūrėti Iškeitimo Prašymą' : 'Iškeitimo Detalės'}
            </DialogTitle>
            <DialogDescription>
              {selectedRedemption?.status === 'pending' 
                ? 'Patvirtinkite arba atminkite naudotojo prizų iškeitimo prašymą.'
                : `Šis iškeitimo prašymas buvo ${selectedRedemption?.status}.`
              }
            </DialogDescription>
          </DialogHeader>
          
          {selectedRedemption && (
            <div className="space-y-4 py-4">
              <div className="flex flex-col space-y-1">
                <span className="text-sm text-gray-600">Naudotojas:</span>
                <span className="font-medium">{selectedRedemption.userName}</span>
              </div>
              
              <div className="flex flex-col space-y-1">
                <span className="text-sm text-gray-600">Prizas:</span>
                <span className="font-medium">{selectedRedemption.prizeName}</span>
              </div>
              
              <div className="flex flex-col space-y-1">
                <span className="text-sm text-gray-600">Taškų Kaina:</span>
                <span className="point-badge">{selectedRedemption.pointCost}</span>
              </div>
              
              <div className="flex flex-col space-y-1">
                <span className="text-sm text-gray-600">Prašymo Data:</span>
                <span className="font-medium">
                  {format(new Date(selectedRedemption.requestedAt), 'yyyy-MM-dd, HH:mm')}
                </span>
              </div>
              
              {selectedRedemption.status !== 'pending' && selectedRedemption.updatedAt && (
                <div className="flex flex-col space-y-1">
                  <span className="text-sm text-gray-600">
                    {selectedRedemption.status === 'approved' ? 'Patvirtinimo' : 'Atmetimo'} Data:
                  </span>
                  <span className="font-medium">
                    {format(new Date(selectedRedemption.updatedAt), 'yyyy-MM-dd, HH:mm')}
                  </span>
                </div>
              )}
              
              {selectedRedemption.status === 'rejected' && selectedRedemption.comment && (
                <div className="flex flex-col space-y-1">
                  <span className="text-sm text-gray-600">Atmetimo Priežastis:</span>
                  <span className="font-medium">{selectedRedemption.comment}</span>
                </div>
              )}
              
              {selectedRedemption.status === 'pending' && (
                <div className="space-y-2">
                  <Label htmlFor="rejection-comment">Atmetimo Priežastis (privaloma tik atmetant)</Label>
                  <Textarea
                    id="rejection-comment"
                    value={rejectionComment}
                    onChange={(e) => setRejectionComment(e.target.value)}
                    placeholder="Paaiškinkite, kodėl atmetate šį prašymą..."
                    className="bg-gray-50 text-black border-gray-300"
                    rows={3}
                  />
                </div>
              )}
            </div>
          )}
          
          <DialogFooter className="gap-2 sm:gap-0">
            {selectedRedemption?.status === 'pending' ? (
              <>
                <Button
                  variant="outline"
                  onClick={() => setRedemptionDialogOpen(false)}
                  className="border-gray-300 text-black hover:bg-gray-100"
                >
                  Atšaukti
                </Button>
                <Button 
                  onClick={() => onRedemptionAction('rejected')}
                  variant="destructive"
                  disabled={isProcessing || !rejectionComment.trim()}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {isProcessing ? 'Vykdoma...' : 'Atmesti'}
                </Button>
                <Button 
                  onClick={() => onRedemptionAction('approved')}
                  className="bg-vcs-blue hover:bg-vcs-blue/90"
                  disabled={isProcessing}
                >
                  {isProcessing ? 'Vykdoma...' : 'Patvirtinti'}
                </Button>
              </>
            ) : (
              <Button
                onClick={() => setRedemptionDialogOpen(false)}
                className="bg-vcs-blue hover:bg-vcs-blue/90"
              >
                Uždaryti
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Link Generator Dialog */}
      <Dialog open={linkGeneratorOpen} onOpenChange={setLinkGeneratorOpen}>
        <DialogContent className="bg-white text-black border-gray-300">
          <DialogHeader>
            <DialogTitle>Generuoti Registracijos Nuorodą</DialogTitle>
            <DialogDescription>
              Sukurkite registracijos nuorodą su arba be bonus taškų
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="link-type">Nuorodos tipas</Label>
              <Select value={linkType} onValueChange={(value: 'no-points' | 'with-points') => setLinkType(value)}>
                <SelectTrigger className="bg-gray-50 text-black border-gray-300">
                  <SelectValue placeholder="Pasirinkite tipą" />
                </SelectTrigger>
                <SelectContent className="bg-gray-50 text-black border-gray-300">
                  <SelectItem value="no-points">Be taškų (kampanijoms)</SelectItem>
                  <SelectItem value="with-points">Su taškais</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {linkType === 'with-points' && (
              <div className="space-y-2">
                <Label htmlFor="link-points">Taškų kiekis</Label>
                <Input
                  id="link-points"
                  type="number"
                  value={linkPoints}
                  onChange={(e) => setLinkPoints(e.target.value)}
                  placeholder="10"
                  className="bg-gray-50 text-black border-gray-300"
                />
              </div>
            )}
            
            {generatedLink && (
              <div className="space-y-2">
                <Label htmlFor="generated-link">Sugeneruota nuoroda</Label>
                <div className="flex gap-2">
                  <Input
                    id="generated-link"
                    value={generatedLink}
                    readOnly
                    className="bg-gray-100 text-black border-gray-300"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onCopyLink}
                    className="border-vcs-blue text-vcs-blue hover:bg-vcs-blue hover:text-white"
                  >
                    {linkCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            )}
          </div>
          
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setLinkGeneratorOpen(false)}
              className="border-gray-300 text-black hover:bg-gray-100"
            >
              Uždaryti
            </Button>
            <Button 
              onClick={onGenerateLink} 
              className="bg-vcs-blue hover:bg-vcs-blue/90"
            >
              Generuoti Nuorodą
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
