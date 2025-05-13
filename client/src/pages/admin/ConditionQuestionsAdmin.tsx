import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Plus, Edit, Trash, MoreHorizontal, ChevronUp, ChevronDown } from 'lucide-react';
import QuestionForm from '@/components/admin/QuestionForm';

interface ConditionOption {
  id?: number;
  text: string;
  answer?: string;
  value: string | number;
}

interface ConditionQuestion {
  id: number;
  question: string;
  deviceTypeId: number;
  brandId?: number | null;
  order: number;
  active: boolean;
  required: boolean;
  questionType: string;
  helpText?: string;
  options: ConditionOption[];
}

interface DeviceType {
  id: number;
  name: string;
  slug: string;
  icon?: string;
  active?: boolean;
}

interface Brand {
  id: number;
  name: string;
  slug: string;
  logo?: string;
  active?: boolean;
}

export default function ConditionQuestionsAdmin() {
  const [selectedDeviceType, setSelectedDeviceType] = useState<string>('all');
  const [editingQuestion, setEditingQuestion] = useState<ConditionQuestion | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState<number | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Fetch device types for filtering
  const { data: deviceTypes, isLoading: loadingDeviceTypes } = useQuery({
    queryKey: ['/api/device-types'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/device-types');
      return response.json();
    }
  });
  
  // Fetch brands
  const { data: brands, isLoading: loadingBrands } = useQuery({
    queryKey: ['/api/brands'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/brands');
      return response.json();
    }
  });
  
  // Fetch condition questions, filtered by device type if selected
  const { data: questions, isLoading: loadingQuestions } = useQuery({
    queryKey: ['/api/condition-questions', selectedDeviceType],
    queryFn: async () => {
      const endpoint = selectedDeviceType && selectedDeviceType !== 'all'
        ? `/api/condition-questions?deviceTypeId=${selectedDeviceType}` 
        : '/api/condition-questions';
      const response = await apiRequest('GET', endpoint);
      return response.json();
    }
  });

  // Mutations for CRUD operations
  const createQuestionMutation = useMutation({
    mutationFn: async (questionData: Omit<ConditionQuestion, 'id'>) => {
      const response = await apiRequest('POST', '/api/condition-questions', questionData);
      return response.json();
    },
    onSuccess: () => {
      toast({ title: 'Success', description: 'Question created successfully' });
      queryClient.invalidateQueries({ queryKey: ['/api/condition-questions'] });
      setShowAddDialog(false);
    },
    onError: (error: any) => {
      toast({ 
        title: 'Error', 
        description: `Failed to create question: ${error.message}`, 
        variant: 'destructive' 
      });
    }
  });

  const updateQuestionMutation = useMutation({
    mutationFn: async (questionData: ConditionQuestion) => {
      const response = await apiRequest('PUT', `/api/condition-questions/${questionData.id}`, questionData);
      return response.json();
    },
    onSuccess: () => {
      toast({ title: 'Success', description: 'Question updated successfully' });
      queryClient.invalidateQueries({ queryKey: ['/api/condition-questions'] });
      setEditingQuestion(null);
    },
    onError: (error: any) => {
      toast({ 
        title: 'Error', 
        description: `Failed to update question: ${error.message}`, 
        variant: 'destructive' 
      });
    }
  });

  const deleteQuestionMutation = useMutation({
    mutationFn: async (questionId: number) => {
      const response = await apiRequest('DELETE', `/api/condition-questions/${questionId}`);
      return response.json();
    },
    onSuccess: () => {
      toast({ title: 'Success', description: 'Question deleted successfully' });
      queryClient.invalidateQueries({ queryKey: ['/api/condition-questions'] });
      setShowDeleteDialog(false);
      setQuestionToDelete(null);
    },
    onError: (error: any) => {
      toast({ 
        title: 'Error', 
        description: `Failed to delete question: ${error.message}`, 
        variant: 'destructive' 
      });
    }
  });

  const getDeviceTypeName = (id: number) => {
    if (!deviceTypes) return 'Unknown';
    const deviceType = deviceTypes.find((type: DeviceType) => type.id === id);
    return deviceType ? deviceType.name : 'Unknown';
  };
  
  const getBrandName = (id: number) => {
    if (!deviceTypes) return 'Unknown';
    const brand = brands?.find((brand: Brand) => brand.id === id);
    return brand ? brand.name : 'Unknown';
  };
  
  const getQuestionTypeName = (type: string) => {
    const typeMap: Record<string, string> = {
      'multiple_choice': 'Multiple Choice',
      'single_choice': 'Single Choice',
      'yes_no': 'Yes/No',
      'text': 'Text Input',
      'numeric': 'Numeric Input'
    };
    
    return typeMap[type] || type;
  };

  const handleChangeOrder = (question: ConditionQuestion, direction: 'up' | 'down') => {
    const newOrder = direction === 'up' ? question.order - 1 : question.order + 1;
    if (newOrder < 0) return;
    
    updateQuestionMutation.mutate({
      ...question,
      order: newOrder
    });
  };

  const handleAddQuestion = (questionData: Omit<ConditionQuestion, 'id'>) => {
    createQuestionMutation.mutate(questionData);
  };

  const handleEditQuestion = (questionData: ConditionQuestion) => {
    updateQuestionMutation.mutate(questionData);
  };

  const handleDeleteQuestion = () => {
    if (questionToDelete) {
      deleteQuestionMutation.mutate(questionToDelete);
    }
  };

  const openDeleteDialog = (questionId: number) => {
    setQuestionToDelete(questionId);
    setShowDeleteDialog(true);
  };

  const toggleQuestionStatus = (question: ConditionQuestion) => {
    updateQuestionMutation.mutate({
      ...question,
      active: !question.active
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Condition Questions Management</h1>
      </div>
      
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Device Condition Questions</CardTitle>
                <CardDescription>
                  Manage questions shown to users during the device assessment process
                </CardDescription>
              </div>
              <Button onClick={() => setShowAddDialog(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Question
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-4 max-w-sm">
              <Label htmlFor="deviceType">Filter by Device Type</Label>
              <Select 
                value={selectedDeviceType} 
                onValueChange={setSelectedDeviceType}
              >
                <SelectTrigger id="deviceType">
                  <SelectValue placeholder="All Device Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Device Types</SelectItem>
                  {deviceTypes && deviceTypes.map((type: DeviceType) => (
                    <SelectItem key={type.id} value={type.id.toString()}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {loadingQuestions ? (
              <div className="flex justify-center items-center py-10">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">Order</TableHead>
                    <TableHead>Question</TableHead>
                    <TableHead>Device Type</TableHead>
                    <TableHead>Brand</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Required</TableHead>
                    <TableHead>Options</TableHead>
                    <TableHead className="w-[100px]">Status</TableHead>
                    <TableHead className="text-right w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {questions && questions.length > 0 ? (
                    questions.map((question: ConditionQuestion) => (
                      <TableRow key={question.id}>
                        <TableCell className="font-medium">
                          <div className="flex flex-col items-center">
                            <span>{question.order}</span>
                            <div className="flex space-x-1 mt-1">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-6 w-6 p-0" 
                                onClick={() => handleChangeOrder(question, 'up')}
                              >
                                <ChevronUp className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-6 w-6 p-0" 
                                onClick={() => handleChangeOrder(question, 'down')}
                              >
                                <ChevronDown className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{question.question}</TableCell>
                        <TableCell>{getDeviceTypeName(question.deviceTypeId)}</TableCell>
                        <TableCell>
                          {question.brandId ? getBrandName(question.brandId) : 'Any Brand'}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {getQuestionTypeName(question.questionType)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={question.required ? "default" : "secondary"}>
                            {question.required ? "Required" : "Optional"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {question.options.map((option, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {option.text || option.answer}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={question.active ? "default" : "secondary"}>
                            {question.active ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => setEditingQuestion(question)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => openDeleteDialog(question.id)}>
                                <Trash className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => toggleQuestionStatus(question)}>
                                <Checkbox 
                                  checked={question.active} 
                                  className="mr-2 h-4 w-4"
                                />
                                {question.active ? "Deactivate" : "Activate"}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-6">
                        No condition questions found
                        {selectedDeviceType && selectedDeviceType !== 'all' && " for the selected device type"}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Add Question Dialog */}
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add Condition Question</DialogTitle>
              <DialogDescription>
                Create a new question for the device condition assessment
              </DialogDescription>
            </DialogHeader>
            {deviceTypes && (
              <QuestionForm
                deviceTypes={deviceTypes}
                brands={brands}
                onSubmit={handleAddQuestion}
                onCancel={() => setShowAddDialog(false)}
                isSubmitting={createQuestionMutation.isPending}
              />
            )}
          </DialogContent>
        </Dialog>

        {/* Edit Question Dialog */}
        <Dialog open={!!editingQuestion} onOpenChange={(open) => !open && setEditingQuestion(null)}>
          <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Condition Question</DialogTitle>
              <DialogDescription>
                Update the question details and answer options
              </DialogDescription>
            </DialogHeader>
            {editingQuestion && deviceTypes && (
              <QuestionForm
                initialData={editingQuestion}
                deviceTypes={deviceTypes}
                brands={brands}
                onSubmit={handleEditQuestion}
                onCancel={() => setEditingQuestion(null)}
                isSubmitting={updateQuestionMutation.isPending}
              />
            )}
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Question</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this question? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end space-x-2 mt-4">
              <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleDeleteQuestion}
                disabled={deleteQuestionMutation.isPending}
              >
                {deleteQuestionMutation.isPending ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <Card>
          <CardHeader>
            <CardTitle>Recent Updates</CardTitle>
            <CardDescription>
              Recently added partner assignment feature for buyback requests
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-md bg-green-50 border border-green-200 p-4">
              <h3 className="text-green-800 font-medium mb-2">New Feature: Partner Assignment</h3>
              <p className="text-green-700 text-sm">
                You can now assign buyback requests to partners directly from the 
                Buyback Requests management page. This allows you to connect customers 
                with approved partners who can handle device collection and processing.
              </p>
              <Button variant="outline" className="mt-3" onClick={() => window.location.href = '/admin/buyback'}>
                Go to Buyback Management
              </Button>
            </div>
            
            <div className="rounded-md bg-blue-50 border border-blue-200 p-4">
              <h3 className="text-blue-800 font-medium mb-2">Integration with Partners Management</h3>
              <p className="text-blue-700 text-sm">
                Partners created in the Partners Management section are now available for 
                assignment to incoming buyback requests. Manage your partners' information and 
                regions to ensure efficient lead distribution.
              </p>
              <Button variant="outline" className="mt-3" onClick={() => window.location.href = '/admin/partners'}>
                Go to Partners Management
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}