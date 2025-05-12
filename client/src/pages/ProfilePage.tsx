import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCurrentUser, useUserOrders, useUserDevices, useUserBuybackRequests } from '../hooks/use-user';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Label } from "../components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { 
  User,
  ShoppingCart,
  Package,
  History,
  Settings,
  Smartphone,
  CreditCard,
  Loader2,
  Home,
  Mail,
  Phone
} from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import { getUserData } from '../hooks/use-user';

// Update profile schema
const profileSchema = z.object({
  first_name: z.string().min(2, { message: 'First name must be at least 2 characters' }),
  last_name: z.string().min(2, { message: 'Last name must be at least 2 characters' }),
  email: z.string().email({ message: 'Please enter a valid email address' }),
  phone: z.string().optional(),
  address_line1: z.string().optional(),
  address_line2: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postal_code: z.string().optional(),
  country: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

const ProfilePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('info');
  const navigate = useNavigate();
  const { toast } = useToast();
  const user = getUserData();
  
  // Fetch user data
  const { data: currentUser, isLoading: isUserLoading } = useCurrentUser();
  const { data: orders, isLoading: isOrdersLoading } = useUserOrders(user?.id);
  const { data: devices, isLoading: isDevicesLoading } = useUserDevices(user?.id);
  const { data: buybackRequests, isLoading: isBuybackLoading } = useUserBuybackRequests(user?.id);
  
  // Profile form hook
  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      first_name: user?.first_name || '',
      last_name: user?.last_name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      address_line1: user?.address_line1 || '',
      address_line2: user?.address_line2 || '',
      city: user?.city || '',
      state: user?.state || '',
      postal_code: user?.postal_code || '',
      country: user?.country || '',
    },
  });
  
  // Handle profile form submission
  const onProfileSubmit = (values: ProfileFormValues) => {
    // In a real app, this would update the user profile through an API
    toast({
      title: 'Profile updated',
      description: 'Your profile has been updated successfully.',
    });
  };

  // If not authenticated, redirect to login
  if (!user) {
    navigate('/login', { state: { from: { pathname: '/profile' } } });
    return null;
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">My Account</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Sidebar Navigation */}
        <Card className="md:col-span-1">
          <CardContent className="p-4">
            <nav className="space-y-2">
              <Button 
                variant={activeTab === 'info' ? 'default' : 'ghost'} 
                className="w-full justify-start"
                onClick={() => setActiveTab('info')}
              >
                <User className="mr-2 h-4 w-4" />
                Personal Info
              </Button>
              <Button 
                variant={activeTab === 'orders' ? 'default' : 'ghost'} 
                className="w-full justify-start"
                onClick={() => setActiveTab('orders')}
              >
                <ShoppingCart className="mr-2 h-4 w-4" />
                My Orders
              </Button>
              <Button 
                variant={activeTab === 'devices' ? 'default' : 'ghost'} 
                className="w-full justify-start"
                onClick={() => setActiveTab('devices')}
              >
                <Smartphone className="mr-2 h-4 w-4" />
                My Devices
              </Button>
              <Button 
                variant={activeTab === 'buyback' ? 'default' : 'ghost'} 
                className="w-full justify-start"
                onClick={() => setActiveTab('buyback')}
              >
                <Package className="mr-2 h-4 w-4" />
                Buyback Requests
              </Button>
              <Button 
                variant={activeTab === 'payments' ? 'default' : 'ghost'} 
                className="w-full justify-start"
                onClick={() => setActiveTab('payments')}
              >
                <CreditCard className="mr-2 h-4 w-4" />
                Payment Methods
              </Button>
              <Button 
                variant={activeTab === 'history' ? 'default' : 'ghost'} 
                className="w-full justify-start"
                onClick={() => setActiveTab('history')}
              >
                <History className="mr-2 h-4 w-4" />
                Purchase History
              </Button>
              <Button 
                variant={activeTab === 'settings' ? 'default' : 'ghost'} 
                className="w-full justify-start"
                onClick={() => setActiveTab('settings')}
              >
                <Settings className="mr-2 h-4 w-4" />
                Account Settings
              </Button>
            </nav>
          </CardContent>
        </Card>
        
        {/* Content Area */}
        <div className="md:col-span-3">
          {/* Personal Info */}
          {activeTab === 'info' && (
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Update your account details</CardDescription>
              </CardHeader>
              <form onSubmit={profileForm.handleSubmit(onProfileSubmit)}>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="first_name">First Name</Label>
                      <Input 
                        id="first_name" 
                        {...profileForm.register('first_name')}
                      />
                      {profileForm.formState.errors.first_name && (
                        <p className="text-sm text-red-500">{profileForm.formState.errors.first_name.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="last_name">Last Name</Label>
                      <Input 
                        id="last_name" 
                        {...profileForm.register('last_name')}
                      />
                      {profileForm.formState.errors.last_name && (
                        <p className="text-sm text-red-500">{profileForm.formState.errors.last_name.message}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="flex">
                      <Mail className="h-5 w-5 mr-2 text-gray-400 self-center" />
                      <Input 
                        id="email" 
                        type="email" 
                        {...profileForm.register('email')}
                      />
                    </div>
                    {profileForm.formState.errors.email && (
                      <p className="text-sm text-red-500">{profileForm.formState.errors.email.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <div className="flex">
                      <Phone className="h-5 w-5 mr-2 text-gray-400 self-center" />
                      <Input 
                        id="phone" 
                        type="tel" 
                        {...profileForm.register('phone')}
                      />
                    </div>
                  </div>
                  
                  <div className="pt-4">
                    <h3 className="text-lg font-medium mb-2">Address Information</h3>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="address_line1">Address Line 1</Label>
                        <div className="flex">
                          <Home className="h-5 w-5 mr-2 text-gray-400 self-center" />
                          <Input 
                            id="address_line1" 
                            {...profileForm.register('address_line1')}
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="address_line2">Address Line 2</Label>
                        <Input 
                          id="address_line2" 
                          {...profileForm.register('address_line2')}
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="city">City</Label>
                          <Input 
                            id="city" 
                            {...profileForm.register('city')}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="state">State/Province</Label>
                          <Input 
                            id="state" 
                            {...profileForm.register('state')}
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="postal_code">Postal Code</Label>
                          <Input 
                            id="postal_code" 
                            {...profileForm.register('postal_code')}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="country">Country</Label>
                          <Input 
                            id="country" 
                            {...profileForm.register('country')}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    type="submit" 
                    className="bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900"
                  >
                    Save Changes
                  </Button>
                </CardFooter>
              </form>
            </Card>
          )}
          
          {/* Orders */}
          {activeTab === 'orders' && (
            <Card>
              <CardHeader>
                <CardTitle>My Orders</CardTitle>
                <CardDescription>View and track your order history</CardDescription>
              </CardHeader>
              <CardContent>
                {isOrdersLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                  </div>
                ) : orders && orders.length > 0 ? (
                  <div className="space-y-4">
                    {orders.map((order: any) => (
                      <Card key={order.id} className="overflow-hidden">
                        <div className="bg-blue-50 p-4 flex justify-between items-center border-b">
                          <div>
                            <p className="text-sm text-gray-500">Order #{order.id}</p>
                            <p className="font-medium">{new Date(order.created_at).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              order.status === 'completed' ? 'bg-green-100 text-green-800' :
                              order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                              order.status === 'shipped' ? 'bg-purple-100 text-purple-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {order.status}
                            </span>
                          </div>
                        </div>
                        <div className="p-4">
                          <div className="flex justify-between mb-2">
                            <span className="font-medium">Total:</span>
                            <span className="font-bold">${order.total_amount}</span>
                          </div>
                          <div className="mt-4">
                            <Button variant="outline" size="sm" className="mr-2">
                              View Details
                            </Button>
                            <Button variant="ghost" size="sm">
                              Track Order
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <ShoppingCart className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium">No orders yet</h3>
                    <p className="text-gray-500 mt-2">When you place an order, it will appear here</p>
                    <Button className="mt-4" onClick={() => navigate('/shop')}>
                      Start Shopping
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
          
          {/* Devices */}
          {activeTab === 'devices' && (
            <Card>
              <CardHeader>
                <CardTitle>My Devices</CardTitle>
                <CardDescription>Manage your registered devices</CardDescription>
              </CardHeader>
              <CardContent>
                {isDevicesLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                  </div>
                ) : devices && devices.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {devices.map((device: any) => (
                      <Card key={device.id} className="overflow-hidden">
                        <div className="p-4">
                          <h3 className="font-medium">{device.model_name}</h3>
                          <p className="text-sm text-gray-500">{device.brand_name} • {device.condition}</p>
                          
                          <div className="mt-4 flex justify-between items-center">
                            <div>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                device.status === 'active' ? 'bg-green-100 text-green-800' :
                                device.status === 'sold' ? 'bg-blue-100 text-blue-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {device.status}
                              </span>
                            </div>
                            <Button variant="outline" size="sm">View Details</Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Smartphone className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium">No devices registered</h3>
                    <p className="text-gray-500 mt-2">When you register a device, it will appear here</p>
                    <Button className="mt-4" onClick={() => navigate('/sell')}>
                      Sell a Device
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
          
          {/* Buyback Requests */}
          {activeTab === 'buyback' && (
            <Card>
              <CardHeader>
                <CardTitle>Buyback Requests</CardTitle>
                <CardDescription>Track your device buyback requests</CardDescription>
              </CardHeader>
              <CardContent>
                {isBuybackLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                  </div>
                ) : buybackRequests && buybackRequests.length > 0 ? (
                  <div className="space-y-4">
                    {buybackRequests.map((request: any) => (
                      <Card key={request.id} className="overflow-hidden">
                        <div className="bg-blue-50 p-4 flex justify-between items-center border-b">
                          <div>
                            <p className="font-medium">{request.device_name}</p>
                            <p className="text-sm text-gray-500">Request date: {new Date(request.created_at).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              request.status === 'approved' ? 'bg-green-100 text-green-800' :
                              request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              request.status === 'rejected' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {request.status}
                            </span>
                          </div>
                        </div>
                        <div className="p-4">
                          <div className="flex justify-between mb-2">
                            <span className="font-medium">Offer Amount:</span>
                            <span className="font-bold">${request.offer_amount}</span>
                          </div>
                          <div className="mt-4">
                            <Button variant="outline" size="sm">
                              View Details
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium">No buyback requests</h3>
                    <p className="text-gray-500 mt-2">When you request a buyback, it will appear here</p>
                    <Button className="mt-4" onClick={() => navigate('/buyback')}>
                      Start a Buyback
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
          
          {/* Payment Methods */}
          {activeTab === 'payments' && (
            <Card>
              <CardHeader>
                <CardTitle>Payment Methods</CardTitle>
                <CardDescription>Manage your payment options</CardDescription>
              </CardHeader>
              <CardContent className="text-center py-8">
                <CreditCard className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium">No payment methods added</h3>
                <p className="text-gray-500 mt-2">Add a payment method to make checkout faster</p>
                <Button className="mt-4">
                  Add Payment Method
                </Button>
              </CardContent>
            </Card>
          )}
          
          {/* Purchase History */}
          {activeTab === 'history' && (
            <Card>
              <CardHeader>
                <CardTitle>Purchase History</CardTitle>
                <CardDescription>View your complete transaction history</CardDescription>
              </CardHeader>
              <CardContent className="text-center py-8">
                <History className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium">No purchase history</h3>
                <p className="text-gray-500 mt-2">Your purchase history will appear here</p>
                <Button className="mt-4" onClick={() => navigate('/shop')}>
                  Browse Products
                </Button>
              </CardContent>
            </Card>
          )}
          
          {/* Account Settings */}
          {activeTab === 'settings' && (
            <Card>
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
                <CardDescription>Manage your account preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">Email Preferences</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Order notifications</p>
                        <p className="text-sm text-gray-500">Receive updates about your orders</p>
                      </div>
                      <Button variant="outline" size="sm">Enabled</Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Promotional emails</p>
                        <p className="text-sm text-gray-500">Receive special offers and deals</p>
                      </div>
                      <Button variant="outline" size="sm">Disabled</Button>
                    </div>
                  </div>
                </div>
                
                <div className="pt-4 border-t">
                  <h3 className="text-lg font-medium mb-2">Security</h3>
                  <div className="space-y-4">
                    <Button variant="outline">Change Password</Button>
                    <Button variant="outline">Two-Factor Authentication</Button>
                  </div>
                </div>
                
                <div className="pt-4 border-t">
                  <h3 className="text-lg font-medium mb-2">Account Actions</h3>
                  <div className="space-y-4">
                    <Button variant="outline">Download Personal Data</Button>
                    <Button variant="destructive">Delete Account</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;