import React, { useState, useEffect } from 'react';
import { Settings, Target, Edit, Eye, Plus, Smartphone, Laptop, Tablet } from 'lucide-react';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const AdminAssessmentConfig = () => {
  const [devices, setDevices] = useState([]);
  const [brands, setBrands] = useState([]);
  const [questionGroups, setQuestionGroups] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [selectedBrand, setBrandlectedBrand] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [assessmentConfig, setAssessmentConfig] = useState({});

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [devicesRes, brandsRes, groupsRes] = await Promise.all([
        fetch('/api/device-models'),
        fetch('/api/brands'),
        fetch('/api/question-groups')
      ]);

      if (devicesRes.ok) setDevices(await devicesRes.json());
      if (brandsRes.ok) setBrands(await brandsRes.json());
      if (groupsRes.ok) setQuestionGroups(await groupsRes.json());
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDeviceIcon = (deviceType) => {
    switch (deviceType?.toLowerCase()) {
      case 'smartphone': return <Smartphone className="h-5 w-5" />;
      case 'laptop': return <Laptop className="h-5 w-5" />;
      case 'tablet': return <Tablet className="h-5 w-5" />;
      default: return <Settings className="h-5 w-5" />;
    }
  };

  const devicesByBrand = devices.reduce((acc, device) => {
    const brandName = device.brandName || 'Unknown';
    if (!acc[brandName]) {
      acc[brandName] = [];
    }
    acc[brandName].push(device);
    return acc;
  }, {});

  const handleConfigureDevice = (device) => {
    setSelectedDevice(device);
    setShowConfigModal(true);
    // Load existing configuration for this device
    loadDeviceConfiguration(device.id);
  };

  const loadDeviceConfiguration = async (deviceId) => {
    try {
      const response = await fetch(`/api/questions/models?modelIds=${deviceId}`);
      if (response.ok) {
        const questions = await response.json();
        setAssessmentConfig({
          deviceId,
          questions: questions.map(q => ({
            id: q.id,
            text: q.text,
            enabled: true,
            answers: q.answers
          }))
        });
      }
    } catch (error) {
      console.error('Error loading device configuration:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Assessment Configuration</h1>
        <p className="text-gray-600 mt-2">Configure device-specific assessment questions and rules</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center space-x-3 mb-3">
            <Target className="h-8 w-8 text-blue-600" />
            <h3 className="text-lg font-semibold">Model Targeting</h3>
          </div>
          <p className="text-gray-600 text-sm mb-4">Configure which questions apply to specific device models</p>
          <button 
            onClick={() => window.location.href = '/admin/question-builder'}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
          >
            Manage Questions
          </button>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center space-x-3 mb-3">
            <Settings className="h-8 w-8 text-green-600" />
            <h3 className="text-lg font-semibold">Question Groups</h3>
          </div>
          <p className="text-gray-600 text-sm mb-4">Create and organize question groups by categories</p>
          <button 
            onClick={() => window.location.href = '/admin/question-groups'}
            className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700"
          >
            Manage Groups
          </button>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center space-x-3 mb-3">
            <Plus className="h-8 w-8 text-purple-600" />
            <h3 className="text-lg font-semibold">Bulk Configuration</h3>
          </div>
          <p className="text-gray-600 text-sm mb-4">Apply question sets to multiple devices at once</p>
          <button className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700">
            Bulk Configure
          </button>
        </div>
      </div>

      {/* Device Configuration Grid */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold">Device Assessment Configuration</h2>
          <p className="text-gray-600">Configure assessment questions for each device model</p>
        </div>
        
        <div className="divide-y divide-gray-200">
          {Object.entries(devicesByBrand).map(([brandName, brandDevices]) => (
            <div key={brandName} className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">{brandName}</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {brandDevices.map((device) => (
                  <div key={device.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        {getDeviceIcon(device.deviceTypeName)}
                        <div>
                          <h4 className="font-medium text-gray-900">{device.name}</h4>
                          <p className="text-sm text-gray-500">{device.deviceTypeName}</p>
                        </div>
                      </div>
                      
                      <div className="flex space-x-1">
                        <span className={`px-2 py-1 text-xs rounded-full ${device.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                          {device.active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Base Price:</span>
                        <span className="font-medium">₹{device.base_price ? Math.round(device.base_price * 83).toLocaleString('en-IN') : 'TBD'}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Assessment Status:</span>
                        <span className="text-green-600 font-medium">Configured</span>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleConfigureDevice(device)}
                        className="flex-1 bg-blue-600 text-white py-2 px-3 rounded text-sm hover:bg-blue-700 flex items-center justify-center"
                      >
                        <Settings className="h-3 w-3 mr-1" />
                        Configure
                      </button>
                      <button className="p-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded">
                        <Eye className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Configuration Modal */}
      {showConfigModal && selectedDevice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-semibold">Configure Assessment - {selectedDevice.name}</h2>
                <p className="text-gray-600">Customize assessment questions for this device model</p>
              </div>
              <button
                onClick={() => setShowConfigModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            <div className="space-y-6">
              {/* Question Groups */}
              <div>
                <h3 className="text-lg font-medium mb-4">Available Question Groups</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {questionGroups.map((group) => (
                    <div key={group.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{group.name}</h4>
                        <input
                          type="checkbox"
                          defaultChecked={true}
                          className="rounded"
                        />
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{group.description}</p>
                      <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                        {group.category}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Individual Questions */}
              <div>
                <h3 className="text-lg font-medium mb-4">Assessment Questions</h3>
                {assessmentConfig.questions && assessmentConfig.questions.length > 0 ? (
                  <div className="space-y-3">
                    {assessmentConfig.questions.map((question, index) => (
                      <div key={question.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <input
                                type="checkbox"
                                checked={question.enabled}
                                onChange={(e) => {
                                  const updated = assessmentConfig.questions.map(q => 
                                    q.id === question.id ? { ...q, enabled: e.target.checked } : q
                                  );
                                  setAssessmentConfig({ ...assessmentConfig, questions: updated });
                                }}
                                className="rounded"
                              />
                              <h4 className="font-medium">{question.text}</h4>
                            </div>
                            <div className="grid grid-cols-2 gap-2 mt-2">
                              {question.answers.slice(0, 4).map((answer, i) => (
                                <div key={i} className="text-xs bg-gray-50 p-2 rounded">
                                  <span>{answer.text}</span>
                                  <span className="float-right font-medium">
                                    {answer.percentage_impact || 0}%
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                          <button className="ml-4 p-2 text-gray-600 hover:text-gray-800">
                            <Edit className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No questions configured for this device model</p>
                    <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                      Add Questions
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-6 border-t mt-6">
              <button
                onClick={() => setShowConfigModal(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                Save Configuration
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAssessmentConfig;