import React from 'react';
import { User2Icon, LogOutIcon, CreditCardIcon, SettingsIcon, HelpCircleIcon, BellIcon, HeartIcon, TargetIcon, CalendarIcon, LockIcon, ChevronRightIcon, StarIcon, ZapIcon, TrophyIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { PageTransition } from '../ui/PageTransition';
import { Avatar } from '../ui/Avatar';
import { hapticFeedback } from '../../utils/haptics';
import { Berry } from '../ui/Berry';
interface ProfileScreenProps {
  onNavigate?: (screen: string, params: any) => void;
}
export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  onNavigate
}) => {
  const handleNavigate = (screen: string) => {
    hapticFeedback.selection();
    if (onNavigate) {
      onNavigate(screen, {});
    }
  };
  // Sample streak data
  const streakData = {
    current: 7,
    max: 21
  };
  const menuItems = [{
    id: 'account',
    title: 'Account',
    items: [{
      id: 'personal-info',
      title: 'Personal Information',
      icon: User2Icon,
      screen: 'personal-info'
    }, {
      id: 'payment-method',
      title: 'Payment Methods',
      icon: CreditCardIcon,
      screen: 'payment-method'
    }, {
      id: 'notifications',
      title: 'Notifications',
      icon: BellIcon,
      screen: 'notifications',
      badge: 3
    }, {
      id: 'favorites',
      title: 'Favorites',
      icon: HeartIcon,
      screen: 'favorites'
    }]
  }, {
    id: 'goals',
    title: 'Goals & Progress',
    items: [{
      id: 'goals-progress',
      title: 'Goals & Progress',
      icon: TargetIcon,
      screen: 'goals-progress'
    }, {
      id: 'history',
      title: 'History',
      icon: CalendarIcon,
      screen: 'history'
    }]
  }, {
    id: 'app',
    title: 'App Settings',
    items: [{
      id: 'subscription',
      title: 'Subscription',
      icon: StarIcon,
      screen: 'subscription-management',
      badge: 'PRO'
    }, {
      id: 'settings',
      title: 'Settings',
      icon: SettingsIcon,
      screen: 'settings'
    }, {
      id: 'help-support',
      title: 'Help & Support',
      icon: HelpCircleIcon,
      screen: 'help-support'
    }, {
      id: 'privacy',
      title: 'Privacy & Security',
      icon: LockIcon,
      screen: 'privacy'
    }]
  }];
  const handleUpgrade = () => {
    hapticFeedback.selection();
    if (onNavigate) {
      onNavigate('upgrade', {});
    }
  };
  return <PageTransition>
      <div className="flex flex-col min-h-screen bg-white dark:bg-gray-900 pb-20">
        <div className="px-4 pt-12 pb-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Profile
          </h1>
        </div>
        <div className="px-4 py-4">
          <div className="flex items-center mb-6">
            <Avatar src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80" size="large" />
            <div className="ml-4 flex-1">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Alex Johnson
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                alex.johnson@example.com
              </p>
            </div>
            <motion.button className="px-3 py-1 bg-[#320DFF]/10 dark:bg-[#6D56FF]/20 rounded-full text-[#320DFF] dark:text-[#6D56FF] text-xs font-medium flex items-center" onClick={handleUpgrade} whileHover={{
            scale: 1.05
          }} whileTap={{
            scale: 0.95
          }}>
              <StarIcon size={12} className="mr-1" />
              Upgrade
            </motion.button>
          </div>

          {/* Streak indicators */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-6 border border-gray-100 dark:border-gray-700 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Berry variant="streak" size="tiny" className="mr-2" />
                <h3 className="font-medium text-gray-900 dark:text-white">
                  Your Streaks
                </h3>
              </div>
              <motion.button className="text-xs text-[#320DFF] dark:text-[#6D56FF]" onClick={() => handleNavigate('goals-progress')} whileHover={{
              scale: 1.05
            }} whileTap={{
              scale: 0.95
            }}>
                View Details
              </motion.button>
            </div>
            <div className="flex mt-3 space-x-4">
              <div className="flex-1 bg-[#320DFF]/5 dark:bg-[#6D56FF]/10 rounded-lg p-3">
                <div className="flex items-center mb-1">
                  <ZapIcon size={14} className="text-[#320DFF] dark:text-[#6D56FF] mr-1" />
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    Current Streak
                  </span>
                </div>
                <div className="flex items-baseline">
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">
                    {streakData.current}
                  </span>
                  <span className="ml-1 text-gray-600 dark:text-gray-400 text-sm">
                    days
                  </span>
                </div>
              </div>
              <div className="flex-1 bg-[#320DFF]/5 dark:bg-[#6D56FF]/10 rounded-lg p-3">
                <div className="flex items-center mb-1">
                  <TrophyIcon size={14} className="text-[#320DFF] dark:text-[#6D56FF] mr-1" />
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    Max Streak
                  </span>
                </div>
                <div className="flex items-baseline">
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">
                    {streakData.max}
                  </span>
                  <span className="ml-1 text-gray-600 dark:text-gray-400 text-sm">
                    days
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {menuItems.map(section => <div key={section.id}>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                  {section.title}
                </h3>
                <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-100 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-700">
                  {section.items.map(item => <motion.button key={item.id} className="flex items-center justify-between w-full p-4 text-left" onClick={() => handleNavigate(item.screen)} whileHover={{
                backgroundColor: 'rgba(0, 0, 0, 0.02)'
              }} whileTap={{
                scale: 0.98
              }}>
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mr-3">
                          <item.icon size={18} className="text-gray-600 dark:text-gray-400" />
                        </div>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {item.title}
                        </span>
                      </div>
                      <div className="flex items-center">
                        {item.badge && <div className={`mr-2 px-2 py-0.5 rounded-full text-xs font-medium ${typeof item.badge === 'number' ? 'bg-red-500 text-white' : 'bg-[#320DFF]/10 dark:bg-[#6D56FF]/20 text-[#320DFF] dark:text-[#6D56FF]'}`}>
                            {item.badge}
                          </div>}
                        <ChevronRightIcon size={18} className="text-gray-400 dark:text-gray-500" />
                      </div>
                    </motion.button>)}
                </div>
              </div>)}
          </div>

          <motion.button className="flex items-center justify-center w-full mt-8 p-4 rounded-xl border border-red-100 dark:border-red-900/30 text-red-600 dark:text-red-400" onClick={() => handleNavigate('delete-account')} whileHover={{
          backgroundColor: 'rgba(239, 68, 68, 0.05)'
        }} whileTap={{
          scale: 0.98
        }}>
            <LogOutIcon size={18} className="mr-2" />
            <span className="font-medium">Log Out</span>
          </motion.button>
        </div>
      </div>
    </PageTransition>;
};