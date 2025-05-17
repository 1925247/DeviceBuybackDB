import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, LoaderCircle } from "lucide-react";

interface AnswerChoicesPreviewProps {
  questionId: number;
  questionType: string;
}

interface AnswerChoice {
  id: number;
  questionId: number;
  answerText: string;
  icon?: string | null;
  weightage: number;
  repairCost: number;
  isDefault: boolean;
  order: number;
}

const AnswerChoicesPreview: React.FC<AnswerChoicesPreviewProps> = ({ 
  questionId, 
  questionType 
}) => {
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
                <p className="font-medium">{choice.answerText}</p>
              </div>
              <div className="ml-3 text-sm text-gray-500">
                <span className="mr-2">
                  W: {choice.weightage ?? 0}
                </span>
                <span>R: ${choice.repairCost ?? 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </>
  );
};

export default AnswerChoicesPreview;