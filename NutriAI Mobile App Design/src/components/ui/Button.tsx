import React from 'react';
import { motion } from 'framer-motion';
import { hapticFeedback } from '../../utils/haptics';
interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  fullWidth?: boolean;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  type?: 'button' | 'submit' | 'reset';
  className?: string;
}
export const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  fullWidth = false,
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  type = 'button',
  className = ''
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return 'bg-[#320DFF] dark:bg-[#6D56FF] text-white border-transparent hover:bg-[#2A0BD5] dark:hover:bg-[#5A46D5]';
      case 'secondary':
        return 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700';
      case 'outline':
        return 'bg-transparent text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800';
      case 'danger':
        return 'bg-red-500 dark:bg-red-600 text-white border-transparent hover:bg-red-600 dark:hover:bg-red-700';
      default:
        return 'bg-[#320DFF] dark:bg-[#6D56FF] text-white border-transparent hover:bg-[#2A0BD5] dark:hover:bg-[#5A46D5]';
    }
  };
  const handleClick = () => {
    if (!disabled && !loading && onClick) {
      hapticFeedback.selection();
      onClick();
    }
  };
  return <motion.button type={type} className={`flex items-center justify-center px-6 py-4 rounded-full font-medium border transition-colors ${fullWidth ? 'w-full' : ''} ${getVariantStyles()} ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${className}`} onClick={handleClick} disabled={disabled || loading} whileHover={!disabled && !loading ? {
    scale: 1.02
  } : {}} whileTap={!disabled && !loading ? {
    scale: 0.98
  } : {}}>
      {loading ? <div className="flex items-center space-x-2">
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          <span>Loading...</span>
        </div> : <>
          {icon && iconPosition === 'left' && <span className="mr-2">{icon}</span>}
          {children}
          {icon && iconPosition === 'right' && <span className="ml-2">{icon}</span>}
        </>}
    </motion.button>;
};