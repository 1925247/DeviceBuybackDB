import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'wouter';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { 
  User, 
  LayoutDashboard, 
  CreditCard, 
  Package, 
  Phone, 
  Smartphone, 
  Loader2, 
  AlertCircle, 
  Truck, 
  FileText,
  Settings,
  Users,
  LogOut
} from 'lucide-react';
import WalletDashboard from '@/components/partner/WalletDashboard';
import { Partner } from '@shared/schema';

const PartnerDashboard = () => {
  const { partnerId } = useParams<{ partnerId: string }>();
  const [activeTab, setActiveTab] = useState('overview');
  const { toast } = useToast();
  
  // Fetch partner data
  const { data: partner, isLoading, error } = useQuery<Partner>({
    queryKey: [`/api/partners/${partnerId}`],
    retry: false,
  });
  
  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (error || !partner) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h3 className="text-xl font-semibold mb-2">Access Error</h3>
        <p className="text-muted-foreground mb-6">Unable to access partner dashboard. Please check your credentials.</p>
        <Button asChild>
          <Link href="/login">Return to Login</Link>
        </Button>
      </div>
    );
  }
  
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <div className="hidden md:flex w-64 flex-col gap-y-2 border-r bg-background p-6">
        <div className="flex h-16 items-center justify-start">
          <h2 className="text-lg font-semibold">GadgetSwap Partner</h2>
        </div>
        <div className="space-y-1">
          <Button 
            variant={activeTab === 'overview' ? 'default' : 'ghost'} 
            className="w-full justify-start" 
            onClick={() => handleTabChange('overview')}
          >
            <LayoutDashboard className="mr-2 h-4 w-4" />
            Dashboard
          </Button>
          <Button 
            variant={activeTab === 'leads' ? 'default' : 'ghost'} 
            className="w-full justify-start" 
            onClick={() => handleTabChange('leads')}
          >
            <Phone className="mr-2 h-4 w-4" />
            Buyback Leads
          </Button>
          <Button 
            variant={activeTab === 'devices' ? 'default' : 'ghost'} 
            className="w-full justify-start" 
            onClick={() => handleTabChange('devices')}
          >
            <Smartphone className="mr-2 h-4 w-4" />
            Devices
          </Button>
          <Button 
            variant={activeTab === 'wallet' ? 'default' : 'ghost'} 
            className="w-full justify-start" 
            onClick={() => handleTabChange('wallet')}
          >
            <CreditCard className="mr-2 h-4 w-4" />
            Wallet
          </Button>
          <Button 
            variant={activeTab === 'orders' ? 'default' : 'ghost'} 
            className="w-full justify-start" 
            onClick={() => handleTabChange('orders')}
          >
            <Package className="mr-2 h-4 w-4" />
            Orders
          </Button>
          <Button 
            variant={activeTab === 'invoices' ? 'default' : 'ghost'} 
            className="w-full justify-start" 
            onClick={() => handleTabChange('invoices')}
          >
            <FileText className="mr-2 h-4 w-4" />
            Invoices
          </Button>
          <Button 
            variant={activeTab === 'settings' ? 'default' : 'ghost'} 
            className="w-full justify-start" 
            onClick={() => handleTabChange('settings')}
          >
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
        </div>
        
        <div className="mt-auto">
          <Button variant="ghost" className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50">
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="flex flex-col h-full">
          {/* Header */}
          <header className="sticky top-0 z-10 border-b bg-background p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-x-4">
                <h1 className="text-xl font-bold">{partner.name}</h1>
                <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">Active</span>
              </div>
              <div className="flex items-center gap-x-4">
                <Link href="/notifications">
                  <Button variant="ghost" size="icon" className="relative">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-bell"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"></path><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"></path></svg>
                    <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-primary"></span>
                  </Button>
                </Link>
                <div className="flex items-center gap-x-2">
                  <div className="relative h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                    <User className="h-5 w-5 text-gray-600" />
                  </div>
                  <div className="hidden md:block">
                    <div className="text-sm font-medium">{partner.name}</div>
                    <div className="text-xs text-muted-foreground">Partner</div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Mobile Tab Navigation */}
            <div className="md:hidden mt-4">
              <select 
                className="w-full rounded-md border px-3 py-2"
                value={activeTab}
                onChange={(e) => handleTabChange(e.target.value)}
              >
                <option value="overview">Dashboard</option>
                <option value="leads">Buyback Leads</option>
                <option value="devices">Devices</option>
                <option value="wallet">Wallet</option>
                <option value="orders">Orders</option>
                <option value="invoices">Invoices</option>
                <option value="settings">Settings</option>
              </select>
            </div>
          </header>
          
          {/* Tab Content */}
          <main className="flex-1 p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
                      <Phone className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">12</div>
                      <p className="text-xs text-muted-foreground">+2 from last week</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium">Completed Buybacks</CardTitle>
                      <Smartphone className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">8</div>
                      <p className="text-xs text-muted-foreground">+1 from last week</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
                      <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">3</div>
                      <p className="text-xs text-muted-foreground">Same as last week</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium">Wallet Balance</CardTitle>
                      <CreditCard className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">₹24,500</div>
                      <p className="text-xs text-muted-foreground">+₹8,500 this month</p>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <Card className="col-span-2">
                    <CardHeader>
                      <CardTitle>Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-8">
                        <div className="flex items-center">
                          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-50 text-blue-700 mr-4">
                            <Phone className="h-5 w-5" />
                          </div>
                          <div className="flex-1 space-y-1">
                            <p className="text-sm font-medium">New iPhone 13 Pro lead assigned</p>
                            <p className="text-xs text-muted-foreground">2 hours ago</p>
                          </div>
                          <Button variant="outline" size="sm">View</Button>
                        </div>
                        <div className="flex items-center">
                          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-50 text-green-700 mr-4">
                            <CreditCard className="h-5 w-5" />
                          </div>
                          <div className="flex-1 space-y-1">
                            <p className="text-sm font-medium">Wallet credited with ₹4,500</p>
                            <p className="text-xs text-muted-foreground">Yesterday</p>
                          </div>
                          <Button variant="outline" size="sm">View</Button>
                        </div>
                        <div className="flex items-center">
                          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-50 text-purple-700 mr-4">
                            <Truck className="h-5 w-5" />
                          </div>
                          <div className="flex-1 space-y-1">
                            <p className="text-sm font-medium">Shipment #GS2342 out for delivery</p>
                            <p className="text-xs text-muted-foreground">2 days ago</p>
                          </div>
                          <Button variant="outline" size="sm">Track</Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Your Performance</CardTitle>
                      <CardDescription>Compared to other partners</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="text-sm font-medium">Lead Conversion Rate</div>
                            <div className="text-sm font-medium">85%</div>
                          </div>
                          <div className="h-2 w-full rounded-full bg-gray-100">
                            <div className="h-full w-[85%] rounded-full bg-green-500"></div>
                          </div>
                          <div className="text-xs text-muted-foreground">15% above average</div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="text-sm font-medium">Response Time</div>
                            <div className="text-sm font-medium">1.2 hrs</div>
                          </div>
                          <div className="h-2 w-full rounded-full bg-gray-100">
                            <div className="h-full w-[70%] rounded-full bg-blue-500"></div>
                          </div>
                          <div className="text-xs text-muted-foreground">10% faster than average</div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="text-sm font-medium">Customer Satisfaction</div>
                            <div className="text-sm font-medium">4.8/5</div>
                          </div>
                          <div className="h-2 w-full rounded-full bg-gray-100">
                            <div className="h-full w-[95%] rounded-full bg-yellow-500"></div>
                          </div>
                          <div className="text-xs text-muted-foreground">Top 5% of all partners</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
            
            {activeTab === 'leads' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold tracking-tight">Buyback Leads</h2>
                <p className="text-muted-foreground">Manage your assigned leads and track their status.</p>
                <div className="text-center py-12">
                  <h3 className="text-lg font-medium mb-2">Lead Management Coming Soon</h3>
                  <p className="text-muted-foreground">This feature is under development and will be available shortly.</p>
                </div>
              </div>
            )}
            
            {activeTab === 'devices' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold tracking-tight">Device Inventory</h2>
                <p className="text-muted-foreground">Manage your device inventory for buyback and sales.</p>
                <div className="text-center py-12">
                  <h3 className="text-lg font-medium mb-2">Device Management Coming Soon</h3>
                  <p className="text-muted-foreground">This feature is under development and will be available shortly.</p>
                </div>
              </div>
            )}
            
            {activeTab === 'wallet' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold tracking-tight">Wallet</h2>
                <p className="text-muted-foreground">Manage your wallet, view transactions, and request withdrawals.</p>
                <WalletDashboard partnerId={parseInt(partnerId)} />
              </div>
            )}
            
            {activeTab === 'orders' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold tracking-tight">Orders</h2>
                <p className="text-muted-foreground">Track and manage your orders.</p>
                <div className="text-center py-12">
                  <h3 className="text-lg font-medium mb-2">Order Management Coming Soon</h3>
                  <p className="text-muted-foreground">This feature is under development and will be available shortly.</p>
                </div>
              </div>
            )}
            
            {activeTab === 'invoices' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold tracking-tight">Invoices</h2>
                <p className="text-muted-foreground">View and download your invoices.</p>
                <div className="text-center py-12">
                  <h3 className="text-lg font-medium mb-2">Invoice Management Coming Soon</h3>
                  <p className="text-muted-foreground">This feature is under development and will be available shortly.</p>
                </div>
              </div>
            )}
            
            {activeTab === 'settings' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
                <p className="text-muted-foreground">Manage your account settings and preferences.</p>
                <div className="text-center py-12">
                  <h3 className="text-lg font-medium mb-2">Settings Management Coming Soon</h3>
                  <p className="text-muted-foreground">This feature is under development and will be available shortly.</p>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default PartnerDashboard;