import { useState } from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { DeviceForm } from "./device-form";
import { Search, Plus, Smartphone, Laptop, Tablet } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface DeviceTableProps {
  devices: any[];
  isLoading: boolean;
  currentPage: number;
  totalPages?: number;
  onPageChange: (page: number) => void;
}

export function DeviceTable({
  devices,
  isLoading,
  currentPage,
  totalPages = 1,
  onPageChange,
}: DeviceTableProps) {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [editingDevice, setEditingDevice] = useState<any>(null);
  const [isAddDeviceOpen, setIsAddDeviceOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deviceToDelete, setDeviceToDelete] = useState<any>(null);

  const handleEditDevice = (device: any) => {
    setEditingDevice(device);
    setIsAddDeviceOpen(true);
  };

  const handleDeleteDevice = (device: any) => {
    setDeviceToDelete(device);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!deviceToDelete) return;
    
    try {
      await apiRequest("DELETE", `/api/devices/${deviceToDelete.id}`);
      toast({
        title: "Device deleted",
        description: "The device has been deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/devices"] });
    } catch (error) {
      console.error("Error deleting device:", error);
      toast({
        title: "Error",
        description: "There was an error deleting the device. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
      setDeviceToDelete(null);
    }
  };

  const getDeviceIcon = (device: any) => {
    const type = device.name?.toLowerCase() || device.manufacturer?.toLowerCase() || "";
    
    if (type.includes("phone") || type.includes("iphone") || type.includes("samsung") || type.includes("google")) {
      return <Smartphone className="h-5 w-5 text-gray-500" />;
    } else if (type.includes("ipad") || type.includes("tablet") || type.includes("surface")) {
      return <Tablet className="h-5 w-5 text-gray-500" />;
    } else {
      return <Laptop className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "sold":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const filteredDevices = devices.filter(
    (device) =>
      device.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      device.manufacturer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      device.model?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <div className="bg-white shadow rounded-lg overflow-hidden mb-8">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Device Listings</h3>
          <div className="flex space-x-3">
            <div className="relative">
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search devices..."
                className="pl-8"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
            </div>
            <Button onClick={() => setIsAddDeviceOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Device
            </Button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Device</TableHead>
                <TableHead>Condition</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Seller</TableHead>
                <TableHead>Listed Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <div className="flex flex-col items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      <p className="mt-2">Loading devices...</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredDevices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                    No devices found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredDevices.map((device) => (
                  <TableRow key={device.id}>
                    <TableCell className="font-medium">{device.id}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0 bg-gray-100 rounded-md flex items-center justify-center">
                          {getDeviceIcon(device)}
                        </div>
                        <div className="ml-4">
                          <div className="font-medium text-gray-900">{device.name}</div>
                          <div className="text-gray-500">{device.specs}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{device.condition}</TableCell>
                    <TableCell>${parseFloat(device.price).toFixed(2)}</TableCell>
                    <TableCell>{device.seller_id}</TableCell>
                    <TableCell>
                      {device.listed_date ? formatDistanceToNow(new Date(device.listed_date), { addSuffix: true }) : "Unknown"}
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(device.status)}`}>
                        {device.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost" 
                        className="text-primary hover:text-primary-dark mr-3"
                        onClick={() => handleEditDevice(device)}
                      >
                        Edit
                      </Button>
                      <Button 
                        variant="ghost" 
                        className="text-red-600 hover:text-red-900"
                        onClick={() => handleDeleteDevice(device)}
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
          <Pagination>
            <PaginationContent>
              {currentPage > 1 && (
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      onPageChange(currentPage - 1);
                    }}
                  />
                </PaginationItem>
              )}
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                // Create a window of 5 pages around the current page
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <PaginationItem key={i}>
                    <PaginationLink
                      href="#"
                      isActive={pageNum === currentPage}
                      onClick={(e) => {
                        e.preventDefault();
                        onPageChange(pageNum);
                      }}
                    >
                      {pageNum}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}

              {totalPages > 5 && currentPage < totalPages - 2 && (
                <>
                  <PaginationItem>
                    <PaginationEllipsis />
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationLink
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        onPageChange(totalPages);
                      }}
                    >
                      {totalPages}
                    </PaginationLink>
                  </PaginationItem>
                </>
              )}

              {currentPage < totalPages && (
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      onPageChange(currentPage + 1);
                    }}
                  />
                </PaginationItem>
              )}
            </PaginationContent>
          </Pagination>
        </div>
      </div>

      {/* Device Form Modal */}
      <DeviceForm
        open={isAddDeviceOpen}
        onClose={() => {
          setIsAddDeviceOpen(false);
          setEditingDevice(null);
        }}
        editingDevice={editingDevice}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the device "
              {deviceToDelete?.name}" with ID {deviceToDelete?.id}. This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
