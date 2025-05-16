import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Plus, Edit, Trash2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

// Import our Indian data service functions
import {
  getStates,
  getCities,
  getPostalCodes,
  getStateByCode
} from "@/lib/indianDataService";

import { queryClient } from "@/lib/queryClient";

const IndianLocationManager = () => {
  const [activeTab, setActiveTab] = useState("states");
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [selectedCity, setSelectedCity] = useState<number | null>(null);
  const [openStateDialog, setOpenStateDialog] = useState(false);
  const [openCityDialog, setOpenCityDialog] = useState(false);
  const [openPostalDialog, setOpenPostalDialog] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  
  const { toast } = useToast();

  // State form schema
  const stateFormSchema = z.object({
    code: z.string().min(2).max(3),
    name: z.string().min(2).max(100),
    active: z.boolean().default(true)
  });

  // City form schema
  const cityFormSchema = z.object({
    name: z.string().min(2).max(100),
    stateCode: z.string().min(2),
    active: z.boolean().default(true)
  });

  // Postal code form schema
  const postalCodeFormSchema = z.object({
    code: z.string().min(6).max(6),
    cityId: z.number().min(1),
    stateCode: z.string().min(2),
    area: z.string().min(2).max(100),
    active: z.boolean().default(true)
  });

  // Form hooks
  const stateForm = useForm<z.infer<typeof stateFormSchema>>({
    resolver: zodResolver(stateFormSchema),
    defaultValues: {
      code: "",
      name: "",
      active: true
    }
  });

  const cityForm = useForm<z.infer<typeof cityFormSchema>>({
    resolver: zodResolver(cityFormSchema),
    defaultValues: {
      name: "",
      stateCode: "",
      active: true
    }
  });

  const postalCodeForm = useForm<z.infer<typeof postalCodeFormSchema>>({
    resolver: zodResolver(postalCodeFormSchema),
    defaultValues: {
      code: "",
      cityId: 0,
      stateCode: "",
      area: "",
      active: true
    }
  });

  // Queries
  const statesQuery = useQuery({
    queryKey: ["/api/indian/states"],
    queryFn: getStates
  });

  const citiesQuery = useQuery({
    queryKey: ["/api/indian/cities", selectedState],
    queryFn: () => getCities(selectedState || undefined),
    enabled: !!selectedState
  });

  const postalCodesQuery = useQuery({
    queryKey: ["/api/indian/postal-codes", selectedState, selectedCity],
    queryFn: () => getPostalCodes(selectedState || undefined, selectedCity || undefined),
    enabled: !!selectedState || !!selectedCity
  });

  // Mutations
  const createStateMutation = useMutation({
    mutationFn: async (data: z.infer<typeof stateFormSchema>) => {
      const response = await apiRequest("POST", "/api/indian/states", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "State created successfully",
      });
      setOpenStateDialog(false);
      stateForm.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/indian/states"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create state",
        variant: "destructive"
      });
    }
  });

  const updateStateMutation = useMutation({
    mutationFn: async ({ code, data }: { code: string, data: Partial<z.infer<typeof stateFormSchema>> }) => {
      const response = await apiRequest("PATCH", `/api/indian/states/${code}`, data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "State updated successfully",
      });
      setOpenStateDialog(false);
      stateForm.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/indian/states"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update state",
        variant: "destructive"
      });
    }
  });

  const createCityMutation = useMutation({
    mutationFn: async (data: z.infer<typeof cityFormSchema>) => {
      const response = await apiRequest("POST", "/api/indian/cities", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "City created successfully",
      });
      setOpenCityDialog(false);
      cityForm.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/indian/cities"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create city",
        variant: "destructive"
      });
    }
  });

  const updateCityMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: Partial<z.infer<typeof cityFormSchema>> }) => {
      const response = await apiRequest("PATCH", `/api/indian/cities/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "City updated successfully",
      });
      setOpenCityDialog(false);
      cityForm.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/indian/cities"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update city",
        variant: "destructive"
      });
    }
  });

  const createPostalCodeMutation = useMutation({
    mutationFn: async (data: z.infer<typeof postalCodeFormSchema>) => {
      const response = await apiRequest("POST", "/api/indian/postal-codes", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Postal code created successfully",
      });
      setOpenPostalDialog(false);
      postalCodeForm.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/indian/postal-codes"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create postal code",
        variant: "destructive"
      });
    }
  });

  const updatePostalCodeMutation = useMutation({
    mutationFn: async ({ code, data }: { code: string, data: Partial<z.infer<typeof postalCodeFormSchema>> }) => {
      const response = await apiRequest("PATCH", `/api/indian/postal-codes/${code}`, data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Postal code updated successfully",
      });
      setOpenPostalDialog(false);
      postalCodeForm.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/indian/postal-codes"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update postal code",
        variant: "destructive"
      });
    }
  });

  // Form submit handlers
  const onStateSubmit = (data: z.infer<typeof stateFormSchema>) => {
    if (isEditMode && editItem) {
      updateStateMutation.mutate({ code: editItem.code, data });
    } else {
      createStateMutation.mutate(data);
    }
  };

  const onCitySubmit = (data: z.infer<typeof cityFormSchema>) => {
    if (isEditMode && editItem) {
      updateCityMutation.mutate({ id: editItem.id, data });
    } else {
      createCityMutation.mutate(data);
    }
  };

  const onPostalCodeSubmit = (data: z.infer<typeof postalCodeFormSchema>) => {
    if (isEditMode && editItem) {
      updatePostalCodeMutation.mutate({ code: editItem.code, data });
    } else {
      createPostalCodeMutation.mutate(data);
    }
  };

  // Helpers to open dialogs in edit mode
  const editState = (state: any) => {
    setIsEditMode(true);
    setEditItem(state);
    stateForm.reset({
      code: state.code,
      name: state.name,
      active: state.active
    });
    setOpenStateDialog(true);
  };

  const editCity = (city: any) => {
    setIsEditMode(true);
    setEditItem(city);
    cityForm.reset({
      name: city.name,
      stateCode: city.stateCode,
      active: city.active
    });
    setOpenCityDialog(true);
  };

  const editPostalCode = (postalCode: any) => {
    setIsEditMode(true);
    setEditItem(postalCode);
    postalCodeForm.reset({
      code: postalCode.code,
      cityId: postalCode.cityId,
      stateCode: postalCode.stateCode,
      area: postalCode.area,
      active: postalCode.active
    });
    setOpenPostalDialog(true);
  };

  // Helper to open dialogs in create mode
  const openCreateStateDialog = () => {
    setIsEditMode(false);
    setEditItem(null);
    stateForm.reset();
    setOpenStateDialog(true);
  };

  const openCreateCityDialog = () => {
    setIsEditMode(false);
    setEditItem(null);
    cityForm.reset({
      ...cityForm.getValues(),
      stateCode: selectedState || ""
    });
    setOpenCityDialog(true);
  };

  const openCreatePostalDialog = () => {
    setIsEditMode(false);
    setEditItem(null);
    postalCodeForm.reset({
      ...postalCodeForm.getValues(),
      stateCode: selectedState || "",
      cityId: selectedCity || 0
    });
    setOpenPostalDialog(true);
  };

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Indian Location Manager</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="states">States</TabsTrigger>
          <TabsTrigger value="cities">Cities</TabsTrigger>
          <TabsTrigger value="postalCodes">Postal Codes</TabsTrigger>
        </TabsList>
        
        <TabsContent value="states">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Indian States</CardTitle>
                  <CardDescription>Manage the states of India for your application.</CardDescription>
                </div>
                <Button onClick={openCreateStateDialog}>
                  <Plus className="mr-2 h-4 w-4" /> Add State
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {statesQuery.isLoading ? (
                <div className="flex justify-center p-4">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : statesQuery.isError ? (
                <div className="text-center p-4 text-red-500">
                  Error loading states: {(statesQuery.error as any)?.message || "Unknown error"}
                </div>
              ) : (
                <Table>
                  <TableCaption>List of Indian states configured in the system.</TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Code</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {statesQuery.data?.map((state: any) => (
                      <TableRow key={state.code}>
                        <TableCell>{state.code}</TableCell>
                        <TableCell>{state.name}</TableCell>
                        <TableCell>{state.active ? "Active" : "Inactive"}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" onClick={() => editState(state)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {statesQuery.data?.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center">No states found. Add one to get started.</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="cities">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Indian Cities</CardTitle>
                  <CardDescription>Manage the cities of India for your application.</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Select value={selectedState || ""} onValueChange={setSelectedState}>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Select a state" />
                    </SelectTrigger>
                    <SelectContent>
                      {statesQuery.data?.map((state: any) => (
                        <SelectItem key={state.code} value={state.code}>{state.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button onClick={openCreateCityDialog} disabled={!selectedState}>
                    <Plus className="mr-2 h-4 w-4" /> Add City
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {!selectedState ? (
                <div className="text-center p-4 text-gray-500">
                  Please select a state to view its cities
                </div>
              ) : citiesQuery.isLoading ? (
                <div className="flex justify-center p-4">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : citiesQuery.isError ? (
                <div className="text-center p-4 text-red-500">
                  Error loading cities: {(citiesQuery.error as any)?.message || "Unknown error"}
                </div>
              ) : (
                <Table>
                  <TableCaption>List of cities in the selected state.</TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>State</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {citiesQuery.data?.map((city: any) => (
                      <TableRow key={city.id}>
                        <TableCell>{city.id}</TableCell>
                        <TableCell>{city.name}</TableCell>
                        <TableCell>{city.stateCode}</TableCell>
                        <TableCell>{city.active ? "Active" : "Inactive"}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" onClick={() => editCity(city)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {citiesQuery.data?.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center">No cities found for this state. Add one to get started.</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="postalCodes">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Postal Codes</CardTitle>
                  <CardDescription>Manage postal codes (PIN codes) of India for your application.</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Select value={selectedState || ""} onValueChange={(value) => {
                    setSelectedState(value);
                    setSelectedCity(null);
                  }}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select a state" />
                    </SelectTrigger>
                    <SelectContent>
                      {statesQuery.data?.map((state: any) => (
                        <SelectItem key={state.code} value={state.code}>{state.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Select 
                    value={selectedCity ? selectedCity.toString() : ""} 
                    onValueChange={(value) => setSelectedCity(parseInt(value))}
                    disabled={!selectedState || !citiesQuery.data?.length}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select a city" />
                    </SelectTrigger>
                    <SelectContent>
                      {citiesQuery.data?.map((city: any) => (
                        <SelectItem key={city.id} value={city.id.toString()}>{city.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Button onClick={openCreatePostalDialog} disabled={!selectedState || !selectedCity}>
                    <Plus className="mr-2 h-4 w-4" /> Add Postal Code
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {!selectedState && !selectedCity ? (
                <div className="text-center p-4 text-gray-500">
                  Please select a state and city to view postal codes
                </div>
              ) : postalCodesQuery.isLoading ? (
                <div className="flex justify-center p-4">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : postalCodesQuery.isError ? (
                <div className="text-center p-4 text-red-500">
                  Error loading postal codes: {(postalCodesQuery.error as any)?.message || "Unknown error"}
                </div>
              ) : (
                <Table>
                  <TableCaption>List of postal codes in the selected area.</TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Code</TableHead>
                      <TableHead>Area</TableHead>
                      <TableHead>City</TableHead>
                      <TableHead>State</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {postalCodesQuery.data?.map((postal: any) => (
                      <TableRow key={postal.code}>
                        <TableCell>{postal.code}</TableCell>
                        <TableCell>{postal.area}</TableCell>
                        <TableCell>{postal.cityId}</TableCell>
                        <TableCell>{postal.stateCode}</TableCell>
                        <TableCell>{postal.active ? "Active" : "Inactive"}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" onClick={() => editPostalCode(postal)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {postalCodesQuery.data?.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center">No postal codes found for this location. Add one to get started.</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* State Dialog */}
      <Dialog open={openStateDialog} onOpenChange={setOpenStateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isEditMode ? "Edit State" : "Add New State"}</DialogTitle>
            <DialogDescription>
              {isEditMode ? "Update the details of an existing state." : "Add a new state to the system."}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...stateForm}>
            <form onSubmit={stateForm.handleSubmit(onStateSubmit)} className="space-y-4">
              <FormField
                control={stateForm.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State Code</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g. MH for Maharashtra" 
                        {...field} 
                        disabled={isEditMode} // Can't change code once created
                      />
                    </FormControl>
                    <FormDescription>2-3 letter code for the state.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={stateForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Maharashtra" {...field} />
                    </FormControl>
                    <FormDescription>Full name of the state.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={stateForm.control}
                name="active"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center gap-2 space-y-0">
                    <FormControl>
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={field.onChange}
                        className="w-4 h-4"
                      />
                    </FormControl>
                    <FormLabel className="mt-0">Active</FormLabel>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpenStateDialog(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={createStateMutation.isPending || updateStateMutation.isPending}
                >
                  {(createStateMutation.isPending || updateStateMutation.isPending) && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {isEditMode ? "Update State" : "Add State"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* City Dialog */}
      <Dialog open={openCityDialog} onOpenChange={setOpenCityDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isEditMode ? "Edit City" : "Add New City"}</DialogTitle>
            <DialogDescription>
              {isEditMode ? "Update the details of an existing city." : "Add a new city to the system."}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...cityForm}>
            <form onSubmit={cityForm.handleSubmit(onCitySubmit)} className="space-y-4">
              <FormField
                control={cityForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Mumbai" {...field} />
                    </FormControl>
                    <FormDescription>Full name of the city.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={cityForm.control}
                name="stateCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={isEditMode} // Can't change state once created
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select state" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {statesQuery.data?.map((state: any) => (
                          <SelectItem key={state.code} value={state.code}>{state.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>State where this city is located.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={cityForm.control}
                name="active"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center gap-2 space-y-0">
                    <FormControl>
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={field.onChange}
                        className="w-4 h-4"
                      />
                    </FormControl>
                    <FormLabel className="mt-0">Active</FormLabel>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpenCityDialog(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={createCityMutation.isPending || updateCityMutation.isPending}
                >
                  {(createCityMutation.isPending || updateCityMutation.isPending) && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {isEditMode ? "Update City" : "Add City"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Postal Code Dialog */}
      <Dialog open={openPostalDialog} onOpenChange={setOpenPostalDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isEditMode ? "Edit Postal Code" : "Add New Postal Code"}</DialogTitle>
            <DialogDescription>
              {isEditMode ? "Update the details of an existing postal code." : "Add a new postal code to the system."}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...postalCodeForm}>
            <form onSubmit={postalCodeForm.handleSubmit(onPostalCodeSubmit)} className="space-y-4">
              <FormField
                control={postalCodeForm.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>PIN Code</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g. 400001" 
                        {...field} 
                        disabled={isEditMode} // Can't change code once created
                      />
                    </FormControl>
                    <FormDescription>6-digit postal code (PIN code).</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={postalCodeForm.control}
                name="area"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Area</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Colaba" {...field} />
                    </FormControl>
                    <FormDescription>Area or locality name.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={postalCodeForm.control}
                name="stateCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={(value) => {
                        field.onChange(value);
                        // Reset city when state changes
                        postalCodeForm.setValue("cityId", 0);
                      }}
                      disabled={isEditMode} // Can't change state once created
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select state" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {statesQuery.data?.map((state: any) => (
                          <SelectItem key={state.code} value={state.code}>{state.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>State where this postal code is located.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={postalCodeForm.control}
                name="cityId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <Select
                      value={field.value ? field.value.toString() : ""}
                      onValueChange={(value) => field.onChange(parseInt(value))}
                      disabled={isEditMode || !postalCodeForm.watch("stateCode")} // Can't change city once created or if no state selected
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select city" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {citiesQuery.data?.map((city: any) => (
                          <SelectItem key={city.id} value={city.id.toString()}>{city.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>City where this postal code is located.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={postalCodeForm.control}
                name="active"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center gap-2 space-y-0">
                    <FormControl>
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={field.onChange}
                        className="w-4 h-4"
                      />
                    </FormControl>
                    <FormLabel className="mt-0">Active</FormLabel>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpenPostalDialog(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={createPostalCodeMutation.isPending || updatePostalCodeMutation.isPending}
                >
                  {(createPostalCodeMutation.isPending || updatePostalCodeMutation.isPending) && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {isEditMode ? "Update Postal Code" : "Add Postal Code"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default IndianLocationManager;