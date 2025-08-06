import React, { useState, Children } from 'react';
import { ArrowLeftIcon, GlobeIcon, MoonIcon, BellIcon, LockIcon, TrashIcon, ChevronRightIcon, CreditCardIcon, LogOutIcon } from 'lucide-react';
import { PageTransition } from '../ui/PageTransition';
import { motion } from 'framer-motion';
import { hapticFeedback } from '../../utils/haptics';
interface SettingsScreenProps {
  onBack: () => void;
  onNavigate?: (screen: string, params: any) => void;
  onToggleDarkMode?: () => void;
  isDarkMode?: boolean;
  onLogout?: () => void;
}
export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  onBack,
  onNavigate,
  onToggleDarkMode,
  isDarkMode = false,
  onLogout
}) => {
  const handleNavigation = (screen: string) => {
    hapticFeedback.selection();
    if (onNavigate) {
      onNavigate(screen, {});
    }
  };
  const handleLogout = () => {
    hapticFeedback.impact();
    if (onLogout) {
      onLogout();
    }
  };
  const handleToggleDarkMode = () => {
    hapticFeedback.selection();
    if (onToggleDarkMode) {
      onToggleDarkMode();
    }
  };
  const itemVariants = {
    hidden: {
      opacity: 0,
      y: 20
    },
    visible: {
      opacity: 1,
      y: 0
    }
  };
  // Add state for units
  const [weightUnit, setWeightUnit] = useState<'lbs' | 'kg'>('lbs');
  const [heightUnit, setHeightUnit] = useState<'ft/in' | 'cm'>('ft/in');
  const [energyUnit, setEnergyUnit] = useState<'calories' | 'kilojoules'>('calories');
  const toggleWeightUnit = () => {
    hapticFeedback.selection();
    setWeightUnit(weightUnit === 'lbs' ? 'kg' : 'lbs');
  };
  const toggleHeightUnit = () => {
    hapticFeedback.selection();
    setHeightUnit(heightUnit === 'ft/in' ? 'cm' : 'ft/in');
  };
  const toggleEnergyUnit = () => {
    hapticFeedback.selection();
    setEnergyUnit(energyUnit === 'calories' ? 'kilojoules' : 'calories');
  };
  const handleUpgrade = () => {
    hapticFeedback.selection();
    handleNavigation('upgrade');
  };
  return <PageTransition>
      <div className="flex flex-col min-h-screen bg-white dark:bg-gray-900 pb-6">
        <div className="px-4 pt-12 pb-4 flex items-center">
          <motion.button className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mr-4" onClick={() => {
          hapticFeedback.selection();
          onBack();
        }} whileHover={{
          scale: 1.05
        }} whileTap={{
          scale: 0.95
        }}>
            <ArrowLeftIcon size={20} className="text-gray-700 dark:text-gray-300" />
          </motion.button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Settings
          </h1>
        </div>
        <motion.div className="px-4 py-4" initial="hidden" animate="visible" variants={{
        visible: {
          transition: {
            staggerChildren: 0.1
          }
        }
      }}>
          <div className="space-y-4">
            {/* App Preferences */}
            <motion.div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-4 shadow-sm" variants={itemVariants} transition={{
            duration: 0.3
          }}>
              <h2 className="font-medium mb-4 text-gray-900 dark:text-white">
                App Preferences
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mr-3">
                      <GlobeIcon size={18} className="text-gray-700 dark:text-gray-300" />
                    </div>
                    <p className="text-gray-900 dark:text-white">Language</p>
                  </div>
                  <div className="flex items-center">
                    <span className="text-gray-500 dark:text-gray-400 mr-2">
                      English
                    </span>
                    <ChevronRightIcon size={18} className="text-gray-400 dark:text-gray-500" />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mr-3">
                      <MoonIcon size={18} className="text-gray-700 dark:text-gray-300" />
                    </div>
                    <p className="text-gray-900 dark:text-white">Dark Mode</p>
                  </div>
                  <motion.div className={`w-12 h-6 rounded-full flex items-center p-1 cursor-pointer transition-colors duration-300 ${isDarkMode ? 'bg-[#320DFF] dark:bg-[#6D56FF]' : 'bg-gray-300 dark:bg-gray-600'}`} onClick={handleToggleDarkMode} whileTap={{
                  scale: 0.9
                }}>
                    <motion.div className="w-4 h-4 rounded-full bg-white" animate={{
                    x: isDarkMode ? 24 : 0
                  }} transition={{
                    type: 'spring',
                    stiffness: 500,
                    damping: 30
                  }} />
                  </motion.div>
                </div>
                <div className="flex items-center justify-between cursor-pointer" onClick={() => handleNavigation('notifications')}>
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mr-3">
                      <BellIcon size={18} className="text-gray-700 dark:text-gray-300" />
                    </div>
                    <p className="text-gray-900 dark:text-white">
                      Notifications
                    </p>
                  </div>
                  <ChevronRightIcon size={18} className="text-gray-400 dark:text-gray-500" />
                </div>
              </div>
            </motion.div>
            {/* Subscription */}
            <motion.div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-4 shadow-sm" variants={itemVariants} transition={{
            duration: 0.3
          }}>
              <h2 className="font-medium mb-4 text-gray-900 dark:text-white">
                Subscription
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between cursor-pointer" onClick={() => handleNavigation('subscription-management')}>
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-[#320DFF]/10 dark:bg-[#6D56FF]/20 flex items-center justify-center mr-3">
                      <CreditCardIcon size={18} className="text-[#320DFF] dark:text-[#6D56FF]" />
                    </div>
                    <div>
                      <p className="text-gray-900 dark:text-white">
                        Manage Subscription
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Free Plan
                      </p>
                    </div>
                  </div>
                  <ChevronRightIcon size={18} className="text-gray-400 dark:text-gray-500" />
                </div>
                <motion.button className="w-full py-2 bg-[#320DFF]/10 dark:bg-[#6D56FF]/20 rounded-lg text-[#320DFF] dark:text-[#6D56FF] font-medium" onClick={handleUpgrade} whileHover={{
                scale: 1.02
              }} whileTap={{
                scale: 0.98
              }}>
                  Upgrade to Premium
                </motion.button>
              </div>
            </motion.div>
            {/* Units & Measurements */}
            <motion.div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-4 shadow-sm" variants={itemVariants} transition={{
            duration: 0.3
          }}>
              <h2 className="font-medium mb-4 text-gray-900 dark:text-white">
                Units & Measurements
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-gray-900 dark:text-white">Weight</p>
                  <div className="flex items-center">
                    <button className="flex items-center bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full" onClick={toggleWeightUnit}>
                      <span className={`text-sm mr-2 ${weightUnit === 'lbs' ? 'font-medium text-[#320DFF] dark:text-[#6D56FF]' : 'text-gray-500 dark:text-gray-400'}`}>
                        lbs
                      </span>
                      <div className={`w-8 h-4 rounded-full flex items-center p-0.5 ${weightUnit === 'kg' ? 'bg-[#320DFF] dark:bg-[#6D56FF]' : 'bg-gray-300 dark:bg-gray-600'}`}>
                        <motion.div className="w-3 h-3 rounded-full bg-white" animate={{
                        x: weightUnit === 'kg' ? 16 : 0
                      }} transition={{
                        type: 'spring',
                        stiffness: 500,
                        damping: 30
                      }} />
                      </div>
                      <span className={`text-sm ml-2 ${weightUnit === 'kg' ? 'font-medium text-[#320DFF] dark:text-[#6D56FF]' : 'text-gray-500 dark:text-gray-400'}`}>
                        kg
                      </span>
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-gray-900 dark:text-white">Height</p>
                  <div className="flex items-center">
                    <button className="flex items-center bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full" onClick={toggleHeightUnit}>
                      <span className={`text-sm mr-2 ${heightUnit === 'ft/in' ? 'font-medium text-[#320DFF] dark:text-[#6D56FF]' : 'text-gray-500 dark:text-gray-400'}`}>
                        ft/in
                      </span>
                      <div className={`w-8 h-4 rounded-full flex items-center p-0.5 ${heightUnit === 'cm' ? 'bg-[#320DFF] dark:bg-[#6D56FF]' : 'bg-gray-300 dark:bg-gray-600'}`}>
                        <motion.div className="w-3 h-3 rounded-full bg-white" animate={{
                        x: heightUnit === 'cm' ? 16 : 0
                      }} transition={{
                        type: 'spring',
                        stiffness: 500,
                        damping: 30
                      }} />
                      </div>
                      <span className={`text-sm ml-2 ${heightUnit === 'cm' ? 'font-medium text-[#320DFF] dark:text-[#6D56FF]' : 'text-gray-500 dark:text-gray-400'}`}>
                        cm
                      </span>
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-gray-900 dark:text-white">Energy</p>
                  <div className="flex items-center">
                    <button className="flex items-center bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full" onClick={toggleEnergyUnit}>
                      <span className={`text-sm mr-2 ${energyUnit === 'calories' ? 'font-medium text-[#320DFF] dark:text-[#6D56FF]' : 'text-gray-500 dark:text-gray-400'}`}>
                        calories
                      </span>
                      <div className={`w-8 h-4 rounded-full flex items-center p-0.5 ${energyUnit === 'kilojoules' ? 'bg-[#320DFF] dark:bg-[#6D56FF]' : 'bg-gray-300 dark:bg-gray-600'}`}>
                        <motion.div className="w-3 h-3 rounded-full bg-white" animate={{
                        x: energyUnit === 'kilojoules' ? 16 : 0
                      }} transition={{
                        type: 'spring',
                        stiffness: 500,
                        damping: 30
                      }} />
                      </div>
                      <span className={`text-sm ml-2 ${energyUnit === 'kilojoules' ? 'font-medium text-[#320DFF] dark:text-[#6D56FF]' : 'text-gray-500 dark:text-gray-400'}`}>
                        kJ
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
            {/* Account */}
            <motion.div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-4 shadow-sm" variants={itemVariants} transition={{
            duration: 0.3
          }}>
              <h2 className="font-medium mb-4 text-gray-900 dark:text-white">
                Account
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between cursor-pointer" onClick={() => handleNavigation('change-password')}>
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mr-3">
                      <LockIcon size={18} className="text-gray-700 dark:text-gray-300" />
                    </div>
                    <p className="text-gray-900 dark:text-white">
                      Change Password
                    </p>
                  </div>
                  <ChevronRightIcon size={18} className="text-gray-400 dark:text-gray-500" />
                </div>
                <div className="flex items-center justify-between cursor-pointer" onClick={() => handleNavigation('delete-account')}>
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mr-3">
                      <TrashIcon size={18} className="text-red-500 dark:text-red-400" />
                    </div>
                    <p className="text-red-500 dark:text-red-400">
                      Delete Account
                    </p>
                  </div>
                  <ChevronRightIcon size={18} className="text-gray-400 dark:text-gray-500" />
                </div>
              </div>
            </motion.div>
            {/* App Info */}
            <motion.div className="mt-6" variants={itemVariants} transition={{
            duration: 0.3
          }}>
              <p className="text-center text-gray-500 dark:text-gray-400 text-sm">
                Version 1.0.0
              </p>
              <div className="flex justify-center space-x-4 mt-2">
                <button className="text-sm text-[#320DFF] dark:text-[#6D56FF]">
                  Terms of Service
                </button>
                <button className="text-sm text-[#320DFF] dark:text-[#6D56FF]">
                  Privacy Policy
                </button>
              </div>
            </motion.div>
            {/* Logout button */}
            <motion.button className="flex items-center justify-center w-full mt-8 py-4 text-red-500 dark:text-red-400" onClick={handleLogout} initial={{
            opacity: 0
          }} animate={{
            opacity: 1
          }} transition={{
            duration: 0.3,
            delay: 1.2
          }} whileHover={{
            backgroundColor: 'rgba(239, 68, 68, 0.05)'
          }} whileTap={{
            scale: 0.98
          }}>
              <LogOutIcon size={18} className="mr-2" />
              <span className="font-medium">Log Out</span>
            </motion.button>
          </div>
        </motion.div>
      </div>
    </PageTransition>;
};