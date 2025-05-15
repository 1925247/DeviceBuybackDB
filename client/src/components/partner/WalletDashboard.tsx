import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../../lib/queryClient';
import { Link } from 'wouter';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CreditCard, ArrowDown, ArrowUp, Clock, Calendar, FileText, Info, HelpCircle } from 'lucide-react';
import { PartnerWallet, WalletTransaction, WithdrawalRequest } from '@shared/schema';

interface WalletDashboardProps {
  partnerId: number;
}

const WalletDashboard: React.FC<WalletDashboardProps> = ({ partnerId }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isWithdrawalDialogOpen, setIsWithdrawalDialogOpen] = useState(false);
  const [withdrawalAmount, setWithdrawalAmount] = useState('');
  const [withdrawalMethod, setWithdrawalMethod] = useState('bank_transfer');
  const [withdrawalNotes, setWithdrawalNotes] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [transactionsFilter, setTransactionsFilter] = useState('all');
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Fetch partner wallet
  const { data: wallet, isLoading: isLoadingWallet } = useQuery<PartnerWallet>({
    queryKey: [`/api/partners/${partnerId}/wallet`],
  });
  
  // Fetch wallet transactions
  const { data: transactions, isLoading: isLoadingTransactions } = useQuery<WalletTransaction[]>({
    queryKey: [`/api/partners/${partnerId}/wallet/transactions`, currentPage, transactionsFilter],
    queryFn: async () => {
      const url = `/api/partners/${partnerId}/wallet/transactions?page=${currentPage}${transactionsFilter !== 'all' ? `&type=${transactionsFilter}` : ''}`;
      return apiRequest('GET', url).then(res => res.json());
    },
  });
  
  // Fetch withdrawal requests
  const { data: withdrawalRequests, isLoading: isLoadingWithdrawals } = useQuery<WithdrawalRequest[]>({
    queryKey: [`/api/partners/${partnerId}/wallet/withdrawals`],
    queryFn: async () => {
      return apiRequest('GET', `/api/partners/${partnerId}/wallet/withdrawals`).then(res => res.json());
    },
  });
  
  // Create withdrawal request mutation
  const createWithdrawalMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('POST', `/api/partners/${partnerId}/wallet/withdrawal`, {
        amount: parseFloat(withdrawalAmount),
        payment_method: withdrawalMethod,
        notes: withdrawalNotes,
      }).then(res => res.json());
    },
    onSuccess: () => {
      toast({
        title: 'Withdrawal Request Created',
        description: 'Your withdrawal request has been submitted successfully.',
      });
      
      // Reset form
      setWithdrawalAmount('');
      setWithdrawalNotes('');
      setIsWithdrawalDialogOpen(false);
      
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: [`/api/partners/${partnerId}/wallet`] });
      queryClient.invalidateQueries({ queryKey: [`/api/partners/${partnerId}/wallet/withdrawals`] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create withdrawal request.',
        variant: 'destructive',
      });
    },
  });
  
  const handleCreateWithdrawal = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!withdrawalAmount || parseFloat(withdrawalAmount) <= 0) {
      toast({
        title: 'Invalid Amount',
        description: 'Please enter a valid amount.',
        variant: 'destructive',
      });
      return;
    }
    
    createWithdrawalMutation.mutate();
  };
  
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
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <h2 className="text-2xl font-bold">Partner Wallet</h2>
        <div className="mt-2 sm:mt-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="transactions">Transactions</TabsTrigger>
              <TabsTrigger value="withdrawals">Withdrawals</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>
      
      {isLoadingWallet ? (
        <div className="flex items-center justify-center h-48">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : !wallet ? (
        <div className="text-center py-12 border rounded-lg">
          <Info className="h-12 w-12 mx-auto text-gray-300 mb-3" />
          <p className="text-muted-foreground">Wallet information not available</p>
        </div>
      ) : (
        <TabsContent value="overview" className="space-y-6 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Available Balance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{formatCurrency(wallet.balance)}</div>
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={() => setIsWithdrawalDialogOpen(true)}
                  className="w-full"
                >
                  Request Withdrawal
                </Button>
              </CardFooter>
            </Card>
            
            {wallet.pending_balance && parseFloat(wallet.pending_balance.toString()) > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Pending Balance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-amber-500">{formatCurrency(wallet.pending_balance)}</div>
                </CardContent>
                <CardFooter className="text-xs text-muted-foreground">
                  <Clock className="h-3 w-3 inline mr-1" />
                  This amount is still being processed and will be available soon.
                </CardFooter>
              </Card>
            )}
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Payment Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {wallet.bank_account_number ? (
                  <>
                    <div className="text-sm">
                      <span className="text-muted-foreground">Account:</span>{' '}
                      <span className="font-medium">{wallet.bank_account_number}</span>
                    </div>
                    <div className="text-sm">
                      <span className="text-muted-foreground">IFSC:</span>{' '}
                      <span className="font-medium">{wallet.bank_ifsc}</span>
                    </div>
                    <div className="text-sm">
                      <span className="text-muted-foreground">Bank:</span>{' '}
                      <span className="font-medium">{wallet.bank_name}</span>
                    </div>
                    <div className="text-sm">
                      <span className="text-muted-foreground">Account Holder:</span>{' '}
                      <span className="font-medium">{wallet.account_holder_name}</span>
                    </div>
                  </>
                ) : (
                  <div className="text-sm text-muted-foreground">
                    No payment information on file. Please update your profile to add bank account details.
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">
                  Update Payment Info
                </Button>
              </CardFooter>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>Your recent wallet activity</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingTransactions ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : !transactions || transactions.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                  <p className="text-muted-foreground">No transaction history available</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transactions.slice(0, 5).map((transaction) => (
                        <TableRow key={transaction.id}>
                          <TableCell className="whitespace-nowrap">
                            {formatDate(transaction.transaction_date)}
                          </TableCell>
                          <TableCell>{transaction.description}</TableCell>
                          <TableCell>
                            {transaction.type === 'credit' ? (
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                <ArrowDown className="h-3 w-3 mr-1" />
                                Credit
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                                <ArrowUp className="h-3 w-3 mr-1" />
                                Debit
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className={`text-right font-medium ${transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                            {transaction.type === 'credit' ? '+' : '-'}{formatCurrency(transaction.amount)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" onClick={() => setActiveTab('transactions')}>
                View All Transactions
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      )}
      
      <TabsContent value="transactions" className="space-y-4 mt-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Transaction History</h3>
          <Select
            value={transactionsFilter}
            onValueChange={setTransactionsFilter}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Transactions</SelectItem>
              <SelectItem value="credit">Credits Only</SelectItem>
              <SelectItem value="debit">Debits Only</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
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
                  <TableHead>Reference</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
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
                    <TableCell>{transaction.reference_id || '-'}</TableCell>
                    <TableCell>
                      {transaction.type === 'credit' ? (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          <ArrowDown className="h-3 w-3 mr-1" />
                          Credit
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                          <ArrowUp className="h-3 w-3 mr-1" />
                          Debit
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>{getStatusBadge(transaction.status)}</TableCell>
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
      </TabsContent>
      
      <TabsContent value="withdrawals" className="space-y-4 mt-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Withdrawal Requests</h3>
          <Button onClick={() => setIsWithdrawalDialogOpen(true)}>
            New Withdrawal Request
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
                  <TableHead>Request Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Payment Method</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead>Processed Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {withdrawalRequests.map((withdrawal) => (
                  <TableRow key={withdrawal.id}>
                    <TableCell className="whitespace-nowrap">
                      {formatDate(withdrawal.created_at)}
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(withdrawal.amount)}
                    </TableCell>
                    <TableCell className="capitalize">
                      {withdrawal.payment_method.replace('_', ' ')}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(withdrawal.status)}
                    </TableCell>
                    <TableCell>
                      {withdrawal.notes || '-'}
                    </TableCell>
                    <TableCell>
                      {withdrawal.processed_date ? formatDate(withdrawal.processed_date) : '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </TabsContent>
      
      {/* Withdrawal Request Dialog */}
      <Dialog open={isWithdrawalDialogOpen} onOpenChange={setIsWithdrawalDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Request Withdrawal</DialogTitle>
            <DialogDescription>
              Request a withdrawal from your partner wallet. The request will be reviewed by an administrator.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleCreateWithdrawal}>
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
                      value={withdrawalAmount}
                      onChange={(e) => setWithdrawalAmount(e.target.value)}
                      required
                    />
                  </div>
                  {wallet && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Available balance: {formatCurrency(wallet.balance)}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="payment-method" className="text-right">
                  Payment Method
                </Label>
                <Select
                  value={withdrawalMethod}
                  onValueChange={(value: 'bank_transfer' | 'upi' | 'other') => setWithdrawalMethod(value)}
                >
                  <SelectTrigger className="col-span-3" id="payment-method">
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    <SelectItem value="upi">UPI</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="notes" className="text-right pt-2">
                  Notes
                </Label>
                <Textarea
                  id="notes"
                  placeholder="Optional notes for this withdrawal request"
                  className="col-span-3"
                  value={withdrawalNotes}
                  onChange={(e) => setWithdrawalNotes(e.target.value)}
                />
              </div>
              
              <div className="col-span-4 px-6 py-3 bg-gray-50 rounded-lg">
                <div className="flex items-start">
                  <HelpCircle className="h-4 w-4 text-blue-500 mr-2 mt-0.5" />
                  <div className="text-xs text-muted-foreground">
                    <strong>Note:</strong> Withdrawal requests are processed within 2-3 business days. 
                    The funds will be transferred to the bank account or UPI ID registered in your profile.
                  </div>
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsWithdrawalDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={createWithdrawalMutation.isPending}
              >
                {createWithdrawalMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Submit Request'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WalletDashboard;