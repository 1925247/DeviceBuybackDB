import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Save, Settings, ShoppingBag, Truck, CreditCard, Globe, DollarSign, Percent } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

// Define the marketplace settings schema
const marketplaceSettingsSchema = z.object({
  general: z.object({
    enable_marketplace: z.boolean().default(true),
    marketplace_name: z.string().min(1, 'Marketplace name is required'),
    marketplace_tagline: z.string().optional(),
    featured_products_count: z.coerce.number().min(0).default(8),
    contact_email: z.string().email('Invalid email address').optional(),
    support_phone: z.string().optional(),
    enable_reviews: z.boolean().default(true),
    reviews_require_approval: z.boolean().default(true),
    default_currency: z.string().default('USD'),
    currency_symbol: z.string().default('$'),
  }),
  products: z.object({
    product_pricing_strategy: z.enum(['cost_plus_margin', 'market_based', 'dynamic']),
    default_profit_margin: z.coerce.number().min(0).default(20),
    show_stock_quantity: z.boolean().default(true),
    low_stock_threshold: z.coerce.number().min(0).default(5),
    out_of_stock_behavior: z.enum(['hide', 'show_unavailable', 'allow_backorder']),
    enable_product_comparisons: z.boolean().default(true),
    enable_product_ratings: z.boolean().default(true),
    display_recently_viewed: z.boolean().default(true),
  }),
  shipping: z.object({
    default_shipping_country: z.string().default('US'),
    free_shipping_min_order: z.coerce.number().min(0).default(50),
    enable_local_pickup: z.boolean().default(false),
    enable_flat_rate_shipping: z.boolean().default(true),
    flat_rate_shipping_cost: z.coerce.number().min(0).default(5.99),
    enable_international_shipping: z.boolean().default(true),
    international_shipping_markup: z.coerce.number().min(0).default(15),
    shipping_calculation_method: z.enum(['flat_rate', 'weight_based', 'price_based', 'item_based']),
    display_estimated_delivery: z.boolean().default(true),
  }),
  payments: z.object({
    accepted_payment_methods: z.array(z.string()).default(['credit_card', 'paypal']),
    enable_stripe: z.boolean().default(true),
    enable_paypal: z.boolean().default(false),
    enable_apple_pay: z.boolean().default(false),
    enable_google_pay: z.boolean().default(false),
    enable_crypto: z.boolean().default(false),
    enable_store_credit: z.boolean().default(true),
    payment_capture_method: z.enum(['automatic', 'manual']).default('automatic'),
    order_minimum_amount: z.coerce.number().min(0).default(0),
  }),
  taxes: z.object({
    enable_automatic_tax_calculation: z.boolean().default(true),
    default_tax_rate: z.coerce.number().min(0).default(8.25),
    tax_calculation_method: z.enum(['origin_based', 'destination_based']).default('destination_based'),
    prices_include_tax: z.boolean().default(false),
    tax_rounding_method: z.enum(['item', 'line', 'total']).default('item'),
    display_prices_with_tax: z.boolean().default(false),
  }),
  checkout: z.object({
    require_account_to_checkout: z.boolean().default(false),
    enable_guest_checkout: z.boolean().default(true),
    enable_coupon_codes: z.boolean().default(true),
    enable_gift_wrapping: z.boolean().default(false),
    gift_wrapping_fee: z.coerce.number().min(0).default(5),
    enable_order_comments: z.boolean().default(true),
    terms_and_conditions_required: z.boolean().default(true),
    enable_one_page_checkout: z.boolean().default(true),
    send_order_confirmation_email: z.boolean().default(true),
  }),
  inventory: z.object({
    enable_inventory_tracking: z.boolean().default(true),
    prevent_overselling: z.boolean().default(true),
    enable_low_stock_notifications: z.boolean().default(true),
    low_stock_notification_threshold: z.coerce.number().min(0).default(5),
    enable_out_of_stock_notifications: z.boolean().default(true),
    auto_restore_stock_on_cancel: z.boolean().default(true),
    auto_reduce_stock_on_order: z.boolean().default(true),
  }),
  buyback: z.object({
    min_buyback_amount: z.coerce.number().min(0).default(5),
    max_processing_days: z.coerce.number().min(1).default(3),
    payment_methods: z.array(z.string()).default(['paypal', 'bank_transfer', 'store_credit']),
    enable_expedited_processing: z.boolean().default(false),
    expedited_processing_fee: z.coerce.number().min(0).default(15),
    show_buyback_estimator: z.boolean().default(true),
    require_condition_assessment: z.boolean().default(true),
    require_photos: z.boolean().default(true),
  }),
});

type MarketplaceSettingsValues = z.infer<typeof marketplaceSettingsSchema>;

const AdminMarketplaceSettings = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch settings
  const { data: settings, isLoading } = useQuery({
    queryKey: ['/api/settings'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/settings');
      if (!response.ok) {
        throw new Error('Failed to fetch marketplace settings');
      }
      return response.json();
    }
  });

  // Update settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: async (newSettings: MarketplaceSettingsValues) => {
      const response = await apiRequest('PUT', '/api/settings', newSettings);
      if (!response.ok) {
        throw new Error('Failed to update marketplace settings');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Settings updated',
        description: 'Marketplace settings have been updated successfully.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/settings'] });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  // Form setup with default values
  const form = useForm<MarketplaceSettingsValues>({
    resolver: zodResolver(marketplaceSettingsSchema),
    defaultValues: {
      general: {
        enable_marketplace: true,
        marketplace_name: 'GadgetSwap Marketplace',
        marketplace_tagline: 'Your Trusted Source for Refurbished Gadgets',
        featured_products_count: 8,
        contact_email: 'info@gadgetswap.com',
        support_phone: '+1 (555) 123-4567',
        enable_reviews: true,
        reviews_require_approval: true,
        default_currency: 'USD',
        currency_symbol: '$',
      },
      products: {
        product_pricing_strategy: 'cost_plus_margin',
        default_profit_margin: 20,
        show_stock_quantity: true,
        low_stock_threshold: 5,
        out_of_stock_behavior: 'show_unavailable',
        enable_product_comparisons: true,
        enable_product_ratings: true,
        display_recently_viewed: true,
      },
      shipping: {
        default_shipping_country: 'US',
        free_shipping_min_order: 50,
        enable_local_pickup: false,
        enable_flat_rate_shipping: true,
        flat_rate_shipping_cost: 5.99,
        enable_international_shipping: true,
        international_shipping_markup: 15,
        shipping_calculation_method: 'flat_rate',
        display_estimated_delivery: true,
      },
      payments: {
        accepted_payment_methods: ['credit_card', 'paypal'],
        enable_stripe: true,
        enable_paypal: false,
        enable_apple_pay: false,
        enable_google_pay: false,
        enable_crypto: false,
        enable_store_credit: true,
        payment_capture_method: 'automatic',
        order_minimum_amount: 0,
      },
      taxes: {
        enable_automatic_tax_calculation: true,
        default_tax_rate: 8.25,
        tax_calculation_method: 'destination_based',
        prices_include_tax: false,
        tax_rounding_method: 'item',
        display_prices_with_tax: false,
      },
      checkout: {
        require_account_to_checkout: false,
        enable_guest_checkout: true,
        enable_coupon_codes: true,
        enable_gift_wrapping: false,
        gift_wrapping_fee: 5,
        enable_order_comments: true,
        terms_and_conditions_required: true,
        enable_one_page_checkout: true,
        send_order_confirmation_email: true,
      },
      inventory: {
        enable_inventory_tracking: true,
        prevent_overselling: true,
        enable_low_stock_notifications: true,
        low_stock_notification_threshold: 5,
        enable_out_of_stock_notifications: true,
        auto_restore_stock_on_cancel: true,
        auto_reduce_stock_on_order: true,
      },
      buyback: {
        min_buyback_amount: 5,
        max_processing_days: 3,
        payment_methods: ['paypal', 'bank_transfer', 'store_credit'],
        enable_expedited_processing: false,
        expedited_processing_fee: 15,
        show_buyback_estimator: true,
        require_condition_assessment: true,
        require_photos: true,
      }
    }
  });

  // Set form values when settings data is loaded
  React.useEffect(() => {
    if (settings && !isLoading) {
      form.reset({
        general: {
          enable_marketplace: settings.marketplace?.enable_marketplace ?? true,
          marketplace_name: settings.general?.site_name ?? 'GadgetSwap Marketplace',
          marketplace_tagline: settings.general?.site_tagline ?? 'Your Trusted Source for Refurbished Gadgets',
          featured_products_count: settings.marketplace?.featured_products_count ?? 8,
          contact_email: settings.general?.contact_email ?? 'info@gadgetswap.com',
          support_phone: settings.general?.support_phone ?? '+1 (555) 123-4567',
          enable_reviews: settings.marketplace?.enable_reviews ?? true,
          reviews_require_approval: settings.marketplace?.reviews_require_approval ?? true,
          default_currency: settings.marketplace?.default_currency ?? 'USD',
          currency_symbol: settings.marketplace?.currency_symbol ?? '$',
        },
        products: {
          product_pricing_strategy: settings.marketplace?.product_pricing_strategy ?? 'cost_plus_margin',
          default_profit_margin: settings.marketplace?.default_profit_margin ?? 20,
          show_stock_quantity: settings.marketplace?.show_stock_quantity ?? true,
          low_stock_threshold: settings.marketplace?.low_stock_threshold ?? 5,
          out_of_stock_behavior: settings.marketplace?.out_of_stock_behavior ?? 'show_unavailable',
          enable_product_comparisons: settings.marketplace?.enable_product_comparisons ?? true,
          enable_product_ratings: settings.marketplace?.enable_product_ratings ?? true,
          display_recently_viewed: settings.marketplace?.display_recently_viewed ?? true,
        },
        shipping: {
          default_shipping_country: settings.shipping?.default_shipping_country ?? 'US',
          free_shipping_min_order: settings.shipping?.free_shipping_min_order ?? 50,
          enable_local_pickup: settings.shipping?.enable_local_pickup ?? false,
          enable_flat_rate_shipping: settings.shipping?.enable_flat_rate_shipping ?? true,
          flat_rate_shipping_cost: settings.shipping?.flat_rate_shipping_cost ?? 5.99,
          enable_international_shipping: settings.shipping?.enable_international_shipping ?? true,
          international_shipping_markup: settings.shipping?.international_shipping_markup ?? 15,
          shipping_calculation_method: settings.shipping?.shipping_calculation_method ?? 'flat_rate',
          display_estimated_delivery: settings.shipping?.display_estimated_delivery ?? true,
        },
        payments: {
          accepted_payment_methods: settings.payments?.accepted_payment_methods ?? ['credit_card', 'paypal'],
          enable_stripe: settings.payments?.enable_stripe ?? true,
          enable_paypal: settings.payments?.enable_paypal ?? false,
          enable_apple_pay: settings.payments?.enable_apple_pay ?? false,
          enable_google_pay: settings.payments?.enable_google_pay ?? false,
          enable_crypto: settings.payments?.enable_crypto ?? false,
          enable_store_credit: settings.payments?.enable_store_credit ?? true,
          payment_capture_method: settings.payments?.payment_capture_method ?? 'automatic',
          order_minimum_amount: settings.payments?.order_minimum_amount ?? 0,
        },
        taxes: {
          enable_automatic_tax_calculation: settings.taxes?.enable_automatic_tax_calculation ?? true,
          default_tax_rate: settings.taxes?.default_tax_rate ?? 8.25,
          tax_calculation_method: settings.taxes?.tax_calculation_method ?? 'destination_based',
          prices_include_tax: settings.taxes?.prices_include_tax ?? false,
          tax_rounding_method: settings.taxes?.tax_rounding_method ?? 'item',
          display_prices_with_tax: settings.taxes?.display_prices_with_tax ?? false,
        },
        checkout: {
          require_account_to_checkout: settings.checkout?.require_account_to_checkout ?? false,
          enable_guest_checkout: settings.checkout?.enable_guest_checkout ?? true,
          enable_coupon_codes: settings.checkout?.enable_coupon_codes ?? true,
          enable_gift_wrapping: settings.checkout?.enable_gift_wrapping ?? false,
          gift_wrapping_fee: settings.checkout?.gift_wrapping_fee ?? 5,
          enable_order_comments: settings.checkout?.enable_order_comments ?? true,
          terms_and_conditions_required: settings.checkout?.terms_and_conditions_required ?? true,
          enable_one_page_checkout: settings.checkout?.enable_one_page_checkout ?? true,
          send_order_confirmation_email: settings.checkout?.send_order_confirmation_email ?? true,
        },
        inventory: {
          enable_inventory_tracking: settings.inventory?.enable_inventory_tracking ?? true,
          prevent_overselling: settings.inventory?.prevent_overselling ?? true,
          enable_low_stock_notifications: settings.inventory?.enable_low_stock_notifications ?? true,
          low_stock_notification_threshold: settings.inventory?.low_stock_notification_threshold ?? 5,
          enable_out_of_stock_notifications: settings.inventory?.enable_out_of_stock_notifications ?? true,
          auto_restore_stock_on_cancel: settings.inventory?.auto_restore_stock_on_cancel ?? true,
          auto_reduce_stock_on_order: settings.inventory?.auto_reduce_stock_on_order ?? true,
        },
        buyback: {
          min_buyback_amount: settings.buyback?.min_offer_amount ?? 5,
          max_processing_days: settings.buyback?.max_processing_days ?? 3,
          payment_methods: settings.buyback?.payment_methods ?? ['paypal', 'bank_transfer', 'store_credit'],
          enable_expedited_processing: settings.buyback?.enable_expedited_processing ?? false,
          expedited_processing_fee: settings.buyback?.expedited_processing_fee ?? 15,
          show_buyback_estimator: settings.buyback?.show_buyback_estimator ?? true,
          require_condition_assessment: settings.buyback?.require_condition_assessment ?? true,
          require_photos: settings.buyback?.require_photos ?? true,
        }
      });
    }
  }, [settings, isLoading, form]);

  // Handle form submission
  const onSubmit = (values: MarketplaceSettingsValues) => {
    updateSettingsMutation.mutate(values);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">E-Commerce Settings</h1>
          <p className="text-gray-500">Configure your marketplace and buyback program</p>
        </div>
        <Button 
          onClick={form.handleSubmit(onSubmit)} 
          disabled={updateSettingsMutation.isPending}
        >
          {updateSettingsMutation.isPending && (
            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-t-transparent" />
          )}
          <Save className="mr-2 h-4 w-4" /> Save Changes
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
        </div>
      ) : (
        <Form {...form}>
          <form className="space-y-6">
            <Tabs defaultValue="general" className="w-full">
              <div className="mb-8">
                <TabsList className="grid grid-cols-4 md:grid-cols-8 w-full">
                  <TabsTrigger value="general">
                    <Settings className="h-4 w-4 mr-2" /> General
                  </TabsTrigger>
                  <TabsTrigger value="products">
                    <ShoppingBag className="h-4 w-4 mr-2" /> Products
                  </TabsTrigger>
                  <TabsTrigger value="shipping">
                    <Truck className="h-4 w-4 mr-2" /> Shipping
                  </TabsTrigger>
                  <TabsTrigger value="payments">
                    <CreditCard className="h-4 w-4 mr-2" /> Payments
                  </TabsTrigger>
                  <TabsTrigger value="taxes">
                    <DollarSign className="h-4 w-4 mr-2" /> Taxes
                  </TabsTrigger>
                  <TabsTrigger value="checkout">
                    <ShoppingBag className="h-4 w-4 mr-2" /> Checkout
                  </TabsTrigger>
                  <TabsTrigger value="inventory">
                    <Globe className="h-4 w-4 mr-2" /> Inventory
                  </TabsTrigger>
                  <TabsTrigger value="buyback">
                    <Percent className="h-4 w-4 mr-2" /> Buyback
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* General Settings */}
              <TabsContent value="general">
                <Card>
                  <CardHeader>
                    <CardTitle>General Marketplace Settings</CardTitle>
                    <CardDescription>
                      Configure the basic settings for your e-commerce storefront
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <FormField
                      control={form.control}
                      name="general.enable_marketplace"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Enable Marketplace</FormLabel>
                            <FormDescription>
                              When disabled, the marketplace will not be visible to users.
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

                    <div className="grid gap-4 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="general.marketplace_name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Marketplace Name</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="general.marketplace_tagline"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Marketplace Tagline</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="general.contact_email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Contact Email</FormLabel>
                            <FormControl>
                              <Input {...field} type="email" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="general.support_phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Support Phone</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="general.default_currency"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Default Currency</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select currency" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="USD">US Dollar (USD)</SelectItem>
                                <SelectItem value="EUR">Euro (EUR)</SelectItem>
                                <SelectItem value="GBP">British Pound (GBP)</SelectItem>
                                <SelectItem value="CAD">Canadian Dollar (CAD)</SelectItem>
                                <SelectItem value="AUD">Australian Dollar (AUD)</SelectItem>
                                <SelectItem value="JPY">Japanese Yen (JPY)</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="general.currency_symbol"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Currency Symbol</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="general.featured_products_count"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Featured Products Count</FormLabel>
                          <FormControl>
                            <Input {...field} type="number" />
                          </FormControl>
                          <FormDescription>
                            Number of featured products to display on the homepage.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid gap-4 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="general.enable_reviews"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Enable Reviews</FormLabel>
                              <FormDescription>
                                Allow customers to leave reviews for products.
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
                        control={form.control}
                        name="general.reviews_require_approval"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Reviews Require Approval</FormLabel>
                              <FormDescription>
                                Reviews must be approved before being published.
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                disabled={!form.getValues().general.enable_reviews}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Products Settings */}
              <TabsContent value="products">
                <Card>
                  <CardHeader>
                    <CardTitle>Product Settings</CardTitle>
                    <CardDescription>
                      Configure how products are displayed and managed
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <FormField
                      control={form.control}
                      name="products.product_pricing_strategy"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Pricing Strategy</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select pricing strategy" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="cost_plus_margin">Cost Plus Margin</SelectItem>
                              <SelectItem value="market_based">Market Based</SelectItem>
                              <SelectItem value="dynamic">Dynamic Pricing</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            How product prices are calculated by default.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="products.default_profit_margin"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Default Profit Margin (%)</FormLabel>
                          <FormControl>
                            <Input {...field} type="number" disabled={form.getValues().products.product_pricing_strategy !== 'cost_plus_margin'} />
                          </FormControl>
                          <FormDescription>
                            Default profit margin percentage for cost-plus pricing.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid gap-4 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="products.show_stock_quantity"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Show Stock Quantity</FormLabel>
                              <FormDescription>
                                Display available quantity on product pages.
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
                        control={form.control}
                        name="products.low_stock_threshold"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Low Stock Threshold</FormLabel>
                            <FormControl>
                              <Input {...field} type="number" />
                            </FormControl>
                            <FormDescription>
                              When stock reaches this level, display "Low Stock" warning.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="products.out_of_stock_behavior"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Out of Stock Behavior</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select behavior" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="hide">Hide product</SelectItem>
                              <SelectItem value="show_unavailable">Show as unavailable</SelectItem>
                              <SelectItem value="allow_backorder">Allow backorders</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            How to handle products when they're out of stock.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid gap-4 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="products.enable_product_comparisons"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Enable Product Comparisons</FormLabel>
                              <FormDescription>
                                Allow users to compare multiple products.
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
                        control={form.control}
                        name="products.enable_product_ratings"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Enable Product Ratings</FormLabel>
                              <FormDescription>
                                Display star ratings for products.
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

                    <FormField
                      control={form.control}
                      name="products.display_recently_viewed"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Display Recently Viewed Products</FormLabel>
                            <FormDescription>
                              Show recently viewed products to customers.
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
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Shipping Settings */}
              <TabsContent value="shipping">
                <Card>
                  <CardHeader>
                    <CardTitle>Shipping Settings</CardTitle>
                    <CardDescription>
                      Configure shipping options and rates
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <FormField
                      control={form.control}
                      name="shipping.default_shipping_country"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Default Shipping Country</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select country" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="US">United States</SelectItem>
                              <SelectItem value="CA">Canada</SelectItem>
                              <SelectItem value="UK">United Kingdom</SelectItem>
                              <SelectItem value="AU">Australia</SelectItem>
                              <SelectItem value="DE">Germany</SelectItem>
                              <SelectItem value="FR">France</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="shipping.shipping_calculation_method"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Shipping Calculation Method</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select method" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="flat_rate">Flat Rate</SelectItem>
                              <SelectItem value="weight_based">Weight Based</SelectItem>
                              <SelectItem value="price_based">Price Based</SelectItem>
                              <SelectItem value="item_based">Item Based</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            How shipping costs are calculated.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid gap-4 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="shipping.free_shipping_min_order"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Free Shipping Minimum Order</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">$</span>
                                <Input {...field} type="number" step="0.01" className="pl-8" />
                              </div>
                            </FormControl>
                            <FormDescription>
                              Minimum order amount for free shipping. Set to 0 to disable.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="shipping.flat_rate_shipping_cost"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Flat Rate Shipping Cost</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">$</span>
                                <Input {...field} type="number" step="0.01" className="pl-8" disabled={form.getValues().shipping.shipping_calculation_method !== 'flat_rate'} />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="shipping.enable_local_pickup"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Enable Local Pickup</FormLabel>
                              <FormDescription>
                                Allow customers to pick up orders locally.
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
                        control={form.control}
                        name="shipping.enable_flat_rate_shipping"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Enable Flat Rate Shipping</FormLabel>
                              <FormDescription>
                                Offer fixed-price shipping regardless of order size.
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

                    <div className="grid gap-4 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="shipping.enable_international_shipping"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Enable International Shipping</FormLabel>
                              <FormDescription>
                                Allow shipping to international destinations.
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
                        control={form.control}
                        name="shipping.international_shipping_markup"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>International Shipping Markup (%)</FormLabel>
                            <FormControl>
                              <Input {...field} type="number" disabled={!form.getValues().shipping.enable_international_shipping} />
                            </FormControl>
                            <FormDescription>
                              Additional percentage added to international shipping rates.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="shipping.display_estimated_delivery"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Display Estimated Delivery</FormLabel>
                            <FormDescription>
                              Show estimated delivery dates on product and checkout pages.
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
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Payment Settings */}
              <TabsContent value="payments">
                <Card>
                  <CardHeader>
                    <CardTitle>Payment Settings</CardTitle>
                    <CardDescription>
                      Configure payment methods and processing options
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <FormField
                      control={form.control}
                      name="payments.accepted_payment_methods"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Accepted Payment Methods</FormLabel>
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <Checkbox 
                                id="credit_card" 
                                checked={field.value.includes('credit_card')}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    field.onChange([...field.value, 'credit_card']);
                                  } else {
                                    field.onChange(field.value.filter(method => method !== 'credit_card'));
                                  }
                                }}
                              />
                              <Label htmlFor="credit_card">Credit Card</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox 
                                id="paypal" 
                                checked={field.value.includes('paypal')}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    field.onChange([...field.value, 'paypal']);
                                  } else {
                                    field.onChange(field.value.filter(method => method !== 'paypal'));
                                  }
                                }}
                              />
                              <Label htmlFor="paypal">PayPal</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox 
                                id="bank_transfer" 
                                checked={field.value.includes('bank_transfer')}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    field.onChange([...field.value, 'bank_transfer']);
                                  } else {
                                    field.onChange(field.value.filter(method => method !== 'bank_transfer'));
                                  }
                                }}
                              />
                              <Label htmlFor="bank_transfer">Bank Transfer</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox 
                                id="store_credit" 
                                checked={field.value.includes('store_credit')}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    field.onChange([...field.value, 'store_credit']);
                                  } else {
                                    field.onChange(field.value.filter(method => method !== 'store_credit'));
                                  }
                                }}
                              />
                              <Label htmlFor="store_credit">Store Credit</Label>
                            </div>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Separator />

                    <div className="grid gap-4 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="payments.enable_stripe"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Enable Stripe</FormLabel>
                              <FormDescription>
                                Process payments through Stripe.
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
                        control={form.control}
                        name="payments.enable_paypal"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Enable PayPal</FormLabel>
                              <FormDescription>
                                Process payments through PayPal.
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

                    <div className="grid gap-4 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="payments.enable_apple_pay"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Enable Apple Pay</FormLabel>
                              <FormDescription>
                                Allow payments via Apple Pay.
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
                        control={form.control}
                        name="payments.enable_google_pay"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Enable Google Pay</FormLabel>
                              <FormDescription>
                                Allow payments via Google Pay.
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

                    <div className="grid gap-4 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="payments.enable_crypto"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Enable Cryptocurrency</FormLabel>
                              <FormDescription>
                                Accept payments in cryptocurrency.
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
                        control={form.control}
                        name="payments.enable_store_credit"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Enable Store Credit</FormLabel>
                              <FormDescription>
                                Allow payments using store credit.
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

                    <FormField
                      control={form.control}
                      name="payments.payment_capture_method"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Payment Capture Method</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select method" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="automatic">Automatic Capture</SelectItem>
                              <SelectItem value="manual">Manual Capture</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            When to capture payment after authorization.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="payments.order_minimum_amount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Minimum Order Amount</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">$</span>
                              <Input {...field} type="number" step="0.01" className="pl-8" />
                            </div>
                          </FormControl>
                          <FormDescription>
                            Minimum amount required to place an order. Set to 0 for no minimum.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Other tabs content would be similarly structured */}
              <TabsContent value="taxes">
                <Card>
                  <CardHeader>
                    <CardTitle>Tax Settings</CardTitle>
                    <CardDescription>Configure tax calculation and display options</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <FormField
                      control={form.control}
                      name="taxes.enable_automatic_tax_calculation"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Enable Automatic Tax Calculation</FormLabel>
                            <FormDescription>
                              Automatically calculate taxes based on location and tax rules.
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
                      control={form.control}
                      name="taxes.default_tax_rate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Default Tax Rate (%)</FormLabel>
                          <FormControl>
                            <Input {...field} type="number" step="0.01" />
                          </FormControl>
                          <FormDescription>
                            Default tax rate when no specific tax rules apply.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="taxes.tax_calculation_method"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tax Calculation Method</FormLabel>
                          <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-col space-y-1">
                            <FormControl>
                              <div className="flex items-center space-x-3 space-y-0">
                                <RadioGroupItem value="origin_based" id="origin_based" />
                                <Label htmlFor="origin_based">Origin Based</Label>
                              </div>
                            </FormControl>
                            <FormControl>
                              <div className="flex items-center space-x-3 space-y-0">
                                <RadioGroupItem value="destination_based" id="destination_based" />
                                <Label htmlFor="destination_based">Destination Based</Label>
                              </div>
                            </FormControl>
                          </RadioGroup>
                          <FormDescription>
                            Base tax calculations on the origin or destination address.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid gap-4 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="taxes.prices_include_tax"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Prices Include Tax</FormLabel>
                              <FormDescription>
                                Product prices already include applicable taxes.
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
                        control={form.control}
                        name="taxes.display_prices_with_tax"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Display Prices with Tax</FormLabel>
                              <FormDescription>
                                Show prices including tax on product pages.
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

                    <FormField
                      control={form.control}
                      name="taxes.tax_rounding_method"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tax Rounding Method</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select method" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="item">Per Item</SelectItem>
                              <SelectItem value="line">Per Line</SelectItem>
                              <SelectItem value="total">Per Order</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            How tax calculations are rounded.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="buyback">
                <Card>
                  <CardHeader>
                    <CardTitle>Buyback Program Settings</CardTitle>
                    <CardDescription>Configure your device buyback program</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="buyback.min_buyback_amount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Minimum Buyback Amount</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">$</span>
                                <Input {...field} type="number" step="0.01" className="pl-8" />
                              </div>
                            </FormControl>
                            <FormDescription>
                              Minimum amount to offer for device buybacks.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="buyback.max_processing_days"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Maximum Processing Days</FormLabel>
                            <FormControl>
                              <Input {...field} type="number" />
                            </FormControl>
                            <FormDescription>
                              Maximum number of days to process buyback requests.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="buyback.payment_methods"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Buyback Payment Methods</FormLabel>
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <Checkbox 
                                id="paypal_buyback" 
                                checked={field.value.includes('paypal')}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    field.onChange([...field.value, 'paypal']);
                                  } else {
                                    field.onChange(field.value.filter(method => method !== 'paypal'));
                                  }
                                }}
                              />
                              <Label htmlFor="paypal_buyback">PayPal</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox 
                                id="bank_transfer_buyback" 
                                checked={field.value.includes('bank_transfer')}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    field.onChange([...field.value, 'bank_transfer']);
                                  } else {
                                    field.onChange(field.value.filter(method => method !== 'bank_transfer'));
                                  }
                                }}
                              />
                              <Label htmlFor="bank_transfer_buyback">Bank Transfer</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox 
                                id="store_credit_buyback" 
                                checked={field.value.includes('store_credit')}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    field.onChange([...field.value, 'store_credit']);
                                  } else {
                                    field.onChange(field.value.filter(method => method !== 'store_credit'));
                                  }
                                }}
                              />
                              <Label htmlFor="store_credit_buyback">Store Credit</Label>
                            </div>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid gap-4 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="buyback.enable_expedited_processing"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Enable Expedited Processing</FormLabel>
                              <FormDescription>
                                Offer faster processing for an additional fee.
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
                        control={form.control}
                        name="buyback.expedited_processing_fee"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Expedited Processing Fee</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">$</span>
                                <Input 
                                  {...field} 
                                  type="number" 
                                  step="0.01" 
                                  className="pl-8"
                                  disabled={!form.getValues().buyback.enable_expedited_processing} 
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="buyback.show_buyback_estimator"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Show Buyback Estimator</FormLabel>
                              <FormDescription>
                                Display estimated buyback value on product pages.
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
                        control={form.control}
                        name="buyback.require_condition_assessment"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Require Condition Assessment</FormLabel>
                              <FormDescription>
                                Require users to complete a condition assessment form.
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

                    <FormField
                      control={form.control}
                      name="buyback.require_photos"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Require Device Photos</FormLabel>
                            <FormDescription>
                              Require users to upload photos of their device.
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
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Add other tab contents with similar structure */}
              <TabsContent value="checkout">
                <Card>
                  <CardHeader>
                    <CardTitle>Checkout Settings</CardTitle>
                    <CardDescription>Configure the checkout process and options</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Checkout settings fields would go here */}
                    <div className="grid gap-4 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="checkout.require_account_to_checkout"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Require Account</FormLabel>
                              <FormDescription>
                                Users must be logged in to checkout.
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={(value) => {
                                  field.onChange(value);
                                  if (value) {
                                    // If requiring account, disable guest checkout
                                    form.setValue('checkout.enable_guest_checkout', false);
                                  }
                                }}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="checkout.enable_guest_checkout"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Enable Guest Checkout</FormLabel>
                              <FormDescription>
                                Allow checkout without creating an account.
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={(value) => {
                                  field.onChange(value);
                                  if (value) {
                                    // If enabling guest checkout, disable require account
                                    form.setValue('checkout.require_account_to_checkout', false);
                                  }
                                }}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="checkout.enable_coupon_codes"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Enable Coupon Codes</FormLabel>
                              <FormDescription>
                                Allow discount coupons during checkout.
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
                        control={form.control}
                        name="checkout.enable_order_comments"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Enable Order Comments</FormLabel>
                              <FormDescription>
                                Allow customers to add notes to their orders.
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

                    <div className="grid gap-4 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="checkout.enable_gift_wrapping"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Enable Gift Wrapping</FormLabel>
                              <FormDescription>
                                Offer gift wrapping option during checkout.
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
                        control={form.control}
                        name="checkout.gift_wrapping_fee"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Gift Wrapping Fee</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">$</span>
                                <Input 
                                  {...field} 
                                  type="number" 
                                  step="0.01" 
                                  className="pl-8"
                                  disabled={!form.getValues().checkout.enable_gift_wrapping}
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="checkout.terms_and_conditions_required"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Require Terms Acceptance</FormLabel>
                              <FormDescription>
                                Require acceptance of terms and conditions.
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
                        control={form.control}
                        name="checkout.enable_one_page_checkout"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">One-Page Checkout</FormLabel>
                              <FormDescription>
                                Display all checkout steps on a single page.
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

                    <FormField
                      control={form.control}
                      name="checkout.send_order_confirmation_email"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Send Order Confirmation Emails</FormLabel>
                            <FormDescription>
                              Send email confirmation after order placement.
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
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="inventory">
                <Card>
                  <CardHeader>
                    <CardTitle>Inventory Settings</CardTitle>
                    <CardDescription>Configure inventory management rules</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <FormField
                      control={form.control}
                      name="inventory.enable_inventory_tracking"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Enable Inventory Tracking</FormLabel>
                            <FormDescription>
                              Track product inventory quantities.
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

                    <div className="grid gap-4 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="inventory.prevent_overselling"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Prevent Overselling</FormLabel>
                              <FormDescription>
                                Don't allow orders for out-of-stock items.
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                disabled={!form.getValues().inventory.enable_inventory_tracking}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="inventory.auto_reduce_stock_on_order"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Auto-Reduce Stock on Order</FormLabel>
                              <FormDescription>
                                Automatically decrease inventory when orders are placed.
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                disabled={!form.getValues().inventory.enable_inventory_tracking}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="inventory.enable_low_stock_notifications"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Low Stock Notifications</FormLabel>
                              <FormDescription>
                                Receive notifications when inventory is low.
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                disabled={!form.getValues().inventory.enable_inventory_tracking}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="inventory.low_stock_notification_threshold"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Low Stock Threshold</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                type="number" 
                                disabled={!form.getValues().inventory.enable_inventory_tracking || !form.getValues().inventory.enable_low_stock_notifications}
                              />
                            </FormControl>
                            <FormDescription>
                              Send notification when stock reaches this level.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="inventory.enable_out_of_stock_notifications"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Out of Stock Notifications</FormLabel>
                              <FormDescription>
                                Receive notifications when items go out of stock.
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                disabled={!form.getValues().inventory.enable_inventory_tracking}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="inventory.auto_restore_stock_on_cancel"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Auto-Restore Stock on Cancel</FormLabel>
                              <FormDescription>
                                Automatically restore inventory when orders are canceled.
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                disabled={!form.getValues().inventory.enable_inventory_tracking}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            <div className="flex justify-end">
              <Button 
                onClick={form.handleSubmit(onSubmit)} 
                disabled={updateSettingsMutation.isPending}
              >
                {updateSettingsMutation.isPending && (
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-t-transparent" />
                )}
                <Save className="mr-2 h-4 w-4" /> Save Changes
              </Button>
            </div>
          </form>
        </Form>
      )}
    </div>
  );
};

export default AdminMarketplaceSettings;