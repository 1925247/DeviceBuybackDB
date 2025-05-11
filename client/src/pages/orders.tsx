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
import { Search, Plus, ShoppingCart } from "lucide-react";
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
import { Card, CardContent } from "@/components/ui/card";
import { useOrders } from "@/hooks/use-orders";
import { formatDistanceToNow } from "date-fns";

export default function OrdersPage() {
  const [location, navigate] = useLocation();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const { orders, isLoading, totalPages } = useOrders(currentPage, 10);

  const handleTabChange = (tab: string) => {
    if (tab !== "order-management") {
      if (tab === "device-listings") {
        navigate("/devices");
      } else if (tab === "buyback-tracking") {
        navigate("/buyback");
      } else if (tab === "marketplace") {
        navigate("/marketplace");
      } else if (tab === "admin-panel") {
        navigate("/admin");
      }
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const filteredOrders = orders?.filter(
    (order) => 
      order.id.toString().includes(searchTerm) ||
      order.status?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Tabs defaultValue="order-management" onValueChange={handleTabChange} className="mb-6 border-b border-gray-200">
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
          
          <Card className="bg-white shadow rounded-lg overflow-hidden mb-8">
            <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Order Management</h3>
              <div className="flex space-x-3">
                <div className="relative">
                  <Input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search orders..."
                    className="pl-8"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
                <Button onClick={() => alert("Create order functionality would go here")}>
                  <Plus className="h-4 w-4 mr-2" />
                  New Order
                </Button>
              </div>
            </div>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Buyer</TableHead>
                      <TableHead>Seller</TableHead>
                      <TableHead>Device</TableHead>
                      <TableHead>Total Amount</TableHead>
                      <TableHead>Order Date</TableHead>
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
                            <p className="mt-2">Loading orders...</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : filteredOrders.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                          No orders found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredOrders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-medium">{order.id}</TableCell>
                          <TableCell>User #{order.buyer_id}</TableCell>
                          <TableCell>User #{order.seller_id}</TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <div className="h-10 w-10 flex-shrink-0 bg-gray-100 rounded-md flex items-center justify-center">
                                <ShoppingCart className="h-5 w-5 text-gray-500" />
                              </div>
                              <div className="ml-4">
                                <div className="font-medium text-gray-900">Device #{order.device_id}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>${parseFloat(order.total_amount).toFixed(2)}</TableCell>
                          <TableCell>
                            {order.created_at ? formatDistanceToNow(new Date(order.created_at), { addSuffix: true }) : "Unknown"}
                          </TableCell>
                          <TableCell>
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(order.status)}`}>
                              {order.status}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button 
                              variant="ghost" 
                              className="text-primary hover:text-primary-dark mr-3"
                              onClick={() => alert(`Edit order ${order.id}`)}
                            >
                              Edit
                            </Button>
                            <Button 
                              variant="ghost" 
                              className="text-gray-600 hover:text-gray-900"
                              onClick={() => alert(`View order ${order.id}`)}
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

                    {Array.from({ length: Math.min(5, totalPages || 1) }, (_, i) => {
                      let pageNum;
                      if ((totalPages || 1) <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= (totalPages || 1) - 2) {
                        pageNum = (totalPages || 1) - 4 + i;
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
                              setCurrentPage(pageNum);
                            }}
                          >
                            {pageNum}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    })}

                    {(totalPages || 1) > 5 && currentPage < (totalPages || 1) - 2 && (
                      <>
                        <PaginationItem>
                          <PaginationEllipsis />
                        </PaginationItem>
                        <PaginationItem>
                          <PaginationLink
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              setCurrentPage(totalPages || 1);
                            }}
                          >
                            {totalPages}
                          </PaginationLink>
                        </PaginationItem>
                      </>
                    )}

                    {currentPage < (totalPages || 1) && (
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
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
