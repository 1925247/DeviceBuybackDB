import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import LoadingSpinner from './LoadingSpinner';

interface PageTransitionProps {
  children: React.ReactNode;
}

/**
 * A component that provides smooth transitions between pages
 * Shows a loading spinner briefly when navigating between routes
 */
const PageTransition: React.FC<PageTransitionProps> = ({ children }) => {
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    // Show loading state
    setIsLoading(true);
    
    // Hide loading state after a short delay
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 400); // Adjust timing for optimal experience
    
    return () => clearTimeout(timer);
  }, [location.pathname]);

  return (
    <div className="relative min-h-full">
      {isLoading ? (
        <div className="absolute inset-0 bg-white bg-opacity-80 z-10 flex items-center justify-center">
          <LoadingSpinner size="md" withText={true} />
        </div>
      ) : null}
      <div className={`transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
        {children}
      </div>
    </div>
  );
};

export default PageTransition;