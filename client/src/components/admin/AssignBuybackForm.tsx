import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

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

interface AssignBuybackFormProps {
  open: boolean;
  onClose: () => void;
  buybackRequestId?: number;
}

export function AssignBuybackForm({ open, onClose, buybackRequestId }: AssignBuybackFormProps) {
  const [selectedPartnerId, setSelectedPartnerId] = useState<string>('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Reset selected partner when dialog opens or buybackRequestId changes
  useEffect(() => {
    if (open) {
      setSelectedPartnerId('');
    }
  }, [open, buybackRequestId]);

  // Fetch the partners list
  const { data: partners, isLoading: loadingPartners } = useQuery({
    queryKey: ['/api/partners'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/partners');
      return response.json();
    },
    enabled: open
  });

  // Fetch buyback requests (or the specific request if ID is provided)
  const { data: buybackRequests, isLoading: loadingRequests } = useQuery({
    queryKey: ['/api/buyback-requests', buybackRequestId],
    queryFn: async () => {
      const url = buybackRequestId 
        ? `/api/buyback-requests/${buybackRequestId}` 
        : '/api/buyback-requests';
      
      const response = await apiRequest('GET', url);
      const data = await response.json();
      
      // If we fetched a specific request, wrap it in an array
      return buybackRequestId ? [data] : data;
    },
    enabled: open
  });

  // Mutation to assign a partner to a buyback request
  const assignPartnerMutation = useMutation({
    mutationFn: async ({ buybackId, partnerId }: { buybackId: number; partnerId: number }) => {
      const response = await apiRequest('POST', '/api/partners/assign-buyback', {
        buybackRequestId: buybackId,
        partnerId
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Partner successfully assigned to the buyback request',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/buyback-requests'] });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: `Failed to assign partner: ${error.message || 'Unknown error'}`,
        variant: 'destructive'
      });
    }
  });

  const handleAssign = () => {
    if (!selectedPartnerId || !buybackRequestId) {
      toast({
        title: 'Error',
        description: 'Please select a partner to assign',
        variant: 'destructive'
      });
      return;
    }

    assignPartnerMutation.mutate({
      buybackId: buybackRequestId,
      partnerId: parseInt(selectedPartnerId)
    });
  };

  const isLoading = loadingPartners || loadingRequests || assignPartnerMutation.isPending;
  const buybackRequest = buybackRequests?.find((req: BuybackRequest) => req.id === buybackRequestId);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Assign Partner to Buyback Request</DialogTitle>
          <DialogDescription>
            Select a partner to handle this buyback request. The partner will be notified and responsible for device collection and processing.
          </DialogDescription>
        </DialogHeader>
        
        {isLoading ? (
          <div className="flex justify-center my-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="space-y-4 my-2">
            {buybackRequest && (
              <div className="space-y-1">
                <h4 className="text-sm font-medium">Buyback Request Details</h4>
                <div className="bg-muted p-3 rounded-md text-sm space-y-1">
                  <p><span className="font-medium">Device:</span> {buybackRequest.manufacturer} {buybackRequest.model}</p>
                  <p><span className="font-medium">Type:</span> {buybackRequest.device_type}</p>
                  <p><span className="font-medium">Current Status:</span> {buybackRequest.status}</p>
                  <p><span className="font-medium">Created:</span> {new Date(buybackRequest.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            )}
            
            <div className="space-y-1">
              <Label htmlFor="partner">Select Partner</Label>
              <Select
                value={selectedPartnerId}
                onValueChange={setSelectedPartnerId}
                disabled={isLoading}
              >
                <SelectTrigger id="partner">
                  <SelectValue placeholder="Select a partner" />
                </SelectTrigger>
                <SelectContent>
                  {partners && partners.map((partner: Partner) => (
                    <SelectItem key={partner.id} value={partner.id.toString()}>
                      {partner.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {selectedPartnerId && partners && (
              <div className="bg-muted p-3 rounded-md text-sm space-y-1">
                <h4 className="font-medium">Partner Details</h4>
                {(() => {
                  const partner = partners.find((p: Partner) => p.id === parseInt(selectedPartnerId));
                  return partner ? (
                    <>
                      <p><span className="font-medium">Email:</span> {partner.email}</p>
                      {partner.phone && <p><span className="font-medium">Phone:</span> {partner.phone}</p>}
                      <p><span className="font-medium">Status:</span> {partner.active ? 'Active' : 'Inactive'}</p>
                    </>
                  ) : null;
                })()}
              </div>
            )}
          </div>
        )}
        
        <DialogFooter className="flex space-x-2 sm:justify-end">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button 
            onClick={handleAssign} 
            disabled={!selectedPartnerId || isLoading}
            className={isLoading ? 'opacity-70 cursor-not-allowed' : ''}
          >
            {isLoading ? 'Assigning...' : 'Assign Partner'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}