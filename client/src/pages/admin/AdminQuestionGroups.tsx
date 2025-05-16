import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Plus,
  Edit,
  Trash2,
  AlertCircle,
  Search,
  Monitor,
  MousePointer,
  Smartphone,
  TabletSmartphone,
  Laptop,
  HelpCircle,
} from "lucide-react";
import { QuestionGroup, DeviceType } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

const deviceTypeIcons = {
  "smartphone": <Smartphone className="w-5 h-5" />,
  "tablet": <TabletSmartphone className="w-5 h-5" />,
  "laptop": <Laptop className="w-5 h-5" />,
  "desktop": <Monitor className="w-5 h-5" />,
  "mouse": <MousePointer className="w-5 h-5" />,
  "default": <HelpCircle className="w-5 h-5" />
};

export default function AdminQuestionGroups() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentGroup, setCurrentGroup] = useState<QuestionGroup | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    statement: "",
    deviceTypeId: null as number | null,
    icon: "",
    active: true,
  });

  // Fetch question groups
  const { data: questionGroups, isLoading } = useQuery<QuestionGroup[]>({
    queryKey: ["/api/question-groups"],
  });

  // Fetch device types for dropdown
  const { data: deviceTypes } = useQuery<DeviceType[]>({
    queryKey: ["/api/device-types"],
  });

  // Add new question group
  const addGroupMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/question-groups", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/question-groups"] });
      setIsAddDialogOpen(false);
      resetForm();
      toast({
        title: "Success",
        description: "Question group has been created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create question group",
        variant: "destructive",
      });
    },
  });

  // Update question group
  const updateGroupMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      return await apiRequest("PUT", `/api/question-groups/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/question-groups"] });
      setIsEditDialogOpen(false);
      resetForm();
      toast({
        title: "Success",
        description: "Question group has been updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update question group",
        variant: "destructive",
      });
    },
  });

  // Delete question group
  const deleteGroupMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest("DELETE", `/api/question-groups/${id}`);
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/question-groups"] });
      setIsDeleteDialogOpen(false);
      setCurrentGroup(null);
      toast({
        title: "Success",
        description: "Question group has been deleted successfully",
      });
    },
    onError: (error: any) => {
      const errorMessage = error?.message || "Failed to delete question group";
      
      // Check if the error is due to product mappings
      if (errorMessage.includes("mapped to products")) {
        toast({
          title: "Cannot Delete",
          description: "This group is mapped to products and cannot be deleted",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      }
    },
  });

  // Reset form
  const resetForm = () => {
    setFormData({
      name: "",
      statement: "",
      deviceTypeId: null,
      icon: "",
      active: true,
    });
  };

  // Handle add button click
  const handleAddClick = () => {
    resetForm();
    setIsAddDialogOpen(true);
  };

  // Handle edit button click
  const handleEditClick = (group: QuestionGroup) => {
    setCurrentGroup(group);
    setFormData({
      name: group.name,
      statement: group.statement,
      deviceTypeId: group.deviceTypeId,
      icon: group.icon || "",
      active: group.active,
    });
    setIsEditDialogOpen(true);
  };

  // Handle delete button click
  const handleDeleteClick = (group: QuestionGroup) => {
    setCurrentGroup(group);
    setIsDeleteDialogOpen(true);
  };

  // Handle form input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle switch change
  const handleSwitchChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, active: checked }));
  };

  // Handle select change
  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({ 
      ...prev, 
      deviceTypeId: value === "none" ? null : parseInt(value) 
    }));
  };

  // Handle form submission for add
  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addGroupMutation.mutate(formData);
  };

  // Handle form submission for edit
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentGroup) {
      updateGroupMutation.mutate({ id: currentGroup.id, data: formData });
    }
  };

  // Handle delete confirmation
  const handleDeleteConfirm = () => {
    if (currentGroup) {
      deleteGroupMutation.mutate(currentGroup.id);
    }
  };

  // Filter question groups based on search query
  const filteredGroups = questionGroups?.filter((group) =>
    group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (group.statement && group.statement.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="container mx-auto py-6">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Question Groups</h1>
          <p className="text-gray-500 mt-1">
            Manage question groups for device assessments
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
          <Button onClick={handleAddClick}>
            <Plus className="mr-2 h-4 w-4" /> Add Group
          </Button>
        </div>
      </header>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : filteredGroups && filteredGroups.length > 0 ? (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Statement</TableHead>
                <TableHead>Device Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredGroups.map((group) => (
                <TableRow key={group.id}>
                  <TableCell className="font-medium">{group.name}</TableCell>
                  <TableCell className="max-w-md truncate">
                    {group.statement}
                  </TableCell>
                  <TableCell>
                    {deviceTypes?.find(dt => dt.id === group.deviceTypeId)?.name || "All Devices"}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        group.active
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {group.active ? "Active" : "Inactive"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditClick(group)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600"
                        onClick={() => handleDeleteClick(group)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
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
              : "Get started by adding a new question group."}
          </p>
          <div className="mt-6">
            <Button onClick={handleAddClick}>
              <Plus className="mr-2 h-4 w-4" /> Add Group
            </Button>
          </div>
        </div>
      )}

      {/* Add Question Group Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Question Group</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Group Name *</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="e.g., Screen Condition"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="statement">Group Statement *</Label>
                <Textarea
                  id="statement"
                  name="statement"
                  placeholder="e.g., Please answer the following questions about your device's screen"
                  value={formData.statement}
                  onChange={handleInputChange}
                  required
                  rows={3}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="deviceType">Device Type</Label>
                <Select onValueChange={handleSelectChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select device type (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">All Devices</SelectItem>
                    {deviceTypes?.map((type) => (
                      <SelectItem key={type.id} value={type.id.toString()}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-gray-500">
                  If no device type is selected, this group can be used for any device
                </p>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="icon">Icon Name (Optional)</Label>
                <Input
                  id="icon"
                  name="icon"
                  placeholder="e.g., smartphone, laptop, tablet"
                  value={formData.icon}
                  onChange={handleInputChange}
                />
                <p className="text-sm text-gray-500">
                  Used for visual representation in the UI
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="active"
                  checked={formData.active}
                  onCheckedChange={handleSwitchChange}
                />
                <Label htmlFor="active">Active</Label>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={addGroupMutation.isPending}>
                {addGroupMutation.isPending ? (
                  <>
                    <div className="animate-spin mr-2 h-4 w-4 border-2 border-b-transparent rounded-full"></div>
                    Saving...
                  </>
                ) : (
                  "Save Group"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Question Group Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Question Group</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Group Name *</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="e.g., Screen Condition"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="statement">Group Statement *</Label>
                <Textarea
                  id="statement"
                  name="statement"
                  placeholder="e.g., Please answer the following questions about your device's screen"
                  value={formData.statement}
                  onChange={handleInputChange}
                  required
                  rows={3}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="deviceType">Device Type</Label>
                <Select 
                  onValueChange={handleSelectChange} 
                  defaultValue={formData.deviceTypeId?.toString() || "none"}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select device type (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">All Devices</SelectItem>
                    {deviceTypes?.map((type) => (
                      <SelectItem key={type.id} value={type.id.toString()}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="icon">Icon Name (Optional)</Label>
                <Input
                  id="icon"
                  name="icon"
                  placeholder="e.g., smartphone, laptop, tablet"
                  value={formData.icon}
                  onChange={handleInputChange}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="active"
                  checked={formData.active}
                  onCheckedChange={handleSwitchChange}
                />
                <Label htmlFor="active">Active</Label>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={updateGroupMutation.isPending}>
                {updateGroupMutation.isPending ? (
                  <>
                    <div className="animate-spin mr-2 h-4 w-4 border-2 border-b-transparent rounded-full"></div>
                    Updating...
                  </>
                ) : (
                  "Update Group"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Question Group</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-gray-500">
              Are you sure you want to delete the question group{" "}
              <span className="font-medium text-gray-900">
                {currentGroup?.name}
              </span>
              ? This action cannot be undone.
            </p>
            <div className="mt-4 bg-amber-50 p-3 rounded-md border border-amber-200">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 mr-2" />
                <p className="text-sm text-amber-700">
                  Deleting a question group will also delete all associated questions and answer choices. If this group is already mapped to products, deletion will be prevented.
                </p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={deleteGroupMutation.isPending}
            >
              {deleteGroupMutation.isPending ? (
                <>
                  <div className="animate-spin mr-2 h-4 w-4 border-2 border-b-transparent rounded-full"></div>
                  Deleting...
                </>
              ) : (
                "Delete Group"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}