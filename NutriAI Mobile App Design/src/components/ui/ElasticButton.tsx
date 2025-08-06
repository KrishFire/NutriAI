import React from 'react';
import { motion } from 'framer-motion';
interface ElasticButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  className?: string;
  disabled?: boolean;
  color?: 'primary' | 'secondary' | 'white';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  icon?: React.ReactNode;
}
export const ElasticButton: React.FC<ElasticButtonProps> = ({
  children,
  onClick,
  className = '',
  disabled = false,
  color = 'primary',
  size = 'md',
  fullWidth = false,
  icon
}) => {
  // Color variants
  const colorVariants = {
    primary: 'bg-[#320DFF] text-white hover:bg-[#280ACC]',
    secondary: 'bg-[#320DFF]/10 text-[#320DFF] hover:bg-[#320DFF]/20',
    white: 'bg-white text-gray-900 border border-gray-200 hover:bg-gray-50'
  };
  // Size variants
  const sizeVariants = {
    sm: 'text-sm py-2 px-4',
    md: 'text-base py-3 px-6',
    lg: 'text-lg py-4 px-8'
  };
  return <motion.button className={`flex items-center justify-center rounded-full font-medium transition-colors ${colorVariants[color]} ${sizeVariants[size]} ${fullWidth ? 'w-full' : ''} ${className}`} onClick={onClick} disabled={disabled} whileTap={{
    scale: 0.95,
    // Elastic squish effect
    scaleX: 0.9,
    scaleY: 0.98,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 10
    }
  }} whileHover={{
    scale: 1.02,
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 10
    }
  }} initial={{
    opacity: 0.9
  }} animate={{
    opacity: 1
  }}>
      {icon && <span className="mr-2">{icon}</span>}
      {children}
    </motion.button>;
};