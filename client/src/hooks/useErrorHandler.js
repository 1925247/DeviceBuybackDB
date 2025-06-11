import { useState, useCallback, useEffect } from 'react';

export const useErrorHandler = () => {
  const [errors, setErrors] = useState([]);
  const [isHandling, setIsHandling] = useState(false);

  // Add error to the queue
  const reportError = useCallback((error, context = {}) => {
    const errorId = `err_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    
    const enrichedError = {
      id: errorId,
      message: error.message || 'Unknown error',
      type: error.type || 'general',
      status: error.status || error.code,
      timestamp: new Date().toISOString(),
      context: {
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: Date.now(),
        ...context
      },
      stack: error.stack,
      retryCount: 0,
      dismissed: false
    };

    setErrors(prev => [...prev, enrichedError]);
    
    // Log to console for debugging
    console.error('Error reported:', enrichedError);
    
    // Send to error tracking service
    sendErrorToTracking(enrichedError);
    
    return errorId;
  }, []);

  // Remove error from queue
  const dismissError = useCallback((errorId) => {
    setErrors(prev => prev.filter(error => error.id !== errorId));
  }, []);

  // Clear all errors
  const clearErrors = useCallback(() => {
    setErrors([]);
  }, []);

  // Retry function for recoverable errors
  const retryError = useCallback(async (errorId, retryFunction) => {
    setIsHandling(true);
    
    try {
      const error = errors.find(e => e.id === errorId);
      if (!error) return false;

      // Update retry count
      setErrors(prev => prev.map(e => 
        e.id === errorId 
          ? { ...e, retryCount: e.retryCount + 1 }
          : e
      ));

      // Execute retry function
      const result = await retryFunction();
      
      // If successful, remove error
      if (result) {
        dismissError(errorId);
      }
      
      return result;
    } catch (retryError) {
      // If retry fails, report new error
      reportError(retryError, { originalErrorId: errorId, isRetry: true });
      return false;
    } finally {
      setIsHandling(false);
    }
  }, [errors, dismissError, reportError]);

  // Send error to tracking service
  const sendErrorToTracking = async (error) => {
    try {
      await fetch('/api/error-reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          errorId: error.id,
          message: error.message,
          type: error.type,
          status: error.status,
          stack: error.stack,
          context: error.context,
          timestamp: error.timestamp
        })
      });
    } catch (trackingError) {
      console.error('Failed to send error to tracking:', trackingError);
    }
  };

  // Get error statistics
  const getErrorStats = useCallback(() => {
    const stats = {
      total: errors.length,
      byType: {},
      byStatus: {},
      recent: errors.filter(e => 
        Date.now() - new Date(e.timestamp).getTime() < 5 * 60 * 1000 // Last 5 minutes
      ).length
    };

    errors.forEach(error => {
      stats.byType[error.type] = (stats.byType[error.type] || 0) + 1;
      stats.byStatus[error.status] = (stats.byStatus[error.status] || 0) + 1;
    });

    return stats;
  }, [errors]);

  // Auto-dismiss old errors
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setErrors(prev => prev.filter(error => {
        const errorAge = now - new Date(error.timestamp).getTime();
        const maxAge = 10 * 60 * 1000; // 10 minutes
        return errorAge < maxAge;
      }));
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  return {
    errors: errors.filter(e => !e.dismissed),
    reportError,
    dismissError,
    clearErrors,
    retryError,
    isHandling,
    getErrorStats
  };
};

// Error boundary hook for functional components
export const useErrorBoundary = () => {
  const [error, setError] = useState(null);

  const resetError = useCallback(() => {
    setError(null);
  }, []);

  const captureError = useCallback((error, errorInfo = {}) => {
    setError({
      error,
      errorInfo,
      timestamp: new Date().toISOString()
    });
  }, []);

  // Listen for unhandled promise rejections
  useEffect(() => {
    const handleUnhandledRejection = (event) => {
      captureError(event.reason, { type: 'unhandledRejection' });
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    
    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [captureError]);

  return {
    error,
    resetError,
    captureError
  };
};

// Network error detection hook
export const useNetworkErrorHandler = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [connectionQuality, setConnectionQuality] = useState('unknown');
  const { reportError } = useErrorHandler();

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setConnectionQuality('good');
    };

    const handleOffline = () => {
      setIsOnline(false);
      setConnectionQuality('offline');
      reportError(
        new Error('Network connection lost'), 
        { type: 'network', severity: 'high' }
      );
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Test connection quality periodically
    const testConnection = async () => {
      if (!navigator.onLine) return;

      try {
        const start = performance.now();
        const response = await fetch('/api/health', { 
          method: 'HEAD',
          cache: 'no-cache',
          signal: AbortSignal.timeout(5000)
        });
        const latency = performance.now() - start;

        if (response.ok) {
          if (latency < 200) setConnectionQuality('excellent');
          else if (latency < 500) setConnectionQuality('good');
          else if (latency < 1000) setConnectionQuality('fair');
          else setConnectionQuality('poor');
        } else {
          setConnectionQuality('poor');
        }
      } catch (error) {
        setConnectionQuality('poor');
        reportError(error, { type: 'network', latencyTest: true });
      }
    };

    // Test connection every 30 seconds
    const interval = setInterval(testConnection, 30000);
    testConnection(); // Initial test

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, [reportError]);

  return {
    isOnline,
    connectionQuality,
    isConnectionPoor: connectionQuality === 'poor' || connectionQuality === 'offline'
  };
};

export default useErrorHandler;