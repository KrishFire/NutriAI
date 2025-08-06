import React from 'react';
import { motion } from 'framer-motion';
interface PageTransitionProps {
  children: React.ReactNode;
  direction?: 'left' | 'right' | 'up' | 'down' | 'fade' | 'scale';
  duration?: number;
}
export const PageTransition: React.FC<PageTransitionProps> = ({
  children,
  direction = 'fade',
  duration = 0.4
}) => {
  // Define variants for different transition types
  const variants = {
    left: {
      initial: {
        x: 100,
        opacity: 0
      },
      animate: {
        x: 0,
        opacity: 1
      },
      exit: {
        x: -100,
        opacity: 0
      }
    },
    right: {
      initial: {
        x: -100,
        opacity: 0
      },
      animate: {
        x: 0,
        opacity: 1
      },
      exit: {
        x: 100,
        opacity: 0
      }
    },
    up: {
      initial: {
        y: 100,
        opacity: 0
      },
      animate: {
        y: 0,
        opacity: 1
      },
      exit: {
        y: -100,
        opacity: 0
      }
    },
    down: {
      initial: {
        y: -100,
        opacity: 0
      },
      animate: {
        y: 0,
        opacity: 1
      },
      exit: {
        y: 100,
        opacity: 0
      }
    },
    fade: {
      initial: {
        opacity: 0
      },
      animate: {
        opacity: 1
      },
      exit: {
        opacity: 0
      }
    },
    scale: {
      initial: {
        scale: 0.9,
        opacity: 0
      },
      animate: {
        scale: 1,
        opacity: 1
      },
      exit: {
        scale: 0.9,
        opacity: 0
      }
    }
  };
  return <motion.div variants={variants[direction]} initial="initial" animate="animate" exit="exit" transition={{
    type: 'spring',
    stiffness: 300,
    damping: 30,
    duration
  }} className="w-full h-full">
      {children}
    </motion.div>;
};