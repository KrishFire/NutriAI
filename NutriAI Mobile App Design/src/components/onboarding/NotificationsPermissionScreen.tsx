import React from 'react';
import { ArrowLeftIcon, BellIcon } from 'lucide-react';
import { Button } from '../ui/Button';
import { motion } from 'framer-motion';
import { hapticFeedback } from '../../utils/haptics';
interface NotificationsPermissionScreenProps {
  onBack: () => void;
  onAllow: () => void;
  onSkip: () => void;
}
export const NotificationsPermissionScreen: React.FC<NotificationsPermissionScreenProps> = ({
  onBack,
  onAllow,
  onSkip
}) => {
  const handleAllow = () => {
    hapticFeedback.selection();
    // In a real app, we would request notification permissions here
    onAllow();
  };
  const handleSkip = () => {
    hapticFeedback.selection();
    onSkip();
  };
  return <div className="flex flex-col min-h-screen bg-white p-6">
      <div className="flex items-center mb-8">
        <motion.button className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center" onClick={onBack} whileHover={{
        scale: 1.05
      }} whileTap={{
        scale: 0.95
      }}>
          <ArrowLeftIcon size={20} />
        </motion.button>
      </div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-3">
          Stay on track with reminders
        </h1>
        <p className="text-gray-600 text-lg">
          Get helpful notifications to log meals and track your progress
        </p>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center mb-10">
        <motion.div className="w-24 h-24 rounded-full bg-[#320DFF]/10 flex items-center justify-center mb-6" initial={{
        scale: 0.8,
        opacity: 0
      }} animate={{
        scale: 1,
        opacity: 1
      }} transition={{
        duration: 0.5
      }}>
          <BellIcon size={40} className="text-[#320DFF]" />
        </motion.div>
        <motion.div className="space-y-3 w-full" initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        duration: 0.5,
        delay: 0.2
      }}>
          <div className="flex items-center p-4 bg-[#320DFF]/5 rounded-xl">
            <div className="w-10 h-10 rounded-full bg-[#320DFF]/20 flex items-center justify-center mr-3">
              <div className="w-4 h-4 rounded-full bg-[#320DFF]"></div>
            </div>
            <div>
              <p className="font-medium">Meal reminders</p>
              <p className="text-sm text-gray-600">
                Never forget to log your meals
              </p>
            </div>
          </div>
          <div className="flex items-center p-4 bg-[#320DFF]/5 rounded-xl">
            <div className="w-10 h-10 rounded-full bg-[#320DFF]/20 flex items-center justify-center mr-3">
              <div className="w-4 h-4 rounded-full bg-[#320DFF]"></div>
            </div>
            <div>
              <p className="font-medium">Progress updates</p>
              <p className="text-sm text-gray-600">
                Stay motivated with your achievements
              </p>
            </div>
          </div>
          <div className="flex items-center p-4 bg-[#320DFF]/5 rounded-xl">
            <div className="w-10 h-10 rounded-full bg-[#320DFF]/20 flex items-center justify-center mr-3">
              <div className="w-4 h-4 rounded-full bg-[#320DFF]"></div>
            </div>
            <div>
              <p className="font-medium">Personalized tips</p>
              <p className="text-sm text-gray-600">
                Get nutrition advice tailored to you
              </p>
            </div>
          </div>
        </motion.div>
      </div>
      <div className="space-y-3">
        <Button onClick={handleAllow} variant="primary" fullWidth>
          Allow Notifications
        </Button>
        <Button onClick={handleSkip} variant="secondary" fullWidth>
          Not Now
        </Button>
      </div>
    </div>;
};