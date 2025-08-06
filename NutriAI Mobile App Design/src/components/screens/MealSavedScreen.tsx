import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircleIcon } from 'lucide-react';
import { Button } from '../ui/Button';
import { ParticleEffect } from '../ui/ParticleEffect';
import { hapticFeedback } from '../../utils/haptics';
interface MealSavedScreenProps {
  meal: any;
  onContinue: () => void;
}
export const MealSavedScreen: React.FC<MealSavedScreenProps> = ({
  meal,
  onContinue
}) => {
  useEffect(() => {
    hapticFeedback.success();
    // Auto-dismiss after 3 seconds
    const timer = setTimeout(() => {
      onContinue();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onContinue]);
  return <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <motion.div className="bg-white rounded-2xl p-6 w-full max-w-sm mx-4 relative overflow-hidden" initial={{
      scale: 0.8,
      opacity: 0
    }} animate={{
      scale: 1,
      opacity: 1
    }} exit={{
      scale: 0.8,
      opacity: 0
    }} transition={{
      type: 'spring',
      damping: 20
    }}>
        <div className="absolute inset-0 pointer-events-none">
          <ParticleEffect type="confetti" intensity="medium" colors={['#320DFF', '#4F46E5', '#818CF8', '#66BB6A', '#FFA726']} duration={2} />
        </div>
        <div className="flex flex-col items-center text-center mb-4">
          <motion.div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4" initial={{
          scale: 0
        }} animate={{
          scale: 1
        }} transition={{
          delay: 0.2,
          type: 'spring',
          damping: 12
        }}>
            <CheckCircleIcon size={32} className="text-green-500" />
          </motion.div>
          <motion.h2 className="text-xl font-bold mb-2" initial={{
          opacity: 0,
          y: 10
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          delay: 0.3
        }}>
            Meal Saved!
          </motion.h2>
          <motion.p className="text-gray-600 mb-4" initial={{
          opacity: 0,
          y: 10
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          delay: 0.4
        }}>
            Your {meal?.type || 'meal'} has been added to your food log
          </motion.p>
          <motion.div className="bg-gray-50 w-full p-3 rounded-lg mb-4" initial={{
          opacity: 0,
          y: 10
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          delay: 0.5
        }}>
            <p className="font-medium">{meal?.calories || 542} calories</p>
            <div className="flex justify-center space-x-4 text-sm text-gray-500 mt-1">
              <span>P: {meal?.macros?.protein || 28}g</span>
              <span>C: {meal?.macros?.carbs || 62}g</span>
              <span>F: {meal?.macros?.fat || 22}g</span>
            </div>
          </motion.div>
        </div>
        <motion.div initial={{
        opacity: 0
      }} animate={{
        opacity: 1
      }} transition={{
        delay: 0.6
      }}>
          <Button variant="primary" fullWidth onClick={onContinue}>
            Continue
          </Button>
        </motion.div>
      </motion.div>
    </div>;
};