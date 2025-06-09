
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { PrizeRedemption } from '@/types';

interface AdminRedemptionsProps {
  redemptions: PrizeRedemption[];
  isLoading: boolean;
  onViewRedemption: (redemption: PrizeRedemption) => void;
  onRedemptionAction: (redemption: PrizeRedemption, action: 'approved' | 'rejected') => void;
}

export const AdminRedemptions: React.FC<AdminRedemptionsProps> = ({ 
  redemptions, 
  isLoading, 
  onViewRedemption, 
  onRedemptionAction 
}) => {
  return (
    <Card className="bg-white border-gray-200 animate-fade-in">
      <CardHeader>
        <CardTitle className="text-black">Prizų Iškeitimo Prašymai</CardTitle>
        <CardDescription>Valdyti naudotojų prizų iškeitimo prašymus</CardDescription>
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
                  <TableHead className="text-black font-bold">Data</TableHead>
                  <TableHead className="text-black font-bold">Naudotojas</TableHead>
                  <TableHead className="text-black font-bold">Prizas</TableHead>
                  <TableHead className="text-black font-bold text-right">Taškai</TableHead>
                  <TableHead className="text-black font-bold">Būsena</TableHead>
                  <TableHead className="text-black font-bold">Veiksmai</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {redemptions.map((redemption) => (
                  <TableRow key={redemption.id} className="hover:bg-gray-50 border-black">
                    <TableCell className="font-medium text-black">
                      {format(new Date(redemption.requestedAt), 'yyyy-MM-dd')}
                    </TableCell>
                    <TableCell className="text-black">
                      {redemption.userName}
                    </TableCell>
                    <TableCell className="text-black">
                      {redemption.prizeName}
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="point-badge">{redemption.pointCost}</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={
                        redemption.status === 'pending' 
                          ? 'bg-yellow-100 text-yellow-800 border-yellow-300' 
                          : redemption.status === 'approved' 
                            ? 'bg-green-100 text-green-800 border-green-300' 
                            : 'bg-red-100 text-red-800 border-red-300'
                      }>
                        {redemption.status === 'pending' ? 'Laukia' : 
                         redemption.status === 'approved' ? 'Patvirtinta' : 'Atmesta'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {redemption.status === 'pending' ? (
                        <div className="flex gap-2">
                          <Button 
                            variant="ghost"
                            size="sm"
                            className="text-green-600 hover:text-white hover:bg-green-500"
                            onClick={() => onRedemptionAction(redemption, 'approved')}
                          >
                            Patvirtinti
                          </Button>
                          <Button 
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-white hover:bg-red-500"
                            onClick={() => onViewRedemption(redemption)}
                          >
                            Atmesti
                          </Button>
                        </div>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-vcs-blue hover:text-white hover:bg-vcs-blue"
                          onClick={() => onViewRedemption(redemption)}
                        >
                          Peržiūrėti
                        </Button>
                      )}
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
