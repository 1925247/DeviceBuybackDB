import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import { 
  Search, 
  Settings, 
  Plus, 
  Trash2, 
  Eye,
  BarChart3,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Smartphone,
  Laptop,
  Monitor
} from "lucide-react";

interface DeviceModel {
  id: number;
  name: string;
  brand_name: string;
  device_type_name: string;
  slug: string;
  image: string;
}

interface Question {
  questionId: number;
  questionText: string;
  questionType: string;
  required: boolean;
  tooltip?: string;
  groupName?: string;
  groupStatement?: string;
  answers: Array<{
    id: number;
    answerText: string;
    weightage: number;
    repairCost: number;
    icon?: string;
  }>;
}

interface DeviceModelQuestions {
  modelId: number;
  modelInfo: {
    name: string;
    brand: string;
    deviceType: string;
  };
  questions: Question[];
}

interface MappingStats {
  totalModels: number;
  modelsWithQuestions: number;
  totalQuestions: number;
  averageQuestionsPerModel: number;
  popularQuestions: Array<{
    questionId: number;
    questionText: string;
    mappingCount: number;
  }>;
}

export default function DeviceModelQuestions() {
  const [selectedModelId, setSelectedModelId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [deviceTypeFilter, setDeviceTypeFilter] = useState<string>("all");
  const [selectedQuestions, setSelectedQuestions] = useState<number[]>([]);
  
  const queryClient = useQueryClient();

  // Fetch device models
  const { data: deviceModels = [], isLoading: modelsLoading } = useQuery<DeviceModel[]>({
    queryKey: ["/api/device-models"],
  });

  // Fetch available questions
  const { data: availableQuestions = [], isLoading: questionsLoading } = useQuery<Question[]>({
    queryKey: ["/api/questions/available"],
  });

  // Fetch mapping statistics
  const { data: mappingStats, isLoading: statsLoading } = useQuery<MappingStats>({
    queryKey: ["/api/question-mappings/stats"],
  });

  // Fetch questions for selected model
  const { data: modelQuestions, isLoading: modelQuestionsLoading } = useQuery<DeviceModelQuestions>({
    queryKey: ["/api/device-models", selectedModelId, "questions"],
    enabled: !!selectedModelId,
  });

  // Map questions mutation
  const mapQuestionsMutation = useMutation({
    mutationFn: async ({ modelId, questionIds }: { modelId: number; questionIds: number[] }) => {
      const response = await fetch(`/api/device-models/${modelId}/questions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionIds }),
      });
      if (!response.ok) throw new Error("Failed to map questions");
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Questions mapped successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/device-models", selectedModelId, "questions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/question-mappings/stats"] });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to map questions", variant: "destructive" });
    },
  });

  // Filter device models
  const filteredModels = deviceModels.filter(model => {
    const matchesSearch = model.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         model.brand_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = deviceTypeFilter === "all" || model.device_type_name === deviceTypeFilter;
    return matchesSearch && matchesType;
  });

  // Get unique device types
  const deviceTypes = Array.from(new Set(deviceModels.map(m => m.device_type_name)));

  // Handle question selection
  const handleQuestionToggle = (questionId: number) => {
    setSelectedQuestions(prev => 
      prev.includes(questionId) 
        ? prev.filter(id => id !== questionId)
        : [...prev, questionId]
    );
  };

  // Apply question mappings
  const handleApplyMappings = () => {
    if (!selectedModelId) return;
    mapQuestionsMutation.mutate({
      modelId: selectedModelId,
      questionIds: selectedQuestions
    });
  };

  // Load existing mappings when model is selected
  useEffect(() => {
    if (modelQuestions) {
      setSelectedQuestions(modelQuestions.questions.map(q => q.questionId));
    }
  }, [modelQuestions]);

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType.toLowerCase()) {
      case 'smartphone': return <Smartphone className="h-4 w-4" />;
      case 'laptop': return <Laptop className="h-4 w-4" />;
      case 'tablet': return <Monitor className="h-4 w-4" />;
      default: return <Monitor className="h-4 w-4" />;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Device Model Questions</h1>
          <p className="text-muted-foreground">
            Configure assessment questions for each device model
          </p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-sm font-medium">Total Models</p>
                <p className="text-2xl font-bold">{mappingStats?.totalModels || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-sm font-medium">Configured Models</p>
                <p className="text-2xl font-bold">{mappingStats?.modelsWithQuestions || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Settings className="h-4 w-4 text-orange-500" />
              <div>
                <p className="text-sm font-medium">Total Questions</p>
                <p className="text-2xl font-bold">{mappingStats?.totalQuestions || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4 text-purple-500" />
              <div>
                <p className="text-sm font-medium">Avg Questions/Model</p>
                <p className="text-2xl font-bold">{mappingStats?.averageQuestionsPerModel || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="mapping" className="space-y-4">
        <TabsList>
          <TabsTrigger value="mapping">Question Mapping</TabsTrigger>
          <TabsTrigger value="stats">Statistics</TabsTrigger>
        </TabsList>

        <TabsContent value="mapping" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Device Models Panel */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Smartphone className="h-5 w-5" />
                  Device Models
                </CardTitle>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search models..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                  <Select value={deviceTypeFilter} onValueChange={setDeviceTypeFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      {deviceTypes.map(type => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {modelsLoading ? (
                    <div className="text-center py-4">Loading models...</div>
                  ) : filteredModels.length === 0 ? (
                    <div className="text-center py-4 text-muted-foreground">
                      No models found
                    </div>
                  ) : (
                    filteredModels.map((model) => (
                      <div
                        key={model.id}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          selectedModelId === model.id
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                        onClick={() => setSelectedModelId(model.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {getDeviceIcon(model.device_type_name)}
                            <div>
                              <h4 className="font-medium">{model.name}</h4>
                              <p className="text-sm text-muted-foreground">
                                {model.brand_name} • {model.device_type_name}
                              </p>
                            </div>
                          </div>
                          <Badge variant="outline">
                            {modelQuestions?.questions.length || 0} questions
                          </Badge>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Questions Panel */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Available Questions
                  {selectedModelId && (
                    <Badge variant="outline">
                      {selectedQuestions.length} selected
                    </Badge>
                  )}
                </CardTitle>
                {selectedModelId && (
                  <Button 
                    onClick={handleApplyMappings}
                    disabled={mapQuestionsMutation.isPending}
                    className="w-full"
                  >
                    {mapQuestionsMutation.isPending ? "Saving..." : "Apply Mappings"}
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                {!selectedModelId ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                    Select a device model to configure questions
                  </div>
                ) : questionsLoading ? (
                  <div className="text-center py-4">Loading questions...</div>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {availableQuestions.map((question) => (
                      <div key={question.questionId} className="border rounded-lg p-3">
                        <div className="flex items-start gap-3">
                          <Checkbox
                            checked={selectedQuestions.includes(question.questionId)}
                            onCheckedChange={() => handleQuestionToggle(question.questionId)}
                            className="mt-1"
                          />
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className="font-medium text-sm">{question.questionText}</h4>
                              <div className="flex gap-1">
                                {question.required && (
                                  <Badge variant="destructive" className="text-xs">Required</Badge>
                                )}
                                <Badge variant="outline" className="text-xs">
                                  {question.questionType}
                                </Badge>
                              </div>
                            </div>
                            {question.groupName && (
                              <p className="text-xs text-muted-foreground mb-2">
                                Group: {question.groupName}
                              </p>
                            )}
                            {question.answers.length > 0 && (
                              <div className="text-xs text-muted-foreground">
                                {question.answers.length} answer{question.answers.length !== 1 ? 's' : ''}:
                                <span className="ml-1">
                                  {question.answers.slice(0, 2).map(a => a.answerText).join(", ")}
                                  {question.answers.length > 2 && ` +${question.answers.length - 2} more`}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Selected Model Questions Preview */}
          {selectedModelId && modelQuestions && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Current Questions for {modelQuestions.modelInfo.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {modelQuestions.questions.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground">
                    No questions mapped to this device model
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {modelQuestions.questions.map((question, index) => (
                      <div key={question.questionId} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium">
                            {index + 1}. {question.questionText}
                          </h4>
                          <div className="flex gap-1">
                            {question.required && (
                              <Badge variant="destructive" className="text-xs">Required</Badge>
                            )}
                            <Badge variant="outline" className="text-xs">
                              {question.questionType}
                            </Badge>
                          </div>
                        </div>
                        {question.tooltip && (
                          <p className="text-sm text-muted-foreground mb-2">{question.tooltip}</p>
                        )}
                        {question.answers.length > 0 && (
                          <div className="grid grid-cols-2 gap-2">
                            {question.answers.map((answer) => (
                              <div key={answer.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                <span className="text-sm">{answer.answerText}</span>
                                {(answer.weightage !== 0 || answer.repairCost !== 0) && (
                                  <div className="text-xs text-muted-foreground">
                                    {answer.weightage !== 0 && `${answer.weightage > 0 ? '+' : ''}${answer.weightage}%`}
                                    {answer.repairCost !== 0 && ` $${answer.repairCost}`}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="stats" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Popular Questions</CardTitle>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <div className="text-center py-4">Loading statistics...</div>
              ) : mappingStats?.popularQuestions.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  No question mappings found
                </div>
              ) : (
                <div className="space-y-2">
                  {mappingStats?.popularQuestions.map((question, index) => (
                    <div key={question.questionId} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline">#{index + 1}</Badge>
                        <span className="font-medium">{question.questionText}</span>
                      </div>
                      <Badge>
                        {question.mappingCount} model{question.mappingCount !== 1 ? 's' : ''}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}