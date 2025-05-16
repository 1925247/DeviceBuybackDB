import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  fullHeight?: boolean;
  withText?: boolean;
}

/**
 * A reusable loading spinner component with configurable size and appearance
 * 
 * @param size - The size of the spinner: 'sm', 'md', or 'lg'
 * @param className - Additional CSS classes
 * @param fullHeight - Whether the spinner container should take full height
 * @param withText - Whether to show "Loading..." text below the spinner
 */
const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  className = '',
  fullHeight = true,
  withText = false
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4'
  };

  const heightClass = fullHeight ? 'h-40' : '';

  return (
    <div className={`w-full ${heightClass} flex flex-col items-center justify-center ${className}`}>
      <div 
        className={`${sizeClasses[size]} border-primary border-t-transparent rounded-full animate-spin`} 
        aria-label="Loading"
      />
      {withText && (
        <p className="mt-2 text-sm text-gray-600 animate-pulse">Loading...</p>
      )}
    </div>
  );
};

export default LoadingSpinner;