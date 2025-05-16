import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { LoaderCircle, Save, Copy, ArrowRight } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface Product {
  id: number;
  title: string;
  description?: string;
  slug: string;
}

interface QuestionGroup {
  id: number;
  name: string;
  description?: string;
}

interface ProductQuestionMapping {
  id: number;
  productId: number;
  actionType: string;
  groupId: number;
  overrides?: Record<string, any> | null;
  createdAt: string;
  updatedAt: string;
  groupName?: string;
  groupIcon?: string | null;
}

const formSchema = z.object({
  productId: z.string().min(1, "Please select a product"),
  actionType: z.string().min(1, "Please select an action type"),
  groupId: z.string().min(1, "Please select a question group")
});

export default function AdminProductMapping() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [currentTab, setCurrentTab] = useState("add");
  const [selectedSourceProduct, setSelectedSourceProduct] = useState<string>("");
  const [selectedTargetProduct, setSelectedTargetProduct] = useState<string>("");
  const [selectedMappings, setSelectedMappings] = useState<number[]>([]);
  const [isCopying, setIsCopying] = useState(false);

  // Fetch products from API
  const { data: products, isLoading: isLoadingProducts } = useQuery({
    queryKey: ["/api/products"],
    retry: false
  });

  // Fetch question groups from API
  const { data: questionGroups, isLoading: isLoadingGroups } = useQuery({
    queryKey: ["/api/question-groups"],
    retry: false
  });

  // Form for adding new mappings
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      productId: "",
      actionType: "",
      groupId: ""
    }
  });

  // Fetch product question mappings when source product changes
  const { data: productMappings, isLoading: isLoadingMappings } = useQuery({
    queryKey: ["/api/product-question-mappings", selectedSourceProduct],
    queryFn: async () => {
      if (!selectedSourceProduct) return [];
      const response = await fetch(`/api/product-question-mappings?product_id=${selectedSourceProduct}`);
      if (!response.ok) {
        throw new Error("Failed to fetch product question mappings");
      }
      return response.json();
    },
    enabled: !!selectedSourceProduct,
    retry: false
  });

  // Handle form submission for adding new mapping
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const response = await apiRequest("POST", "/api/product-question-mappings", {
        productId: parseInt(values.productId),
        actionType: values.actionType,
        groupId: parseInt(values.groupId)
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Product-Question mapping created successfully",
        });
        form.reset();
        queryClient.invalidateQueries({ queryKey: ["/api/product-question-mappings"] });
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.message || "Failed to create mapping",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  // Handle copying mappings between products
  const handleCopyMappings = async () => {
    if (!selectedSourceProduct || !selectedTargetProduct) {
      toast({
        title: "Error",
        description: "Please select both source and target products",
        variant: "destructive",
      });
      return;
    }

    if (selectedMappings.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one mapping to copy",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsCopying(true);
      
      // Filter the mappings to only include the selected ones
      const mappingsToSend = productMappings.filter(
        (mapping: ProductQuestionMapping) => selectedMappings.includes(mapping.id)
      );

      const response = await apiRequest("POST", "/api/product-question-mappings/copy", {
        sourceProductId: parseInt(selectedSourceProduct),
        targetProductId: parseInt(selectedTargetProduct),
        mappings: mappingsToSend
      });

      if (response.ok) {
        const result = await response.json();
        toast({
          title: "Success",
          description: result.message || "Mappings copied successfully",
        });
        setSelectedMappings([]);
        queryClient.invalidateQueries({ queryKey: ["/api/product-question-mappings"] });
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.message || "Failed to copy mappings",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsCopying(false);
    }
  };

  // Toggle a mapping selection
  const toggleMapping = (mappingId: number) => {
    setSelectedMappings(prev => 
      prev.includes(mappingId) 
        ? prev.filter(id => id !== mappingId) 
        : [...prev, mappingId]
    );
  };

  // Get question group name by ID
  const getGroupName = (groupId: number) => {
    if (!questionGroups) return "Loading...";
    const group = questionGroups.find((g: QuestionGroup) => g.id === groupId);
    return group ? group.name : "Unknown Group";
  };

  // Get product name by ID
  const getProductName = (productId: number) => {
    if (!products) return "Loading...";
    const product = products.find((p: Product) => p.id === productId);
    return product ? product.title : "Unknown Product";
  };

  return (
    <AdminLayout>
      <div className="container mx-auto py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Product-Question Mappings</h1>
        </div>

        <Tabs value={currentTab} onValueChange={setCurrentTab}>
          <TabsList>
            <TabsTrigger value="add">Add New Mapping</TabsTrigger>
            <TabsTrigger value="copy">Copy Mappings Between Products</TabsTrigger>
          </TabsList>

          <TabsContent value="add" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Add New Product-Question Mapping</CardTitle>
                <CardDescription>
                  Create a new mapping between a product and question group
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="productId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Product</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              disabled={isLoadingProducts}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a product" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {products?.map((product: Product) => (
                                  <SelectItem key={product.id} value={product.id.toString()}>
                                    {product.title}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="actionType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Action Type</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select action type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="sell">Sell</SelectItem>
                                <SelectItem value="trade-in">Trade-in</SelectItem>
                                <SelectItem value="recycle">Recycle</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="groupId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Question Group</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              disabled={isLoadingGroups}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a question group" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {questionGroups?.map((group: QuestionGroup) => (
                                  <SelectItem key={group.id} value={group.id.toString()}>
                                    {group.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* No active field required */}
                    </div>

                    <Button type="submit" disabled={form.formState.isSubmitting} className="mt-4">
                      {form.formState.isSubmitting ? (
                        <>
                          <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Save Mapping
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="copy" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Copy Mappings Between Products</CardTitle>
                <CardDescription>
                  Copy question mappings from one product to another
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                  <div>
                    <FormLabel>Source Product</FormLabel>
                    <Select
                      onValueChange={setSelectedSourceProduct}
                      value={selectedSourceProduct}
                      disabled={isLoadingProducts}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select source product" />
                      </SelectTrigger>
                      <SelectContent>
                        {products?.map((product: Product) => (
                          <SelectItem key={product.id} value={product.id.toString()}>
                            {product.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-center">
                    <ArrowRight className="h-6 w-6 text-gray-400" />
                  </div>

                  <div>
                    <FormLabel>Target Product</FormLabel>
                    <Select
                      onValueChange={setSelectedTargetProduct}
                      value={selectedTargetProduct}
                      disabled={isLoadingProducts}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select target product" />
                      </SelectTrigger>
                      <SelectContent>
                        {products?.map((product: Product) => (
                          <SelectItem key={product.id} value={product.id.toString()}>
                            {product.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {selectedSourceProduct && (
                  <>
                    <div className="mb-4">
                      <h3 className="text-lg font-medium mb-2">Available Mappings</h3>
                      <p className="text-sm text-gray-500 mb-4">
                        Select the mappings you want to copy to the target product
                      </p>
                      
                      {isLoadingMappings ? (
                        <div className="flex justify-center py-8">
                          <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
                        </div>
                      ) : productMappings?.length > 0 ? (
                        <ScrollArea className="h-[300px] rounded-md border p-4">
                          {productMappings.map((mapping: ProductQuestionMapping) => (
                            <div key={mapping.id} className="mb-4">
                              <div className="flex items-start space-x-3">
                                <Checkbox
                                  id={`mapping-${mapping.id}`}
                                  checked={selectedMappings.includes(mapping.id)}
                                  onCheckedChange={() => toggleMapping(mapping.id)}
                                />
                                <div>
                                  <label
                                    htmlFor={`mapping-${mapping.id}`}
                                    className="text-sm font-medium cursor-pointer"
                                  >
                                    {getGroupName(mapping.groupId)}
                                  </label>
                                  <p className="text-xs text-gray-500">
                                    Action: <span className="font-medium">{mapping.actionType}</span>
                                  </p>
                                </div>
                              </div>
                              <Separator className="my-2" />
                            </div>
                          ))}
                        </ScrollArea>
                      ) : (
                        <p className="text-center py-8 text-gray-500">
                          No mappings found for the selected product
                        </p>
                      )}
                    </div>

                    <Button
                      onClick={handleCopyMappings}
                      disabled={
                        isCopying ||
                        !selectedSourceProduct ||
                        !selectedTargetProduct ||
                        selectedMappings.length === 0
                      }
                      className="w-full"
                    >
                      {isCopying ? (
                        <>
                          <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                          Copying...
                        </>
                      ) : (
                        <>
                          <Copy className="mr-2 h-4 w-4" />
                          Copy Selected Mappings
                        </>
                      )}
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}