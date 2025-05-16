import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { LoaderCircle, Save, ArrowRight } from "lucide-react";
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
  questionId: number;
  overrides?: Record<string, any> | null;
  createdAt: string;
  updatedAt: string;
  questionText?: string;
}

const formSchema = z.object({
  productId: z.string().min(1, "Please select a product"),
  questionId: z.string().min(1, "Please select a question")
});

// Also create a form schema for the copy form
const copyFormSchema = z.object({
  sourceProductId: z.string().min(1, "Please select a source product"),
  targetProductId: z.string().min(1, "Please select a target product")
});

export default function AdminProductMapping() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [currentTab, setCurrentTab] = useState("add");
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
  
  // Fetch questions from API
  const { data: questions, isLoading: isLoadingQuestions } = useQuery({
    queryKey: ["/api/questions"],
    retry: false
  });

  // Form for adding new mappings
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      productId: "",
      actionType: "",
      questionId: ""
    }
  });

  // Form for copying mappings
  const copyForm = useForm<z.infer<typeof copyFormSchema>>({
    resolver: zodResolver(copyFormSchema),
    defaultValues: {
      sourceProductId: "",
      targetProductId: ""
    }
  });

  // Get source product ID from copy form
  const sourceProductId = copyForm.watch("sourceProductId");

  // Fetch product question mappings when source product changes
  const { data: productMappings, isLoading: isLoadingMappings } = useQuery({
    queryKey: ["/api/product-question-mappings", sourceProductId],
    queryFn: async () => {
      if (!sourceProductId) return [];
      const response = await fetch(`/api/product-question-mappings?product_id=${sourceProductId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch product question mappings");
      }
      return response.json();
    },
    enabled: !!sourceProductId,
    retry: false
  });

  // Handle form submission for adding new mapping
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const response = await apiRequest("POST", "/api/product-question-mappings", {
        productId: parseInt(values.productId),
        questionId: parseInt(values.questionId),
        actionType: values.actionType
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

      const formValues = copyForm.getValues();

      const response = await apiRequest("POST", "/api/product-question-mappings/copy", {
        sourceProductId: parseInt(formValues.sourceProductId),
        targetProductId: parseInt(formValues.targetProductId),
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

  // Get question text by ID
  const getQuestionText = (questionId: number) => {
    if (!questions) return "Loading...";
    const question = questions.find((q: any) => q.id === questionId);
    return question ? question.questionText : "Unknown Question";
  };

  // Get product name by ID
  const getProductName = (productId: number) => {
    if (!products) return "Loading...";
    const product = products.find((p: Product) => p.id === productId);
    return product ? product.title : "Unknown Product";
  };

  return (
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
                        name="questionId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Question</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              disabled={isLoadingQuestions}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a question" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {questions?.map((question: any) => (
                                  <SelectItem key={question.id} value={question.id.toString()}>
                                    {question.questionText}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
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
                <Form {...copyForm}>
                  <form className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                      <FormField
                        control={copyForm.control}
                        name="sourceProductId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Source Product</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              disabled={isLoadingProducts}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select source product" />
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

                      <div className="flex items-center justify-center">
                        <ArrowRight className="h-6 w-6 text-gray-400" />
                      </div>

                      <FormField
                        control={copyForm.control}
                        name="targetProductId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Target Product</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              disabled={isLoadingProducts}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select target product" />
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
                    </div>
                  </form>
                </Form>

                {sourceProductId && (
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
                                    {getQuestionText(mapping.questionId)}
                                  </label>
                                  <p className="text-xs text-gray-500 mt-1">
                                    Action: {mapping.actionType}
                                  </p>
                                </div>
                              </div>
                              <Separator className="my-2" />
                            </div>
                          ))}
                        </ScrollArea>
                      ) : (
                        <div className="text-center py-8 border rounded-md bg-gray-50">
                          <p className="text-gray-500">No mappings found for this product</p>
                        </div>
                      )}
                    </div>

                    <Button 
                      onClick={handleCopyMappings} 
                      disabled={isCopying || selectedMappings.length === 0 || !copyForm.watch("targetProductId")}
                      className="mt-4"
                    >
                      {isCopying ? (
                        <>
                          <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                          Copying...
                        </>
                      ) : (
                        <>
                          <ArrowRight className="mr-2 h-4 w-4" />
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
  );
}