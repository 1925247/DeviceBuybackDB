import React, { useState } from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { useLocation } from "wouter";
import { AdminSidebar } from "@/components/admin/sidebar";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Home, Plus, Pencil, Trash2, Search, DollarSign } from "lucide-react";
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
  device_model_id: z.coerce.number().min(1, {
    message: "Please select a device model",
  }),
  condition: z.string().min(1, {
    message: "Please select a condition",
  }),
  base_price: z.coerce.number().min(1, {
    message: "Base price must be at least 1",
  }),
  variant: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

export default function ValuationsPage() {
  const [location] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [editingValuation, setEditingValuation] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Fetch valuations
  const { data: valuations = [], isLoading } = useQuery({
    queryKey: ["/api/valuations"],
    refetchOnWindowFocus: false,
  });

  // Fetch device models for dropdown
  const { data: deviceModels = [] } = useQuery({
    queryKey: ["/api/device-models"],
    refetchOnWindowFocus: false,
  });

  // Fetch brands for information
  const { data: brands = [] } = useQuery({
    queryKey: ["/api/brands"],
    refetchOnWindowFocus: false,
  });

  // Create form
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      device_model_id: undefined,
      condition: "",
      base_price: undefined,
      variant: "",
    },
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: FormData) => {
      return apiRequest("/api/valuations", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/valuations"] });
      setDialogOpen(false);
      form.reset();
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: (data: FormData & { id: number }) => {
      return apiRequest(`/api/valuations/${data.id}`, {
        method: "PUT",
        body: JSON.stringify({
          device_model_id: data.device_model_id,
          condition: data.condition,
          base_price: data.base_price,
          variant: data.variant,
        }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/valuations"] });
      setDialogOpen(false);
      setEditingValuation(null);
      form.reset();
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => {
      return apiRequest(`/api/valuations/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/valuations"] });
    },
  });

  // Helper function to get device model details
  const getDeviceModelDetails = (modelId: number) => {
    const model = deviceModels.find((m: any) => m.id === modelId);
    if (!model) return { name: "Unknown", brand: "Unknown" };
    
    const brand = brands.find((b: any) => b.id === model.brand_id);
    return {
      name: model.name,
      brand: brand ? brand.name : "Unknown",
    };
  };

  // Filter valuations by search term
  const filteredValuations = valuations.filter((valuation: any) => {
    const modelDetails = getDeviceModelDetails(valuation.device_model_id);
    return (
      modelDetails.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      modelDetails.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (valuation.variant && valuation.variant.toLowerCase().includes(searchTerm.toLowerCase())) ||
      valuation.condition.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  // Handle form submission
  const onSubmit = (data: FormData) => {
    if (editingValuation) {
      updateMutation.mutate({ ...data, id: editingValuation.id });
    } else {
      createMutation.mutate(data);
    }
  };

  // Open dialog for editing
  const handleEdit = (valuation: any) => {
    setEditingValuation(valuation);
    form.reset({
      device_model_id: valuation.device_model_id,
      condition: valuation.condition,
      base_price: valuation.base_price,
      variant: valuation.variant || "",
    });
    setDialogOpen(true);
  };

  // Open dialog for creating
  const handleCreate = () => {
    setEditingValuation(null);
    form.reset({
      device_model_id: undefined,
      condition: "",
      base_price: undefined,
      variant: "",
    });
    setDialogOpen(true);
  };

  // Handle delete confirmation
  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this valuation?")) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      
      <div className="flex-grow flex">
        {/* Admin Sidebar */}
        <AdminSidebar activePath="/admin/valuations" />
        
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
                  <BreadcrumbLink href="/admin/valuations" className="font-semibold">Valuations</BreadcrumbLink>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
            
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Device Valuations</h1>
              <Button onClick={handleCreate}>
                <Plus className="h-4 w-4 mr-2" />
                Add Valuation
              </Button>
            </div>
            
            <Card className="bg-white shadow rounded-lg overflow-hidden">
              <CardHeader className="bg-gray-50 px-4 py-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg font-medium">Buyback Valuation Management</CardTitle>
                  <div className="relative w-64">
                    <Input
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search valuations..."
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
                        <TableHead>Device</TableHead>
                        <TableHead>Brand</TableHead>
                        <TableHead>Variant</TableHead>
                        <TableHead>Condition</TableHead>
                        <TableHead>Base Price</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoading ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8">
                            <div className="flex flex-col items-center justify-center">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                              <p className="mt-2">Loading valuations...</p>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : filteredValuations.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                            No valuations found.
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredValuations.map((valuation: any) => {
                          const modelDetails = getDeviceModelDetails(valuation.device_model_id);
                          return (
                            <TableRow key={valuation.id}>
                              <TableCell className="font-medium">{modelDetails.name}</TableCell>
                              <TableCell>{modelDetails.brand}</TableCell>
                              <TableCell>{valuation.variant || "Standard"}</TableCell>
                              <TableCell>
                                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                                  ${valuation.condition === "excellent" ? "bg-green-100 text-green-800" : 
                                    valuation.condition === "good" ? "bg-blue-100 text-blue-800" : 
                                    valuation.condition === "fair" ? "bg-yellow-100 text-yellow-800" : 
                                    valuation.condition === "poor" ? "bg-red-100 text-red-800" : 
                                    "bg-gray-100 text-gray-800"}`
                                }>
                                  {valuation.condition.charAt(0).toUpperCase() + valuation.condition.slice(1)}
                                </span>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center">
                                  <DollarSign className="h-4 w-4 text-green-600 mr-1" />
                                  {formatPrice(valuation.base_price)}
                                </div>
                              </TableCell>
                              <TableCell className="text-right">
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => handleEdit(valuation)}
                                  className="text-primary hover:text-primary-dark"
                                >
                                  <Pencil className="h-4 w-4 mr-1" />
                                  Edit
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => handleDelete(valuation.id)}
                                  className="text-red-600 hover:text-red-900 ml-2"
                                >
                                  <Trash2 className="h-4 w-4 mr-1" />
                                  Delete
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })
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
                  <DialogTitle>{editingValuation ? "Edit Valuation" : "Add Valuation"}</DialogTitle>
                  <DialogDescription>
                    {editingValuation 
                      ? "Update the details for this device valuation." 
                      : "Add a new device valuation to the system."}
                  </DialogDescription>
                </DialogHeader>
                
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="device_model_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Device Model</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value?.toString()}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select device model" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {deviceModels.map((model: any) => {
                                const brandName = brands.find((b: any) => b.id === model.brand_id)?.name || "";
                                return (
                                  <SelectItem key={model.id} value={model.id.toString()}>
                                    {brandName} {model.name}
                                  </SelectItem>
                                );
                              })}
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            The device model this valuation applies to
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="condition"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Condition</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select condition" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="excellent">Excellent</SelectItem>
                                <SelectItem value="good">Good</SelectItem>
                                <SelectItem value="fair">Fair</SelectItem>
                                <SelectItem value="poor">Poor</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              The condition rating for this valuation
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="variant"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Variant (Optional)</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. 256GB, Pro Max" {...field} />
                            </FormControl>
                            <FormDescription>
                              The specific variant of this model
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="base_price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Base Price ($)</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <DollarSign className="h-4 w-4 text-gray-400" />
                              </div>
                              <Input
                                type="number"
                                placeholder="199.99"
                                min="0"
                                step="0.01"
                                className="pl-8"
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormDescription>
                            The buyback value for this device in this condition
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
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
                          editingValuation ? "Update Valuation" : "Create Valuation"
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