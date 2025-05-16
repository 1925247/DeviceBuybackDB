import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { 
  ClipboardList, 
  Edit, 
  Plus, 
  RefreshCw, 
  Trash, 
  Search 
} from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';

const AdminInvoiceTemplates: React.FC = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = React.useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = React.useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  const [selectedTemplate, setSelectedTemplate] = React.useState<any>(null);
  
  // Fetch invoice templates data
  const { data: templates, isLoading, refetch } = useQuery({
    queryKey: ['/api/invoice-templates'],
    retry: false,
  });

  // Simplified templates for now to avoid database errors
  const placeholderTemplates = [
    { id: 1, name: 'Standard Invoice', description: 'Default template for all orders', isDefault: true },
    { id: 2, name: 'Detailed Receipt', description: 'Detailed breakdown with tax information', isDefault: false },
    { id: 3, name: 'Partner Commission', description: 'Template for partner payouts', isDefault: false },
  ];

  const handleCreateTemplate = (event: React.FormEvent) => {
    event.preventDefault();
    toast({
      title: 'Template Creation',
      description: 'This feature is coming soon!',
    });
    setIsCreateDialogOpen(false);
  };

  const handleEditTemplate = (event: React.FormEvent) => {
    event.preventDefault();
    toast({
      title: 'Template Update',
      description: 'This feature is coming soon!',
    });
    setIsEditDialogOpen(false);
  };

  const handleDeleteTemplate = (id: number) => {
    toast({
      title: 'Template Deletion',
      description: 'This feature is coming soon!',
    });
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Invoice Templates</h1>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="text"
              placeholder="Search templates..."
              className="pl-8 w-[250px]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Template
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Invoice Template</DialogTitle>
                <DialogDescription>
                  Add a new invoice template to use for orders and transactions.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateTemplate}>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">
                      Name
                    </Label>
                    <Input id="name" className="col-span-3" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="description" className="text-right">
                      Description
                    </Label>
                    <Input id="description" className="col-span-3" />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">Create Template</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Invoice Templates</CardTitle>
          <CardDescription>
            Manage your invoice templates for different types of transactions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : (
            <Table>
              <TableCaption>List of all invoice templates.</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Default</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {placeholderTemplates.map((template) => (
                  <TableRow key={template.id}>
                    <TableCell>{template.id}</TableCell>
                    <TableCell className="font-medium">{template.name}</TableCell>
                    <TableCell>{template.description}</TableCell>
                    <TableCell>
                      {template.isDefault ? (
                        <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700">
                          Default
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600">
                          No
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedTemplate(template);
                          setIsEditDialogOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteTemplate(template.id)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Invoice Template</DialogTitle>
            <DialogDescription>
              Update the selected invoice template details.
            </DialogDescription>
          </DialogHeader>
          {selectedTemplate && (
            <form onSubmit={handleEditTemplate}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-name" className="text-right">
                    Name
                  </Label>
                  <Input
                    id="edit-name"
                    className="col-span-3"
                    defaultValue={selectedTemplate.name}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-description" className="text-right">
                    Description
                  </Label>
                  <Input
                    id="edit-description"
                    className="col-span-3"
                    defaultValue={selectedTemplate.description}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Save Changes</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminInvoiceTemplates;