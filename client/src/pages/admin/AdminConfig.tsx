import React, { useState } from 'react';
import { Save, Settings, Bell, Shield, DollarSign, Smartphone } from 'lucide-react';

interface ConfigSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  fields: ConfigField[];
}

interface ConfigField {
  id: string;
  label: string;
  type: 'text' | 'number' | 'toggle' | 'select';
  value: string | number | boolean;
  options?: { value: string; label: string }[];
}

const AdminConfig = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [configSaved, setConfigSaved] = useState(false);

  const [config, setConfig] = useState<Record<string, ConfigSection>>({
    general: {
      id: 'general',
      title: 'General Settings',
      icon: <Settings className="h-5 w-5" />,
      fields: [
        {
          id: 'siteName',
          label: 'Site Name',
          type: 'text',
          value: 'Cash Old Device',
        },
        {
          id: 'supportEmail',
          label: 'Support Email',
          type: 'text',
          value: 'support@cashold.com',
        },
        {
          id: 'supportPhone',
          label: 'Support Phone',
          type: 'text',
          value: '+1 (555) 123-4567',
        },
        {
          id: 'maintenanceMode',
          label: 'Maintenance Mode',
          type: 'toggle',
          value: false,
        },
      ],
    },
    notifications: {
      id: 'notifications',
      title: 'Notification Settings',
      icon: <Bell className="h-5 w-5" />,
      fields: [
        {
          id: 'emailNotifications',
          label: 'Email Notifications',
          type: 'toggle',
          value: true,
        },
        {
          id: 'smsNotifications',
          label: 'SMS Notifications',
          type: 'toggle',
          value: true,
        },
        {
          id: 'pushNotifications',
          label: 'Push Notifications',
          type: 'toggle',
          value: false,
        },
        {
          id: 'notificationTemplate',
          label: 'Notification Template',
          type: 'select',
          value: 'default',
          options: [
            { value: 'default', label: 'Default Template' },
            { value: 'minimal', label: 'Minimal Template' },
            { value: 'detailed', label: 'Detailed Template' },
          ],
        },
      ],
    },
    security: {
      id: 'security',
      title: 'Security Settings',
      icon: <Shield className="h-5 w-5" />,
      fields: [
        {
          id: 'twoFactorAuth',
          label: 'Two-Factor Authentication',
          type: 'toggle',
          value: true,
        },
        {
          id: 'sessionTimeout',
          label: 'Session Timeout (minutes)',
          type: 'number',
          value: 30,
        },
        {
          id: 'maxLoginAttempts',
          label: 'Max Login Attempts',
          type: 'number',
          value: 5,
        },
        {
          id: 'passwordPolicy',
          label: 'Password Policy',
          type: 'select',
          value: 'strong',
          options: [
            { value: 'basic', label: 'Basic Requirements' },
            { value: 'medium', label: 'Medium Security' },
            { value: 'strong', label: 'Strong Security' },
          ],
        },
      ],
    },
    pricing: {
      id: 'pricing',
      title: 'Pricing Settings',
      icon: <DollarSign className="h-5 w-5" />,
      fields: [
        {
          id: 'basePriceMultiplier',
          label: 'Base Price Multiplier',
          type: 'number',
          value: 1,
        },
        {
          id: 'minPriceThreshold',
          label: 'Minimum Price Threshold',
          type: 'number',
          value: 50,
        },
        {
          id: 'maxPriceThreshold',
          label: 'Maximum Price Threshold',
          type: 'number',
          value: 2000,
        },
        {
          id: 'pricingStrategy',
          label: 'Pricing Strategy',
          type: 'select',
          value: 'dynamic',
          options: [
            { value: 'fixed', label: 'Fixed Pricing' },
            { value: 'dynamic', label: 'Dynamic Pricing' },
            { value: 'competitive', label: 'Competitive Pricing' },
          ],
        },
      ],
    },
    devices: {
      id: 'devices',
      title: 'Device Settings',
      icon: <Smartphone className="h-5 w-5" />,
      fields: [
        {
          id: 'deviceTypes',
          label: 'Enabled Device Types',
          type: 'select',
          value: 'all',
          options: [
            { value: 'all', label: 'All Devices' },
            { value: 'phones', label: 'Phones Only' },
            { value: 'tablets', label: 'Tablets Only' },
            { value: 'laptops', label: 'Laptops Only' },
          ],
        },
        {
          id: 'conditionGrading',
          label: 'Condition Grading System',
          type: 'select',
          value: 'detailed',
          options: [
            { value: 'simple', label: 'Simple (3 levels)' },
            { value: 'standard', label: 'Standard (5 levels)' },
            { value: 'detailed', label: 'Detailed (7 levels)' },
          ],
        },
        {
          id: 'autoReject',
          label: 'Auto-reject Damaged Devices',
          type: 'toggle',
          value: true,
        },
        {
          id: 'requirePhotos',
          label: 'Require Device Photos',
          type: 'toggle',
          value: true,
        },
      ],
    },
  });

  const handleFieldChange = (sectionId: string, fieldId: string, value: string | number | boolean) => {
    setConfig((prev) => ({
      ...prev,
      [sectionId]: {
        ...prev[sectionId],
        fields: prev[sectionId].fields.map((field) =>
          field.id === fieldId ? { ...field, value } : field
        ),
      },
    }));
  };

  const handleSave = () => {
    // In a real application, this would save to a backend
    console.log('Saving configuration:', config);
    setConfigSaved(true);
    setTimeout(() => setConfigSaved(false), 3000);
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="md:flex md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">System Configuration</h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage your application settings and preferences
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <button
              onClick={handleSave}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </button>
          </div>
        </div>

        {configSaved && (
          <div className="mb-8 bg-green-50 p-4 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-green-400"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-green-800">
                  Configuration saved successfully
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white shadow rounded-lg">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              {Object.values(config).map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveTab(section.id)}
                  className={`whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm ${
                    activeTab === section.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center">
                    {section.icon}
                    <span className="ml-2">{section.title}</span>
                  </div>
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 gap-6">
              {config[activeTab].fields.map((field) => (
                <div key={field.id}>
                  <label
                    htmlFor={field.id}
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    {field.label}
                  </label>
                  {field.type === 'toggle' ? (
                    <div className="flex items-center">
                      <button
                        type="button"
                        onClick={() =>
                          handleFieldChange(activeTab, field.id, !field.value)
                        }
                        className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                          field.value ? 'bg-blue-600' : 'bg-gray-200'
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200 ${
                            field.value ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                      <span className="ml-3 text-sm text-gray-500">
                        {field.value ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                  ) : field.type === 'select' ? (
                    <select
                      id={field.id}
                      value={field.value as string}
                      onChange={(e) =>
                        handleFieldChange(activeTab, field.id, e.target.value)
                      }
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                    >
                      {field.options?.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={field.type}
                      id={field.id}
                      value={field.value}
                      onChange={(e) =>
                        handleFieldChange(
                          activeTab,
                          field.id,
                          field.type === 'number'
                            ? parseFloat(e.target.value)
                            : e.target.value
                        )
                      }
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminConfig;