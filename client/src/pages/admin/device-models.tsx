import React, { useState, useEffect } from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { useLocation } from "wouter";
import { AdminSidebar } from "@/components/admin/sidebar";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Home, Plus, Pencil, Trash2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  slug: z.string().min(2, {
    message: "Slug must be at least 2 characters.",
  }),
  brand_id: z.coerce.number().min(1, {
    message: "Please select a brand",
  }),
  device_type_id: z.coerce.number().min(1, {
    message: "Please select a device type",
  }),
});

type FormData = z.infer<typeof formSchema>;

export default function DeviceModelsPage() {
  const [location] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [editingModel, setEditingModel] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Fetch device models
  const { data: deviceModels = [], isLoading: isLoadingModels } = useQuery({
    queryKey: ["/api/device-models"],
    refetchOnWindowFocus: false,
  });

  // Fetch brands for dropdown
  const { data: brands = [] } = useQuery({
    queryKey: ["/api/brands"],
    refetchOnWindowFocus: false,
  });

  // Fetch device types for dropdown
  const { data: deviceTypes = [] } = useQuery({
    queryKey: ["/api/device-types"],
    refetchOnWindowFocus: false,
  });

  // Create form
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      slug: "",
      brand_id: undefined,
      device_type_id: undefined,
    },
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: FormData) => {
      return apiRequest("/api/device-models", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/device-models"] });
      setDialogOpen(false);
      form.reset();
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: (data: FormData & { id: number }) => {
      return apiRequest(`/api/device-models/${data.id}`, {
        method: "PUT",
        body: JSON.stringify({
          name: data.name,
          slug: data.slug,
          brand_id: data.brand_id,
          device_type_id: data.device_type_id,
        }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/device-models"] });
      setDialogOpen(false);
      setEditingModel(null);
      form.reset();
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => {
      return apiRequest(`/api/device-models/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/device-models"] });
    },
  });

  // Helper function to get brand name by ID
  const getBrandName = (brandId: number) => {
    const brand = brands.find((b: any) => b.id === brandId);
    return brand ? brand.name : "Unknown";
  };

  // Helper function to get device type name by ID
  const getDeviceTypeName = (deviceTypeId: number) => {
    const deviceType = deviceTypes.find((d: any) => d.id === deviceTypeId);
    return deviceType ? deviceType.name : "Unknown";
  };

  // Filter device models by search term
  const filteredDeviceModels = deviceModels.filter((model: any) => 
    model.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    model.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
    getBrandName(model.brand_id).toLowerCase().includes(searchTerm.toLowerCase()) ||
    getDeviceTypeName(model.device_type_id).toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle form submission
  const onSubmit = (data: FormData) => {
    if (editingModel) {
      updateMutation.mutate({ ...data, id: editingModel.id });
    } else {
      createMutation.mutate(data);
    }
  };

  // Open dialog for editing
  const handleEdit = (model: any) => {
    setEditingModel(model);
    form.reset({
      name: model.name,
      slug: model.slug,
      brand_id: model.brand_id,
      device_type_id: model.device_type_id,
    });
    setDialogOpen(true);
  };

  // Open dialog for creating
  const handleCreate = () => {
    setEditingModel(null);
    form.reset({
      name: "",
      slug: "",
      brand_id: undefined,
      device_type_id: undefined,
    });
    setDialogOpen(true);
  };

  // Handle delete confirmation
  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this device model?")) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      
      <div className="flex-grow flex">
        {/* Admin Sidebar */}
        <AdminSidebar activePath="/admin/device-models" />
        
        {/* Main Content */}
        <main className="flex-grow p-6 overflow-auto">
          <div className="max-w-6xl mx-auto">
            {/* Breadcrumbs */}
            <Breadcrumb className="mb-5">
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/admin" className="flex items-center">
                    <Home className="h-4 w-4 mr-1" />
                    Dashboard
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink href="/admin/device-models" className="font-semibold">Device Models</BreadcrumbLink>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
            
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Device Models</h1>
              <Button onClick={handleCreate}>
                <Plus className="h-4 w-4 mr-2" />
                Add Device Model
              </Button>
            </div>
            
            <Card className="bg-white shadow rounded-lg overflow-hidden">
              <CardHeader className="bg-gray-50 px-4 py-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg font-medium">Device Models Management</CardTitle>
                  <div className="relative w-64">
                    <Input
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search device models..."
                      className="pl-8"
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Slug</TableHead>
                        <TableHead>Brand</TableHead>
                        <TableHead>Device Type</TableHead>
                        <TableHead>Created At</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoadingModels ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8">
                            <div className="flex flex-col items-center justify-center">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                              <p className="mt-2">Loading device models...</p>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : filteredDeviceModels.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                            No device models found.
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredDeviceModels.map((model: any) => (
                          <TableRow key={model.id}>
                            <TableCell className="font-medium">{model.id}</TableCell>
                            <TableCell>{model.name}</TableCell>
                            <TableCell>{model.slug}</TableCell>
                            <TableCell>{getBrandName(model.brand_id)}</TableCell>
                            <TableCell>{getDeviceTypeName(model.device_type_id)}</TableCell>
                            <TableCell>
                              {new Date(model.created_at).toLocaleDateString()}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleEdit(model)}
                                className="text-primary hover:text-primary-dark"
                              >
                                <Pencil className="h-4 w-4 mr-1" />
                                Edit
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleDelete(model.id)}
                                className="text-red-600 hover:text-red-900 ml-2"
                              >
                                <Trash2 className="h-4 w-4 mr-1" />
                                Delete
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
            
            {/* Form Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingModel ? "Edit Device Model" : "Add Device Model"}</DialogTitle>
                  <DialogDescription>
                    {editingModel 
                      ? "Update the details for this device model." 
                      : "Add a new device model to the system."}
                  </DialogDescription>
                </DialogHeader>
                
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. iPhone 15 Pro" {...field} />
                          </FormControl>
                          <FormDescription>
                            The display name for this device model.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="slug"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Slug</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. iphone-15-pro" {...field} />
                          </FormControl>
                          <FormDescription>
                            The URL-friendly version of the name.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="brand_id"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Brand</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value?.toString()}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select brand" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {brands.map((brand: any) => (
                                  <SelectItem key={brand.id} value={brand.id.toString()}>
                                    {brand.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              The manufacturer of this device model.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="device_type_id"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Device Type</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value?.toString()}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select device type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {deviceTypes.map((type: any) => (
                                  <SelectItem key={type.id} value={type.id.toString()}>
                                    {type.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              The category of this device model.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button type="button" variant="outline">Cancel</Button>
                      </DialogClose>
                      <Button 
                        type="submit" 
                        disabled={createMutation.isPending || updateMutation.isPending}
                      >
                        {createMutation.isPending || updateMutation.isPending ? (
                          <div className="flex items-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Saving...
                          </div>
                        ) : (
                          editingModel ? "Update Device Model" : "Create Device Model"
                        )}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </main>
      </div>
      
      <Footer />
    </div>
  );
}