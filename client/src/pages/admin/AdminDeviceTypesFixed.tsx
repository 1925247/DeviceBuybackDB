import React, { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { PlusCircle, Pencil, Trash2, Plus, X } from "lucide-react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import FileUpload from "@/components/ui/file-upload";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

interface DeviceType {
  id: number;
  name: string;
  slug: string;
  icon: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

interface Brand {
  id: number;
  name: string;
  slug: string;
  logo: string;
}

interface BrandDeviceType {
  id: number;
  brand_id: number;
  device_type_id: number;
  brand_name: string;
  device_type_name: string;
  created_at: string;
  updated_at: string;
}

const AdminDeviceTypes: React.FC = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedDeviceType, setSelectedDeviceType] =
    useState<DeviceType | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    icon: "",
    active: true,
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isAssignBrandsModalOpen, setIsAssignBrandsModalOpen] = useState(false);
  const [selectedBrands, setSelectedBrands] = useState<number[]>([]);
  const { toast } = useToast();

  // Query hooks for fetching data
  const { data: deviceTypes, isLoading: isLoadingDeviceTypes } = useQuery<
    DeviceType[]
  >({
    queryKey: ["/api/device-types"],
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    retryDelay: 1000,
  });

  const { data: brands, isLoading: isLoadingBrands } = useQuery<Brand[]>({
    queryKey: ["/api/brands"],
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    retryDelay: 1000,
  });

  const {
    data: brandDeviceTypesResponse,
    isLoading: isLoadingBrandDeviceTypes,
  } = useQuery({
    queryKey: ["/api/brand-device-types"],
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    retryDelay: 1000,
    refetchOnWindowFocus: false,
  });

  // Extract the rows from the response to get the actual brand-device types data
  const brandDeviceTypes = brandDeviceTypesResponse?.rows as
    | BrandDeviceType[]
    | undefined;

  // When assigning brands, we want to pre-select the ones that are already assigned
  useEffect(() => {
    if (selectedDeviceType && brandDeviceTypes) {
      const alreadyAssignedBrands = brandDeviceTypes
        .filter((relation) => relation.device_type_id === selectedDeviceType.id)
        .map((relation) => relation.brand_id);

      setSelectedBrands(alreadyAssignedBrands);
    }
  }, [selectedDeviceType, brandDeviceTypes]);

  // For display purposes - non-null versions of data
  const displayDeviceTypes = deviceTypes || [];
  const displayBrands = brands || [];
  const displayBrandDeviceTypes = brandDeviceTypes || [];
  console.log(displayDeviceTypes[0]);

  // Mutation hooks for API operations
  const createDeviceTypeMutation = useMutation({
    mutationFn: async (deviceType: typeof formData) => {
      return await apiRequest("POST", "/api/device-types", deviceType);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Device type created successfully",
      });
      setIsAddModalOpen(false);
      setFormData({
        name: "",
        slug: "",
        icon: "",
        active: true,
      });
      setSelectedFile(null);
      queryClient.invalidateQueries({ queryKey: ["/api/device-types"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to create device type: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const updateDeviceTypeMutation = useMutation({
    mutationFn: async (deviceType: typeof formData & { id: number }) => {
      return await apiRequest(
        "PUT",
        `/api/device-types/${deviceType.id}`,
        deviceType,
      );
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Device type updated successfully",
      });
      setIsEditModalOpen(false);
      setSelectedDeviceType(null);
      queryClient.invalidateQueries({ queryKey: ["/api/device-types"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to update device type: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const deleteDeviceTypeMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest("DELETE", `/api/device-types/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Device type deleted successfully",
      });
      setIsDeleteModalOpen(false);
      setSelectedDeviceType(null);
      queryClient.invalidateQueries({ queryKey: ["/api/device-types"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to delete device type: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const assignBrandMutation = useMutation({
    mutationFn: async (data: { brand_id: number; device_type_id: number }) => {
      return await apiRequest("POST", "/api/brand-device-types", data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Brand assigned successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/brand-device-types"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to assign brand: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const deleteBrandDeviceTypeMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest("DELETE", `/api/brand-device-types/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Brand association removed successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/brand-device-types"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to remove brand association: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const uploadFileMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("image", file);
      return await apiRequest("POST", "/api/upload", formData);
    },
    onSuccess: (data) => {
      setFormData((prev) => ({
        ...prev,
        icon: data.url,
      }));
      toast({
        title: "Success",
        description: "File uploaded successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to upload file: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Event handlers
  const handleFileUpload = (file: File) => {
    setSelectedFile(file);
    uploadFileMutation.mutate(file);
  };

  const openAddModal = () => {
    setFormData({
      name: "",
      slug: "",
      icon: "",
      active: true,
    });
    setIsAddModalOpen(true);
  };

  const openEditModal = (deviceType: DeviceType) => {
    setSelectedDeviceType(deviceType);
    setFormData({
      name: deviceType.name,
      slug: deviceType.slug,
      icon: deviceType.icon,
      active: deviceType.active,
    });
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (deviceType: DeviceType) => {
    setSelectedDeviceType(deviceType);
    setIsDeleteModalOpen(true);
  };

  const openAssignBrandsModal = (deviceType: DeviceType) => {
    setSelectedDeviceType(deviceType);
    setIsAssignBrandsModalOpen(true);
  };

  const handleCreateDeviceType = (e: React.FormEvent) => {
    e.preventDefault();
    createDeviceTypeMutation.mutate(formData);
  };

  const handleUpdateDeviceType = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedDeviceType) {
      updateDeviceTypeMutation.mutate({
        ...formData,
        id: selectedDeviceType.id,
      });
    }
  };

  const handleDeleteDeviceType = () => {
    if (selectedDeviceType) {
      deleteDeviceTypeMutation.mutate(selectedDeviceType.id);
    }
  };

  const handleAssignBrand = (brandId: number) => {
    if (selectedDeviceType) {
      assignBrandMutation.mutate({
        brand_id: brandId,
        device_type_id: selectedDeviceType.id,
      });
    }
  };

  const handleAssignSelectedBrands = () => {
    if (selectedDeviceType && selectedBrands.length > 0) {
      // Get already assigned brands to avoid duplicates
      const alreadyAssignedBrands = displayBrandDeviceTypes
        .filter((relation) => relation.device_type_id === selectedDeviceType.id)
        .map((relation) => relation.brand_id);

      // Filter only brands that are not already assigned
      const brandsToAssign = selectedBrands.filter(
        (brandId) => !alreadyAssignedBrands.includes(brandId),
      );

      // Assign each brand
      brandsToAssign.forEach((brandId) => {
        assignBrandMutation.mutate({
          brand_id: brandId,
          device_type_id: selectedDeviceType.id,
        });
      });

      // Close modal after assigning
      setIsAssignBrandsModalOpen(false);
    }
  };

  const renderAddModal = () => (
    <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Device Type</DialogTitle>
          <DialogDescription>
            Create a new device type. Device types are used to categorize
            devices.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleCreateDeviceType}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="slug" className="text-right">
                Slug
              </Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) =>
                  setFormData({ ...formData, slug: e.target.value })
                }
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="icon" className="text-right">
                Icon
              </Label>
              <div className="col-span-3">
                <FileUpload onUpload={handleFileUpload} />
                {formData.icon && (
                  <div className="mt-2 flex items-center">
                    <img
                      src={formData.icon}
                      alt="Device type icon"
                      className="h-8 w-8 object-contain"
                    />
                    <span className="ml-2 text-sm text-gray-500">
                      Icon preview
                    </span>
                  </div>
                )}
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="active" className="text-right">
                Active
              </Label>
              <div className="col-span-3 flex items-center">
                <Checkbox
                  id="active"
                  checked={formData.active}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, active: checked as boolean })
                  }
                />
                <Label htmlFor="active" className="ml-2">
                  Device type is active
                </Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={createDeviceTypeMutation.isPending}>
              {createDeviceTypeMutation.isPending ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );

  const renderEditModal = () => (
    <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Device Type</DialogTitle>
          <DialogDescription>Update the device type details.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleUpdateDeviceType}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-name" className="text-right">
                Name
              </Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-slug" className="text-right">
                Slug
              </Label>
              <Input
                id="edit-slug"
                value={formData.slug}
                onChange={(e) =>
                  setFormData({ ...formData, slug: e.target.value })
                }
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-icon" className="text-right">
                Icon
              </Label>
              <div className="col-span-3">
                <FileUpload onUpload={handleFileUpload} />
                {formData.icon && (
                  <div className="mt-2 flex items-center">
                    <img
                      src={formData.icon}
                      alt="Device type icon"
                      className="h-8 w-8 object-contain"
                    />
                    <span className="ml-2 text-sm text-gray-500">
                      Icon preview
                    </span>
                  </div>
                )}
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-active" className="text-right">
                Active
              </Label>
              <div className="col-span-3 flex items-center">
                <Checkbox
                  id="edit-active"
                  checked={formData.active}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, active: checked as boolean })
                  }
                />
                <Label htmlFor="edit-active" className="ml-2">
                  Device type is active
                </Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={updateDeviceTypeMutation.isPending}>
              {updateDeviceTypeMutation.isPending ? "Updating..." : "Update"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );

  const renderDeleteModal = () => (
    <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Delete Device Type</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this device type? This action cannot
            be undone.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <p className="text-sm text-gray-500">
            This will delete the device type{" "}
            <strong>{selectedDeviceType?.name}</strong> and all of its
            associated data. This action is permanent and cannot be undone.
          </p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDeleteDeviceType}
            disabled={deleteDeviceTypeMutation.isPending}
          >
            {deleteDeviceTypeMutation.isPending ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  const renderAssignBrandsModal = () => (
    <Dialog
      open={isAssignBrandsModalOpen}
      onOpenChange={setIsAssignBrandsModalOpen}
    >
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Assign Brands to {selectedDeviceType?.name}</DialogTitle>
          <DialogDescription>
            Select brands to associate with this device type.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <div className="mb-4">
            <Label htmlFor="brands">Brands</Label>
            <div className="mt-2 space-y-2">
              {displayBrands.map((brand) => (
                <div key={brand.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`brand-${brand.id}`}
                    checked={selectedBrands.includes(brand.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedBrands([...selectedBrands, brand.id]);
                      } else {
                        setSelectedBrands(
                          selectedBrands.filter((id) => id !== brand.id),
                        );
                      }
                    }}
                  />
                  <Label
                    htmlFor={`brand-${brand.id}`}
                    className="flex items-center"
                  >
                    {brand.logo && (
                      <img
                        src={brand.logo}
                        alt={`${brand.name} logo`}
                        className="mr-2 h-5 w-5 object-contain"
                      />
                    )}
                    {brand.name}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setIsAssignBrandsModalOpen(false)}
          >
            Cancel
          </Button>
          <Button
            onClick={handleAssignSelectedBrands}
            disabled={assignBrandMutation.isPending}
          >
            {assignBrandMutation.isPending ? "Assigning..." : "Assign Brands"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Device Types</h1>
        <Button onClick={openAddModal}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Device Type
        </Button>
      </div>

      {isLoadingDeviceTypes ? (
        <div className="flex h-96 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-gray-900"></div>
        </div>
      ) : (
        <>
          {/* Device Types Table */}
          <div className="mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Device Types</CardTitle>
                <CardDescription>
                  Manage device types for your category.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-hidden border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Icon</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Slug</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Updated</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {displayDeviceTypes.map((deviceType) => (
                        <TableRow key={deviceType.id}>
                          <TableCell>{deviceType.id}</TableCell>

                          <TableCell>
                            {deviceType.icon ? (
                              <img
                                src={deviceType.icon}
                                alt={`${deviceType.name} icon`}
                                className="h-8 w-8 object-contain"
                              />
                            ) : (
                              <div className="h-8 w-8 rounded bg-gray-200" />
                            )}
                          </TableCell>

                          <TableCell className="font-medium">
                            {deviceType.name}
                          </TableCell>
                          <TableCell>{deviceType.slug}</TableCell>

                          <TableCell>
                            <Badge
                              variant={
                                deviceType.active ? "default" : "secondary"
                              }
                            >
                              {deviceType.active ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>

                          <TableCell>
                            {deviceType.created_at
                              ? new Date(deviceType.created_at).toLocaleString()
                              : "N/A"}
                          </TableCell>

                          <TableCell>
                            {deviceType.updated_at
                              ? new Date(deviceType.updated_at).toLocaleString()
                              : "N/A"}
                          </TableCell>

                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openEditModal(deviceType)}
                              >
                                <Pencil size={16} />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                onClick={() => openDeleteModal(deviceType)}
                              >
                                <Trash2 size={16} />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Brand Associations By Device Type */}
          <div className="mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Brand Associations By Device Type</CardTitle>
                <CardDescription>
                  View and manage which brands are associated with each device
                  type
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {displayDeviceTypes.map((deviceType) => (
                    <div key={deviceType.id} className="border rounded-md p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          {deviceType.icon && (
                            <img
                              src={deviceType.icon}
                              alt={`${deviceType.name} icon`}
                              className="h-6 w-6 object-contain"
                            />
                          )}
                          <h3 className="text-lg font-medium">
                            {deviceType.name}
                          </h3>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 px-2 text-xs"
                          onClick={() => openAssignBrandsModal(deviceType)}
                        >
                          <Plus size={14} className="mr-1" />
                          Add Brands
                        </Button>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {!displayBrandDeviceTypes ||
                        displayBrandDeviceTypes.filter(
                          (relation) =>
                            relation.device_type_id === deviceType.id,
                        ).length === 0 ? (
                          <p className="text-sm text-gray-500">
                            No brands assigned yet
                          </p>
                        ) : (
                          displayBrandDeviceTypes
                            .filter(
                              (relation) =>
                                relation.device_type_id === deviceType.id,
                            )
                            .map((relation) => {
                              const brand = displayBrands.find(
                                (b) => b.id === relation.brand_id,
                              );
                              if (!brand) return null;

                              return (
                                <Badge
                                  key={relation.id}
                                  variant="secondary"
                                  className="flex items-center gap-1 py-1 pl-2"
                                >
                                  {brand.logo && (
                                    <img
                                      src={brand.logo}
                                      alt={`${brand.name} logo`}
                                      className="h-4 w-4 object-contain mr-1"
                                    />
                                  )}
                                  {brand.name}
                                  <button
                                    type="button"
                                    className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
                                    onClick={() =>
                                      deleteBrandDeviceTypeMutation.mutate(
                                        relation.id,
                                      )
                                    }
                                  >
                                    <X size={12} />
                                  </button>
                                </Badge>
                              );
                            })
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* All Brand Associations Table */}
          <div className="mb-8">
            <Card>
              <CardHeader>
                <CardTitle>All Brand Associations</CardTitle>
                <CardDescription>
                  View and manage all brand-device type associations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-hidden border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Device Type</TableHead>
                        <TableHead>Brand</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {displayBrandDeviceTypes &&
                      displayBrandDeviceTypes.length > 0 ? (
                        displayBrandDeviceTypes.map((relation) => (
                          <TableRow key={relation.id}>
                            <TableCell>{relation.id}</TableCell>
                            <TableCell className="font-medium">
                              {relation.device_type_name}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {brands?.find((b) => b.id === relation.brand_id)
                                  ?.logo && (
                                  <img
                                    src={
                                      brands?.find(
                                        (b) => b.id === relation.brand_id,
                                      )?.logo
                                    }
                                    alt={`${relation.brand_name} logo`}
                                    className="h-6 w-6 object-contain"
                                  />
                                )}
                                {relation.brand_name}
                              </div>
                            </TableCell>
                            <TableCell>
                              {new Date(
                                relation.created_at,
                              ).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                onClick={() => {
                                  deleteBrandDeviceTypeMutation.mutate(
                                    relation.id,
                                  );
                                }}
                              >
                                <Trash2 size={16} />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-4">
                            No brand associations found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {/* Render modals */}
      {renderAddModal()}
      {renderEditModal()}
      {renderDeleteModal()}
      {renderAssignBrandsModal()}
    </div>
  );
};

export default AdminDeviceTypes;
