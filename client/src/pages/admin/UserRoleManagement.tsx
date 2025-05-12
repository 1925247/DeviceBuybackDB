import React, { useState, useEffect } from 'react';
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
import { Switch } from '@/components/ui/switch';
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
import { Plus, Edit, Trash, ShieldCheck, Users, UserCheck, Lock } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';

// Define the Role type
interface Role {
  id: number;
  name: string;
  description: string;
  permissions: Permission[];
  created_at: string;
  updated_at: string;
}

// Define the Permission type
interface Permission {
  id: number;
  name: string;
  description: string;
  module: string;
}

// Define the User type
interface User {
  id: number;
  name: string;
  email: string;
  roles: Role[];
}

// Define the form schema for roles
const roleFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  description: z.string().min(2, { message: "Description must be at least 2 characters" }),
  permissions: z.array(z.number()),
});

// Define the form schema for assigning roles to users
const userRoleFormSchema = z.object({
  userId: z.number(),
  roles: z.array(z.number()),
});

const UserRoleManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState("roles");
  const [isAddRoleDialogOpen, setIsAddRoleDialogOpen] = useState(false);
  const [isEditRoleDialogOpen, setIsEditRoleDialogOpen] = useState(false);
  const [isAssignRoleDialogOpen, setIsAssignRoleDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query to fetch all roles
  const { 
    data: roles, 
    isLoading: rolesLoading, 
    error: rolesError 
  } = useQuery({
    queryKey: ['/api/roles'],
    queryFn: async () => {
      // Placeholder for actual API - replace with real data when ready
      return [
        { 
          id: 1, 
          name: 'Admin', 
          description: 'Full system access',
          permissions: [
            { id: 1, name: 'user_create', description: 'Create users', module: 'users' },
            { id: 2, name: 'user_read', description: 'View users', module: 'users' },
            { id: 3, name: 'user_update', description: 'Update users', module: 'users' },
            { id: 4, name: 'user_delete', description: 'Delete users', module: 'users' },
          ],
          created_at: '2023-01-01',
          updated_at: '2023-01-01',
        },
        { 
          id: 2, 
          name: 'Manager', 
          description: 'Can manage content but not users',
          permissions: [
            { id: 5, name: 'content_create', description: 'Create content', module: 'content' },
            { id: 6, name: 'content_read', description: 'View content', module: 'content' },
            { id: 7, name: 'content_update', description: 'Update content', module: 'content' },
            { id: 8, name: 'content_delete', description: 'Delete content', module: 'content' },
          ],
          created_at: '2023-01-01',
          updated_at: '2023-01-01',
        },
        { 
          id: 3, 
          name: 'Partner', 
          description: 'Partner access for specific region',
          permissions: [
            { id: 9, name: 'buyback_create', description: 'Create buybacks', module: 'buyback' },
            { id: 10, name: 'buyback_read', description: 'View buybacks', module: 'buyback' },
            { id: 11, name: 'buyback_update', description: 'Update buybacks', module: 'buyback' },
          ],
          created_at: '2023-01-01',
          updated_at: '2023-01-01',
        },
      ];
    },
  });

  // Query to fetch all permissions
  const { 
    data: permissions, 
    isLoading: permissionsLoading 
  } = useQuery({
    queryKey: ['/api/permissions'],
    queryFn: async () => {
      // Placeholder for actual API - replace with real data when ready
      return [
        { id: 1, name: 'user_create', description: 'Create users', module: 'users' },
        { id: 2, name: 'user_read', description: 'View users', module: 'users' },
        { id: 3, name: 'user_update', description: 'Update users', module: 'users' },
        { id: 4, name: 'user_delete', description: 'Delete users', module: 'users' },
        { id: 5, name: 'content_create', description: 'Create content', module: 'content' },
        { id: 6, name: 'content_read', description: 'View content', module: 'content' },
        { id: 7, name: 'content_update', description: 'Update content', module: 'content' },
        { id: 8, name: 'content_delete', description: 'Delete content', module: 'content' },
        { id: 9, name: 'buyback_create', description: 'Create buybacks', module: 'buyback' },
        { id: 10, name: 'buyback_read', description: 'View buybacks', module: 'buyback' },
        { id: 11, name: 'buyback_update', description: 'Update buybacks', module: 'buyback' },
        { id: 12, name: 'buyback_delete', description: 'Delete buybacks', module: 'buyback' },
      ];
    },
  });

  // Query to fetch all users
  const { 
    data: users, 
    isLoading: usersLoading, 
    error: usersError 
  } = useQuery({
    queryKey: ['/api/users'],
    queryFn: async () => {
      // Placeholder for actual API - replace with real data when ready
      return [
        { 
          id: 1, 
          name: 'John Doe', 
          email: 'john@example.com',
          roles: [roles?.[0]],
        },
        { 
          id: 2, 
          name: 'Jane Smith', 
          email: 'jane@example.com',
          roles: [roles?.[1]],
        },
        { 
          id: 3, 
          name: 'Partner User', 
          email: 'partner@example.com',
          roles: [roles?.[2]],
        },
      ];
    },
    enabled: !!roles,
  });

  // Form for adding/editing a role
  const roleForm = useForm<z.infer<typeof roleFormSchema>>({
    resolver: zodResolver(roleFormSchema),
    defaultValues: {
      name: '',
      description: '',
      permissions: [],
    },
  });

  // Form for assigning roles to a user
  const userRoleForm = useForm<z.infer<typeof userRoleFormSchema>>({
    resolver: zodResolver(userRoleFormSchema),
    defaultValues: {
      userId: 0,
      roles: [],
    },
  });

  // Set edit form values when a role is selected for editing
  useEffect(() => {
    if (selectedRole) {
      roleForm.reset({
        name: selectedRole.name,
        description: selectedRole.description,
        permissions: selectedRole.permissions.map(p => p.id),
      });
    }
  }, [selectedRole, roleForm]);

  // Set user role form values when a user is selected
  useEffect(() => {
    if (selectedUser) {
      userRoleForm.reset({
        userId: selectedUser.id,
        roles: selectedUser.roles?.map(r => r.id) || [],
      });
    }
  }, [selectedUser, userRoleForm]);

  // Mutation to create a new role
  const createRoleMutation = useMutation({
    mutationFn: async (newRole: z.infer<typeof roleFormSchema>) => {
      return await apiRequest('POST', '/api/roles', newRole)
        .then(res => res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/roles'] });
      setIsAddRoleDialogOpen(false);
      roleForm.reset();
      toast({
        title: "Role created",
        description: "The role has been created successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create role",
        variant: "destructive",
      });
    },
  });

  // Mutation to update a role
  const updateRoleMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: z.infer<typeof roleFormSchema> }) => {
      return await apiRequest('PUT', `/api/roles/${id}`, data)
        .then(res => res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/roles'] });
      setIsEditRoleDialogOpen(false);
      setSelectedRole(null);
      toast({
        title: "Role updated",
        description: "The role has been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update role",
        variant: "destructive",
      });
    },
  });

  // Mutation to assign roles to a user
  const assignRoleMutation = useMutation({
    mutationFn: async (data: z.infer<typeof userRoleFormSchema>) => {
      return await apiRequest('POST', '/api/users/roles', data)
        .then(res => res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      setIsAssignRoleDialogOpen(false);
      setSelectedUser(null);
      toast({
        title: "Roles assigned",
        description: "The roles have been assigned successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to assign roles",
        variant: "destructive",
      });
    },
  });

  // Submit handler for adding/editing a role
  const onRoleSubmit = (values: z.infer<typeof roleFormSchema>) => {
    if (selectedRole) {
      updateRoleMutation.mutate({
        id: selectedRole.id,
        data: values,
      });
    } else {
      createRoleMutation.mutate(values);
    }
  };

  // Submit handler for assigning roles to a user
  const onUserRoleSubmit = (values: z.infer<typeof userRoleFormSchema>) => {
    assignRoleMutation.mutate(values);
  };

  // Handle edit button click for a role
  const handleEditRole = (role: Role) => {
    setSelectedRole(role);
    setIsEditRoleDialogOpen(true);
  };

  // Handle assigning roles to a user
  const handleAssignRole = (user: User) => {
    setSelectedUser(user);
    setIsAssignRoleDialogOpen(true);
  };

  // Group permissions by module for better organization
  const groupedPermissions = permissions?.reduce((acc, permission) => {
    if (!acc[permission.module]) {
      acc[permission.module] = [];
    }
    acc[permission.module].push(permission);
    return acc;
  }, {} as Record<string, Permission[]>) || {};

  // Render loading state
  if ((rolesLoading || permissionsLoading) && activeTab === "roles") {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Render loading state for users
  if (usersLoading && activeTab === "users") {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Render error state
  if ((rolesError && activeTab === "roles") || (usersError && activeTab === "users")) {
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
          <h1 className="text-2xl font-bold tracking-tight mb-1">User Role Management</h1>
          <p className="text-gray-500">Manage user roles and permissions</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2">
          {activeTab === "roles" && (
            <Dialog open={isAddRoleDialogOpen} onOpenChange={setIsAddRoleDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-1">
                  <Plus size={16} />
                  <span>Add Role</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add New Role</DialogTitle>
                  <DialogDescription>
                    Create a new role with specific permissions.
                  </DialogDescription>
                </DialogHeader>
                <Form {...roleForm}>
                  <form onSubmit={roleForm.handleSubmit(onRoleSubmit)} className="space-y-4">
                    <FormField
                      control={roleForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Role Name</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. Admin, Manager, etc." {...field} />
                          </FormControl>
                          <FormDescription>
                            The name of this role
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={roleForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Role Description</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. Full system access" {...field} />
                          </FormControl>
                          <FormDescription>
                            Brief description of this role's purpose
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={roleForm.control}
                      name="permissions"
                      render={() => (
                        <FormItem>
                          <FormLabel>Permissions</FormLabel>
                          <div className="space-y-4">
                            {Object.entries(groupedPermissions).map(([module, modulePermissions]) => (
                              <div key={module} className="border rounded-md p-4">
                                <div className="font-medium mb-2 text-gray-700 capitalize">
                                  {module} Module
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                  {modulePermissions.map((permission) => (
                                    <FormField
                                      key={permission.id}
                                      control={roleForm.control}
                                      name="permissions"
                                      render={({ field }) => {
                                        return (
                                          <FormItem
                                            key={permission.id}
                                            className="flex flex-row items-start space-x-3 space-y-0"
                                          >
                                            <FormControl>
                                              <Checkbox
                                                checked={field.value?.includes(permission.id)}
                                                onCheckedChange={(checked) => {
                                                  return checked
                                                    ? field.onChange([...field.value, permission.id])
                                                    : field.onChange(
                                                        field.value?.filter(
                                                          (value) => value !== permission.id
                                                        )
                                                      )
                                                }}
                                              />
                                            </FormControl>
                                            <div className="space-y-1 leading-none">
                                              <FormLabel className="text-sm font-normal">
                                                {permission.description}
                                              </FormLabel>
                                              <FormDescription className="text-xs">
                                                {permission.name}
                                              </FormDescription>
                                            </div>
                                          </FormItem>
                                        )
                                      }}
                                    />
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <DialogFooter>
                      <Button 
                        type="submit" 
                        disabled={createRoleMutation.isPending}
                      >
                        {createRoleMutation.isPending ? 'Creating...' : 'Create Role'}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      <Tabs defaultValue="roles" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full md:w-auto grid-cols-2 mb-6">
          <TabsTrigger value="roles" className="flex items-center gap-2">
            <ShieldCheck size={16} />
            <span>Roles & Permissions</span>
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <UserCheck size={16} />
            <span>User Assignment</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="roles" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Roles</CardTitle>
              <CardDescription>
                Manage roles and their associated permissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Permissions</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {roles && roles.length > 0 ? (
                    roles.map((role) => (
                      <TableRow key={role.id}>
                        <TableCell className="font-medium">{role.name}</TableCell>
                        <TableCell>{role.description}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {role.permissions.slice(0, 3).map((permission) => (
                              <span
                                key={permission.id}
                                className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs"
                              >
                                {permission.name}
                              </span>
                            ))}
                            {role.permissions.length > 3 && (
                              <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">
                                +{role.permissions.length - 3} more
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleEditRole(role)}
                            >
                              <Edit size={16} />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <Lock size={24} />
                          <p>No roles found</p>
                          <p className="text-sm">Create your first role to get started</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Role Assignment</CardTitle>
              <CardDescription>
                Assign roles to users
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Roles</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users && users.length > 0 ? (
                    users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {user.roles?.map((role) => (
                              <span
                                key={role.id}
                                className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs"
                              >
                                {role.name}
                              </span>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleAssignRole(user)}
                            >
                              <ShieldCheck size={16} />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <Users size={24} />
                          <p>No users found</p>
                          <p className="text-sm">Create users first before assigning roles</p>
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

      {/* Edit Role Dialog */}
      <Dialog open={isEditRoleDialogOpen} onOpenChange={setIsEditRoleDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Role</DialogTitle>
            <DialogDescription>
              Update role details and permissions.
            </DialogDescription>
          </DialogHeader>
          <Form {...roleForm}>
            <form onSubmit={roleForm.handleSubmit(onRoleSubmit)} className="space-y-4">
              <FormField
                control={roleForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Admin, Manager, etc." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={roleForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role Description</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Full system access" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={roleForm.control}
                name="permissions"
                render={() => (
                  <FormItem>
                    <FormLabel>Permissions</FormLabel>
                    <div className="space-y-4">
                      {Object.entries(groupedPermissions).map(([module, modulePermissions]) => (
                        <div key={module} className="border rounded-md p-4">
                          <div className="font-medium mb-2 text-gray-700 capitalize">
                            {module} Module
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {modulePermissions.map((permission) => (
                              <FormField
                                key={permission.id}
                                control={roleForm.control}
                                name="permissions"
                                render={({ field }) => {
                                  return (
                                    <FormItem
                                      key={permission.id}
                                      className="flex flex-row items-start space-x-3 space-y-0"
                                    >
                                      <FormControl>
                                        <Checkbox
                                          checked={field.value?.includes(permission.id)}
                                          onCheckedChange={(checked) => {
                                            return checked
                                              ? field.onChange([...field.value, permission.id])
                                              : field.onChange(
                                                  field.value?.filter(
                                                    (value) => value !== permission.id
                                                  )
                                                )
                                          }}
                                        />
                                      </FormControl>
                                      <div className="space-y-1 leading-none">
                                        <FormLabel className="text-sm font-normal">
                                          {permission.description}
                                        </FormLabel>
                                        <FormDescription className="text-xs">
                                          {permission.name}
                                        </FormDescription>
                                      </div>
                                    </FormItem>
                                  )
                                }}
                              />
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button 
                  type="submit" 
                  disabled={updateRoleMutation.isPending}
                >
                  {updateRoleMutation.isPending ? 'Updating...' : 'Update Role'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Assign Role Dialog */}
      <Dialog open={isAssignRoleDialogOpen} onOpenChange={setIsAssignRoleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Roles</DialogTitle>
            <DialogDescription>
              Assign roles to the selected user.
            </DialogDescription>
          </DialogHeader>
          <Form {...userRoleForm}>
            <form onSubmit={userRoleForm.handleSubmit(onUserRoleSubmit)} className="space-y-4">
              <div className="mb-4">
                <p className="text-sm font-medium">User:</p>
                <p className="text-sm">{selectedUser?.name} ({selectedUser?.email})</p>
              </div>
              <FormField
                control={userRoleForm.control}
                name="roles"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Roles</FormLabel>
                    <div className="space-y-2">
                      {roles?.map((role) => (
                        <FormField
                          key={role.id}
                          control={userRoleForm.control}
                          name="roles"
                          render={({ field: roleField }) => {
                            return (
                              <FormItem
                                key={role.id}
                                className="flex flex-row items-start space-x-3 space-y-0 border p-3 rounded-md"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={roleField.value?.includes(role.id)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? roleField.onChange([...roleField.value, role.id])
                                        : roleField.onChange(
                                            roleField.value?.filter(
                                              (value) => value !== role.id
                                            )
                                          )
                                    }}
                                  />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                  <FormLabel className="text-sm font-semibold">
                                    {role.name}
                                  </FormLabel>
                                  <FormDescription className="text-sm">
                                    {role.description}
                                  </FormDescription>
                                </div>
                              </FormItem>
                            )
                          }}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button 
                  type="submit" 
                  disabled={assignRoleMutation.isPending}
                >
                  {assignRoleMutation.isPending ? 'Assigning...' : 'Assign Roles'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserRoleManagement;