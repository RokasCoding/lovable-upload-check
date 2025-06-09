
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { User } from '@/types';

interface AdminUsersProps {
  users: User[];
  isLoading: boolean;
  onInviteUser: () => void;
  onAddBonus: (userId: string) => void;
}

export const AdminUsers: React.FC<AdminUsersProps> = ({ 
  users, 
  isLoading, 
  onInviteUser, 
  onAddBonus 
}) => {
  return (
    <Card className="bg-white border-gray-200 animate-fade-in">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-black">Naudotojų Valdymas</CardTitle>
          <CardDescription>Valdyti naudotojų paskyras ir bonus taškus</CardDescription>
        </div>
        <Button 
          onClick={onInviteUser}
          className="bg-vcs-blue hover:bg-vcs-blue/90"
        >
          Pakviesti Naudotoją
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-12 w-full bg-gray-200" />
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table className="vcs-table">
              <TableHeader>
                <TableRow className="hover:bg-gray-50 border-black">
                  <TableHead className="text-black font-bold">Vardas</TableHead>
                  <TableHead className="text-black font-bold">El. paštas</TableHead>
                  <TableHead className="text-black font-bold">Telefonas</TableHead>
                  <TableHead className="text-black font-bold">Rolė</TableHead>
                  <TableHead className="text-black font-bold text-right">Taškai</TableHead>
                  <TableHead className="text-black font-bold">Registracija</TableHead>
                  <TableHead className="text-black font-bold">Veiksmai</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id} className="hover:bg-gray-50 border-black">
                    <TableCell className="font-medium text-black">
                      {user.name}
                    </TableCell>
                    <TableCell className="text-black">
                      {user.email}
                    </TableCell>
                    <TableCell className="text-black">
                      {user.phone || 'Nenurodyta'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.role === 'admin' ? 'default' : 'outline'} className={
                        user.role === 'admin' 
                          ? 'bg-purple-100 text-purple-800 border-purple-300' 
                          : 'bg-blue-100 text-blue-800 border-blue-300'
                      }>
                        {user.role === 'admin' ? 'Administratorius' : 'Naudotojas'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="point-badge">{user.totalPoints}</span>
                    </TableCell>
                    <TableCell className="text-black">
                      {format(new Date(user.createdAt || Date.now()), 'yyyy-MM-dd')}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button 
                          variant="ghost"
                          size="sm"
                          className="text-vcs-blue hover:text-white hover:bg-vcs-blue"
                          onClick={() => onAddBonus(user.id)}
                        >
                          Pridėti Taškų
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
};
