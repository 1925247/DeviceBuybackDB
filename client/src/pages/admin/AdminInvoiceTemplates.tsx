import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { AlertCircle, CheckCircle, Edit, FileDown, FilePlus, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { CardContent, Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import AdminHeader from "@/components/admin/AdminHeader";

interface InvoiceTemplate {
  id: number;
  name: string;
  description: string | null;
  is_default: boolean;
  html_template: string;
  css_styles: string | null;
  configuration: Record<string, any> | null;
  partner_id: number | null;
  created_at: string;
  updated_at: string;
}

interface Partner {
  id: number;
  name: string;
  email: string;
}

function AdminInvoiceTemplates() {
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<InvoiceTemplate | null>(null);
  const [formValues, setFormValues] = useState({
    name: "",
    description: "",
    is_default: false,
    html_template: "",
    css_styles: "",
    configuration: "{}",
    partner_id: null as number | null,
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all templates
  const { data: templates = [], isLoading: isLoadingTemplates } = useQuery({
    queryKey: ["/api/invoice-templates"],
  });

  // Fetch all partners
  const { data: partners = [], isLoading: isLoadingPartners } = useQuery({
    queryKey: ["/api/partners"],
  });

  // Create a new template
  const createTemplateMutation = useMutation({
    mutationFn: (templateData: any) => 
      apiRequest("POST", "/api/invoice-templates", templateData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/invoice-templates"] });
      toast({
        title: "Template created",
        description: "The invoice template has been created successfully.",
      });
      setIsCreating(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "Error creating template",
        description: error.message || "An error occurred. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Update a template
  const updateTemplateMutation = useMutation({
    mutationFn: ({ id, templateData }: { id: number; templateData: any }) => 
      apiRequest("PUT", `/api/invoice-templates/${id}`, templateData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/invoice-templates"] });
      toast({
        title: "Template updated",
        description: "The invoice template has been updated successfully.",
      });
      setIsEditing(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "Error updating template",
        description: error.message || "An error occurred. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Delete a template
  const deleteTemplateMutation = useMutation({
    mutationFn: (id: number) => 
      apiRequest("DELETE", `/api/invoice-templates/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/invoice-templates"] });
      toast({
        title: "Template deleted",
        description: "The invoice template has been deleted successfully.",
      });
      setIsDeleteDialogOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error deleting template",
        description: error.message || "An error occurred. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Parse the configuration JSON
    let configObject = {};
    try {
      configObject = JSON.parse(formValues.configuration || "{}");
    } catch (error) {
      toast({
        title: "Invalid JSON",
        description: "The configuration JSON is invalid. Please correct it and try again.",
        variant: "destructive",
      });
      return;
    }
    
    const formData = {
      ...formValues,
      configuration: configObject,
    };
    
    if (isEditing && selectedTemplate) {
      updateTemplateMutation.mutate({ id: selectedTemplate.id, templateData: formData });
    } else {
      createTemplateMutation.mutate(formData);
    }
  };

  // Open edit modal
  const openEditModal = (template: InvoiceTemplate) => {
    setSelectedTemplate(template);
    setFormValues({
      name: template.name,
      description: template.description || "",
      is_default: template.is_default,
      html_template: template.html_template,
      css_styles: template.css_styles || "",
      configuration: template.configuration ? JSON.stringify(template.configuration, null, 2) : "{}",
      partner_id: template.partner_id,
    });
    setIsEditing(true);
  };

  // Open preview modal
  const openPreviewModal = (template: InvoiceTemplate) => {
    setSelectedTemplate(template);
    setIsPreviewOpen(true);
  };

  // Open delete confirmation dialog
  const openDeleteDialog = (template: InvoiceTemplate) => {
    setSelectedTemplate(template);
    setIsDeleteDialogOpen(true);
  };

  // Reset form values
  const resetForm = () => {
    setFormValues({
      name: "",
      description: "",
      is_default: false,
      html_template: "",
      css_styles: "",
      configuration: "{}",
      partner_id: null,
    });
    setSelectedTemplate(null);
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  // Handle checkbox change
  const handleCheckboxChange = (checked: boolean) => {
    setFormValues((prev) => ({ ...prev, is_default: checked }));
  };

  // Handle partner select
  const handlePartnerSelect = (value: string) => {
    setFormValues((prev) => ({ 
      ...prev, 
      partner_id: value === "null" ? null : parseInt(value) 
    }));
  };

  // Create a new template
  const handleCreate = () => {
    resetForm();
    setIsCreating(true);
  };

  // Get partner name by ID
  const getPartnerName = (partnerId: number | null) => {
    if (partnerId === null) return "Global";
    const partner = partners.find((p: Partner) => p.id === partnerId);
    return partner ? partner.name : "Unknown Partner";
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <AdminHeader 
        title="Invoice Templates" 
        description="Manage invoice templates for your organization and partners"
        buttons={
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" /> Add Template
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Templates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{templates.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Global Templates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{templates.filter((t: InvoiceTemplate) => t.partner_id === null).length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Partner-Specific Templates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{templates.filter((t: InvoiceTemplate) => t.partner_id !== null).length}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Invoice Templates</CardTitle>
          <CardDescription>
            Create and manage invoice templates for your organization and partners.
            Default templates are used automatically when generating invoices.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Partner</TableHead>
                  <TableHead className="text-center">Default</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoadingTemplates ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-4">
                      Loading templates...
                    </TableCell>
                  </TableRow>
                ) : templates.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-4">
                      No templates found. Create your first template to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  templates.map((template: InvoiceTemplate) => (
                    <TableRow key={template.id}>
                      <TableCell>{template.id}</TableCell>
                      <TableCell className="font-medium">{template.name}</TableCell>
                      <TableCell>{getPartnerName(template.partner_id)}</TableCell>
                      <TableCell className="text-center">
                        {template.is_default ? (
                          <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                        ) : (
                          <div className="h-5 w-5 mx-auto"></div>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="outline" 
                            size="icon" 
                            onClick={() => openPreviewModal(template)}
                            title="Preview template"
                          >
                            <FileDown className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="icon" 
                            onClick={() => openEditModal(template)}
                            title="Edit template"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="icon"
                            onClick={() => openDeleteDialog(template)}
                            title="Delete template"
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Create/Edit Template Dialog */}
      <Dialog open={isCreating || isEditing} onOpenChange={(open) => open ? null : (isCreating ? setIsCreating(false) : setIsEditing(false))}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isEditing ? "Edit Invoice Template" : "Create Invoice Template"}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="basic">Basic Information</TabsTrigger>
                <TabsTrigger value="template">Template HTML</TabsTrigger>
                <TabsTrigger value="styling">Styling & Configuration</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Template Name</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formValues.name}
                      onChange={handleInputChange}
                      placeholder="e.g., Standard Invoice"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="partner_id">Partner</Label>
                    <Select 
                      value={formValues.partner_id === null ? "null" : formValues.partner_id.toString()}
                      onValueChange={handlePartnerSelect}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a partner" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="null">Global (All Partners)</SelectItem>
                        {partners.map((partner: Partner) => (
                          <SelectItem key={partner.id} value={partner.id.toString()}>
                            {partner.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formValues.description}
                    onChange={handleInputChange}
                    placeholder="A brief description of this template..."
                    rows={3}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_default"
                    checked={formValues.is_default}
                    onCheckedChange={handleCheckboxChange}
                  />
                  <Label htmlFor="is_default">
                    Make this the default template {formValues.partner_id ? "for this partner" : "for all partners"}
                  </Label>
                </div>

                <div className="rounded-md bg-amber-50 p-4 border border-amber-200">
                  <div className="flex">
                    <AlertCircle className="h-5 w-5 text-amber-500 mr-2" />
                    <div className="text-sm text-amber-800">
                      <p>Available template variables:</p>
                      <ul className="list-disc pl-5 mt-1">
                        <li><code>{{referenceNumber}}</code> - The unique buyback reference number</li>
                        <li><code>{{currentDate}}</code> - Today's date (formatted)</li>
                        <li><code>{{customerName}}</code> - Name of the customer</li>
                        <li><code>{{deviceType}}</code> - Type of device (e.g., Phone, Laptop)</li>
                        <li><code>{{manufacturer}}</code> - Device manufacturer (e.g., Apple, Samsung)</li>
                        <li><code>{{model}}</code> - Device model (e.g., iPhone 13 Pro, Galaxy S22)</li>
                        <li><code>{{condition}}</code> - Condition of the device</li>
                        <li><code>{{imei}}</code> - Device IMEI or Serial Number</li>
                        <li><code>{{price}}</code> - Buyback price (formatted)</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="template" className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="html_template">HTML Template</Label>
                  <Textarea
                    id="html_template"
                    name="html_template"
                    value={formValues.html_template}
                    onChange={handleInputChange}
                    placeholder="<div class='invoice'>...</div>"
                    rows={20}
                    className="font-mono text-sm"
                    required
                  />
                </div>
              </TabsContent>

              <TabsContent value="styling" className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="css_styles">CSS Styles</Label>
                  <Textarea
                    id="css_styles"
                    name="css_styles"
                    value={formValues.css_styles}
                    onChange={handleInputChange}
                    placeholder=".invoice { ... }"
                    rows={10}
                    className="font-mono text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="configuration">Configuration (JSON)</Label>
                  <Textarea
                    id="configuration"
                    name="configuration"
                    value={formValues.configuration}
                    onChange={handleInputChange}
                    placeholder="{}"
                    rows={10}
                    className="font-mono text-sm"
                  />
                </div>
              </TabsContent>
            </Tabs>

            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => isCreating ? setIsCreating(false) : setIsEditing(false)}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={createTemplateMutation.isPending || updateTemplateMutation.isPending}
              >
                {createTemplateMutation.isPending || updateTemplateMutation.isPending ? (
                  "Saving..."
                ) : (
                  isEditing ? "Update Template" : "Create Template"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Preview Template Dialog */}
      {selectedTemplate && (
        <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Template Preview: {selectedTemplate.name}</DialogTitle>
            </DialogHeader>
            
            <Tabs defaultValue="rendered" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="rendered">Rendered Template</TabsTrigger>
                <TabsTrigger value="html">HTML Content</TabsTrigger>
                <TabsTrigger value="css">CSS Styles</TabsTrigger>
              </TabsList>
              
              <TabsContent value="rendered" className="space-y-4 pt-4">
                <div className="border rounded-md p-4">
                  <style dangerouslySetInnerHTML={{ __html: selectedTemplate.css_styles || "" }} />
                  <div 
                    dangerouslySetInnerHTML={{ 
                      __html: selectedTemplate.html_template
                        .replace(/{{referenceNumber}}/g, "GSW23051234567")
                        .replace(/{{currentDate}}/g, new Date().toLocaleDateString())
                        .replace(/{{customerName}}/g, "John Doe")
                        .replace(/{{deviceType}}/g, "Smartphone")
                        .replace(/{{manufacturer}}/g, "Apple")
                        .replace(/{{model}}/g, "iPhone 13 Pro")
                        .replace(/{{condition}}/g, "Excellent")
                        .replace(/{{imei}}/g, "123456789012345")
                        .replace(/{{price}}/g, "$650.00")
                    }} 
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="html" className="space-y-4 pt-4">
                <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto text-sm font-mono">
                  {selectedTemplate.html_template}
                </pre>
              </TabsContent>
              
              <TabsContent value="css" className="space-y-4 pt-4">
                <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto text-sm font-mono">
                  {selectedTemplate.css_styles || "/* No CSS styles defined */"}
                </pre>
              </TabsContent>
            </Tabs>
            
            <DialogFooter>
              <Button onClick={() => setIsPreviewOpen(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Template</DialogTitle>
          </DialogHeader>
          <p>
            Are you sure you want to delete the template <strong>{selectedTemplate?.name}</strong>?
            This action cannot be undone.
          </p>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={() => selectedTemplate && deleteTemplateMutation.mutate(selectedTemplate.id)}
              disabled={deleteTemplateMutation.isPending}
            >
              {deleteTemplateMutation.isPending ? "Deleting..." : "Delete Template"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default AdminInvoiceTemplates;