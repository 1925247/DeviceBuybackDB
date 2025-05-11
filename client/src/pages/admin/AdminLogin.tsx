import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminLogin: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username || !password) {
      setError('Please enter both username and password');
      return;
    }

    try {
      // Check for hard-coded admin credentials (for development)
      if ((username === 'admin@gadgetswap.com' && password === 'admin123') ||
          (username === 'test@example.com' && password === 'hashed_password')) {
        // Store the token and user info
        const adminData = {
          id: username === 'admin@gadgetswap.com' ? 2 : 1,
          email: username,
          firstName: 'Admin',
          lastName: 'User',
          role: 'admin'
        };
        
        // Store in both session and local storage for persistence
        sessionStorage.setItem('adminToken', 'admin-token-123');
        sessionStorage.setItem('adminData', JSON.stringify(adminData));
        
        // For persistence across browser restarts
        localStorage.setItem('adminToken', 'admin-token-123');
        localStorage.setItem('adminData', JSON.stringify(adminData));
        
        navigate('/admin');
      } else {
        // In production, this would call an API
        // const response = await fetch('/api/admin/login', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify({ email: username, password })
        // });
        
        // if (response.ok) {
        //   const data = await response.json();
        //   sessionStorage.setItem('adminToken', data.token);
        //   sessionStorage.setItem('adminData', JSON.stringify(data.user));
        //   navigate('/admin');
        // } else {
        //   setError('Invalid username or password');
        // }
        
        setError('Invalid username or password. Please use admin@gadgetswap.com with password admin123');
      }
    } catch (err) {
      setError('Login failed. Please try again.');
      console.error('Login error:', err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Admin Login
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="username" className="sr-only">
                Email Address
              </label>
              <input
                id="username"
                name="username"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Email Address (admin@gadgetswap.com)"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Password (admin123)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center">{error}</div>
          )}

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Sign in
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;