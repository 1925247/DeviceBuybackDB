import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLocation } from "wouter";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Search, Plus } from "lucide-react";
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

export default function BuybackPage() {
  const [location, navigate] = useLocation();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  
  interface BuybackResponse {
    requests: Array<{
      id: number;
      user_id: number;
      device_type: string;
      manufacturer: string;
      model: string;
      condition: string;
      offered_price: string | number;
      status: string;
      created_at?: string;
      updated_at?: string;
    }>;
    totalPages: number;
    currentPage: number;
  }

  const { data, isLoading } = useQuery<BuybackResponse>({
    queryKey: ["/api/buyback-requests", currentPage, pageSize]
  });

  // Get actual totalPages from the data or default to 1
  const totalPages = data?.totalPages || 1;

  const handleTabChange = (tab: string) => {
    if (tab !== "buyback-tracking") {
      if (tab === "device-listings") {
        navigate("/devices");
      } else if (tab === "marketplace") {
        navigate("/marketplace");
      } else if (tab === "order-management") {
        navigate("/orders");
      } else if (tab === "admin-panel") {
        navigate("/admin");
      }
    }
  };

  const getStatusBadgeColor = (status: string | undefined) => {
    if (!status) return "bg-gray-100 text-gray-800";
    
    switch (status.toLowerCase()) {
      case "approved":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Tabs defaultValue="buyback-tracking" onValueChange={handleTabChange} className="mb-6 border-b border-gray-200">
            <TabsList className="bg-transparent mb-0 -mb-px">
              <TabsTrigger 
                value="device-listings" 
                className="data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none data-[state=active]:bg-transparent border-transparent text-gray-500 py-3 px-1 border-b-2 font-medium text-sm"
              >
                Device Listings
              </TabsTrigger>
              <TabsTrigger 
                value="buyback-tracking" 
                className="data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none data-[state=active]:bg-transparent border-transparent text-gray-500 py-3 px-1 border-b-2 font-medium text-sm"
              >
                Buyback Tracking
              </TabsTrigger>
              <TabsTrigger 
                value="marketplace" 
                className="data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none data-[state=active]:bg-transparent border-transparent text-gray-500 py-3 px-1 border-b-2 font-medium text-sm"
              >
                Marketplace
              </TabsTrigger>
              <TabsTrigger 
                value="order-management" 
                className="data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none data-[state=active]:bg-transparent border-transparent text-gray-500 py-3 px-1 border-b-2 font-medium text-sm"
              >
                Order Management
              </TabsTrigger>
              <TabsTrigger 
                value="admin-panel" 
                className="data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none data-[state=active]:bg-transparent border-transparent text-gray-500 py-3 px-1 border-b-2 font-medium text-sm"
              >
                Admin Panel
              </TabsTrigger>
            </TabsList>
          </Tabs>
          
          <div className="bg-white shadow rounded-lg overflow-hidden mb-8">
            <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Buyback Requests</h3>
              <div className="flex space-x-3">
                <div className="relative">
                  <Input
                    placeholder="Search requests..."
                    className="pl-8"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  New Request
                </Button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Device Type</TableHead>
                    <TableHead>Model</TableHead>
                    <TableHead>Condition</TableHead>
                    <TableHead>Offered Price</TableHead>
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
                          <p className="mt-2">Loading buyback requests...</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : !data?.requests || data.requests.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                        No buyback requests found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    data.requests.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell className="font-medium">{request.id}</TableCell>
                        <TableCell>User #{request.user_id}</TableCell>
                        <TableCell>{request.device_type}</TableCell>
                        <TableCell>{request.manufacturer} {request.model}</TableCell>
                        <TableCell>{request.condition}</TableCell>
                        <TableCell>${typeof request.offered_price === 'string' ? parseFloat(request.offered_price).toFixed(2) : request.offered_price.toFixed(2)}</TableCell>
                        <TableCell>
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(request.status)}`}>
                            {request.status}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="ghost" 
                            className="text-primary hover:text-primary-dark mr-3"
                          >
                            Edit
                          </Button>
                          <Button 
                            variant="ghost" 
                            className="text-gray-600 hover:text-gray-900"
                          >
                            View
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
                          setCurrentPage(currentPage - 1);
                        }}
                      />
                    </PaginationItem>
                  )}

                  {Array.from({ length: totalPages }, (_, i) => (
                    <PaginationItem key={i}>
                      <PaginationLink
                        href="#"
                        isActive={i + 1 === currentPage}
                        onClick={(e) => {
                          e.preventDefault();
                          setCurrentPage(i + 1);
                        }}
                      >
                        {i + 1}
                      </PaginationLink>
                    </PaginationItem>
                  ))}

                  {currentPage < totalPages && (
                    <PaginationItem>
                      <PaginationNext
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          setCurrentPage(currentPage + 1);
                        }}
                      />
                    </PaginationItem>
                  )}
                </PaginationContent>
              </Pagination>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
