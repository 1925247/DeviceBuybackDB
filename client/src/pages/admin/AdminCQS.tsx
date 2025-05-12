import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlusCircle, Pencil, Trash2, MessageSquarePlus } from 'lucide-react';

interface DeviceType {
  id: number;
  name: string;
  slug: string;
  icon: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

interface ConditionQuestion {
  id: number;
  text: string;
  help_text: string | null;
  device_type_id: number | null;
  order: number;
  value_impact: number;
  created_at: string;
  updated_at: string;
}

interface ConditionAnswer {
  id: number;
  question_id: number;
  text: string;
  value: number;
  order: number;
  created_at: string;
  updated_at: string;
}

const AdminCQS: React.FC = () => {
  const [activeTab, setActiveTab] = useState('questions');
  const [isAddQuestionOpen, setIsAddQuestionOpen] = useState(false);
  const [isEditQuestionOpen, setIsEditQuestionOpen] = useState(false);
  const [isDeleteQuestionOpen, setIsDeleteQuestionOpen] = useState(false);
  const [isAddAnswerOpen, setIsAddAnswerOpen] = useState(false);
  const [isEditAnswerOpen, setIsEditAnswerOpen] = useState(false);
  const [isDeleteAnswerOpen, setIsDeleteAnswerOpen] = useState(false);

  const [selectedQuestion, setSelectedQuestion] = useState<ConditionQuestion | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<ConditionAnswer | null>(null);
  
  const [questionForm, setQuestionForm] = useState({
    text: '',
    help_text: '',
    device_type_id: '',
    order: 0,
    value_impact: 1,
  });
  
  const [answerForm, setAnswerForm] = useState({
    question_id: '',
    text: '',
    value: 0,
    order: 0,
  });
  
  const { toast } = useToast();

  // Query hooks
  const { data: questions, isLoading: isLoadingQuestions } = useQuery<ConditionQuestion[]>({
    queryKey: ['/api/condition-questions'],
  });

  const { data: answers, isLoading: isLoadingAnswers } = useQuery<ConditionAnswer[]>({
    queryKey: ['/api/condition-answers'],
  });

  const { data: deviceTypes, isLoading: isLoadingDeviceTypes } = useQuery<DeviceType[]>({
    queryKey: ['/api/device-types'],
  });

  // Mutation hooks for questions
  const createQuestionMutation = useMutation({
    mutationFn: async (data: typeof questionForm) => {
      const response = await fetch('/api/condition-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create question');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/condition-questions'] });
      setIsAddQuestionOpen(false);
      resetQuestionForm();
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
    mutationFn: async (data: typeof questionForm & { id: number }) => {
      const response = await fetch(`/api/condition-questions/${data.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update question');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/condition-questions'] });
      setIsEditQuestionOpen(false);
      resetQuestionForm();
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
        throw new Error(error.message || 'Failed to delete question');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/condition-questions'] });
      setIsDeleteQuestionOpen(false);
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

  // Mutation hooks for answers
  const createAnswerMutation = useMutation({
    mutationFn: async (data: typeof answerForm) => {
      const response = await fetch('/api/condition-answers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create answer');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/condition-answers'] });
      setIsAddAnswerOpen(false);
      resetAnswerForm();
      toast({
        title: 'Success',
        description: 'Answer created successfully',
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

  const updateAnswerMutation = useMutation({
    mutationFn: async (data: typeof answerForm & { id: number }) => {
      const response = await fetch(`/api/condition-answers/${data.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update answer');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/condition-answers'] });
      setIsEditAnswerOpen(false);
      resetAnswerForm();
      toast({
        title: 'Success',
        description: 'Answer updated successfully',
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

  const deleteAnswerMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/condition-answers/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete answer');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/condition-answers'] });
      setIsDeleteAnswerOpen(false);
      setSelectedAnswer(null);
      toast({
        title: 'Success',
        description: 'Answer deleted successfully',
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
  const resetQuestionForm = () => {
    setQuestionForm({
      text: '',
      help_text: '',
      device_type_id: '',
      order: 0,
      value_impact: 1,
    });
  };

  const resetAnswerForm = () => {
    setAnswerForm({
      question_id: '',
      text: '',
      value: 0,
      order: 0,
    });
  };

  const handleQuestionFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setQuestionForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleQuestionSelectChange = (name: string, value: string) => {
    setQuestionForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAnswerFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setAnswerForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAnswerSelectChange = (name: string, value: string) => {
    setAnswerForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    createQuestionMutation.mutate({
      ...questionForm,
      order: Number(questionForm.order),
      value_impact: Number(questionForm.value_impact),
      device_type_id: questionForm.device_type_id ? questionForm.device_type_id : null,
    });
  };

  const handleEditQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedQuestion) {
      updateQuestionMutation.mutate({
        ...questionForm,
        id: selectedQuestion.id,
        order: Number(questionForm.order),
        value_impact: Number(questionForm.value_impact),
        device_type_id: questionForm.device_type_id ? questionForm.device_type_id : null,
      });
    }
  };

  const handleDeleteQuestion = () => {
    if (selectedQuestion) {
      deleteQuestionMutation.mutate(selectedQuestion.id);
    }
  };

  const handleAddAnswer = (e: React.FormEvent) => {
    e.preventDefault();
    createAnswerMutation.mutate({
      ...answerForm,
      question_id: Number(answerForm.question_id),
      value: Number(answerForm.value),
      order: Number(answerForm.order),
    });
  };

  const handleEditAnswer = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedAnswer) {
      updateAnswerMutation.mutate({
        ...answerForm,
        id: selectedAnswer.id,
        question_id: Number(answerForm.question_id),
        value: Number(answerForm.value),
        order: Number(answerForm.order),
      });
    }
  };

  const handleDeleteAnswer = () => {
    if (selectedAnswer) {
      deleteAnswerMutation.mutate(selectedAnswer.id);
    }
  };

  const openEditQuestion = (question: ConditionQuestion) => {
    setSelectedQuestion(question);
    setQuestionForm({
      text: question.text,
      help_text: question.help_text || '',
      device_type_id: question.device_type_id ? question.device_type_id.toString() : '',
      order: question.order,
      value_impact: question.value_impact,
    });
    setIsEditQuestionOpen(true);
  };

  const openDeleteQuestion = (question: ConditionQuestion) => {
    setSelectedQuestion(question);
    setIsDeleteQuestionOpen(true);
  };

  const openAddAnswer = (questionId: number) => {
    setAnswerForm((prev) => ({ ...prev, question_id: questionId.toString() }));
    setIsAddAnswerOpen(true);
  };

  const openEditAnswer = (answer: ConditionAnswer) => {
    setSelectedAnswer(answer);
    setAnswerForm({
      question_id: answer.question_id.toString(),
      text: answer.text,
      value: answer.value,
      order: answer.order,
    });
    setIsEditAnswerOpen(true);
  };

  const openDeleteAnswer = (answer: ConditionAnswer) => {
    setSelectedAnswer(answer);
    setIsDeleteAnswerOpen(true);
  };

  const getDeviceTypeName = (typeId: number | null) => {
    if (!typeId) return 'All Devices';
    const type = deviceTypes?.find((t) => t.id === typeId);
    return type ? type.name : 'Unknown';
  };

  const getQuestionText = (questionId: number) => {
    const question = questions?.find((q) => q.id === questionId);
    return question ? question.text : 'Unknown Question';
  };

  // Modals for Questions
  const renderAddQuestionModal = () => (
    <Dialog open={isAddQuestionOpen} onOpenChange={setIsAddQuestionOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <PlusCircle size={16} />
          Add Question
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Condition Question</DialogTitle>
          <DialogDescription>
            Create a new condition assessment question
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleAddQuestion} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="text">Question Text</Label>
            <Input
              id="text"
              name="text"
              value={questionForm.text}
              onChange={handleQuestionFormChange}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="help_text">Help Text (Optional)</Label>
            <Textarea
              id="help_text"
              name="help_text"
              value={questionForm.help_text}
              onChange={handleQuestionFormChange}
              placeholder="Additional information to help users answer the question"
              rows={3}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="device_type_id">Device Type</Label>
            <Select
              value={questionForm.device_type_id}
              onValueChange={(value) => handleQuestionSelectChange('device_type_id', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Device Type (or leave empty for all)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">All Device Types</SelectItem>
                {deviceTypes?.map((type) => (
                  <SelectItem key={type.id} value={type.id.toString()}>
                    {type.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="order">Display Order</Label>
              <Input
                id="order"
                name="order"
                type="number"
                min="0"
                value={questionForm.order.toString()}
                onChange={handleQuestionFormChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="value_impact">Value Impact (1-10)</Label>
              <Input
                id="value_impact"
                name="value_impact"
                type="number"
                min="1"
                max="10"
                value={questionForm.value_impact.toString()}
                onChange={handleQuestionFormChange}
                required
              />
            </div>
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
    </Dialog>
  );

  const renderEditQuestionModal = () => (
    <Dialog open={isEditQuestionOpen} onOpenChange={setIsEditQuestionOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Condition Question</DialogTitle>
          <DialogDescription>
            Update this condition assessment question
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleEditQuestion} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="edit-text">Question Text</Label>
            <Input
              id="edit-text"
              name="text"
              value={questionForm.text}
              onChange={handleQuestionFormChange}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="edit-help_text">Help Text (Optional)</Label>
            <Textarea
              id="edit-help_text"
              name="help_text"
              value={questionForm.help_text}
              onChange={handleQuestionFormChange}
              placeholder="Additional information to help users answer the question"
              rows={3}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="edit-device_type_id">Device Type</Label>
            <Select
              value={questionForm.device_type_id}
              onValueChange={(value) => handleQuestionSelectChange('device_type_id', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Device Type (or leave empty for all)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">All Device Types</SelectItem>
                {deviceTypes?.map((type) => (
                  <SelectItem key={type.id} value={type.id.toString()}>
                    {type.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-order">Display Order</Label>
              <Input
                id="edit-order"
                name="order"
                type="number"
                min="0"
                value={questionForm.order.toString()}
                onChange={handleQuestionFormChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-value_impact">Value Impact (1-10)</Label>
              <Input
                id="edit-value_impact"
                name="value_impact"
                type="number"
                min="1"
                max="10"
                value={questionForm.value_impact.toString()}
                onChange={handleQuestionFormChange}
                required
              />
            </div>
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
          <DialogTitle>Delete Condition Question</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this question? This will also delete all associated answers.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <p className="font-medium">{selectedQuestion?.text}</p>
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

  // Modals for Answers
  const renderAddAnswerModal = () => (
    <Dialog open={isAddAnswerOpen} onOpenChange={setIsAddAnswerOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Answer Option</DialogTitle>
          <DialogDescription>
            Create a new answer for a condition assessment question
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleAddAnswer} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="question_id">Question</Label>
            <Select
              value={answerForm.question_id}
              onValueChange={(value) => handleAnswerSelectChange('question_id', value)}
              disabled={answerForm.question_id !== ''}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Question" />
              </SelectTrigger>
              <SelectContent>
                {questions?.map((question) => (
                  <SelectItem key={question.id} value={question.id.toString()}>
                    {question.text}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="text">Answer Text</Label>
            <Input
              id="text"
              name="text"
              value={answerForm.text}
              onChange={handleAnswerFormChange}
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="value">Value Adjustment</Label>
              <Input
                id="value"
                name="value"
                type="number"
                value={answerForm.value.toString()}
                onChange={handleAnswerFormChange}
                required
              />
              <p className="text-xs text-gray-500">
                Impact on device valuation (negative for issues)
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="order">Display Order</Label>
              <Input
                id="order"
                name="order"
                type="number"
                min="0"
                value={answerForm.order.toString()}
                onChange={handleAnswerFormChange}
                required
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsAddAnswerOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createAnswerMutation.isPending}>
              {createAnswerMutation.isPending ? 'Creating...' : 'Create Answer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );

  const renderEditAnswerModal = () => (
    <Dialog open={isEditAnswerOpen} onOpenChange={setIsEditAnswerOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Answer Option</DialogTitle>
          <DialogDescription>
            Update this answer option
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleEditAnswer} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="edit-question_id">Question</Label>
            <Select
              value={answerForm.question_id}
              onValueChange={(value) => handleAnswerSelectChange('question_id', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Question" />
              </SelectTrigger>
              <SelectContent>
                {questions?.map((question) => (
                  <SelectItem key={question.id} value={question.id.toString()}>
                    {question.text}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="edit-text">Answer Text</Label>
            <Input
              id="edit-text"
              name="text"
              value={answerForm.text}
              onChange={handleAnswerFormChange}
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-value">Value Adjustment</Label>
              <Input
                id="edit-value"
                name="value"
                type="number"
                value={answerForm.value.toString()}
                onChange={handleAnswerFormChange}
                required
              />
              <p className="text-xs text-gray-500">
                Impact on device valuation (negative for issues)
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-order">Display Order</Label>
              <Input
                id="edit-order"
                name="order"
                type="number"
                min="0"
                value={answerForm.order.toString()}
                onChange={handleAnswerFormChange}
                required
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsEditAnswerOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={updateAnswerMutation.isPending}>
              {updateAnswerMutation.isPending ? 'Updating...' : 'Update Answer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );

  const renderDeleteAnswerModal = () => (
    <Dialog open={isDeleteAnswerOpen} onOpenChange={setIsDeleteAnswerOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Answer Option</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this answer?
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <p className="font-medium">{selectedAnswer?.text}</p>
          <p className="text-sm text-gray-500">
            For question: {selectedAnswer && getQuestionText(selectedAnswer.question_id)}
          </p>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setIsDeleteAnswerOpen(false)}>
            Cancel
          </Button>
          <Button 
            type="button" 
            variant="destructive" 
            onClick={handleDeleteAnswer}
            disabled={deleteAnswerMutation.isPending}
          >
            {deleteAnswerMutation.isPending ? 'Deleting...' : 'Delete Answer'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  // Loading state
  if (isLoadingQuestions || isLoadingAnswers || isLoadingDeviceTypes) {
    return (
      <div className="py-8 px-4">
        <h1 className="text-2xl font-bold mb-6">Condition Question System</h1>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  // Error handling for missing data
  if (!questions || !answers || !deviceTypes) {
    return (
      <div className="py-8 px-4">
        <h1 className="text-2xl font-bold mb-6">Condition Question System</h1>
        <div className="bg-red-50 p-4 rounded border border-red-200 text-red-700">
          Error loading data. Please try refreshing the page.
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Condition Question System</h1>
      </div>

      <Tabs defaultValue="questions" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="questions">Questions</TabsTrigger>
          <TabsTrigger value="answers">Answers</TabsTrigger>
        </TabsList>
        
        <TabsContent value="questions" className="mt-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Condition Assessment Questions</h2>
            {renderAddQuestionModal()}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {questions.length === 0 ? (
              <div className="col-span-full bg-gray-50 p-8 rounded-lg border border-gray-200 text-center">
                <p className="text-gray-500">No questions found. Add your first question to begin creating your condition assessment system.</p>
              </div>
            ) : (
              questions.map((question) => {
                const questionAnswers = answers.filter(a => a.question_id === question.id);
                
                return (
                  <Card key={question.id} className="overflow-hidden">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-base">{question.text}</CardTitle>
                        <div className="flex space-x-1">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => openEditQuestion(question)}
                            className="h-8 w-8"
                          >
                            <Pencil size={14} />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => openDeleteQuestion(question)}
                            className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </div>
                      <CardDescription>
                        {question.help_text && (
                          <p className="text-sm text-gray-500 mb-1">{question.help_text}</p>
                        )}
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            Order: {question.order}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            Impact: {question.value_impact}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {getDeviceTypeName(question.device_type_id)}
                          </Badge>
                        </div>
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <div className="mb-2">
                        <h4 className="text-sm font-medium mb-1">Answers:</h4>
                        {questionAnswers.length === 0 ? (
                          <p className="text-sm text-gray-500">No answers defined for this question.</p>
                        ) : (
                          <ul className="space-y-1 text-sm">
                            {questionAnswers.map((answer) => (
                              <li key={answer.id} className="flex items-center justify-between">
                                <span>{answer.text} <span className="text-gray-500 ml-1">({answer.value > 0 ? `+${answer.value}` : answer.value})</span></span>
                                <div className="flex space-x-1">
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    onClick={() => openEditAnswer(answer)}
                                    className="h-6 w-6"
                                  >
                                    <Pencil size={12} />
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    onClick={() => openDeleteAnswer(answer)}
                                    className="h-6 w-6 text-red-500 hover:text-red-700"
                                  >
                                    <Trash2 size={12} />
                                  </Button>
                                </div>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </CardContent>
                    <CardFooter className="pt-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full flex items-center justify-center gap-1"
                        onClick={() => openAddAnswer(question.id)}
                      >
                        <MessageSquarePlus size={14} />
                        <span>Add Answer</span>
                      </Button>
                    </CardFooter>
                  </Card>
                );
              })
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="answers" className="mt-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Condition Assessment Answers</h2>
            {renderAddAnswerModal()}
          </div>
          
          <div className="overflow-x-auto bg-white rounded-lg shadow">
            {answers.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-gray-500">No answers found. Add questions and then create answers for them.</p>
              </div>
            ) : (
              <table className="w-full table-auto">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Question</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Answer Text</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {answers.map((answer) => (
                    <tr key={answer.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{answer.id}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{getQuestionText(answer.question_id)}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{answer.text}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{answer.value > 0 ? `+${answer.value}` : answer.value}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{answer.order}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 text-right">
                        <div className="flex justify-end space-x-2">
                          <Button 
                            variant="outline" 
                            size="icon" 
                            onClick={() => openEditAnswer(answer)}
                            title="Edit"
                            className="h-8 w-8"
                          >
                            <Pencil size={14} />
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="icon" 
                            onClick={() => openDeleteAnswer(answer)}
                            title="Delete"
                            className="h-8 w-8"
                          >
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {renderEditQuestionModal()}
      {renderDeleteQuestionModal()}
      {renderEditAnswerModal()}
      {renderDeleteAnswerModal()}
    </div>
  );
};

export default AdminCQS;