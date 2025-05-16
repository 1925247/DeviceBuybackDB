import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  FileText, 
  Edit, 
  Trash, 
  RefreshCw,
  Search,
  Plus,
  Upload 
} from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogClose 
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

interface Partner {
  id: number;
  name: string;
  slug: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pinCode: string;
  gstNumber: string;
  panNumber: string;
  status: 'pending' | 'approved' | 'rejected' | 'incomplete';
  documents: PartnerDocument[];
  createdAt: string;
}

interface PartnerDocument {
  id: number;
  partnerId: number;
  type: string;
  fileUrl: string;
  status: 'pending' | 'approved' | 'rejected';
  notes?: string;
  uploadedAt: string;
}

const PartnerOnboarding: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddPartnerDialogOpen, setIsAddPartnerDialogOpen] = useState(false);
  const [isViewDocumentsDialogOpen, setIsViewDocumentsDialogOpen] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Fetch partners
  const { data: partners, isLoading } = useQuery<Partner[]>({
    queryKey: ['/api/partners', selectedTab],
    queryFn: async () => {
      return apiRequest('GET', `/api/partners?status=${selectedTab}`).then(res => res.json());
    },
  });
  
  // Approve partner mutation
  const approvePartnerMutation = useMutation({
    mutationFn: async (partnerId: number) => {
      return apiRequest('PUT', `/api/partners/${partnerId}`, {
        status: 'approved'
      }).then(res => res.json());
    },
    onSuccess: () => {
      toast({
        title: 'Partner Approved',
        description: 'The partner has been successfully approved.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/partners'] });
      setIsApproveDialogOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to approve partner',
        variant: 'destructive',
      });
    }
  });
  
  // Reject partner mutation
  const rejectPartnerMutation = useMutation({
    mutationFn: async (partnerId: number) => {
      return apiRequest('PUT', `/api/partners/${partnerId}`, {
        status: 'rejected',
        rejectionReason
      }).then(res => res.json());
    },
    onSuccess: () => {
      toast({
        title: 'Partner Rejected',
        description: 'The partner has been rejected.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/partners'] });
      setIsRejectDialogOpen(false);
      setRejectionReason('');
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to reject partner',
        variant: 'destructive',
      });
    }
  });
  
  // Filter partners based on search term
  const filteredPartners = partners?.filter(partner => 
    partner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    partner.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    partner.phone.includes(searchTerm)
  );
  
  const handleViewDocuments = (partner: Partner) => {
    setSelectedPartner(partner);
    setIsViewDocumentsDialogOpen(true);
  };
  
  const handleApprovePartner = (partner: Partner) => {
    setSelectedPartner(partner);
    setIsApproveDialogOpen(true);
  };
  
  const handleRejectPartner = (partner: Partner) => {
    setSelectedPartner(partner);
    setIsRejectDialogOpen(true);
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Approved</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Rejected</Badge>;
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending</Badge>;
      case 'incomplete':
        return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">Incomplete</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  return (
    <div className="px-4 md:px-6 py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Partner Onboarding</h1>
        
        <div className="flex items-center space-x-2">
          <Button onClick={() => setIsAddPartnerDialogOpen(true)} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Partner
          </Button>
        </div>
      </div>
      
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
          <TabsTrigger value="incomplete">Incomplete</TabsTrigger>
        </TabsList>
        
        <TabsContent value={selectedTab} className="space-y-4">
          <div className="flex items-center space-x-2">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search partners..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <Card>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="flex justify-center items-center py-8">
                  <RefreshCw className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : filteredPartners?.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No partners found matching the criteria.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>GST & PAN</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Documents</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPartners?.map((partner) => (
                      <TableRow key={partner.id}>
                        <TableCell>
                          <div className="font-medium">{partner.name}</div>
                          <div className="text-sm text-gray-500">{partner.slug}</div>
                        </TableCell>
                        <TableCell>
                          <div>{partner.email}</div>
                          <div>{partner.phone}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">{partner.address}</div>
                          <div className="text-sm">{partner.city}, {partner.state}</div>
                          <div className="text-sm">{partner.pinCode}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">GST: {partner.gstNumber || 'N/A'}</div>
                          <div className="text-sm">PAN: {partner.panNumber || 'N/A'}</div>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(partner.status)}
                        </TableCell>
                        <TableCell>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleViewDocuments(partner)}
                          >
                            <FileText className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            {partner.status === 'pending' && (
                              <>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
                                  onClick={() => handleApprovePartner(partner)}
                                >
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Approve
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="bg-red-50 hover:bg-red-100 text-red-700 border-red-200"
                                  onClick={() => handleRejectPartner(partner)}
                                >
                                  <XCircle className="h-4 w-4 mr-1" />
                                  Reject
                                </Button>
                              </>
                            )}
                            <Button 
                              variant="outline" 
                              size="sm"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* View Documents Dialog */}
      <Dialog 
        open={isViewDocumentsDialogOpen} 
        onOpenChange={setIsViewDocumentsDialogOpen}
      >
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Partner Documents</DialogTitle>
            <DialogDescription>
              {selectedPartner?.name} - Review uploaded documents
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 my-4">
            {selectedPartner?.documents && selectedPartner.documents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedPartner.documents.map(doc => (
                  <Card key={doc.id}>
                    <CardHeader className="p-4 pb-2">
                      <CardTitle className="text-base">{doc.type}</CardTitle>
                      <CardDescription className="flex items-center">
                        {doc.status === 'approved' && (
                          <span className="flex items-center text-green-600">
                            <CheckCircle className="h-4 w-4 mr-1" /> Approved
                          </span>
                        )}
                        {doc.status === 'rejected' && (
                          <span className="flex items-center text-red-600">
                            <XCircle className="h-4 w-4 mr-1" /> Rejected
                          </span>
                        )}
                        {doc.status === 'pending' && (
                          <span className="flex items-center text-yellow-600">
                            <Clock className="h-4 w-4 mr-1" /> Pending Review
                          </span>
                        )}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 pt-2">
                      <div className="aspect-video bg-gray-100 rounded-md mb-2 overflow-hidden">
                        <img 
                          src={doc.fileUrl} 
                          alt={doc.type} 
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="text-sm text-gray-500">
                        Uploaded: {new Date(doc.uploadedAt).toLocaleDateString()}
                      </div>
                      {doc.notes && (
                        <div className="mt-2 text-sm">
                          <span className="font-medium">Notes:</span> {doc.notes}
                        </div>
                      )}
                    </CardContent>
                    <CardFooter className="p-4 pt-0 flex justify-between">
                      <Button variant="outline" size="sm">
                        <FileText className="h-4 w-4 mr-1" />
                        View Full
                      </Button>
                      <div className="flex space-x-2">
                        {doc.status === 'pending' && (
                          <>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="bg-red-50 hover:bg-red-100 text-red-700 border-red-200"
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </>
                        )}
                      </div>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No documents uploaded by this partner.
              </div>
            )}
          </div>
          
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Close</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Approve Partner Dialog */}
      <Dialog 
        open={isApproveDialogOpen} 
        onOpenChange={setIsApproveDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Partner</DialogTitle>
            <DialogDescription>
              Are you sure you want to approve {selectedPartner?.name}?
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsApproveDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={() => selectedPartner && approvePartnerMutation.mutate(selectedPartner.id)}
              disabled={approvePartnerMutation.isPending}
            >
              {approvePartnerMutation.isPending ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Approving...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve Partner
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Reject Partner Dialog */}
      <Dialog 
        open={isRejectDialogOpen} 
        onOpenChange={setIsRejectDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Partner</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting {selectedPartner?.name}.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 my-4">
            <div className="space-y-2">
              <Label htmlFor="rejection-reason">Rejection Reason</Label>
              <Textarea
                id="rejection-reason"
                placeholder="Enter reason for rejection"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsRejectDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={() => selectedPartner && rejectPartnerMutation.mutate(selectedPartner.id)}
              disabled={rejectPartnerMutation.isPending || !rejectionReason.trim()}
            >
              {rejectPartnerMutation.isPending ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Rejecting...
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject Partner
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Add Partner Dialog */}
      <Dialog 
        open={isAddPartnerDialogOpen} 
        onOpenChange={setIsAddPartnerDialogOpen}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Partner</DialogTitle>
            <DialogDescription>
              Enter the partner details to create a new partner account.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
            <div className="space-y-2">
              <Label htmlFor="name">Partner Name</Label>
              <Input id="name" placeholder="Partner Business Name" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="slug">Partner Slug</Label>
              <Input id="slug" placeholder="partner-name" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" type="email" placeholder="contact@partner.com" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" placeholder="+91 9876543210" />
            </div>
            
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="address">Address</Label>
              <Textarea id="address" placeholder="Business Address" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input id="city" placeholder="City" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Select>
                <SelectTrigger id="state">
                  <SelectValue placeholder="Select State" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Delhi">Delhi</SelectItem>
                  <SelectItem value="Maharashtra">Maharashtra</SelectItem>
                  <SelectItem value="Karnataka">Karnataka</SelectItem>
                  <SelectItem value="Tamil Nadu">Tamil Nadu</SelectItem>
                  <SelectItem value="Uttar Pradesh">Uttar Pradesh</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="pinCode">PIN Code</Label>
              <Input id="pinCode" placeholder="110001" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select defaultValue="pending">
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="incomplete">Incomplete</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="gstNumber">GST Number</Label>
              <Input id="gstNumber" placeholder="22AAAAA0000A1Z5" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="panNumber">PAN Number</Label>
              <Input id="panNumber" placeholder="AAAAA0000A" />
            </div>
            
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="documents">Documents</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                <div className="border border-dashed rounded-md p-4 flex flex-col items-center justify-center">
                  <Upload className="h-8 w-8 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500 text-center">
                    Upload GST Certificate
                  </p>
                  <Button variant="outline" size="sm" className="mt-2">
                    Select File
                  </Button>
                </div>
                
                <div className="border border-dashed rounded-md p-4 flex flex-col items-center justify-center">
                  <Upload className="h-8 w-8 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500 text-center">
                    Upload PAN Card
                  </p>
                  <Button variant="outline" size="sm" className="mt-2">
                    Select File
                  </Button>
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsAddPartnerDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Partner
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PartnerOnboarding;