import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Plus, Pencil, Trash2, Play, CheckCircle, XCircle, MoveUp, MoveDown } from 'lucide-react';

// Define interfaces for diagnostic tests and device types
interface DiagnosticTest {
  id: number;
  name: string;
  description?: string;
  device_type_id: number;
  test_type: 'automated' | 'manual';
  test_script?: string;
  is_required: boolean;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

interface DeviceType {
  id: number;
  name: string;
  icon?: string;
  slug: string;
}

const AdminDiagnostic: React.FC = () => {
  const [selectedDeviceType, setSelectedDeviceType] = useState<number | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedTest, setSelectedTest] = useState<DiagnosticTest | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    device_type_id: '',
    test_type: 'manual',
    test_script: '',
    is_required: false,
    is_active: true,
    display_order: 0,
  });
  const { toast } = useToast();

  // Query hooks
  const { data: deviceTypes, isLoading: isLoadingDeviceTypes } = useQuery<DeviceType[]>({
    queryKey: ['/api/device-types'],
    retry: 1,
  });

  const { data: diagnosticTests, isLoading: isLoadingTests } = useQuery<DiagnosticTest[]>({
    queryKey: ['/api/diagnostic-tests', selectedDeviceType],
    queryFn: async () => {
      const url = selectedDeviceType
        ? `/api/diagnostic-tests?device_type_id=${selectedDeviceType}`
        : '/api/diagnostic-tests';
      return apiRequest('GET', url).then(res => res.json());
    },
    enabled: true,
  });

  // Mutation hooks
  const createTestMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return apiRequest('POST', '/api/diagnostic-tests', data).then(res => res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/diagnostic-tests'] });
      setIsAddModalOpen(false);
      resetForm();
      toast({
        title: 'Success',
        description: 'Diagnostic test created successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create diagnostic test',
        variant: 'destructive',
      });
    },
  });

  const updateTestMutation = useMutation({
    mutationFn: async (data: typeof formData & { id: number }) => {
      return apiRequest('PUT', `/api/diagnostic-tests/${data.id}`, data).then(res => res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/diagnostic-tests'] });
      setIsEditModalOpen(false);
      resetForm();
      toast({
        title: 'Success',
        description: 'Diagnostic test updated successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update diagnostic test',
        variant: 'destructive',
      });
    },
  });

  const deleteTestMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest('DELETE', `/api/diagnostic-tests/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/diagnostic-tests'] });
      setIsDeleteModalOpen(false);
      setSelectedTest(null);
      toast({
        title: 'Success',
        description: 'Diagnostic test deleted successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete diagnostic test',
        variant: 'destructive',
      });
    },
  });

  const changeOrderMutation = useMutation({
    mutationFn: async ({ id, direction }: { id: number, direction: 'up' | 'down' }) => {
      return apiRequest('POST', `/api/diagnostic-tests/${id}/order`, { direction }).then(res => res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/diagnostic-tests'] });
      toast({
        title: 'Success',
        description: 'Test order updated successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update test order',
        variant: 'destructive',
      });
    },
  });

  // Helper functions
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      device_type_id: '',
      test_type: 'manual',
      test_script: '',
      is_required: false,
      is_active: true,
      display_order: 0,
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleAddTest = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      ...formData,
      device_type_id: parseInt(formData.device_type_id),
    };
    createTestMutation.mutate(data as any);
  };

  const handleEditTest = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedTest) {
      const data = {
        ...formData,
        id: selectedTest.id,
        device_type_id: parseInt(formData.device_type_id),
      };
      updateTestMutation.mutate(data as any);
    }
  };

  const handleDeleteTest = () => {
    if (selectedTest) {
      deleteTestMutation.mutate(selectedTest.id);
    }
  };

  const handleChangeOrder = (id: number, direction: 'up' | 'down') => {
    changeOrderMutation.mutate({ id, direction });
  };

  const openEditModal = (test: DiagnosticTest) => {
    setSelectedTest(test);
    setFormData({
      name: test.name,
      description: test.description || '',
      device_type_id: test.device_type_id.toString(),
      test_type: test.test_type,
      test_script: test.test_script || '',
      is_required: test.is_required,
      is_active: test.is_active,
      display_order: test.display_order,
    });
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (test: DiagnosticTest) => {
    setSelectedTest(test);
    setIsDeleteModalOpen(true);
  };

  const getDeviceTypeName = (id: number) => {
    if (!deviceTypes) return 'Unknown';
    const deviceType = deviceTypes.find(dt => dt.id === id);
    return deviceType ? deviceType.name : 'Unknown';
  };

  // Loading state
  if (isLoadingDeviceTypes) {
    return (
      <div className="py-8 px-4">
        <h1 className="text-2xl font-bold mb-6">Diagnostic Tools</h1>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  const renderAddModal = () => (
    <DialogContent className="max-w-md">
      <DialogHeader>
        <DialogTitle>Add New Diagnostic Test</DialogTitle>
        <DialogDescription>
          Create a new diagnostic test for device verification.
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleAddTest} className="space-y-4 py-4">
        <div className="space-y-2">
          <Label htmlFor="name">Test Name</Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="e.g., Screen Test, Battery Health Test"
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Input
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Brief description of what this test checks"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="device_type_id">Device Type</Label>
          <Select 
            value={formData.device_type_id} 
            onValueChange={(value) => handleSelectChange('device_type_id', value)}
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Select device type" />
            </SelectTrigger>
            <SelectContent>
              {deviceTypes?.map((deviceType) => (
                <SelectItem key={deviceType.id} value={deviceType.id.toString()}>
                  {deviceType.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="test_type">Test Type</Label>
          <Select 
            value={formData.test_type} 
            onValueChange={(value) => handleSelectChange('test_type', value)}
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Select test type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="manual">Manual</SelectItem>
              <SelectItem value="automated">Automated</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {formData.test_type === 'automated' && (
          <div className="space-y-2">
            <Label htmlFor="test_script">Test Script</Label>
            <Input
              id="test_script"
              name="test_script"
              value={formData.test_script}
              onChange={handleInputChange}
              placeholder="JavaScript or test script code"
            />
          </div>
        )}
        
        <div className="flex items-center space-x-2">
          <Checkbox
            id="is_required"
            checked={formData.is_required}
            onCheckedChange={(checked) => handleCheckboxChange('is_required', checked as boolean)}
          />
          <label
            htmlFor="is_required"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Required Test
          </label>
        </div>
        
        <div className="flex items-center space-x-2">
          <Checkbox
            id="is_active"
            checked={formData.is_active}
            onCheckedChange={(checked) => handleCheckboxChange('is_active', checked as boolean)}
          />
          <label
            htmlFor="is_active"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Active
          </label>
        </div>
        
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>
            Cancel
          </Button>
          <Button type="submit" disabled={createTestMutation.isPending}>
            {createTestMutation.isPending ? 'Creating...' : 'Create Test'}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );

  const renderEditModal = () => (
    <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Diagnostic Test</DialogTitle>
          <DialogDescription>
            Update the diagnostic test details.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleEditTest} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="edit-name">Test Name</Label>
            <Input
              id="edit-name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="edit-description">Description</Label>
            <Input
              id="edit-description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="edit-device_type_id">Device Type</Label>
            <Select 
              value={formData.device_type_id} 
              onValueChange={(value) => handleSelectChange('device_type_id', value)}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select device type" />
              </SelectTrigger>
              <SelectContent>
                {deviceTypes?.map((deviceType) => (
                  <SelectItem key={deviceType.id} value={deviceType.id.toString()}>
                    {deviceType.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="edit-test_type">Test Type</Label>
            <Select 
              value={formData.test_type} 
              onValueChange={(value) => handleSelectChange('test_type', value)}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select test type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="manual">Manual</SelectItem>
                <SelectItem value="automated">Automated</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {formData.test_type === 'automated' && (
            <div className="space-y-2">
              <Label htmlFor="edit-test_script">Test Script</Label>
              <Input
                id="edit-test_script"
                name="test_script"
                value={formData.test_script}
                onChange={handleInputChange}
              />
            </div>
          )}
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="edit-is_required"
              checked={formData.is_required}
              onCheckedChange={(checked) => handleCheckboxChange('is_required', checked as boolean)}
            />
            <label
              htmlFor="edit-is_required"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Required Test
            </label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="edit-is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => handleCheckboxChange('is_active', checked as boolean)}
            />
            <label
              htmlFor="edit-is_active"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Active
            </label>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={updateTestMutation.isPending}>
              {updateTestMutation.isPending ? 'Updating...' : 'Update Test'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );

  const renderDeleteModal = () => (
    <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Diagnostic Test</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this diagnostic test? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <p className="font-medium">
            {selectedTest?.name}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Type: {selectedTest?.test_type === 'manual' ? 'Manual' : 'Automated'}
          </p>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
            Cancel
          </Button>
          <Button 
            type="button" 
            variant="destructive" 
            onClick={handleDeleteTest}
            disabled={deleteTestMutation.isPending}
          >
            {deleteTestMutation.isPending ? 'Deleting...' : 'Delete Test'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Diagnostic Tools</h1>
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogTrigger asChild>
            <Button className="mb-4">
              <Plus className="mr-2 h-4 w-4" /> Add New Test
            </Button>
          </DialogTrigger>
          {renderAddModal()}
        </Dialog>
      </div>

      <Tabs defaultValue="manage" className="space-y-4">
        <TabsList>
          <TabsTrigger value="manage">Manage Tests</TabsTrigger>
          <TabsTrigger value="run">Run Diagnostics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="manage" className="space-y-4">
          <Card className="mb-4">
            <CardHeader className="pb-3">
              <CardTitle>Filter by Device Type</CardTitle>
              <CardDescription>
                Select a device type to view specific diagnostic tests
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={selectedDeviceType === null ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedDeviceType(null)}
                >
                  All Types
                </Button>
                {deviceTypes?.map((deviceType) => (
                  <Button
                    key={deviceType.id}
                    variant={selectedDeviceType === deviceType.id ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedDeviceType(deviceType.id)}
                  >
                    {deviceType.name}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Diagnostic Tests</CardTitle>
              <CardDescription>
                Manage tests used to verify device functionality
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingTests ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Device Type</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Required</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(!diagnosticTests || diagnosticTests.length === 0) ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-6 text-gray-500">
                          No diagnostic tests found for the selected device type.
                        </TableCell>
                      </TableRow>
                    ) : (
                      diagnosticTests
                        .sort((a, b) => a.display_order - b.display_order)
                        .map((test) => (
                        <TableRow key={test.id}>
                          <TableCell>
                            <div className="flex flex-col space-y-1">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-5 w-5"
                                onClick={() => handleChangeOrder(test.id, 'up')}
                              >
                                <MoveUp size={14} />
                              </Button>
                              <span className="text-center">{test.display_order}</span>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-5 w-5"
                                onClick={() => handleChangeOrder(test.id, 'down')}
                              >
                                <MoveDown size={14} />
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{test.name}</p>
                              {test.description && (
                                <p className="text-xs text-gray-500">{test.description}</p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>{getDeviceTypeName(test.device_type_id)}</TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${test.test_type === 'automated' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                              {test.test_type === 'automated' ? 'Automated' : 'Manual'}
                            </span>
                          </TableCell>
                          <TableCell>
                            {test.is_required ? (
                              <CheckCircle className="h-5 w-5 text-green-500" />
                            ) : (
                              <XCircle className="h-5 w-5 text-gray-300" />
                            )}
                          </TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${test.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                              {test.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-2">
                              <Button 
                                variant="outline" 
                                size="icon"
                                onClick={() => openEditModal(test)}
                                title="Edit"
                              >
                                <Pencil size={16} />
                              </Button>
                              <Button 
                                variant="destructive" 
                                size="icon"
                                onClick={() => openDeleteModal(test)}
                                title="Delete"
                              >
                                <Trash2 size={16} />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="run">
          <Card>
            <CardHeader>
              <CardTitle>Run Diagnostic Suite</CardTitle>
              <CardDescription>
                Test and validate a device's functionality
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="mb-4">
                <Label htmlFor="run-device-type" className="mb-2 block">Select Device Type</Label>
                <Select>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select device type" />
                  </SelectTrigger>
                  <SelectContent>
                    {deviceTypes?.map((deviceType) => (
                      <SelectItem key={deviceType.id} value={deviceType.id.toString()}>
                        {deviceType.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="border rounded-md p-4 bg-gray-50">
                <div className="text-center text-gray-500 py-8">
                  <Play className="mx-auto h-12 w-12 text-gray-300 mb-2" />
                  <p className="font-medium">Select a device type to run diagnostics</p>
                  <p className="text-sm">Diagnostic tests will appear here for the selected device type</p>
                </div>
              </div>
              
              <div className="text-center mt-4">
                <Button disabled>
                  Start Diagnostic Tests
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Render modals */}
      {renderEditModal()}
      {renderDeleteModal()}
    </div>
  );
};

export default AdminDiagnostic;