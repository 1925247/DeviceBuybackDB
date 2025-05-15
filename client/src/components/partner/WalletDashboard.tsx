import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../../lib/queryClient';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { Loader2, AlertCircle, CheckCircle2, CreditCard, DollarSign, Filter, Download } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { PartnerWallet, WalletTransaction, WithdrawalRequest } from '@shared/schema';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { formatDistance } from 'date-fns';

type WalletDashboardProps = {
  partnerId: number;
};

const WalletDashboard: React.FC<WalletDashboardProps> = ({ partnerId }) => {
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawalNotes, setWithdrawalNotes] = useState('');
  const [withdrawalMethod, setWithdrawalMethod] = useState('bank_transfer');
  const [accountNumber, setAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [bankName, setBankName] = useState('');
  const [transactionsPage, setTransactionsPage] = useState(1);
  const [withdrawalsPage, setWithdrawalsPage] = useState(1);
  const [transactionsFilter, setTransactionsFilter] = useState('all');
  const [withdrawalsFilter, setWithdrawalsFilter] = useState('all');
  const [withdrawDialogOpen, setWithdrawDialogOpen] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Fetch wallet data
  const { data: wallet, isLoading: isLoadingWallet } = useQuery<PartnerWallet>({
    queryKey: [`/api/partners/${partnerId}/wallet`],
  });
  
  // Fetch transactions
  const { data: transactions, isLoading: isLoadingTransactions } = useQuery<WalletTransaction[]>({
    queryKey: [`/api/partners/${partnerId}/wallet/transactions`, transactionsPage, transactionsFilter],
    queryFn: async () => {
      const url = `/api/partners/${partnerId}/wallet/transactions?page=${transactionsPage}${transactionsFilter !== 'all' ? `&type=${transactionsFilter}` : ''}`;
      return apiRequest('GET', url).then(res => res.json());
    }
  });
  
  // Fetch withdrawals
  const { data: withdrawals, isLoading: isLoadingWithdrawals } = useQuery<WithdrawalRequest[]>({
    queryKey: [`/api/partners/${partnerId}/wallet/withdrawals`, withdrawalsPage, withdrawalsFilter],
    queryFn: async () => {
      const url = `/api/partners/${partnerId}/wallet/withdrawals?page=${withdrawalsPage}${withdrawalsFilter !== 'all' ? `&status=${withdrawalsFilter}` : ''}`;
      return apiRequest('GET', url).then(res => res.json());
    }
  });
  
  // Create withdrawal request mutation
  const createWithdrawalMutation = useMutation({
    mutationFn: async () => {
      const paymentDetails = {
        bank_account_number: accountNumber,
        bank_ifsc_code: ifscCode,
        bank_name: bankName,
      };
      
      return apiRequest('POST', `/api/partners/${partnerId}/wallet/withdrawal`, {
        amount: parseFloat(withdrawAmount),
        payment_method: withdrawalMethod,
        payment_details: paymentDetails,
        notes: withdrawalNotes
      }).then(res => res.json());
    },
    onSuccess: () => {
      toast({
        title: 'Withdrawal Request Created',
        description: 'Your withdrawal request has been submitted successfully.',
        variant: 'default',
      });
      
      // Reset form
      setWithdrawAmount('');
      setWithdrawalNotes('');
      setAccountNumber('');
      setIfscCode('');
      setBankName('');
      setWithdrawDialogOpen(false);
      
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: [`/api/partners/${partnerId}/wallet/withdrawals`] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create withdrawal request.',
        variant: 'destructive',
      });
    }
  });
  
  const handleWithdrawalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      toast({
        title: 'Invalid Amount',
        description: 'Please enter a valid withdrawal amount.',
        variant: 'destructive',
      });
      return;
    }
    
    if (wallet && parseFloat(withdrawAmount) > parseFloat(wallet.balance.toString())) {
      toast({
        title: 'Insufficient Balance',
        description: 'The requested amount exceeds your available balance.',
        variant: 'destructive',
      });
      return;
    }
    
    if (withdrawalMethod === 'bank_transfer' && (!accountNumber || !ifscCode || !bankName)) {
      toast({
        title: 'Missing Details',
        description: 'Please fill in all bank details for bank transfer.',
        variant: 'destructive',
      });
      return;
    }
    
    createWithdrawalMutation.mutate();
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
  
  const formatCurrency = (amount: string | number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(typeof amount === 'string' ? parseFloat(amount) : amount);
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };
  
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    return formatDistance(date, new Date(), { addSuffix: true });
  };
  
  if (isLoadingWallet) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!wallet) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h3 className="text-xl font-semibold mb-2">Wallet Not Available</h3>
        <p className="text-muted-foreground">There was an issue accessing your wallet. Please try again later.</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Available Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">
              {formatCurrency(wallet.balance)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Updated {formatTimeAgo(wallet.updated_at.toString())}
            </p>
          </CardContent>
          <CardFooter>
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={() => setWithdrawDialogOpen(true)}
            >
              <CreditCard className="mr-2 h-4 w-4" /> Withdraw Funds
            </Button>
          </CardFooter>
        </Card>
        
        {wallet.pending_balance && parseFloat(wallet.pending_balance.toString()) > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending Balance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-amber-500">
                {formatCurrency(wallet.pending_balance)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Funds in processing
              </p>
            </CardContent>
          </Card>
        )}
      </div>
      
      <Tabs defaultValue="transactions">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="withdrawals">Withdrawal Requests</TabsTrigger>
        </TabsList>
        
        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Transaction History</CardTitle>
                <div className="flex items-center space-x-2">
                  <Select
                    value={transactionsFilter}
                    onValueChange={setTransactionsFilter}
                  >
                    <SelectTrigger className="w-[130px]">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Filter" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="credit">Credits Only</SelectItem>
                      <SelectItem value="debit">Debits Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingTransactions ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : !transactions || transactions.length === 0 ? (
                <div className="text-center py-8">
                  <DollarSign className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                  <p className="text-muted-foreground">No transactions found.</p>
                </div>
              ) : (
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
                    {transactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell className="whitespace-nowrap">
                          {formatDate(transaction.transaction_date.toString())}
                        </TableCell>
                        <TableCell>{transaction.description}</TableCell>
                        <TableCell>
                          {getTransactionTypeBadge(transaction.type)}
                        </TableCell>
                        <TableCell className={`text-right font-medium ${transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                          {transaction.type === 'credit' ? '+' : '-'}{formatCurrency(transaction.amount)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
              
              <div className="flex justify-between items-center mt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setTransactionsPage(p => Math.max(1, p - 1))}
                  disabled={transactionsPage <= 1}
                >
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">Page {transactionsPage}</span>
                <Button 
                  variant="outline" 
                  onClick={() => setTransactionsPage(p => p + 1)}
                  disabled={!transactions || transactions.length < 20}
                >
                  Next
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="withdrawals">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Withdrawal Requests</CardTitle>
                <div className="flex items-center space-x-2">
                  <Select
                    value={withdrawalsFilter}
                    onValueChange={setWithdrawalsFilter}
                  >
                    <SelectTrigger className="w-[130px]">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Filter" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                      <SelectItem value="processed">Processed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingWithdrawals ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : !withdrawals || withdrawals.length === 0 ? (
                <div className="text-center py-8">
                  <CreditCard className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                  <p className="text-muted-foreground">No withdrawal requests found.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Payment Method</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {withdrawals.map((withdrawal) => (
                      <TableRow key={withdrawal.id}>
                        <TableCell className="whitespace-nowrap">
                          {formatDate(withdrawal.created_at.toString())}
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
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
              
              <div className="flex justify-between items-center mt-4">
                <Button 
                  variant="outline"
                  onClick={() => setWithdrawalsPage(p => Math.max(1, p - 1))}
                  disabled={withdrawalsPage <= 1}
                >
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">Page {withdrawalsPage}</span>
                <Button 
                  variant="outline" 
                  onClick={() => setWithdrawalsPage(p => p + 1)}
                  disabled={!withdrawals || withdrawals.length < 20}
                >
                  Next
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Withdrawal Dialog */}
      <Dialog open={withdrawDialogOpen} onOpenChange={setWithdrawDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Withdraw Funds</DialogTitle>
            <DialogDescription>
              Request a withdrawal from your available balance of {formatCurrency(wallet.balance)}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleWithdrawalSubmit}>
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
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="payment-method" className="text-right">
                  Payment Method
                </Label>
                <Select
                  value={withdrawalMethod}
                  onValueChange={setWithdrawalMethod}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select a payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    <SelectItem value="upi">UPI</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {withdrawalMethod === 'bank_transfer' && (
                <>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="account-number" className="text-right">
                      Account Number
                    </Label>
                    <Input
                      id="account-number"
                      type="text"
                      className="col-span-3"
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="ifsc-code" className="text-right">
                      IFSC Code
                    </Label>
                    <Input
                      id="ifsc-code"
                      type="text"
                      className="col-span-3"
                      value={ifscCode}
                      onChange={(e) => setIfscCode(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="bank-name" className="text-right">
                      Bank Name
                    </Label>
                    <Input
                      id="bank-name"
                      type="text"
                      className="col-span-3"
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      required
                    />
                  </div>
                </>
              )}
              
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="notes" className="text-right pt-2">
                  Notes
                </Label>
                <Textarea
                  id="notes"
                  placeholder="Additional information about this withdrawal"
                  className="col-span-3"
                  value={withdrawalNotes}
                  onChange={(e) => setWithdrawalNotes(e.target.value)}
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setWithdrawDialogOpen(false)}
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