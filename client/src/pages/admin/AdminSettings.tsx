import React, { useState } from 'react';
import { Save } from 'lucide-react';

// Default settings for each section
const defaultGeneralSettings = {
  siteName: 'Cash Old Device',
  siteDescription: 'Sell your old devices for the best price',
  contactEmail: 'support@cashold.com',
  contactPhone: '+1 (555) 123-4567',
  address: '123 Tech Street, Digital City, 10001',
};

const defaultPaymentSettings = {
  enableBankTransfer: true,
  enableUPI: true,
  enableDigitalWallet: true,
  processingFee: '0',
  paymentLogo: '',
};

const defaultNotificationSettings = {
  emailNotifications: true,
  smsNotifications: true,
  orderUpdates: true,
  marketingEmails: false,
};

// Updated default security settings with an advanced option
const defaultSecuritySettings = {
  twoFactorAuth: false,
  passwordMinLength: 8,
  passwordRequireSpecial: true,
  googleAuthenticator: false, // New advanced option for Google Authenticator
};

const defaultAppearanceSettings = {
  theme: 'light',
  primaryColor: '#3b82f6',
};

const defaultIntegrationSettings = {
  slackWebhook: '',
  discordWebhook: '',
};

const defaultSeoMarketingSettings = {
  siteLogo: '',
  metaTitle: '',
  metaDescription: '',
  metaKeywords: '',
  footerText: '',
  facebookUrl: '',
  twitterUrl: '',
  linkedInUrl: '',
  googleAnalyticsCode: '',
};

const defaultAdminUsers = [
  { id: 1, name: 'Alice', email: 'alice@example.com', role: 'superadmin' },
  { id: 2, name: 'Bob', email: 'bob@example.com', role: 'admin' },
];

// New default roles including a file access property
const defaultRoles = [
  {
    id: 1,
    name: 'Admin',
    description: 'Full access to admin panel and file management',
    active: true,
    accessFile: true,
  },
  {
    id: 2,
    name: 'Super Admin',
    description: 'Super admin access including advanced file settings',
    active: true,
    accessFile: true,
  },
  {
    id: 3,
    name: 'Editor',
    description: 'Can edit content but no file management',
    active: true,
    accessFile: false,
  },
  {
    id: 4,
    name: 'Viewer',
    description: 'Read only access, no file management',
    active: false,
    accessFile: false,
  },
];

const AdminSettings = () => {
  // Add new tab "Roles & Permissions" along with existing tabs
  const tabs = [
    'General',
    'Payment',
    'Notifications',
    'Security',
    'Appearance',
    'Integrations',
    'SEO & Marketing',
    'Admin Users',
    'Roles & Permissions',
  ];
  const [activeTab, setActiveTab] = useState('General');

  // State for each settings section
  const [generalSettings, setGeneralSettings] = useState(defaultGeneralSettings);
  const [paymentSettings, setPaymentSettings] = useState(defaultPaymentSettings);
  const [notificationSettings, setNotificationSettings] = useState(defaultNotificationSettings);
  const [securitySettings, setSecuritySettings] = useState(defaultSecuritySettings);
  const [appearanceSettings, setAppearanceSettings] = useState(defaultAppearanceSettings);
  const [integrationSettings, setIntegrationSettings] = useState(defaultIntegrationSettings);
  const [seoMarketingSettings, setSeoMarketingSettings] = useState(defaultSeoMarketingSettings);
  const [adminUsers, setAdminUsers] = useState(defaultAdminUsers);
  
  // New state for Roles & Permissions
  const [roles, setRoles] = useState(defaultRoles);
  const [newRole, setNewRole] = useState({ name: '', description: '', active: true, accessFile: false });
  
  // Modal and error state
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  // Handlers for changes in each section
  const handleGeneralChange = (e) => {
    const { name, value } = e.target;
    setGeneralSettings((prev) => ({ ...prev, [name]: value }));
  };

  const handlePaymentChange = (e) => {
    const { name, value, type, checked } = e.target;
    setPaymentSettings((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleNotificationChange = (e) => {
    const { name, checked } = e.target;
    setNotificationSettings((prev) => ({ ...prev, [name]: checked }));
  };

  const handleSecurityChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSecuritySettings((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleAppearanceChange = (e) => {
    const { name, value } = e.target;
    setAppearanceSettings((prev) => ({ ...prev, [name]: value }));
  };

  const handleIntegrationChange = (e) => {
    const { name, value } = e.target;
    setIntegrationSettings((prev) => ({ ...prev, [name]: value }));
  };

  const handleSeoMarketingChange = (e) => {
    const { name, value } = e.target;
    setSeoMarketingSettings((prev) => ({ ...prev, [name]: value }));
  };

  // New handler for role changes (for new role form)
  const handleNewRoleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewRole((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const addRole = () => {
    if (newRole.name.trim() && newRole.description.trim()) {
      const roleToAdd = { id: roles.length + 1, ...newRole };
      setRoles((prev) => [...prev, roleToAdd]);
      setNewRole({ name: '', description: '', active: true, accessFile: false });
    } else {
      alert('Please provide both role name and description.');
    }
  };

  // Reset all settings to defaults including roles
  const resetToDefaults = () => {
    if (window.confirm('Are you sure you want to reset to default settings?')) {
      setGeneralSettings(defaultGeneralSettings);
      setPaymentSettings(defaultPaymentSettings);
      setNotificationSettings(defaultNotificationSettings);
      setSecuritySettings(defaultSecuritySettings);
      setAppearanceSettings(defaultAppearanceSettings);
      setIntegrationSettings(defaultIntegrationSettings);
      setSeoMarketingSettings(defaultSeoMarketingSettings);
      setAdminUsers(defaultAdminUsers);
      setRoles(defaultRoles);
    }
  };

  // Validate required fields before saving
  const handleSaveClick = () => {
    const errors = {};
    if (!generalSettings.siteName.trim()) errors.siteName = 'Site Name is required.';
    if (!generalSettings.contactEmail.trim()) errors.contactEmail = 'Contact Email is required.';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    setFormErrors({});
    setShowConfirmationModal(true);
  };

  const confirmSave = () => {
    setShowConfirmationModal(false);
    // Save logic here (e.g., API calls)
    alert('Settings saved successfully!');
  };

  // Render tab content based on the active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case 'General':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
              <div>
                <label htmlFor="siteName" className="block text-sm font-medium text-gray-700">
                  Site Name
                </label>
                <input
                  type="text"
                  name="siteName"
                  id="siteName"
                  value={generalSettings.siteName}
                  onChange={handleGeneralChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm sm:text-sm"
                />
                {formErrors.siteName && (
                  <p className="mt-1 text-xs text-red-600">{formErrors.siteName}</p>
                )}
              </div>
              <div>
                <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700">
                  Contact Email
                </label>
                <input
                  type="email"
                  name="contactEmail"
                  id="contactEmail"
                  value={generalSettings.contactEmail}
                  onChange={handleGeneralChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm sm:text-sm"
                />
                {formErrors.contactEmail && (
                  <p className="mt-1 text-xs text-red-600">{formErrors.contactEmail}</p>
                )}
              </div>
              <div>
                <label htmlFor="contactPhone" className="block text-sm font-medium text-gray-700">
                  Contact Phone
                </label>
                <input
                  type="text"
                  name="contactPhone"
                  id="contactPhone"
                  value={generalSettings.contactPhone}
                  onChange={handleGeneralChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm sm:text-sm"
                />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="siteDescription" className="block text-sm font-medium text-gray-700">
                  Site Description
                </label>
                <textarea
                  id="siteDescription"
                  name="siteDescription"
                  rows={3}
                  value={generalSettings.siteDescription}
                  onChange={handleGeneralChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm sm:text-sm"
                ></textarea>
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                  Address
                </label>
                <input
                  type="text"
                  name="address"
                  id="address"
                  value={generalSettings.address}
                  onChange={handleGeneralChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm sm:text-sm"
                />
              </div>
            </div>
          </div>
        );
      case 'Payment':
        return (
          <div className="space-y-6">
            <div className="flex items-center space-x-6">
              <div className="flex items-center">
                <input
                  id="enableBankTransfer"
                  name="enableBankTransfer"
                  type="checkbox"
                  checked={paymentSettings.enableBankTransfer}
                  onChange={handlePaymentChange}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                />
                <label htmlFor="enableBankTransfer" className="ml-2 text-sm text-gray-700 flex items-center">
                  <img
                    src="https://www.svgrepo.com/show/438323/bank-account.svg"
                    alt="Bank Transfer"
                    className="h-5 w-5 mr-1"
                  />
                  Bank Transfer
                </label>
              </div>
              <div className="flex items-center">
                <input
                  id="enableUPI"
                  name="enableUPI"
                  type="checkbox"
                  checked={paymentSettings.enableUPI}
                  onChange={handlePaymentChange}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                />
                <label htmlFor="enableUPI" className="ml-2 text-sm text-gray-700 flex items-center">
                  <img
                    src="https://cdn.iconscout.com/icon/free/png-512/free-upi-logo-icon-download-in-svg-png-gif-file-formats--unified-payments-interface-payment-money-transfer-logos-icons-1747946.png?f=webp&w=512"
                    alt="UPI"
                    className="h-8 w-8 mr-1"
                  />
                  UPI
                </label>
              </div>
              <div className="flex items-center">
                <input
                  id="enableDigitalWallet"
                  name="enableDigitalWallet"
                  type="checkbox"
                  checked={paymentSettings.enableDigitalWallet}
                  onChange={handlePaymentChange}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                />
                <label htmlFor="enableDigitalWallet" className="ml-2 text-sm text-gray-700 flex items-center">
                  <img
                    src="https://www.svgrepo.com/show/30601/wallet.svg"
                    alt="Digital Wallet"
                    className="h-5 w-5 mr-1"
                  />
                  Digital Wallet
                </label>
              </div>
            </div>
            <div>
              <label htmlFor="processingFee" className="block text-sm font-medium text-gray-700">
                Processing Fee (%)
              </label>
              <input
                type="number"
                name="processingFee"
                id="processingFee"
                min="0"
                step="0.1"
                value={paymentSettings.processingFee}
                onChange={handlePaymentChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="paymentLogo" className="block text-sm font-medium text-gray-700">
                Payment Logo URL
              </label>
              <input
                type="text"
                name="paymentLogo"
                id="paymentLogo"
                value={paymentSettings.paymentLogo}
                onChange={handlePaymentChange}
                placeholder="Enter payment logo URL"
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm sm:text-sm"
              />
            </div>
          </div>
        );
      case 'Notifications':
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  id="emailNotifications"
                  name="emailNotifications"
                  type="checkbox"
                  checked={notificationSettings.emailNotifications}
                  onChange={handleNotificationChange}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                />
                <label htmlFor="emailNotifications" className="ml-2 text-sm text-gray-700">
                  Email Notifications
                </label>
              </div>
              <div className="flex items-center">
                <input
                  id="smsNotifications"
                  name="smsNotifications"
                  type="checkbox"
                  checked={notificationSettings.smsNotifications}
                  onChange={handleNotificationChange}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                />
                <label htmlFor="smsNotifications" className="ml-2 text-sm text-gray-700">
                  SMS Notifications
                </label>
              </div>
              <div className="flex items-center">
                <input
                  id="orderUpdates"
                  name="orderUpdates"
                  type="checkbox"
                  checked={notificationSettings.orderUpdates}
                  onChange={handleNotificationChange}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                />
                <label htmlFor="orderUpdates" className="ml-2 text-sm text-gray-700">
                  Order Status Updates
                </label>
              </div>
              <div className="flex items-center">
                <input
                  id="marketingEmails"
                  name="marketingEmails"
                  type="checkbox"
                  checked={notificationSettings.marketingEmails}
                  onChange={handleNotificationChange}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                />
                <label htmlFor="marketingEmails" className="ml-2 text-sm text-gray-700">
                  Marketing Emails
                </label>
              </div>
            </div>
          </div>
        );
      case 'Security':
        return (
          <div className="space-y-6">
            <div className="flex items-center">
              <input
                id="twoFactorAuth"
                name="twoFactorAuth"
                type="checkbox"
                checked={securitySettings.twoFactorAuth}
                onChange={handleSecurityChange}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded"
              />
              <label htmlFor="twoFactorAuth" className="ml-2 text-sm text-gray-700">
                Enable Two-Factor Authentication
              </label>
            </div>
            <div className="sm:w-1/3">
              <label htmlFor="passwordMinLength" className="block text-sm font-medium text-gray-700">
                Minimum Password Length
              </label>
              <input
                type="number"
                name="passwordMinLength"
                id="passwordMinLength"
                value={securitySettings.passwordMinLength}
                onChange={handleSecurityChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm sm:text-sm"
              />
            </div>
            <div className="flex items-center">
              <input
                id="passwordRequireSpecial"
                name="passwordRequireSpecial"
                type="checkbox"
                checked={securitySettings.passwordRequireSpecial}
                onChange={handleSecurityChange}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded"
              />
              <label htmlFor="passwordRequireSpecial" className="ml-2 text-sm text-gray-700">
                Require Special Characters
              </label>
            </div>
            <div className="flex items-center">
              <input
                id="googleAuthenticator"
                name="googleAuthenticator"
                type="checkbox"
                checked={securitySettings.googleAuthenticator}
                onChange={handleSecurityChange}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded"
              />
              <label htmlFor="googleAuthenticator" className="ml-2 text-sm text-gray-700">
                Enable Google Authenticator (Advanced)
              </label>
            </div>
          </div>
        );
      case 'Appearance':
        return (
          <div className="space-y-6">
            <div className="sm:w-1/3">
              <label htmlFor="theme" className="block text-sm font-medium text-gray-700">
                Theme
              </label>
              <select
                name="theme"
                id="theme"
                value={appearanceSettings.theme}
                onChange={handleAppearanceChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </div>
            <div className="sm:w-1/3">
              <label htmlFor="primaryColor" className="block text-sm font-medium text-gray-700">
                Primary Color
              </label>
              <input
                type="color"
                name="primaryColor"
                id="primaryColor"
                value={appearanceSettings.primaryColor}
                onChange={handleAppearanceChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
              />
            </div>
          </div>
        );
      case 'Integrations':
        return (
          <div className="space-y-6">
            <div>
              <label htmlFor="slackWebhook" className="block text-sm font-medium text-gray-700">
                Slack Webhook URL
              </label>
              <input
                type="text"
                name="slackWebhook"
                id="slackWebhook"
                value={integrationSettings.slackWebhook}
                onChange={handleIntegrationChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
              />
            </div>
            <div>
              <label htmlFor="discordWebhook" className="block text-sm font-medium text-gray-700">
                Discord Webhook URL
              </label>
              <input
                type="text"
                name="discordWebhook"
                id="discordWebhook"
                value={integrationSettings.discordWebhook}
                onChange={handleIntegrationChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
              />
            </div>
          </div>
        );
      case 'SEO & Marketing':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
              <div>
                <label htmlFor="siteLogo" className="block text-sm font-medium text-gray-700">
                  Site Logo URL
                </label>
                <input
                  type="text"
                  name="siteLogo"
                  id="siteLogo"
                  value={seoMarketingSettings.siteLogo}
                  onChange={handleSeoMarketingChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="metaTitle" className="block text-sm font-medium text-gray-700">
                  Meta Title
                </label>
                <input
                  type="text"
                  name="metaTitle"
                  id="metaTitle"
                  value={seoMarketingSettings.metaTitle}
                  onChange={handleSeoMarketingChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm sm:text-sm"
                />
              </div>
            </div>
            <div>
              <label htmlFor="metaDescription" className="block text-sm font-medium text-gray-700">
                Meta Description
              </label>
              <textarea
                name="metaDescription"
                id="metaDescription"
                rows="3"
                value={seoMarketingSettings.metaDescription}
                onChange={handleSeoMarketingChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm sm:text-sm"
              ></textarea>
            </div>
            <div>
              <label htmlFor="metaKeywords" className="block text-sm font-medium text-gray-700">
                Meta Keywords
              </label>
              <input
                type="text"
                name="metaKeywords"
                id="metaKeywords"
                value={seoMarketingSettings.metaKeywords}
                onChange={handleSeoMarketingChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="footerText" className="block text-sm font-medium text-gray-700">
                Footer Content
              </label>
              <textarea
                name="footerText"
                id="footerText"
                rows="2"
                value={seoMarketingSettings.footerText}
                onChange={handleSeoMarketingChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm sm:text-sm"
              ></textarea>
            </div>
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-3">
              <div>
                <label htmlFor="facebookUrl" className="block text-sm font-medium text-gray-700">
                  Facebook URL
                </label>
                <input
                  type="text"
                  name="facebookUrl"
                  id="facebookUrl"
                  value={seoMarketingSettings.facebookUrl}
                  onChange={handleSeoMarketingChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="twitterUrl" className="block text-sm font-medium text-gray-700">
                  Twitter URL
                </label>
                <input
                  type="text"
                  name="twitterUrl"
                  id="twitterUrl"
                  value={seoMarketingSettings.twitterUrl}
                  onChange={handleSeoMarketingChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="linkedInUrl" className="block text-sm font-medium text-gray-700">
                  LinkedIn URL
                </label>
                <input
                  type="text"
                  name="linkedInUrl"
                  id="linkedInUrl"
                  value={seoMarketingSettings.linkedInUrl}
                  onChange={handleSeoMarketingChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm sm:text-sm"
                />
              </div>
            </div>
            <div>
              <label htmlFor="googleAnalyticsCode" className="block text-sm font-medium text-gray-700">
                Google Analytics Code
              </label>
              <textarea
                name="googleAnalyticsCode"
                id="googleAnalyticsCode"
                rows="3"
                value={seoMarketingSettings.googleAnalyticsCode}
                onChange={handleSeoMarketingChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm sm:text-sm"
              ></textarea>
            </div>
          </div>
        );
      case 'Admin Users':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-md font-medium text-gray-900 mb-2">Existing Admin Users</h3>
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Name</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Email</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Role</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {adminUsers.map((user) => (
                    <tr key={user.id}>
                      <td className="px-4 py-2 text-sm text-gray-900">{user.name}</td>
                      <td className="px-4 py-2 text-sm text-gray-900">{user.email}</td>
                      <td className="px-4 py-2 text-sm text-gray-900">{user.role}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* (Admin user addition section remains unchanged) */}
          </div>
        );
      case 'Roles & Permissions':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-md font-medium text-gray-900 mb-2">Existing Roles</h3>
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Role Name</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Description</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Active</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">File Access</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {roles.map((role) => (
                    <tr key={role.id}>
                      <td className="px-4 py-2 text-sm text-gray-900">{role.name}</td>
                      <td className="px-4 py-2 text-sm text-gray-900">{role.description}</td>
                      <td className="px-4 py-2 text-sm text-gray-900">{role.active ? 'Yes' : 'No'}</td>
                      <td className="px-4 py-2 text-sm text-gray-900">{role.accessFile ? 'Yes' : 'No'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-6">
              <h3 className="text-md font-medium text-gray-900 mb-2">Add New Role</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="newRoleName" className="block text-sm font-medium text-gray-700">
                    Role Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    id="newRoleName"
                    value={newRole.name}
                    onChange={handleNewRoleChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                  />
                </div>
                <div>
                  <label htmlFor="newRoleDescription" className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <input
                    type="text"
                    name="description"
                    id="newRoleDescription"
                    value={newRole.description}
                    onChange={handleNewRoleChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="active"
                    id="newRoleActive"
                    checked={newRole.active}
                    onChange={handleNewRoleChange}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                  />
                  <label htmlFor="newRoleActive" className="ml-2 text-sm text-gray-700">
                    Active
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="accessFile"
                    id="newRoleAccessFile"
                    checked={newRole.accessFile}
                    onChange={handleNewRoleChange}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                  />
                  <label htmlFor="newRoleAccessFile" className="ml-2 text-sm text-gray-700">
                    File Access
                  </label>
                </div>
              </div>
              <div className="mt-4">
                <button
                  onClick={addRole}
                  type="button"
                  className="px-4 py-2 bg-green-600 text-white rounded-md shadow-sm hover:bg-green-700"
                >
                  Add Role
                </button>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 relative">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Admin Settings</h1>
        <p className="mt-2 text-sm text-gray-700">
          Manage your application  settings
        </p>
      </div>

      {/* Display form errors if any */}
      {Object.keys(formErrors).length > 0 && (
        <div className="mb-4 p-4 bg-red-50 text-red-700 rounded">
          {Object.entries(formErrors).map(([field, error]) => (
            <p key={field} className="text-sm">
              {error}
            </p>
          ))}
        </div>
      )}

      {/* Tab Navigation */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      <form className="space-y-8">
        {renderTabContent()}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => setShowPreviewModal(true)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Preview Settings
          </button>
          <button
            type="button"
            onClick={resetToDefaults}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
          >
            Reset to Defaults
          </button>
          <button
            type="button"
            onClick={handleSaveClick}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <Save className="h-4 w-4 mr-2" />
            Save All Settings
          </button>
        </div>
      </form>

      {/* Confirmation Modal */}
      {showConfirmationModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900">Confirm Save</h3>
            <p className="mt-2 text-sm text-gray-700">
              Are you sure you want to save all changes?
            </p>
            <div className="mt-4 flex justify-end space-x-4">
              <button
                onClick={() => setShowConfirmationModal(false)}
                className="px-4 py-2 text-sm text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={confirmSave}
                className="px-4 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreviewModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-auto">
            <h3 className="text-lg font-medium text-gray-900">Settings Preview</h3>
            <pre className="mt-4 bg-gray-100 p-4 rounded-md text-xs text-gray-800">
              {JSON.stringify(
                {
                  generalSettings,
                  paymentSettings,
                  notificationSettings,
                  securitySettings,
                  appearanceSettings,
                  integrationSettings,
                  seoMarketingSettings,
                  adminUsers,
                  roles,
                },
                null,
                2
              )}
            </pre>
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setShowPreviewModal(false)}
                className="px-4 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSettings;
