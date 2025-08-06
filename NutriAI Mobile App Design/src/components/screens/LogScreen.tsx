import React, { Children } from 'react';
import { SearchIcon, CameraIcon, MicIcon, BarcodeIcon, StarIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { PageTransition } from '../ui/PageTransition';
interface LogScreenProps {
  onNavigate?: (screen: string, params: any) => void;
}
export const LogScreen: React.FC<LogScreenProps> = ({
  onNavigate
}) => {
  const mealOptions = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];
  const handleInputMethod = (method: string) => {
    if (onNavigate) {
      switch (method) {
        case 'camera':
          onNavigate('camera-input', {});
          break;
        case 'voice':
          onNavigate('voice-input', {});
          break;
        case 'barcode':
          onNavigate('barcode-input', {});
          break;
        case 'text':
          onNavigate('text-input', {});
          break;
        case 'favorites':
          onNavigate('favorites', {});
          break;
        default:
          break;
      }
    }
  };
  const containerVariants = {
    hidden: {
      opacity: 0
    },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  const itemVariants = {
    hidden: {
      y: 20,
      opacity: 0
    },
    visible: {
      y: 0,
      opacity: 1
    }
  };
  return <PageTransition>
      <div className="flex flex-col min-h-screen bg-white">
        {/* Header */}
        <div className="px-4 pt-12 pb-4">
          <motion.h1 className="text-2xl font-bold" initial={{
          opacity: 0,
          y: -10
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.3
        }}>
            Log Food
          </motion.h1>
          <motion.p className="text-gray-600" initial={{
          opacity: 0
        }} animate={{
          opacity: 1
        }} transition={{
          duration: 0.3,
          delay: 0.1
        }}>
            Add what you ate today
          </motion.p>
        </div>

        {/* Scrollable content area */}
        <div className="flex-1 overflow-auto">
          <div className="px-4 pb-36">
            {/* Text Input */}
            <motion.div className="mb-6" initial={{
            opacity: 0,
            y: 20
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            duration: 0.4
          }}>
              <button onClick={() => handleInputMethod('text')} className="w-full bg-gray-100 rounded-full py-3 px-5 pl-12 text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#320DFF]/20 relative text-left">
                <SearchIcon className="absolute left-4 top-3.5 text-gray-500" size={18} />
                <span>Describe your meal...</span>
              </button>
            </motion.div>

            {/* Quick Add Methods */}
            <motion.div className="mb-6" variants={containerVariants} initial="hidden" animate="visible">
              <div className="flex justify-between">
                <motion.button variants={itemVariants} className="flex flex-col items-center justify-center bg-[#320DFF]/5 rounded-xl p-4 w-[23%]" onClick={() => handleInputMethod('camera')} whileHover={{
                scale: 1.05
              }} whileTap={{
                scale: 0.95
              }}>
                  <div className="w-10 h-10 rounded-full bg-[#320DFF]/10 flex items-center justify-center mb-2">
                    <CameraIcon size={18} className="text-[#320DFF]" />
                  </div>
                  <span className="text-xs text-gray-700">Camera</span>
                </motion.button>
                <motion.button variants={itemVariants} className="flex flex-col items-center justify-center bg-[#320DFF]/5 rounded-xl p-4 w-[23%]" onClick={() => handleInputMethod('voice')} whileHover={{
                scale: 1.05
              }} whileTap={{
                scale: 0.95
              }}>
                  <div className="w-10 h-10 rounded-full bg-[#320DFF]/10 flex items-center justify-center mb-2">
                    <MicIcon size={18} className="text-[#320DFF]" />
                  </div>
                  <span className="text-xs text-gray-700">Voice</span>
                </motion.button>
                <motion.button variants={itemVariants} className="flex flex-col items-center justify-center bg-[#320DFF]/5 rounded-xl p-4 w-[23%]" onClick={() => handleInputMethod('barcode')} whileHover={{
                scale: 1.05
              }} whileTap={{
                scale: 0.95
              }}>
                  <div className="w-10 h-10 rounded-full bg-[#320DFF]/10 flex items-center justify-center mb-2">
                    <BarcodeIcon size={18} className="text-[#320DFF]" />
                  </div>
                  <span className="text-xs text-gray-700">Barcode</span>
                </motion.button>
                <motion.button variants={itemVariants} className="flex flex-col items-center justify-center bg-[#320DFF]/5 rounded-xl p-4 w-[23%]" onClick={() => handleInputMethod('favorites')} whileHover={{
                scale: 1.05
              }} whileTap={{
                scale: 0.95
              }}>
                  <div className="w-10 h-10 rounded-full bg-[#320DFF]/10 flex items-center justify-center mb-2">
                    <StarIcon size={18} className="text-[#320DFF]" />
                  </div>
                  <span className="text-xs text-gray-700">Favorites</span>
                </motion.button>
              </div>
            </motion.div>

            {/* Quick Add Meals */}
            <motion.div className="mb-6" initial={{
            opacity: 0,
            y: 20
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            duration: 0.4,
            delay: 0.4
          }}>
              <h2 className="font-semibold mb-3">Quick Add</h2>
              <div className="flex space-x-3 overflow-x-auto pb-2">
                {mealOptions.map((meal, index) => <motion.button key={index} className="flex-shrink-0 bg-[#320DFF]/10 px-5 py-2.5 rounded-full" initial={{
                opacity: 0,
                x: -20
              }} animate={{
                opacity: 1,
                x: 0
              }} transition={{
                duration: 0.3,
                delay: 0.5 + index * 0.1
              }} whileHover={{
                scale: 1.05
              }} whileTap={{
                scale: 0.95
              }}>
                    <span className="text-sm text-[#320DFF] font-medium">
                      {meal}
                    </span>
                  </motion.button>)}
              </div>
            </motion.div>

            {/* Recent Logs Placeholder */}
            <motion.div className="mb-6" initial={{
            opacity: 0,
            y: 20
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            duration: 0.4,
            delay: 0.6
          }}>
              <h2 className="font-semibold mb-3">Recent Logs</h2>
              <div className="bg-gray-50 rounded-xl p-6 flex flex-col items-center justify-center">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                  <CameraIcon size={24} className="text-gray-400" />
                </div>
                <p className="text-gray-500 text-center mb-2">No recent logs</p>
                <p className="text-sm text-gray-400 text-center">
                  Your recently logged meals will appear here
                </p>
              </div>
            </motion.div>

            {/* Suggested Items */}
            <motion.div className="mb-6" initial={{
            opacity: 0,
            y: 20
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            duration: 0.4,
            delay: 0.8
          }}>
              <h2 className="font-semibold mb-3">Suggested for You</h2>
              <div className="bg-[#320DFF]/5 p-4 rounded-xl">
                <p className="text-sm font-medium text-[#320DFF] mb-2">
                  Try our AI Assistant
                </p>
                <p className="text-sm text-gray-700">
                  Describe your meal in natural language and our AI will analyze
                  the nutrition for you.
                </p>
                <motion.button className="mt-3 bg-[#320DFF] text-white px-4 py-2 rounded-full text-sm font-medium" whileHover={{
                scale: 1.05
              }} whileTap={{
                scale: 0.95
              }} onClick={() => handleInputMethod('text')}>
                  Try Now
                </motion.button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </PageTransition>;
};