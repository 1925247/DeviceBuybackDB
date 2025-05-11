import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { DatabaseStatus } from "@/components/dashboard/database-status";
import { DatabaseSchema } from "@/components/dashboard/database-schema";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";

export default function Dashboard() {
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState("device-listings");

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    
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
    } else {
      navigate("/devices");
    }
  };

  // Redirect to devices page on load
  useEffect(() => {
    if (location.pathname === "/") {
      navigate("/devices");
    }
  }, [navigate]);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <DatabaseStatus />
          
          <Tabs defaultValue="device-listings" value={activeTab} onValueChange={handleTabChange} className="mb-6 border-b border-gray-200">
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
          
          <DatabaseSchema />
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
