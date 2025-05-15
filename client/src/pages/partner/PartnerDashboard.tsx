import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '../../lib/queryClient';
import { Link } from 'wouter';
import WalletDashboard from '../../components/partner/WalletDashboard';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
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
  Home, 
  CreditCard, 
  ListChecks, 
  MapPin, 
  Users, 
  Settings, 
  Loader2, 
  Calendar, 
  Clock, 
  TrendingUp 
} from 'lucide-react';

const PartnerDashboard: React.FC = () => {
  const [activeSection, setActiveSection] = useState('dashboard');
  // For demo purposes, we'll use a hardcoded partner ID
  // In a real application, this would come from the authenticated user
  const partnerId = 1; 
  
  // Fetch partner info
  const { data: partner, isLoading: isLoadingPartner } = useQuery({
    queryKey: [`/api/partners/${partnerId}`],
    queryFn: async () => {
      try {
        return apiRequest('GET', `/api/partners/${partnerId}`).then(res => res.json());
      } catch (error) {
        // Handle the case where the partner doesn't exist yet
        return null;
      }
    },
  });
  
  // Fetch recent buyback requests assigned to this partner
  const { data: buybackRequests, isLoading: isLoadingBuybacks } = useQuery({
    queryKey: [`/api/partners/${partnerId}/buyback-requests`],
    queryFn: async () => {
      try {
        return apiRequest('GET', `/api/partners/${partnerId}/buyback-requests`).then(res => res.json());
      } catch (error) {
        return [];
      }
    },
  });
  
  const renderDashboardContent = () => {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Leads</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {buybackRequests?.filter(req => req.status === 'pending' || req.status === 'assigned').length || 0}
              </div>
            </CardContent>
            <CardFooter className="text-xs text-muted-foreground">
              <Clock className="h-3 w-3 inline mr-1" />
              Assigned to you for follow-up
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Completed Buybacks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {buybackRequests?.filter(req => req.status === 'completed').length || 0}
              </div>
            </CardContent>
            <CardFooter className="text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 inline mr-1" />
              Successfully processed buybacks
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Today's Schedule</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {buybackRequests?.filter(req => {
                  const today = new Date();
                  const scheduled = new Date(req.scheduled_date);
                  return scheduled.toDateString() === today.toDateString();
                }).length || 0}
              </div>
            </CardContent>
            <CardFooter className="text-xs text-muted-foreground">
              <Calendar className="h-3 w-3 inline mr-1" />
              Customer visits scheduled for today
            </CardFooter>
          </Card>
        </div>
        
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Leads</CardTitle>
                <CardDescription>Buyback requests assigned to you</CardDescription>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setActiveSection('leads')}
              >
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoadingBuybacks ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : !buybackRequests || buybackRequests.length === 0 ? (
              <div className="text-center py-8">
                <ListChecks className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                <p className="text-muted-foreground">No buyback requests assigned yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {buybackRequests.slice(0, 5).map((request) => (
                  <div key={request.id} className="flex items-center p-4 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium">{request.device_type} {request.model}</h4>
                      <p className="text-sm text-muted-foreground">
                        Status: <span className="font-medium capitalize">{request.status}</span>
                      </p>
                    </div>
                    <Button size="sm">View Details</Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };
  
  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return renderDashboardContent();
      case 'wallet':
        return <WalletDashboard partnerId={partnerId} />;
      case 'leads':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Assigned Leads</h2>
            <p>Coming soon...</p>
          </div>
        );
      case 'settings':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Account Settings</h2>
            <p>Coming soon...</p>
          </div>
        );
      default:
        return renderDashboardContent();
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold text-primary">
              <Link href="/" className="flex items-center">
                GadgetSwap Partner
              </Link>
            </h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm">Help</Button>
            <Button variant="outline" size="sm">Sign Out</Button>
          </div>
        </div>
      </header>
      
      <div className="container mx-auto px-4 py-6 grid grid-cols-12 gap-6">
        {/* Sidebar */}
        <aside className="col-span-12 md:col-span-3 lg:col-span-2">
          <div className="bg-white rounded-lg border shadow-sm sticky top-20">
            <div className="p-4 border-b">
              <h2 className="font-semibold">{partner?.name || 'Partner Dashboard'}</h2>
              <p className="text-sm text-muted-foreground">Partner Portal</p>
            </div>
            
            <nav className="p-2">
              <ul className="space-y-1">
                <li>
                  <button
                    onClick={() => setActiveSection('dashboard')}
                    className={`w-full flex items-center space-x-2 px-3 py-2 rounded-md text-sm ${
                      activeSection === 'dashboard' ? 'bg-primary text-primary-foreground' : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Home className="h-4 w-4" />
                    <span>Dashboard</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveSection('wallet')}
                    className={`w-full flex items-center space-x-2 px-3 py-2 rounded-md text-sm ${
                      activeSection === 'wallet' ? 'bg-primary text-primary-foreground' : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <CreditCard className="h-4 w-4" />
                    <span>Wallet</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveSection('leads')}
                    className={`w-full flex items-center space-x-2 px-3 py-2 rounded-md text-sm ${
                      activeSection === 'leads' ? 'bg-primary text-primary-foreground' : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <ListChecks className="h-4 w-4" />
                    <span>Leads</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveSection('settings')}
                    className={`w-full flex items-center space-x-2 px-3 py-2 rounded-md text-sm ${
                      activeSection === 'settings' ? 'bg-primary text-primary-foreground' : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Settings className="h-4 w-4" />
                    <span>Settings</span>
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </aside>
        
        {/* Main content */}
        <main className="col-span-12 md:col-span-9 lg:col-span-10">
          <div className="bg-white rounded-lg border shadow-sm p-6">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default PartnerDashboard;