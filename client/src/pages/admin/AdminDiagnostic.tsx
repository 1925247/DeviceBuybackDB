// src/pages/admin/AdminDiagnostic.tsx
import React, { useState, ChangeEvent, FormEvent } from "react";
import { Pencil, Trash2, Plus, Check, X } from "lucide-react";

import diagnosticQuestionsData, {
  DiagnosticQuestions,
  DiagnosticQuestion,
  DiagnosticQuestionOption,
} from "../../db/diagnosticQuestionsAns";

// Utility to generate unique IDs
const generateUniqueId = (prefix: string): string =>
  `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1e3)}`;

const AdminDiagnostic: React.FC = () => {
  // All questions grouped by device type
  const [questions, setQuestions] = useState<DiagnosticQuestions>(diagnosticQuestionsData);

  // Current edit context
  const [editingDeviceType, setEditingDeviceType] = useState<string>("");
  const [editingQuestion, setEditingQuestion] = useState<DiagnosticQuestion | null>(null);

  // Form state
  const [formData, setFormData] = useState<Partial<DiagnosticQuestion>>({
    question: "",
    tooltip: "",
    options: [],
    active: true,
    multiSelect: false,
  });

  // Handlers

  // Open form for new question
  const handleAddNew = (deviceType: string) => {
    setEditingDeviceType(deviceType);
    setEditingQuestion(null);
    setFormData({ question: "", tooltip: "", options: [], active: true, multiSelect: false });
  };

  // Open form to edit existing question
  const handleEdit = (deviceType: string, question: DiagnosticQuestion) => {
    setEditingDeviceType(deviceType);
    setEditingQuestion(question);
    setFormData({ ...question });
  };

  // Delete question
  const handleDelete = (deviceType: string, questionId: string) => {
    if (window.confirm("Are you sure you want to delete this question?")) {
      setQuestions(prev => ({
        ...prev,
        [deviceType]: prev[deviceType].filter(q => q.id !== questionId),
      }));
    }
  };

  // Toggle active status
  const handleToggleActive = (deviceType: string, questionId: string) => {
    setQuestions(prev => ({
      ...prev,
      [deviceType]: prev[deviceType].map(q =>
        q.id === questionId ? { ...q, active: !q.active } : q
      ),
    }));
  };

  // Form field change
  const handleFormChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Add option to form
  const handleAddOption = () => {
    const newOption: DiagnosticQuestionOption = {
      id: generateUniqueId("opt"),
      label: "",
      value: 1.0,
    };
    setFormData(prev => ({
      ...prev,
      options: [...(prev.options || []), newOption],
    }));
  };

  // Update option field
  const handleOptionChange = (
    index: number,
    field: keyof DiagnosticQuestionOption,
    value: string | number
  ) => {
    if (!formData.options) return;
    const updatedOptions = [...formData.options];
    updatedOptions[index] = { ...updatedOptions[index], [field]: value };
    setFormData(prev => ({ ...prev, options: updatedOptions }));
  };

  // Submit form to create or update question
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!editingDeviceType) return;

    setQuestions(prev => {
      const list = prev[editingDeviceType] || [];
      if (editingQuestion) {
        // update existing
        return {
          ...prev,
          [editingDeviceType]: list.map(q =>
            q.id === editingQuestion.id
              ? ({ ...q, ...formData, id: q.id } as DiagnosticQuestion)
              : q
          ),
        };
      }
      // create new
      const newQ: DiagnosticQuestion = {
        id: generateUniqueId(`q-${editingDeviceType}`),
        question: formData.question || "",
        tooltip: formData.tooltip || "",
        options: formData.options || [],
        active: formData.active ?? true,
        multiSelect: formData.multiSelect || false,
      };
      return {
        ...prev,
        [editingDeviceType]: [...list, newQ],
      };
    });

    // reset
    setEditingDeviceType("");
    setEditingQuestion(null);
    setFormData({ question: "", tooltip: "", options: [], active: true, multiSelect: false });
  };

  const deviceTypes = Object.keys(questions);

  // Modal component
  const QuestionFormModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-1/2">
        <h2 className="text-2xl font-bold mb-4">
          {editingQuestion ? "Edit Question" : "Add New Question"} for {editingDeviceType}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* question, tooltip, active, multiSelect, options inputs here… same as AdminCQS logic */}
        </form>
      </div>
    </div>
  );

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Manage Diagnostic Questions</h1>
      {deviceTypes.map(deviceType => (
        <div key={deviceType} className="mb-8">
          {/* header and Add button */}
          {/* table rendering questions */}
        </div>
      ))}
      {editingDeviceType && <QuestionFormModal />}
    </div>
  );
};

export default AdminDiagnostic;