import React, { useState } from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { useLocation } from "wouter";
import { AdminSidebar } from "@/components/admin/sidebar";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Home, Plus, Pencil, Trash2, Search, CheckSquare, ListPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";

// Schema for condition question form
const questionFormSchema = z.object({
  text: z.string().min(5, {
    message: "Question text must be at least 5 characters.",
  }),
  device_type_id: z.coerce.number().optional(),
  weight: z.coerce.number().min(1).max(100).optional(),
  hint: z.string().optional(),
  order: z.coerce.number().min(1).optional(),
});

type QuestionFormData = z.infer<typeof questionFormSchema>;

// Schema for answer form
const answerFormSchema = z.object({
  text: z.string().min(2, {
    message: "Answer text must be at least 2 characters.",
  }),
  value: z.string().min(1, {
    message: "Value is required",
  }),
  condition_question_id: z.coerce.number().min(1),
});

type AnswerFormData = z.infer<typeof answerFormSchema>;

export default function ConditionQuestionsPage() {
  const [location] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [questionDialogOpen, setQuestionDialogOpen] = useState(false);
  const [answerDialogOpen, setAnswerDialogOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<any>(null);
  const [editingAnswer, setEditingAnswer] = useState<any>(null);
  const [selectedQuestionId, setSelectedQuestionId] = useState<number | null>(null);

  // Fetch condition questions
  const { data: questions = [], isLoading: isLoadingQuestions } = useQuery({
    queryKey: ["/api/condition-questions"],
    refetchOnWindowFocus: false,
  });

  // Fetch condition answers for selected question
  const { data: answers = [], isLoading: isLoadingAnswers } = useQuery({
    queryKey: ["/api/condition-questions", selectedQuestionId, "answers"],
    enabled: !!selectedQuestionId,
    refetchOnWindowFocus: false,
  });

  // Fetch device types for dropdown
  const { data: deviceTypes = [] } = useQuery({
    queryKey: ["/api/device-types"],
    refetchOnWindowFocus: false,
  });

  // Question form
  const questionForm = useForm<QuestionFormData>({
    resolver: zodResolver(questionFormSchema),
    defaultValues: {
      text: "",
      device_type_id: undefined,
      weight: 10,
      hint: "",
      order: 1,
    },
  });

  // Answer form
  const answerForm = useForm<AnswerFormData>({
    resolver: zodResolver(answerFormSchema),
    defaultValues: {
      text: "",
      value: "",
      condition_question_id: undefined,
    },
  });

  // Create question mutation
  const createQuestionMutation = useMutation({
    mutationFn: (data: QuestionFormData) => {
      return apiRequest("/api/condition-questions", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/condition-questions"] });
      setQuestionDialogOpen(false);
      questionForm.reset();
    },
  });

  // Update question mutation
  const updateQuestionMutation = useMutation({
    mutationFn: (data: QuestionFormData & { id: number }) => {
      return apiRequest(`/api/condition-questions/${data.id}`, {
        method: "PUT",
        body: JSON.stringify({
          text: data.text,
          device_type_id: data.device_type_id,
          weight: data.weight,
          hint: data.hint,
          order: data.order,
        }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/condition-questions"] });
      setQuestionDialogOpen(false);
      setEditingQuestion(null);
      questionForm.reset();
    },
  });

  // Delete question mutation
  const deleteQuestionMutation = useMutation({
    mutationFn: (id: number) => {
      return apiRequest(`/api/condition-questions/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/condition-questions"] });
      if (selectedQuestionId) {
        setSelectedQuestionId(null);
      }
    },
  });

  // Create answer mutation
  const createAnswerMutation = useMutation({
    mutationFn: (data: AnswerFormData) => {
      return apiRequest("/api/condition-answers", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      if (selectedQuestionId) {
        queryClient.invalidateQueries({ 
          queryKey: ["/api/condition-questions", selectedQuestionId, "answers"] 
        });
      }
      setAnswerDialogOpen(false);
      answerForm.reset();
    },
  });

  // Update answer mutation
  const updateAnswerMutation = useMutation({
    mutationFn: (data: AnswerFormData & { id: number }) => {
      return apiRequest(`/api/condition-answers/${data.id}`, {
        method: "PUT",
        body: JSON.stringify({
          text: data.text,
          value: data.value,
          condition_question_id: data.condition_question_id,
        }),
      });
    },
    onSuccess: () => {
      if (selectedQuestionId) {
        queryClient.invalidateQueries({ 
          queryKey: ["/api/condition-questions", selectedQuestionId, "answers"] 
        });
      }
      setAnswerDialogOpen(false);
      setEditingAnswer(null);
      answerForm.reset();
    },
  });

  // Delete answer mutation
  const deleteAnswerMutation = useMutation({
    mutationFn: (id: number) => {
      return apiRequest(`/api/condition-answers/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      if (selectedQuestionId) {
        queryClient.invalidateQueries({ 
          queryKey: ["/api/condition-questions", selectedQuestionId, "answers"] 
        });
      }
    },
  });

  // Filter questions by search term
  const filteredQuestions = questions.filter((question: any) => 
    question.text.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Helper function to get device type name by ID
  const getDeviceTypeName = (deviceTypeId: number | null) => {
    if (!deviceTypeId) return "All Devices";
    const deviceType = deviceTypes.find((d: any) => d.id === deviceTypeId);
    return deviceType ? deviceType.name : "Unknown";
  };

  // Handle question form submission
  const onSubmitQuestion = (data: QuestionFormData) => {
    if (editingQuestion) {
      updateQuestionMutation.mutate({ ...data, id: editingQuestion.id });
    } else {
      createQuestionMutation.mutate(data);
    }
  };

  // Handle answer form submission
  const onSubmitAnswer = (data: AnswerFormData) => {
    if (editingAnswer) {
      updateAnswerMutation.mutate({ ...data, id: editingAnswer.id });
    } else {
      createAnswerMutation.mutate(data);
    }
  };

  // Open dialog for editing question
  const handleEditQuestion = (question: any) => {
    setEditingQuestion(question);
    questionForm.reset({
      text: question.text,
      device_type_id: question.device_type_id,
      weight: question.weight || 10,
      hint: question.hint || "",
      order: question.order || 1,
    });
    setQuestionDialogOpen(true);
  };

  // Open dialog for creating question
  const handleCreateQuestion = () => {
    setEditingQuestion(null);
    questionForm.reset({
      text: "",
      device_type_id: undefined,
      weight: 10,
      hint: "",
      order: 1,
    });
    setQuestionDialogOpen(true);
  };

  // Open dialog for editing answer
  const handleEditAnswer = (answer: any) => {
    setEditingAnswer(answer);
    answerForm.reset({
      text: answer.text,
      value: answer.value,
      condition_question_id: answer.condition_question_id,
    });
    setAnswerDialogOpen(true);
  };

  // Open dialog for creating answer
  const handleCreateAnswer = () => {
    if (!selectedQuestionId) return;
    
    setEditingAnswer(null);
    answerForm.reset({
      text: "",
      value: "",
      condition_question_id: selectedQuestionId,
    });
    setAnswerDialogOpen(true);
  };

  // Handle delete question confirmation
  const handleDeleteQuestion = (id: number) => {
    if (confirm("Are you sure you want to delete this question? This will also delete all associated answers.")) {
      deleteQuestionMutation.mutate(id);
    }
  };

  // Handle delete answer confirmation
  const handleDeleteAnswer = (id: number) => {
    if (confirm("Are you sure you want to delete this answer?")) {
      deleteAnswerMutation.mutate(id);
    }
  };

  // Handle question selection
  const handleSelectQuestion = (id: number) => {
    setSelectedQuestionId(id === selectedQuestionId ? null : id);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      
      <div className="flex-grow flex">
        {/* Admin Sidebar */}
        <AdminSidebar activePath="/admin/condition-questions" />
        
        {/* Main Content */}
        <main className="flex-grow p-6 overflow-auto">
          <div className="max-w-6xl mx-auto">
            {/* Breadcrumbs */}
            <Breadcrumb className="mb-5">
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/admin" className="flex items-center">
                    <Home className="h-4 w-4 mr-1" />
                    Dashboard
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink href="/admin/condition-questions" className="font-semibold">
                    Condition Questions
                  </BreadcrumbLink>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
            
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Condition Assessment Questions</h1>
              <Button onClick={handleCreateQuestion}>
                <Plus className="h-4 w-4 mr-2" />
                Add Question
              </Button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Questions Panel */}
              <Card className="bg-white shadow rounded-lg overflow-hidden">
                <CardHeader className="bg-gray-50 px-4 py-4 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg font-medium">Questions</CardTitle>
                    <div className="relative w-64">
                      <Input
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search questions..."
                        className="pl-8"
                      />
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-gray-400" />
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Question</TableHead>
                          <TableHead>Device Type</TableHead>
                          <TableHead>Weight</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {isLoadingQuestions ? (
                          <TableRow>
                            <TableCell colSpan={4} className="text-center py-8">
                              <div className="flex flex-col items-center justify-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                <p className="mt-2">Loading questions...</p>
                              </div>
                            </TableCell>
                          </TableRow>
                        ) : filteredQuestions.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                              No questions found.
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredQuestions.map((question: any) => (
                            <TableRow 
                              key={question.id}
                              className={
                                selectedQuestionId === question.id 
                                  ? "bg-primary/10 cursor-pointer" 
                                  : "hover:bg-gray-50 cursor-pointer"
                              }
                              onClick={() => handleSelectQuestion(question.id)}
                            >
                              <TableCell>
                                <div className="font-medium text-gray-900">{question.text}</div>
                                {question.hint && (
                                  <div className="text-xs text-gray-500 mt-1">Hint: {question.hint}</div>
                                )}
                              </TableCell>
                              <TableCell>{getDeviceTypeName(question.device_type_id)}</TableCell>
                              <TableCell>{question.weight || "10"}</TableCell>
                              <TableCell className="text-right">
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEditQuestion(question);
                                  }}
                                  className="text-primary hover:text-primary-dark"
                                >
                                  <Pencil className="h-4 w-4 mr-1" />
                                  Edit
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteQuestion(question.id);
                                  }}
                                  className="text-red-600 hover:text-red-900 ml-2"
                                >
                                  <Trash2 className="h-4 w-4 mr-1" />
                                  Delete
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
              
              {/* Answers Panel */}
              <Card className="bg-white shadow rounded-lg overflow-hidden">
                <CardHeader className="bg-gray-50 px-4 py-4 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg font-medium">
                      {selectedQuestionId 
                        ? "Answers for Selected Question" 
                        : "Select a question to view answers"}
                    </CardTitle>
                    {selectedQuestionId && (
                      <Button 
                        onClick={handleCreateAnswer}
                        size="sm"
                      >
                        <ListPlus className="h-4 w-4 mr-2" />
                        Add Answer
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className={selectedQuestionId ? "p-0" : "p-6 text-center text-gray-500"}>
                  {!selectedQuestionId ? (
                    <div className="flex flex-col items-center justify-center py-12">
                      <CheckSquare className="h-16 w-16 text-gray-300 mb-4" />
                      <p>Click on a question from the left panel to view and manage its answers.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Answer Text</TableHead>
                            <TableHead>Condition Value</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {isLoadingAnswers ? (
                            <TableRow>
                              <TableCell colSpan={3} className="text-center py-8">
                                <div className="flex flex-col items-center justify-center">
                                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                  <p className="mt-2">Loading answers...</p>
                                </div>
                              </TableCell>
                            </TableRow>
                          ) : answers.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={3} className="text-center py-8 text-gray-500">
                                No answers found for this question.
                              </TableCell>
                            </TableRow>
                          ) : (
                            answers.map((answer: any) => (
                              <TableRow key={answer.id}>
                                <TableCell className="font-medium">{answer.text}</TableCell>
                                <TableCell>
                                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                                    ${answer.value === "excellent" ? "bg-green-100 text-green-800" : 
                                      answer.value === "good" ? "bg-blue-100 text-blue-800" : 
                                      answer.value === "fair" ? "bg-yellow-100 text-yellow-800" : 
                                      answer.value === "poor" ? "bg-red-100 text-red-800" : 
                                      "bg-gray-100 text-gray-800"}`
                                  }>
                                    {answer.value}
                                  </span>
                                </TableCell>
                                <TableCell className="text-right">
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => handleEditAnswer(answer)}
                                    className="text-primary hover:text-primary-dark"
                                  >
                                    <Pencil className="h-4 w-4 mr-1" />
                                    Edit
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => handleDeleteAnswer(answer.id)}
                                    className="text-red-600 hover:text-red-900 ml-2"
                                  >
                                    <Trash2 className="h-4 w-4 mr-1" />
                                    Delete
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
            
            {/* Question Form Dialog */}
            <Dialog open={questionDialogOpen} onOpenChange={setQuestionDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingQuestion ? "Edit Question" : "Add Question"}</DialogTitle>
                  <DialogDescription>
                    {editingQuestion 
                      ? "Update the details for this condition assessment question." 
                      : "Add a new condition assessment question to the system."}
                  </DialogDescription>
                </DialogHeader>
                
                <Form {...questionForm}>
                  <form onSubmit={questionForm.handleSubmit(onSubmitQuestion)} className="space-y-6">
                    <FormField
                      control={questionForm.control}
                      name="text"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Question Text</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="e.g. Are there any scratches on the screen?" 
                              {...field} 
                              className="min-h-[80px]"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={questionForm.control}
                        name="device_type_id"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Device Type</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value?.toString()}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="All device types" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="">All device types</SelectItem>
                                {deviceTypes.map((type: any) => (
                                  <SelectItem key={type.id} value={type.id.toString()}>
                                    {type.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              Leave empty to apply to all device types.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={questionForm.control}
                        name="weight"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Weight</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="10"
                                min="1"
                                max="100"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              Importance of this question (1-100)
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={questionForm.control}
                        name="hint"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Hint</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Optional hint for users"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              Additional context for users
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={questionForm.control}
                        name="order"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Display Order</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="1"
                                min="1"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              Order in the assessment
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button type="button" variant="outline">Cancel</Button>
                      </DialogClose>
                      <Button 
                        type="submit" 
                        disabled={createQuestionMutation.isPending || updateQuestionMutation.isPending}
                      >
                        {createQuestionMutation.isPending || updateQuestionMutation.isPending ? (
                          <div className="flex items-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Saving...
                          </div>
                        ) : (
                          editingQuestion ? "Update Question" : "Create Question"
                        )}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
            
            {/* Answer Form Dialog */}
            <Dialog open={answerDialogOpen} onOpenChange={setAnswerDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingAnswer ? "Edit Answer" : "Add Answer"}</DialogTitle>
                  <DialogDescription>
                    {editingAnswer 
                      ? "Update the details for this answer option." 
                      : "Add a new answer option to the selected question."}
                  </DialogDescription>
                </DialogHeader>
                
                <Form {...answerForm}>
                  <form onSubmit={answerForm.handleSubmit(onSubmitAnswer)} className="space-y-6">
                    <FormField
                      control={answerForm.control}
                      name="text"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Answer Text</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. No scratches at all" {...field} />
                          </FormControl>
                          <FormDescription>
                            The text displayed to users for this answer option
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={answerForm.control}
                      name="value"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Condition Value</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select condition" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="excellent">Excellent</SelectItem>
                              <SelectItem value="good">Good</SelectItem>
                              <SelectItem value="fair">Fair</SelectItem>
                              <SelectItem value="poor">Poor</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            How this answer affects the overall condition rating
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={answerForm.control}
                      name="condition_question_id"
                      render={({ field }) => (
                        <FormItem className="hidden">
                          <FormControl>
                            <Input type="hidden" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button type="button" variant="outline">Cancel</Button>
                      </DialogClose>
                      <Button 
                        type="submit" 
                        disabled={createAnswerMutation.isPending || updateAnswerMutation.isPending}
                      >
                        {createAnswerMutation.isPending || updateAnswerMutation.isPending ? (
                          <div className="flex items-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Saving...
                          </div>
                        ) : (
                          editingAnswer ? "Update Answer" : "Create Answer"
                        )}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </main>
      </div>
      
      <Footer />
    </div>
  );
}