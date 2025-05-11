import React, { ErrorInfo, ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export default class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // You can also log to an external error‑tracking service here
    console.error('ErrorBoundary caught an error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      // Fallback UI
      return (
        <div className="p-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Something went wrong</h1>
          <p>We couldn’t load the admin panel. Try refreshing or come back later.</p>
        </div>
      );
    }

    // When there's no error, render children normally
    return this.props.children;
  }
}
