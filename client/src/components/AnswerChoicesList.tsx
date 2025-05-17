import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { AlertCircle, Edit, LoaderCircle, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

// Type for answer choices from database
interface AnswerChoice {
  id: number;
  questionId: number;
  answerText: string;
  icon?: string | null;
  weightage: number;
  repairCost: number;
  isDefault: boolean;
  order: number;
  followUpAction?: any;
  createdAt: string;
  updatedAt: string;
}

interface AnswerChoicesListProps {
  questionId: number;
  questionType: string;
}

// Component to display answer choices with real-time database connection
const AnswerChoicesList: React.FC<AnswerChoicesListProps> = ({ questionId, questionType }) => {
  const { toast } = useToast();
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentChoice, setCurrentChoice] = useState<AnswerChoice | null>(null);
  const queryClient = useQueryClient();
  
  // Form state for editing
  const [editForm, setEditForm] = useState({
    answerText: "",
    weightage: 0,
    repairCost: 0,
    isDefault: false,
    order: 0
  });

  // Fetch answer choices from the database in real-time
  const { data: answerChoices, isLoading, error } = useQuery({
    queryKey: ['/api/answer-choices', questionId],
    queryFn: async () => {
      const response = await fetch(`/api/answer-choices/${questionId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch answer choices");
      }
      return response.json();
    },
    retry: false
  });

  // Mutation for deleting an answer choice
  const deleteMutation = useMutation({
    mutationFn: async (choiceId: number) => {
      const response = await apiRequest(
        "DELETE",
        `/api/answer-choices/${choiceId}`
      );
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to delete answer choice");
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Answer choice deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/answer-choices', questionId] });
      setShowDeleteModal(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete answer choice",
        variant: "destructive",
      });
    }
  });
  
  // Mutation for updating an answer choice
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: any }) => {
      const response = await apiRequest(
        "PATCH",
        `/api/answer-choices/${id}`,
        data
      );
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update answer choice");
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Answer choice updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/answer-choices', questionId] });
      setShowEditModal(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update answer choice",
        variant: "destructive",
      });
    }
  });

  // Handle delete confirmation
  const handleDeleteConfirm = () => {
    if (currentChoice) {
      deleteMutation.mutate(currentChoice.id);
    }
  };
  
  // Handle edit confirmation
  const handleEditConfirm = () => {
    if (currentChoice) {
      updateMutation.mutate({ 
        id: currentChoice.id, 
        data: editForm 
      });
    }
  };
  
  // Set up edit form when choice is selected
  const openEditModal = (choice: AnswerChoice) => {
    setCurrentChoice(choice);
    setEditForm({
      answerText: choice.answerText,
      weightage: choice.weightage,
      repairCost: choice.repairCost,
      isDefault: choice.isDefault,
      order: choice.order
    });
    setShowEditModal(true);
  };

  // Function to render the choice preview
  const renderChoicePreview = (choice: AnswerChoice) => {
    return (
      <div>
        <p className="font-medium">{choice.answerText}</p>
      </div>
    );
  };

  // If loading, display spinner
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-4">
        <LoaderCircle className="animate-spin h-6 w-6 text-gray-500" />
      </div>
    );
  }

  // If error, display error message
  if (error) {
    return (
      <div className="text-red-500 py-2">
        <AlertCircle className="h-4 w-4 inline mr-2" />
        Failed to load answer choices
      </div>
    );
  }

  // If no answer choices, display message
  if (!answerChoices || answerChoices.length === 0) {
    return (
      <div className="text-gray-500 py-2 italic">
        No answer choices defined for this question
      </div>
    );
  }

  // Sort answer choices by order
  const sortedChoices = [...answerChoices].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  return (
    <>
      {sortedChoices.map((choice) => (
        <Card
          key={choice.id}
          className={`${choice.isDefault ? "border-blue-300 bg-blue-50" : ""}`}
        >
          <CardContent className="p-3">
            <div className="flex items-center">
              {questionType === "single_choice" ? (
                <div
                  className={`w-4 h-4 rounded-full border mr-3 flex-shrink-0 ${choice.isDefault ? "bg-blue-500 border-blue-500" : "border-gray-300"}`}
                />
              ) : (
                <div
                  className={`w-4 h-4 rounded border mr-3 flex-shrink-0 ${choice.isDefault ? "bg-blue-500 border-blue-500" : "border-gray-300"}`}
                />
              )}
              <div className="flex-1">
                {renderChoicePreview(choice)}
              </div>
              <div className="ml-3 text-sm text-gray-500">
                <span className="mr-2">
                  W: {choice.weightage ?? 0}
                </span>
                <span>R: ${choice.repairCost ?? 0}</span>
              </div>
              <div className="ml-3 flex space-x-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => openEditModal(choice)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-red-500 hover:text-red-700"
                  onClick={() => {
                    setCurrentChoice(choice);
                    setShowDeleteModal(true);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Edit Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Answer Choice</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="answerText">Answer Text</Label>
              <Input
                id="answerText"
                value={editForm.answerText}
                onChange={(e) => setEditForm({...editForm, answerText: e.target.value})}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="weightage">Weightage (Impact %)</Label>
              <Input
                id="weightage"
                type="number"
                value={editForm.weightage}
                onChange={(e) => setEditForm({...editForm, weightage: parseFloat(e.target.value)})}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="repairCost">Repair Cost ($)</Label>
              <Input
                id="repairCost"
                type="number"
                value={editForm.repairCost}
                onChange={(e) => setEditForm({...editForm, repairCost: parseFloat(e.target.value)})}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="order">Display Order</Label>
              <Input
                id="order"
                type="number"
                value={editForm.order}
                onChange={(e) => setEditForm({...editForm, order: parseInt(e.target.value)})}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="isDefault"
                checked={editForm.isDefault}
                onCheckedChange={(checked) => setEditForm({...editForm, isDefault: checked})}
              />
              <Label htmlFor="isDefault">Set as Default</Label>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowEditModal(false)}
              disabled={updateMutation.isPending}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleEditConfirm}
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? (
                <>
                  <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the answer choice "{currentChoice?.answerText}"?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteModal(false)}
              disabled={deleteMutation.isPending}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? (
                <>
                  <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AnswerChoicesList;