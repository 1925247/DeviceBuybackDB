import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Users,
  UserPlus,
  Edit,
  Trash2,
  MoreHorizontal,
  Shield,
  MapPin,
  AlignLeft,
  CheckCircle,
  XCircle,
  Loader2,
  Lock,
  KeyRound,
  Eye,
  EyeOff,
} from 'lucide-react';

// Form schema for adding/editing staff
const staffFormSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  firstName: z.string().min(2, {
    message: "First name must be at least 2 characters.",
  }),
  lastName: z.string().min(2, {
    message: "Last name must be at least 2 characters.",
  }),
  phone: z.string().min(10, {
    message: "Phone number must be at least 10 characters.",
  }),
  role: z.enum(["partner_staff", "partner_manager"]),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters.",
  }).optional(),
  confirmPassword: z.string().optional(),
  assignedRegions: z.array(z.string()).optional(),
  assignedPincodes: z.string().optional(), // Comma-separated pincodes
  status: z.enum(["active", "inactive", "pending", "suspended"]),
}).refine((data) => {
  if (data.password && data.confirmPassword) {
    return data.password === data.confirmPassword;
  }
  return true;
}, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type StaffFormValues = z.infer<typeof staffFormSchema>;

interface Region {
  id: number;
  name: string;
  code: string;
  active: boolean;
}

interface StaffMember {
  id: number;
  userId: number;
  partnerId: number;
  role: string;
  status: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  assignedRegions: string[];
  assignedPincodes: string[] | null;
  lastLogin: string | null;
  createdAt: string;
  updatedAt?: string;
}

const StaffManagementDemo: React.FC = () => {
  const { toast } = useToast();
  
  // Partner ID for demo
  const partnerId = 1;
  
  // Mock data
  const [regions] = useState<Region[]>([
    { id: 1, name: 'Maharashtra', code: 'MH', active: true },
    { id: 2, name: 'Delhi', code: 'DL', active: true },
    { id: 3, name: 'Karnataka', code: 'KA', active: true },
    { id: 4, name: 'Tamil Nadu', code: 'TN', active: true },
    { id: 5, name: 'Gujarat', code: 'GJ', active: true }
  ]);
  
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([
    {
      id: 1,
      userId: 101,
      partnerId: 1,
      role: 'partner_manager',
      status: 'active',
      email: 'manager@example.com',
      firstName: 'John',
      lastName: 'Manager',
      phone: '9876543210',
      assignedRegions: ['MH', 'DL'],
      assignedPincodes: null,
      lastLogin: new Date().toISOString(),
      createdAt: '2023-01-01T00:00:00.000Z',
    },
    {
      id: 2,
      userId: 102,
      partnerId: 1,
      role: 'partner_staff',
      status: 'active',
      email: 'field1@example.com',
      firstName: 'Alice',
      lastName: 'Field',
      phone: '9876543211',
      assignedRegions: [],
      assignedPincodes: ['400001', '400002', '400003'],
      lastLogin: new Date().toISOString(),
      createdAt: '2023-02-01T00:00:00.000Z',
    },
    {
      id: 3,
      userId: 103,
      partnerId: 1,
      role: 'partner_staff',
      status: 'inactive',
      email: 'field2@example.com',
      firstName: 'Bob',
      lastName: 'Worker',
      phone: '9876543212',
      assignedRegions: [],
      assignedPincodes: ['500001', '500002'],
      lastLogin: null,
      createdAt: '2023-03-01T00:00:00.000Z',
    }
  ]);
  
  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [isAddStaffDialogOpen, setIsAddStaffDialogOpen] = useState(false);
  const [isEditStaffDialogOpen, setIsEditStaffDialogOpen] = useState(false);
  const [isDeleteStaffDialogOpen, setIsDeleteStaffDialogOpen] = useState(false);
  const [currentStaff, setCurrentStaff] = useState<StaffMember | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Forms
  const addStaffForm = useForm<StaffFormValues>({
    resolver: zodResolver(staffFormSchema),
    defaultValues: {
      email: '',
      firstName: '',
      lastName: '',
      phone: '',
      role: 'partner_staff',
      password: '',
      confirmPassword: '',
      assignedRegions: [],
      assignedPincodes: '',
      status: 'active',
    },
  });

  const editStaffForm = useForm<StaffFormValues>({
    resolver: zodResolver(staffFormSchema),
    defaultValues: {
      email: '',
      firstName: '',
      lastName: '',
      phone: '',
      role: 'partner_staff',
      assignedRegions: [],
      assignedPincodes: '',
      status: 'active',
    },
  });

  // Add staff function
  const addStaffMember = async (data: StaffFormValues) => {
    setIsLoading(true);
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Create new staff member
      const newStaff: StaffMember = {
        id: Math.floor(Math.random() * 1000) + 10,
        userId: Math.floor(Math.random() * 1000) + 200,
        partnerId,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        role: data.role,
        assignedRegions: data.assignedRegions || [],
        assignedPincodes: data.assignedPincodes ? data.assignedPincodes.split(',').map(p => p.trim()) : null,
        status: data.status,
        lastLogin: null,
        createdAt: new Date().toISOString(),
      };
      
      // Add to state
      setStaffMembers(prev => [...prev, newStaff]);
      
      toast({
        title: "Staff Added",
        description: "The staff member has been added successfully.",
      });
      setIsAddStaffDialogOpen(false);
      addStaffForm.reset();
    } catch (error: any) {
      toast({
        title: "Failed to Add Staff",
        description: error.message || "There was an error adding the staff member.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Update staff function
  const updateStaffMember = async (data: StaffFormValues & { id: number }) => {
    setIsLoading(true);
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Update staff in state
      setStaffMembers(prev => prev.map(staff => 
        staff.id === data.id ? {
          ...staff,
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone,
          role: data.role,
          assignedRegions: data.assignedRegions || [],
          assignedPincodes: data.assignedPincodes ? data.assignedPincodes.split(',').map(p => p.trim()) : null,
          status: data.status,
          updatedAt: new Date().toISOString(),
        } : staff
      ));
      
      toast({
        title: "Staff Updated",
        description: "The staff member has been updated successfully.",
      });
      setIsEditStaffDialogOpen(false);
      setCurrentStaff(null);
    } catch (error: any) {
      toast({
        title: "Failed to Update Staff",
        description: error.message || "There was an error updating the staff member.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Delete staff function
  const deleteStaffMember = async (staffId: number) => {
    setIsLoading(true);
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Remove from state
      setStaffMembers(prev => prev.filter(staff => staff.id !== staffId));
      
      toast({
        title: "Staff Removed",
        description: "The staff member has been removed successfully.",
      });
      setIsDeleteStaffDialogOpen(false);
      setCurrentStaff(null);
    } catch (error: any) {
      toast({
        title: "Failed to Remove Staff",
        description: error.message || "There was an error removing the staff member.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Form submission handlers
  const onAddStaffSubmit = (data: StaffFormValues) => {
    addStaffMember(data);
  };

  const onEditStaffSubmit = (data: StaffFormValues) => {
    if (!currentStaff) return;
    
    updateStaffMember({
      ...data,
      id: currentStaff.id,
    });
  };

  // Handle edit staff click
  const handleEditStaff = (staffMember: StaffMember) => {
    setCurrentStaff(staffMember);
    
    editStaffForm.reset({
      email: staffMember.email,
      firstName: staffMember.firstName,
      lastName: staffMember.lastName,
      phone: staffMember.phone,
      role: staffMember.role as any,
      assignedRegions: staffMember.assignedRegions || [],
      assignedPincodes: staffMember.assignedPincodes?.join(', ') || '',
      status: staffMember.status as any,
    });
    
    setIsEditStaffDialogOpen(true);
  };

  // Handle delete staff click
  const handleDeleteStaff = (staffMember: StaffMember) => {
    setCurrentStaff(staffMember);
    setIsDeleteStaffDialogOpen(true);
  };

  // Function to confirm staff deletion
  const confirmDeleteStaff = () => {
    if (!currentStaff) return;
    deleteStaffMember(currentStaff.id);
  };

  // UI utility functions
  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'partner_manager':
        return 'default';
      case 'partner_staff':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active':
        return 'default';
      case 'inactive':
        return 'secondary';
      case 'pending':
        return 'outline';
      case 'suspended':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  // Filter staff for different tabs
  const getAllStaff = () => staffMembers;
  const getManagers = () => staffMembers.filter(staff => staff.role === 'partner_manager');
  const getFieldStaff = () => staffMembers.filter(staff => staff.role === 'partner_staff');

  // Render staff table
  const renderStaffTable = (staff: StaffMember[]) => {
    if (isLoading) {
      return (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      );
    }

    if (!staff || staff.length === 0) {
      return (
        <div className="text-center py-12">
          <Users className="h-16 w-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium mb-2">No Staff Members</h3>
          <p className="text-muted-foreground mb-6">
            You haven't added any staff members yet.
          </p>
          <Button onClick={() => setIsAddStaffDialogOpen(true)}>
            <UserPlus className="h-4 w-4 mr-2" />
            Add First Staff Member
          </Button>
        </div>
      );
    }

    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Assigned Areas</TableHead>
            <TableHead>Last Login</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {staff.map((staffMember) => (
            <TableRow key={staffMember.id}>
              <TableCell className="font-medium">
                {staffMember.firstName} {staffMember.lastName}
              </TableCell>
              <TableCell>{staffMember.email}</TableCell>
              <TableCell>
                <Badge variant={getRoleBadgeVariant(staffMember.role)}>
                  {staffMember.role === 'partner_manager' ? 'Manager' : 'Staff'}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant={getStatusBadgeVariant(staffMember.status)}>
                  {staffMember.status}
                </Badge>
              </TableCell>
              <TableCell>
                {staffMember.assignedRegions?.length > 0 ? (
                  <span className="text-sm">{staffMember.assignedRegions.join(', ')}</span>
                ) : staffMember.assignedPincodes?.length ? (
                  <span className="text-sm">{staffMember.assignedPincodes.length} pincodes</span>
                ) : (
                  <span className="text-sm text-muted-foreground">None assigned</span>
                )}
              </TableCell>
              <TableCell>
                {staffMember.lastLogin ? (
                  format(new Date(staffMember.lastLogin), 'dd MMM yyyy, HH:mm')
                ) : (
                  <span className="text-sm text-muted-foreground">Never</span>
                )}
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Open menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => handleEditStaff(staffMember)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handleDeleteStaff(staffMember)} className="text-red-600">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Staff Management</h2>
        <Button onClick={() => setIsAddStaffDialogOpen(true)}>
          <UserPlus className="h-4 w-4 mr-2" />
          Add Staff
        </Button>
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All Staff ({getAllStaff().length})</TabsTrigger>
          <TabsTrigger value="managers">Managers ({getManagers().length})</TabsTrigger>
          <TabsTrigger value="field">Field Staff ({getFieldStaff().length})</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Staff Members</CardTitle>
              <CardDescription>
                Manage your partner staff and their access levels
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderStaffTable(getAllStaff())}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="managers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Managers</CardTitle>
              <CardDescription>
                Staff with manager access level who can oversee operations
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderStaffTable(getManagers())}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="field" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Field Staff</CardTitle>
              <CardDescription>
                Team members who visit customers for device assessments
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderStaffTable(getFieldStaff())}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Staff Dialog */}
      <Dialog open={isAddStaffDialogOpen} onOpenChange={setIsAddStaffDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add New Staff Member</DialogTitle>
            <DialogDescription>
              Create a new staff account with appropriate permissions
            </DialogDescription>
          </DialogHeader>
          
          <Form {...addStaffForm}>
            <form onSubmit={addStaffForm.handleSubmit(onAddStaffSubmit)} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={addStaffForm.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={addStaffForm.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={addStaffForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input 
                          type="email" 
                          placeholder="john.doe@example.com" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={addStaffForm.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input placeholder="9876543210" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={addStaffForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input 
                            type={showPassword ? "text" : "password"} 
                            placeholder="••••••••" 
                            {...field} 
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-1"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                            <span className="sr-only">
                              {showPassword ? "Hide password" : "Show password"}
                            </span>
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={addStaffForm.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input 
                            type={showConfirmPassword ? "text" : "password"} 
                            placeholder="••••••••" 
                            {...field} 
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-1"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          >
                            {showConfirmPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                            <span className="sr-only">
                              {showConfirmPassword ? "Hide password" : "Show password"}
                            </span>
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={addStaffForm.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="partner_staff">Field Staff</SelectItem>
                        <SelectItem value="partner_manager">Manager</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Determines what permissions this staff member will have
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={addStaffForm.control}
                name="assignedRegions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assigned Regions</FormLabel>
                    <div className="flex flex-wrap gap-2 border rounded-md p-3">
                      {regions?.map((region: Region) => (
                        <div 
                          key={region.id} 
                          className="flex items-center space-x-2"
                        >
                          <Checkbox 
                            id={`region-${region.id}`}
                            checked={field.value?.includes(region.code)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                field.onChange([...(field.value || []), region.code]);
                              } else {
                                field.onChange(
                                  field.value?.filter((code) => code !== region.code) || []
                                );
                              }
                            }}
                          />
                          <label
                            htmlFor={`region-${region.id}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {region.name}
                          </label>
                        </div>
                      ))}
                    </div>
                    <FormDescription>
                      Leave empty to assign all regions or specify pincodes below
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={addStaffForm.control}
                name="assignedPincodes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assigned Pincodes</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g. 400001, 400002, 400003" 
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Comma-separated list of pincodes this staff can service
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={addStaffForm.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsAddStaffDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={isLoading}
                >
                  {isLoading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Add Staff Member
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Edit Staff Dialog */}
      <Dialog open={isEditStaffDialogOpen} onOpenChange={setIsEditStaffDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Staff Member</DialogTitle>
            <DialogDescription>
              Update staff details and permissions
            </DialogDescription>
          </DialogHeader>
          
          <Form {...editStaffForm}>
            <form onSubmit={editStaffForm.handleSubmit(onEditStaffSubmit)} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editStaffForm.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={editStaffForm.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editStaffForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input 
                          type="email" 
                          placeholder="john.doe@example.com" 
                          {...field} 
                          disabled // Email cannot be changed
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={editStaffForm.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input placeholder="9876543210" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={editStaffForm.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="partner_staff">Field Staff</SelectItem>
                        <SelectItem value="partner_manager">Manager</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Determines what permissions this staff member will have
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={editStaffForm.control}
                name="assignedRegions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assigned Regions</FormLabel>
                    <div className="flex flex-wrap gap-2 border rounded-md p-3">
                      {regions?.map((region: Region) => (
                        <div 
                          key={region.id} 
                          className="flex items-center space-x-2"
                        >
                          <Checkbox 
                            id={`edit-region-${region.id}`}
                            checked={field.value?.includes(region.code)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                field.onChange([...(field.value || []), region.code]);
                              } else {
                                field.onChange(
                                  field.value?.filter((code) => code !== region.code) || []
                                );
                              }
                            }}
                          />
                          <label
                            htmlFor={`edit-region-${region.id}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {region.name}
                          </label>
                        </div>
                      ))}
                    </div>
                    <FormDescription>
                      Leave empty to assign all regions or specify pincodes below
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={editStaffForm.control}
                name="assignedPincodes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assigned Pincodes</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g. 400001, 400002, 400003" 
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Comma-separated list of pincodes this staff can service
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={editStaffForm.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="suspended">Suspended</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsEditStaffDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={isLoading}
                >
                  {isLoading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Update Staff Member
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Delete Staff Confirmation Dialog */}
      <Dialog open={isDeleteStaffDialogOpen} onOpenChange={setIsDeleteStaffDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove this staff member? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          {currentStaff && (
            <div className="py-4">
              <p className="mb-2">
                <span className="font-medium">Name:</span> {currentStaff.firstName} {currentStaff.lastName}
              </p>
              <p className="mb-2">
                <span className="font-medium">Email:</span> {currentStaff.email}
              </p>
              <p>
                <span className="font-medium">Role:</span> {currentStaff.role === 'partner_manager' ? 'Manager' : 'Field Staff'}
              </p>
            </div>
          )}
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsDeleteStaffDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              type="button"
              variant="destructive"
              onClick={confirmDeleteStaff}
              disabled={isLoading}
            >
              {isLoading && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Delete Staff Member
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StaffManagementDemo;