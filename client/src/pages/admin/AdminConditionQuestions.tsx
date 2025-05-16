import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChevronRight,
  Search,
  Plus,
  Layers,
  AlertCircle,
  HelpCircle,
  MonitorSmartphone,
  Smartphone
} from "lucide-react";
import { QuestionGroup } from "@shared/schema";
import { Badge } from "@/components/ui/badge";

export default function AdminConditionQuestions() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  // Fetch all question groups
  const { data: questionGroups, isLoading } = useQuery<QuestionGroup[]>({
    queryKey: ["/api/question-groups"],
  });

  // Fetch device types for filtering
  const { data: deviceTypes } = useQuery<any[]>({
    queryKey: ["/api/device-types"],
    initialData: [],
  });

  // Handle navigating to question group details
  const handleGroupClick = (groupId: number) => {
    navigate(`/admin/condition-questions/${groupId}`);
  };

  // Handle navigating to create new group
  const handleCreateGroup = () => {
    navigate("/admin/question-groups");
  };

  // Filter question groups based on search query and active tab
  const filteredGroups = questionGroups?.filter((group) => {
    // Filter by search query
    const matchesSearch = group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (group.statement && group.statement.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // Filter by device type tab
    if (activeTab === "all") {
      return matchesSearch;
    } else if (activeTab === "general") {
      return matchesSearch && !group.deviceTypeId;
    } else {
      return matchesSearch && group.deviceTypeId === parseInt(activeTab);
    }
  });

  // Get device type name by ID
  const getDeviceTypeName = (deviceTypeId: number | null) => {
    if (!deviceTypeId) return "General";
    if (!deviceTypes || !Array.isArray(deviceTypes)) return "Unknown";
    const deviceType = deviceTypes.find(dt => dt.id === deviceTypeId);
    return deviceType?.name || "Unknown";
  };

  // Get icon for a group
  const getGroupIcon = (group: QuestionGroup) => {
    if (group.icon) {
      return <HelpCircle className="h-10 w-10 text-blue-500" />;
    }
    
    // Default icon based on device type
    if (!group.deviceTypeId) {
      return <Layers className="h-10 w-10 text-gray-500" />;
    }
    
    if (!deviceTypes || !Array.isArray(deviceTypes)) {
      return <MonitorSmartphone className="h-10 w-10 text-indigo-500" />;
    }
    
    const deviceType = deviceTypes.find(dt => dt.id === group.deviceTypeId);
    if (deviceType?.slug?.includes("phone") || deviceType?.slug?.includes("mobile")) {
      return <Smartphone className="h-10 w-10 text-blue-500" />;
    }
    
    return <MonitorSmartphone className="h-10 w-10 text-indigo-500" />;
  };

  return (
    <div className="container mx-auto py-6">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Q&A Management</h1>
          <p className="text-gray-500 mt-1">
            Manage question groups and assessments for device conditions
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex flex-col md:flex-row gap-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="search"
              placeholder="Search question groups..."
              className="pl-8 w-full md:w-[250px]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button onClick={handleCreateGroup}>
            <Plus className="mr-2 h-4 w-4" /> Create Group
          </Button>
        </div>
      </header>

      <Tabs
        defaultValue="all"
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="mb-8 flex-wrap">
          <TabsTrigger value="all">All Groups</TabsTrigger>
          <TabsTrigger value="general">General Questions</TabsTrigger>
          {deviceTypes && Array.isArray(deviceTypes) && deviceTypes.map((deviceType) => (
            <TabsTrigger key={deviceType.id} value={deviceType.id.toString()}>
              {deviceType.name}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={activeTab} className="mt-0">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : filteredGroups && filteredGroups.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredGroups.map((group) => (
                <Card
                  key={group.id}
                  className={`overflow-hidden cursor-pointer transition-all hover:shadow-md ${
                    !group.active ? "opacity-60" : ""
                  }`}
                  onClick={() => handleGroupClick(group.id)}
                >
                  <CardHeader className="pb-4">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{group.name}</CardTitle>
                      <Badge
                        variant={group.active ? "default" : "outline"}
                        className={group.active ? "bg-green-100 text-green-800 hover:bg-green-100" : ""}
                      >
                        {group.active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <CardDescription className="flex items-center text-xs">
                      {getDeviceTypeName(group.deviceTypeId)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="flex space-x-4">
                      <div className="flex-shrink-0">
                        {getGroupIcon(group)}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-600 line-clamp-3">
                          {group.statement || "No description provided."}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-2 flex justify-between items-center">
                    <span className="text-xs text-gray-500">
                      {/* Will be replaced with actual question count when available */}
                      {Math.floor(Math.random() * 10) + 1} questions
                    </span>
                    <Button variant="ghost" size="sm" className="p-0">
                      <ChevronRight className="h-5 w-5" />
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border rounded-md bg-gray-50">
              <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-lg font-medium text-gray-900">
                No question groups found
              </h3>
              <p className="mt-1 text-gray-500">
                {searchQuery
                  ? "No results match your search criteria."
                  : activeTab !== "all"
                  ? `No question groups for ${
                      activeTab === "general" ? "general" : "this device type"
                    }.`
                  : "Get started by creating a new question group."}
              </p>
              <div className="mt-6">
                <Button onClick={handleCreateGroup}>
                  <Plus className="mr-2 h-4 w-4" /> Create Group
                </Button>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}