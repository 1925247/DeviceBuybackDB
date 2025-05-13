import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { LoaderCircle } from 'lucide-react';

interface AssignLeadByPinCodeProps {
  leadId: number;
  onSuccess?: () => void;
}

export const AssignLeadByPinCode: React.FC<AssignLeadByPinCodeProps> = ({ leadId, onSuccess }) => {
  const [pinCode, setPinCode] = useState('');

  const assignLeadMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('POST', '/api/assign-lead', { 
        pin_code: pinCode,
        lead_id: leadId
      });
    },
    onSuccess: async (response) => {
      const data = await response.json();
      toast({
        title: 'Lead Assigned',
        description: `Successfully assigned lead to ${data.partner_name}`,
      });
      
      // Invalidate relevant queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/buyback-requests'] });
      queryClient.invalidateQueries({ queryKey: ['/api/buyback-requests', leadId] });
      
      if (onSuccess) {
        onSuccess();
      }
      
      setPinCode('');
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to assign lead',
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pinCode.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please enter a PIN code',
        variant: 'destructive',
      });
      return;
    }
    
    assignLeadMutation.mutate();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Assign Lead by PIN Code</CardTitle>
        <CardDescription>
          Enter the partner's PIN code to assign this lead to them.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="pin-code">Partner PIN Code</Label>
            <Input
              id="pin-code"
              placeholder="Enter PIN code"
              value={pinCode}
              onChange={(e) => setPinCode(e.target.value)}
              required
            />
          </div>
          <div className="pt-2">
            <Button 
              type="submit" 
              className="w-full" 
              disabled={assignLeadMutation.isPending}
            >
              {assignLeadMutation.isPending ? (
                <>
                  <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                  Assigning...
                </>
              ) : (
                'Assign Lead'
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default AssignLeadByPinCode;