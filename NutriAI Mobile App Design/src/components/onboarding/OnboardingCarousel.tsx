import React, { useState } from 'react';
import { ChevronRightIcon, ChevronLeftIcon, XIcon } from 'lucide-react';
import { Button } from '../ui/Button';
import { motion, AnimatePresence } from 'framer-motion';
import { hapticFeedback } from '../../utils/haptics';
interface OnboardingCarouselProps {
  onComplete: () => void;
  onSkip: () => void;
}
export const OnboardingCarousel: React.FC<OnboardingCarouselProps> = ({
  onComplete,
  onSkip
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const slides = [{
    title: 'Just Take a Photo',
    description: 'Our AI instantly identifies your meals and calculates nutrition',
    illustration: <div className="w-full h-72 flex items-center justify-center bg-[#320DFF]/5 rounded-3xl mb-8">
          <img src="/berry_taking_picture.png" alt="Camera food logging" className="h-full w-full rounded-2xl object-contain shadow-lg" />
        </div>
  }, {
    title: 'Log Your Way',
    description: 'Snap, speak, scan, or search - whatever works for you',
    illustration: <div className="w-full h-72 flex items-center justify-center bg-[#320DFF]/5 rounded-3xl mb-8">
          <img src="/berry_using_voicetext.png" alt="Multiple logging methods" className="h-full w-full rounded-2xl object-contain shadow-lg" />
        </div>
  }, {
    title: 'Reach Your Goals',
    description: 'Get personalized insights and celebrate your progress',
    illustration: <div className="w-full h-72 flex items-center justify-center bg-[#320DFF]/5 rounded-3xl mb-8">
          <img src="/Download_berry_goals_whiteeyes.png" alt="Progress tracking" className="h-full w-full rounded-2xl object-contain shadow-lg" />
        </div>
  }];
  const handleNext = () => {
    hapticFeedback.selection();
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      hapticFeedback.impact();
      onComplete();
    }
  };
  const handlePrev = () => {
    hapticFeedback.selection();
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };
  const handleSkip = () => {
    hapticFeedback.selection();
    onSkip();
  };
  return <div className="flex flex-col min-h-screen bg-white p-6 font-sans">
      <div className="flex justify-between items-center mb-8">
        {currentSlide > 0 ? <motion.button className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center" onClick={handlePrev} whileHover={{
        scale: 1.05
      }} whileTap={{
        scale: 0.95
      }}>
            <ChevronLeftIcon size={20} />
          </motion.button> : <div className="w-10"></div>}
        <div className="flex space-x-2">
          {slides.map((_, index) => <div key={index} className={`w-2.5 h-2.5 rounded-full ${index === currentSlide ? 'bg-[#320DFF]' : 'bg-gray-200'}`}></div>)}
        </div>
        <motion.button className="text-sm text-gray-500 font-medium px-3 py-1 rounded-full hover:bg-gray-100" onClick={handleSkip} whileTap={{
        scale: 0.95
      }}>
          Skip
        </motion.button>
      </div>
      <div className="flex-1 flex flex-col">
        <AnimatePresence mode="wait">
          <motion.div key={currentSlide} initial={{
          opacity: 0,
          x: 20
        }} animate={{
          opacity: 1,
          x: 0
        }} exit={{
          opacity: 0,
          x: -20
        }} transition={{
          duration: 0.3
        }} className="flex-1 flex flex-col">
            {slides[currentSlide].illustration}
            <h1 className="text-3xl font-bold mb-3 text-center">
              {slides[currentSlide].title}
            </h1>
            <p className="text-center text-gray-600 text-lg mb-12">
              {slides[currentSlide].description}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="flex justify-center items-center">
        <motion.button className="w-16 h-16 rounded-full bg-[#320DFF] flex items-center justify-center shadow-lg" onClick={handleNext} whileHover={{
        scale: 1.05
      }} whileTap={{
        scale: 0.95
      }}>
          <ChevronRightIcon size={28} color="white" />
        </motion.button>
      </div>
    </div>;
};