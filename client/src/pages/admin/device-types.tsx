import React, { useState } from "react";
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
} from "@/components/ui/form";
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
});

type FormData = z.infer<typeof formSchema>;

export default function DeviceTypesPage() {
  const [location] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [editingDeviceType, setEditingDeviceType] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Fetch device types
  const { data: deviceTypes = [], isLoading } = useQuery({
    queryKey: ["/api/device-types"],
    refetchOnWindowFocus: false,
  });

  // Create form
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      slug: "",
    },
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: FormData) => {
      return apiRequest("/api/device-types", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/device-types"] });
      setDialogOpen(false);
      form.reset();
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: (data: FormData & { id: number }) => {
      return apiRequest(`/api/device-types/${data.id}`, {
        method: "PUT",
        body: JSON.stringify({ name: data.name, slug: data.slug }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/device-types"] });
      setDialogOpen(false);
      setEditingDeviceType(null);
      form.reset();
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => {
      return apiRequest(`/api/device-types/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/device-types"] });
    },
  });

  // Filter device types by search term
  const filteredDeviceTypes = deviceTypes.filter((deviceType: any) => 
    deviceType.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    deviceType.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle form submission
  const onSubmit = (data: FormData) => {
    if (editingDeviceType) {
      updateMutation.mutate({ ...data, id: editingDeviceType.id });
    } else {
      createMutation.mutate(data);
    }
  };

  // Open dialog for editing
  const handleEdit = (deviceType: any) => {
    setEditingDeviceType(deviceType);
    form.reset({
      name: deviceType.name,
      slug: deviceType.slug,
    });
    setDialogOpen(true);
  };

  // Open dialog for creating
  const handleCreate = () => {
    setEditingDeviceType(null);
    form.reset({
      name: "",
      slug: "",
    });
    setDialogOpen(true);
  };

  // Handle delete confirmation
  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this device type?")) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      
      <div className="flex-grow flex">
        {/* Admin Sidebar */}
        <AdminSidebar activePath="/admin/device-types" />
        
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
                  <BreadcrumbLink href="/admin/device-types" className="font-semibold">Device Types</BreadcrumbLink>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
            
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Device Types</h1>
              <Button onClick={handleCreate}>
                <Plus className="h-4 w-4 mr-2" />
                Add Device Type
              </Button>
            </div>
            
            <Card className="bg-white shadow rounded-lg overflow-hidden">
              <CardHeader className="bg-gray-50 px-4 py-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg font-medium">Device Types Management</CardTitle>
                  <div className="relative w-64">
                    <Input
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search device types..."
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
                        <TableHead>Created At</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoading ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8">
                            <div className="flex flex-col items-center justify-center">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                              <p className="mt-2">Loading device types...</p>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : filteredDeviceTypes.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                            No device types found.
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredDeviceTypes.map((deviceType: any) => (
                          <TableRow key={deviceType.id}>
                            <TableCell className="font-medium">{deviceType.id}</TableCell>
                            <TableCell>{deviceType.name}</TableCell>
                            <TableCell>{deviceType.slug}</TableCell>
                            <TableCell>
                              {new Date(deviceType.created_at).toLocaleDateString()}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleEdit(deviceType)}
                                className="text-primary hover:text-primary-dark"
                              >
                                <Pencil className="h-4 w-4 mr-1" />
                                Edit
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleDelete(deviceType.id)}
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
                  <DialogTitle>{editingDeviceType ? "Edit Device Type" : "Add Device Type"}</DialogTitle>
                  <DialogDescription>
                    {editingDeviceType 
                      ? "Update the details for this device type." 
                      : "Add a new device type to the system."}
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
                            <Input placeholder="e.g. Smartphone" {...field} />
                          </FormControl>
                          <FormDescription>
                            The display name for this device type.
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
                            <Input placeholder="e.g. smartphones" {...field} />
                          </FormControl>
                          <FormDescription>
                            The URL-friendly version of the name.
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
                          editingDeviceType ? "Update Device Type" : "Create Device Type"
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