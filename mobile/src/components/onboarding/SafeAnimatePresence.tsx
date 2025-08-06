import React, { useRef, useEffect } from 'react';
import { AnimatePresence, AnimatePresenceProps } from 'moti';

/**
 * A wrapper around AnimatePresence that prevents context loss during animations.
 * Use this in components that depend on React Context to avoid "context not found" errors.
 */
export const SafeAnimatePresence: React.FC<AnimatePresenceProps> = ({
  children,
  mode = 'wait', // Default to 'wait' instead of deprecated 'exitBeforeEnter'
  ...props
}) => {
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Ensure we're using the newer 'mode' prop instead of deprecated 'exitBeforeEnter'
  const safeProps = {
    ...props,
    mode,
    // Remove any accidentally passed exitBeforeEnter prop
    exitBeforeEnter: undefined,
  };

  return (
    <AnimatePresence {...safeProps}>
      {isMountedRef.current ? children : null}
    </AnimatePresence>
  );
};

export default SafeAnimatePresence;
