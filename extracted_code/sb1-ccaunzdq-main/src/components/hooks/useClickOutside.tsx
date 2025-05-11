// src/components/hooks/useClickOutside.tsx
import { RefObject, useEffect, useRef } from 'react';

/**
 * Custom hook that detects clicks outside a specified element
 * @param handler - Function to call when click outside is detected
 * @returns React ref to be attached to the target element
 */
export const useClickOutside = <T extends HTMLElement>(
  handler: () => void
): RefObject<T> => {
  const ref = useRef<T>(null);

  useEffect(() => {
    const handleClick = (event: MouseEvent | TouchEvent) => {
      // Do nothing if clicking ref's element or descendent elements
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return;
      }
      handler();
    };

    // Add event listeners for both mouse and touch events
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('touchstart', handleClick);

    // Cleanup function
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('touchstart', handleClick);
    };
  }, [handler]); // Re-run effect if handler changes

  return ref;
};

// Optional default export for convenience
export default useClickOutside;