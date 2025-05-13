import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { queryClient, apiRequest } from '@/lib/queryClient';
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
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Pencil, Trash2, MoveUp, MoveDown, Copy } from 'lucide-react';

interface ConditionOption {
  id: number;
  text: string;
  answer?: string;
  value: string | number;
}

interface ConditionQuestion {
  id: number;
  question: string;
  deviceTypeId: number;
  order: number;
  active: boolean;
  options: ConditionOption[];
}

interface DeviceType {
  id: number;
  name: string;
  icon?: string;
  slug: string;
}

interface ManufacturerBrand {
  id: number;
  name: string;
  slug: string;
  logo?: string;
}

const ConditionQuestionsAdmin: React.FC = () => {
  const [selectedDeviceType, setSelectedDeviceType] = useState<number | null>(null);
  const [selectedQuestion, setSelectedQuestion] = useState<ConditionQuestion | null>(null);
  const [isAddQuestionOpen, setIsAddQuestionOpen] = useState(false);
  const [isEditQuestionOpen, setIsEditQuestionOpen] = useState(false);
  const [isDeleteQuestionOpen, setIsDeleteQuestionOpen] = useState(false);
  const [formData, setFormData] = useState({
    question: '',
    deviceTypeId: '',
    active: true,
    options: [{ text: '', value: '', answer: '' }],
  });
  const { toast } = useToast();

  // Query hooks for fetching data
  const { data: deviceTypes, isLoading: isLoadingDeviceTypes } = useQuery<DeviceType[]>({
    queryKey: ['/api/device-types'],
    retry: 1,
  });

  const { data: questions, isLoading: isLoadingQuestions } = useQuery<ConditionQuestion[]>({
    queryKey: ['/api/condition-questions', selectedDeviceType],
    queryFn: async () => {
      const url = selectedDeviceType
        ? `/api/condition-questions?deviceTypeId=${selectedDeviceType}`
        : '/api/condition-questions';
      return apiRequest('GET', url).then(res => res.json());
    },
    enabled: true,
  });

  // Mutation hooks for question operations
  const createQuestionMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return apiRequest('POST', '/api/condition-questions', {
        ...data,
        deviceTypeId: parseInt(data.deviceTypeId),
        options: data.options.map(option => ({
          ...option,
          value: option.value === '' ? 0 : parseFloat(option.value)
        })),
      }).then(res => res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/condition-questions'] });
      setIsAddQuestionOpen(false);
      resetForm();
      toast({
        title: 'Success',
        description: 'Question created successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create question',
        variant: 'destructive',
      });
    },
  });

  const updateQuestionMutation = useMutation({
    mutationFn: async (data: typeof formData & { id: number }) => {
      return apiRequest('PUT', `/api/condition-questions/${data.id}`, {
        ...data,
        deviceTypeId: parseInt(data.deviceTypeId),
        options: data.options.map(option => ({
          ...option,
          value: option.value === '' ? 0 : parseFloat(option.value)
        })),
      }).then(res => res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/condition-questions'] });
      setIsEditQuestionOpen(false);
      setSelectedQuestion(null);
      resetForm();
      toast({
        title: 'Success',
        description: 'Question updated successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update question',
        variant: 'destructive',
      });
    },
  });

  const deleteQuestionMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest('DELETE', `/api/condition-questions/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/condition-questions'] });
      setIsDeleteQuestionOpen(false);
      setSelectedQuestion(null);
      toast({
        title: 'Success',
        description: 'Question deleted successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete question',
        variant: 'destructive',
      });
    },
  });

  const changeQuestionOrderMutation = useMutation({
    mutationFn: async ({ id, direction }: { id: number, direction: 'up' | 'down' }) => {
      return apiRequest('POST', `/api/condition-questions/${id}/order`, { direction }).then(res => res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/condition-questions'] });
      toast({
        title: 'Success',
        description: 'Question order updated',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update question order',
        variant: 'destructive',
      });
    },
  });

  // Helper functions
  const resetForm = () => {
    setFormData({
      question: '',
      deviceTypeId: '',
      active: true,
      options: [{ text: '', value: '', answer: '' }],
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (checked: boolean) => {
    setFormData(prev => ({ ...prev, active: checked }));
  };

  const handleOptionChange = (index: number, field: keyof ConditionOption, value: string) => {
    setFormData(prev => {
      const newOptions = [...prev.options];
      newOptions[index] = { ...newOptions[index], [field]: value };
      return { ...prev, options: newOptions };
    });
  };

  const addOption = () => {
    setFormData(prev => ({
      ...prev,
      options: [...prev.options, { text: '', value: '', answer: '' }],
    }));
  };

  const removeOption = (index: number) => {
    if (formData.options.length <= 1) {
      toast({
        title: 'Error',
        description: 'At least one option is required',
        variant: 'destructive',
      });
      return;
    }
    
    setFormData(prev => {
      const newOptions = [...prev.options];
      newOptions.splice(index, 1);
      return { ...prev, options: newOptions };
    });
  };

  const handleAddQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.question) {
      toast({
        title: 'Validation Error',
        description: 'Question text is required',
        variant: 'destructive',
      });
      return;
    }
    
    if (!formData.deviceTypeId) {
      toast({
        title: 'Validation Error',
        description: 'Device type is required',
        variant: 'destructive',
      });
      return;
    }
    
    const invalidOptions = formData.options.some(option => !option.text || option.value === '');
    if (invalidOptions) {
      toast({
        title: 'Validation Error',
        description: 'All options must have text and value',
        variant: 'destructive',
      });
      return;
    }
    
    createQuestionMutation.mutate(formData);
  };

  const handleEditQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedQuestion) return;
    
    // Validate form
    if (!formData.question) {
      toast({
        title: 'Validation Error',
        description: 'Question text is required',
        variant: 'destructive',
      });
      return;
    }
    
    if (!formData.deviceTypeId) {
      toast({
        title: 'Validation Error',
        description: 'Device type is required',
        variant: 'destructive',
      });
      return;
    }
    
    const invalidOptions = formData.options.some(option => !option.text || option.value === '');
    if (invalidOptions) {
      toast({
        title: 'Validation Error',
        description: 'All options must have text and value',
        variant: 'destructive',
      });
      return;
    }
    
    updateQuestionMutation.mutate({
      ...formData,
      id: selectedQuestion.id,
    });
  };

  const handleDeleteQuestion = () => {
    if (selectedQuestion) {
      deleteQuestionMutation.mutate(selectedQuestion.id);
    }
  };

  const handleChangeOrder = (id: number, direction: 'up' | 'down') => {
    changeQuestionOrderMutation.mutate({ id, direction });
  };

  const openEditQuestionModal = (question: ConditionQuestion) => {
    setSelectedQuestion(question);
    setFormData({
      question: question.question,
      deviceTypeId: question.deviceTypeId.toString(),
      active: question.active,
      options: question.options.map(option => ({
        text: option.text,
        value: option.value.toString(),
        answer: option.answer || '',
      })),
    });
    setIsEditQuestionOpen(true);
  };

  const openDeleteQuestionModal = (question: ConditionQuestion) => {
    setSelectedQuestion(question);
    setIsDeleteQuestionOpen(true);
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
        <h1 className="text-2xl font-bold mb-6">Condition Questions</h1>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  const renderAddQuestionModal = () => (
    <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Add New Question</DialogTitle>
        <DialogDescription>
          Create a new condition assessment question for device valuation.
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleAddQuestion} className="space-y-4 py-4">
        <div className="space-y-2">
          <Label htmlFor="question">Question Text</Label>
          <Textarea
            id="question"
            name="question"
            value={formData.question}
            onChange={handleInputChange}
            placeholder="e.g., What is the condition of the screen?"
            className="min-h-[80px]"
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="deviceTypeId">Device Type</Label>
          <Select 
            value={formData.deviceTypeId} 
            onValueChange={(value) => handleSelectChange('deviceTypeId', value)}
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
        
        <div className="flex items-center space-x-2">
          <Switch
            checked={formData.active}
            onCheckedChange={handleSwitchChange}
            id="active"
          />
          <Label htmlFor="active">Active</Label>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Options</Label>
            <Button type="button" variant="outline" size="sm" onClick={addOption}>
              <Plus className="mr-1 h-4 w-4" /> Add Option
            </Button>
          </div>
          
          {formData.options.map((option, index) => (
            <div key={index} className="border p-4 rounded-md space-y-3">
              <div className="flex justify-between items-center">
                <h4 className="text-sm font-medium">Option {index + 1}</h4>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => removeOption(index)}
                  className="h-8 w-8 p-0"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor={`option-text-${index}`}>Option Text</Label>
                <Input
                  id={`option-text-${index}`}
                  value={option.text}
                  onChange={(e) => handleOptionChange(index, 'text', e.target.value)}
                  placeholder="e.g., Excellent, Good, Fair, Poor"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor={`option-value-${index}`}>Value Impact</Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500">%</span>
                  </div>
                  <Input
                    id={`option-value-${index}`}
                    value={option.value}
                    onChange={(e) => handleOptionChange(index, 'value', e.target.value)}
                    placeholder="e.g., 100, 80, 60, 40"
                    type="number"
                    min="-100"
                    max="100"
                    className="pl-8"
                    required
                  />
                </div>
                <p className="text-xs text-gray-500">
                  Percentage value used to calculate device condition. Use positive for increasing value, negative for reducing.
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor={`option-answer-${index}`}>Answer Description (Optional)</Label>
                <Input
                  id={`option-answer-${index}`}
                  value={option.answer || ''}
                  onChange={(e) => handleOptionChange(index, 'answer', e.target.value)}
                  placeholder="Additional description for this option"
                />
              </div>
            </div>
          ))}
        </div>
        
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setIsAddQuestionOpen(false)}>
            Cancel
          </Button>
          <Button type="submit" disabled={createQuestionMutation.isPending}>
            {createQuestionMutation.isPending ? 'Creating...' : 'Create Question'}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );

  const renderEditQuestionModal = () => (
    <Dialog open={isEditQuestionOpen} onOpenChange={setIsEditQuestionOpen}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Question</DialogTitle>
          <DialogDescription>
            Update this condition assessment question.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleEditQuestion} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="edit-question">Question Text</Label>
            <Textarea
              id="edit-question"
              name="question"
              value={formData.question}
              onChange={handleInputChange}
              className="min-h-[80px]"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="edit-deviceTypeId">Device Type</Label>
            <Select 
              value={formData.deviceTypeId} 
              onValueChange={(value) => handleSelectChange('deviceTypeId', value)}
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
          
          <div className="flex items-center space-x-2">
            <Switch
              checked={formData.active}
              onCheckedChange={handleSwitchChange}
              id="edit-active"
            />
            <Label htmlFor="edit-active">Active</Label>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Options</Label>
              <Button type="button" variant="outline" size="sm" onClick={addOption}>
                <Plus className="mr-1 h-4 w-4" /> Add Option
              </Button>
            </div>
            
            {formData.options.map((option, index) => (
              <div key={index} className="border p-4 rounded-md space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="text-sm font-medium">Option {index + 1}</h4>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => removeOption(index)}
                    className="h-8 w-8 p-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor={`edit-option-text-${index}`}>Option Text</Label>
                  <Input
                    id={`edit-option-text-${index}`}
                    value={option.text}
                    onChange={(e) => handleOptionChange(index, 'text', e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor={`edit-option-value-${index}`}>Value Impact</Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500">%</span>
                    </div>
                    <Input
                      id={`edit-option-value-${index}`}
                      value={option.value}
                      onChange={(e) => handleOptionChange(index, 'value', e.target.value)}
                      type="number"
                      min="-100"
                      max="100"
                      className="pl-8"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor={`edit-option-answer-${index}`}>Answer Description (Optional)</Label>
                  <Input
                    id={`edit-option-answer-${index}`}
                    value={option.answer || ''}
                    onChange={(e) => handleOptionChange(index, 'answer', e.target.value)}
                  />
                </div>
              </div>
            ))}
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsEditQuestionOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={updateQuestionMutation.isPending}>
              {updateQuestionMutation.isPending ? 'Updating...' : 'Update Question'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );

  const renderDeleteQuestionModal = () => (
    <Dialog open={isDeleteQuestionOpen} onOpenChange={setIsDeleteQuestionOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Question</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this question? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <p className="font-medium">
            {selectedQuestion?.question}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Device Type: {selectedQuestion ? getDeviceTypeName(selectedQuestion.deviceTypeId) : ''}
          </p>
          <p className="text-sm text-gray-500">
            Options: {selectedQuestion?.options.length || 0}
          </p>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setIsDeleteQuestionOpen(false)}>
            Cancel
          </Button>
          <Button 
            type="button" 
            variant="destructive" 
            onClick={handleDeleteQuestion}
            disabled={deleteQuestionMutation.isPending}
          >
            {deleteQuestionMutation.isPending ? 'Deleting...' : 'Delete Question'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Condition Assessment Questions</h1>
        <Dialog open={isAddQuestionOpen} onOpenChange={setIsAddQuestionOpen}>
          <DialogTrigger asChild>
            <Button className="mb-4">
              <Plus className="mr-2 h-4 w-4" /> Add New Question
            </Button>
          </DialogTrigger>
          {renderAddQuestionModal()}
        </Dialog>
      </div>

      <Tabs defaultValue="questions" className="mb-6">
        <TabsList>
          <TabsTrigger value="questions">Questions</TabsTrigger>
          <TabsTrigger value="preview">Question Flow Preview</TabsTrigger>
        </TabsList>
        
        <TabsContent value="questions">
          <Card className="mb-6">
            <CardHeader className="pb-3">
              <CardTitle>Filter by Device Type</CardTitle>
              <CardDescription>
                Select a device type to view specific questions
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

          {isLoadingQuestions ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : !questions || questions.length === 0 ? (
            <div className="bg-amber-50 p-6 rounded-lg border border-amber-200">
              <h3 className="text-lg font-medium text-amber-800 mb-2">No Questions Found</h3>
              <p className="text-amber-700 mb-4">
                {selectedDeviceType 
                  ? `No questions found for the selected device type.` 
                  : `No condition questions have been created yet. Questions are used to assess device condition and calculate buyback value.`}
              </p>
              <Button onClick={() => setIsAddQuestionOpen(true)}>
                <Plus className="mr-2 h-4 w-4" /> Create Your First Question
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {deviceTypes?.map((deviceType) => {
                const deviceQuestions = questions.filter(q => q.deviceTypeId === deviceType.id);
                
                // Skip device types with no questions if filtering
                if (selectedDeviceType !== null && deviceType.id !== selectedDeviceType) {
                  return null;
                }
                
                if (deviceQuestions.length === 0 && selectedDeviceType === deviceType.id) {
                  return (
                    <div key={deviceType.id} className="bg-amber-50 p-6 rounded-lg border border-amber-200">
                      <h3 className="text-lg font-medium text-amber-800 mb-2">No Questions for {deviceType.name}</h3>
                      <p className="text-amber-700 mb-4">
                        No condition questions have been created for this device type yet.
                      </p>
                      <Button onClick={() => {
                        handleSelectChange('deviceTypeId', deviceType.id.toString());
                        setIsAddQuestionOpen(true);
                      }}>
                        <Plus className="mr-2 h-4 w-4" /> Add Question for {deviceType.name}
                      </Button>
                    </div>
                  );
                }
                
                if (deviceQuestions.length === 0) {
                  return null;
                }
                
                return (
                  <Card key={deviceType.id}>
                    <CardHeader>
                      <CardTitle>{deviceType.name} Questions</CardTitle>
                      <CardDescription>
                        Condition questions for {deviceType.name} devices
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-14">Order</TableHead>
                            <TableHead>Question</TableHead>
                            <TableHead>Options</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {deviceQuestions
                            .sort((a, b) => a.order - b.order)
                            .map((question) => (
                            <TableRow key={question.id}>
                              <TableCell>
                                <div className="flex flex-col space-y-1">
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-5 w-5"
                                    onClick={() => handleChangeOrder(question.id, 'up')}
                                  >
                                    <MoveUp size={14} />
                                  </Button>
                                  <span className="text-center">{question.order}</span>
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-5 w-5"
                                    onClick={() => handleChangeOrder(question.id, 'down')}
                                  >
                                    <MoveDown size={14} />
                                  </Button>
                                </div>
                              </TableCell>
                              <TableCell>
                                <p className="font-medium">{question.question}</p>
                              </TableCell>
                              <TableCell>
                                <div className="flex flex-wrap gap-1 max-w-md">
                                  {question.options.map((option, idx) => (
                                    <div 
                                      key={idx}
                                      className="text-xs px-2 py-1 bg-gray-100 rounded-full whitespace-nowrap"
                                      title={`Value impact: ${option.value}%`}
                                    >
                                      {option.text}
                                    </div>
                                  ))}
                                </div>
                              </TableCell>
                              <TableCell>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${question.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                                  {question.active ? 'Active' : 'Inactive'}
                                </span>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end space-x-2">
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => {
                                      // Set up for duplication but open add dialog
                                      setFormData({
                                        question: `${question.question} (Copy)`,
                                        deviceTypeId: question.deviceTypeId.toString(),
                                        active: question.active,
                                        options: question.options.map(option => ({
                                          text: option.text,
                                          value: option.value.toString(),
                                          answer: option.answer || '',
                                        })),
                                      });
                                      setIsAddQuestionOpen(true);
                                    }}
                                    title="Duplicate"
                                  >
                                    <Copy size={14} className="mr-1" />
                                    Duplicate
                                  </Button>
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => openEditQuestionModal(question)}
                                    title="Edit"
                                  >
                                    <Pencil size={14} className="mr-1" />
                                    Edit
                                  </Button>
                                  <Button 
                                    variant="destructive" 
                                    size="sm"
                                    onClick={() => openDeleteQuestionModal(question)}
                                    title="Delete"
                                  >
                                    <Trash2 size={14} className="mr-1" />
                                    Delete
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="preview">
          <Card>
            <CardHeader>
              <CardTitle>Question Flow Preview</CardTitle>
              <CardDescription>
                Preview how the condition questions will appear to users
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="bg-gray-50 border p-4 rounded-md">
                  <div className="mb-4">
                    <Label className="mb-2 block">Select Device Type to Preview</Label>
                    <Select onValueChange={(value) => setSelectedDeviceType(parseInt(value))}>
                      <SelectTrigger className="w-full md:w-1/2">
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
                  
                  {selectedDeviceType && questions && (
                    <div className="border rounded-md p-6 bg-white">
                      <h3 className="text-lg font-medium mb-6">
                        {getDeviceTypeName(selectedDeviceType)} Condition Assessment
                      </h3>
                      
                      {questions
                        .filter(q => q.deviceTypeId === selectedDeviceType && q.active)
                        .sort((a, b) => a.order - b.order)
                        .length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          <p>No active questions for this device type.</p>
                        </div>
                      ) : (
                        <Accordion type="single" collapsible className="w-full">
                          {questions
                            .filter(q => q.deviceTypeId === selectedDeviceType && q.active)
                            .sort((a, b) => a.order - b.order)
                            .map((question, idx) => (
                              <AccordionItem key={question.id} value={`question-${question.id}`}>
                                <AccordionTrigger className="text-left">
                                  <span className="font-medium flex">
                                    <span className="w-8 flex-shrink-0">{idx + 1}.</span>
                                    <span>{question.question}</span>
                                  </span>
                                </AccordionTrigger>
                                <AccordionContent className="pl-8">
                                  <div className="py-2 space-y-4">
                                    {question.options.map((option, optIdx) => (
                                      <div key={optIdx} className="flex items-start space-x-2">
                                        <div className="border-2 rounded-full w-5 h-5 mt-0.5 flex-shrink-0" />
                                        <div>
                                          <p className="font-medium">{option.text}</p>
                                          {option.answer && (
                                            <p className="text-sm text-gray-600 mt-1">{option.answer}</p>
                                          )}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </AccordionContent>
                              </AccordionItem>
                            ))
                          }
                        </Accordion>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Render modals */}
      {renderEditQuestionModal()}
      {renderDeleteQuestionModal()}
    </div>
  );
};

export default ConditionQuestionsAdmin;