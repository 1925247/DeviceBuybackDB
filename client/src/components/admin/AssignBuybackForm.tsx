import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';

interface BuybackRequest {
  id: number;
  user_id: number;
  device_type: string;
  manufacturer: string;
  model: string;
  status: string;
  created_at: string;
  partner_id: number | null;
}

interface Partner {
  id: number;
  name: string;
  email: string;
  phone?: string;
  region_id?: number;
  active?: boolean;
}

export function AssignBuybackForm() {
  const [selectedBuybackRequest, setSelectedBuybackRequest] = useState<string>('');
  const [selectedPartner, setSelectedPartner] = useState<string>('');
  const queryClient = useQueryClient();

  // Fetch buyback requests
  const { data: buybackRequests, isLoading: isLoadingBuybackRequests } = useQuery({
    queryKey: ['/api/buyback-requests'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/buyback-requests');
      return response.json();
    }
  });

  // Fetch partners
  const { data: partners, isLoading: isLoadingPartners } = useQuery({
    queryKey: ['/api/partners'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/partners');
      return response.json();
    }
  });

  // Mutation for assigning a buyback request to a partner
  const assignBuybackMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/partners/assign-buyback', {
        buybackRequestId: parseInt(selectedBuybackRequest),
        partnerId: parseInt(selectedPartner)
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Buyback request assigned to partner successfully.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/buyback-requests'] });
      setSelectedBuybackRequest('');
      setSelectedPartner('');
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: `Failed to assign buyback request: ${error.message || 'Unknown error'}`,
        variant: 'destructive',
      });
    }
  });

  const handleAssign = () => {
    if (!selectedBuybackRequest || !selectedPartner) {
      toast({
        title: 'Warning',
        description: 'Please select both a buyback request and a partner.',
        variant: 'destructive',
      });
      return;
    }

    assignBuybackMutation.mutate();
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Assign Buyback Request to Partner</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6">
          <div className="grid gap-2">
            <Label htmlFor="buyback-request">Buyback Request</Label>
            <Select 
              value={selectedBuybackRequest} 
              onValueChange={setSelectedBuybackRequest}
              disabled={isLoadingBuybackRequests}
            >
              <SelectTrigger id="buyback-request">
                <SelectValue placeholder="Select a buyback request" />
              </SelectTrigger>
              <SelectContent>
                {buybackRequests && buybackRequests.map((request: BuybackRequest) => (
                  <SelectItem key={request.id} value={request.id.toString()}>
                    {request.manufacturer} {request.model} ({request.status})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="partner">Partner</Label>
            <Select 
              value={selectedPartner} 
              onValueChange={setSelectedPartner}
              disabled={isLoadingPartners}
            >
              <SelectTrigger id="partner">
                <SelectValue placeholder="Select a partner" />
              </SelectTrigger>
              <SelectContent>
                {partners && partners.map((partner: Partner) => (
                  <SelectItem key={partner.id} value={partner.id.toString()}>
                    {partner.name} ({partner.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <Button 
            onClick={handleAssign} 
            disabled={assignBuybackMutation.isPending || !selectedBuybackRequest || !selectedPartner}
          >
            {assignBuybackMutation.isPending ? 'Assigning...' : 'Assign to Partner'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}