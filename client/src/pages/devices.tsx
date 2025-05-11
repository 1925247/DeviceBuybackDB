import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { DeviceTable } from "@/components/devices/device-table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLocation } from "wouter";

export default function DevicesPage() {
  const [location, navigate] = useLocation();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  
  const { data, isLoading } = useQuery({
    queryKey: ["/api/devices", currentPage, pageSize],
    keepPreviousData: true,
  });

  // For simplicity, we're assuming a total of 3 pages
  const totalPages = 3;

  const handleTabChange = (tab: string) => {
    if (tab !== "device-listings") {
      if (tab === "buyback-tracking") {
        navigate("/buyback");
      } else if (tab === "marketplace") {
        navigate("/marketplace");
      } else if (tab === "order-management") {
        navigate("/orders");
      } else if (tab === "admin-panel") {
        navigate("/admin");
      }
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Tabs defaultValue="device-listings" onValueChange={handleTabChange} className="mb-6 border-b border-gray-200">
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
          
          <DeviceTable
            devices={data || [
              {
                id: 101,
                name: "iPhone 13 Pro",
                specs: "128GB, Sierra Blue",
                condition: "Excellent",
                price: "749.99",
                seller_id: 1,
                listed_date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
                status: "Active",
                manufacturer: "Apple"
              },
              {
                id: 102,
                name: "MacBook Pro M1",
                specs: "13-inch, 16GB RAM, 512GB SSD",
                condition: "Good",
                price: "1199.99",
                seller_id: 2,
                listed_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
                status: "Active",
                manufacturer: "Apple"
              },
              {
                id: 103,
                name: "iPad Pro 11\"",
                specs: "256GB, Space Gray, Wi-Fi",
                condition: "Fair",
                price: "649.50",
                seller_id: 3,
                listed_date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
                status: "Pending",
                manufacturer: "Apple"
              }
            ]}
            isLoading={isLoading}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
