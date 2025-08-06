import React from 'react';
import { motion } from 'framer-motion';
interface GlassMorphismProps {
  children: React.ReactNode;
  className?: string;
  intensity?: 'light' | 'medium' | 'heavy';
  color?: string;
  rounded?: boolean;
  border?: boolean;
}
export const GlassMorphism: React.FC<GlassMorphismProps> = ({
  children,
  className = '',
  intensity = 'medium',
  color = '#ffffff',
  rounded = true,
  border = true
}) => {
  // Intensity variants
  const intensityVariants = {
    light: 'bg-opacity-20 backdrop-blur-sm',
    medium: 'bg-opacity-30 backdrop-blur-md',
    heavy: 'bg-opacity-40 backdrop-blur-lg'
  };
  // Construct the background color with opacity
  const bgColor = color === '#ffffff' ? 'bg-white' : `bg-[${color}]`;
  return <motion.div className={`${bgColor} ${intensityVariants[intensity]} ${rounded ? 'rounded-xl' : ''} ${border ? 'border border-white/20' : ''} ${className} overflow-hidden`} initial={{
    opacity: 0
  }} animate={{
    opacity: 1
  }} transition={{
    duration: 0.3
  }}>
      {children}
    </motion.div>;
};