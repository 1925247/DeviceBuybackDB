import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Loader2, Save, Plus, Trash } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Textarea } from '@/components/ui/textarea';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

// Form validation schema for creating/editing feature toggles
const featureToggleSchema = z.object({
  featureKey: z.string().min(3, 'Feature key must be at least 3 characters')
    .regex(/^[a-z0-9_]+$/, 'Feature key can only contain lowercase letters, numbers, and underscores'),
  displayName: z.string().min(2, 'Display name is required'),
  description: z.string().min(5, 'Description must be at least 5 characters'),
  category: z.string().min(2, 'Category is required'),
  scope: z.string(),
  scopeId: z.number().optional().nullable(),
  isEnabled: z.boolean().default(false),
});

type FeatureToggleForm = z.infer<typeof featureToggleSchema>;

type FeatureToggle = {
  id: number;
  featureKey: string;
  displayName: string;
  description: string;
  isEnabled: boolean;
  category: string;
  scope: string;
  scopeId?: number | null;
  lastModifiedBy?: number;
  lastModifiedAt?: string;
  createdAt: string;
  updatedAt: string;
};

const AdminFeatureToggles = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [currentToggle, setCurrentToggle] = useState<FeatureToggle | null>(null);
  
  // Form for create/edit
  const form = useForm<FeatureToggleForm>({
    resolver: zodResolver(featureToggleSchema),
    defaultValues: {
      featureKey: '',
      displayName: '',
      description: '',
      category: 'general',
      scope: 'global',
      scopeId: null,
      isEnabled: false,
    },
  });

  // Fetch all feature toggles
  const { data: toggles, isLoading } = useQuery({
    queryKey: ['/api/feature-toggles'],
    retry: false,
  });

  // Initialize default feature toggles
  const initializeMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('POST', '/api/feature-toggles/initialize', { userId: 1 }); // Assuming admin userId is 1
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/feature-toggles'] });
      toast({
        title: "Success",
        description: "Default feature toggles initialized successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: `Failed to initialize default toggles: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  // Create a new feature toggle
  const createMutation = useMutation({
    mutationFn: async (data: FeatureToggleForm) => {
      return await apiRequest('POST', '/api/feature-toggles', {
        ...data,
        lastModifiedBy: 1, // Assuming admin userId is 1
      });
    },
    onSuccess: () => {
      setOpen(false);
      form.reset();
      queryClient.invalidateQueries({ queryKey: ['/api/feature-toggles'] });
      toast({
        title: "Success",
        description: "Feature toggle created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: `Failed to create feature toggle: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  // Update an existing feature toggle
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<FeatureToggleForm> }) => {
      return await apiRequest('PUT', `/api/feature-toggles/${id}`, {
        ...data,
        lastModifiedBy: 1, // Assuming admin userId is 1
      });
    },
    onSuccess: () => {
      setOpen(false);
      form.reset();
      queryClient.invalidateQueries({ queryKey: ['/api/feature-toggles'] });
      toast({
        title: "Success",
        description: "Feature toggle updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: `Failed to update feature toggle: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  // Toggle a feature on/off
  const toggleMutation = useMutation({
    mutationFn: async ({ featureKey, isEnabled }: { featureKey: string; isEnabled: boolean }) => {
      return await apiRequest('PATCH', `/api/feature-toggles/${featureKey}/toggle`, {
        isEnabled,
        userId: 1, // Assuming admin userId is 1
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/feature-toggles'] });
      toast({
        title: "Success",
        description: "Feature toggle status updated",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: `Failed to update toggle status: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  // Delete a feature toggle
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest('DELETE', `/api/feature-toggles/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/feature-toggles'] });
      toast({
        title: "Success",
        description: "Feature toggle deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: `Failed to delete feature toggle: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (data: FeatureToggleForm) => {
    if (currentToggle) {
      updateMutation.mutate({ id: currentToggle.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleToggleChange = (featureKey: string, isEnabled: boolean) => {
    toggleMutation.mutate({ featureKey, isEnabled });
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this feature toggle? This action cannot be undone.')) {
      deleteMutation.mutate(id);
    }
  };

  const handleEdit = (toggle: FeatureToggle) => {
    setCurrentToggle(toggle);
    form.reset({
      featureKey: toggle.featureKey,
      displayName: toggle.displayName,
      description: toggle.description,
      category: toggle.category,
      scope: toggle.scope,
      scopeId: toggle.scopeId || null,
      isEnabled: toggle.isEnabled,
    });
    setOpen(true);
  };

  const handleNewToggle = () => {
    setCurrentToggle(null);
    form.reset({
      featureKey: '',
      displayName: '',
      description: '',
      category: 'general',
      scope: 'global',
      scopeId: null,
      isEnabled: false,
    });
    setOpen(true);
  };

  const categoryColors: Record<string, string> = {
    general: 'bg-gray-100 text-gray-800',
    marketplace: 'bg-blue-100 text-blue-800',
    buyback: 'bg-green-100 text-green-800',
    partners: 'bg-purple-100 text-purple-800',
    ui: 'bg-orange-100 text-orange-800',
    notifications: 'bg-yellow-100 text-yellow-800',
  };

  // Group toggles by category
  const groupedToggles = React.useMemo(() => {
    if (!toggles) return {};
    
    return toggles.reduce((acc: Record<string, FeatureToggle[]>, toggle: FeatureToggle) => {
      if (!acc[toggle.category]) {
        acc[toggle.category] = [];
      }
      acc[toggle.category].push(toggle);
      return acc;
    }, {});
  }, [toggles]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Feature Toggles Management</h1>
        <div className="flex space-x-2">
          <Button onClick={() => initializeMutation.mutate()} disabled={initializeMutation.isPending}>
            {initializeMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Initializing...
              </>
            ) : (
              'Initialize Default Toggles'
            )}
          </Button>
          <Button onClick={handleNewToggle}>
            <Plus className="mr-2 h-4 w-4" />
            New Feature Toggle
          </Button>
        </div>
      </div>

      <div className="grid gap-6">
        {Object.entries(groupedToggles).map(([category, categoryToggles]) => (
          <Card key={category} className="overflow-hidden">
            <CardHeader className={`${categoryColors[category] || 'bg-gray-100'}`}>
              <CardTitle className="capitalize">{category}</CardTitle>
              <CardDescription className="text-gray-700">
                {category === 'marketplace' && 'Controls for the marketplace features'}
                {category === 'buyback' && 'Controls for the device buyback system'}
                {category === 'partners' && 'Controls for partner-related features'}
                {category === 'ui' && 'Controls for UI elements and components'}
                {category === 'notifications' && 'Controls for notifications and alerts'}
                {category === 'general' && 'General system controls'}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Feature</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Key</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Scope</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categoryToggles.map((toggle) => (
                    <TableRow key={toggle.id}>
                      <TableCell className="font-medium">{toggle.displayName}</TableCell>
                      <TableCell>{toggle.description}</TableCell>
                      <TableCell>
                        <code className="bg-gray-100 px-2 py-1 rounded">{toggle.featureKey}</code>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={toggle.isEnabled}
                            onCheckedChange={(checked) => handleToggleChange(toggle.featureKey, checked)}
                          />
                          <span className={toggle.isEnabled ? 'text-green-600' : 'text-red-600'}>
                            {toggle.isEnabled ? 'Enabled' : 'Disabled'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="capitalize">{toggle.scope}</span>
                        {toggle.scopeId && <span className="ml-1 text-sm text-gray-500">({toggle.scopeId})</span>}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm" onClick={() => handleEdit(toggle)}>
                            Edit
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => handleDelete(toggle.id)}>
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {currentToggle ? 'Edit Feature Toggle' : 'Create Feature Toggle'}
            </DialogTitle>
            <DialogDescription>
              {currentToggle
                ? 'Update the properties of an existing feature toggle'
                : 'Create a new feature toggle to control application functionality'}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="featureKey"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Feature Key</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="e.g. marketplace_enabled"
                        disabled={!!currentToggle}
                      />
                    </FormControl>
                    <FormDescription>
                      Unique identifier used in code. Use lowercase letters, numbers, and underscores.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="displayName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Display Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g. Marketplace Feature" />
                    </FormControl>
                    <FormDescription>
                      Human-readable name for this feature toggle
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Detailed description of what this feature toggle controls"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="general">General</SelectItem>
                          <SelectItem value="marketplace">Marketplace</SelectItem>
                          <SelectItem value="buyback">Buyback</SelectItem>
                          <SelectItem value="partners">Partners</SelectItem>
                          <SelectItem value="ui">UI</SelectItem>
                          <SelectItem value="notifications">Notifications</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="scope"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Scope</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a scope" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="global">Global</SelectItem>
                          <SelectItem value="tenant">Tenant</SelectItem>
                          <SelectItem value="partner">Partner</SelectItem>
                          <SelectItem value="region">Region</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {form.watch('scope') !== 'global' && (
                <FormField
                  control={form.control}
                  name="scopeId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Scope ID</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          value={field.value || ''}
                          onChange={(e) => {
                            const value = e.target.value
                              ? parseInt(e.target.value, 10)
                              : null;
                            field.onChange(value);
                          }}
                          placeholder="ID of the tenant, partner, or region"
                        />
                      </FormControl>
                      <FormDescription>
                        ID of the specific entity this toggle applies to
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="isEnabled"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Enabled</FormLabel>
                      <FormDescription>
                        Set the initial state of this feature toggle
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

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {(createMutation.isPending || updateMutation.isPending) ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminFeatureToggles;