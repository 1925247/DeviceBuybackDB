import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { DollarSign, HelpCircle, AlertCircle, CheckCircle2 } from 'lucide-react';

interface BuybackRequest {
  id: number;
  user_id: number;
  device_type: string;
  manufacturer: string;
  model: string;
  condition: string;
  status: string;
  created_at: string;
  updated_at: string;
  partner_id: number | null;
  questionnaire_answers?: Record<string, string>;
  imei?: string;
  serial_number?: string;
  estimated_value?: string;
  offered_price?: string;
  final_price?: string;
}

interface ConditionQuestion {
  id: number;
  question: string;
  deviceTypeId: number;
  options: {
    id: number;
    text: string;
    value: string | number;
  }[];
}

const formSchema = z.object({
  imei: z.string().optional(),
  serial_number: z.string().optional(),
  condition: z.string().min(1, { message: "Condition is required" }),
  offered_price: z.string().min(1, { message: "Offered price is required" }),
  final_price: z.string().min(1, { message: "Final price is required" }),
  notes: z.string().optional(),
  questionnaire_answers: z.record(z.string(), z.string()).optional(),
});

interface ReassessDeviceFormProps {
  open: boolean;
  onClose: () => void;
  buybackRequest: BuybackRequest | null;
}

export function ReassessDeviceForm({ open, onClose, buybackRequest }: ReassessDeviceFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [conditionQuestions, setConditionQuestions] = useState<ConditionQuestion[]>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      imei: buybackRequest?.imei || '',
      serial_number: buybackRequest?.serial_number || '',
      condition: buybackRequest?.condition || '',
      offered_price: buybackRequest?.offered_price || buybackRequest?.estimated_value || '',
      final_price: buybackRequest?.final_price || buybackRequest?.offered_price || buybackRequest?.estimated_value || '',
      notes: '',
      questionnaire_answers: buybackRequest?.questionnaire_answers || {},
    },
  });

  // Reset form when buybackRequest changes
  useEffect(() => {
    if (buybackRequest) {
      form.reset({
        imei: buybackRequest.imei || '',
        serial_number: buybackRequest.serial_number || '',
        condition: buybackRequest.condition || '',
        offered_price: buybackRequest.offered_price || buybackRequest.estimated_value || '',
        final_price: buybackRequest.final_price || buybackRequest.offered_price || buybackRequest.estimated_value || '',
        notes: '',
        questionnaire_answers: buybackRequest.questionnaire_answers || {},
      });
    }
  }, [buybackRequest, form]);

  // Fetch condition questions for this device type
  useQuery({
    queryKey: ['/api/condition-questions', buybackRequest?.device_type],
    queryFn: async () => {
      if (!buybackRequest) return null;
      const response = await apiRequest('GET', '/api/condition-questions');
      const allQuestions = await response.json();
      
      // Filter questions for this device type
      const deviceTypeId = parseInt(buybackRequest.device_type);
      const relevantQuestions = allQuestions.filter(
        (q: ConditionQuestion) => q.deviceTypeId === deviceTypeId
      );
      
      setConditionQuestions(relevantQuestions);
      return relevantQuestions;
    },
    enabled: open && !!buybackRequest,
  });

  // Mutation to update the buyback request
  const updateBuybackMutation = useMutation({
    mutationFn: async (data: any) => {
      if (!buybackRequest) return null;
      const response = await apiRequest('PUT', `/api/buyback-requests/${buybackRequest.id}`, data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Buyback request has been updated successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/buyback-requests'] });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: `Failed to update buyback request: ${error.message || 'Unknown error'}`,
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (!buybackRequest) return;
    
    // Format values for API
    const submitData = {
      ...values,
      status: 'completed', // Mark as completed when device is reassessed
    };
    
    updateBuybackMutation.mutate(submitData);
  };

  if (!buybackRequest) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Reassess Device Condition</DialogTitle>
          <DialogDescription>
            Update the device condition, questionnaire answers, and final price for this buyback request.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle>Device Information</CardTitle>
                  <CardDescription>
                    {buybackRequest.manufacturer} {buybackRequest.model} ({buybackRequest.device_type})
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="imei"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>IMEI</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter IMEI number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="serial_number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Serial Number</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter serial number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="condition"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Overall Condition</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select condition" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Like New">Like New</SelectItem>
                            <SelectItem value="Excellent">Excellent</SelectItem>
                            <SelectItem value="Good">Good</SelectItem>
                            <SelectItem value="Fair">Fair</SelectItem>
                            <SelectItem value="Poor">Poor</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle>Pricing Information</CardTitle>
                  <CardDescription>
                    Set the final trade-in value for this device
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="offered_price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Offered Price ($)</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="0.00" className="pl-8" {...field} />
                          </div>
                        </FormControl>
                        <FormDescription>
                          Price originally offered to customer
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="final_price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Final Price ($)</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="0.00" className="pl-8" {...field} />
                          </div>
                        </FormControl>
                        <FormDescription>
                          Final price after inspection
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notes</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Add notes about device condition or pricing adjustments"
                            className="resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Condition Questionnaire */}
            {conditionQuestions.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Device Condition Questionnaire</CardTitle>
                  <CardDescription>
                    Review and update customer answers about device condition
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    {conditionQuestions.map((question) => {
                      const questionKey = `question_${question.id}`;
                      return (
                        <AccordionItem key={question.id} value={question.id.toString()}>
                          <AccordionTrigger className="text-left">
                            {question.question}
                          </AccordionTrigger>
                          <AccordionContent>
                            <FormField
                              control={form.control}
                              name={`questionnaire_answers.${questionKey}`}
                              render={({ field }) => (
                                <FormItem>
                                  <div className="space-y-2">
                                    {question.options.map((option) => (
                                      <div key={option.id} className="flex items-center space-x-2">
                                        <Button
                                          type="button"
                                          variant={field.value === option.text ? "default" : "outline"}
                                          className="w-full justify-start"
                                          onClick={() => field.onChange(option.text)}
                                        >
                                          {field.value === option.text && (
                                            <CheckCircle2 className="h-4 w-4 mr-2" />
                                          )}
                                          {option.text}
                                        </Button>
                                      </div>
                                    ))}
                                  </div>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </AccordionContent>
                        </AccordionItem>
                      );
                    })}
                  </Accordion>
                </CardContent>
              </Card>
            )}

            {/* Current Questionnaire Answers Display */}
            {buybackRequest.questionnaire_answers && 
              Object.keys(buybackRequest.questionnaire_answers).length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Current Customer Answers</CardTitle>
                  <CardDescription>
                    Customer's original responses to questionnaire
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(buybackRequest.questionnaire_answers).map(([question, answer], idx) => (
                      <div key={idx} className="p-3 bg-muted rounded-md">
                        <p className="text-sm font-medium">{question}</p>
                        <p className="text-sm text-muted-foreground">{answer}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <DialogFooter>
              <Button variant="outline" type="button" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={updateBuybackMutation.isPending}>
                {updateBuybackMutation.isPending ? "Saving..." : "Save Changes & Complete"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}