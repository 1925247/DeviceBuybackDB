// src/pages/admin/AdminLogin.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Smartphone, Eye, EyeOff, Loader2 } from 'lucide-react';

const AdminLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const navigate = useNavigate();

  // Rate limiting
  useEffect(() => {
    if (attempts >= 3) {
      const timeout = setTimeout(() => setAttempts(0), 30000);
      return () => clearTimeout(timeout);
    }
  }, [attempts]);

  // Email validation
  const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  // Password validation
  const isValidPassword = (password: string) => password.length >= 8;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (attempts >= 3) {
      setError('Too many attempts. Please try again later.');
      return;
    }

    if (!isValidEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    if (!isValidPassword(password)) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);

    try {
      // Simulate network delay
      await new Promise<void>((resolve) => setTimeout(resolve, 500));

      // Authentication logic
      if (email === 'admin@example.com' && password === 'admin123') {
        const authPayload = {
          token: 'mock-json-web-token',
          expires: Date.now() + 3600000,
          user: { email: 'admin@example.com', name: 'Admin User' }
        };

        const storage = rememberMe ? localStorage : sessionStorage;
        storage.setItem('adminToken', JSON.stringify(authPayload));

        setAttempts(0);
        window.location.href = '/admin';
        return;
      } else {
        throw new Error('Invalid credentials');
      }

    } catch (err) {
      setAttempts(prev => prev + 1);
      const message = err instanceof Error ? err.message : 'Login failed';
      setError(`${message} (Attempt ${attempts + 1}/3)`);

      if (attempts >= 2) {
        setPassword('');
        setEmail('');
      }

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Smartphone className="h-12 w-12 text-blue-600" aria-hidden="true" />
        </div>
        <h1 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Admin Portal
        </h1>
        <p className="mt-2 text-center text-sm text-gray-600">
          Secure access to management dashboard
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert" aria-live="assertive">
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value.trim())}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="admin@example.com"
                  disabled={attempts >= 3}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="••••••••"
                  disabled={attempts >= 3}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  disabled={attempts >= 3}
                >
                  {showPassword ? <EyeOff className="h-5 w-5 text-gray-400" aria-hidden="true" /> : <Eye className="h-5 w-5 text-gray-400" aria-hidden="true" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  disabled={attempts >= 3}
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                  Remember this device
                </label>
              </div>

              <div className="text-sm">
                <button
                  type="button"
                  onClick={() => setError('Password reset functionality not implemented yet')}
                  className="font-medium text-blue-600 hover:text-blue-500 focus:outline-none"
                  disabled={attempts >= 3}
                >
                  Forgot password?
                </button>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading || attempts >= 3}
                className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed"
                aria-busy={loading}
              >
                {loading ? <><Loader2 className="animate-spin h-5 w-5 mr-2" />Authenticating...</> : 'Sign In'}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Demonstration Credentials</span>
              </div>
            </div>

            <div className="mt-6">
              <div className="rounded-md bg-gray-50 p-3 space-y-1">
                <p className="text-sm font-medium text-gray-700">Email: <span className="font-mono">admin@example.com</span></p>
                <p className="text-sm font-medium text-gray-700">Password: <span className="font-mono">admin123</span></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
