import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { queryClient, apiRequest } from '@/lib/queryClient';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Truck, CreditCard, Tag, Mail, Globe, Settings } from 'lucide-react';

interface MarketplaceSettings {
  site_name: string;
  site_url: string;
  site_description: string;
  logo_url?: string;
  favicon_url?: string;
  primary_color: string;
  secondary_color: string;
  enable_marketplace: boolean;
  enable_reviews: boolean;
  default_currency: string;
  tax_rate: number;
  shipping: {
    enable_shipping: boolean;
    default_shipping_fee: number;
    free_shipping_threshold?: number;
    shipping_providers: string[];
    shipping_zones: {
      id: string;
      name: string;
      countries: string[];
      rate: number;
    }[];
  };
  payment: {
    providers: {
      stripe: {
        enabled: boolean;
        test_mode: boolean;
      };
      paypal: {
        enabled: boolean;
        test_mode: boolean;
      };
      bank_transfer: {
        enabled: boolean;
        account_details: string;
      };
    };
    order_prefix: string;
    invoice_prefix: string;
  };
  email: {
    sender_name: string;
    sender_email: string;
    enable_notifications: boolean;
    notification_templates: {
      order_confirmation: boolean;
      order_shipped: boolean;
      order_delivered: boolean;
      order_cancelled: boolean;
    };
  };
  seo: {
    meta_title: string;
    meta_description: string;
    keywords: string;
    enable_sitemap: boolean;
    enable_robots: boolean;
  };
}

const AdminMarketplaceSettings: React.FC = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState<MarketplaceSettings>({
    site_name: '',
    site_url: '',
    site_description: '',
    primary_color: '#3b82f6',
    secondary_color: '#10b981',
    enable_marketplace: true,
    enable_reviews: true,
    default_currency: 'USD',
    tax_rate: 0,
    shipping: {
      enable_shipping: true,
      default_shipping_fee: 0,
      free_shipping_threshold: 0,
      shipping_providers: [],
      shipping_zones: [],
    },
    payment: {
      providers: {
        stripe: {
          enabled: true,
          test_mode: true,
        },
        paypal: {
          enabled: false,
          test_mode: true,
        },
        bank_transfer: {
          enabled: false,
          account_details: '',
        },
      },
      order_prefix: 'ORD',
      invoice_prefix: 'INV',
    },
    email: {
      sender_name: '',
      sender_email: '',
      enable_notifications: true,
      notification_templates: {
        order_confirmation: true,
        order_shipped: true,
        order_delivered: true,
        order_cancelled: true,
      },
    },
    seo: {
      meta_title: '',
      meta_description: '',
      keywords: '',
      enable_sitemap: true,
      enable_robots: true,
    },
  });

  // Query hook for fetching settings
  const { isLoading: isLoadingSettings } = useQuery({
    queryKey: ['/api/settings'],
    queryFn: async () => {
      return apiRequest('GET', '/api/settings').then(res => res.json());
    },
    onSuccess: (data) => {
      setSettings(data);
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to load marketplace settings',
        variant: 'destructive',
      });
    },
  });

  // Mutation hook for updating settings
  const updateSettingsMutation = useMutation({
    mutationFn: async (updatedSettings: MarketplaceSettings) => {
      return apiRequest('PUT', '/api/settings', updatedSettings).then(res => res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/settings'] });
      toast({
        title: 'Success',
        description: 'Settings updated successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update settings',
        variant: 'destructive',
      });
    },
  });

  // Handler for updating settings
  const handleUpdateSettings = (section: string, field: string, value: any) => {
    setSettings(prev => {
      const newSettings = { ...prev };
      
      // Handle nested fields
      if (section.includes('.')) {
        const [mainSection, subSection, subSubSection] = section.split('.');
        if (subSubSection) {
          // @ts-ignore
          newSettings[mainSection][subSection][subSubSection][field] = value;
        } else {
          // @ts-ignore
          newSettings[mainSection][subSection][field] = value;
        }
      } else if (section) {
        // @ts-ignore
        newSettings[section][field] = value;
      } else {
        // @ts-ignore
        newSettings[field] = value;
      }
      
      return newSettings;
    });
  };

  // Handler for saving settings
  const handleSaveSettings = () => {
    updateSettingsMutation.mutate(settings);
  };

  // Loading state
  if (isLoadingSettings) {
    return (
      <div className="py-8 px-4">
        <h1 className="text-2xl font-bold mb-6">Marketplace Settings</h1>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Marketplace Settings</h1>
          <p className="text-gray-500">Configure your marketplace settings</p>
        </div>
        <Button 
          onClick={handleSaveSettings}
          disabled={updateSettingsMutation.isPending}
        >
          {updateSettingsMutation.isPending ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="shipping">Shipping</TabsTrigger>
          <TabsTrigger value="payment">Payment</TabsTrigger>
          <TabsTrigger value="email">Email</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Store Information</CardTitle>
              <CardDescription>
                Basic information about your marketplace
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="site_name">Store Name</Label>
                  <Input
                    id="site_name"
                    value={settings.site_name}
                    onChange={(e) => handleUpdateSettings('', 'site_name', e.target.value)}
                    placeholder="e.g., GadgetSwap"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="site_url">Store URL</Label>
                  <Input
                    id="site_url"
                    value={settings.site_url}
                    onChange={(e) => handleUpdateSettings('', 'site_url', e.target.value)}
                    placeholder="e.g., https://gadgetswap.com"
                  />
                </div>
                
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="site_description">Store Description</Label>
                  <Textarea
                    id="site_description"
                    value={settings.site_description}
                    onChange={(e) => handleUpdateSettings('', 'site_description', e.target.value)}
                    placeholder="Brief description of your marketplace"
                    rows={3}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>
                Visual settings for your marketplace
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="primary_color">Primary Color</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="primary_color"
                      type="color"
                      className="w-12 h-9 p-1"
                      value={settings.primary_color}
                      onChange={(e) => handleUpdateSettings('', 'primary_color', e.target.value)}
                    />
                    <Input
                      value={settings.primary_color}
                      onChange={(e) => handleUpdateSettings('', 'primary_color', e.target.value)}
                      placeholder="#3b82f6"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="secondary_color">Secondary Color</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="secondary_color"
                      type="color"
                      className="w-12 h-9 p-1"
                      value={settings.secondary_color}
                      onChange={(e) => handleUpdateSettings('', 'secondary_color', e.target.value)}
                    />
                    <Input
                      value={settings.secondary_color}
                      onChange={(e) => handleUpdateSettings('', 'secondary_color', e.target.value)}
                      placeholder="#10b981"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="logo_url">Logo URL</Label>
                  <Input
                    id="logo_url"
                    value={settings.logo_url || ''}
                    onChange={(e) => handleUpdateSettings('', 'logo_url', e.target.value)}
                    placeholder="e.g., https://example.com/logo.png"
                  />
                  <p className="text-xs text-gray-500">
                    Logo upload functionality will be implemented soon.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="favicon_url">Favicon URL</Label>
                  <Input
                    id="favicon_url"
                    value={settings.favicon_url || ''}
                    onChange={(e) => handleUpdateSettings('', 'favicon_url', e.target.value)}
                    placeholder="e.g., https://example.com/favicon.ico"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Marketplace Settings</CardTitle>
              <CardDescription>
                General settings for your marketplace
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="default_currency">Default Currency</Label>
                  <Select 
                    value={settings.default_currency} 
                    onValueChange={(value) => handleUpdateSettings('', 'default_currency', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">US Dollar (USD)</SelectItem>
                      <SelectItem value="EUR">Euro (EUR)</SelectItem>
                      <SelectItem value="GBP">British Pound (GBP)</SelectItem>
                      <SelectItem value="CAD">Canadian Dollar (CAD)</SelectItem>
                      <SelectItem value="AUD">Australian Dollar (AUD)</SelectItem>
                      <SelectItem value="JPY">Japanese Yen (JPY)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="tax_rate">Default Tax Rate (%)</Label>
                  <Input
                    id="tax_rate"
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={settings.tax_rate}
                    onChange={(e) => handleUpdateSettings('', 'tax_rate', parseFloat(e.target.value))}
                    placeholder="e.g., 7.5"
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={settings.enable_marketplace}
                    onCheckedChange={(checked) => handleUpdateSettings('', 'enable_marketplace', checked)}
                    id="enable_marketplace"
                  />
                  <Label htmlFor="enable_marketplace">Enable Marketplace</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={settings.enable_reviews}
                    onCheckedChange={(checked) => handleUpdateSettings('', 'enable_reviews', checked)}
                    id="enable_reviews"
                  />
                  <Label htmlFor="enable_reviews">Enable Product Reviews</Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Shipping Settings */}
        <TabsContent value="shipping" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Truck className="h-5 w-5" />
                <CardTitle>Shipping Settings</CardTitle>
              </div>
              <CardDescription>
                Configure shipping options for your marketplace
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={settings.shipping.enable_shipping}
                  onCheckedChange={(checked) => handleUpdateSettings('shipping', 'enable_shipping', checked)}
                  id="enable_shipping"
                />
                <Label htmlFor="enable_shipping">Enable Shipping</Label>
              </div>
              
              <Separator className="my-4" />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="default_shipping_fee">Default Shipping Fee ($)</Label>
                  <Input
                    id="default_shipping_fee"
                    type="number"
                    min="0"
                    step="0.01"
                    value={settings.shipping.default_shipping_fee}
                    onChange={(e) => handleUpdateSettings('shipping', 'default_shipping_fee', parseFloat(e.target.value))}
                    disabled={!settings.shipping.enable_shipping}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="free_shipping_threshold">Free Shipping Threshold ($)</Label>
                  <Input
                    id="free_shipping_threshold"
                    type="number"
                    min="0"
                    step="0.01"
                    value={settings.shipping.free_shipping_threshold}
                    onChange={(e) => handleUpdateSettings('shipping', 'free_shipping_threshold', parseFloat(e.target.value))}
                    disabled={!settings.shipping.enable_shipping}
                    placeholder="Enter 0 to disable free shipping"
                  />
                  <p className="text-xs text-gray-500">
                    Orders above this amount qualify for free shipping
                  </p>
                </div>
              </div>
              
              <div className="rounded-md bg-gray-50 p-4 mt-6">
                <h3 className="font-medium text-sm mb-2">Advanced Shipping Configuration</h3>
                <p className="text-xs text-gray-500 mb-4">
                  Shipping zones and detailed rates can be configured through the API or by contacting support.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payment Settings */}
        <TabsContent value="payment" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                <CardTitle>Payment Providers</CardTitle>
              </div>
              <CardDescription>
                Configure payment methods for your marketplace
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-6">
                <div className="border rounded-md p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="font-medium">Stripe</div>
                      <div className={`px-2 py-0.5 rounded-full text-xs ${settings.payment.providers.stripe.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {settings.payment.providers.stripe.enabled ? 'Enabled' : 'Disabled'}
                      </div>
                    </div>
                    <Switch
                      checked={settings.payment.providers.stripe.enabled}
                      onCheckedChange={(checked) => handleUpdateSettings('payment.providers.stripe', 'enabled', checked)}
                      id="enable_stripe"
                    />
                  </div>
                  
                  {settings.payment.providers.stripe.enabled && (
                    <div className="mt-4 space-y-2">
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={settings.payment.providers.stripe.test_mode}
                          onCheckedChange={(checked) => handleUpdateSettings('payment.providers.stripe', 'test_mode', checked)}
                          id="stripe_test_mode"
                        />
                        <Label htmlFor="stripe_test_mode">Test Mode</Label>
                      </div>
                      <p className="text-xs text-gray-500">
                        API keys should be configured in environment variables. Contact support for assistance.
                      </p>
                    </div>
                  )}
                </div>
                
                <div className="border rounded-md p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="font-medium">PayPal</div>
                      <div className={`px-2 py-0.5 rounded-full text-xs ${settings.payment.providers.paypal.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {settings.payment.providers.paypal.enabled ? 'Enabled' : 'Disabled'}
                      </div>
                    </div>
                    <Switch
                      checked={settings.payment.providers.paypal.enabled}
                      onCheckedChange={(checked) => handleUpdateSettings('payment.providers.paypal', 'enabled', checked)}
                      id="enable_paypal"
                    />
                  </div>
                  
                  {settings.payment.providers.paypal.enabled && (
                    <div className="mt-4 space-y-2">
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={settings.payment.providers.paypal.test_mode}
                          onCheckedChange={(checked) => handleUpdateSettings('payment.providers.paypal', 'test_mode', checked)}
                          id="paypal_test_mode"
                        />
                        <Label htmlFor="paypal_test_mode">Test Mode</Label>
                      </div>
                      <p className="text-xs text-gray-500">
                        API keys should be configured in environment variables. Contact support for assistance.
                      </p>
                    </div>
                  )}
                </div>
                
                <div className="border rounded-md p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="font-medium">Bank Transfer</div>
                      <div className={`px-2 py-0.5 rounded-full text-xs ${settings.payment.providers.bank_transfer.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {settings.payment.providers.bank_transfer.enabled ? 'Enabled' : 'Disabled'}
                      </div>
                    </div>
                    <Switch
                      checked={settings.payment.providers.bank_transfer.enabled}
                      onCheckedChange={(checked) => handleUpdateSettings('payment.providers.bank_transfer', 'enabled', checked)}
                      id="enable_bank_transfer"
                    />
                  </div>
                  
                  {settings.payment.providers.bank_transfer.enabled && (
                    <div className="mt-4 space-y-2">
                      <Label htmlFor="bank_account_details">Bank Account Details</Label>
                      <Textarea
                        id="bank_account_details"
                        value={settings.payment.providers.bank_transfer.account_details}
                        onChange={(e) => handleUpdateSettings('payment.providers.bank_transfer', 'account_details', e.target.value)}
                        placeholder="Enter bank account details to be displayed to customers"
                        rows={3}
                      />
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Order Settings</CardTitle>
              <CardDescription>
                Configure order and invoice settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="order_prefix">Order Number Prefix</Label>
                  <Input
                    id="order_prefix"
                    value={settings.payment.order_prefix}
                    onChange={(e) => handleUpdateSettings('payment', 'order_prefix', e.target.value)}
                    placeholder="e.g., ORD"
                  />
                  <p className="text-xs text-gray-500">
                    Will be displayed as: {settings.payment.order_prefix}123456
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="invoice_prefix">Invoice Number Prefix</Label>
                  <Input
                    id="invoice_prefix"
                    value={settings.payment.invoice_prefix}
                    onChange={(e) => handleUpdateSettings('payment', 'invoice_prefix', e.target.value)}
                    placeholder="e.g., INV"
                  />
                  <p className="text-xs text-gray-500">
                    Will be displayed as: {settings.payment.invoice_prefix}123456
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Email Settings */}
        <TabsContent value="email" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                <CardTitle>Email Settings</CardTitle>
              </div>
              <CardDescription>
                Configure email notifications for your marketplace
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="sender_name">Sender Name</Label>
                  <Input
                    id="sender_name"
                    value={settings.email.sender_name}
                    onChange={(e) => handleUpdateSettings('email', 'sender_name', e.target.value)}
                    placeholder="e.g., GadgetSwap Support"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="sender_email">Sender Email</Label>
                  <Input
                    id="sender_email"
                    value={settings.email.sender_email}
                    onChange={(e) => handleUpdateSettings('email', 'sender_email', e.target.value)}
                    placeholder="e.g., support@gadgetswap.com"
                    type="email"
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-2 mt-6">
                <Switch
                  checked={settings.email.enable_notifications}
                  onCheckedChange={(checked) => handleUpdateSettings('email', 'enable_notifications', checked)}
                  id="enable_notifications"
                />
                <Label htmlFor="enable_notifications">Enable Email Notifications</Label>
              </div>
              
              <div className="bg-gray-50 rounded-md p-4 mt-4">
                <h3 className="font-medium text-sm mb-3">Notification Templates</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="order_confirmation" className="cursor-pointer flex-grow">Order Confirmation</Label>
                    <Switch
                      checked={settings.email.notification_templates.order_confirmation}
                      onCheckedChange={(checked) => handleUpdateSettings('email.notification_templates', 'order_confirmation', checked)}
                      id="order_confirmation"
                      disabled={!settings.email.enable_notifications}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="order_shipped" className="cursor-pointer flex-grow">Order Shipped</Label>
                    <Switch
                      checked={settings.email.notification_templates.order_shipped}
                      onCheckedChange={(checked) => handleUpdateSettings('email.notification_templates', 'order_shipped', checked)}
                      id="order_shipped"
                      disabled={!settings.email.enable_notifications}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="order_delivered" className="cursor-pointer flex-grow">Order Delivered</Label>
                    <Switch
                      checked={settings.email.notification_templates.order_delivered}
                      onCheckedChange={(checked) => handleUpdateSettings('email.notification_templates', 'order_delivered', checked)}
                      id="order_delivered"
                      disabled={!settings.email.enable_notifications}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="order_cancelled" className="cursor-pointer flex-grow">Order Cancelled</Label>
                    <Switch
                      checked={settings.email.notification_templates.order_cancelled}
                      onCheckedChange={(checked) => handleUpdateSettings('email.notification_templates', 'order_cancelled', checked)}
                      id="order_cancelled"
                      disabled={!settings.email.enable_notifications}
                    />
                  </div>
                </div>
              </div>
              
              <div className="rounded-md bg-blue-50 p-4 mt-6">
                <h3 className="font-medium text-sm text-blue-800 mb-2">Email Provider Configuration</h3>
                <p className="text-xs text-blue-700 mb-4">
                  To set up SendGrid or other email providers, please configure the appropriate API keys in your environment variables.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SEO Settings */}
        <TabsContent value="seo" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                <CardTitle>SEO Settings</CardTitle>
              </div>
              <CardDescription>
                Configure search engine optimization settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="meta_title">Default Meta Title</Label>
                  <Input
                    id="meta_title"
                    value={settings.seo.meta_title}
                    onChange={(e) => handleUpdateSettings('seo', 'meta_title', e.target.value)}
                    placeholder="e.g., GadgetSwap - Buy and Sell Refurbished Devices"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="meta_description">Default Meta Description</Label>
                  <Textarea
                    id="meta_description"
                    value={settings.seo.meta_description}
                    onChange={(e) => handleUpdateSettings('seo', 'meta_description', e.target.value)}
                    placeholder="Brief description of your marketplace for search engines"
                    rows={3}
                  />
                  <p className="text-xs text-gray-500">
                    Keep under 160 characters for optimal SEO performance
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="keywords">Meta Keywords</Label>
                  <Input
                    id="keywords"
                    value={settings.seo.keywords}
                    onChange={(e) => handleUpdateSettings('seo', 'keywords', e.target.value)}
                    placeholder="e.g., refurbished, smartphones, electronics, sustainable"
                  />
                  <p className="text-xs text-gray-500">
                    Comma-separated list of keywords
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 mt-6">
                <Switch
                  checked={settings.seo.enable_sitemap}
                  onCheckedChange={(checked) => handleUpdateSettings('seo', 'enable_sitemap', checked)}
                  id="enable_sitemap"
                />
                <Label htmlFor="enable_sitemap">Enable XML Sitemap</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  checked={settings.seo.enable_robots}
                  onCheckedChange={(checked) => handleUpdateSettings('seo', 'enable_robots', checked)}
                  id="enable_robots"
                />
                <Label htmlFor="enable_robots">Enable robots.txt</Label>
              </div>
              
              <div className="rounded-md bg-gray-50 p-4 mt-6">
                <h3 className="font-medium text-sm mb-2">Advanced SEO Tools</h3>
                <p className="text-xs text-gray-500 mb-4">
                  Additional SEO features like structured data and custom meta tags can be configured at the product and category level.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end mt-8">
        <Button 
          onClick={handleSaveSettings}
          disabled={updateSettingsMutation.isPending}
          size="lg"
        >
          {updateSettingsMutation.isPending ? 'Saving...' : 'Save All Changes'}
        </Button>
      </div>
    </div>
  );
};

export default AdminMarketplaceSettings;