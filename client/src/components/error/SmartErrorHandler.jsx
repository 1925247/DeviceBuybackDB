import React, { useState, useEffect } from 'react';
import { AlertTriangle, X, RefreshCw, Wifi, Server } from 'lucide-react';

const SmartErrorHandler = ({ error, onRetry, onDismiss, context = {} }) => {
  const [isRetrying, setIsRetrying] = useState(false);

  const getErrorAnalysis = () => {
    if (!error) return null;

    const errorMessage = error.message?.toLowerCase() || '';

    if (errorMessage.includes('fetch') || errorMessage.includes('network')) {
      return {
        title: 'Connection Problem',
        description: 'Unable to reach our servers. This might be temporary.',
        icon: Wifi,
        color: 'orange',
        solutions: [
          'Check your internet connection',
          'Try refreshing the page',
          'Wait a moment and try again'
        ]
      };
    }

    return {
      title: 'Unexpected Error',
      description: 'Something went wrong. We\'ve been notified and are looking into it.',
      icon: AlertTriangle,
      color: 'gray',
      solutions: [
        'Try refreshing the page',
        'Clear your browser cache',
        'Contact support if this continues'
      ]
    };
  };

  const handleRetry = async () => {
    if (isRetrying) return;
    
    setIsRetrying(true);
    try {
      await onRetry?.();
    } finally {
      setIsRetrying(false);
    }
  };

  if (!error) return null;

  const analysis = getErrorAnalysis();
  if (!analysis) return null;

  const IconComponent = analysis.icon;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center">
            <div className={`p-2 rounded-full bg-${analysis.color}-100 mr-3`}>
              <IconComponent className={`h-6 w-6 text-${analysis.color}-600`} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {analysis.title}
              </h3>
              <p className="text-sm text-gray-600">
                {analysis.description}
              </p>
            </div>
          </div>
          <button
            onClick={onDismiss}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          <h4 className="font-medium text-gray-900 mb-3">Suggested Solutions:</h4>
          <ul className="space-y-2 mb-6">
            {analysis.solutions.map((solution, index) => (
              <li key={index} className="flex items-start">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium mr-3 mt-0.5">
                  {index + 1}
                </span>
                <span className="text-gray-700 text-sm">{solution}</span>
              </li>
            ))}
          </ul>

          <div className="flex space-x-3">
            <button
              onClick={handleRetry}
              disabled={isRetrying}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center"
            >
              {isRetrying ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Retrying...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </>
              )}
            </button>
            <button
              onClick={onDismiss}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmartErrorHandler;