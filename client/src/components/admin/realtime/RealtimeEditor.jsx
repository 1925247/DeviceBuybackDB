import React, { useState, useEffect, useCallback } from 'react';
import { Save, AlertCircle, CheckCircle, Edit2, X, Plus } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const RealtimeEditor = ({ 
  value, 
  field, 
  endpoint, 
  id, 
  type = 'text',
  placeholder = '',
  validation = null,
  onSuccess = null,
  formatDisplay = null,
  className = ''
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: async (newValue) => {
      const response = await fetch(`/api/${endpoint}/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: newValue })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Update failed');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      setIsEditing(false);
      setError('');
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
      
      // Invalidate relevant queries
      queryClient.invalidateQueries([endpoint]);
      if (endpoint.includes('question-groups')) {
        queryClient.invalidateQueries(['question-groups-advanced']);
      }
      
      if (onSuccess) {
        onSuccess(data);
      }
    },
    onError: (error) => {
      setError(error.message);
    }
  });

  const handleSave = useCallback(() => {
    // Validation
    if (validation) {
      const validationResult = validation(editValue);
      if (!validationResult.isValid) {
        setError(validationResult.message);
        return;
      }
    }

    // Convert value based on type
    let processedValue = editValue;
    if (type === 'number' && editValue !== '') {
      processedValue = parseFloat(editValue);
      if (isNaN(processedValue)) {
        setError('Please enter a valid number');
        return;
      }
    }

    updateMutation.mutate(processedValue);
  }, [editValue, validation, type, updateMutation]);

  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);
    setError('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  useEffect(() => {
    setEditValue(value);
  }, [value]);

  const displayValue = formatDisplay ? formatDisplay(value) : value;

  if (isEditing) {
    return (
      <div className={`relative ${className}`}>
        <div className="flex items-center space-x-2">
          {type === 'textarea' ? (
            <textarea
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder={placeholder}
              className="flex-1 px-2 py-1 border border-blue-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              autoFocus
            />
          ) : (
            <input
              type={type === 'number' ? 'number' : 'text'}
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={placeholder}
              className="flex-1 px-2 py-1 border border-blue-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
          )}
          
          <button
            onClick={handleSave}
            disabled={updateMutation.isPending}
            className="p-1 text-green-600 hover:text-green-800 disabled:opacity-50"
            title="Save"
          >
            {updateMutation.isPending ? (
              <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
          </button>
          
          <button
            onClick={handleCancel}
            className="p-1 text-gray-600 hover:text-gray-800"
            title="Cancel"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        
        {error && (
          <div className="absolute top-full left-0 mt-1 flex items-center text-red-600 text-sm">
            <AlertCircle className="w-3 h-3 mr-1" />
            {error}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`relative group ${className}`}>
      <div
        onClick={() => setIsEditing(true)}
        className="flex items-center cursor-pointer hover:bg-gray-50 px-2 py-1 rounded transition-colors"
      >
        <span className="flex-1">
          {displayValue || <span className="text-gray-400">{placeholder}</span>}
        </span>
        
        <Edit2 className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100 ml-2 transition-opacity" />
      </div>
      
      {showSuccess && (
        <div className="absolute top-full left-0 mt-1 flex items-center text-green-600 text-sm">
          <CheckCircle className="w-3 h-3 mr-1" />
          Updated successfully
        </div>
      )}
    </div>
  );
};

// Specialized components for different data types
export const PriceEditor = ({ value, ...props }) => (
  <RealtimeEditor
    {...props}
    value={value}
    type="number"
    formatDisplay={(val) => val ? `₹${val.toLocaleString('en-IN')}` : '₹0'}
    validation={(val) => {
      const num = parseFloat(val);
      if (isNaN(num) || num < 0) {
        return { isValid: false, message: 'Please enter a valid price' };
      }
      return { isValid: true };
    }}
  />
);

export const PercentageEditor = ({ value, ...props }) => (
  <RealtimeEditor
    {...props}
    value={value}
    type="number"
    formatDisplay={(val) => val ? `${val}%` : '0%'}
    validation={(val) => {
      const num = parseFloat(val);
      if (isNaN(num) || num < 0 || num > 100) {
        return { isValid: false, message: 'Please enter a percentage between 0 and 100' };
      }
      return { isValid: true };
    }}
  />
);

export const TextEditor = ({ value, maxLength = 255, ...props }) => (
  <RealtimeEditor
    {...props}
    value={value}
    type="text"
    validation={(val) => {
      if (val && val.length > maxLength) {
        return { isValid: false, message: `Maximum ${maxLength} characters allowed` };
      }
      return { isValid: true };
    }}
  />
);

export default RealtimeEditor;