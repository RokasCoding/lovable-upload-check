
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Prize } from '@/types';

interface AdminPrizesProps {
  prizes: Prize[];
  isLoading: boolean;
  onCreatePrize: () => void;
}

export const AdminPrizes: React.FC<AdminPrizesProps> = ({ 
  prizes, 
  isLoading, 
  onCreatePrize 
}) => {
  return (
    <Card className="bg-white border-gray-200 animate-fade-in">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-black">Prizų Katalogas</CardTitle>
          <CardDescription>Valdyti galimus prizus iškeitimui</CardDescription>
        </div>
        <Button 
          onClick={onCreatePrize}
          className="bg-vcs-blue hover:bg-vcs-blue/90"
        >
          Pridėti Naują Prizą
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
                  <TableHead className="text-black font-bold">Prizas</TableHead>
                  <TableHead className="text-black font-bold">Aprašymas</TableHead>
                  <TableHead className="text-black font-bold">Būsena</TableHead>
                  <TableHead className="text-black font-bold text-right">Taškų Kaina</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {prizes.map((prize) => (
                  <TableRow key={prize.id} className="hover:bg-gray-50 border-black">
                    <TableCell className="font-medium text-black">
                      {prize.name}
                    </TableCell>
                    <TableCell className="text-black">
                      {prize.description}
                    </TableCell>
                    <TableCell>
                      <Badge variant={prize.active ? 'outline' : 'secondary'} className={
                        prize.active 
                          ? 'bg-green-100 text-green-800 border-green-300' 
                          : 'bg-gray-100 text-gray-800 border-gray-300'
                      }>
                        {prize.active ? 'Aktyvus' : 'Neaktyvus'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="point-badge">{prize.pointCost}</span>
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
