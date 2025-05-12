import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from '@/hooks/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { apiRequest } from '@/lib/queryClient';
import { 
  Plus, 
  Edit, 
  Trash, 
  Route, 
  Home, 
  Settings, 
  LayoutTemplate, 
  PanelLeft, 
  FileText,
  Globe,
  Link as LinkIcon
} from 'lucide-react';

// Define the Route interface
interface RouteConfig {
  id: number;
  path: string;
  title: string;
  description: string;
  seoTitle: string;
  seoDescription: string;
  active: boolean;
  layout: 'main' | 'admin' | 'auth' | 'blank';
  componentPath: string;
  createdAt: string;
  updatedAt: string;
}

// Define the Section interface
interface HomeSection {
  id: number;
  name: string;
  title: string;
  subtitle: string;
  content: string;
  active: boolean;
  order: number;
  settings: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

// Define the form schema for routes
const routeFormSchema = z.object({
  path: z.string().min(1, { message: "Path is required" }),
  title: z.string().min(1, { message: "Title is required" }),
  description: z.string().optional(),
  seoTitle: z.string().min(1, { message: "SEO title is required" }),
  seoDescription: z.string().min(1, { message: "SEO description is required" }),
  active: z.boolean().default(true),
  layout: z.enum(['main', 'admin', 'auth', 'blank']),
  componentPath: z.string().min(1, { message: "Component path is required" }),
});

// Define the form schema for home sections
const homeSectionFormSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  title: z.string().min(1, { message: "Title is required" }),
  subtitle: z.string().optional(),
  content: z.string().optional(),
  active: z.boolean().default(true),
  order: z.number().int().min(0),
  settings: z.any().optional(),
});

const RouteManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState("routes");
  const [isAddRouteDialogOpen, setIsAddRouteDialogOpen] = useState(false);
  const [isEditRouteDialogOpen, setIsEditRouteDialogOpen] = useState(false);
  const [isAddSectionDialogOpen, setIsAddSectionDialogOpen] = useState(false);
  const [isEditSectionDialogOpen, setIsEditSectionDialogOpen] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<RouteConfig | null>(null);
  const [selectedSection, setSelectedSection] = useState<HomeSection | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query to fetch all routes
  const { 
    data: routes, 
    isLoading: routesLoading, 
    error: routesError 
  } = useQuery({
    queryKey: ['/api/routes'],
    queryFn: async () => {
      try {
        const response = await apiRequest('GET', '/api/routes');
        if (!response.ok) {
          throw new Error('Failed to fetch routes');
        }
        return await response.json();
      } catch (error) {
        // If API isn't implemented yet, return mock data
        return [
          { 
            id: 1, 
            path: "/", 
            title: "Home",
            description: "Main landing page",
            seoTitle: "GadgetSwap - Trade In or Buy Refurbished Devices",
            seoDescription: "Get the best value for your old device or find great deals on certified refurbished products",
            active: true,
            layout: "main",
            componentPath: "pages/HomePage",
            createdAt: '2023-01-01',
            updatedAt: '2023-01-01',
          },
          { 
            id: 2, 
            path: "/about", 
            title: "About Us",
            description: "About our company",
            seoTitle: "About GadgetSwap | Our Mission & Values",
            seoDescription: "Learn about our mission to reduce e-waste and provide affordable tech through our buyback and refurbished device programs.",
            active: true,
            layout: "main",
            componentPath: "pages/AboutPage",
            createdAt: '2023-01-01',
            updatedAt: '2023-01-01',
          },
        ];
      }
    },
  });

  // Query to fetch all home sections
  const { 
    data: sections, 
    isLoading: sectionsLoading, 
    error: sectionsError 
  } = useQuery({
    queryKey: ['/api/home-sections'],
    queryFn: async () => {
      try {
        const response = await apiRequest('GET', '/api/home-sections');
        if (!response.ok) {
          throw new Error('Failed to fetch home sections');
        }
        return await response.json();
      } catch (error) {
        // If API isn't implemented yet, return mock data
        return [
          { 
            id: 1, 
            name: "hero", 
            title: "Trade in or buy refurbished devices",
            subtitle: "Get the best value for your old device or find great deals on certified refurbished products",
            content: "",
            active: true,
            order: 1,
            settings: {},
            createdAt: '2023-01-01',
            updatedAt: '2023-01-01',
          },
          { 
            id: 2, 
            name: "howItWorks", 
            title: "How It Works",
            subtitle: "Simple process to trade in your device or buy a refurbished one",
            content: JSON.stringify({
              steps: [
                { title: "Select Your Device", description: "Choose your device type, brand, and model" },
                { title: "Get an Instant Quote", description: "Answer a few questions and receive an instant value estimate" },
                { title: "Get Paid Fast", description: "Ship your device or schedule a pickup and get paid quickly" }
              ]
            }),
            active: true,
            order: 2,
            settings: {},
            createdAt: '2023-01-01',
            updatedAt: '2023-01-01',
          },
          { 
            id: 3, 
            name: "deviceTypes", 
            title: "Choose Your Device Type",
            subtitle: "Select the type of device you want to sell or browse",
            content: "",
            active: true,
            order: 3,
            settings: {},
            createdAt: '2023-01-01',
            updatedAt: '2023-01-01',
          },
          { 
            id: 4, 
            name: "featuredBrands", 
            title: "Popular Brands",
            subtitle: "Browse devices from top manufacturers",
            content: "",
            active: true,
            order: 4,
            settings: {},
            createdAt: '2023-01-01',
            updatedAt: '2023-01-01',
          },
          { 
            id: 5, 
            name: "testimonials", 
            title: "What Our Customers Say",
            subtitle: "Thousands of satisfied customers have sold and purchased devices through our platform",
            content: JSON.stringify({
              items: [
                { name: "Sarah J.", text: "I was amazed by how easy it was to sell my old iPhone. The quote was fair and I received payment within 24 hours of them receiving my device!", rating: 5 },
                { name: "Michael T.", text: "The refurbished MacBook I purchased works perfectly! It looks brand new and came with a solid warranty. Saved me hundreds of dollars.", rating: 5 },
                { name: "Priya K.", text: "I've used this service multiple times to sell old gadgets. The process is always smooth and they consistently offer better prices than other buyback services.", rating: 4 }
              ]
            }),
            active: true,
            order: 5,
            settings: {},
            createdAt: '2023-01-01',
            updatedAt: '2023-01-01',
          },
          { 
            id: 6, 
            name: "environmentalImpact", 
            title: "Our Environmental Impact",
            subtitle: "Together we're reducing electronic waste and making a difference",
            content: JSON.stringify({
              description: "By buying and selling refurbished devices, you're helping extend the lifecycle of electronics and reducing the environmental impact of manufacturing new products.",
              stats: [
                { value: "50,000+", label: "Devices Recycled" },
                { value: "500+", label: "Tons of e-Waste Prevented" },
                { value: "10,000+", label: "Trees Saved" }
              ]
            }),
            active: true,
            order: 6,
            settings: {},
            createdAt: '2023-01-01',
            updatedAt: '2023-01-01',
          },
        ];
      }
    },
  });

  // Form for adding/editing a route
  const routeForm = useForm<z.infer<typeof routeFormSchema>>({
    resolver: zodResolver(routeFormSchema),
    defaultValues: {
      path: '',
      title: '',
      description: '',
      seoTitle: '',
      seoDescription: '',
      active: true,
      layout: 'main',
      componentPath: '',
    },
  });

  // Form for adding/editing a home section
  const sectionForm = useForm<z.infer<typeof homeSectionFormSchema>>({
    resolver: zodResolver(homeSectionFormSchema),
    defaultValues: {
      name: '',
      title: '',
      subtitle: '',
      content: '',
      active: true,
      order: 0,
      settings: {},
    },
  });

  // Set edit form values when a route is selected for editing
  React.useEffect(() => {
    if (selectedRoute) {
      routeForm.reset({
        path: selectedRoute.path,
        title: selectedRoute.title,
        description: selectedRoute.description || '',
        seoTitle: selectedRoute.seoTitle,
        seoDescription: selectedRoute.seoDescription,
        active: selectedRoute.active,
        layout: selectedRoute.layout,
        componentPath: selectedRoute.componentPath,
      });
    }
  }, [selectedRoute, routeForm]);

  // Set edit form values when a section is selected for editing
  React.useEffect(() => {
    if (selectedSection) {
      sectionForm.reset({
        name: selectedSection.name,
        title: selectedSection.title,
        subtitle: selectedSection.subtitle || '',
        content: selectedSection.content || '',
        active: selectedSection.active,
        order: selectedSection.order,
        settings: selectedSection.settings || {},
      });
    }
  }, [selectedSection, sectionForm]);

  // Mutation to create a new route
  const createRouteMutation = useMutation({
    mutationFn: async (newRoute: z.infer<typeof routeFormSchema>) => {
      return await apiRequest('POST', '/api/routes', newRoute)
        .then(res => res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/routes'] });
      setIsAddRouteDialogOpen(false);
      routeForm.reset();
      toast({
        title: "Route created",
        description: "The route has been created successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create route",
        variant: "destructive",
      });
    },
  });

  // Mutation to update a route
  const updateRouteMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: z.infer<typeof routeFormSchema> }) => {
      return await apiRequest('PUT', `/api/routes/${id}`, data)
        .then(res => res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/routes'] });
      setIsEditRouteDialogOpen(false);
      setSelectedRoute(null);
      toast({
        title: "Route updated",
        description: "The route has been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update route",
        variant: "destructive",
      });
    },
  });

  // Mutation to create a new home section
  const createSectionMutation = useMutation({
    mutationFn: async (newSection: z.infer<typeof homeSectionFormSchema>) => {
      return await apiRequest('POST', '/api/home-sections', newSection)
        .then(res => res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/home-sections'] });
      setIsAddSectionDialogOpen(false);
      sectionForm.reset();
      toast({
        title: "Section created",
        description: "The home section has been created successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create section",
        variant: "destructive",
      });
    },
  });

  // Mutation to update a home section
  const updateSectionMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: z.infer<typeof homeSectionFormSchema> }) => {
      return await apiRequest('PUT', `/api/home-sections/${id}`, data)
        .then(res => res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/home-sections'] });
      setIsEditSectionDialogOpen(false);
      setSelectedSection(null);
      toast({
        title: "Section updated",
        description: "The home section has been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update section",
        variant: "destructive",
      });
    },
  });

  // Submit handler for adding/editing a route
  const onRouteSubmit = (values: z.infer<typeof routeFormSchema>) => {
    if (selectedRoute) {
      updateRouteMutation.mutate({
        id: selectedRoute.id,
        data: values,
      });
    } else {
      createRouteMutation.mutate(values);
    }
  };

  // Submit handler for adding/editing a home section
  const onSectionSubmit = (values: z.infer<typeof homeSectionFormSchema>) => {
    if (selectedSection) {
      updateSectionMutation.mutate({
        id: selectedSection.id,
        data: values,
      });
    } else {
      createSectionMutation.mutate(values);
    }
  };

  // Handle edit button click for a route
  const handleEditRoute = (route: RouteConfig) => {
    setSelectedRoute(route);
    setIsEditRouteDialogOpen(true);
  };

  // Handle edit button click for a section
  const handleEditSection = (section: HomeSection) => {
    setSelectedSection(section);
    setIsEditSectionDialogOpen(true);
  };

  // Handle toggle active status for a route
  const handleToggleRouteStatus = async (route: RouteConfig) => {
    try {
      await apiRequest('PUT', `/api/routes/${route.id}`, {
        ...route,
        active: !route.active,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/routes'] });
      toast({
        title: `Route ${!route.active ? 'activated' : 'deactivated'}`,
        description: `The route has been ${!route.active ? 'activated' : 'deactivated'} successfully.`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update route status",
        variant: "destructive",
      });
    }
  };

  // Handle toggle active status for a section
  const handleToggleSectionStatus = async (section: HomeSection) => {
    try {
      await apiRequest('PUT', `/api/home-sections/${section.id}`, {
        ...section,
        active: !section.active,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/home-sections'] });
      toast({
        title: `Section ${!section.active ? 'activated' : 'deactivated'}`,
        description: `The section has been ${!section.active ? 'activated' : 'deactivated'} successfully.`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update section status",
        variant: "destructive",
      });
    }
  };

  // Render loading state
  if ((routesLoading && activeTab === "routes") || (sectionsLoading && activeTab === "home-sections")) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Render error state
  if ((routesError && activeTab === "routes") || (sectionsError && activeTab === "home-sections")) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md">
        <p>Error loading data. Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight mb-1">Route & Content Management</h1>
          <p className="text-gray-500">Manage application routes and homepage content sections</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2">
          {activeTab === "routes" && (
            <Dialog open={isAddRouteDialogOpen} onOpenChange={setIsAddRouteDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-1">
                  <Plus size={16} />
                  <span>Add Route</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Add New Route</DialogTitle>
                  <DialogDescription>
                    Create a new route configuration for the application.
                  </DialogDescription>
                </DialogHeader>
                <Form {...routeForm}>
                  <form onSubmit={routeForm.handleSubmit(onRouteSubmit)} className="space-y-4">
                    <FormField
                      control={routeForm.control}
                      name="path"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Route Path</FormLabel>
                          <FormControl>
                            <Input placeholder="/example" {...field} />
                          </FormControl>
                          <FormDescription>
                            The URL path for this route (e.g., /about)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={routeForm.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Page Title</FormLabel>
                          <FormControl>
                            <Input placeholder="About Us" {...field} />
                          </FormControl>
                          <FormDescription>
                            The title displayed in the browser tab
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={routeForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea placeholder="About our company and mission" {...field} />
                          </FormControl>
                          <FormDescription>
                            A brief description of this route (internal use only)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={routeForm.control}
                        name="seoTitle"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>SEO Title</FormLabel>
                            <FormControl>
                              <Input placeholder="About GadgetSwap | Our Mission" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={routeForm.control}
                        name="layout"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Layout</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a layout" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="main">Main</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                                <SelectItem value="auth">Auth</SelectItem>
                                <SelectItem value="blank">Blank</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={routeForm.control}
                      name="seoDescription"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>SEO Description</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Learn about our mission to reduce e-waste..." {...field} />
                          </FormControl>
                          <FormDescription>
                            Used for search engine optimization
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={routeForm.control}
                      name="componentPath"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Component Path</FormLabel>
                          <FormControl>
                            <Input placeholder="pages/AboutPage" {...field} />
                          </FormControl>
                          <FormDescription>
                            Path to the component that renders this route
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={routeForm.control}
                      name="active"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                          <div className="space-y-0.5">
                            <FormLabel>Active</FormLabel>
                            <FormDescription>
                              Enable or disable this route
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <DialogFooter>
                      <Button 
                        type="submit" 
                        disabled={createRouteMutation.isPending}
                      >
                        {createRouteMutation.isPending ? 'Saving...' : 'Save Route'}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          )}

          {activeTab === "home-sections" && (
            <Dialog open={isAddSectionDialogOpen} onOpenChange={setIsAddSectionDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-1">
                  <Plus size={16} />
                  <span>Add Section</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Add Home Section</DialogTitle>
                  <DialogDescription>
                    Create a new content section for the homepage.
                  </DialogDescription>
                </DialogHeader>
                <Form {...sectionForm}>
                  <form onSubmit={sectionForm.handleSubmit(onSectionSubmit)} className="space-y-4">
                    <FormField
                      control={sectionForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Section Name</FormLabel>
                          <FormControl>
                            <Input placeholder="featuredProducts" {...field} />
                          </FormControl>
                          <FormDescription>
                            Unique identifier for this section (camelCase)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={sectionForm.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Title</FormLabel>
                          <FormControl>
                            <Input placeholder="Featured Products" {...field} />
                          </FormControl>
                          <FormDescription>
                            Main heading for this section
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={sectionForm.control}
                      name="subtitle"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Subtitle</FormLabel>
                          <FormControl>
                            <Input placeholder="Check out our most popular devices" {...field} />
                          </FormControl>
                          <FormDescription>
                            Supporting text below the title
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={sectionForm.control}
                      name="content"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Content (JSON)</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder='{"items": [{"title": "Example", "description": "Description"}]}' 
                              className="font-mono text-sm h-32"
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            JSON-formatted content for this section
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={sectionForm.control}
                      name="order"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Display Order</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min={0}
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value))}
                            />
                          </FormControl>
                          <FormDescription>
                            Determines the position of this section on the page
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={sectionForm.control}
                      name="active"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                          <div className="space-y-0.5">
                            <FormLabel>Active</FormLabel>
                            <FormDescription>
                              Enable or disable this section
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <DialogFooter>
                      <Button 
                        type="submit" 
                        disabled={createSectionMutation.isPending}
                      >
                        {createSectionMutation.isPending ? 'Saving...' : 'Save Section'}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      <Tabs defaultValue="routes" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full md:w-auto grid-cols-2 mb-6">
          <TabsTrigger value="routes" className="flex items-center gap-2">
            <Route size={16} />
            <span>Routes</span>
          </TabsTrigger>
          <TabsTrigger value="home-sections" className="flex items-center gap-2">
            <Home size={16} />
            <span>Homepage Sections</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="routes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Application Routes</CardTitle>
              <CardDescription>
                Manage routes and their associated components
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Path</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Layout</TableHead>
                    <TableHead>Component</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {routes && routes.length > 0 ? (
                    routes.map((route: RouteConfig) => (
                      <TableRow key={route.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-1">
                            <LinkIcon size={14} className="text-gray-400" />
                            {route.path}
                          </div>
                        </TableCell>
                        <TableCell>{route.title}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            route.layout === 'main' ? 'bg-blue-100 text-blue-800' :
                            route.layout === 'admin' ? 'bg-purple-100 text-purple-800' :
                            route.layout === 'auth' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {route.layout}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="font-mono text-xs text-gray-500">
                            {route.componentPath}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Switch
                            checked={route.active}
                            onCheckedChange={() => handleToggleRouteStatus(route)}
                            aria-label={route.active ? "Active" : "Inactive"}
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleEditRoute(route)}
                            >
                              <Edit size={16} />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <Route size={24} />
                          <p>No routes found</p>
                          <p className="text-sm">Create your first route to get started</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="home-sections" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Homepage Sections</CardTitle>
              <CardDescription>
                Manage content sections displayed on the homepage
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Subtitle</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sections && sections.length > 0 ? (
                    sections.map((section: HomeSection) => (
                      <TableRow key={section.id}>
                        <TableCell>{section.order}</TableCell>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-1">
                            <LayoutTemplate size={14} className="text-gray-400" />
                            {section.name}
                          </div>
                        </TableCell>
                        <TableCell>{section.title}</TableCell>
                        <TableCell className="max-w-xs truncate">{section.subtitle}</TableCell>
                        <TableCell>
                          <Switch
                            checked={section.active}
                            onCheckedChange={() => handleToggleSectionStatus(section)}
                            aria-label={section.active ? "Active" : "Inactive"}
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleEditSection(section)}
                            >
                              <Edit size={16} />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <LayoutTemplate size={24} />
                          <p>No sections found</p>
                          <p className="text-sm">Create your first section to get started</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Route Dialog */}
      <Dialog open={isEditRouteDialogOpen} onOpenChange={setIsEditRouteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Route</DialogTitle>
            <DialogDescription>
              Update route configuration.
            </DialogDescription>
          </DialogHeader>
          <Form {...routeForm}>
            <form onSubmit={routeForm.handleSubmit(onRouteSubmit)} className="space-y-4">
              <FormField
                control={routeForm.control}
                name="path"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Route Path</FormLabel>
                    <FormControl>
                      <Input placeholder="/example" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={routeForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Page Title</FormLabel>
                    <FormControl>
                      <Input placeholder="About Us" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={routeForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="About our company and mission" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={routeForm.control}
                  name="seoTitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>SEO Title</FormLabel>
                      <FormControl>
                        <Input placeholder="About GadgetSwap | Our Mission" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={routeForm.control}
                  name="layout"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Layout</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a layout" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="main">Main</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="auth">Auth</SelectItem>
                          <SelectItem value="blank">Blank</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={routeForm.control}
                name="seoDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>SEO Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Learn about our mission to reduce e-waste..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={routeForm.control}
                name="componentPath"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Component Path</FormLabel>
                    <FormControl>
                      <Input placeholder="pages/AboutPage" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={routeForm.control}
                name="active"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Active</FormLabel>
                      <FormDescription>
                        Enable or disable this route
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button 
                  type="submit" 
                  disabled={updateRouteMutation.isPending}
                >
                  {updateRouteMutation.isPending ? 'Updating...' : 'Update Route'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Section Dialog */}
      <Dialog open={isEditSectionDialogOpen} onOpenChange={setIsEditSectionDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Home Section</DialogTitle>
            <DialogDescription>
              Update homepage section content.
            </DialogDescription>
          </DialogHeader>
          <Form {...sectionForm}>
            <form onSubmit={sectionForm.handleSubmit(onSectionSubmit)} className="space-y-4">
              <FormField
                control={sectionForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Section Name</FormLabel>
                    <FormControl>
                      <Input placeholder="featuredProducts" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={sectionForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Featured Products" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={sectionForm.control}
                name="subtitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subtitle</FormLabel>
                    <FormControl>
                      <Input placeholder="Check out our most popular devices" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={sectionForm.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Content (JSON)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder='{"items": [{"title": "Example", "description": "Description"}]}' 
                        className="font-mono text-sm h-32"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={sectionForm.control}
                name="order"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Display Order</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={sectionForm.control}
                name="active"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Active</FormLabel>
                      <FormDescription>
                        Enable or disable this section
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button 
                  type="submit" 
                  disabled={updateSectionMutation.isPending}
                >
                  {updateSectionMutation.isPending ? 'Updating...' : 'Update Section'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RouteManagement;