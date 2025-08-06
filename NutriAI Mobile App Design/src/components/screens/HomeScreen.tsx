import React, { useEffect, useState } from 'react';
import { BellIcon, CameraIcon, MicIcon, BarcodeIcon, SearchIcon, MessageSquareIcon } from 'lucide-react';
import { ProgressRing } from '../ui/ProgressRing';
import { MealCard } from '../ui/MealCard';
import { PremiumBanner } from '../premium/PremiumBanner';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassMorphism } from '../ui/GlassMorphism';
import { AnimatedNumber } from '../ui/AnimatedNumber';
import { KineticTypography } from '../ui/KineticTypography';
import { ParticleEffect } from '../ui/ParticleEffect';
import { Berry } from '../ui/Berry';
import { hapticFeedback } from '../../utils/haptics';
import { FeedbackForm } from '../feedback/FeedbackForm';
interface HomeScreenProps {
  onNavigate?: (screen: string, params: any) => void;
}
export const HomeScreen: React.FC<HomeScreenProps> = ({
  onNavigate
}) => {
  // Sample data
  const userData = {
    name: 'Alex',
    streak: 7,
    dailyGoal: 2000,
    consumed: 1450,
    remaining: 550,
    notifications: 3,
    macros: {
      carbs: {
        goal: 250,
        consumed: 180,
        color: '#FFC078' // More muted orange
      },
      protein: {
        goal: 150,
        consumed: 95,
        color: '#74C0FC' // More muted blue
      },
      fat: {
        goal: 65,
        consumed: 48,
        color: '#8CE99A' // More muted green
      }
    }
  };
  const meals = [{
    id: 1,
    type: 'Breakfast',
    time: '8:30 AM',
    calories: 420,
    image: 'https://images.unsplash.com/photo-1494390248081-4e521a5940db?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80',
    macros: {
      carbs: 65,
      protein: 15,
      fat: 12
    }
  }, {
    id: 2,
    type: 'Lunch',
    time: '12:45 PM',
    calories: 650,
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80',
    macros: {
      carbs: 75,
      protein: 45,
      fat: 22
    }
  }, {
    id: 3,
    type: 'Snack',
    time: '3:30 PM',
    calories: 180,
    image: 'https://images.unsplash.com/photo-1470119693884-47d3a1d1f180?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80',
    macros: {
      carbs: 25,
      protein: 5,
      fat: 8
    }
  }];
  const [showParticles, setShowParticles] = useState(false);
  const [animateCalories, setAnimateCalories] = useState(false);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);
  const caloriePercentage = Math.round(userData.consumed / userData.dailyGoal * 100);
  useEffect(() => {
    // Simulate loading calories for animation
    setTimeout(() => {
      setAnimateCalories(true);
    }, 500);
    // Show particles when calories reach a milestone
    if (caloriePercentage >= 50 && !showParticles) {
      setTimeout(() => {
        setShowParticles(true);
      }, 2000);
    }
  }, [caloriePercentage]);
  const handleUpgrade = () => {
    // Handle upgrade to premium
    console.log('Upgrade to premium');
  };
  // Get time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };
  const handleNotificationsClick = () => {
    hapticFeedback.selection();
    if (onNavigate) {
      onNavigate('notifications', {});
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
  return <div className="flex flex-col min-h-screen bg-white pb-20">
      {/* Header */}
      <motion.div className="px-4 pt-12 pb-4 flex justify-between items-center" initial={{
      opacity: 0,
      y: -20
    }} animate={{
      opacity: 1,
      y: 0
    }} transition={{
      duration: 0.5
    }}>
        <div>
          <motion.p className="text-gray-600" initial={{
          opacity: 0
        }} animate={{
          opacity: 1
        }} transition={{
          delay: 0.2
        }}>
            {getGreeting()},
          </motion.p>
          <motion.h1 className="text-2xl font-bold" initial={{
          opacity: 0,
          x: -20
        }} animate={{
          opacity: 1,
          x: 0
        }} transition={{
          delay: 0.3,
          type: 'spring'
        }}>
            {userData.name}
          </motion.h1>
        </div>
        <div className="flex items-center">
          <motion.div className="mr-4 flex items-center bg-[#320DFF]/10 px-2 py-1 rounded-full" initial={{
          scale: 0,
          opacity: 0
        }} animate={{
          scale: 1,
          opacity: 1
        }} transition={{
          delay: 0.4,
          type: 'spring'
        }} whileHover={{
          scale: 1.05
        }} whileTap={{
          scale: 0.95
        }}>
            <Berry variant="streak" size="tiny" className="mr-1" />
            <span className="text-xs font-medium text-[#320DFF]">
              {userData.streak}
            </span>
          </motion.div>
          <motion.button className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 relative" initial={{
          scale: 0,
          opacity: 0
        }} animate={{
          scale: 1,
          opacity: 1
        }} transition={{
          delay: 0.5,
          type: 'spring'
        }} whileHover={{
          scale: 1.1
        }} whileTap={{
          scale: 0.9
        }} onClick={handleNotificationsClick}>
            <BellIcon size={20} className="text-gray-700" />
            {userData.notifications > 0 && <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                {userData.notifications}
              </span>}
          </motion.button>
        </div>
      </motion.div>

      {/* Premium Banner - Only shown occasionally */}
      <motion.div className="px-4 mb-2" initial={{
      opacity: 0,
      y: 20
    }} animate={{
      opacity: 1,
      y: 0
    }} transition={{
      delay: 0.6,
      duration: 0.5
    }}>
        <PremiumBanner onUpgrade={handleUpgrade} />
      </motion.div>

      {/* Daily Progress */}
      <motion.div className="px-4 py-6 bg-white" initial={{
      opacity: 0
    }} animate={{
      opacity: 1
    }} transition={{
      delay: 0.7,
      duration: 0.5
    }}>
        <GlassMorphism className="rounded-3xl p-6 flex flex-col items-center" intensity="light">
          <div className="flex justify-between w-full mb-4">
            <p className="text-gray-500 text-sm">Daily Progress</p>
            <p className="text-sm font-medium">
              {new Date().toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric'
            })}
            </p>
          </div>
          <div className="w-48 h-48 mb-6 relative">
            <ProgressRing percentage={caloriePercentage} color="#320DFF" size={192} strokeWidth={12} animate={animateCalories} duration={2}>
              <div className="flex flex-col items-center justify-center">
                <AnimatedNumber value={userData.consumed} className="text-2xl font-bold" duration={2} />
                <p className="text-xs text-gray-500">
                  of {userData.dailyGoal} cal
                </p>
              </div>
            </ProgressRing>
            {showParticles && <ParticleEffect type="sparkle" intensity="medium" colors={['#320DFF', '#4F46E5', '#818CF8']} duration={2} />}
          </div>
          <div className="grid grid-cols-3 gap-4 w-full">
            {Object.entries(userData.macros).map(([key, macro], index) => {
            const percentage = Math.round(macro.consumed / macro.goal * 100);
            return <motion.div key={key} className="flex flex-col items-center" initial={{
              opacity: 0,
              y: 20
            }} animate={{
              opacity: 1,
              y: 0
            }} transition={{
              delay: 0.8 + index * 0.1
            }}>
                  <div className="w-12 h-12 mb-1">
                    <ProgressRing percentage={percentage} color={macro.color} size={48} strokeWidth={4} animate={animateCalories} duration={1.5}>
                      <p className="text-xs font-medium">{percentage}%</p>
                    </ProgressRing>
                  </div>
                  <p className="text-xs text-gray-600 capitalize">{key}</p>
                  <p className="text-xs font-medium">
                    <AnimatedNumber value={macro.consumed} duration={1.5} />/
                    {macro.goal}g
                  </p>
                </motion.div>;
          })}
          </div>
        </GlassMorphism>
      </motion.div>

      {/* Today's Meals */}
      <motion.div className="px-4 py-4" initial={{
      opacity: 0
    }} animate={{
      opacity: 1
    }} transition={{
      delay: 0.9,
      duration: 0.5
    }}>
        <motion.h2 className="text-lg font-semibold mb-4" initial={{
        opacity: 0,
        x: -20
      }} animate={{
        opacity: 1,
        x: 0
      }} transition={{
        delay: 1,
        duration: 0.5
      }}>
          Today's Meals
        </motion.h2>
        <div className="space-y-3">
          <AnimatePresence>
            {meals.map((meal, index) => <motion.div key={meal.id} initial={{
            opacity: 0,
            y: 20
          }} animate={{
            opacity: 1,
            y: 0
          }} exit={{
            opacity: 0,
            y: -20
          }} transition={{
            delay: 1.1 + index * 0.1,
            duration: 0.5
          }}>
                <MealCard meal={meal} />
              </motion.div>)}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div className="px-4 py-6" initial={{
      opacity: 0
    }} animate={{
      opacity: 1
    }} transition={{
      delay: 1.4,
      duration: 0.5
    }}>
        <div className="grid grid-cols-4 gap-2">
          {[{
          icon: CameraIcon,
          label: 'Camera'
        }, {
          icon: MicIcon,
          label: 'Voice'
        }, {
          icon: BarcodeIcon,
          label: 'Barcode'
        }, {
          icon: SearchIcon,
          label: 'Search'
        }].map((action, index) => <motion.button key={action.label} className="flex flex-col items-center p-3 bg-gray-50 rounded-xl" initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          delay: 1.5 + index * 0.1,
          type: 'spring'
        }} whileHover={{
          scale: 1.05,
          backgroundColor: 'rgba(50, 13, 255, 0.05)'
        }} whileTap={{
          scale: 0.95
        }}>
              <div className="w-10 h-10 rounded-full bg-[#320DFF]/10 flex items-center justify-center mb-2">
                <action.icon size={18} className="text-[#320DFF]" />
              </div>
              <span className="text-xs text-gray-700">{action.label}</span>
            </motion.button>)}
        </div>
      </motion.div>

      {/* Feedback button - small and aligned with other content */}
      <motion.div className="px-4 mb-8 flex justify-center" initial={{
      opacity: 0
    }} animate={{
      opacity: 1
    }} transition={{
      delay: 1.8
    }}>
        <button onClick={handleOpenFeedback} className="flex items-center justify-center text-xs text-gray-500 hover:text-[#320DFF] transition-colors">
          <MessageSquareIcon size={14} className="mr-1" />
          Share feedback
        </button>
      </motion.div>

      {/* Feedback Form */}
      <AnimatePresence>
        {showFeedbackForm && <FeedbackForm onClose={handleCloseFeedback} onSubmit={handleSubmitFeedback} />}
      </AnimatePresence>

      {/* Thank you notification */}
      <AnimatePresence>
        {showThankYou && <motion.div className="fixed bottom-20 left-4 right-4 max-w-md mx-auto bg-[#320DFF] dark:bg-[#6D56FF] text-white px-4 py-3 rounded-xl shadow-lg z-50" initial={{
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
      </AnimatePresence>
    </div>;
};