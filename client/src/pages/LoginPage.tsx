import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useLogin, useSignup } from '../hooks/use-user';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Label } from "../components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Loader2 } from 'lucide-react';
import { useToast } from '../hooks/use-toast';

// Login form schema
const loginSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
});

// Register form schema
const registerSchema = z.object({
  first_name: z.string().min(2, { message: 'First name must be at least 2 characters' }),
  last_name: z.string().min(2, { message: 'Last name must be at least 2 characters' }),
  email: z.string().email({ message: 'Please enter a valid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
  confirm_password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
}).refine((data) => data.password === data.confirm_password, {
  message: "Passwords don't match",
  path: ["confirm_password"],
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

const LoginPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('login');
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  // Get the redirect URL from location state or default to home page
  const from = (location.state as any)?.from?.pathname || '/';
  
  // Login form hook
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });
  
  // Register form hook
  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      email: '',
      password: '',
      confirm_password: '',
    },
  });
  
  // Login mutation
  const login = useLogin();
  
  // Signup mutation
  const signup = useSignup();
  
  // Handle login form submission
  const onLoginSubmit = (values: LoginFormValues) => {
    login.mutate(values, {
      onSuccess: (data) => {
        if (data?.token) {
          toast({
            title: 'Login successful',
            description: 'You have been logged in successfully.',
          });
          navigate(from, { replace: true });
        } else {
          toast({
            title: 'Login failed',
            description: data?.message || 'Invalid email or password',
            variant: 'destructive',
          });
        }
      },
      onError: (error: any) => {
        toast({
          title: 'Login failed',
          description: error?.message || 'An error occurred during login',
          variant: 'destructive',
        });
      }
    });
  };
  
  // Handle register form submission
  const onRegisterSubmit = (values: RegisterFormValues) => {
    // Remove confirm_password from values
    const { confirm_password, ...userData } = values;
    
    signup.mutate(userData, {
      onSuccess: (data) => {
        toast({
          title: 'Registration successful',
          description: 'Your account has been created. Please log in.',
        });
        setActiveTab('login');
        loginForm.setValue('email', values.email);
      },
      onError: (error: any) => {
        toast({
          title: 'Registration failed',
          description: error?.message || 'An error occurred during registration',
          variant: 'destructive',
        });
      }
    });
  };

  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-4rem)] bg-gray-50 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            {activeTab === 'login' ? 'Welcome back' : 'Create an account'}
          </CardTitle>
          <CardDescription className="text-center">
            {activeTab === 'login' 
              ? 'Enter your credentials to access your account' 
              : 'Enter your information to create an account'}
          </CardDescription>
        </CardHeader>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 mb-4 px-6">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Register</TabsTrigger>
          </TabsList>
          
          {/* Login Form */}
          <TabsContent value="login">
            <form onSubmit={loginForm.handleSubmit(onLoginSubmit)}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email"
                    type="email" 
                    placeholder="name@example.com" 
                    {...loginForm.register('email')}
                  />
                  {loginForm.formState.errors.email && (
                    <p className="text-sm text-red-500">{loginForm.formState.errors.email.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <a href="/forgot-password" className="text-sm text-blue-600 hover:underline">
                      Forgot password?
                    </a>
                  </div>
                  <Input 
                    id="password" 
                    type="password" 
                    placeholder="••••••••" 
                    {...loginForm.register('password')}
                  />
                  {loginForm.formState.errors.password && (
                    <p className="text-sm text-red-500">{loginForm.formState.errors.password.message}</p>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900"
                  disabled={login.isPending}
                >
                  {login.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    'Sign in'
                  )}
                </Button>
              </CardFooter>
            </form>
          </TabsContent>
          
          {/* Register Form */}
          <TabsContent value="register">
            <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)}>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="first_name">First Name</Label>
                    <Input 
                      id="first_name" 
                      placeholder="John" 
                      {...registerForm.register('first_name')}
                    />
                    {registerForm.formState.errors.first_name && (
                      <p className="text-sm text-red-500">{registerForm.formState.errors.first_name.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last_name">Last Name</Label>
                    <Input 
                      id="last_name" 
                      placeholder="Doe" 
                      {...registerForm.register('last_name')}
                    />
                    {registerForm.formState.errors.last_name && (
                      <p className="text-sm text-red-500">{registerForm.formState.errors.last_name.message}</p>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register_email">Email</Label>
                  <Input 
                    id="register_email" 
                    type="email" 
                    placeholder="name@example.com" 
                    {...registerForm.register('email')}
                  />
                  {registerForm.formState.errors.email && (
                    <p className="text-sm text-red-500">{registerForm.formState.errors.email.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register_password">Password</Label>
                  <Input 
                    id="register_password" 
                    type="password" 
                    placeholder="••••••••" 
                    {...registerForm.register('password')}
                  />
                  {registerForm.formState.errors.password && (
                    <p className="text-sm text-red-500">{registerForm.formState.errors.password.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm_password">Confirm Password</Label>
                  <Input 
                    id="confirm_password" 
                    type="password" 
                    placeholder="••••••••" 
                    {...registerForm.register('confirm_password')}
                  />
                  {registerForm.formState.errors.confirm_password && (
                    <p className="text-sm text-red-500">{registerForm.formState.errors.confirm_password.message}</p>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900"
                  disabled={signup.isPending}
                >
                  {signup.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    'Create account'
                  )}
                </Button>
              </CardFooter>
            </form>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};

export default LoginPage;