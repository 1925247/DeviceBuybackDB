import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { apiRequest } from '@/lib/queryClient';
import { MapPin, Plus, Edit, Trash } from 'lucide-react';

// Define the Region type
interface Region {
  id: number;
  name: string;
  code: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

// Define the form schema
const regionFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  code: z.string().min(2, { message: "Code must be at least 2 characters" }),
  active: z.boolean().default(true),
});

const RegionsManagement: React.FC = () => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState<Region | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query to fetch all regions
  const { data: regions, isLoading, error } = useQuery({
    queryKey: ['/api/regions'],
  });

  // Form for adding a new region
  const addForm = useForm<z.infer<typeof regionFormSchema>>({
    resolver: zodResolver(regionFormSchema),
    defaultValues: {
      name: '',
      code: '',
      active: true,
    },
  });

  // Form for editing a region
  const editForm = useForm<z.infer<typeof regionFormSchema>>({
    resolver: zodResolver(regionFormSchema),
    defaultValues: {
      name: '',
      code: '',
      active: true,
    },
  });

  // Set edit form values when a region is selected for editing
  React.useEffect(() => {
    if (selectedRegion) {
      editForm.reset({
        name: selectedRegion.name,
        code: selectedRegion.code,
        active: selectedRegion.active,
      });
    }
  }, [selectedRegion, editForm]);

  // Mutation to create a new region
  const createRegionMutation = useMutation({
    mutationFn: async (newRegion: z.infer<typeof regionFormSchema>) => {
      return await apiRequest('POST', '/api/regions', newRegion)
        .then(res => res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/regions'] });
      setIsAddDialogOpen(false);
      addForm.reset();
      toast({
        title: "Region created",
        description: "The region has been created successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create region",
        variant: "destructive",
      });
    },
  });

  // Mutation to update a region
  const updateRegionMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: z.infer<typeof regionFormSchema> }) => {
      return await apiRequest('PUT', `/api/regions/${id}`, data)
        .then(res => res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/regions'] });
      setIsEditDialogOpen(false);
      setSelectedRegion(null);
      toast({
        title: "Region updated",
        description: "The region has been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update region",
        variant: "destructive",
      });
    },
  });

  // Submit handler for adding a new region
  const onAddSubmit = (values: z.infer<typeof regionFormSchema>) => {
    createRegionMutation.mutate(values);
  };

  // Submit handler for editing a region
  const onEditSubmit = (values: z.infer<typeof regionFormSchema>) => {
    if (selectedRegion) {
      updateRegionMutation.mutate({
        id: selectedRegion.id,
        data: values,
      });
    }
  };

  // Handle edit button click
  const handleEdit = (region: Region) => {
    setSelectedRegion(region);
    setIsEditDialogOpen(true);
  };

  // Render loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md">
        <p>Error loading regions. Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Region Management</h1>
          <p className="text-gray-500">Manage regions for product availability and partner assignment</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-1">
              <Plus size={16} />
              <span>Add Region</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Region</DialogTitle>
              <DialogDescription>
                Create a new region for segmenting product availability and partner assignment.
              </DialogDescription>
            </DialogHeader>
            <Form {...addForm}>
              <form onSubmit={addForm.handleSubmit(onAddSubmit)} className="space-y-4">
                <FormField
                  control={addForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Region Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. North America" {...field} />
                      </FormControl>
                      <FormDescription>
                        The display name for this region
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={addForm.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Region Code</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. NA" {...field} />
                      </FormControl>
                      <FormDescription>
                        A short code for the region
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button 
                    type="submit" 
                    disabled={createRegionMutation.isPending}
                  >
                    {createRegionMutation.isPending ? 'Creating...' : 'Create Region'}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Regions</CardTitle>
          <CardDescription>
            Manage regions for specific product availability and partner assignment
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {regions?.length > 0 ? (
                regions.map((region: Region) => (
                  <TableRow key={region.id}>
                    <TableCell className="font-medium">{region.name}</TableCell>
                    <TableCell>{region.code}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        region.active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {region.active ? 'Active' : 'Inactive'}
                      </span>
                    </TableCell>
                    <TableCell>{new Date(region.created_at).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleEdit(region)}
                        >
                          <Edit size={16} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <MapPin size={24} />
                      <p>No regions found</p>
                      <p className="text-sm">Create your first region to get started</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Region</DialogTitle>
            <DialogDescription>
              Update the region details.
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
              <FormField
                control={editForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Region Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. North America" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Region Code</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. NA" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="active"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={field.onChange}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Active</FormLabel>
                      <FormDescription>
                        Inactive regions won't be available for product assignment
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button 
                  type="submit" 
                  disabled={updateRegionMutation.isPending}
                >
                  {updateRegionMutation.isPending ? 'Updating...' : 'Update Region'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RegionsManagement;