import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../../lib/queryClient';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Textarea } from '../../components/ui/textarea';
import { Badge } from '../../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { 
  Plus, 
  Upload, 
  Edit, 
  Trash2, 
  Settings, 
  DollarSign, 
  HelpCircle,
  Smartphone,
  Tag,
  Package,
  Save,
  X,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useToast } from '../../hooks/use-toast';

const AdvancedModelIntegration = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // State management
  const [activeTab, setActiveTab] = useState('models');
  const [selectedModel, setSelectedModel] = useState(null);
  const [isCreatingModel, setIsCreatingModel] = useState(false);
  const [modelFormData, setModelFormData] = useState({
    name: '',
    brandId: '',
    deviceTypeId: '',
    description: '',
    image: null,
    featured: false
  });
  const [variantFormData, setVariantFormData] = useState({
    name: '',
    storage: '',
    color: '',
    condition: '',
    basePrice: ''
  });

  // Queries
  const { data: deviceTypes = [] } = useQuery({
    queryKey: ['/api/device-types'],
    queryFn: () => apiRequest('/api/device-types')
  });

  const { data: brands = [] } = useQuery({
    queryKey: ['/api/brands'],
    queryFn: () => apiRequest('/api/brands')
  });

  const { data: models = [], isLoading: modelsLoading } = useQuery({
    queryKey: ['/api/device-models', { includeDetails: true }],
    queryFn: () => apiRequest('/api/device-models?includeDetails=true')
  });

  const { data: questionGroups = [] } = useQuery({
    queryKey: ['/api/question-groups'],
    queryFn: () => apiRequest('/api/question-groups')
  });

  // Mutations
  const createModelMutation = useMutation({
    mutationFn: (formData) => {
      const data = new FormData();
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null && formData[key] !== '') {
          data.append(key, formData[key]);
        }
      });
      return apiRequest('/admin/models', {
        method: 'POST',
        body: data
      });
    },
    onSuccess: (data) => {
      toast({
        title: 'Success',
        description: 'Model created successfully'
      });
      setIsCreatingModel(false);
      setModelFormData({
        name: '',
        brandId: '',
        deviceTypeId: '',
        description: '',
        image: null,
        featured: false
      });
      queryClient.invalidateQueries(['/api/device-models']);
      setSelectedModel(data);
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create model',
        variant: 'destructive'
      });
    }
  });

  const createVariantMutation = useMutation({
    mutationFn: ({ modelId, variantData }) => 
      apiRequest(`/admin/models/${modelId}/variants`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(variantData)
      }),
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Variant added successfully'
      });
      setVariantFormData({
        name: '',
        storage: '',
        color: '',
        condition: '',
        basePrice: ''
      });
      queryClient.invalidateQueries(['/api/device-models']);
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to add variant',
        variant: 'destructive'
      });
    }
  });

  // Event handlers
  const handleModelSubmit = (e) => {
    e.preventDefault();
    if (!modelFormData.image) {
      toast({
        title: 'Error',
        description: 'Model image is required',
        variant: 'destructive'
      });
      return;
    }
    createModelMutation.mutate(modelFormData);
  };

  const handleVariantSubmit = (e) => {
    e.preventDefault();
    if (!selectedModel) return;
    
    createVariantMutation.mutate({
      modelId: selectedModel.id,
      variantData: {
        ...variantFormData,
        basePrice: parseFloat(variantFormData.basePrice)
      }
    });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setModelFormData(prev => ({ ...prev, image: file }));
    }
  };

  // Component renders
  const ModelForm = () => (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Smartphone className="w-5 h-5" />
          Create New Model
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleModelSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="modelName">Model Name *</Label>
              <Input
                id="modelName"
                value={modelFormData.name}
                onChange={(e) => setModelFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., iPhone 15 Pro"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="brand">Brand *</Label>
              <Select 
                value={modelFormData.brandId} 
                onValueChange={(value) => setModelFormData(prev => ({ ...prev, brandId: value }))}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select brand" />
                </SelectTrigger>
                <SelectContent>
                  {brands.map(brand => (
                    <SelectItem key={brand.id} value={brand.id.toString()}>
                      {brand.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="deviceType">Device Type *</Label>
              <Select 
                value={modelFormData.deviceTypeId} 
                onValueChange={(value) => setModelFormData(prev => ({ ...prev, deviceTypeId: value }))}
                required
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

            <div>
              <Label htmlFor="modelImage">Model Image *</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="modelImage"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  required
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('modelImage').click()}
                  className="flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  {modelFormData.image ? 'Change Image' : 'Upload Image'}
                </Button>
                {modelFormData.image && (
                  <span className="text-sm text-green-600 flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" />
                    {modelFormData.image.name}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={modelFormData.description}
              onChange={(e) => setModelFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Model description..."
              rows={3}
            />
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={modelFormData.featured}
                onChange={(e) => setModelFormData(prev => ({ ...prev, featured: e.target.checked }))}
              />
              <span>Featured Model</span>
            </label>
          </div>

          <div className="flex gap-2">
            <Button 
              type="submit" 
              disabled={createModelMutation.isPending}
              className="flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {createModelMutation.isPending ? 'Creating...' : 'Create Model'}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsCreatingModel(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );

  const VariantManagement = ({ model }) => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="w-5 h-5" />
          Variant Pricing - {model?.name}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleVariantSubmit} className="space-y-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <Label>Variant Name</Label>
              <Input
                value={variantFormData.name}
                onChange={(e) => setVariantFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Pro Max"
                required
              />
            </div>
            <div>
              <Label>Storage</Label>
              <Input
                value={variantFormData.storage}
                onChange={(e) => setVariantFormData(prev => ({ ...prev, storage: e.target.value }))}
                placeholder="e.g., 256GB"
                required
              />
            </div>
            <div>
              <Label>Color</Label>
              <Input
                value={variantFormData.color}
                onChange={(e) => setVariantFormData(prev => ({ ...prev, color: e.target.value }))}
                placeholder="e.g., Space Black"
                required
              />
            </div>
            <div>
              <Label>Condition</Label>
              <Select 
                value={variantFormData.condition} 
                onValueChange={(value) => setVariantFormData(prev => ({ ...prev, condition: value }))}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Condition" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="like-new">Like New</SelectItem>
                  <SelectItem value="good">Good</SelectItem>
                  <SelectItem value="fair">Fair</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Base Price (₹)</Label>
              <Input
                type="number"
                value={variantFormData.basePrice}
                onChange={(e) => setVariantFormData(prev => ({ ...prev, basePrice: e.target.value }))}
                placeholder="45000"
                required
              />
            </div>
          </div>
          <Button 
            type="submit" 
            disabled={createVariantMutation.isPending}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            {createVariantMutation.isPending ? 'Adding...' : 'Add Variant'}
          </Button>
        </form>

        {/* Existing Variants Display */}
        {model?.variants && model.variants.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium">Existing Variants:</h4>
            {model.variants.map((variant, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded">
                <div className="flex items-center gap-4">
                  <span className="font-medium">{variant.name}</span>
                  <Badge variant="outline">{variant.storage}</Badge>
                  <Badge variant="outline">{variant.color}</Badge>
                  <Badge variant="outline">{variant.condition}</Badge>
                  <span className="text-green-600 font-medium">₹{variant.basePrice}</span>
                </div>
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <HelpCircle className="w-4 h-4" />
                  Map Questions
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );

  const ModelsGrid = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">All Models</h3>
        <Button 
          onClick={() => setIsCreatingModel(true)}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add New Model
        </Button>
      </div>

      {modelsLoading ? (
        <div className="text-center py-8">Loading models...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {models.map((model) => (
            <Card 
              key={model.id} 
              className={`cursor-pointer transition-all ${
                selectedModel?.id === model.id ? 'ring-2 ring-blue-500' : ''
              }`}
              onClick={() => setSelectedModel(model)}
            >
              <CardContent className="p-4">
                <div className="aspect-square bg-gray-100 rounded-lg mb-3 flex items-center justify-center">
                  {model.image ? (
                    <img 
                      src={model.image} 
                      alt={model.name}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <Smartphone className="w-8 h-8 text-gray-400" />
                  )}
                </div>
                <h4 className="font-medium">{model.name}</h4>
                <p className="text-sm text-gray-500">{model.brandName} • {model.deviceTypeName}</p>
                <div className="flex items-center justify-between mt-2">
                  <Badge variant={model.featured ? "default" : "outline"}>
                    {model.featured ? 'Featured' : 'Standard'}
                  </Badge>
                  <span className="text-xs text-gray-500">
                    {model.variantCount || 0} variants
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Advanced Model Integration</h1>
          <p className="text-gray-600">Unified device management workflow</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="models" className="flex items-center gap-2">
            <Package className="w-4 h-4" />
            Models
          </TabsTrigger>
          <TabsTrigger value="management" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Management
          </TabsTrigger>
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Tag className="w-4 h-4" />
            Overview
          </TabsTrigger>
        </TabsList>

        <TabsContent value="models" className="space-y-6">
          {isCreatingModel && <ModelForm />}
          <ModelsGrid />
        </TabsContent>

        <TabsContent value="management" className="space-y-6">
          {selectedModel ? (
            <VariantManagement model={selectedModel} />
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <div className="text-center">
                  <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Select a Model</h3>
                  <p className="text-gray-500">Choose a model from the Models tab to manage variants and pricing</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Package className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{models.length}</p>
                    <p className="text-sm text-gray-600">Total Models</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <Tag className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{brands.length}</p>
                    <p className="text-sm text-gray-600">Active Brands</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <HelpCircle className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{questionGroups.length}</p>
                    <p className="text-sm text-gray-600">Question Groups</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdvancedModelIntegration;