import React from 'react';
import { Button } from '../ui/Button';
import { motion } from 'framer-motion';
import { hapticFeedback } from '../../utils/haptics';
import { Berry } from '../ui/Berry';
interface WelcomeScreenProps {
  onGetStarted: () => void;
}
export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  onGetStarted
}) => {
  const handleGetStarted = () => {
    hapticFeedback.impact();
    onGetStarted();
  };
  const handleLogin = () => {
    hapticFeedback.selection();
    // Navigate to login screen
    onGetStarted(); // For now, just go to onboarding
  };
  return <div className="flex flex-col h-full min-h-screen bg-white p-6">
      <div className="flex-1 flex flex-col items-center justify-center">
        <motion.div className="mb-8" initial={{
        scale: 0.8,
        opacity: 0
      }} animate={{
        scale: 1,
        opacity: 1
      }} transition={{
        type: 'spring',
        duration: 0.8
      }}>
          <Berry variant="wave" size="large" />
        </motion.div>
        <motion.h1 className="text-4xl font-bold mb-4 text-center text-gray-900" initial={{
        y: 20,
        opacity: 0
      }} animate={{
        y: 0,
        opacity: 1
      }} transition={{
        delay: 0.2,
        duration: 0.5
      }}>
          Nutrition Tracking Made Easy
        </motion.h1>
        <motion.p className="text-center text-gray-600 text-lg mb-10 max-w-xs" initial={{
        y: 20,
        opacity: 0
      }} animate={{
        y: 0,
        opacity: 1
      }} transition={{
        delay: 0.3,
        duration: 0.5
      }}>
          The smartest way to track your nutrition with AI-powered food
          recognition
        </motion.p>
        <motion.div className="w-full max-w-xs space-y-5 mb-10" initial={{
        y: 20,
        opacity: 0
      }} animate={{
        y: 0,
        opacity: 1
      }} transition={{
        delay: 0.4,
        duration: 0.5
      }}>
          <div className="flex items-center">
            <div className="w-12 h-12 rounded-full bg-[#320DFF]/10 flex items-center justify-center mr-4">
              <div className="w-6 h-6 rounded-full bg-[#320DFF]"></div>
            </div>
            <p className="text-gray-800 text-lg">AI-powered food recognition</p>
          </div>
          <div className="flex items-center">
            <div className="w-12 h-12 rounded-full bg-[#320DFF]/10 flex items-center justify-center mr-4">
              <div className="w-6 h-6 rounded-full bg-[#320DFF]"></div>
            </div>
            <p className="text-gray-800 text-lg">
              Effortless nutrition tracking
            </p>
          </div>
          <div className="flex items-center">
            <div className="w-12 h-12 rounded-full bg-[#320DFF]/10 flex items-center justify-center mr-4">
              <div className="w-6 h-6 rounded-full bg-[#320DFF]"></div>
            </div>
            <p className="text-gray-800 text-lg">Personalized insights</p>
          </div>
        </motion.div>
      </div>
      <motion.div className="mb-8 w-full" initial={{
      y: 20,
      opacity: 0
    }} animate={{
      y: 0,
      opacity: 1
    }} transition={{
      delay: 0.6,
      duration: 0.5
    }}>
        <Button onClick={handleGetStarted} variant="primary" fullWidth>
          Get Started
        </Button>
        <motion.button className="w-full text-center mt-5 text-gray-600 py-2" onClick={handleLogin} whileHover={{
        scale: 1.05
      }} whileTap={{
        scale: 0.95
      }}>
          I already have an account
        </motion.button>
      </motion.div>
    </div>;
};