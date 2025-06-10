import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar } from 'lucide-react';
import { format, subDays } from 'date-fns';
import { User } from '@/types';

interface AdminNewMembersProps {
  users: User[];
  isLoading: boolean;
}

export const AdminNewMembers: React.FC<AdminNewMembersProps> = ({ 
  users, 
  isLoading
}) => {
  // Filter new members (registered in last 7 days)
  const newMembers = users.filter(user => {
    if (!user.createdAt) return false;
    const registrationDate = new Date(user.createdAt);
    const weekAgo = subDays(new Date(), 7);
    return registrationDate > weekAgo;
  });

  return (
    <Card className="bg-white border-gray-200 animate-fade-in">
      <CardHeader>
        <CardTitle className="text-black flex items-center">
          <Calendar className="h-5 w-5 mr-2 text-vcs-blue" />
          Nauji Nariai (Paskutinės 7 Dienos)
        </CardTitle>
        <CardDescription>Neseniai užsiregistravę naudotojai sistemoje</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-12 w-full bg-muted" />
            ))}
          </div>
        ) : newMembers.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Nėra naujų narių paskutinių 7 dienų laikotarpyje
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-gray-50 border-black">
                  <TableHead className="text-black font-bold">Vardas</TableHead>
                  <TableHead className="text-black font-bold">El. paštas</TableHead>
                  <TableHead className="text-black font-bold">Registracijos data</TableHead>
                  <TableHead className="text-black font-bold">Taškai</TableHead>
                  <TableHead className="text-black font-bold">Rolė</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {newMembers.map((user) => (
                  <TableRow key={user.id} className="hover:bg-gray-50 border-black">
                    <TableCell className="font-medium text-black">
                      {user.name}
                    </TableCell>
                    <TableCell className="text-black">
                      {user.email}
                    </TableCell>
                    <TableCell className="text-black">
                      {user.createdAt ? format(new Date(user.createdAt), 'yyyy-MM-dd') : '-'}
                    </TableCell>
                    <TableCell>
                      <span className="point-badge">{user.totalPoints || 0}</span>
                    </TableCell>
                    <TableCell className="text-black">
                      {user.role === 'admin' ? 'Administratorius' : 'Naudotojas'}
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
