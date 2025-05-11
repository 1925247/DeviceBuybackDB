// /home/project/src/pages/admin/AdminCQS.tsx
import React, { useState, ChangeEvent, FormEvent } from 'react';
import { Pencil, Trash2, Plus, Check, X } from 'lucide-react';
import conditionQuestionsData, {
  ConditionQuestions,
  ConditionQuestion,
  ConditionQuestionOption,
} from '/home/project/src/db/conditionQuestionsAns';

// Utility function to generate a unique ID using a prefix.
const generateUniqueId = (prefix: string): string => {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
};

const AdminCQS: React.FC = () => {
  // Local state: all questions grouped by device type
  const [questions, setQuestions] = useState<ConditionQuestions>(conditionQuestionsData);
  // Currently editing device type
  const [editingDeviceType, setEditingDeviceType] = useState<string>('');
  // The question object currently being edited (if any)
  const [editingQuestion, setEditingQuestion] = useState<ConditionQuestion | null>(null);
  // Form state for adding or editing a question
  const [formData, setFormData] = useState<Partial<ConditionQuestion>>({
    question: '',
    tooltip: '',
    options: [],
    active: true,
    multiSelect: false,
  });

  // --- Handler Functions ---

  // Open modal to add a new question for a given device type
  const handleAddNew = (deviceType: string) => {
    setEditingDeviceType(deviceType);
    setEditingQuestion(null);
    setFormData({
      question: '',
      tooltip: '',
      options: [],
      active: true,
      multiSelect: false,
    });
  };

  // Open modal to edit an existing question
  const handleEdit = (deviceType: string, question: ConditionQuestion) => {
    setEditingDeviceType(deviceType);
    setEditingQuestion(question);
    setFormData({ ...question });
  };

  // Delete a question from the given device type
  const handleDelete = (deviceType: string, questionId: string) => {
    if (window.confirm('Are you sure you want to delete this question?')) {
      setQuestions(prev => ({
        ...prev,
        [deviceType]: prev[deviceType].filter(q => q.id !== questionId),
      }));
    }
  };

  // Toggle the active status of a question
  const handleToggleActive = (deviceType: string, questionId: string) => {
    setQuestions(prev => ({
      ...prev,
      [deviceType]: prev[deviceType].map(q =>
        q.id === questionId ? { ...q, active: !q.active } : q
      ),
    }));
  };

  // Handle changes for the main form fields (question, tooltip, etc.)
  const handleFormChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // Add a new option to the current question's options array
  const handleAddOption = () => {
    const newOption: ConditionQuestionOption = {
      id: generateUniqueId('opt-new'),
      label: '',
      value: 1.0,
    };
    setFormData(prev => ({
      ...prev,
      options: [...(prev.options || []), newOption],
    }));
  };

  // Update a specific option field in the options array
  const handleOptionChange = (
    index: number,
    field: keyof ConditionQuestionOption,
    value: string | number
  ) => {
    if (!formData.options) return;
    const updatedOptions = [...formData.options];
    updatedOptions[index] = { ...updatedOptions[index], [field]: value };
    setFormData(prev => ({ ...prev, options: updatedOptions }));
  };

  // Handle form submission to add or update a question
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!editingDeviceType) return;

    setQuestions(prev => {
      const currentQuestions = prev[editingDeviceType] || [];
      if (editingQuestion) {
        // Update an existing question while preserving its ID
        return {
          ...prev,
          [editingDeviceType]: currentQuestions.map(q =>
            q.id === editingQuestion.id
              ? ({ ...q, ...formData, id: q.id } as ConditionQuestion)
              : q
          ),
        };
      } else {
        // Create a new question with a unique ID (prefix with device type)
        const newQuestion: ConditionQuestion = {
          id: generateUniqueId(`q-${editingDeviceType}`),
          question: formData.question || '',
          tooltip: formData.tooltip || '',
          options: formData.options || [],
          active: formData.active ?? true,
          multiSelect: formData.multiSelect || false,
        };
        return {
          ...prev,
          [editingDeviceType]: [...currentQuestions, newQuestion],
        };
      }
    });

    // Reset the editing state after submission
    setEditingDeviceType('');
    setEditingQuestion(null);
    setFormData({ question: '', tooltip: '', options: [], active: true, multiSelect: false });
  };

  // Get list of device types from the questions object keys
  const deviceTypes = Object.keys(questions);

  // --- Modal Component for Add/Edit Form ---
  const QuestionFormModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-1/2">
        <h2 className="text-2xl font-bold mb-4">
          {editingQuestion ? 'Edit Question' : 'Add New Question'} for {editingDeviceType}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Question</label>
            <input
              type="text"
              name="question"
              value={formData.question || ''}
              onChange={handleFormChange}
              className="w-full px-4 py-2 border rounded-md"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Tooltip</label>
            <textarea
              name="tooltip"
              value={formData.tooltip || ''}
              onChange={handleFormChange}
              className="w-full px-4 py-2 border rounded-md"
              required
            />
          </div>
          <div className="flex items-center">
            <label className="mr-2 text-sm font-medium text-gray-700">Active</label>
            <input
              type="checkbox"
              name="active"
              checked={formData.active || false}
              onChange={handleFormChange}
              className="h-4 w-4 text-blue-600"
            />
          </div>
          <div className="flex items-center">
            <label className="mr-2 text-sm font-medium text-gray-700">Multi Select</label>
            <input
              type="checkbox"
              name="multiSelect"
              checked={formData.multiSelect || false}
              onChange={handleFormChange}
              className="h-4 w-4 text-blue-600"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Options</label>
            {formData.options &&
              formData.options.map((opt, index) => (
                <div key={opt.id} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="Label"
                    value={opt.label}
                    onChange={(e) => handleOptionChange(index, 'label', e.target.value)}
                    className="flex-1 px-3 py-2 border rounded-md"
                    required
                  />
                  <input
                    type="number"
                    placeholder="Value"
                    value={opt.value}
                    onChange={(e) =>
                      handleOptionChange(index, 'value', parseFloat(e.target.value))
                    }
                    className="w-24 px-3 py-2 border rounded-md"
                    required
                  />
                </div>
              ))}
            <button
              type="button"
              onClick={handleAddOption}
              className="mt-2 text-blue-500 hover:underline"
            >
              + Add Option
            </button>
          </div>
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => {
                setEditingDeviceType('');
                setEditingQuestion(null);
              }}
              className="px-4 py-2 bg-gray-300 rounded-md"
            >
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded-md">
              {editingQuestion ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Manage Condition Questions</h1>
      {deviceTypes.map(deviceType => (
        <div key={deviceType} className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-2xl font-semibold capitalize">{deviceType}</h2>
            <button
              onClick={() => handleAddNew(deviceType)}
              className="bg-blue-500 text-white px-3 py-1 rounded-md flex items-center gap-1"
            >
              <Plus size={16} /> Add Question
            </button>
          </div>
          <table className="min-w-full bg-white rounded-lg shadow overflow-hidden">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">ID</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Question</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Tooltip</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Options</th>
                <th className="px-4 py-2 text-center text-sm font-medium text-gray-700">Active</th>
                <th className="px-4 py-2 text-center text-sm font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {questions[deviceType].map(q => (
                <tr key={q.id} className="border-t">
                  <td className="px-4 py-2 text-sm text-gray-800">{q.id}</td>
                  <td className="px-4 py-2 text-sm text-gray-800">{q.question}</td>
                  <td className="px-4 py-2 text-sm text-gray-600">{q.tooltip}</td>
                  <td className="px-4 py-2 text-sm text-gray-800">
                    {q.options.map(opt => (
                      <div key={opt.id}>
                        {opt.label} (Value: {opt.value})
                      </div>
                    ))}
                  </td>
                  <td className="px-4 py-2 text-center">
                    <button onClick={() => handleToggleActive(deviceType, q.id)}>
                      {q.active ? (
                        <Check className="inline w-4 h-4 text-green-600" />
                      ) : (
                        <X className="inline w-4 h-4 text-red-600" />
                      )}
                    </button>
                  </td>
                  <td className="px-4 py-2 text-center">
                    <button
                      onClick={() => handleEdit(deviceType, q)}
                      className="text-blue-600 hover:text-blue-800 mr-2"
                    >
                      <Pencil className="w-5 h-5 inline" />
                    </button>
                    <button
                      onClick={() => handleDelete(deviceType, q.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-5 h-5 inline" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
      {/* Render the modal when editing/adding a question */}
      {editingDeviceType && <QuestionFormModal />}
    </div>
  );
};

export default AdminCQS;
