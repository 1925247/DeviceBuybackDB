import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
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
  ArrowLeft,
  MoveVertical,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ChevronDown,
} from "lucide-react";
import { QuestionGroup, Question, AnswerChoice } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import AnswerChoicesPreview from "@/components/AnswerChoicesPreview";

// Type for the question form data
interface QuestionFormData {
  questionText: string;
  questionType: "single_choice" | "multiple_choice" | "text_input";
  groupId: number;
  order: number;
  active: boolean;
  tooltip: string;
  required: boolean;
  answerChoices: {
    id?: number;
    answerText: string;
    icon: string;
    weightage: number;
    repairCost: number;
    isDefault: boolean;
    followUpAction: string | null;
  }[];
}

export default function AdminQuestions() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // States for the component
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  
  // Initialize form data
  const [formData, setFormData] = useState<QuestionFormData>({
    questionText: "",
    questionType: "single_choice",
    groupId: Number(groupId),
    order: 0,
    active: true,
    tooltip: "",
    required: true,
    answerChoices: [],
  });
  
  // Fetch the question group details
  const { data: groupData, isLoading: isGroupLoading } = useQuery<{ 
    id: number;
    name: string;
    statement: string;
    deviceTypeId: number | null;
    icon: string | null;
    active: boolean;
    questions: Question[];
  }>({
    queryKey: [`/api/question-groups/${groupId}`],
    enabled: !!groupId,
  });

  // Add new question
  const addQuestionMutation = useMutation({
    mutationFn: async (data: QuestionFormData) => {
      return await apiRequest("POST", "/api/questions", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/question-groups/${groupId}`] });
      setIsAddDialogOpen(false);
      resetForm();
      toast({
        title: "Success",
        description: "Question has been created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create question",
        variant: "destructive",
      });
    },
  });

  // Update question
  const updateQuestionMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: QuestionFormData }) => {
      return await apiRequest("PUT", `/api/questions/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/question-groups/${groupId}`] });
      setIsEditDialogOpen(false);
      resetForm();
      toast({
        title: "Success",
        description: "Question has been updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update question",
        variant: "destructive",
      });
    },
  });

  // Delete question
  const deleteQuestionMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest("DELETE", `/api/questions/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/question-groups/${groupId}`] });
      setIsDeleteDialogOpen(false);
      setCurrentQuestion(null);
      toast({
        title: "Success",
        description: "Question has been deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete question",
        variant: "destructive",
      });
    },
  });

  // Reset form
  const resetForm = () => {
    setFormData({
      questionText: "",
      questionType: "single_choice",
      groupId: Number(groupId),
      order: 0,
      active: true,
      tooltip: "",
      required: true,
      answerChoices: [],
    });
  };

  // Handle add button click
  const handleAddClick = () => {
    resetForm();
    // If there are existing questions, set the order to be the next in sequence
    if (groupData?.questions && groupData.questions.length > 0) {
      setFormData(prev => ({
        ...prev,
        order: Math.max(...groupData.questions.map(q => q.order ?? 0)) + 1
      }));
    }
    
    // Add two empty answer choices by default for convenience
    setFormData(prev => ({
      ...prev,
      answerChoices: [
        { answerText: "", icon: "", weightage: 0, repairCost: 0, isDefault: false, followUpAction: null },
        { answerText: "", icon: "", weightage: 0, repairCost: 0, isDefault: false, followUpAction: null }
      ]
    }));
    
    setIsAddDialogOpen(true);
  };

  // Handle edit button click
  const handleEditClick = (question: Question) => {
    setCurrentQuestion(question);
    
    // First fetch the complete question data with answer choices
    apiRequest("GET", `/api/questions/${question.id}`)
      .then(response => response.json())
      .then(data => {
        // Now set the form data with the complete question data
        setFormData({
          questionText: data.questionText,
          questionType: data.questionType as "single_choice" | "multiple_choice" | "text_input",
          groupId: Number(groupId),
          order: data.order ?? 0,
          active: data.active ?? true,
          tooltip: data.tooltip || "",
          required: data.required ?? true,
          answerChoices: (data.answerChoices || []).map((choice: any) => ({
            id: choice.id,
            answerText: choice.answerText || "",
            icon: choice.icon || "",
            weightage: choice.weightage ?? 0,
            repairCost: choice.repairCost ?? 0,
            isDefault: choice.isDefault ?? false,
            followUpAction: typeof choice.followUpAction === 'string' ? choice.followUpAction : null
          }))
        });
        setIsEditDialogOpen(true);
      })
      .catch(error => {
        console.error("Error fetching question details:", error);
        toast({
          title: "Error",
          description: "Could not load question details",
          variant: "destructive",
        });
      });
  };

  // Handle delete button click
  const handleDeleteClick = (question: Question) => {
    setCurrentQuestion(question);
    setIsDeleteDialogOpen(true);
  };

  // Handle form input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle switch change
  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  // Handle question type change
  const handleQuestionTypeChange = (value: string) => {
    setFormData(prev => ({ 
      ...prev, 
      questionType: value as "single_choice" | "multiple_choice" | "text_input"
    }));
  };

  // Handle answer choice input change
  const handleAnswerChoiceChange = (index: number, field: string, value: any) => {
    setFormData(prev => {
      const updatedChoices = [...prev.answerChoices];
      updatedChoices[index] = { 
        ...updatedChoices[index], 
        [field]: field === 'weightage' || field === 'repairCost' ? Number(value) : value 
      };
      return {
        ...prev,
        answerChoices: updatedChoices
      };
    });
  };

  // Handle adding a new answer choice
  const handleAddAnswerChoice = () => {
    setFormData(prev => ({
      ...prev,
      answerChoices: [
        ...prev.answerChoices,
        { answerText: "", icon: "", weightage: 0, repairCost: 0, isDefault: false, followUpAction: null }
      ]
    }));
  };

  // Handle removing an answer choice
  const handleRemoveAnswerChoice = (index: number) => {
    setFormData(prev => {
      const updatedChoices = [...prev.answerChoices];
      updatedChoices.splice(index, 1);
      return {
        ...prev,
        answerChoices: updatedChoices
      };
    });
  };

  // Handle form submission for add
  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form data
    if ((formData.questionType === 'single_choice' || formData.questionType === 'multiple_choice') && 
        (!formData.answerChoices || formData.answerChoices.length < 2)) {
      toast({
        title: "Validation Error",
        description: "Please add at least two answer choices for choice-based questions",
        variant: "destructive",
      });
      return;
    }
    
    // Filter out empty answer choices
    const validAnswerChoices = formData.answerChoices.filter(
      choice => choice.answerText.trim() !== ""
    );
    
    if ((formData.questionType === 'single_choice' || formData.questionType === 'multiple_choice') && 
        validAnswerChoices.length < 2) {
      toast({
        title: "Validation Error",
        description: "Please add at least two valid answer choices with text",
        variant: "destructive",
      });
      return;
    }
    
    // Ensure only one default answer for single_choice
    if (formData.questionType === 'single_choice') {
      const defaultCount = validAnswerChoices.filter(c => c.isDefault).length;
      if (defaultCount > 1) {
        toast({
          title: "Validation Error",
          description: "Single choice questions can only have one default answer",
          variant: "destructive",
        });
        return;
      }
    }
    
    // Submit the question with valid answer choices
    const submissionData = {
      ...formData,
      answerChoices: validAnswerChoices
    };
    
    addQuestionMutation.mutate(submissionData);
  };

  // Handle form submission for edit
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Same validation as add
    if ((formData.questionType === 'single_choice' || formData.questionType === 'multiple_choice') && 
        (!formData.answerChoices || formData.answerChoices.length < 2)) {
      toast({
        title: "Validation Error",
        description: "Please add at least two answer choices for choice-based questions",
        variant: "destructive",
      });
      return;
    }
    
    // Filter out empty answer choices
    const validAnswerChoices = formData.answerChoices.filter(
      choice => choice.answerText.trim() !== ""
    );
    
    if ((formData.questionType === 'single_choice' || formData.questionType === 'multiple_choice') && 
        validAnswerChoices.length < 2) {
      toast({
        title: "Validation Error",
        description: "Please add at least two valid answer choices with text",
        variant: "destructive",
      });
      return;
    }
    
    // Ensure only one default answer for single_choice
    if (formData.questionType === 'single_choice') {
      const defaultCount = validAnswerChoices.filter(c => c.isDefault).length;
      if (defaultCount > 1) {
        toast({
          title: "Validation Error",
          description: "Single choice questions can only have one default answer",
          variant: "destructive",
        });
        return;
      }
    }
    
    if (currentQuestion) {
      const submissionData = {
        ...formData,
        answerChoices: validAnswerChoices
      };
      
      updateQuestionMutation.mutate({ id: currentQuestion.id, data: submissionData });
    }
  };

  // Handle delete confirmation
  const handleDeleteConfirm = () => {
    if (currentQuestion) {
      deleteQuestionMutation.mutate(currentQuestion.id);
    }
  };

  // Render choice and its preview based on icon/text
  const renderChoicePreview = (choice: any) => {
    return (
      <div className="flex items-center">
        {choice.icon && (
          <span className="mr-2 text-gray-500">[Icon: {choice.icon}]</span>
        )}
        <span>{choice.answerText || choice.text || choice.answer_text || "No answer text"}</span>
        {(choice.isDefault || choice.is_default) && (
          <Badge variant="outline" className="ml-2 bg-blue-50">
            Default
          </Badge>
        )}
      </div>
    );
  };

  return (
    <div className="container mx-auto py-6">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <div className="flex items-center">
            <Button
              variant="outline"
              size="sm"
              className="mr-2"
              onClick={() => navigate("/admin/condition-questions")}
            >
              <ArrowLeft className="h-4 w-4 mr-1" /> Back
            </Button>
            <h1 className="text-2xl font-bold tracking-tight">{groupData?.name || "Loading..."}</h1>
          </div>
          <p className="text-gray-500 mt-1">
            {groupData?.statement || "Manage questions and answers for this group"}
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <Button onClick={handleAddClick}>
            <Plus className="mr-2 h-4 w-4" /> Add Question
          </Button>
        </div>
      </header>

      {isGroupLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : groupData?.questions && groupData.questions.length > 0 ? (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12 text-center">Order</TableHead>
                <TableHead>Question</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="w-20 text-center">Required</TableHead>
                <TableHead className="w-20 text-center">Active</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {groupData.questions
                .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
                .map((question) => (
                  <TableRow key={question.id}>
                    <TableCell className="text-center font-medium">
                      {question.order}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{question.questionText}</div>
                      {question.tooltip && (
                        <div className="text-sm text-gray-500 mt-1">
                          <span className="italic">
                            Help text: {question.tooltip}
                          </span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          question.questionType === "single_choice"
                            ? "default"
                            : question.questionType === "multiple_choice"
                              ? "secondary"
                              : "outline"
                        }
                      >
                        {question.questionType === "single_choice"
                          ? "Single Choice"
                          : question.questionType === "multiple_choice"
                            ? "Multiple Choice"
                            : "Text Input"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      {question.required ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500 mx-auto" />
                      ) : (
                        <XCircle className="h-5 w-5 text-gray-300 mx-auto" />
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {question.active ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500 mx-auto" />
                      ) : (
                        <XCircle className="h-5 w-5 text-gray-300 mx-auto" />
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditClick(question)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteClick(question)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="mb-4">
            <AlertCircle className="h-12 w-12 text-gray-300 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900">
            No questions found
          </h3>
          <p className="mt-1 text-gray-500">
            Get started by adding questions to this group.
          </p>
          <div className="mt-6">
            <Button onClick={handleAddClick}>
              <Plus className="mr-2 h-4 w-4" /> Add Question
            </Button>
          </div>
        </div>
      )}

      {groupData?.questions && groupData.questions.length > 0 && (
        <div className="mt-8 border rounded-md p-4">
          <h3 className="text-lg font-medium mb-4">Question Preview</h3>

          <Accordion type="single" collapsible className="w-full">
            {groupData.questions
              .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
              .map((question) => (
                <AccordionItem
                  key={question.id}
                  value={`question-${question.id}`}
                >
                  <AccordionTrigger className="hover:bg-gray-50 px-4 py-2 rounded-md">
                    <div className="flex items-center">
                      <span className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full mr-3 text-sm font-medium">
                        {question.order}
                      </span>
                      <span className="text-left">{question.questionText}</span>
                      {question.required && (
                        <span className="text-red-500 ml-1">*</span>
                      )}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 py-2">
                    {question.tooltip && (
                      <div className="mb-4 bg-blue-50 text-blue-700 p-3 rounded-md flex items-start">
                        <HelpCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                        <p className="text-sm">{question.tooltip}</p>
                      </div>
                    )}

                    {(question.questionType === "single_choice" ||
                      question.questionType === "multiple_choice") && (
                      <div className="grid gap-2 mt-3">
                        {question.answer_choices && question.answer_choices.length > 0 ? (
                          question.answer_choices.map((choice: any, idx: number) => (
                            <div 
                              key={choice.id || idx} 
                              className={`flex items-center p-2 border rounded ${choice.is_default ? "border-blue-300 bg-blue-50" : ""}`}
                            >
                              {question.questionType === "single_choice" ? (
                                <div
                                  className={`w-4 h-4 rounded-full border mr-3 flex-shrink-0 ${choice.is_default ? "bg-blue-500 border-blue-500" : "border-gray-300"}`}
                                />
                              ) : (
                                <div
                                  className={`w-4 h-4 rounded border mr-3 flex-shrink-0 ${choice.is_default ? "bg-blue-500 border-blue-500" : "border-gray-300"}`}
                                />
                              )}
                              <div className="flex-1">
                                <p className="font-medium">{choice.text || choice.answerText || choice.answer_text}</p>
                              </div>
                              {choice.is_default && (
                                <Badge variant="outline" className="ml-3 bg-blue-50">Default</Badge>
                              )}
                            </div>
                          ))
                        ) : (
                          <p className="text-gray-500 italic">No answer choices available</p>
                        )}
                      </div>
                    )}

                    {question.questionType === "text_input" && (
                      <div className="mt-3">
                        <Input
                          disabled
                          placeholder="Text input field"
                          className="bg-gray-50"
                        />
                      </div>
                    )}
                  </AccordionContent>
                </AccordionItem>
              ))}
          </Accordion>
        </div>
      )}

      {/* Add Question Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Question</DialogTitle>
            <DialogDescription>Create a new question for this group</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddSubmit}>
            <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
              <div className="grid gap-2">
                <Label htmlFor="questionText">Question Text *</Label>
                <Textarea
                  id="questionText"
                  name="questionText"
                  placeholder="Enter your question"
                  value={formData.questionText}
                  onChange={handleInputChange}
                  className="min-h-[80px]"
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="questionType">Question Type *</Label>
                <Select
                  onValueChange={handleQuestionTypeChange}
                  defaultValue={formData.questionType}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select question type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single_choice">Single Choice</SelectItem>
                    <SelectItem value="multiple_choice">
                      Multiple Choice
                    </SelectItem>
                    <SelectItem value="text_input">Text Input</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="tooltip">Help Text (Optional)</Label>
                <Textarea
                  id="tooltip"
                  name="tooltip"
                  placeholder="Enter any additional help text or instructions"
                  value={formData.tooltip}
                  onChange={handleInputChange}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="order">Order</Label>
                  <Input
                    type="number"
                    id="order"
                    name="order"
                    value={formData.order}
                    onChange={handleInputChange}
                    min="0"
                  />
                </div>

                <div className="grid gap-2">
                  <Label className="mb-1">Options</Label>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="required"
                      checked={formData.required}
                      onCheckedChange={(checked) =>
                        handleSwitchChange("required", checked)
                      }
                    />
                    <Label htmlFor="required">Required</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="active"
                      checked={formData.active}
                      onCheckedChange={(checked) =>
                        handleSwitchChange("active", checked)
                      }
                    />
                    <Label htmlFor="active">Active</Label>
                  </div>
                </div>
              </div>

              {(formData.questionType === "single_choice" ||
                formData.questionType === "multiple_choice") && (
                <div className="grid gap-4 mt-4">
                  <div className="flex items-center justify-between">
                    <Label>Answer Choices</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAddAnswerChoice}
                    >
                      <Plus className="h-4 w-4 mr-1" /> Add Choice
                    </Button>
                  </div>

                  <div className="grid gap-6">
                    {formData.answerChoices.map((choice, index) => (
                      <div key={index} className="rounded-md border p-4 relative">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute top-2 right-2 h-6 w-6"
                          onClick={() => handleRemoveAnswerChoice(index)}
                          disabled={formData.answerChoices.length <= 2}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>

                        <div className="grid gap-4">
                          <div className="grid gap-2">
                            <Label htmlFor={`choice-${index}-text`}>
                              Answer Text *
                            </Label>
                            <Input
                              id={`choice-${index}-text`}
                              value={choice.answerText}
                              onChange={(e) =>
                                handleAnswerChoiceChange(
                                  index,
                                  "answerText",
                                  e.target.value
                                )
                              }
                              placeholder="Enter answer text"
                              required
                            />
                          </div>

                          <div className="grid gap-2">
                            <Label htmlFor={`choice-${index}-icon`}>
                              Icon (Optional)
                            </Label>
                            <Input
                              id={`choice-${index}-icon`}
                              value={choice.icon}
                              onChange={(e) =>
                                handleAnswerChoiceChange(
                                  index,
                                  "icon",
                                  e.target.value
                                )
                              }
                              placeholder="Enter icon code or name"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div className="grid gap-1">
                              <Label htmlFor={`choice-${index}-weightage`}>
                                Weightage
                              </Label>
                              <Input
                                id={`choice-${index}-weightage`}
                                type="number"
                                value={choice.weightage}
                                onChange={(e) =>
                                  handleAnswerChoiceChange(
                                    index,
                                    "weightage",
                                    e.target.value
                                  )
                                }
                                placeholder="0"
                                min="0"
                              />
                            </div>

                            <div className="grid gap-1">
                              <Label htmlFor={`choice-${index}-cost`}>
                                Repair Cost ($)
                              </Label>
                              <Input
                                id={`choice-${index}-cost`}
                                type="number"
                                value={choice.repairCost}
                                onChange={(e) =>
                                  handleAnswerChoiceChange(
                                    index,
                                    "repairCost",
                                    e.target.value
                                  )
                                }
                                placeholder="0"
                                min="0"
                              />
                            </div>
                          </div>

                          <div className="flex items-center space-x-2 mt-1">
                            <Switch
                              id={`choice-${index}-default`}
                              checked={choice.isDefault}
                              onCheckedChange={(checked) => {
                                if (
                                  formData.questionType === "single_choice" &&
                                  checked
                                ) {
                                  // For single choice, uncheck all others
                                  setFormData((prev) => {
                                    const newChoices = prev.answerChoices.map(
                                      (c, i) => ({
                                        ...c,
                                        isDefault: i === index ? checked : false,
                                      })
                                    );
                                    return { ...prev, answerChoices: newChoices };
                                  });
                                } else {
                                  handleAnswerChoiceChange(
                                    index,
                                    "isDefault",
                                    checked
                                  );
                                }
                              }}
                            />
                            <Label htmlFor={`choice-${index}-default`}>
                              Default Answer
                            </Label>
                          </div>

                          <div className="grid gap-2">
                            <Label htmlFor={`choice-${index}-followup`}>
                              Follow-up Action (Optional)
                            </Label>
                            <Input
                              id={`choice-${index}-followup`}
                              value={choice.followUpAction || ""}
                              onChange={(e) =>
                                handleAnswerChoiceChange(
                                  index,
                                  "followUpAction",
                                  e.target.value || null
                                )
                              }
                              placeholder="Enter follow-up action"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={addQuestionMutation.isPending}>
                {addQuestionMutation.isPending ? (
                  <>
                    <div className="animate-spin mr-2 h-4 w-4 border-2 border-b-transparent rounded-full"></div>
                    Saving...
                  </>
                ) : (
                  "Save Question"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Question Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Question</DialogTitle>
            <DialogDescription>Update this question's properties</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubmit}>
          <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
              <div className="grid gap-2">
                <Label htmlFor="questionText">Question Text *</Label>
                <Textarea
                  id="questionText"
                  name="questionText"
                  placeholder="Enter your question"
                  value={formData.questionText}
                  onChange={handleInputChange}
                  className="min-h-[80px]"
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="questionType">Question Type *</Label>
                <Select
                  value={formData.questionType}
                  onValueChange={handleQuestionTypeChange}
                >
                  <SelectTrigger id="questionType">
                    <SelectValue placeholder="Select question type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single_choice">Single Choice</SelectItem>
                    <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                    <SelectItem value="text_input">Text Input</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="tooltip">Help Text (Optional)</Label>
                <Textarea
                  id="tooltip"
                  name="tooltip"
                  placeholder="Enter any additional help text or instructions"
                  value={formData.tooltip}
                  onChange={handleInputChange}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="order">Order</Label>
                  <Input
                    type="number"
                    id="order"
                    name="order"
                    value={formData.order}
                    onChange={handleInputChange}
                    min="0"
                  />
                </div>

                <div className="grid gap-2">
                  <Label className="mb-1">Options</Label>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="required"
                      checked={formData.required}
                      onCheckedChange={(checked) =>
                        handleSwitchChange("required", checked)
                      }
                    />
                    <Label htmlFor="required">Required</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="active"
                      checked={formData.active}
                      onCheckedChange={(checked) =>
                        handleSwitchChange("active", checked)
                      }
                    />
                    <Label htmlFor="active">Active</Label>
                  </div>
                </div>
              </div>

              {(formData.questionType === "single_choice" ||
                formData.questionType === "multiple_choice") && (
                <div className="grid gap-4 mt-4">
                  <div className="flex items-center justify-between">
                    <Label>Answer Choices</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAddAnswerChoice}
                    >
                      <Plus className="h-4 w-4 mr-1" /> Add Choice
                    </Button>
                  </div>

                  <div className="grid gap-6">
                    {formData.answerChoices.map((choice, index) => (
                      <div key={index} className="rounded-md border p-4 relative">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute top-2 right-2 h-6 w-6"
                          onClick={() => handleRemoveAnswerChoice(index)}
                          disabled={formData.answerChoices.length <= 2}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>

                        <div className="grid gap-4">
                          <div className="grid gap-2">
                            <Label htmlFor={`edit-choice-${index}-text`}>
                              Answer Text *
                            </Label>
                            <Input
                              id={`edit-choice-${index}-text`}
                              value={choice.answerText}
                              onChange={(e) =>
                                handleAnswerChoiceChange(
                                  index,
                                  "answerText",
                                  e.target.value
                                )
                              }
                              placeholder="Enter answer text"
                              required
                            />
                          </div>

                          <div className="grid gap-2">
                            <Label htmlFor={`edit-choice-${index}-icon`}>
                              Icon (Optional)
                            </Label>
                            <Input
                              id={`edit-choice-${index}-icon`}
                              value={choice.icon}
                              onChange={(e) =>
                                handleAnswerChoiceChange(
                                  index,
                                  "icon",
                                  e.target.value
                                )
                              }
                              placeholder="Enter icon code or name"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div className="grid gap-1">
                              <Label htmlFor={`edit-choice-${index}-weightage`}>
                                Weightage
                              </Label>
                              <Input
                                id={`edit-choice-${index}-weightage`}
                                type="number"
                                value={choice.weightage}
                                onChange={(e) =>
                                  handleAnswerChoiceChange(
                                    index,
                                    "weightage",
                                    e.target.value
                                  )
                                }
                                placeholder="0"
                                min="0"
                              />
                            </div>

                            <div className="grid gap-1">
                              <Label htmlFor={`edit-choice-${index}-cost`}>
                                Repair Cost ($)
                              </Label>
                              <Input
                                id={`edit-choice-${index}-cost`}
                                type="number"
                                value={choice.repairCost}
                                onChange={(e) =>
                                  handleAnswerChoiceChange(
                                    index,
                                    "repairCost",
                                    e.target.value
                                  )
                                }
                                placeholder="0"
                                min="0"
                              />
                            </div>
                          </div>

                          <div className="flex items-center space-x-2 mt-1">
                            <Switch
                              id={`edit-choice-${index}-default`}
                              checked={choice.isDefault}
                              onCheckedChange={(checked) => {
                                if (
                                  formData.questionType === "single_choice" &&
                                  checked
                                ) {
                                  // For single choice, uncheck all others
                                  setFormData((prev) => {
                                    const newChoices = prev.answerChoices.map(
                                      (c, i) => ({
                                        ...c,
                                        isDefault: i === index ? checked : false,
                                      })
                                    );
                                    return { ...prev, answerChoices: newChoices };
                                  });
                                } else {
                                  handleAnswerChoiceChange(
                                    index,
                                    "isDefault",
                                    checked
                                  );
                                }
                              }}
                            />
                            <Label htmlFor={`edit-choice-${index}-default`}>
                              Default Answer
                            </Label>
                          </div>

                          <div className="grid gap-2">
                            <Label htmlFor={`edit-choice-${index}-followup`}>
                              Follow-up Action (Optional)
                            </Label>
                            <Input
                              id={`edit-choice-${index}-followup`}
                              value={choice.followUpAction || ""}
                              onChange={(e) =>
                                handleAnswerChoiceChange(
                                  index,
                                  "followUpAction",
                                  e.target.value || null
                                )
                              }
                              placeholder="Enter follow-up action"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={updateQuestionMutation.isPending}>
                {updateQuestionMutation.isPending ? (
                  <>
                    <div className="animate-spin mr-2 h-4 w-4 border-2 border-b-transparent rounded-full"></div>
                    Saving...
                  </>
                ) : (
                  "Update Question"
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
            <DialogTitle>Delete Question</DialogTitle>
            <DialogDescription>Are you sure you want to delete this question?</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-gray-500">
              Are you sure you want to delete the question{" "}
              <span className="font-medium text-gray-900">
                {currentQuestion?.questionText}
              </span>
              ? This action cannot be undone.
            </p>
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
              disabled={deleteQuestionMutation.isPending}
            >
              {deleteQuestionMutation.isPending ? (
                <>
                  <div className="animate-spin mr-2 h-4 w-4 border-2 border-b-transparent rounded-full"></div>
                  Deleting...
                </>
              ) : (
                "Delete Question"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}