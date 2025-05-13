import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { DialogFooter } from '@/components/ui/dialog';
import { Plus, X } from 'lucide-react';

interface DeviceType {
  id: number;
  name: string;
  slug: string;
  icon?: string;
  active?: boolean;
}

interface ConditionOption {
  id?: number;
  text: string;
  value: string | number;
}

interface ConditionQuestion {
  id?: number;
  question: string;
  deviceTypeId: number;
  brandId?: number | null;
  order: number;
  active: boolean;
  required: boolean;
  questionType: string;
  helpText?: string;
  options: ConditionOption[];
}

interface Brand {
  id: number;
  name: string;
  slug: string;
  logo?: string;
  active?: boolean;
}

interface QuestionFormProps {
  initialData?: ConditionQuestion;
  deviceTypes: DeviceType[];
  brands?: Brand[];
  onSubmit: (data: ConditionQuestion) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

export default function QuestionForm({
  initialData,
  deviceTypes,
  brands = [],
  onSubmit,
  onCancel,
  isSubmitting
}: QuestionFormProps) {
  // Initialize the form with the first device type ID if available, otherwise 0
  const [formData, setFormData] = useState<ConditionQuestion>({
    question: '',
    deviceTypeId: deviceTypes && deviceTypes.length > 0 ? deviceTypes[0].id : 0,
    brandId: null,
    order: 0,
    active: true,
    required: true,
    questionType: 'multiple_choice',
    helpText: '',
    options: [{ text: '', value: '' }]
  });
  const [newOption, setNewOption] = useState('');

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDeviceTypeChange = (value: string) => {
    setFormData(prev => ({ ...prev, deviceTypeId: parseInt(value, 10) }));
  };

  const handleActiveChange = (checked: boolean) => {
    setFormData(prev => ({ ...prev, active: checked }));
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...formData.options];
    newOptions[index] = { ...newOptions[index], text: value, value: value };
    setFormData(prev => ({ ...prev, options: newOptions }));
  };

  const addOption = () => {
    if (!newOption.trim()) return;
    
    // Check for duplicates
    if (formData.options.some(option => option.text === newOption.trim())) {
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      options: [...prev.options, { text: newOption.trim(), value: newOption.trim() }]
    }));
    setNewOption('');
  };

  const removeOption = (index: number) => {
    const newOptions = [...formData.options];
    newOptions.splice(index, 1);
    setFormData(prev => ({ ...prev, options: newOptions }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Filter out empty options
    const filteredOptions = formData.options.filter(option => option.text.trim() !== '');
    
    onSubmit({
      ...formData,
      options: filteredOptions
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="deviceTypeId">Device Type</Label>
        <Select 
          value={formData.deviceTypeId.toString()} 
          onValueChange={handleDeviceTypeChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select device type" />
          </SelectTrigger>
          <SelectContent>
            {deviceTypes.map(type => (
              <SelectItem key={type.id} value={type.id.toString()}>
                {type.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="brandId">Brand (Optional)</Label>
        <Select 
          value={formData.brandId === null || formData.brandId === undefined ? "none" : formData.brandId.toString()} 
          onValueChange={(value) => {
            const brandId = value === "none" ? null : parseInt(value, 10);
            setFormData(prev => ({ ...prev, brandId }));
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select brand (optional)" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Any Brand</SelectItem>
            {brands?.map(brand => (
              <SelectItem key={brand.id} value={brand.id.toString()}>
                {brand.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="questionType">Question Type</Label>
        <Select 
          value={formData.questionType} 
          onValueChange={(value) => {
            setFormData(prev => ({ ...prev, questionType: value }))
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select question type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
            <SelectItem value="single_choice">Single Choice</SelectItem>
            <SelectItem value="yes_no">Yes/No</SelectItem>
            <SelectItem value="text">Text Input</SelectItem>
            <SelectItem value="numeric">Numeric Input</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="question">Question</Label>
        <Input 
          id="question"
          name="question"
          value={formData.question}
          onChange={handleInputChange}
          placeholder="e.g., Is the screen cracked?"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="order">Display Order</Label>
        <Input 
          id="order"
          name="order"
          type="number"
          min="0"
          value={formData.order}
          onChange={handleInputChange}
          placeholder="0"
          required
        />
        <p className="text-xs text-muted-foreground">
          Questions are displayed in ascending order (lower numbers first)
        </p>
      </div>

      <div className="space-y-2">
        <Label>Answer Options</Label>
        {formData.options.map((option, index) => (
          <div key={index} className="flex items-center space-x-2">
            <Input
              value={option.text}
              onChange={(e) => handleOptionChange(index, e.target.value)}
              placeholder={`Option ${index + 1}`}
              required={index === 0}
            />
            {index > 0 && (
              <Button 
                type="button" 
                variant="ghost" 
                size="icon" 
                onClick={() => removeOption(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}

        <div className="flex space-x-2 mt-2">
          <Input
            value={newOption}
            onChange={(e) => setNewOption(e.target.value)}
            placeholder="Add another option"
          />
          <Button type="button" size="sm" onClick={addOption}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="helpText">Help Text (Optional)</Label>
        <Input 
          id="helpText"
          name="helpText"
          value={formData.helpText || ''}
          onChange={handleInputChange}
          placeholder="Additional instructions for this question"
        />
      </div>

      <div className="flex space-x-6">
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="active"
            checked={formData.active} 
            onCheckedChange={handleActiveChange}
          />
          <Label htmlFor="active">Active</Label>
        </div>
        
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="required"
            checked={formData.required} 
            onCheckedChange={(checked) => {
              setFormData(prev => ({ ...prev, required: !!checked }));
            }}
          />
          <Label htmlFor="required">Required</Label>
        </div>
      </div>

      <DialogFooter className="mt-6">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting 
            ? (initialData ? 'Updating...' : 'Creating...') 
            : (initialData ? 'Update Question' : 'Create Question')}
        </Button>
      </DialogFooter>
    </form>
  );
}