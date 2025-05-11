import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface Purchase {
  id: number;
  item: string;
  date: string;
  amount: number;
}

const samplePurchases: Purchase[] = [
  { id: 1, item: 'iPhone 14 Pro', date: '2025-01-10', amount: 1200 },
  { id: 2, item: 'Samsung Galaxy S24', date: '2025-02-15', amount: 999 },
  { id: 3, item: 'MacBook Air M3', date: '2025-03-05', amount: 1500 },
];

const UserLogin: React.FC = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState('sampleUser');
  const [email, setEmail] = useState('sample@example.com');
  const [password, setPassword] = useState('Password123');
  const [confirmPassword, setConfirmPassword] = useState('Password123');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [communicationMode, setCommunicationMode] = useState('Email');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isRegistering) {
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
      console.log('Registering with:', { userId, email, password, communicationMode });
    } else {
      console.log('Logging in with:', { userId, password });
    }
    setError('');
    setIsLoggedIn(true);
  };

  if (isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 to-blue-200 p-4">
        <div className="max-w-2xl w-full bg-white p-8 rounded-2xl shadow-2xl space-y-6">
          <h2 className="text-center text-3xl font-bold text-indigo-700">Welcome, {userId}!</h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Profile Details</h3>
              <p><strong>User ID:</strong> {userId}</p>
              <p><strong>Email:</strong> {email}</p>
              <p><strong>Preferred Communication:</strong> {communicationMode}</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-800 mt-6">Purchase History</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white">
                  <thead>
                    <tr>
                      <th className="py-2 px-4 border-b text-left">Item</th>
                      <th className="py-2 px-4 border-b text-left">Date</th>
                      <th className="py-2 px-4 border-b text-left">Amount ($)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {samplePurchases.map((purchase) => (
                      <tr key={purchase.id}>
                        <td className="py-2 px-4 border-b">{purchase.item}</td>
                        <td className="py-2 px-4 border-b">{purchase.date}</td>
                        <td className="py-2 px-4 border-b">{purchase.amount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="text-center mt-6">
            <button
              onClick={() => setIsLoggedIn(false)}
              className="text-indigo-600 hover:text-indigo-500 text-sm font-medium"
            >
              Log Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 to-blue-200 p-4">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-2xl space-y-6">
        <h2 className="text-center text-3xl font-bold text-indigo-700">
          {isRegistering ? 'Create an Account' : 'Sign In'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          {isRegistering && (
            <div>
              <label className="block text-sm font-medium text-gray-700">User ID</label>
              <input
                type="text"
                placeholder="Enter User ID"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700">Email Address</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2"
              required
            />
          </div>

          <div className="relative">
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2 pr-10"
              required
            />
            <div
              className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </div>
          </div>

          {isRegistering && (
            <>
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2 pr-10"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Preferred Communication</label>
                <select
                  value={communicationMode}
                  onChange={(e) => setCommunicationMode(e.target.value)}
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2"
                  required
                >
                  <option>Email</option>
                  <option>SMS</option>
                  <option>WhatsApp</option>
                </select>
              </div>
            </>
          )}

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <button
            type="submit"
            className="w-full py-2 px-4 border border-transparent rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 font-semibold"
          >
            {isRegistering ? 'Register' : 'Sign In'}
          </button>
        </form>

        <div className="text-center">
          <button
            type="button"
            onClick={() => setIsRegistering(!isRegistering)}
            className="text-indigo-600 hover:text-indigo-500 text-sm mt-4 font-medium"
          >
            {isRegistering
              ? 'Already have an account? Sign in'
              : "Don't have an account? Register"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserLogin;
