import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface AnswerChoice {
  id: number;
  questionId?: number;
  answerText?: string;
  text?: string;
  answer_text?: string;
  icon?: string | null;
  weightage?: number;
  repairCost?: number;
  isDefault?: boolean;
  is_default?: boolean;
  order?: number | null;
}

interface Question {
  id: number;
  question_text?: string;
  questionText?: string;
  tooltip?: string;
  required?: boolean;
  active?: boolean;
  questionType?: string;
  question_type?: string;
  answer_choices?: AnswerChoice[];
}

interface QuestionPreviewProps {
  question: Question;
  questionNumber: number;
  expanded?: boolean;
}

const QuestionPreview: React.FC<QuestionPreviewProps> = ({ 
  question, 
  questionNumber,
  expanded = false
}) => {
  const [isExpanded, setIsExpanded] = useState(expanded);
  
  // Get the question text, handling different possible property names
  const getQuestionText = () => {
    return question.questionText || question.question_text || 'No question text provided';
  };

  // Get the question type, handling different possible property names
  const getQuestionType = () => {
    return question.questionType || question.question_type || 'text_input';
  };

  // Get answer choices, handling different possible property names
  const getAnswerChoices = () => {
    return question.answer_choices || [];
  };

  // Normalize answer choice properties
  const normalizeChoice = (choice: AnswerChoice) => {
    return {
      id: choice.id,
      text: choice.answerText || choice.text || choice.answer_text || 'No answer text',
      isDefault: choice.isDefault || choice.is_default || false,
      order: choice.order || 0
    };
  };

  // Sort answer choices by order
  const getSortedChoices = () => {
    const choices = getAnswerChoices();
    return [...choices].sort((a, b) => {
      const orderA = a.order || 0;
      const orderB = b.order || 0;
      return orderA - orderB;
    });
  };

  return (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div 
          className="flex justify-between items-center cursor-pointer" 
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center">
            <span className="font-medium text-gray-500 mr-2">{questionNumber}.</span>
            <span className="font-medium">
              {getQuestionText()}
            </span>
          </div>
          {isExpanded ? 
            <ChevronUp className="h-5 w-5 text-gray-500" /> : 
            <ChevronDown className="h-5 w-5 text-gray-500" />
          }
        </div>

        {isExpanded && (
          <div className="mt-4 pl-6">
            {getQuestionType() === 'text_input' ? (
              <div className="border rounded p-3 bg-gray-50">
                <p className="text-gray-500 italic">Text input field</p>
              </div>
            ) : (
              <div className="space-y-2">
                {getSortedChoices().length > 0 ? (
                  getSortedChoices().map(choice => {
                    const normalizedChoice = normalizeChoice(choice);
                    return (
                      <div 
                        key={normalizedChoice.id} 
                        className="flex items-center p-2 border rounded"
                      >
                        {getQuestionType() === 'single_choice' ? (
                          <div className={`w-4 h-4 rounded-full border mr-2 ${normalizedChoice.isDefault ? 'bg-blue-500 border-blue-500' : 'border-gray-300'}`} />
                        ) : (
                          <div className={`w-4 h-4 rounded border mr-2 ${normalizedChoice.isDefault ? 'bg-blue-500 border-blue-500' : 'border-gray-300'}`} />
                        )}
                        <span>{normalizedChoice.text}</span>
                        {normalizedChoice.isDefault && (
                          <Badge variant="outline" className="ml-2 bg-blue-50">
                            Default
                          </Badge>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <p className="text-gray-500 italic">No answer choices defined</p>
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default QuestionPreview;