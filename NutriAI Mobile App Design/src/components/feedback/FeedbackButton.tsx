import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageSquareIcon } from 'lucide-react';
import { FeedbackForm } from './FeedbackForm';
import { hapticFeedback } from '../../utils/haptics';
interface FeedbackButtonProps {
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
}
export const FeedbackButton: React.FC<FeedbackButtonProps> = ({
  position = 'bottom-right'
}) => {
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);
  const getPositionClasses = () => {
    switch (position) {
      case 'bottom-right':
        return 'bottom-24 right-4';
      case 'bottom-left':
        return 'bottom-24 left-4';
      case 'top-right':
        return 'top-24 right-4';
      case 'top-left':
        return 'top-24 left-4';
      default:
        return 'bottom-24 right-4';
    }
  };
  const handleOpenFeedback = () => {
    hapticFeedback.selection();
    setShowFeedbackForm(true);
  };
  const handleCloseFeedback = () => {
    setShowFeedbackForm(false);
  };
  const handleSubmitFeedback = (feedback: {
    rating: number;
    comment: string;
    contactInfo?: string;
  }) => {
    console.log('Feedback submitted:', feedback);
    setShowFeedbackForm(false);
    setShowThankYou(true);
    // Hide thank you message after 3 seconds
    setTimeout(() => {
      setShowThankYou(false);
    }, 3000);
  };
  return <>
      <motion.button className={`fixed ${getPositionClasses()} z-40 w-12 h-12 rounded-full bg-[#320DFF] dark:bg-[#6D56FF] shadow-lg flex items-center justify-center`} whileHover={{
      scale: 1.1
    }} whileTap={{
      scale: 0.9
    }} onClick={handleOpenFeedback}>
        <MessageSquareIcon size={20} className="text-white" />
      </motion.button>
      {showFeedbackForm && <FeedbackForm onClose={handleCloseFeedback} onSubmit={handleSubmitFeedback} />}
      {showThankYou && <motion.div className="fixed bottom-24 left-4 right-4 max-w-md mx-auto bg-[#320DFF] dark:bg-[#6D56FF] text-white px-4 py-3 rounded-xl shadow-lg z-50" initial={{
      y: 50,
      opacity: 0
    }} animate={{
      y: 0,
      opacity: 1
    }} exit={{
      y: 50,
      opacity: 0
    }}>
          Thank you for your feedback! We appreciate your input.
        </motion.div>}
    </>;
};