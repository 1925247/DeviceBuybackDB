import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, AlertTriangle, CheckCircle } from 'lucide-react';

const NetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showStatus, setShowStatus] = useState(false);
  const [hasBeenOffline, setHasBeenOffline] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (hasBeenOffline) {
        setShowStatus(true);
        setTimeout(() => setShowStatus(false), 5000);
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      setHasBeenOffline(true);
      setShowStatus(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [hasBeenOffline]);

  if (!showStatus) return null;

  return (
    <div className={`fixed top-4 right-4 max-w-sm rounded-lg shadow-lg p-4 z-50 ${
      isOnline ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
    } border`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          {isOnline ? (
            <CheckCircle className="h-5 w-5 text-green-600" />
          ) : (
            <WifiOff className="h-5 w-5 text-red-600" />
          )}
        </div>
        <div className="ml-3 flex-1">
          <h3 className={`text-sm font-medium ${
            isOnline ? 'text-green-800' : 'text-red-800'
          }`}>
            {isOnline ? 'Connection Restored' : 'No Internet Connection'}
          </h3>
          <p className={`mt-1 text-sm ${
            isOnline ? 'text-green-800' : 'text-red-800'
          } opacity-90`}>
            {isOnline 
              ? 'Your internet connection has been restored.'
              : 'Please check your internet connection and try again.'
            }
          </p>
        </div>
        <button
          onClick={() => setShowStatus(false)}
          className={`ml-2 opacity-60 hover:opacity-80 ${
            isOnline ? 'text-green-800' : 'text-red-800'
          }`}
        >
          <span className="sr-only">Close</span>
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default NetworkStatus;