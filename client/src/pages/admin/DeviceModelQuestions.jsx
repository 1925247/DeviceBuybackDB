import React, { useState, useEffect } from 'react';
import { Search, Link as LinkIcon, Plus, Trash2, Filter } from 'lucide-react';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const DeviceModelQuestions = () => {
  const [models, setModels] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [mappings, setMappings] = useState([]);
  const [brands, setBrands] = useState([]);
  const [deviceTypes, setDeviceTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedDeviceType, setSelectedDeviceType] = useState('');
  const [selectedModel, setSelectedModel] = useState(null);
  const [availableQuestions, setAvailableQuestions] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const [modelsRes, questionsRes, mappingsRes, brandsRes, deviceTypesRes] = await Promise.all([
        fetch('/api/device-models'),
        fetch('/api/condition-questions'),
        fetch('/api/device-model-questions'),
        fetch('/api/brands'),
        fetch('/api/device-types')
      ]);

      if (modelsRes.ok && questionsRes.ok && brandsRes.ok && deviceTypesRes.ok) {
        const [modelsData, questionsData, mappingsData, brandsData, deviceTypesData] = await Promise.all([
          modelsRes.json(),
          questionsRes.json(),
          mappingsRes.ok ? mappingsRes.json() : [],
          brandsRes.json(),
          deviceTypesRes.json()
        ]);

        setModels(modelsData);
        setQuestions(questionsData);
        setMappings(mappingsData);
        setBrands(brandsData);
        setDeviceTypes(deviceTypesData);
      } else {
        // Mock data fallback
        setModels([
          { id: 1, name: 'iPhone 15 Pro', brand_id: 1, device_type_id: 1 },
          { id: 2, name: 'Galaxy S24 Ultra', brand_id: 2, device_type_id: 1 },
          { id: 3, name: 'MacBook Pro 16"', brand_id: 1, device_type_id: 2 }
        ]);
        setQuestions([
          { id: 1, question: 'What is the overall condition?', device_type_id: 1, active: true },
          { id: 2, question: 'Does the screen have any damage?', device_type_id: 1, active: true },
          { id: 3, question: 'Is the battery functioning properly?', device_type_id: 1, active: true }
        ]);
        setMappings([
          { id: 1, model_id: 1, question_id: 1 },
          { id: 2, model_id: 1, question_id: 2 }
        ]);
        setBrands([
          { id: 1, name: 'Apple' },
          { id: 2, name: 'Samsung' }
        ]);
        setDeviceTypes([
          { id: 1, name: 'Smartphone' },
          { id: 2, name: 'Laptop' }
        ]);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getBrandName = (brandId) => {
    const brand = brands.find(b => b.id === brandId);
    return brand ? brand.name : 'Unknown';
  };

  const getDeviceTypeName = (deviceTypeId) => {
    const deviceType = deviceTypes.find(dt => dt.id === deviceTypeId);
    return deviceType ? deviceType.name : 'Unknown';
  };

  const getModelQuestions = (modelId) => {
    const modelMappings = mappings.filter(m => m.model_id === modelId);
    return modelMappings.map(mapping => {
      const question = questions.find(q => q.id === mapping.question_id);
      return question;
    }).filter(Boolean);
  };

  const handleModelSelect = (model) => {
    setSelectedModel(model);
    
    // Get questions available for this device type that are not already mapped
    const modelQuestionIds = mappings
      .filter(m => m.model_id === model.id)
      .map(m => m.question_id);
    
    const available = questions.filter(q => 
      q.device_type_id === model.device_type_id && 
      q.active && 
      !modelQuestionIds.includes(q.id)
    );
    
    setAvailableQuestions(available);
  };

  const handleAddQuestion = async (questionId) => {
    try {
      const response = await fetch('/api/device-model-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model_id: selectedModel.id,
          question_id: questionId
        })
      });

      if (response.ok) {
        await fetchData();
        handleModelSelect(selectedModel); // Refresh available questions
      }
    } catch (error) {
      console.error('Error adding question mapping:', error);
    }
  };

  const handleRemoveQuestion = async (mappingId) => {
    try {
      const response = await fetch(`/api/device-model-questions/${mappingId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await fetchData();
        handleModelSelect(selectedModel); // Refresh available questions
      }
    } catch (error) {
      console.error('Error removing question mapping:', error);
    }
  };

  const filteredModels = models.filter(model => {
    const matchesSearch = model.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBrand = !selectedBrand || model.brand_id.toString() === selectedBrand;
    const matchesDeviceType = !selectedDeviceType || model.device_type_id.toString() === selectedDeviceType;
    
    return matchesSearch && matchesBrand && matchesDeviceType;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Device Model Questions</h1>
        <p className="text-gray-600 mt-2">Map condition questions to specific device models</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Models List */}
        <div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Device Models</h2>
            
            {/* Filters */}
            <div className="space-y-4 mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search models..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <select
                  value={selectedBrand}
                  onChange={(e) => setSelectedBrand(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Brands</option>
                  {brands.map(brand => (
                    <option key={brand.id} value={brand.id}>{brand.name}</option>
                  ))}
                </select>

                <select
                  value={selectedDeviceType}
                  onChange={(e) => setSelectedDeviceType(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Types</option>
                  {deviceTypes.map(type => (
                    <option key={type.id} value={type.id}>{type.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Models List */}
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredModels.map(model => {
                const modelQuestions = getModelQuestions(model.id);
                return (
                  <div
                    key={model.id}
                    onClick={() => handleModelSelect(model)}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedModel?.id === model.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">{model.name}</h3>
                        <p className="text-sm text-gray-500">
                          {getBrandName(model.brand_id)} • {getDeviceTypeName(model.device_type_id)}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500">
                          {modelQuestions.length} questions
                        </span>
                        <LinkIcon className="h-4 w-4 text-gray-400" />
                      </div>
                    </div>
                  </div>
                );
              })}

              {filteredModels.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-500">No models found</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Question Management */}
        <div>
          {selectedModel ? (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900">{selectedModel.name}</h2>
                <p className="text-gray-600">
                  {getBrandName(selectedModel.brand_id)} • {getDeviceTypeName(selectedModel.device_type_id)}
                </p>
              </div>

              {/* Current Questions */}
              <div className="mb-8">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Current Questions ({getModelQuestions(selectedModel.id).length})
                </h3>
                
                <div className="space-y-3">
                  {getModelQuestions(selectedModel.id).map(question => {
                    const mapping = mappings.find(m => 
                      m.model_id === selectedModel.id && m.question_id === question.id
                    );
                    
                    return (
                      <div key={question.id} className="flex items-start justify-between p-3 border border-gray-200 rounded-md">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{question.question}</p>
                        </div>
                        <button
                          onClick={() => handleRemoveQuestion(mapping?.id)}
                          className="text-red-600 hover:text-red-700 ml-3"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    );
                  })}

                  {getModelQuestions(selectedModel.id).length === 0 && (
                    <div className="text-center py-6 text-gray-500">
                      No questions assigned to this model
                    </div>
                  )}
                </div>
              </div>

              {/* Available Questions */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Available Questions ({availableQuestions.length})
                </h3>
                
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {availableQuestions.map(question => (
                    <div key={question.id} className="flex items-start justify-between p-3 border border-gray-200 rounded-md hover:bg-gray-50">
                      <div className="flex-1">
                        <p className="text-sm text-gray-900">{question.question}</p>
                      </div>
                      <button
                        onClick={() => handleAddQuestion(question.id)}
                        className="text-blue-600 hover:text-blue-700 ml-3"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  ))}

                  {availableQuestions.length === 0 && (
                    <div className="text-center py-6 text-gray-500">
                      No additional questions available for this device type
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="text-center py-12">
                <LinkIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Model</h3>
                <p className="text-gray-500">
                  Choose a device model from the list to manage its condition questions
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6 text-center">
          <div className="text-2xl font-bold text-gray-900">{models.length}</div>
          <div className="text-sm text-gray-600">Total Models</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6 text-center">
          <div className="text-2xl font-bold text-gray-900">{questions.length}</div>
          <div className="text-sm text-gray-600">Total Questions</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6 text-center">
          <div className="text-2xl font-bold text-gray-900">{mappings.length}</div>
          <div className="text-sm text-gray-600">Question Mappings</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6 text-center">
          <div className="text-2xl font-bold text-gray-900">
            {models.filter(m => getModelQuestions(m.id).length > 0).length}
          </div>
          <div className="text-sm text-gray-600">Models with Questions</div>
        </div>
      </div>
    </div>
  );
};

export default DeviceModelQuestions;