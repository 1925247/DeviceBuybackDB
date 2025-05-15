import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from '@/hooks/use-toast';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '../../lib/queryClient';
import { useNavigate } from 'react-router-dom';

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  ArrowRight, 
  Upload, 
  FileText, 
  CheckCircle, 
  AlertCircle,
  Building,
  User,
  MapPin,
  Shield,
  FileCheck,
  Award,
  Landmark,
  Loader2 
} from 'lucide-react';
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from 'date-fns';

// Define form validation schema
const partnerFormSchema = z.object({
  // Basic Information
  businessName: z.string().min(3, {
    message: "Business name must be at least 3 characters.",
  }),
  businessType: z.enum(["proprietorship", "partnership", "private_limited", "public_limited", "llp"], {
    required_error: "Please select a business type.",
  }),
  gstNumber: z.string()
    .regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, {
      message: "Please enter a valid GSTIN.",
    }),
  panNumber: z.string()
    .regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, {
      message: "Please enter a valid PAN.",
    }),
  shopActLicense: z.string().optional(),
  shopActExpiryDate: z.date().optional(),
  msmeRegistration: z.string().optional(),
  
  // Contact Information
  contactName: z.string().min(2, {
    message: "Contact name must be at least 2 characters.",
  }),
  contactEmail: z.string().email({
    message: "Please enter a valid email address.",
  }),
  contactPhone: z.string()
    .regex(/^[6-9]\d{9}$/, {
      message: "Please enter a valid 10-digit mobile number.",
    }),
  alternatePhone: z.string().optional(),
  
  // Address Information
  addressLine1: z.string().min(5, {
    message: "Address line 1 must be at least 5 characters.",
  }),
  addressLine2: z.string().optional(),
  city: z.string().min(2, {
    message: "City must be at least 2 characters.",
  }),
  state: z.string().min(2, {
    message: "State must be at least 2 characters.",
  }),
  pincode: z.string()
    .regex(/^[1-9][0-9]{5}$/, {
      message: "Please enter a valid 6-digit pincode.",
    }),
  
  // Bank Information
  accountHolderName: z.string().min(2, {
    message: "Account holder name must be at least 2 characters.",
  }),
  accountNumber: z.string()
    .regex(/^\d{9,18}$/, {
      message: "Account number must be between 9 and 18 digits.",
    }),
  confirmAccountNumber: z.string(),
  ifscCode: z.string()
    .regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, {
      message: "Please enter a valid IFSC code.",
    }),
  bankName: z.string().min(3, {
    message: "Bank name must be at least 3 characters.",
  }),
  bankBranch: z.string().min(3, {
    message: "Bank branch must be at least 3 characters.",
  }),
  
  // Geolocation
  serviceablePincodes: z.string().optional(),
  
  // Terms and Conditions
  termsAccepted: z.boolean().refine(val => val === true, {
    message: "You must accept the terms and conditions to proceed.",
  }),
  dataPrivacyAccepted: z.boolean().refine(val => val === true, {
    message: "You must accept the Data Privacy Policy to proceed.",
  }),
}).refine((data) => data.accountNumber === data.confirmAccountNumber, {
  message: "Account numbers do not match",
  path: ["confirmAccountNumber"],
});

type PartnerFormValues = z.infer<typeof partnerFormSchema>;

const PartnerOnboarding: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<'business' | 'contact' | 'address' | 'banking' | 'documents' | 'verification'>('business');
  const [isDigiLockerConnected, setIsDigiLockerConnected] = useState(false);
  const [isGstVerified, setIsGstVerified] = useState(false);
  const [isPanVerified, setIsPanVerified] = useState(false);
  const [documents, setDocuments] = useState<{[key: string]: File | null}>({
    shopAct: null,
    msme: null,
    bankStatement: null,
    addressProof: null,
  });
  
  // Initialize form
  const form = useForm<PartnerFormValues>({
    resolver: zodResolver(partnerFormSchema),
    defaultValues: {
      businessName: "",
      businessType: "proprietorship",
      gstNumber: "",
      panNumber: "",
      shopActLicense: "",
      msmeRegistration: "",
      contactName: "",
      contactEmail: "",
      contactPhone: "",
      alternatePhone: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      pincode: "",
      accountHolderName: "",
      accountNumber: "",
      confirmAccountNumber: "",
      ifscCode: "",
      bankName: "",
      bankBranch: "",
      serviceablePincodes: "",
      termsAccepted: false,
      dataPrivacyAccepted: false,
    },
  });
  
  // Handle document uploads
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, docType: string) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setDocuments(prev => ({
        ...prev,
        [docType]: file
      }));
      
      toast({
        title: "File uploaded",
        description: `${file.name} has been uploaded successfully.`,
      });
    }
  };
  
  // Partner registration mutation
  const createPartnerMutation = useMutation({
    mutationFn: async (data: PartnerFormValues) => {
      // Create FormData for file uploads
      const formData = new FormData();
      
      // Add all form fields
      Object.entries(data).forEach(([key, value]) => {
        if (key === 'shopActExpiryDate' && value instanceof Date) {
          formData.append(key, value.toISOString());
        } else if (typeof value === 'boolean') {
          formData.append(key, value ? 'true' : 'false');
        } else if (value !== undefined && value !== null) {
          formData.append(key, String(value));
        }
      });
      
      // Add document files
      Object.entries(documents).forEach(([key, file]) => {
        if (file) {
          formData.append(`document_${key}`, file);
        }
      });
      
      // Send the request with FormData
      return fetch('/api/partners/register', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      })
      .then(async res => {
        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(errorText || res.statusText);
        }
        return res.json();
      });
    },
    onSuccess: (data) => {
      toast({
        title: "Registration successful",
        description: "Your partner account has been created and is pending approval.",
      });
      navigate('/partner/registration-success');
    },
    onError: (error: any) => {
      toast({
        title: "Registration failed",
        description: error.message || "There was an error registering your partner account. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  // Handle form submission
  const onSubmit = (data: PartnerFormValues) => {
    createPartnerMutation.mutate(data);
  };
  
  // DigiLocker connection simulation
  const connectToDigiLocker = () => {
    // In a real application, this would redirect to DigiLocker OAuth flow
    toast({
      title: "Connecting to DigiLocker",
      description: "Redirecting to DigiLocker for authentication...",
    });
    
    // Simulate DigiLocker connection
    setTimeout(() => {
      setIsDigiLockerConnected(true);
      
      // Auto-fill some fields with DigiLocker data
      form.setValue('contactName', 'Rahul Sharma');
      form.setValue('panNumber', 'ABCDE1234F');
      setIsPanVerified(true);
      
      toast({
        title: "DigiLocker Connected",
        description: "Successfully connected to DigiLocker and retrieved your documents.",
      });
    }, 2000);
  };
  
  // GST verification simulation
  const verifyGST = () => {
    const gstNumber = form.getValues('gstNumber');
    
    if (!gstNumber) {
      toast({
        title: "Verification Failed",
        description: "Please enter a GST number first.",
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "Verifying GST",
      description: "Connecting to GST Suvidha Provider...",
    });
    
    // Simulate GST verification
    setTimeout(() => {
      setIsGstVerified(true);
      
      // Auto-fill business info from GST data
      form.setValue('businessName', 'TechServe Solutions Pvt Ltd');
      form.setValue('businessType', 'private_limited');
      form.setValue('addressLine1', '42, Tech Park');
      form.setValue('addressLine2', 'Sector 14');
      form.setValue('city', 'Gurugram');
      form.setValue('state', 'Haryana');
      form.setValue('pincode', '122001');
      
      toast({
        title: "GST Verified",
        description: "GST number verified successfully. Business details have been updated.",
      });
    }, 2000);
  };
  
  // Verify PAN manually if not via DigiLocker
  const verifyPAN = () => {
    const panNumber = form.getValues('panNumber');
    
    if (!panNumber) {
      toast({
        title: "Verification Failed",
        description: "Please enter a PAN number first.",
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "Verifying PAN",
      description: "Connecting to verification service...",
    });
    
    // Simulate PAN verification
    setTimeout(() => {
      setIsPanVerified(true);
      toast({
        title: "PAN Verified",
        description: "PAN number verified successfully.",
      });
    }, 2000);
  };
  
  // Handle step navigation
  const goToNextStep = () => {
    switch (currentStep) {
      case 'business':
        if (!form.getValues('businessName') || !form.getValues('businessType') || !isGstVerified) {
          toast({
            title: "Incomplete Information",
            description: "Please complete all required fields and verify your GST number.",
            variant: "destructive",
          });
          return;
        }
        setCurrentStep('contact');
        break;
      case 'contact':
        if (!form.getValues('contactName') || !form.getValues('contactEmail') || !form.getValues('contactPhone')) {
          toast({
            title: "Incomplete Information",
            description: "Please complete all required contact information fields.",
            variant: "destructive",
          });
          return;
        }
        setCurrentStep('address');
        break;
      case 'address':
        if (!form.getValues('addressLine1') || !form.getValues('city') || !form.getValues('state') || !form.getValues('pincode')) {
          toast({
            title: "Incomplete Information",
            description: "Please complete all required address fields.",
            variant: "destructive",
          });
          return;
        }
        setCurrentStep('banking');
        break;
      case 'banking':
        if (!form.getValues('accountHolderName') || !form.getValues('accountNumber') || !form.getValues('confirmAccountNumber') || !form.getValues('ifscCode') || !form.getValues('bankName')) {
          toast({
            title: "Incomplete Information",
            description: "Please complete all required banking information fields.",
            variant: "destructive",
          });
          return;
        }
        if (form.getValues('accountNumber') !== form.getValues('confirmAccountNumber')) {
          toast({
            title: "Account Numbers Don't Match",
            description: "Please ensure that the account numbers match.",
            variant: "destructive",
          });
          return;
        }
        setCurrentStep('documents');
        break;
      case 'documents':
        // Documents are optional, so we'll just move to the next step
        setCurrentStep('verification');
        break;
      case 'verification':
        if (!form.getValues('termsAccepted') || !form.getValues('dataPrivacyAccepted')) {
          toast({
            title: "Terms Not Accepted",
            description: "Please accept the terms and conditions and data privacy policy to proceed.",
            variant: "destructive",
          });
          return;
        }
        form.handleSubmit(onSubmit)();
        break;
    }
  };
  
  const goToPreviousStep = () => {
    switch (currentStep) {
      case 'contact':
        setCurrentStep('business');
        break;
      case 'address':
        setCurrentStep('contact');
        break;
      case 'banking':
        setCurrentStep('address');
        break;
      case 'documents':
        setCurrentStep('banking');
        break;
      case 'verification':
        setCurrentStep('documents');
        break;
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <Card className="border-none shadow-lg">
            <CardHeader className="bg-primary text-white rounded-t-lg">
              <CardTitle className="text-2xl">Partner Onboarding</CardTitle>
              <CardDescription className="text-primary-foreground opacity-90">
                Register your business as a GadgetSwap partner to start handling device buyback requests
              </CardDescription>
            </CardHeader>
            
            <CardContent className="p-6">
              {/* Progress Steps */}
              <div className="mb-8">
                <div className="flex items-center justify-between">
                  <div className={`flex flex-col items-center ${currentStep === 'business' ? 'text-primary' : 'text-gray-500'}`}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${currentStep === 'business' ? 'border-primary bg-primary text-white' : 'border-gray-300'}`}>
                      <Building className="w-5 h-5" />
                    </div>
                    <span className="text-xs mt-1">Business</span>
                  </div>
                  <div className={`flex-1 h-1 mx-2 ${currentStep === 'business' || currentStep === 'contact' ? 'bg-primary' : 'bg-gray-300'}`}></div>
                  
                  <div className={`flex flex-col items-center ${currentStep === 'contact' ? 'text-primary' : 'text-gray-500'}`}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${currentStep === 'contact' ? 'border-primary bg-primary text-white' : currentStep === 'business' ? 'border-gray-300' : 'border-primary bg-primary text-white'}`}>
                      <User className="w-5 h-5" />
                    </div>
                    <span className="text-xs mt-1">Contact</span>
                  </div>
                  <div className={`flex-1 h-1 mx-2 ${currentStep === 'address' || currentStep === 'banking' || currentStep === 'documents' || currentStep === 'verification' ? 'bg-primary' : 'bg-gray-300'}`}></div>
                  
                  <div className={`flex flex-col items-center ${currentStep === 'address' ? 'text-primary' : 'text-gray-500'}`}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${currentStep === 'address' ? 'border-primary bg-primary text-white' : currentStep === 'business' || currentStep === 'contact' ? 'border-gray-300' : 'border-primary bg-primary text-white'}`}>
                      <MapPin className="w-5 h-5" />
                    </div>
                    <span className="text-xs mt-1">Address</span>
                  </div>
                  <div className={`flex-1 h-1 mx-2 ${currentStep === 'banking' || currentStep === 'documents' || currentStep === 'verification' ? 'bg-primary' : 'bg-gray-300'}`}></div>
                  
                  <div className={`flex flex-col items-center ${currentStep === 'banking' ? 'text-primary' : 'text-gray-500'}`}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${currentStep === 'banking' ? 'border-primary bg-primary text-white' : currentStep === 'business' || currentStep === 'contact' || currentStep === 'address' ? 'border-gray-300' : 'border-primary bg-primary text-white'}`}>
                      <Landmark className="w-5 h-5" />
                    </div>
                    <span className="text-xs mt-1">Banking</span>
                  </div>
                  <div className={`flex-1 h-1 mx-2 ${currentStep === 'documents' || currentStep === 'verification' ? 'bg-primary' : 'bg-gray-300'}`}></div>
                  
                  <div className={`flex flex-col items-center ${currentStep === 'documents' ? 'text-primary' : 'text-gray-500'}`}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${currentStep === 'documents' ? 'border-primary bg-primary text-white' : currentStep === 'business' || currentStep === 'contact' || currentStep === 'address' || currentStep === 'banking' ? 'border-gray-300' : 'border-primary bg-primary text-white'}`}>
                      <FileCheck className="w-5 h-5" />
                    </div>
                    <span className="text-xs mt-1">Documents</span>
                  </div>
                  <div className={`flex-1 h-1 mx-2 ${currentStep === 'verification' ? 'bg-primary' : 'bg-gray-300'}`}></div>
                  
                  <div className={`flex flex-col items-center ${currentStep === 'verification' ? 'text-primary' : 'text-gray-500'}`}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${currentStep === 'verification' ? 'border-primary bg-primary text-white' : 'border-gray-300'}`}>
                      <Shield className="w-5 h-5" />
                    </div>
                    <span className="text-xs mt-1">Verify</span>
                  </div>
                </div>
              </div>
              
              <Form {...form}>
                <form className="space-y-6">
                  {/* Business Information */}
                  {currentStep === 'business' && (
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Business Information</h3>
                      
                      <div className="mb-6">
                        <Button 
                          type="button" 
                          variant="outline"
                          className="w-full"
                          onClick={connectToDigiLocker}
                          disabled={isDigiLockerConnected}
                        >
                          {isDigiLockerConnected ? (
                            <>
                              <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                              Connected to DigiLocker
                            </>
                          ) : (
                            <>
                              <Shield className="mr-2 h-4 w-4" />
                              Connect with DigiLocker for faster verification
                            </>
                          )}
                        </Button>
                        <p className="text-sm text-muted-foreground mt-1">
                          Connect with DigiLocker to automatically verify your PAN, Aadhaar and other documents.
                        </p>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="gstNumber"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>GST Number*</FormLabel>
                              <div className="flex space-x-2">
                                <FormControl>
                                  <Input placeholder="e.g. 27AADCB2230M1ZT" {...field} />
                                </FormControl>
                                <Button 
                                  type="button" 
                                  variant="secondary" 
                                  size="sm"
                                  onClick={verifyGST}
                                  disabled={isGstVerified}
                                >
                                  {isGstVerified ? 'Verified' : 'Verify'}
                                </Button>
                              </div>
                              <FormDescription>
                                {isGstVerified && (
                                  <span className="text-green-600 flex items-center">
                                    <CheckCircle className="h-3 w-3 mr-1" /> Verified with GST Suvidha
                                  </span>
                                )}
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="panNumber"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>PAN Number*</FormLabel>
                              <div className="flex space-x-2">
                                <FormControl>
                                  <Input 
                                    placeholder="e.g. ABCDE1234F" 
                                    {...field} 
                                    disabled={isDigiLockerConnected && isPanVerified}
                                  />
                                </FormControl>
                                {!isDigiLockerConnected && (
                                  <Button 
                                    type="button" 
                                    variant="secondary" 
                                    size="sm"
                                    onClick={verifyPAN}
                                    disabled={isPanVerified}
                                  >
                                    {isPanVerified ? 'Verified' : 'Verify'}
                                  </Button>
                                )}
                              </div>
                              <FormDescription>
                                {isPanVerified && (
                                  <span className="text-green-600 flex items-center">
                                    <CheckCircle className="h-3 w-3 mr-1" /> 
                                    {isDigiLockerConnected ? 'Verified via DigiLocker' : 'Verified'}
                                  </span>
                                )}
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="businessName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Business Name*</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="e.g. Tech Solutions Pvt Ltd" 
                                  {...field} 
                                  disabled={isGstVerified}
                                />
                              </FormControl>
                              <FormDescription>
                                {isGstVerified && "Auto-filled from GST data"}
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="businessType"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Business Type*</FormLabel>
                              <Select 
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                                disabled={isGstVerified}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select business type" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="proprietorship">Proprietorship</SelectItem>
                                  <SelectItem value="partnership">Partnership</SelectItem>
                                  <SelectItem value="private_limited">Private Limited</SelectItem>
                                  <SelectItem value="public_limited">Public Limited</SelectItem>
                                  <SelectItem value="llp">Limited Liability Partnership (LLP)</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormDescription>
                                {isGstVerified && "Auto-filled from GST data"}
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="shopActLicense"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Shop Act License Number (Optional)</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter license number" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="shopActExpiryDate"
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormLabel>License Expiry Date (Optional)</FormLabel>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <FormControl>
                                    <Button
                                      variant={"outline"}
                                      className={`w-full pl-3 text-left font-normal ${!field.value ? "text-muted-foreground" : ""}`}
                                    >
                                      {field.value ? (
                                        format(field.value, "PPP")
                                      ) : (
                                        <span>Pick a date</span>
                                      )}
                                    </Button>
                                  </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                  <Calendar
                                    mode="single"
                                    selected={field.value ? field.value : undefined}
                                    onSelect={(date) => field.onChange(date)}
                                    initialFocus
                                  />
                                </PopoverContent>
                              </Popover>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="msmeRegistration"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>MSME Registration Number (Optional)</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter MSME number" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  )}
                  
                  {/* Contact Information */}
                  {currentStep === 'contact' && (
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="contactName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Contact Person Name*</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g. John Doe" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="contactEmail"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email Address*</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g. john@example.com" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="contactPhone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Mobile Number*</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g. 9876543210" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="alternatePhone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Alternate Phone (Optional)</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g. 9876543210" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  )}
                  
                  {/* Address Information */}
                  {currentStep === 'address' && (
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Address Information</h3>
                      
                      <div className="grid grid-cols-1 gap-4">
                        <FormField
                          control={form.control}
                          name="addressLine1"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Address Line 1*</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g. 123, Main Street" {...field} disabled={isGstVerified} />
                              </FormControl>
                              <FormDescription>
                                {isGstVerified && "Auto-filled from GST data"}
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="addressLine2"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Address Line 2 (Optional)</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g. Apartment, Suite, Unit, etc." {...field} disabled={isGstVerified} />
                              </FormControl>
                              <FormDescription>
                                {isGstVerified && "Auto-filled from GST data"}
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <FormField
                            control={form.control}
                            name="city"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>City*</FormLabel>
                                <FormControl>
                                  <Input placeholder="e.g. Mumbai" {...field} disabled={isGstVerified} />
                                </FormControl>
                                <FormDescription>
                                  {isGstVerified && "Auto-filled from GST data"}
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="state"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>State*</FormLabel>
                                <FormControl>
                                  <Input placeholder="e.g. Maharashtra" {...field} disabled={isGstVerified} />
                                </FormControl>
                                <FormDescription>
                                  {isGstVerified && "Auto-filled from GST data"}
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="pincode"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Pincode*</FormLabel>
                                <FormControl>
                                  <Input placeholder="e.g. 400001" {...field} disabled={isGstVerified} />
                                </FormControl>
                                <FormDescription>
                                  {isGstVerified && "Auto-filled from GST data"}
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <FormField
                          control={form.control}
                          name="serviceablePincodes"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Serviceable Pincodes (Optional)</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Enter comma-separated pincodes that you can service, e.g. 400001, 400002, 400003"
                                  {...field}
                                />
                              </FormControl>
                              <FormDescription>
                                These are the areas where you can provide buyback services. You can update this later.
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  )}
                  
                  {/* Banking Information */}
                  {currentStep === 'banking' && (
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Banking Information</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="accountHolderName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Account Holder Name*</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g. John Doe or Business Name" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="accountNumber"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Account Number*</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter account number" {...field} type="password" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="confirmAccountNumber"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Confirm Account Number*</FormLabel>
                              <FormControl>
                                <Input placeholder="Confirm account number" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="ifscCode"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>IFSC Code*</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g. SBIN0000001" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="bankName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Bank Name*</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g. State Bank of India" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="bankBranch"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Branch Name*</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g. Mumbai Main Branch" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  )}
                  
                  {/* Document Uploads */}
                  {currentStep === 'documents' && (
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Document Uploads</h3>
                      
                      <div className="space-y-6">
                        {isDigiLockerConnected && (
                          <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-6">
                            <div className="flex items-start">
                              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-2" />
                              <div>
                                <h4 className="text-sm font-medium text-green-800">DigiLocker Connected</h4>
                                <p className="text-sm text-green-700 mt-1">
                                  Your identity documents have been verified through DigiLocker. You can upload additional business documents below.
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-medium mb-2">Shop Act License (Optional)</label>
                            <div className="border-2 border-dashed border-gray-300 rounded-md p-4">
                              <div className="flex flex-col items-center justify-center">
                                {documents.shopAct ? (
                                  <div className="flex items-center space-x-2">
                                    <FileText className="h-8 w-8 text-primary" />
                                    <div>
                                      <p className="text-sm font-medium">{documents.shopAct.name}</p>
                                      <p className="text-xs text-muted-foreground">
                                        {Math.round(documents.shopAct.size / 1024)} KB
                                      </p>
                                    </div>
                                  </div>
                                ) : (
                                  <>
                                    <Upload className="h-10 w-10 text-gray-400 mb-2" />
                                    <p className="text-sm text-center text-muted-foreground mb-2">
                                      Upload your Shop Act License
                                    </p>
                                  </>
                                )}
                                <div className="mt-2">
                                  <input
                                    type="file"
                                    id="shop-act-upload"
                                    className="hidden"
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    onChange={(e) => handleFileUpload(e, 'shopAct')}
                                  />
                                  <label htmlFor="shop-act-upload">
                                    <Button variant="outline" size="sm" type="button" asChild>
                                      <span>{documents.shopAct ? 'Replace File' : 'Select File'}</span>
                                    </Button>
                                  </label>
                                </div>
                              </div>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              Upload PDF, JPG or PNG, max 5MB
                            </p>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium mb-2">MSME Certificate (Optional)</label>
                            <div className="border-2 border-dashed border-gray-300 rounded-md p-4">
                              <div className="flex flex-col items-center justify-center">
                                {documents.msme ? (
                                  <div className="flex items-center space-x-2">
                                    <FileText className="h-8 w-8 text-primary" />
                                    <div>
                                      <p className="text-sm font-medium">{documents.msme.name}</p>
                                      <p className="text-xs text-muted-foreground">
                                        {Math.round(documents.msme.size / 1024)} KB
                                      </p>
                                    </div>
                                  </div>
                                ) : (
                                  <>
                                    <Upload className="h-10 w-10 text-gray-400 mb-2" />
                                    <p className="text-sm text-center text-muted-foreground mb-2">
                                      Upload your MSME Certificate
                                    </p>
                                  </>
                                )}
                                <div className="mt-2">
                                  <input
                                    type="file"
                                    id="msme-upload"
                                    className="hidden"
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    onChange={(e) => handleFileUpload(e, 'msme')}
                                  />
                                  <label htmlFor="msme-upload">
                                    <Button variant="outline" size="sm" type="button" asChild>
                                      <span>{documents.msme ? 'Replace File' : 'Select File'}</span>
                                    </Button>
                                  </label>
                                </div>
                              </div>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              Upload PDF, JPG or PNG, max 5MB
                            </p>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium mb-2">Bank Statement/Cancelled Cheque</label>
                            <div className="border-2 border-dashed border-gray-300 rounded-md p-4">
                              <div className="flex flex-col items-center justify-center">
                                {documents.bankStatement ? (
                                  <div className="flex items-center space-x-2">
                                    <FileText className="h-8 w-8 text-primary" />
                                    <div>
                                      <p className="text-sm font-medium">{documents.bankStatement.name}</p>
                                      <p className="text-xs text-muted-foreground">
                                        {Math.round(documents.bankStatement.size / 1024)} KB
                                      </p>
                                    </div>
                                  </div>
                                ) : (
                                  <>
                                    <Upload className="h-10 w-10 text-gray-400 mb-2" />
                                    <p className="text-sm text-center text-muted-foreground mb-2">
                                      Upload a bank statement or cancelled cheque
                                    </p>
                                  </>
                                )}
                                <div className="mt-2">
                                  <input
                                    type="file"
                                    id="bank-statement-upload"
                                    className="hidden"
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    onChange={(e) => handleFileUpload(e, 'bankStatement')}
                                  />
                                  <label htmlFor="bank-statement-upload">
                                    <Button variant="outline" size="sm" type="button" asChild>
                                      <span>{documents.bankStatement ? 'Replace File' : 'Select File'}</span>
                                    </Button>
                                  </label>
                                </div>
                              </div>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              Upload PDF, JPG or PNG, max 5MB
                            </p>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium mb-2">Address Proof (Optional)</label>
                            <div className="border-2 border-dashed border-gray-300 rounded-md p-4">
                              <div className="flex flex-col items-center justify-center">
                                {documents.addressProof ? (
                                  <div className="flex items-center space-x-2">
                                    <FileText className="h-8 w-8 text-primary" />
                                    <div>
                                      <p className="text-sm font-medium">{documents.addressProof.name}</p>
                                      <p className="text-xs text-muted-foreground">
                                        {Math.round(documents.addressProof.size / 1024)} KB
                                      </p>
                                    </div>
                                  </div>
                                ) : (
                                  <>
                                    <Upload className="h-10 w-10 text-gray-400 mb-2" />
                                    <p className="text-sm text-center text-muted-foreground mb-2">
                                      Upload an address proof
                                    </p>
                                  </>
                                )}
                                <div className="mt-2">
                                  <input
                                    type="file"
                                    id="address-proof-upload"
                                    className="hidden"
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    onChange={(e) => handleFileUpload(e, 'addressProof')}
                                  />
                                  <label htmlFor="address-proof-upload">
                                    <Button variant="outline" size="sm" type="button" asChild>
                                      <span>{documents.addressProof ? 'Replace File' : 'Select File'}</span>
                                    </Button>
                                  </label>
                                </div>
                              </div>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              Upload PDF, JPG or PNG, max 5MB
                            </p>
                          </div>
                        </div>
                        
                        <div className="mt-6">
                          <p className="text-sm text-muted-foreground">
                            Note: All uploaded documents will be verified by our team before your partner account is activated.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Verification and Terms */}
                  {currentStep === 'verification' && (
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Terms and Verification</h3>
                      
                      <div className="space-y-6">
                        <div className="bg-primary-50 border border-primary-200 rounded-md p-4">
                          <h4 className="text-sm font-medium text-primary-800">Verification Status</h4>
                          <div className="mt-3 space-y-2">
                            <div className="flex items-center">
                              <div className="flex-shrink-0">
                                {isGstVerified ? (
                                  <CheckCircle className="h-5 w-5 text-green-500" />
                                ) : (
                                  <AlertCircle className="h-5 w-5 text-red-500" />
                                )}
                              </div>
                              <div className="ml-3">
                                <p className="text-sm font-medium">GST Verification</p>
                              </div>
                              <div className="ml-auto">
                                <span className={`px-2 py-1 text-xs rounded-full ${isGstVerified ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                  {isGstVerified ? 'Verified' : 'Not Verified'}
                                </span>
                              </div>
                            </div>
                            
                            <div className="flex items-center">
                              <div className="flex-shrink-0">
                                {isPanVerified ? (
                                  <CheckCircle className="h-5 w-5 text-green-500" />
                                ) : (
                                  <AlertCircle className="h-5 w-5 text-red-500" />
                                )}
                              </div>
                              <div className="ml-3">
                                <p className="text-sm font-medium">PAN Verification</p>
                              </div>
                              <div className="ml-auto">
                                <span className={`px-2 py-1 text-xs rounded-full ${isPanVerified ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                  {isPanVerified ? 'Verified' : 'Not Verified'}
                                </span>
                              </div>
                            </div>
                            
                            <div className="flex items-center">
                              <div className="flex-shrink-0">
                                {isDigiLockerConnected ? (
                                  <CheckCircle className="h-5 w-5 text-green-500" />
                                ) : (
                                  <AlertCircle className="h-5 w-5 text-amber-500" />
                                )}
                              </div>
                              <div className="ml-3">
                                <p className="text-sm font-medium">DigiLocker Connection</p>
                              </div>
                              <div className="ml-auto">
                                <span className={`px-2 py-1 text-xs rounded-full ${isDigiLockerConnected ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
                                  {isDigiLockerConnected ? 'Connected' : 'Optional'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          <FormField
                            control={form.control}
                            name="termsAccepted"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                <FormControl>
                                  <Checkbox 
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                  <FormLabel>
                                    I agree to the <AlertDialog>
                                      <AlertDialogTrigger asChild>
                                        <span className="text-primary underline cursor-pointer">Terms and Conditions</span>
                                      </AlertDialogTrigger>
                                      <AlertDialogContent>
                                        <AlertDialogHeader>
                                          <AlertDialogTitle>Terms and Conditions</AlertDialogTitle>
                                          <AlertDialogDescription>
                                            <div className="max-h-96 overflow-y-auto text-sm space-y-4">
                                              <p>
                                                <strong>1. AGREEMENT TO TERMS</strong>
                                              </p>
                                              <p>
                                                These Terms and Conditions constitute a legally binding agreement made between you as a Partner and GadgetSwap, concerning your access to and use of the GadgetSwap Partner Portal and Services.
                                              </p>
                                              <p>
                                                <strong>2. PARTNER RESPONSIBILITIES</strong>
                                              </p>
                                              <p>
                                                As a GadgetSwap Partner, you agree to:
                                              </p>
                                              <ul className="list-disc list-inside pl-4 space-y-1">
                                                <li>Provide accurate information during registration and maintain its accuracy</li>
                                                <li>Comply with all applicable laws and regulations</li>
                                                <li>Maintain confidentiality of customer data and protect privacy</li>
                                                <li>Follow GadgetSwap's quality standards and guidelines</li>
                                                <li>Process buyback requests within the specified timeframes</li>
                                                <li>Maintain accurate records of all transactions</li>
                                              </ul>
                                              <p>
                                                <strong>3. PRICING AND PAYMENTS</strong>
                                              </p>
                                              <p>
                                                Partners will receive payment for completed buyback transactions as per the agreed commission structure. Payments will be processed within 7-14 business days after transaction completion.
                                              </p>
                                              <p>
                                                <strong>4. TERM AND TERMINATION</strong>
                                              </p>
                                              <p>
                                                GadgetSwap reserves the right to terminate the Partner relationship if:
                                              </p>
                                              <ul className="list-disc list-inside pl-4 space-y-1">
                                                <li>Partner provides false or misleading information</li>
                                                <li>Partner fails to comply with these Terms or applicable laws</li>
                                                <li>Partner engages in fraudulent or unethical business practices</li>
                                                <li>Partner fails to maintain satisfactory performance metrics</li>
                                              </ul>
                                              <p>
                                                <strong>5. LIMITATION OF LIABILITY</strong>
                                              </p>
                                              <p>
                                                GadgetSwap shall not be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, or goodwill, resulting from your access to or use of or inability to access or use the Partner Portal.
                                              </p>
                                              <p>
                                                <strong>6. GOVERNING LAW</strong>
                                              </p>
                                              <p>
                                                These Terms shall be governed by and defined following the laws of India. GadgetSwap and yourself irrevocably consent that the courts of Delhi, India shall have exclusive jurisdiction to resolve any dispute arising out of these Terms.
                                              </p>
                                            </div>
                                          </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                          <AlertDialogAction>I Accept</AlertDialogAction>
                                        </AlertDialogFooter>
                                      </AlertDialogContent>
                                    </AlertDialog> of GadgetSwap
                                  </FormLabel>
                                  <FormMessage />
                                </div>
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="dataPrivacyAccepted"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                <FormControl>
                                  <Checkbox 
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                  <FormLabel>
                                    I agree to the <AlertDialog>
                                      <AlertDialogTrigger asChild>
                                        <span className="text-primary underline cursor-pointer">Data Privacy Policy</span>
                                      </AlertDialogTrigger>
                                      <AlertDialogContent>
                                        <AlertDialogHeader>
                                          <AlertDialogTitle>Data Privacy Policy</AlertDialogTitle>
                                          <AlertDialogDescription>
                                            <div className="max-h-96 overflow-y-auto text-sm space-y-4">
                                              <p>
                                                <strong>1. INTRODUCTION</strong>
                                              </p>
                                              <p>
                                                This Data Privacy Policy outlines how GadgetSwap collects, uses, and protects the personal information of Partners and customers, in compliance with the Digital Personal Data Protection Act, 2023 (DPDP Act).
                                              </p>
                                              <p>
                                                <strong>2. DATA COLLECTION</strong>
                                              </p>
                                              <p>
                                                As a Partner, we collect the following information:
                                              </p>
                                              <ul className="list-disc list-inside pl-4 space-y-1">
                                                <li>Business details (name, type, registration numbers)</li>
                                                <li>Contact information of authorized representatives</li>
                                                <li>Bank account details for payment processing</li>
                                                <li>Business address and operational pincodes</li>
                                                <li>Documents for verification purposes</li>
                                              </ul>
                                              <p>
                                                <strong>3. PURPOSE OF DATA COLLECTION</strong>
                                              </p>
                                              <p>
                                                The collected data will be used for:
                                              </p>
                                              <ul className="list-disc list-inside pl-4 space-y-1">
                                                <li>Partner verification and onboarding</li>
                                                <li>Assignment of buyback requests</li>
                                                <li>Processing payments and commissions</li>
                                                <li>Communication regarding services and updates</li>
                                                <li>Compliance with legal and regulatory requirements</li>
                                              </ul>
                                              <p>
                                                <strong>4. DATA PROTECTION</strong>
                                              </p>
                                              <p>
                                                GadgetSwap implements appropriate technical and organizational measures to protect your data, including encryption, access controls, and regular security assessments in accordance with the DPDP Act.
                                              </p>
                                              <p>
                                                <strong>5. DATA SHARING</strong>
                                              </p>
                                              <p>
                                                Your data may be shared with:
                                              </p>
                                              <ul className="list-disc list-inside pl-4 space-y-1">
                                                <li>Verification agencies for document validation</li>
                                                <li>Payment processors for transaction processing</li>
                                                <li>Regulatory authorities as required by law</li>
                                              </ul>
                                              <p>
                                                <strong>6. DATA RETENTION</strong>
                                              </p>
                                              <p>
                                                Partner data will be retained for the duration of the partnership and for a period thereafter as required by law or for legitimate business purposes.
                                              </p>
                                              <p>
                                                <strong>7. PARTNER RESPONSIBILITIES</strong>
                                              </p>
                                              <p>
                                                As a Partner, you must:
                                              </p>
                                              <ul className="list-disc list-inside pl-4 space-y-1">
                                                <li>Handle customer data in accordance with the DPDP Act</li>
                                                <li>Implement appropriate security measures</li>
                                                <li>Report any data breaches immediately</li>
                                                <li>Process customer data only for the agreed purposes</li>
                                              </ul>
                                              <p>
                                                <strong>8. RIGHTS OF DATA SUBJECTS</strong>
                                              </p>
                                              <p>
                                                Under the DPDP Act, you have the right to:
                                              </p>
                                              <ul className="list-disc list-inside pl-4 space-y-1">
                                                <li>Access your personal data</li>
                                                <li>Correct inaccurate data</li>
                                                <li>Request deletion of your data</li>
                                                <li>Object to processing of your data</li>
                                                <li>Data portability</li>
                                              </ul>
                                            </div>
                                          </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                          <AlertDialogAction>I Accept</AlertDialogAction>
                                        </AlertDialogFooter>
                                      </AlertDialogContent>
                                    </AlertDialog> and consent to the processing of my data
                                  </FormLabel>
                                  <FormMessage />
                                </div>
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                          <div className="flex">
                            <div className="flex-shrink-0">
                              <Shield className="h-5 w-5 text-blue-500" />
                            </div>
                            <div className="ml-3">
                              <h3 className="text-sm font-medium text-blue-800">Final Verification Notice</h3>
                              <div className="mt-2 text-sm text-blue-700">
                                <p>
                                  Once submitted, your partner registration will be reviewed by our team. You may be contacted for additional verification or documents if needed. The review process typically takes 2-3 business days.
                                </p>
                                <p className="mt-2">
                                  Upon approval, you will receive credentials to access the Partner Portal.
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </form>
              </Form>
            </CardContent>
            
            <CardFooter className="bg-gray-50 p-6 flex justify-between">
              {currentStep !== 'business' && (
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={goToPreviousStep}
                >
                  Back
                </Button>
              )}
              <div className="ml-auto">
                <Button 
                  type="button" 
                  onClick={goToNextStep}
                  disabled={createPartnerMutation.isPending}
                >
                  {createPartnerMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : currentStep === 'verification' ? (
                    'Submit Registration'
                  ) : (
                    <>
                      Next
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PartnerOnboarding;