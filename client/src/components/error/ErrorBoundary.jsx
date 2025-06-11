import React, { Component } from 'react';
import { AlertTriangle, RefreshCw, Home, Bug, Copy, CheckCircle } from 'lucide-react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
      reportSent: false,
      showTechnicalDetails: false
    };
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      errorId: `ERR-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`
    };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error,
      errorInfo
    });

    console.error('Error caught by boundary:', error, errorInfo);
    this.sendErrorReport(error, errorInfo);
  }

  sendErrorReport = async (error, errorInfo) => {
    try {
      const errorReport = {
        errorId: this.state.errorId,
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        userId: localStorage.getItem('userId') || 'anonymous'
      };

      await fetch('/api/error-reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(errorReport)
      });

      this.setState({ reportSent: true });
    } catch (reportError) {
      console.error('Failed to send error report:', reportError);
    }
  };

  handleRefresh = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">⚠️</div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Something went wrong
              </h1>
              <p className="text-gray-600">
                We've encountered an unexpected error. Our team has been notified.
              </p>
            </div>

            <div className="bg-gray-100 rounded-lg p-3 mb-6">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Error ID:</span>
                <code className="text-sm font-mono text-gray-800">
                  {this.state.errorId}
                </code>
              </div>
              {this.state.reportSent && (
                <div className="flex items-center mt-2 text-green-600">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  <span className="text-sm">Error report sent automatically</span>
                </div>
              )}
            </div>

            <div className="flex space-x-3 mb-4">
              <button
                onClick={this.handleRefresh}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center justify-center"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Page
              </button>
              <button
                onClick={this.handleGoHome}
                className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 flex items-center justify-center"
              >
                <Home className="h-4 w-4 mr-2" />
                Go Home
              </button>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-500">
                Still having trouble?{' '}
                <a href="/contact-support" className="text-blue-600 hover:underline">
                  Contact Support
                </a>
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;