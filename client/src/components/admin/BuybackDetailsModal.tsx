import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import {
  Calendar,
  User,
  Smartphone,
  Clipboard,
  DollarSign,
  Info,
  Tag,
  MapPin,
  UserCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  RefreshCw,
  X,
  UserCog,
} from 'lucide-react';

interface BuybackRequest {
  id: number;
  user_id: number;
  device_type: string;
  manufacturer: string;
  model: string;
  condition: string;
  status: string;
  created_at: string;
  updated_at: string;
  partner_id: number | null;
  questionnaire_answers?: Record<string, string>;
  imei?: string;
  serial_number?: string;
  estimated_value?: string;
  offered_price?: string;
  final_price?: string;
}

interface Partner {
  id: number;
  name: string;
  email: string;
  phone?: string;
  region_id?: number;
}

interface BuybackDetailsModalProps {
  open: boolean;
  onClose: () => void;
  buybackRequest: BuybackRequest | null;
  partner: Partner | null;
  onAssignPartner: () => void;
  onReassessDevice: () => void;
  onMarkComplete: () => void;
  onViewInvoice: () => void;
  onCancel: () => void;
}

export default function BuybackDetailsModal({
  open,
  onClose,
  buybackRequest,
  partner,
  onAssignPartner,
  onReassessDevice,
  onMarkComplete,
  onViewInvoice,
  onCancel,
}: BuybackDetailsModalProps) {
  if (!buybackRequest) return null;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
          <Clock className="w-3.5 h-3.5 mr-1.5" /> Pending
        </Badge>;
      case 'processing':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
          <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Processing
        </Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" /> Completed
        </Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
          <X className="w-3.5 h-3.5 mr-1.5" /> Cancelled
        </Badge>;
      case 'assigned':
        return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
          <UserCog className="w-3.5 h-3.5 mr-1.5" /> Assigned
        </Badge>;
      default:
        return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
          <AlertTriangle className="w-3.5 h-3.5 mr-1.5" /> {status || 'Unknown'}
        </Badge>;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Buyback Request #{buybackRequest.id}</DialogTitle>
          <DialogDescription>
            Detailed information about this buyback request and customer device
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="details" className="space-y-4">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="condition">Device Condition</TabsTrigger>
            <TabsTrigger value="actions">Actions</TabsTrigger>
          </TabsList>
          
          <TabsContent value="details" className="space-y-4">
            {/* Request Summary */}
            <div className="flex flex-col md:flex-row gap-4">
              <Card className="flex-1">
                <CardHeader>
                  <CardTitle>Device Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center">
                    <Smartphone className="w-4 h-4 mr-2 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{buybackRequest.manufacturer} {buybackRequest.model}</p>
                      <p className="text-sm text-muted-foreground">{buybackRequest.device_type}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Tag className="w-4 h-4 mr-2 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Condition</p>
                      <p className="text-sm">{buybackRequest.condition || 'Not specified'}</p>
                    </div>
                  </div>
                  {buybackRequest.imei && (
                    <div className="flex items-center">
                      <Info className="w-4 h-4 mr-2 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">IMEI</p>
                        <p className="text-sm">{buybackRequest.imei}</p>
                      </div>
                    </div>
                  )}
                  {buybackRequest.serial_number && (
                    <div className="flex items-center">
                      <Info className="w-4 h-4 mr-2 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Serial Number</p>
                        <p className="text-sm">{buybackRequest.serial_number}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="flex-1">
                <CardHeader>
                  <CardTitle>Request Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-2 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Status</p>
                      <div>{getStatusBadge(buybackRequest.status)}</div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Submitted</p>
                      <p className="text-sm">{formatDate(buybackRequest.created_at)}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Last Updated</p>
                      <p className="text-sm">{formatDate(buybackRequest.updated_at)}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <User className="w-4 h-4 mr-2 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Customer ID</p>
                      <p className="text-sm">#{buybackRequest.user_id}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Value Information */}
            <Card>
              <CardHeader>
                <CardTitle>Pricing Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-muted p-4 rounded-md">
                    <div className="text-sm text-muted-foreground mb-1">Estimated Value</div>
                    <div className="text-2xl font-bold flex items-center">
                      <DollarSign className="w-5 h-5 mr-1" />
                      {buybackRequest.estimated_value || '0.00'}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">Initial system valuation</div>
                  </div>
                  
                  <div className="bg-muted p-4 rounded-md">
                    <div className="text-sm text-muted-foreground mb-1">Offered Price</div>
                    <div className="text-2xl font-bold flex items-center">
                      <DollarSign className="w-5 h-5 mr-1" />
                      {buybackRequest.offered_price || buybackRequest.estimated_value || '0.00'}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">Price quoted to customer</div>
                  </div>
                  
                  <div className="bg-green-50 p-4 rounded-md">
                    <div className="text-sm text-green-700 mb-1">Final Trade-in Value</div>
                    <div className="text-2xl font-bold flex items-center text-green-700">
                      <DollarSign className="w-5 h-5 mr-1" />
                      {buybackRequest.final_price || buybackRequest.offered_price || buybackRequest.estimated_value || '0.00'}
                    </div>
                    <div className="text-xs text-green-600 mt-1">Final amount after assessment</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Partner Information (if assigned) */}
            {partner && (
              <Card>
                <CardHeader>
                  <CardTitle>Partner Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center">
                    <UserCheck className="w-4 h-4 mr-2 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Assigned Partner</p>
                      <p className="text-sm">{partner.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Info className="w-4 h-4 mr-2 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Contact Email</p>
                      <p className="text-sm">{partner.email}</p>
                    </div>
                  </div>
                  {partner.phone && (
                    <div className="flex items-center">
                      <Info className="w-4 h-4 mr-2 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Phone</p>
                        <p className="text-sm">{partner.phone}</p>
                      </div>
                    </div>
                  )}
                  {partner.region_id && (
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-2 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Region ID</p>
                        <p className="text-sm">#{partner.region_id}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="condition" className="space-y-4">
            {/* Condition details */}
            {buybackRequest.questionnaire_answers && 
              Object.keys(buybackRequest.questionnaire_answers).length > 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle>Device Condition Assessment</CardTitle>
                  <CardDescription>
                    Responses provided by the customer about the device condition
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(buybackRequest.questionnaire_answers).map(([question, answer], idx) => (
                      <div key={idx} className="p-4 bg-muted rounded-md">
                        <p className="text-sm font-medium">{question}</p>
                        <p className="text-sm mt-1">{answer}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="py-8">
                  <div className="text-center space-y-3">
                    <Clipboard className="w-12 h-12 text-muted-foreground mx-auto" />
                    <p className="text-muted-foreground">No condition questionnaire data available</p>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {/* Overall Condition */}
            <Card>
              <CardHeader>
                <CardTitle>Overall Condition</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-4 bg-muted rounded-md">
                  <p className="text-sm font-medium">Current condition assessment:</p>
                  <p className="text-xl mt-1 font-semibold">{buybackRequest.condition || 'Not assessed yet'}</p>
                </div>
              </CardContent>
              {(buybackRequest.status === 'assigned' || buybackRequest.status === 'processing') && (
                <CardFooter>
                  <Button onClick={onReassessDevice} className="w-full">
                    <Clipboard className="w-4 h-4 mr-2" />
                    Reassess Device Condition
                  </Button>
                </CardFooter>
              )}
            </Card>
          </TabsContent>
          
          <TabsContent value="actions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Available Actions</CardTitle>
                <CardDescription>
                  Manage this buyback request with the actions below
                </CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {buybackRequest.status !== 'completed' && buybackRequest.status !== 'cancelled' && (
                  <>
                    {!buybackRequest.partner_id && (
                      <Button onClick={onAssignPartner} className="w-full">
                        <UserCheck className="w-4 h-4 mr-2" />
                        Assign Partner
                      </Button>
                    )}
                    
                    {(buybackRequest.status === 'assigned' || buybackRequest.status === 'processing') && (
                      <Button onClick={onReassessDevice} className="w-full">
                        <Clipboard className="w-4 h-4 mr-2" />
                        Reassess Device & Update Price
                      </Button>
                    )}
                    
                    <Button onClick={onMarkComplete} className="w-full" variant="default">
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Mark as Complete
                    </Button>
                    
                    <Button onClick={onCancel} className="w-full" variant="destructive">
                      <X className="w-4 h-4 mr-2" />
                      Cancel Request
                    </Button>
                  </>
                )}
                
                {buybackRequest.status === 'completed' && (
                  <Button onClick={onViewInvoice} className="w-full md:col-span-2">
                    <Clipboard className="w-4 h-4 mr-2" />
                    View/Print Invoice
                  </Button>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}