import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../../lib/queryClient';
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from '@/hooks/use-toast';
import { 
  Loader2, 
  CreditCard, 
  Download, 
  Search, 
  Filter, 
  MoreHorizontal, 
  FileText, 
  ExternalLink, 
  CheckCircle, 
  XCircle, 
  AlertCircle 
} from 'lucide-react';
import { Partner, PartnerWallet, WalletTransaction, WithdrawalRequest } from '@shared/schema';

const PartnerWallets: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState('partners');
  const [selectedPartnerId, setSelectedPartnerId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddFundsOpen, setIsAddFundsOpen] = useState(false);
  const [fundAmount, setFundAmount] = useState('');
  const [fundDescription, setFundDescription] = useState('');
  const [fundReference, setFundReference] = useState('');
  const [fundPaymentMethod, setFundPaymentMethod] = useState('online');
  const [fundTransactionId, setFundTransactionId] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [withdrawalStatusFilter, setWithdrawalStatusFilter] = useState('all');
  const [isProcessWithdrawalOpen, setIsProcessWithdrawalOpen] = useState(false);
  const [selectedWithdrawalId, setSelectedWithdrawalId] = useState<number | null>(null);
  const [withdrawalStatus, setWithdrawalStatus] = useState<'approved' | 'rejected'>('approved');
  const [withdrawalNotes, setWithdrawalNotes] = useState('');
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Fetch partners
  const { data: partners, isLoading: isLoadingPartners } = useQuery<Partner[]>({
    queryKey: ['/api/partners'],
  });
  
  // Fetch partner wallet if a partner is selected
  const { data: wallet, isLoading: isLoadingWallet } = useQuery<PartnerWallet>({
    queryKey: [`/api/partners/${selectedPartnerId}/wallet`],
    enabled: !!selectedPartnerId,
  });
  
  // Fetch wallet transactions if a partner is selected
  const { data: transactions, isLoading: isLoadingTransactions } = useQuery<WalletTransaction[]>({
    queryKey: [`/api/partners/${selectedPartnerId}/wallet/transactions`, currentPage],
    enabled: !!selectedPartnerId,
  });
  
  // Fetch withdrawal requests
  const { data: withdrawalRequests, isLoading: isLoadingWithdrawals } = useQuery<WithdrawalRequest[]>({
    queryKey: ['/api/withdrawal-requests', withdrawalStatusFilter],
    queryFn: async () => {
      const url = `/api/withdrawal-requests${withdrawalStatusFilter !== 'all' ? `?status=${withdrawalStatusFilter}` : ''}`;
      return apiRequest('GET', url).then(res => res.json());
    },
  });
  
  // Add funds mutation
  const addFundsMutation = useMutation({
    mutationFn: async () => {
      if (!selectedPartnerId) return;
      
      return apiRequest('POST', `/api/partners/${selectedPartnerId}/wallet/add-funds`, {
        amount: parseFloat(fundAmount),
        description: fundDescription,
        reference: fundReference || undefined,
        paymentMethod: fundPaymentMethod,
        transactionId: fundTransactionId || undefined,
      }).then(res => res.json());
    },
    onSuccess: () => {
      toast({
        title: 'Funds Added',
        description: 'The funds have been successfully added to the partner wallet.',
      });
      
      // Reset form
      setFundAmount('');
      setFundDescription('');
      setFundReference('');
      setIsAddFundsOpen(false);
      
      // Invalidate queries
      if (selectedPartnerId) {
        queryClient.invalidateQueries({ queryKey: [`/api/partners/${selectedPartnerId}/wallet`] });
        queryClient.invalidateQueries({ queryKey: [`/api/partners/${selectedPartnerId}/wallet/transactions`] });
      }
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to add funds.',
        variant: 'destructive',
      });
    },
  });
  
  // Process withdrawal mutation
  const processWithdrawalMutation = useMutation({
    mutationFn: async () => {
      if (!selectedWithdrawalId) return;
      
      return apiRequest('PUT', `/api/withdrawal-requests/${selectedWithdrawalId}/process`, {
        status: withdrawalStatus,
        notes: withdrawalNotes,
        admin_id: 1, // TODO: Get actual admin ID from session
      }).then(res => res.json());
    },
    onSuccess: () => {
      toast({
        title: 'Withdrawal Processed',
        description: `The withdrawal request has been ${withdrawalStatus}.`,
      });
      
      // Reset form
      setWithdrawalNotes('');
      setIsProcessWithdrawalOpen(false);
      
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['/api/withdrawal-requests'] });
      if (selectedPartnerId) {
        queryClient.invalidateQueries({ queryKey: [`/api/partners/${selectedPartnerId}/wallet`] });
      }
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to process withdrawal request.',
        variant: 'destructive',
      });
    },
  });
  
  const handleAddFunds = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!fundAmount || parseFloat(fundAmount) <= 0) {
      toast({
        title: 'Invalid Amount',
        description: 'Please enter a valid amount.',
        variant: 'destructive',
      });
      return;
    }
    
    if (!fundDescription) {
      toast({
        title: 'Description Required',
        description: 'Please enter a description for this transaction.',
        variant: 'destructive',
      });
      return;
    }
    
    addFundsMutation.mutate();
  };
  
  const handleProcessWithdrawal = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!withdrawalNotes) {
      toast({
        title: 'Notes Required',
        description: 'Please enter notes for this action.',
        variant: 'destructive',
      });
      return;
    }
    
    processWithdrawalMutation.mutate();
  };
  
  const openProcessWithdrawalDialog = (id: number) => {
    setSelectedWithdrawalId(id);
    setWithdrawalStatus('approved');
    setWithdrawalNotes('');
    setIsProcessWithdrawalOpen(true);
  };
  
  const filteredPartners = partners?.filter(partner => 
    partner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    partner.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const formatCurrency = (amount: string | number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(typeof amount === 'string' ? parseFloat(amount) : amount);
  };
  
  const formatDate = (dateString: string | Date) => {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    return new Intl.DateTimeFormat('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Approved</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Rejected</Badge>;
      case 'processed':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Processed</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Completed</Badge>;
      case 'failed':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  const getTransactionTypeBadge = (type: string) => {
    if (type === 'credit') {
      return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Credit</Badge>;
    }
    return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Debit</Badge>;
  };
  
  return (
    <div className="px-4 md:px-6 py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Partner Wallets</h1>
        
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>
      
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList>
          <TabsTrigger value="partners">Partners</TabsTrigger>
          <TabsTrigger value="withdrawals">Withdrawal Requests</TabsTrigger>
        </TabsList>
        
        <TabsContent value="partners" className="space-y-4">
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
          
          <div className="grid md:grid-cols-5 gap-6">
            {/* Partners List */}
            <div className="md:col-span-2 border rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-4 py-3 border-b">
                <h3 className="text-sm font-medium">Partners</h3>
              </div>
              
              {isLoadingPartners ? (
                <div className="flex items-center justify-center h-[400px]">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : !filteredPartners?.length ? (
                <div className="flex flex-col items-center justify-center h-[400px] text-center p-4">
                  <p className="text-muted-foreground mb-2">No partners found</p>
                  {searchTerm && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setSearchTerm('')}
                    >
                      Clear search
                    </Button>
                  )}
                </div>
              ) : (
                <div className="overflow-auto max-h-[400px]">
                  {filteredPartners.map((partner) => (
                    <div 
                      key={partner.id}
                      className={`cursor-pointer px-4 py-3 border-b hover:bg-gray-50 ${
                        selectedPartnerId === partner.id ? 'bg-blue-50' : ''
                      }`}
                      onClick={() => setSelectedPartnerId(partner.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{partner.name}</h4>
                          <p className="text-sm text-gray-500">{partner.slug}</p>
                        </div>
                        {selectedPartnerId === partner.id && (
                          <div className="h-2 w-2 bg-blue-500 rounded-full" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Partner Wallet Details */}
            <div className="md:col-span-3 space-y-6">
              {!selectedPartnerId ? (
                <div className="flex flex-col items-center justify-center h-[400px] border rounded-lg p-6 text-center">
                  <CreditCard className="h-12 w-12 text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Partner Selected</h3>
                  <p className="text-muted-foreground mb-4">Select a partner from the list to view their wallet details.</p>
                </div>
              ) : isLoadingWallet ? (
                <div className="flex items-center justify-center h-[400px] border rounded-lg">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : !wallet ? (
                <div className="flex flex-col items-center justify-center h-[400px] border rounded-lg p-6 text-center">
                  <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
                  <h3 className="text-lg font-medium mb-2">Wallet Not Found</h3>
                  <p className="text-muted-foreground mb-4">This partner doesn't have a wallet yet.</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Available Balance</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(wallet.balance)}</div>
                      </CardContent>
                    </Card>
                    
                    {wallet.pending_balance && parseFloat(wallet.pending_balance.toString()) > 0 && (
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium text-muted-foreground">Pending Balance</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold text-amber-500">{formatCurrency(wallet.pending_balance)}</div>
                        </CardContent>
                      </Card>
                    )}
                    
                    <Button 
                      className="col-span-2"
                      onClick={() => setIsAddFundsOpen(true)}
                    >
                      Add Funds
                    </Button>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Transaction History</h3>
                    
                    {isLoadingTransactions ? (
                      <div className="flex justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      </div>
                    ) : !transactions || transactions.length === 0 ? (
                      <div className="text-center py-12 border rounded-lg">
                        <FileText className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                        <p className="text-muted-foreground">No transaction history available</p>
                      </div>
                    ) : (
                      <div className="border rounded-lg overflow-hidden">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Date</TableHead>
                              <TableHead>Description</TableHead>
                              <TableHead>Type</TableHead>
                              <TableHead>Reference</TableHead>
                              <TableHead className="text-right">Amount</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {transactions.map((transaction) => (
                              <TableRow key={transaction.id}>
                                <TableCell className="whitespace-nowrap">
                                  {formatDate(transaction.transaction_date)}
                                </TableCell>
                                <TableCell>{transaction.description}</TableCell>
                                <TableCell>{getTransactionTypeBadge(transaction.type)}</TableCell>
                                <TableCell>{transaction.reference_id || '-'}</TableCell>
                                <TableCell className={`text-right font-medium ${transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                                  {transaction.type === 'credit' ? '+' : '-'}{formatCurrency(transaction.amount)}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                        
                        <div className="flex justify-between items-center p-4 border-t">
                          <Button 
                            variant="outline" 
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage <= 1}
                          >
                            Previous
                          </Button>
                          <span className="text-sm text-muted-foreground">Page {currentPage}</span>
                          <Button 
                            variant="outline" 
                            onClick={() => setCurrentPage(p => p + 1)}
                            disabled={!transactions || transactions.length < 20}
                          >
                            Next
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="withdrawals" className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Select
                value={withdrawalStatusFilter}
                onValueChange={setWithdrawalStatusFilter}
              >
                <SelectTrigger className="w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Requests</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="processed">Processed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
          
          {isLoadingWithdrawals ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : !withdrawalRequests || withdrawalRequests.length === 0 ? (
            <div className="text-center py-12 border rounded-lg">
              <FileText className="h-12 w-12 mx-auto text-gray-300 mb-3" />
              <p className="text-muted-foreground">No withdrawal requests found</p>
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Partner</TableHead>
                    <TableHead>Payment Method</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {withdrawalRequests.map((withdrawal) => (
                    <TableRow key={withdrawal.id}>
                      <TableCell className="whitespace-nowrap">
                        {formatDate(withdrawal.created_at)}
                      </TableCell>
                      <TableCell>
                        {withdrawal.wallet_id}
                        {/* Replace with actual partner name */}
                      </TableCell>
                      <TableCell className="capitalize">
                        {withdrawal.payment_method.replace('_', ' ')}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(withdrawal.status)}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(withdrawal.amount)}
                      </TableCell>
                      <TableCell>
                        {withdrawal.notes || '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        {withdrawal.status === 'pending' ? (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => openProcessWithdrawalDialog(withdrawal.id)}>
                                Process Request
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>View Details</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        ) : (
                          <Button variant="ghost" size="sm">
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>
      </Tabs>
      
      {/* Add Funds Dialog */}
      <Dialog open={isAddFundsOpen} onOpenChange={setIsAddFundsOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add Funds to Partner Wallet</DialogTitle>
            <DialogDescription>
              Add funds to the partner wallet. This will be reflected immediately in their balance.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleAddFunds}>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="amount" className="text-right">
                  Amount
                </Label>
                <div className="col-span-3">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <span className="text-gray-500">₹</span>
                    </div>
                    <Input
                      id="amount"
                      type="number"
                      min="0.01"
                      step="0.01"
                      placeholder="0.00"
                      className="pl-8"
                      value={fundAmount}
                      onChange={(e) => setFundAmount(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="description" className="text-right pt-2">
                  Description
                </Label>
                <Textarea
                  id="description"
                  placeholder="Description of this transaction"
                  className="col-span-3"
                  value={fundDescription}
                  onChange={(e) => setFundDescription(e.target.value)}
                  required
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="paymentMethod" className="text-right">
                  Payment Method
                </Label>
                <Select
                  value={fundPaymentMethod}
                  onValueChange={(value) => setFundPaymentMethod(value)}
                >
                  <SelectTrigger id="paymentMethod" className="col-span-3">
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="online">Online Payment</SelectItem>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="cheque">Cheque</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {fundPaymentMethod !== 'online' && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="transactionId" className="text-right">
                    Transaction ID
                  </Label>
                  <Input
                    id="transactionId"
                    placeholder="Enter transaction ID"
                    className="col-span-3"
                    value={fundTransactionId}
                    onChange={(e) => setFundTransactionId(e.target.value)}
                  />
                </div>
              )}
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="reference" className="text-right">
                  Reference
                </Label>
                <Input
                  id="reference"
                  type="text"
                  placeholder="Optional reference ID"
                  className="col-span-3"
                  value={fundReference}
                  onChange={(e) => setFundReference(e.target.value)}
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsAddFundsOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={addFundsMutation.isPending}
              >
                {addFundsMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Add Funds'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Process Withdrawal Dialog */}
      <Dialog open={isProcessWithdrawalOpen} onOpenChange={setIsProcessWithdrawalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Process Withdrawal Request</DialogTitle>
            <DialogDescription>
              Review and process this withdrawal request.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleProcessWithdrawal}>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="status" className="text-right">
                  Status
                </Label>
                <Select
                  value={withdrawalStatus}
                  onValueChange={(value: 'approved' | 'rejected') => setWithdrawalStatus(value)}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="approved">
                      <div className="flex items-center">
                        <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                        Approve
                      </div>
                    </SelectItem>
                    <SelectItem value="rejected">
                      <div className="flex items-center">
                        <XCircle className="h-4 w-4 mr-2 text-red-500" />
                        Reject
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="notes" className="text-right pt-2">
                  Notes
                </Label>
                <Textarea
                  id="notes"
                  placeholder={withdrawalStatus === 'approved' ? 'Additional information about this approval' : 'Reason for rejection'}
                  className="col-span-3"
                  value={withdrawalNotes}
                  onChange={(e) => setWithdrawalNotes(e.target.value)}
                  required
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsProcessWithdrawalOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={processWithdrawalMutation.isPending}
                variant={withdrawalStatus === 'approved' ? 'default' : 'destructive'}
              >
                {processWithdrawalMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  withdrawalStatus === 'approved' ? 'Approve Request' : 'Reject Request'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PartnerWallets;