import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Plus, Trash2, Edit, Calculator, TrendingUp, TrendingDown,
  DollarSign, Percent, Settings, Save, AlertTriangle
} from 'lucide-react';
import { PriceEditor, PercentageEditor, TextEditor } from './RealtimeEditor';

const ModelPricingManager = () => {
  const [selectedModel, setSelectedModel] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newPricing, setNewPricing] = useState({
    modelId: '',
    basePrice: '',
    deductionRate: '0',
    pricingTierId: ''
  });

  const queryClient = useQueryClient();

  // Fetch models with pricing
  const { data: modelsWithPricing = [], isLoading } = useQuery({
    queryKey: ['models-pricing'],
    queryFn: async () => {
      const response = await fetch('/api/models-pricing');
      if (!response.ok) throw new Error('Failed to fetch models pricing');
      return response.json();
    }
  });

  // Fetch pricing tiers
  const { data: pricingTiers = [] } = useQuery({
    queryKey: ['pricing-tiers'],
    queryFn: async () => {
      const response = await fetch('/api/pricing-tiers');
      if (!response.ok) throw new Error('Failed to fetch pricing tiers');
      return response.json();
    }
  });

  // Create pricing mutation
  const createPricingMutation = useMutation({
    mutationFn: async (pricingData) => {
      const response = await fetch('/api/model-pricing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pricingData)
      });
      if (!response.ok) throw new Error('Failed to create pricing');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['models-pricing']);
      setShowAddForm(false);
      setNewPricing({ modelId: '', basePrice: '', deductionRate: '0', pricingTierId: '' });
    }
  });

  // Delete pricing mutation
  const deletePricingMutation = useMutation({
    mutationFn: async (pricingId) => {
      const response = await fetch(`/api/model-pricing/${pricingId}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Failed to delete pricing');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['models-pricing']);
    }
  });

  const calculateDisplayPrice = (basePrice, deductionRate) => {
    const deduction = (basePrice * deductionRate) / 100;
    return basePrice - deduction;
  };

  const handleCreatePricing = () => {
    if (!newPricing.modelId || !newPricing.basePrice) {
      alert('Please fill in required fields');
      return;
    }

    createPricingMutation.mutate({
      modelId: parseInt(newPricing.modelId),
      basePrice: parseFloat(newPricing.basePrice),
      deductionRate: parseFloat(newPricing.deductionRate),
      pricingTierId: newPricing.pricingTierId ? parseInt(newPricing.pricingTierId) : null
    });
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Model Pricing Manager</h2>
          <p className="text-gray-600 mt-1">Configure base prices and deduction rates for device models</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Model Pricing
        </button>
      </div>

      {/* Add New Pricing Form */}
      {showAddForm && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">Add New Model Pricing</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
              <select
                value={newPricing.modelId}
                onChange={(e) => setNewPricing({ ...newPricing, modelId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Model</option>
                {modelsWithPricing.map(model => (
                  <option key={model.id} value={model.id}>
                    {model.brand} {model.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Base Price (₹)</label>
              <input
                type="number"
                value={newPricing.basePrice}
                onChange={(e) => setNewPricing({ ...newPricing, basePrice: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="Enter base price"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Deduction Rate (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={newPricing.deductionRate}
                onChange={(e) => setNewPricing({ ...newPricing, deductionRate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="0"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pricing Tier</label>
              <select
                value={newPricing.pricingTierId}
                onChange={(e) => setNewPricing({ ...newPricing, pricingTierId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Default</option>
                {pricingTiers.map(tier => (
                  <option key={tier.id} value={tier.id}>{tier.name}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-gray-600">
              {newPricing.basePrice && (
                <span>
                  Display Price: ₹{calculateDisplayPrice(
                    parseFloat(newPricing.basePrice) || 0,
                    parseFloat(newPricing.deductionRate) || 0
                  ).toLocaleString('en-IN')}
                </span>
              )}
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreatePricing}
                disabled={createPricingMutation.isPending}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                <Save className="h-4 w-4 mr-2" />
                {createPricingMutation.isPending ? 'Creating...' : 'Create Pricing'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pricing List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Current Model Pricing</h3>
        </div>
        
        {modelsWithPricing.length === 0 ? (
          <div className="p-8 text-center">
            <Calculator className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Pricing Configured</h3>
            <p className="text-gray-600 mb-4">Add pricing for your device models to get started.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Device Model
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Base Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Deduction Rate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Display Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pricing Tier
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {modelsWithPricing.map((pricing) => {
                  const displayPrice = calculateDisplayPrice(pricing.basePrice, pricing.deductionRate);
                  const priceChange = ((displayPrice - pricing.basePrice) / pricing.basePrice) * 100;
                  
                  return (
                    <tr key={pricing.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {pricing.brand} {pricing.modelName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {pricing.deviceType}
                            </div>
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <PriceEditor
                          value={pricing.basePrice}
                          field="basePrice"
                          endpoint="model-pricing"
                          id={pricing.id}
                        />
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <PercentageEditor
                          value={pricing.deductionRate}
                          field="deductionRate"
                          endpoint="model-pricing"
                          id={pricing.id}
                        />
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="text-lg font-semibold text-green-600">
                            ₹{displayPrice.toLocaleString('en-IN')}
                          </span>
                          {priceChange !== 0 && (
                            <span className={`ml-2 flex items-center text-xs ${
                              priceChange > 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {priceChange > 0 ? (
                                <TrendingUp className="h-3 w-3 mr-1" />
                              ) : (
                                <TrendingDown className="h-3 w-3 mr-1" />
                              )}
                              {Math.abs(priceChange).toFixed(1)}%
                            </span>
                          )}
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          {pricing.pricingTier || 'Default'}
                        </span>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          pricing.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {pricing.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => setSelectedModel(pricing)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Edit Details"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm('Are you sure you want to delete this pricing?')) {
                                deletePricingMutation.mutate(pricing.id);
                              }
                            }}
                            className="text-red-600 hover:text-red-900"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pricing Summary */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <DollarSign className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Models</p>
              <p className="text-2xl font-semibold text-gray-900">{modelsWithPricing.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <Percent className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg Deduction Rate</p>
              <p className="text-2xl font-semibold text-gray-900">
                {modelsWithPricing.length > 0 
                  ? (modelsWithPricing.reduce((sum, p) => sum + p.deductionRate, 0) / modelsWithPricing.length).toFixed(1)
                  : '0'
                }%
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <Settings className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Pricing</p>
              <p className="text-2xl font-semibold text-gray-900">
                {modelsWithPricing.filter(p => p.isActive).length}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModelPricingManager;