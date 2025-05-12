import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { queryClient } from '@/lib/queryClient';
import { 
  Settings, 
  Globe, 
  Mail, 
  Phone, 
  MapPin, 
  CreditCard, 
  Share2, 
  ShieldCheck, 
  FileText, 
  Truck, 
  Image as ImageIcon,
  Save,
  AlertCircle,
  Check
} from 'lucide-react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

// Define all settings form schemas
const generalSettingsSchema = z.object({
  site_name: z.string().min(2, "Site name is required"),
  site_tagline: z.string().optional(),
  admin_email: z.string().email("Please enter a valid email"),
  contact_phone: z.string().optional(),
  contact_address: z.string().optional(),
  logo_url: z.string().optional(),
  favicon_url: z.string().optional(),
  footer_text: z.string().optional(),
  currency: z.string().min(1, "Currency is required"),
  currency_symbol: z.string().min(1, "Currency symbol is required"),
  date_format: z.string().optional(),
  time_format: z.string().optional()
});

const seoSettingsSchema = z.object({
  meta_title: z.string().optional(),
  meta_description: z.string().optional(),
  meta_keywords: z.string().optional(),
  og_title: z.string().optional(),
  og_description: z.string().optional(),
  og_image: z.string().optional(),
  google_analytics_id: z.string().optional(),
  google_tag_manager_id: z.string().optional(),
  robots_txt: z.string().optional(),
  sitemap_enabled: z.boolean().default(true),
  canonical_domain: z.string().optional()
});

const buybackSettingsSchema = z.object({
  buyback_enabled: z.boolean().default(true),
  instant_quote_enabled: z.boolean().default(true),
  min_device_age: z.string().optional(),
  max_device_age: z.string().optional(),
  inspection_period_days: z.string().optional(),
  payment_methods: z.string().optional(),
  buyback_terms: z.string().optional(),
  shipping_label_generation: z.boolean().default(false),
  quality_control_required: z.boolean().default(true),
  pricing_adjustment_percentage: z.string().optional()
});

const marketplaceSettingsSchema = z.object({
  marketplace_enabled: z.boolean().default(true),
  allow_user_listings: z.boolean().default(false),
  commission_percentage: z.string().optional(),
  featured_listing_fee: z.string().optional(),
  min_listing_price: z.string().optional(),
  max_listing_price: z.string().optional(),
  allowed_payment_methods: z.string().optional(),
  shipping_options: z.string().optional(),
  marketplace_terms: z.string().optional(),
  return_policy_days: z.string().optional()
});

const emailSettingsSchema = z.object({
  smtp_host: z.string().optional(),
  smtp_port: z.string().optional(),
  smtp_username: z.string().optional(),
  smtp_password: z.string().optional(),
  smtp_encryption: z.string().optional(),
  from_email: z.string().email("Please enter a valid email").optional(),
  from_name: z.string().optional(),
  notification_emails_enabled: z.boolean().default(true),
  customer_email_templates: z.string().optional(),
  admin_email_templates: z.string().optional()
});

type GeneralSettings = z.infer<typeof generalSettingsSchema>;
type SeoSettings = z.infer<typeof seoSettingsSchema>;
type BuybackSettings = z.infer<typeof buybackSettingsSchema>;
type MarketplaceSettings = z.infer<typeof marketplaceSettingsSchema>;
type EmailSettings = z.infer<typeof emailSettingsSchema>;

const AdminSettings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('general');
  const { toast } = useToast();

  // Query to fetch current settings
  const { data: settings, isLoading, refetch } = useQuery({
    queryKey: ['/api/settings'],
    queryFn: async () => {
      const response = await fetch('/api/settings');
      if (!response.ok) {
        throw new Error('Failed to fetch settings');
      }
      return response.json();
    }
  });

  // Update forms when settings data is loaded
  React.useEffect(() => {
    if (settings) {
      generalForm.reset(settings.general || {});
      seoForm.reset(settings.seo || {});
      buybackForm.reset(settings.buyback || {});
      marketplaceForm.reset(settings.marketplace || {});
      emailForm.reset(settings.email || {});
    }
  }, [settings]);

  // Setup all the forms
  const generalForm = useForm<GeneralSettings>({
    resolver: zodResolver(generalSettingsSchema),
    defaultValues: {
      site_name: 'GadgetSwap',
      site_tagline: 'Trade in your devices for cash or certified refurbished gadgets',
      admin_email: 'admin@gadgetswap.com',
      currency: 'USD',
      currency_symbol: '$'
    }
  });

  const seoForm = useForm<SeoSettings>({
    resolver: zodResolver(seoSettingsSchema),
    defaultValues: {
      sitemap_enabled: true,
    }
  });

  const buybackForm = useForm<BuybackSettings>({
    resolver: zodResolver(buybackSettingsSchema),
    defaultValues: {
      buyback_enabled: true,
      instant_quote_enabled: true,
      quality_control_required: true,
    }
  });

  const marketplaceForm = useForm<MarketplaceSettings>({
    resolver: zodResolver(marketplaceSettingsSchema),
    defaultValues: {
      marketplace_enabled: true,
      allow_user_listings: false,
    }
  });

  const emailForm = useForm<EmailSettings>({
    resolver: zodResolver(emailSettingsSchema),
    defaultValues: {
      notification_emails_enabled: true,
    }
  });

  // Mutations for updating settings
  const updateSettingsMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update settings');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/settings'] });
      toast({
        title: 'Settings Updated',
        description: 'Your settings have been successfully saved.',
        variant: 'default',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Form submission handlers
  const onSubmitGeneralSettings = (data: GeneralSettings) => {
    updateSettingsMutation.mutate({ category: 'general', settings: data });
  };

  const onSubmitSeoSettings = (data: SeoSettings) => {
    updateSettingsMutation.mutate({ category: 'seo', settings: data });
  };

  const onSubmitBuybackSettings = (data: BuybackSettings) => {
    updateSettingsMutation.mutate({ category: 'buyback', settings: data });
  };

  const onSubmitMarketplaceSettings = (data: MarketplaceSettings) => {
    updateSettingsMutation.mutate({ category: 'marketplace', settings: data });
  };

  const onSubmitEmailSettings = (data: EmailSettings) => {
    updateSettingsMutation.mutate({ category: 'email', settings: data });
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="flex items-center mb-6">
          <Settings className="mr-2 h-5 w-5" />
          <h1 className="text-2xl font-bold">System Settings</h1>
        </div>
        <div className="text-center py-10">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-center mb-6">
        <Settings className="mr-2 h-5 w-5" />
        <h1 className="text-2xl font-bold">System Settings</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="general" className="flex items-center">
            <Settings className="mr-2 h-4 w-4" /> General
          </TabsTrigger>
          <TabsTrigger value="seo" className="flex items-center">
            <Globe className="mr-2 h-4 w-4" /> SEO & Analytics
          </TabsTrigger>
          <TabsTrigger value="buyback" className="flex items-center">
            <CreditCard className="mr-2 h-4 w-4" /> Buyback Program
          </TabsTrigger>
          <TabsTrigger value="marketplace" className="flex items-center">
            <Share2 className="mr-2 h-4 w-4" /> Marketplace
          </TabsTrigger>
          <TabsTrigger value="email" className="flex items-center">
            <Mail className="mr-2 h-4 w-4" /> Email & Notifications
          </TabsTrigger>
        </TabsList>

        {/* General Settings Tab */}
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>
                Configure basic information about your website, including branding and contact details.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...generalForm}>
                <form onSubmit={generalForm.handleSubmit(onSubmitGeneralSettings)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <FormField
                        control={generalForm.control}
                        name="site_name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Site Name</FormLabel>
                            <FormControl>
                              <Input placeholder="GadgetSwap" {...field} />
                            </FormControl>
                            <FormDescription>
                              The name of your website.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={generalForm.control}
                        name="site_tagline"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Site Tagline</FormLabel>
                            <FormControl>
                              <Input placeholder="Trade in your devices for cash or certified refurbished gadgets" {...field} />
                            </FormControl>
                            <FormDescription>
                              A short description of your website.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={generalForm.control}
                        name="admin_email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Admin Email</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="admin@example.com" {...field} />
                            </FormControl>
                            <FormDescription>
                              Primary contact email for administration.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={generalForm.control}
                        name="contact_phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Contact Phone</FormLabel>
                            <FormControl>
                              <Input placeholder="+1 (555) 123-4567" {...field} />
                            </FormControl>
                            <FormDescription>
                              Public phone number for customer support.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={generalForm.control}
                        name="contact_address"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Business Address</FormLabel>
                            <FormControl>
                              <Textarea placeholder="123 Main St, City, State, ZIP" {...field} />
                            </FormControl>
                            <FormDescription>
                              Physical address displayed on your site.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="space-y-4">
                      <FormField
                        control={generalForm.control}
                        name="logo_url"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Logo URL</FormLabel>
                            <FormControl>
                              <Input placeholder="/assets/logo.png" {...field} />
                            </FormControl>
                            <FormDescription>
                              Path to your logo image.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={generalForm.control}
                        name="favicon_url"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Favicon URL</FormLabel>
                            <FormControl>
                              <Input placeholder="/assets/favicon.ico" {...field} />
                            </FormControl>
                            <FormDescription>
                              Path to your favicon (site icon).
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={generalForm.control}
                        name="currency"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Currency Code</FormLabel>
                            <FormControl>
                              <Input placeholder="USD" {...field} />
                            </FormControl>
                            <FormDescription>
                              Three-letter currency code (e.g., USD, EUR, GBP).
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={generalForm.control}
                        name="currency_symbol"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Currency Symbol</FormLabel>
                            <FormControl>
                              <Input placeholder="$" {...field} />
                            </FormControl>
                            <FormDescription>
                              Currency symbol displayed before prices.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={generalForm.control}
                        name="footer_text"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Footer Text</FormLabel>
                            <FormControl>
                              <Textarea placeholder="© 2025 GadgetSwap. All rights reserved." {...field} />
                            </FormControl>
                            <FormDescription>
                              Copyright notice or text displayed in the site footer.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button type="submit" disabled={updateSettingsMutation.isPending} className="flex items-center">
                      {updateSettingsMutation.isPending ? (
                        <>Saving... <Settings className="ml-2 h-4 w-4 animate-spin" /></>
                      ) : (
                        <>Save General Settings <Save className="ml-2 h-4 w-4" /></>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SEO & Analytics Tab */}
        <TabsContent value="seo">
          <Card>
            <CardHeader>
              <CardTitle>SEO & Analytics Settings</CardTitle>
              <CardDescription>
                Configure search engine optimization and analytics tracking for your website.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...seoForm}>
                <form onSubmit={seoForm.handleSubmit(onSubmitSeoSettings)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <FormField
                        control={seoForm.control}
                        name="meta_title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Default Meta Title</FormLabel>
                            <FormControl>
                              <Input placeholder="GadgetSwap - Trade, Buy, and Sell Devices" {...field} />
                            </FormControl>
                            <FormDescription>
                              Default title tag used for SEO (can be overridden per page).
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={seoForm.control}
                        name="meta_description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Default Meta Description</FormLabel>
                            <FormControl>
                              <Textarea placeholder="GadgetSwap offers competitive rates for device trade-ins and certified refurbished gadgets with free shipping and warranty." {...field} />
                            </FormControl>
                            <FormDescription>
                              Default meta description used for SEO (can be overridden per page).
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={seoForm.control}
                        name="meta_keywords"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Meta Keywords</FormLabel>
                            <FormControl>
                              <Input placeholder="buyback, trade-in, refurbished, electronics, gadgets" {...field} />
                            </FormControl>
                            <FormDescription>
                              Comma-separated keywords (less important for modern SEO).
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={seoForm.control}
                        name="canonical_domain"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Canonical Domain</FormLabel>
                            <FormControl>
                              <Input placeholder="https://www.gadgetswap.com" {...field} />
                            </FormControl>
                            <FormDescription>
                              Primary domain for canonical URLs.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={seoForm.control}
                        name="robots_txt"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Robots.txt Content</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="User-agent: *
Allow: /
Disallow: /admin/" 
                                {...field} 
                                rows={5}
                              />
                            </FormControl>
                            <FormDescription>
                              Content for your robots.txt file.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="space-y-4">
                      <FormField
                        control={seoForm.control}
                        name="og_title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Default Open Graph Title</FormLabel>
                            <FormControl>
                              <Input placeholder="GadgetSwap - Smart Device Trading" {...field} />
                            </FormControl>
                            <FormDescription>
                              Title used when sharing on social media.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={seoForm.control}
                        name="og_description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Default Open Graph Description</FormLabel>
                            <FormControl>
                              <Textarea placeholder="Get the best value for your used devices or shop our certified pre-owned collection." {...field} />
                            </FormControl>
                            <FormDescription>
                              Description used when sharing on social media.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={seoForm.control}
                        name="og_image"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Default Open Graph Image</FormLabel>
                            <FormControl>
                              <Input placeholder="/assets/social-share.png" {...field} />
                            </FormControl>
                            <FormDescription>
                              Image used when sharing on social media (recommended size: 1200x630px).
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={seoForm.control}
                        name="google_analytics_id"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Google Analytics ID</FormLabel>
                            <FormControl>
                              <Input placeholder="G-XXXXXXXXXX or UA-XXXXXXXX-X" {...field} />
                            </FormControl>
                            <FormDescription>
                              Google Analytics measurement ID.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={seoForm.control}
                        name="google_tag_manager_id"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Google Tag Manager ID</FormLabel>
                            <FormControl>
                              <Input placeholder="GTM-XXXXXXX" {...field} />
                            </FormControl>
                            <FormDescription>
                              Google Tag Manager container ID.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={seoForm.control}
                        name="sitemap_enabled"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel>Generate Sitemap</FormLabel>
                              <FormDescription>
                                Automatically generate and update sitemap.xml
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button type="submit" disabled={updateSettingsMutation.isPending} className="flex items-center">
                      {updateSettingsMutation.isPending ? (
                        <>Saving... <Settings className="ml-2 h-4 w-4 animate-spin" /></>
                      ) : (
                        <>Save SEO Settings <Save className="ml-2 h-4 w-4" /></>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Buyback Program Tab */}
        <TabsContent value="buyback">
          <Card>
            <CardHeader>
              <CardTitle>Buyback Program Settings</CardTitle>
              <CardDescription>
                Configure settings for your device buyback and trade-in program.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...buybackForm}>
                <form onSubmit={buybackForm.handleSubmit(onSubmitBuybackSettings)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <FormField
                        control={buybackForm.control}
                        name="buyback_enabled"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel>Enable Buyback Program</FormLabel>
                              <FormDescription>
                                Allow customers to request device buybacks and trade-ins
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={buybackForm.control}
                        name="instant_quote_enabled"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel>Instant Quote System</FormLabel>
                              <FormDescription>
                                Provide immediate pricing estimates to customers
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={buybackForm.control}
                        name="min_device_age"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Minimum Device Age (months)</FormLabel>
                            <FormControl>
                              <Input type="number" placeholder="0" {...field} />
                            </FormControl>
                            <FormDescription>
                              Minimum age for eligible devices (0 for no minimum).
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={buybackForm.control}
                        name="max_device_age"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Maximum Device Age (months)</FormLabel>
                            <FormControl>
                              <Input type="number" placeholder="60" {...field} />
                            </FormControl>
                            <FormDescription>
                              Maximum age for eligible devices (leave empty for no limit).
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={buybackForm.control}
                        name="inspection_period_days"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Inspection Period (days)</FormLabel>
                            <FormControl>
                              <Input type="number" placeholder="3" {...field} />
                            </FormControl>
                            <FormDescription>
                              Number of days to inspect devices before payment.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="space-y-4">
                      <FormField
                        control={buybackForm.control}
                        name="payment_methods"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Payment Methods</FormLabel>
                            <FormControl>
                              <Textarea placeholder="Bank Transfer, PayPal, Store Credit" {...field} />
                            </FormControl>
                            <FormDescription>
                              Comma-separated list of available payment methods.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={buybackForm.control}
                        name="pricing_adjustment_percentage"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Pricing Adjustment (%)</FormLabel>
                            <FormControl>
                              <Input type="number" placeholder="0" {...field} />
                            </FormControl>
                            <FormDescription>
                              Global adjustment to all buyback quotes (can be negative).
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={buybackForm.control}
                        name="shipping_label_generation"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel>Generate Shipping Labels</FormLabel>
                              <FormDescription>
                                Auto-generate prepaid shipping labels for customers
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={buybackForm.control}
                        name="quality_control_required"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel>Require Quality Control</FormLabel>
                              <FormDescription>
                                Mandate device inspection before payment
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={buybackForm.control}
                        name="buyback_terms"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Buyback Terms & Conditions</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Terms and conditions for the buyback program." 
                                {...field} 
                                rows={5}
                              />
                            </FormControl>
                            <FormDescription>
                              Legal terms that customers must accept.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button type="submit" disabled={updateSettingsMutation.isPending} className="flex items-center">
                      {updateSettingsMutation.isPending ? (
                        <>Saving... <Settings className="ml-2 h-4 w-4 animate-spin" /></>
                      ) : (
                        <>Save Buyback Settings <Save className="ml-2 h-4 w-4" /></>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Marketplace Tab */}
        <TabsContent value="marketplace">
          <Card>
            <CardHeader>
              <CardTitle>Marketplace Settings</CardTitle>
              <CardDescription>
                Configure settings for your refurbished device marketplace.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...marketplaceForm}>
                <form onSubmit={marketplaceForm.handleSubmit(onSubmitMarketplaceSettings)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <FormField
                        control={marketplaceForm.control}
                        name="marketplace_enabled"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel>Enable Marketplace</FormLabel>
                              <FormDescription>
                                Allow customers to purchase refurbished devices
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={marketplaceForm.control}
                        name="allow_user_listings"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel>Allow User Listings</FormLabel>
                              <FormDescription>
                                Let users create their own marketplace listings
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={marketplaceForm.control}
                        name="commission_percentage"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Commission Percentage (%)</FormLabel>
                            <FormControl>
                              <Input type="number" placeholder="10" {...field} />
                            </FormControl>
                            <FormDescription>
                              Commission charged on user listings (0 for none).
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={marketplaceForm.control}
                        name="featured_listing_fee"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Featured Listing Fee</FormLabel>
                            <FormControl>
                              <Input type="number" placeholder="5" {...field} />
                            </FormControl>
                            <FormDescription>
                              Fee to promote a listing to featured status (0 for free).
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={marketplaceForm.control}
                        name="min_listing_price"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Minimum Listing Price</FormLabel>
                            <FormControl>
                              <Input type="number" placeholder="10" {...field} />
                            </FormControl>
                            <FormDescription>
                              Minimum price allowed for marketplace listings.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="space-y-4">
                      <FormField
                        control={marketplaceForm.control}
                        name="max_listing_price"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Maximum Listing Price</FormLabel>
                            <FormControl>
                              <Input type="number" placeholder="10000" {...field} />
                            </FormControl>
                            <FormDescription>
                              Maximum price allowed for marketplace listings (0 for no limit).
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={marketplaceForm.control}
                        name="allowed_payment_methods"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Allowed Payment Methods</FormLabel>
                            <FormControl>
                              <Textarea placeholder="Credit Card, PayPal, Apple Pay, Google Pay" {...field} />
                            </FormControl>
                            <FormDescription>
                              Comma-separated list of accepted payment methods.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={marketplaceForm.control}
                        name="shipping_options"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Shipping Options</FormLabel>
                            <FormControl>
                              <Textarea placeholder="Standard (3-5 days), Express (1-2 days)" {...field} />
                            </FormControl>
                            <FormDescription>
                              Comma-separated list of shipping options.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={marketplaceForm.control}
                        name="return_policy_days"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Return Period (days)</FormLabel>
                            <FormControl>
                              <Input type="number" placeholder="30" {...field} />
                            </FormControl>
                            <FormDescription>
                              Number of days customers can return purchases.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={marketplaceForm.control}
                        name="marketplace_terms"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Marketplace Terms & Conditions</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Terms and conditions for the marketplace." 
                                {...field} 
                                rows={5}
                              />
                            </FormControl>
                            <FormDescription>
                              Legal terms that customers must accept.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button type="submit" disabled={updateSettingsMutation.isPending} className="flex items-center">
                      {updateSettingsMutation.isPending ? (
                        <>Saving... <Settings className="ml-2 h-4 w-4 animate-spin" /></>
                      ) : (
                        <>Save Marketplace Settings <Save className="ml-2 h-4 w-4" /></>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Email Tab */}
        <TabsContent value="email">
          <Card>
            <CardHeader>
              <CardTitle>Email & Notification Settings</CardTitle>
              <CardDescription>
                Configure email server and notification preferences.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...emailForm}>
                <form onSubmit={emailForm.handleSubmit(onSubmitEmailSettings)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <FormField
                        control={emailForm.control}
                        name="smtp_host"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>SMTP Host</FormLabel>
                            <FormControl>
                              <Input placeholder="smtp.example.com" {...field} />
                            </FormControl>
                            <FormDescription>
                              Mail server hostname.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={emailForm.control}
                        name="smtp_port"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>SMTP Port</FormLabel>
                            <FormControl>
                              <Input placeholder="587" {...field} />
                            </FormControl>
                            <FormDescription>
                              Mail server port (typically 587 for TLS, 465 for SSL).
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={emailForm.control}
                        name="smtp_username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>SMTP Username</FormLabel>
                            <FormControl>
                              <Input placeholder="noreply@example.com" {...field} />
                            </FormControl>
                            <FormDescription>
                              Username for mail server authentication.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={emailForm.control}
                        name="smtp_password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>SMTP Password</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="•••••••••••••" {...field} />
                            </FormControl>
                            <FormDescription>
                              Password for mail server authentication.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={emailForm.control}
                        name="smtp_encryption"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>SMTP Encryption</FormLabel>
                            <FormControl>
                              <Input placeholder="tls" {...field} />
                            </FormControl>
                            <FormDescription>
                              Encryption type (tls, ssl, or none).
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="space-y-4">
                      <FormField
                        control={emailForm.control}
                        name="from_email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>From Email Address</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="noreply@gadgetswap.com" {...field} />
                            </FormControl>
                            <FormDescription>
                              Email address used as sender for all emails.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={emailForm.control}
                        name="from_name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>From Name</FormLabel>
                            <FormControl>
                              <Input placeholder="GadgetSwap Support" {...field} />
                            </FormControl>
                            <FormDescription>
                              Name displayed as sender for all emails.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={emailForm.control}
                        name="notification_emails_enabled"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel>Enable Email Notifications</FormLabel>
                              <FormDescription>
                                Send automated email notifications for events
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={emailForm.control}
                        name="customer_email_templates"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Customer Email Templates</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="order_confirmation, buyback_request, shipping_notification" 
                                {...field} 
                                rows={3}
                              />
                            </FormControl>
                            <FormDescription>
                              Comma-separated list of email templates for customers.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={emailForm.control}
                        name="admin_email_templates"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Admin Email Templates</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="new_order, new_buyback_request, inventory_alert" 
                                {...field} 
                                rows={3}
                              />
                            </FormControl>
                            <FormDescription>
                              Comma-separated list of email templates for admins.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button type="submit" disabled={updateSettingsMutation.isPending} className="flex items-center">
                      {updateSettingsMutation.isPending ? (
                        <>Saving... <Settings className="ml-2 h-4 w-4 animate-spin" /></>
                      ) : (
                        <>Save Email Settings <Save className="ml-2 h-4 w-4" /></>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminSettings;