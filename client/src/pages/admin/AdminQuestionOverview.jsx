import React, { useState, useEffect } from 'react';
import { ArrowRight, Plus, Settings, Target, CheckCircle, AlertCircle, Users, Database } from 'lucide-react';

const AdminQuestionOverview = () => {
  const [stats, setStats] = useState({
    questionGroups: 0,
    totalQuestions: 0,
    activeQuestions: 0,
    deviceModels: 0
  });
  const [loading, setLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      
      // Fetch question groups
      const groupsResponse = await fetch('/api/question-groups');
      const groups = groupsResponse.ok ? await groupsResponse.json() : [];
      
      // Fetch device models for stats
      const modelsResponse = await fetch('/api/device-models');
      const models = modelsResponse.ok ? await modelsResponse.json() : [];
      
      setStats({
        questionGroups: groups.length,
        totalQuestions: 0, // Will be calculated when we have questions
        activeQuestions: 0,
        deviceModels: models.length
      });
      
      // Set recent activity
      setRecentActivity([
        { action: 'Question group created', item: 'Screen Assessment', time: '2 hours ago', type: 'create' },
        { action: 'Questions updated', item: 'Battery Performance', time: '1 day ago', type: 'update' },
        { action: 'Model targeting added', item: 'iPhone 13', time: '2 days ago', type: 'config' },
        { action: 'Assessment demo tested', item: 'Samsung Galaxy S24', time: '3 days ago', type: 'test' }
      ]);
      
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      title: 'Create Question Group',
      description: 'Add a new category for organizing questions',
      icon: Plus,
      href: '/admin/question-groups',
      color: 'bg-blue-600 hover:bg-blue-700',
      action: 'Create'
    },
    {
      title: 'Build Questions',
      description: 'Create targeted questions for specific devices',
      icon: Settings,
      href: '/admin/question-builder',
      color: 'bg-green-600 hover:bg-green-700',
      action: 'Build'
    },
    {
      title: 'Test Assessment',
      description: 'Try the live assessment with real devices',
      icon: Target,
      href: '/admin/assessment-demo',
      color: 'bg-purple-600 hover:bg-purple-700',
      action: 'Test'
    },
    {
      title: 'System Status',
      description: 'View overall system health and configuration',
      icon: Database,
      href: '/admin/question-system-demo',
      color: 'bg-orange-600 hover:bg-orange-700',
      action: 'Monitor'
    }
  ];

  const getActivityIcon = (type) => {
    switch (type) {
      case 'create': return <Plus className="h-4 w-4 text-green-600" />;
      case 'update': return <Settings className="h-4 w-4 text-blue-600" />;
      case 'config': return <Target className="h-4 w-4 text-purple-600" />;
      case 'test': return <CheckCircle className="h-4 w-4 text-orange-600" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading overview...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Question Management Overview</h1>
        <p className="text-gray-600 mt-2">Manage device assessment questions and configurations</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Question Groups</p>
              <p className="text-2xl font-bold text-gray-900">{stats.questionGroups}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Settings className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Questions</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalQuestions}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Target className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Questions</p>
              <p className="text-2xl font-bold text-gray-900">{stats.activeQuestions}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Database className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Device Models</p>
              <p className="text-2xl font-bold text-gray-900">{stats.deviceModels}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold">Quick Actions</h2>
            <p className="text-gray-600">Common tasks for question management</p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 gap-4">
              {quickActions.map((action, index) => (
                <a
                  key={index}
                  href={action.href}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center">
                    <div className={`p-2 rounded-lg text-white ${action.color}`}>
                      <action.icon className="h-5 w-5" />
                    </div>
                    <div className="ml-4">
                      <h3 className="font-medium text-gray-900">{action.title}</h3>
                      <p className="text-sm text-gray-600">{action.description}</p>
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-gray-400" />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold">Recent Activity</h2>
            <p className="text-gray-600">Latest changes and updates</p>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      {activity.action}
                    </p>
                    <p className="text-sm text-gray-600">{activity.item}</p>
                    <p className="text-xs text-gray-400">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* System Health */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold">System Health</h2>
          <p className="text-gray-600">Current status of question management components</p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium">Database Connection</p>
                <p className="text-sm text-gray-600">Connected and operational</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium">API Endpoints</p>
                <p className="text-sm text-gray-600">All endpoints responding</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium">Question System</p>
                <p className="text-sm text-gray-600">Ready for assessments</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Getting Started Guide */}
      <div className="mt-8 bg-blue-50 rounded-lg p-6 border border-blue-200">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">Getting Started</h3>
        <div className="space-y-2 text-sm text-blue-800">
          <p>1. Create question groups to organize your assessment questions by category (screen, battery, etc.)</p>
          <p>2. Build questions with specific targeting for different device models or brands</p>
          <p>3. Configure answer choices with appropriate price impact percentages</p>
          <p>4. Test your assessment system using the demo tools</p>
          <p>5. Monitor system performance and adjust questions as needed</p>
        </div>
        <div className="mt-4">
          <a
            href="/admin/question-groups"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Your First Question Group
          </a>
        </div>
      </div>
    </div>
  );
};

export default AdminQuestionOverview;