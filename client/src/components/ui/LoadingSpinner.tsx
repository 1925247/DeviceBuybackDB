import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * A reusable loading spinner component with configurable size
 */
const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  className = ''
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-4',
    lg: 'w-12 h-12 border-4'
  };

  return (
    <div className={`w-full h-40 flex items-center justify-center ${className}`}>
      <div 
        className={`${sizeClasses[size]} border-primary border-t-transparent rounded-full animate-spin`} 
        aria-label="Loading"
      />
    </div>
  );
};

export default LoadingSpinner;