import React from 'react';
import { motion } from 'framer-motion';
import { CheckIcon } from 'lucide-react';
interface PremiumFeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  highlighted?: boolean;
}
export const PremiumFeatureCard: React.FC<PremiumFeatureCardProps> = ({
  title,
  description,
  icon,
  highlighted = false
}) => {
  return <motion.div className={`p-4 rounded-xl border ${highlighted ? 'border-[#320DFF] bg-[#320DFF]/5 dark:border-[#6D56FF] dark:bg-[#6D56FF]/10' : 'border-gray-200 dark:border-gray-700'} mb-3`} whileHover={{
    scale: 1.02
  }} whileTap={{
    scale: 0.98
  }} initial={{
    opacity: 0,
    y: 20
  }} animate={{
    opacity: 1,
    y: 0
  }} transition={{
    duration: 0.3
  }}>
      <div className="flex items-start">
        <div className={`w-10 h-10 rounded-full ${highlighted ? 'bg-[#320DFF]/10 dark:bg-[#6D56FF]/20' : 'bg-gray-100 dark:bg-gray-800'} flex items-center justify-center mr-3`}>
          {icon}
        </div>
        <div className="flex-1">
          <h3 className={`font-medium ${highlighted ? 'text-[#320DFF] dark:text-[#6D56FF]' : 'text-gray-900 dark:text-white'}`}>
            {title}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {description}
          </p>
        </div>
        {highlighted && <div className="w-6 h-6 rounded-full bg-[#320DFF] dark:bg-[#6D56FF] flex items-center justify-center">
            <CheckIcon size={14} className="text-white" />
          </div>}
      </div>
    </motion.div>;
};