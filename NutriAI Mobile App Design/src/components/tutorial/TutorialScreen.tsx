import React, { useState } from 'react';
import { XIcon, ChevronRightIcon, ChevronLeftIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/Button';
import { hapticFeedback } from '../../utils/haptics';
import { useTheme } from '../../utils/theme';
interface TutorialScreenProps {
  onComplete: () => void;
}
export const TutorialScreen: React.FC<TutorialScreenProps> = ({
  onComplete
}) => {
  const {
    colors,
    isDark
  } = useTheme();
  const [currentStep, setCurrentStep] = useState(0);
  const tutorialSteps = [{
    title: 'Track Your Meals',
    description: 'Log your meals using the + button. Take a photo, scan a barcode, or describe what you ate using our AI assistant.',
    image: 'https://images.unsplash.com/photo-1484723091739-30a097e8f929?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    color: '#42A5F5'
  }, {
    title: 'Monitor Your Progress',
    description: 'Check your daily summary on the home screen. See your calories, macros, and progress towards your goals.',
    image: 'https://images.unsplash.com/photo-1589391886645-d51941baf7fb?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    color: '#66BB6A'
  }, {
    title: 'Get Personalized Insights',
    description: 'Receive AI-powered insights about your nutrition habits and tips to improve your diet.',
    image: 'https://images.unsplash.com/photo-1550592704-6c76defa9985?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    color: '#FFA726'
  }, {
    title: "You're All Set!",
    description: "Start your journey to better nutrition today. Let's log your first meal!",
    image: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    color: '#FF5252'
  }];
  const handleNext = () => {
    hapticFeedback.selection();
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };
  const handlePrevious = () => {
    hapticFeedback.selection();
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };
  const handleComplete = () => {
    hapticFeedback.success();
    onComplete();
  };
  const currentColor = tutorialSteps[currentStep].color;
  return <motion.div className="fixed inset-0 bg-white dark:bg-gray-900 z-50 flex flex-col" initial={{
    opacity: 0
  }} animate={{
    opacity: 1
  }} exit={{
    opacity: 0
  }}>
      <div className="relative flex-1 flex flex-col">
        <motion.button className="absolute top-12 right-4 z-10 w-10 h-10 rounded-full bg-white/20 dark:bg-black/20 backdrop-blur-md flex items-center justify-center" onClick={handleComplete} whileHover={{
        scale: 1.1
      }} whileTap={{
        scale: 0.9
      }}>
          <XIcon size={20} className="text-gray-700 dark:text-gray-300" />
        </motion.button>
        <AnimatePresence mode="wait">
          <motion.div key={currentStep} className="flex-1 flex flex-col" initial={{
          opacity: 0,
          x: 100
        }} animate={{
          opacity: 1,
          x: 0
        }} exit={{
          opacity: 0,
          x: -100
        }} transition={{
          type: 'tween',
          duration: 0.3
        }}>
            <div className="relative flex-1">
              <div className="absolute inset-0">
                <img src={tutorialSteps[currentStep].image} alt={tutorialSteps[currentStep].title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/70" />
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                <motion.h1 className="text-3xl font-bold mb-2" initial={{
                opacity: 0,
                y: 20
              }} animate={{
                opacity: 1,
                y: 0
              }} transition={{
                delay: 0.2
              }}>
                  {tutorialSteps[currentStep].title}
                </motion.h1>
                <motion.p className="text-white/90" initial={{
                opacity: 0,
                y: 20
              }} animate={{
                opacity: 1,
                y: 0
              }} transition={{
                delay: 0.3
              }}>
                  {tutorialSteps[currentStep].description}
                </motion.p>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
        <div className="p-6 pb-10">
          <div className="flex justify-between items-center mb-6">
            {currentStep > 0 ? <motion.button className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center" onClick={handlePrevious} whileHover={{
            scale: 1.1
          }} whileTap={{
            scale: 0.9
          }}>
                <ChevronLeftIcon size={20} className="text-gray-700 dark:text-gray-300" />
              </motion.button> : <div className="w-10" />}
            <div className="flex space-x-2">
              {tutorialSteps.map((_, index) => <motion.div key={index} className={`w-2 h-2 rounded-full ${currentStep === index ? 'bg-[#320DFF] dark:bg-[#6D56FF]' : 'bg-gray-300 dark:bg-gray-700'}`} initial={{
              scale: 0.8
            }} animate={{
              scale: currentStep === index ? 1.2 : 0.8,
              backgroundColor: currentStep === index ? currentColor : isDark ? '#374151' : '#D1D5DB'
            }} transition={{
              duration: 0.3
            }} />)}
            </div>
            {currentStep < tutorialSteps.length - 1 ? <motion.button className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center" onClick={handleNext} whileHover={{
            scale: 1.1
          }} whileTap={{
            scale: 0.9
          }}>
                <ChevronRightIcon size={20} className="text-gray-700 dark:text-gray-300" />
              </motion.button> : <div className="w-10" />}
          </div>
          <Button variant="primary" fullWidth onClick={currentStep < tutorialSteps.length - 1 ? handleNext : handleComplete} style={{
          backgroundColor: currentColor,
          borderColor: currentColor
        }}>
            {currentStep < tutorialSteps.length - 1 ? 'Next' : 'Get Started'}
          </Button>
        </div>
      </div>
    </motion.div>;
};