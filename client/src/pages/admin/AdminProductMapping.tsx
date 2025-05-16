import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowRight,
  Check,
  ChevronsUpDown,
  Copy,
  ExternalLink,
  Filter,
  Loader2,
  Search,
  XCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

// Define interfaces for our data
interface Product {
  id: number;
  title: string;
  device_model_id?: number;
  condition?: string;
  price?: number;
  status: string;
}

interface QuestionGroup {
  id: number;
  name: string;
  statement?: string;
  deviceTypeId?: number;
  active: boolean;
}

interface ProductQuestionMapping {
  id: number;
  productId: number;
  groupId: number;
  actionType: string;
  active: boolean;
  overrides?: any;
  createdAt: string;
  updatedAt: string;
  groupName?: string;
  groupIcon?: string;
}

interface DeviceType {
  id: number;
  name: string;
}

export default function AdminProductMapping() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // State for source and target selection
  const [sourceProductId, setSourceProductId] = useState<string>("");
  const [targetProductId, setTargetProductId] = useState<string>("");
  const [actionType, setActionType] = useState<string>("sell");
  
  // State for filter and search
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [deviceTypeFilter, setDeviceTypeFilter] = useState<string>("");
  
  // State for mapping selection
  const [selectedMappings, setSelectedMappings] = useState<number[]>([]);
  const [overrides, setOverrides] = useState<Record<number, any>>({});
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Fetch products
  const { data: products, isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  // Fetch device types
  const { data: deviceTypes, isLoading: deviceTypesLoading } = useQuery<DeviceType[]>({
    queryKey: ["/api/device-types"],
  });

  // Fetch question groups for the dropdown
  const { data: questionGroups, isLoading: questionGroupsLoading } = useQuery<QuestionGroup[]>({
    queryKey: ["/api/question-groups"],
  });

  // Fetch existing mappings for source product when selected
  const { 
    data: sourceMappings, 
    isLoading: sourceMappingsLoading,
    refetch: refetchSourceMappings
  } = useQuery<ProductQuestionMapping[]>({
    queryKey: ["/api/product-question-mappings", sourceProductId],
    queryFn: async () => {
      if (!sourceProductId) return [];
      const response = await fetch(`/api/product-question-mappings?product_id=${sourceProductId}`);
      if (!response.ok) throw new Error("Failed to fetch mappings");
      return response.json();
    },
    enabled: !!sourceProductId,
  });

  // Fetch existing mappings for target product when selected
  const { 
    data: targetMappings, 
    isLoading: targetMappingsLoading 
  } = useQuery<ProductQuestionMapping[]>({
    queryKey: ["/api/product-question-mappings", targetProductId],
    queryFn: async () => {
      if (!targetProductId) return [];
      const response = await fetch(`/api/product-question-mappings?product_id=${targetProductId}`);
      if (!response.ok) throw new Error("Failed to fetch mappings");
      return response.json();
    },
    enabled: !!targetProductId,
  });

  // Mutation for copying mappings
  const copyMappingsMutation = useMutation({
    mutationFn: async (mappingsToCopy: any[]) => {
      return apiRequest("POST", "/api/product-question-mappings/copy", {
        sourceProductId: parseInt(sourceProductId),
        targetProductId: parseInt(targetProductId),
        mappings: mappingsToCopy,
        overrides
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/product-question-mappings"] });
      toast({
        title: "Questionnaires copied successfully",
        description: "The selected questionnaires have been copied to the target product",
      });
      setSelectedMappings([]);
      setOverrides({});
      setIsProcessing(false);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to copy questionnaires",
        description: error.message || "An error occurred while copying the questionnaires",
        variant: "destructive",
      });
      setIsProcessing(false);
    }
  });

  // Handler for copying selected mappings
  const handleCopyMappings = async () => {
    if (!sourceProductId || !targetProductId) {
      toast({
        title: "Source and target products required",
        description: "Please select both source and target products",
        variant: "destructive",
      });
      return;
    }

    if (selectedMappings.length === 0) {
      toast({
        title: "No questionnaires selected",
        description: "Please select at least one questionnaire to copy",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    // Get the mappings to copy
    const mappingsToCopy = sourceMappings?.filter(
      (mapping) => selectedMappings.includes(mapping.id)
    ) || [];

    // Check for existing mappings in target that might conflict
    const conflicts = targetMappings?.filter(
      (targetMapping) => 
        mappingsToCopy.some(
          (sourceMapping) => 
            sourceMapping.groupId === targetMapping.groupId && 
            sourceMapping.actionType === targetMapping.actionType
        )
    ) || [];

    if (conflicts.length > 0) {
      const proceed = window.confirm(
        `${conflicts.length} questionnaires already exist for the target product. Proceeding will update them with the source product's settings. Continue?`
      );
      
      if (!proceed) {
        setIsProcessing(false);
        return;
      }
    }

    // Process the copy operation
    try {
      await copyMappingsMutation.mutateAsync(mappingsToCopy);
    } catch (error) {
      console.error("Error copying mappings:", error);
    }
  };

  // Handler for selecting/deselecting all mappings
  const handleSelectAll = (checked: boolean) => {
    if (checked && sourceMappings) {
      setSelectedMappings(sourceMappings.map(m => m.id));
    } else {
      setSelectedMappings([]);
    }
  };

  // Handler for toggling a single mapping selection
  const handleToggleMapping = (mappingId: number) => {
    if (selectedMappings.includes(mappingId)) {
      setSelectedMappings(selectedMappings.filter(id => id !== mappingId));
    } else {
      setSelectedMappings([...selectedMappings, mappingId]);
    }
  };

  // Filter products based on search query
  const filteredProducts = products?.filter(product => 
    product.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filter source mappings based on the device type filter
  const filteredSourceMappings = sourceMappings?.filter(mapping => {
    // Find the corresponding group
    const group = questionGroups?.find(g => g.id === mapping.groupId);
    
    // Apply device type filter if set
    if (deviceTypeFilter && group?.deviceTypeId) {
      return group.deviceTypeId.toString() === deviceTypeFilter;
    }
    
    return true;
  });

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Product Questionnaire Mapping</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Copy Questionnaires Between Products</CardTitle>
          <CardDescription>
            Select source and target products, then choose which questionnaires to copy
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Source Product */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="sourceProduct">Source Product</Label>
                <div className="flex w-full max-w-sm items-center space-x-2">
                  <Input 
                    placeholder="Search products..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              <Select value={sourceProductId} onValueChange={setSourceProductId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select source product" />
                </SelectTrigger>
                <SelectContent className="max-h-96">
                  {filteredProducts?.map((product) => (
                    <SelectItem key={product.id} value={product.id.toString()}>
                      {product.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Target Product */}
            <div className="space-y-4">
              <Label htmlFor="targetProduct">Target Product</Label>
              <Select value={targetProductId} onValueChange={setTargetProductId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select target product" />
                </SelectTrigger>
                <SelectContent className="max-h-96">
                  {filteredProducts?.map((product) => (
                    <SelectItem 
                      key={product.id} 
                      value={product.id.toString()}
                      disabled={product.id.toString() === sourceProductId}
                    >
                      {product.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <Separator className="my-6" />
          
          {/* Action Type Selection */}
          <div className="space-y-4">
            <Label>Action Type</Label>
            <div className="flex space-x-4">
              <Button 
                variant={actionType === "sell" ? "default" : "outline"}
                onClick={() => setActionType("sell")}
              >
                Sell
              </Button>
              <Button 
                variant={actionType === "trade-in" ? "default" : "outline"}
                onClick={() => setActionType("trade-in")}
              >
                Trade-in
              </Button>
              <Button 
                variant={actionType === "recycle" ? "default" : "outline"}
                onClick={() => setActionType("recycle")}
              >
                Recycle
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Source Questionnaires List */}
      {sourceProductId && (
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle>Source Product Questionnaires</CardTitle>
            <CardDescription>
              Select the questionnaires you want to copy to the target product
            </CardDescription>
            <div className="flex justify-between items-center mt-2">
              <div className="flex items-center space-x-2">
                <Label htmlFor="deviceTypeFilter">Filter by Device Type:</Label>
                <Select value={deviceTypeFilter} onValueChange={setDeviceTypeFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="All Device Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Device Types</SelectItem>
                    {deviceTypes?.map((type) => (
                      <SelectItem key={type.id} value={type.id.toString()}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => refetchSourceMappings()}
              >
                Refresh
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {sourceMappingsLoading ? (
              <div className="flex justify-center p-6">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredSourceMappings && filteredSourceMappings.length > 0 ? (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox 
                          checked={selectedMappings.length === filteredSourceMappings.length}
                          onCheckedChange={handleSelectAll}
                        />
                      </TableHead>
                      <TableHead>Questionnaire Group</TableHead>
                      <TableHead>Action Type</TableHead>
                      <TableHead>Device Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Overrides</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSourceMappings.map((mapping) => {
                      const group = questionGroups?.find(g => g.id === mapping.groupId);
                      const deviceType = deviceTypes?.find(dt => dt.id === group?.deviceTypeId);
                      
                      return (
                        <TableRow key={mapping.id}>
                          <TableCell>
                            <Checkbox 
                              checked={selectedMappings.includes(mapping.id)}
                              onCheckedChange={() => handleToggleMapping(mapping.id)}
                            />
                          </TableCell>
                          <TableCell className="font-medium">
                            {mapping.groupName || group?.name || "Unknown Group"}
                          </TableCell>
                          <TableCell>{mapping.actionType}</TableCell>
                          <TableCell>{deviceType?.name || "Generic"}</TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded-full text-xs ${mapping.active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>
                              {mapping.active ? "Active" : "Inactive"}
                            </span>
                          </TableCell>
                          <TableCell>
                            {selectedMappings.includes(mapping.id) && (
                              <div className="flex items-center space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    const currentOverrides = overrides[mapping.id] || {};
                                    const newMaxPrice = prompt("Enter max price override (or leave empty for no override):", 
                                      currentOverrides.maxPrice?.toString() || "");
                                    
                                    if (newMaxPrice !== null) {
                                      setOverrides({
                                        ...overrides,
                                        [mapping.id]: {
                                          ...currentOverrides,
                                          maxPrice: newMaxPrice ? parseFloat(newMaxPrice) : null
                                        }
                                      });
                                    }
                                  }}
                                >
                                  Set Max Price
                                </Button>
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center p-6 border rounded-md">
                <p className="text-muted-foreground">
                  {sourceProductId 
                    ? "No questionnaires found for this product" 
                    : "Select a source product to view questionnaires"}
                </p>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => {
                setSelectedMappings([]);
                setOverrides({});
              }}
            >
              Clear Selection
            </Button>
            <Button
              onClick={handleCopyMappings}
              disabled={
                !sourceProductId || 
                !targetProductId || 
                selectedMappings.length === 0 ||
                isProcessing
              }
              className="flex items-center space-x-2"
            >
              {isProcessing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
              <span>Copy Selected Questionnaires</span>
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}