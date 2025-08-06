import { useRef, useEffect, useCallback } from 'react';

/**
 * A custom hook that debounces a callback with a leading-edge execution.
 * The callback is fired immediately on the first call, and then subsequent
 * calls are ignored until after the specified delay has passed.
 *
 * @param callback The function to debounce.
 * @param delay The debounce delay in milliseconds.
 */
export const useLeadingDebounce = (
  callback: (...args: any[]) => void,
  delay: number
) => {
  const callbackRef = useRef(callback);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Always use the latest callback instance without re-creating the debounce function
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  // Cleanup the timer when the component unmounts
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return useCallback(
    (...args: any[]) => {
      // If no timer is running, execute the callback immediately
      if (!timeoutRef.current) {
        callbackRef.current(...args);
      }

      // Clear any existing timer
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Set a new timer to reset the debounce state after the delay
      timeoutRef.current = setTimeout(() => {
        timeoutRef.current = null;
      }, delay);
    },
    [delay]
  );
};
