import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../../lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Loader2, 
  ArrowUpRight, 
  ArrowDownRight, 
  CreditCard, 
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock
} from 'lucide-react';
import { format } from 'date-fns';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

interface WalletDashboardProps {
  partnerId: number;
}

// Define form schema for withdrawal
const withdrawalFormSchema = z.object({
  amount: z.string()
    .refine(val => !isNaN(parseFloat(val)), {
      message: "Amount must be a valid number",
    })
    .refine(val => parseFloat(val) > 0, {
      message: "Amount must be greater than 0",
    }),
  paymentMethod: z.string().min(1, {
    message: "Payment method is required",
  }),
  notes: z.string().optional(),
});

const WalletDashboard: React.FC<WalletDashboardProps> = ({ partnerId }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isWithdrawalDialogOpen, setIsWithdrawalDialogOpen] = useState(false);
  
  // Initialize form
  const withdrawalForm = useForm<z.infer<typeof withdrawalFormSchema>>({
    resolver: zodResolver(withdrawalFormSchema),
    defaultValues: {
      amount: '',
      paymentMethod: 'bank_transfer',
      notes: '',
    },
  });
  
  // Fetch wallet details
  const { data: wallet, isLoading: isLoadingWallet } = useQuery({
    queryKey: [`/api/partners/${partnerId}/wallet`],
    queryFn: async () => {
      try {
        return apiRequest('GET', `/api/partners/${partnerId}/wallet`).then(res => res.json());
      } catch (error) {
        console.error('Failed to fetch wallet:', error);
        return null;
      }
    },
  });
  
  // Fetch transaction history
  const { data: transactions, isLoading: isLoadingTransactions } = useQuery({
    queryKey: [`/api/partners/${partnerId}/wallet/transactions`],
    queryFn: async () => {
      try {
        return apiRequest('GET', `/api/partners/${partnerId}/wallet/transactions`).then(res => res.json());
      } catch (error) {
        console.error('Failed to fetch transactions:', error);
        return [];
      }
    },
  });
  
  // Fetch withdrawal requests
  const { data: withdrawals, isLoading: isLoadingWithdrawals } = useQuery({
    queryKey: [`/api/partners/${partnerId}/wallet/withdrawals`],
    queryFn: async () => {
      try {
        return apiRequest('GET', `/api/partners/${partnerId}/wallet/withdrawals`).then(res => res.json());
      } catch (error) {
        console.error('Failed to fetch withdrawals:', error);
        return [];
      }
    },
  });
  
  // Create withdrawal request mutation
  const createWithdrawalMutation = useMutation({
    mutationFn: async (data: z.infer<typeof withdrawalFormSchema>) => {
      return apiRequest('POST', `/api/partners/${partnerId}/wallet/withdrawal`, {
        amount: parseFloat(data.amount),
        paymentMethod: data.paymentMethod,
        notes: data.notes || '',
      }).then(res => res.json());
    },
    onSuccess: () => {
      toast({
        title: "Withdrawal Request Submitted",
        description: "Your withdrawal request has been submitted for processing.",
      });
      setIsWithdrawalDialogOpen(false);
      withdrawalForm.reset();
      // Invalidate relevant queries to update the UI
      queryClient.invalidateQueries({
        queryKey: [`/api/partners/${partnerId}/wallet`],
      });
      queryClient.invalidateQueries({
        queryKey: [`/api/partners/${partnerId}/wallet/withdrawals`],
      });
      queryClient.invalidateQueries({
        queryKey: [`/api/partners/${partnerId}/wallet/transactions`],
      });
    },
    onError: (error) => {
      toast({
        title: "Withdrawal Request Failed",
        description: "There was an error submitting your withdrawal request. Please try again.",
        variant: "destructive",
      });
      console.error('Withdrawal request failed:', error);
    },
  });
  
  const onWithdrawalSubmit = (data: z.infer<typeof withdrawalFormSchema>) => {
    if (wallet && parseFloat(data.amount) > wallet.balance) {
      toast({
        title: "Insufficient Balance",
        description: "Withdrawal amount exceeds your available balance.",
        variant: "destructive",
      });
      return;
    }
    
    createWithdrawalMutation.mutate(data);
  };
  
  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'approved':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'processed':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
  };
  
  const getTransactionIcon = (type: string) => {
    if (type === 'credit') {
      return <ArrowUpRight className="h-4 w-4 text-green-500" />;
    } else {
      return <ArrowDownRight className="h-4 w-4 text-red-500" />;
    }
  };
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
  };
  
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd MMM yyyy, HH:mm');
  };
  
  if (isLoadingWallet) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!wallet) {
    return (
      <div className="text-center py-8">
        <AlertTriangle className="h-12 w-12 mx-auto text-yellow-500 mb-3" />
        <h3 className="text-xl font-medium mb-2">Wallet Not Found</h3>
        <p className="text-muted-foreground mb-4">
          Your wallet hasn't been set up yet.
        </p>
        <Button>Contact Support</Button>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Partner Wallet</h2>
      
      {/* Wallet Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Available Balance</CardTitle>
            <CardDescription>Your current wallet balance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">
              {formatCurrency(wallet.balance)}
            </div>
            {wallet.pending_balance > 0 && (
              <p className="text-sm text-muted-foreground mt-2">
                Pending: {formatCurrency(wallet.pending_balance)}
              </p>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                queryClient.invalidateQueries({
                  queryKey: [`/api/partners/${partnerId}/wallet`],
                });
              }}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button 
              size="sm"
              onClick={() => setIsWithdrawalDialogOpen(true)}
              disabled={wallet.balance <= 0}
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Request Withdrawal
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Bank Account Details</CardTitle>
            <CardDescription>Your registered payment information</CardDescription>
          </CardHeader>
          <CardContent>
            {wallet.is_verified ? (
              <div className="space-y-2">
                <div className="flex items-start space-x-2">
                  <div className="w-32 text-sm font-medium text-muted-foreground">Account Name:</div>
                  <div>{wallet.account_holder_name || 'Not provided'}</div>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-32 text-sm font-medium text-muted-foreground">Bank Name:</div>
                  <div>{wallet.bank_name || 'Not provided'}</div>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-32 text-sm font-medium text-muted-foreground">Account Number:</div>
                  <div>{wallet.bank_account_number ? '••••' + wallet.bank_account_number.slice(-4) : 'Not provided'}</div>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-32 text-sm font-medium text-muted-foreground">IFSC Code:</div>
                  <div>{wallet.bank_ifsc || 'Not provided'}</div>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-32 text-sm font-medium text-muted-foreground">PAN Number:</div>
                  <div>{wallet.pan_number ? wallet.pan_number.slice(0, 2) + '••••' + wallet.pan_number.slice(-2) : 'Not provided'}</div>
                </div>
              </div>
            ) : (
              <div>
                <p className="mb-4 text-sm text-muted-foreground">Your bank account details need to be verified before you can make withdrawals.</p>
                <Button variant="outline" size="sm">Update Bank Details</Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Transactions and Withdrawals */}
      <Tabs defaultValue="transactions">
        <TabsList className="grid grid-cols-2 w-[400px]">
          <TabsTrigger value="transactions">Transaction History</TabsTrigger>
          <TabsTrigger value="withdrawals">Withdrawal Requests</TabsTrigger>
        </TabsList>
        
        <TabsContent value="transactions" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>Your recent wallet transactions</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingTransactions ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : !transactions || transactions.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No transactions found</p>
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
                    {transactions.map((transaction: any) => (
                      <TableRow key={transaction.id}>
                        <TableCell className="whitespace-nowrap">{formatDate(transaction.transaction_date)}</TableCell>
                        <TableCell>{transaction.description}</TableCell>
                        <TableCell className="whitespace-nowrap">
                          <div className="flex items-center">
                            {getTransactionIcon(transaction.type)}
                            <span className="ml-2 capitalize">{transaction.type}</span>
                          </div>
                        </TableCell>
                        <TableCell className={`text-right font-medium ${transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                          {transaction.type === 'credit' ? '+' : '-'}{formatCurrency(transaction.amount)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="withdrawals" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Withdrawal Requests</CardTitle>
              <CardDescription>Your withdrawal request history</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingWithdrawals ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : !withdrawals || withdrawals.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No withdrawal requests found</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {withdrawals.map((withdrawal: any) => (
                      <TableRow key={withdrawal.id}>
                        <TableCell className="whitespace-nowrap">{formatDate(withdrawal.created_at)}</TableCell>
                        <TableCell className="font-medium">{formatCurrency(withdrawal.amount)}</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            {getStatusIcon(withdrawal.status)}
                            <span className="ml-2 capitalize">{withdrawal.status}</span>
                          </div>
                        </TableCell>
                        <TableCell>{withdrawal.notes || '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Withdrawal Dialog */}
      <Dialog open={isWithdrawalDialogOpen} onOpenChange={setIsWithdrawalDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Withdrawal</DialogTitle>
            <DialogDescription>
              Enter the amount you want to withdraw from your wallet.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...withdrawalForm}>
            <form onSubmit={withdrawalForm.handleSubmit(onWithdrawalSubmit)} className="space-y-4">
              <FormField
                control={withdrawalForm.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                        <Input placeholder="0.00" className="pl-8" {...field} />
                      </div>
                    </FormControl>
                    <FormDescription>
                      Available balance: {formatCurrency(wallet.balance)}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={withdrawalForm.control}
                name="paymentMethod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Method</FormLabel>
                    <FormControl>
                      <Input disabled {...field} />
                    </FormControl>
                    <FormDescription>
                      All withdrawals are processed via bank transfer.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={withdrawalForm.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes (Optional)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Any additional information" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
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
                  {createWithdrawalMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Submit Request
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WalletDashboard;