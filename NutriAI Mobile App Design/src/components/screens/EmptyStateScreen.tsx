import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '../ui/Button';
import { Berry } from '../ui/Berry';
interface EmptyStateScreenProps {
  title: string;
  description: string;
  buttonText: string;
  onAction: () => void;
}
export const EmptyStateScreen: React.FC<EmptyStateScreenProps> = ({
  title,
  description,
  buttonText,
  onAction
}) => {
  return <div className="flex flex-col items-center justify-center min-h-[400px] p-6">
      <motion.div initial={{
      opacity: 0,
      y: 20
    }} animate={{
      opacity: 1,
      y: 0
    }} transition={{
      duration: 0.5
    }} className="text-center">
        <div className="mb-6">
          <Berry variant="wave" size="large" />
        </div>
        <h2 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">
          {title}
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-xs mx-auto">
          {description}
        </p>
        <Button variant="primary" onClick={onAction}>
          {buttonText}
        </Button>
      </motion.div>
    </div>;
};