import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate } from 'react-router-dom';
import { Settings, HelpCircle, FileText } from 'lucide-react';

const AdminCQS: React.FC = () => {
  const navigate = useNavigate();

  const navigateToConditionQuestions = () => {
    navigate('/admin/condition-questions');
  };

  const navigateToPricing = () => {
    navigate('/admin/valuations');
  };

  const navigateToDiagnostic = () => {
    navigate('/admin/diagnostic');
  };

  return (
    <div className="py-8 px-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Condition Questions & Settings</h1>
        <p className="text-gray-500 mt-1">
          Manage device assessment questions, pricing, and diagnostic tools
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="help">Help & Guidelines</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-lg font-bold">Condition Questions</CardTitle>
                <HelpCircle className="h-5 w-5 text-gray-400" />
              </CardHeader>
              <CardContent>
                <CardDescription className="mb-4">
                  Create and manage the assessment questions used to determine device condition.
                </CardDescription>
                <div className="h-32 flex items-center justify-center bg-gray-50 rounded-md mb-4">
                  <FileText className="h-12 w-12 text-gray-300" />
                </div>
                <Button className="w-full" onClick={navigateToConditionQuestions}>
                  Manage Questions
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-lg font-bold">Pricing Rules</CardTitle>
                <HelpCircle className="h-5 w-5 text-gray-400" />
              </CardHeader>
              <CardContent>
                <CardDescription className="mb-4">
                  Configure pricing rules and condition-based valuations for device models.
                </CardDescription>
                <div className="h-32 flex items-center justify-center bg-gray-50 rounded-md mb-4">
                  <Settings className="h-12 w-12 text-gray-300" />
                </div>
                <Button className="w-full" onClick={navigateToPricing}>
                  Manage Pricing
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-lg font-bold">Diagnostic Tools</CardTitle>
                <HelpCircle className="h-5 w-5 text-gray-400" />
              </CardHeader>
              <CardContent>
                <CardDescription className="mb-4">
                  Configure device diagnostic tests and verification procedures.
                </CardDescription>
                <div className="h-32 flex items-center justify-center bg-gray-50 rounded-md mb-4">
                  <Settings className="h-12 w-12 text-gray-300" />
                </div>
                <Button className="w-full" onClick={navigateToDiagnostic}>
                  Manage Diagnostics
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Assessment Flow Configuration</CardTitle>
              <CardDescription>
                Configure the order and logic of the device assessment process
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="border rounded-md p-4">
                  <h3 className="font-medium mb-2">Current Assessment Flow</h3>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <div className="bg-blue-50 text-blue-700 rounded-md px-3 py-2 text-sm font-medium">
                      <span className="text-blue-400 font-bold mr-1">1.</span> Device Type Selection
                    </div>
                    <div className="bg-blue-50 text-blue-700 rounded-md px-3 py-2 text-sm font-medium">
                      <span className="text-blue-400 font-bold mr-1">2.</span> Brand Selection
                    </div>
                    <div className="bg-blue-50 text-blue-700 rounded-md px-3 py-2 text-sm font-medium">
                      <span className="text-blue-400 font-bold mr-1">3.</span> Model Selection
                    </div>
                    <div className="bg-blue-50 text-blue-700 rounded-md px-3 py-2 text-sm font-medium">
                      <span className="text-blue-400 font-bold mr-1">4.</span> Condition Questions
                    </div>
                    <div className="bg-blue-50 text-blue-700 rounded-md px-3 py-2 text-sm font-medium">
                      <span className="text-blue-400 font-bold mr-1">5.</span> Valuation
                    </div>
                    <div className="bg-blue-50 text-blue-700 rounded-md px-3 py-2 text-sm font-medium">
                      <span className="text-blue-400 font-bold mr-1">6.</span> Checkout
                    </div>
                  </div>
                  <Button variant="outline">
                    Customize Flow
                  </Button>
                </div>

                <div className="border rounded-md p-4">
                  <h3 className="font-medium mb-2">Assessment Rules</h3>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span>Minimum condition percentage for buyback</span>
                      <span className="font-medium">20%</span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span>Maximum valuation adjustment</span>
                      <span className="font-medium">±30%</span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span>Question failure threshold</span>
                      <span className="font-medium">2 critical failures</span>
                    </div>
                  </div>
                  <Button variant="outline">
                    Edit Rules
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="help">
          <Card>
            <CardHeader>
              <CardTitle>Help & Guidelines</CardTitle>
              <CardDescription>
                How to configure and manage the assessment system
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-medium">Setting Up Condition Questions</h3>
                <p className="text-gray-600 text-sm">
                  Condition questions should be organized by device type and focus on the key aspects that affect 
                  device value. Create clear, concise questions that can be easily understood by users. Each question 
                  should have 2-5 possible answers with corresponding condition impact values.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="font-medium">Configuring Pricing Rules</h3>
                <p className="text-gray-600 text-sm">
                  Start by setting the base price for a device model in excellent condition, then define 
                  percentage adjustments for different condition levels (excellent, good, fair, poor). 
                  For models with variants (storage, color, etc.), create multipliers to adjust pricing.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="font-medium">Diagnostic Tools</h3>
                <p className="text-gray-600 text-sm">
                  Diagnostic tools help verify user answers and device functionality. Configure which tests 
                  are required for each device type and set up automatic condition adjustments based on 
                  diagnostic results.
                </p>
              </div>

              <div className="border-t pt-4 mt-4">
                <h3 className="font-medium mb-2">Best Practices</h3>
                <ul className="list-disc pl-5 space-y-1 text-gray-600 text-sm">
                  <li>Keep questions simple and focused on one aspect of the device</li>
                  <li>Use images and examples where possible to clarify questions</li>
                  <li>Review and update pricing regularly based on market conditions</li>
                  <li>Test the assessment flow as a user to ensure a smooth experience</li>
                  <li>Adjust pricing multipliers seasonally for high-demand periods</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminCQS;