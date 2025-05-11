import React, { useState } from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { useLocation } from "wouter";
import { AdminSidebar } from "@/components/admin/sidebar";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Home, Plus, Pencil, Trash2, Search, Image as ImageIcon } from "lucide-react";
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
  logo: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

export default function BrandsPage() {
  const [location] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [editingBrand, setEditingBrand] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Fetch brands
  const { data: brands = [], isLoading } = useQuery({
    queryKey: ["/api/brands"],
    refetchOnWindowFocus: false,
  });

  // Create form
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      slug: "",
      logo: "",
    },
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: FormData) => {
      return apiRequest("/api/brands", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/brands"] });
      setDialogOpen(false);
      form.reset();
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: (data: FormData & { id: number }) => {
      return apiRequest(`/api/brands/${data.id}`, {
        method: "PUT",
        body: JSON.stringify({ name: data.name, slug: data.slug, logo: data.logo }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/brands"] });
      setDialogOpen(false);
      setEditingBrand(null);
      form.reset();
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => {
      return apiRequest(`/api/brands/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/brands"] });
    },
  });

  // Filter brands by search term
  const filteredBrands = brands.filter((brand: any) => 
    brand.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    brand.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle form submission
  const onSubmit = (data: FormData) => {
    if (editingBrand) {
      updateMutation.mutate({ ...data, id: editingBrand.id });
    } else {
      createMutation.mutate(data);
    }
  };

  // Open dialog for editing
  const handleEdit = (brand: any) => {
    setEditingBrand(brand);
    form.reset({
      name: brand.name,
      slug: brand.slug,
      logo: brand.logo || "",
    });
    setDialogOpen(true);
  };

  // Open dialog for creating
  const handleCreate = () => {
    setEditingBrand(null);
    form.reset({
      name: "",
      slug: "",
      logo: "",
    });
    setDialogOpen(true);
  };

  // Handle delete confirmation
  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this brand?")) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      
      <div className="flex-grow flex">
        {/* Admin Sidebar */}
        <AdminSidebar activePath="/admin/brands" />
        
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
                  <BreadcrumbLink href="/admin/brands" className="font-semibold">Brands</BreadcrumbLink>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
            
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Brands</h1>
              <Button onClick={handleCreate}>
                <Plus className="h-4 w-4 mr-2" />
                Add Brand
              </Button>
            </div>
            
            <Card className="bg-white shadow rounded-lg overflow-hidden">
              <CardHeader className="bg-gray-50 px-4 py-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg font-medium">Brands Management</CardTitle>
                  <div className="relative w-64">
                    <Input
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search brands..."
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
                        <TableHead>Logo</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Slug</TableHead>
                        <TableHead>Created At</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoading ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8">
                            <div className="flex flex-col items-center justify-center">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                              <p className="mt-2">Loading brands...</p>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : filteredBrands.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                            No brands found.
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredBrands.map((brand: any) => (
                          <TableRow key={brand.id}>
                            <TableCell className="font-medium">{brand.id}</TableCell>
                            <TableCell>
                              {brand.logo ? (
                                <div className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded-md overflow-hidden">
                                  <img 
                                    src={brand.logo}
                                    alt={`${brand.name} logo`}
                                    className="max-w-full max-h-full object-contain"
                                  />
                                </div>
                              ) : (
                                <div className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded-md">
                                  <ImageIcon className="h-5 w-5 text-gray-400" />
                                </div>
                              )}
                            </TableCell>
                            <TableCell>{brand.name}</TableCell>
                            <TableCell>{brand.slug}</TableCell>
                            <TableCell>
                              {new Date(brand.created_at).toLocaleDateString()}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleEdit(brand)}
                                className="text-primary hover:text-primary-dark"
                              >
                                <Pencil className="h-4 w-4 mr-1" />
                                Edit
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleDelete(brand.id)}
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
                  <DialogTitle>{editingBrand ? "Edit Brand" : "Add Brand"}</DialogTitle>
                  <DialogDescription>
                    {editingBrand 
                      ? "Update the details for this brand." 
                      : "Add a new brand to the system."}
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
                            <Input placeholder="e.g. Apple" {...field} />
                          </FormControl>
                          <FormDescription>
                            The display name for this brand.
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
                            <Input placeholder="e.g. apple" {...field} />
                          </FormControl>
                          <FormDescription>
                            The URL-friendly version of the name.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="logo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Logo URL</FormLabel>
                          <FormControl>
                            <Input placeholder="https://example.com/logo.png" {...field} />
                          </FormControl>
                          <FormDescription>
                            A direct URL to the brand's logo image.
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
                          editingBrand ? "Update Brand" : "Create Brand"
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