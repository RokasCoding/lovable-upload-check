import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { User } from '@/types';
import { PlusCircle, MinusCircle, History, Trash2 } from 'lucide-react';

interface AdminUsersProps {
  users: User[];
  isLoading: boolean;
  onInviteUser: () => void;
  onAddBonus: (userId: string) => void;
  onDeductPoints: (user: User) => void;
  onViewHistory: (user: User) => void;
  onDeleteUser: (user: User) => void;
}

export const AdminUsers: React.FC<AdminUsersProps> = ({ 
  users, 
  isLoading, 
  onInviteUser, 
  onAddBonus,
  onDeductPoints,
  onViewHistory,
  onDeleteUser
}) => {
  return (
    <Card className="bg-background border-border animate-fade-in">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-foreground">Naudotojų Valdymas</CardTitle>
          <CardDescription className="text-muted-foreground">Valdyti naudotojų paskyras ir bonus taškus</CardDescription>
        </div>
        <Button 
          onClick={onInviteUser}
          className="bg-primary hover:bg-primary/90"
        >
          Pakviesti Naudotoją
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-12 w-full bg-muted" />
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-muted/50">
                  <TableHead className="text-foreground font-bold">Vardas</TableHead>
                  <TableHead className="text-foreground font-bold">El. paštas</TableHead>
                  <TableHead className="text-foreground font-bold">Telefonas</TableHead>
                  <TableHead className="text-foreground font-bold">Rolė</TableHead>
                  <TableHead className="text-foreground font-bold text-right">Taškai</TableHead>
                  <TableHead className="text-foreground font-bold">Registracija</TableHead>
                  <TableHead className="text-foreground font-bold">Veiksmai</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium text-foreground">
                      {user.name}
                    </TableCell>
                    <TableCell className="text-foreground">
                      {user.email}
                    </TableCell>
                    <TableCell className="text-foreground">
                      {user.phone || 'Nenurodyta'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.role === 'admin' ? 'default' : 'outline'} className={
                        user.role === 'admin' 
                          ? 'bg-primary/10 text-primary border-primary/20' 
                          : 'bg-muted text-muted-foreground border-border'
                      }>
                        {user.role === 'admin' ? 'Administratorius' : 'Naudotojas'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {user.role === 'admin' ? '-' : <span className="point-badge !text-blue-700 dark:!text-blue-300">{user.totalPoints || 0}</span>}
                    </TableCell>
                    <TableCell className="text-foreground">
                      {user.createdAt ? format(new Date(user.createdAt), 'yyyy-MM-dd') : '-'}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2 flex-wrap">
                        <Button 
                          variant="outline"
                          size="sm"
                          className="text-primary hover:text-primary-foreground hover:bg-primary"
                          onClick={() => onAddBonus(user.id)}
                        >
                          <PlusCircle className="w-4 h-4 mr-1" />
                          Pridėti
                        </Button>
                        <Button 
                          variant="outline"
                          size="sm"
                          className="text-destructive hover:text-destructive-foreground hover:bg-destructive"
                          onClick={() => onDeductPoints(user)}
                        >
                          <MinusCircle className="w-4 h-4 mr-1" />
                          Atimti
                        </Button>
                        <Button 
                          variant="outline"
                          size="sm"
                          className="text-muted-foreground hover:text-foreground hover:bg-muted"
                          onClick={() => onViewHistory(user)}
                        >
                          <History className="w-4 h-4 mr-1" />
                          Istorija
                        </Button>
                        {user.role !== 'admin' && (
                          <Button 
                            variant="outline"
                            size="sm"
                            className="text-destructive hover:text-destructive-foreground hover:bg-destructive"
                            onClick={() => onDeleteUser(user)}
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Trinti
                          </Button>
                        )}
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
};
