import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { queryClient } from '@/lib/queryClient';
import { PlusCircle, Pencil, Trash2, Plus, Minus } from 'lucide-react';
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
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

interface DeviceType {
  id: number;
  name: string;
  slug: string;
  icon: string;
  active: boolean;
}

interface ConditionOption {
  id: number;
  text: string;
  value: string;
}

interface ConditionQuestion {
  id: number;
  question: string;
  device_type_id: number;
  tooltip: string;
  order: number;
  active: boolean;
  options: ConditionOption[];
  deviceType?: DeviceType;
}

const ConditionQuestionsAdmin: React.FC = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<ConditionQuestion | null>(null);
  const [formData, setFormData] = useState({
    question: '',
    device_type_id: '',
    tooltip: '',
    order: '1',
    active: true,
    options: [{ text: '', value: '' }]
  });
  const { toast } = useToast();

  // Query hooks for fetching data
  const { data: questions, isLoading: isLoadingQuestions } = useQuery<ConditionQuestion[]>({
    queryKey: ['/api/condition-questions'],
  });

  const { data: deviceTypes, isLoading: isLoadingDeviceTypes } = useQuery<DeviceType[]>({
    queryKey: ['/api/device-types'],
  });

  // Mutation hooks for creating, updating, and deleting condition questions
  const createQuestionMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/condition-questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create condition question');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/condition-questions'] });
      setIsAddModalOpen(false);
      resetForm();
      toast({
        title: 'Success',
        description: 'Condition question created successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const updateQuestionMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch(`/api/condition-questions/${data.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update condition question');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/condition-questions'] });
      setIsEditModalOpen(false);
      resetForm();
      toast({
        title: 'Success',
        description: 'Condition question updated successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const deleteQuestionMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/condition-questions/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete condition question');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/condition-questions'] });
      setIsDeleteModalOpen(false);
      setSelectedQuestion(null);
      toast({
        title: 'Success',
        description: 'Condition question deleted successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Helper functions
  const resetForm = () => {
    setFormData({
      question: '',
      device_type_id: '',
      tooltip: '',
      order: '1',
      active: true,
      options: [{ text: '', value: '' }]
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  const handleOptionChange = (index: number, field: 'text' | 'value', value: string) => {
    const updatedOptions = [...formData.options];
    updatedOptions[index] = { ...updatedOptions[index], [field]: value };
    setFormData((prev) => ({ ...prev, options: updatedOptions }));
  };

  const addOption = () => {
    setFormData((prev) => ({
      ...prev,
      options: [...prev.options, { text: '', value: '' }]
    }));
  };

  const removeOption = (index: number) => {
    if (formData.options.length > 1) {
      const updatedOptions = formData.options.filter((_, i) => i !== index);
      setFormData((prev) => ({ ...prev, options: updatedOptions }));
    }
  };

  const handleAddQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      question: formData.question,
      device_type_id: parseInt(formData.device_type_id),
      tooltip: formData.tooltip,
      order: parseInt(formData.order),
      active: formData.active,
      options: formData.options
    };
    createQuestionMutation.mutate(data);
  };

  const handleEditQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedQuestion) {
      const data = {
        id: selectedQuestion.id,
        question: formData.question,
        device_type_id: parseInt(formData.device_type_id),
        tooltip: formData.tooltip,
        order: parseInt(formData.order),
        active: formData.active,
        options: formData.options
      };
      updateQuestionMutation.mutate(data);
    }
  };

  const handleDeleteQuestion = () => {
    if (selectedQuestion) {
      deleteQuestionMutation.mutate(selectedQuestion.id);
    }
  };

  const openEditModal = (question: ConditionQuestion) => {
    setSelectedQuestion(question);
    setFormData({
      question: question.question,
      device_type_id: question.device_type_id.toString(),
      tooltip: question.tooltip || '',
      order: question.order.toString(),
      active: question.active,
      options: question.options.map(option => ({
        text: option.text,
        value: option.value
      }))
    });
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (question: ConditionQuestion) => {
    setSelectedQuestion(question);
    setIsDeleteModalOpen(true);
  };

  if (isLoadingQuestions || isLoadingDeviceTypes) {
    return (
      <div className="p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Condition Questions</h1>
        </div>
        <div className="text-center py-10">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading condition questions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Condition Questions</h1>
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogTrigger asChild>
            <Button className="mb-4 flex items-center gap-2">
              <PlusCircle size={16} />
              Add New Question
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Add New Condition Question</DialogTitle>
              <DialogDescription>
                Create a new assessment question for device condition evaluation.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddQuestion} className="space-y-4 py-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="question">Question Text</Label>
                  <Input
                    id="question"
                    name="question"
                    value={formData.question}
                    onChange={handleInputChange}
                    required
                    placeholder="E.g., Is the device in working condition?"
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
                      <SelectValue placeholder="Select Device Type" />
                    </SelectTrigger>
                    <SelectContent>
                      {deviceTypes?.map((type) => (
                        <SelectItem key={type.id} value={type.id.toString()}>
                          {type.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="tooltip">Tooltip Text (Optional)</Label>
                  <Input
                    id="tooltip"
                    name="tooltip"
                    value={formData.tooltip}
                    onChange={handleInputChange}
                    placeholder="Helpful explanation text"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="order">Display Order</Label>
                    <Input
                      id="order"
                      name="order"
                      type="number"
                      min="1"
                      value={formData.order}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2 pt-8">
                    <input
                      type="checkbox"
                      id="active"
                      name="active"
                      checked={formData.active}
                      onChange={handleCheckboxChange}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 h-4 w-4"
                    />
                    <Label htmlFor="active" className="cursor-pointer">Active</Label>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Answer Options</Label>
                    <Button 
                      type="button" 
                      onClick={addOption}
                      variant="outline"
                      size="sm"
                      className="h-8"
                    >
                      <Plus className="h-4 w-4 mr-1" /> Add Option
                    </Button>
                  </div>
                  
                  {formData.options.map((option, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="flex-1">
                        <Input
                          placeholder="Option text (e.g., Yes, it's working perfectly)"
                          value={option.text}
                          onChange={(e) => handleOptionChange(index, 'text', e.target.value)}
                          required
                        />
                      </div>
                      <div className="w-24">
                        <Input
                          placeholder="Value (e.g., 1.0)"
                          value={option.value}
                          onChange={(e) => handleOptionChange(index, 'value', e.target.value)}
                          required
                        />
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeOption(index)}
                        disabled={formData.options.length <= 1}
                        className="h-8 w-8"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createQuestionMutation.isPending}>
                  {createQuestionMutation.isPending ? 'Creating...' : 'Create Question'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {questions && questions.length > 0 ? (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <Accordion type="single" collapsible className="w-full">
            {questions.map((question) => {
              const deviceType = deviceTypes?.find(dt => dt.id === question.device_type_id);
              return (
                <AccordionItem key={question.id} value={question.id.toString()}>
                  <AccordionTrigger className="px-4 py-3 hover:bg-gray-50">
                    <div className="flex justify-between items-center w-full pr-4">
                      <div className="flex items-center">
                        <span className={`h-2 w-2 rounded-full mr-2 ${question.active ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                        <span className="font-medium">{question.question}</span>
                      </div>
                      <div className="text-sm text-gray-500">
                        {deviceType?.name} (Order: {question.order})
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4">
                    <div className="space-y-4">
                      <div className="flex justify-between items-start">
                        <div>
                          {question.tooltip && (
                            <div className="mt-1 text-sm text-gray-500">
                              <span className="font-medium">Tooltip:</span> {question.tooltip}
                            </div>
                          )}
                          <div className="mt-4">
                            <h4 className="text-sm font-medium mb-2">Answer Options:</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {question.options.map((option, index) => (
                                <div key={index} className="bg-gray-50 px-3 py-2 rounded-md flex justify-between">
                                  <span>{option.text}</span>
                                  <span className="text-gray-500">Value: {option.value}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditModal(question)}
                          >
                            <Pencil className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openDeleteModal(question)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-gray-600">No condition questions found.</p>
        </div>
      )}

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Edit Condition Question</DialogTitle>
            <DialogDescription>
              Update the assessment question for device condition evaluation.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditQuestion} className="space-y-4 py-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-question">Question Text</Label>
                  <Input
                    id="edit-question"
                    name="question"
                    value={formData.question}
                    onChange={handleInputChange}
                    required
                    placeholder="E.g., Is the device in working condition?"
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
                      <SelectValue placeholder="Select Device Type" />
                    </SelectTrigger>
                    <SelectContent>
                      {deviceTypes?.map((type) => (
                        <SelectItem key={type.id} value={type.id.toString()}>
                          {type.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-tooltip">Tooltip Text (Optional)</Label>
                  <Input
                    id="edit-tooltip"
                    name="tooltip"
                    value={formData.tooltip}
                    onChange={handleInputChange}
                    placeholder="Helpful explanation text"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-order">Display Order</Label>
                    <Input
                      id="edit-order"
                      name="order"
                      type="number"
                      min="1"
                      value={formData.order}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2 pt-8">
                    <input
                      type="checkbox"
                      id="edit-active"
                      name="active"
                      checked={formData.active}
                      onChange={handleCheckboxChange}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 h-4 w-4"
                    />
                    <Label htmlFor="edit-active" className="cursor-pointer">Active</Label>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Answer Options</Label>
                    <Button 
                      type="button" 
                      onClick={addOption}
                      variant="outline"
                      size="sm"
                      className="h-8"
                    >
                      <Plus className="h-4 w-4 mr-1" /> Add Option
                    </Button>
                  </div>
                  
                  {formData.options.map((option, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="flex-1">
                        <Input
                          placeholder="Option text (e.g., Yes, it's working perfectly)"
                          value={option.text}
                          onChange={(e) => handleOptionChange(index, 'text', e.target.value)}
                          required
                        />
                      </div>
                      <div className="w-24">
                        <Input
                          placeholder="Value (e.g., 1.0)"
                          value={option.value}
                          onChange={(e) => handleOptionChange(index, 'value', e.target.value)}
                          required
                        />
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeOption(index)}
                        disabled={formData.options.length <= 1}
                        className="h-8 w-8"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={updateQuestionMutation.isPending}>
                  {updateQuestionMutation.isPending ? 'Updating...' : 'Update Question'}
                </Button>
              </DialogFooter>
            </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Condition Question</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this condition question? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {selectedQuestion && (
              <div className="p-4 bg-gray-50 rounded-md">
                <p><span className="font-medium">Question:</span> {selectedQuestion.question}</p>
                <p><span className="font-medium">Device Type:</span> {deviceTypes?.find(dt => dt.id === selectedQuestion.device_type_id)?.name}</p>
                <p><span className="font-medium">Options:</span> {selectedQuestion.options.length}</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsDeleteModalOpen(false)}
            >
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
    </div>
  );
};

export default ConditionQuestionsAdmin;