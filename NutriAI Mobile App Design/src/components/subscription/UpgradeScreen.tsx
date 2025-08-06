import React, { useState } from 'react';
import { ArrowLeftIcon, CheckIcon, StarIcon, SparklesIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { PageTransition } from '../ui/PageTransition';
import { Button } from '../ui/Button';
import { hapticFeedback } from '../../utils/haptics';
import { useTheme } from '../../utils/theme';
interface UpgradeScreenProps {
  onBack: () => void;
  onNavigate?: (screen: string, params: any) => void;
}
export const UpgradeScreen: React.FC<UpgradeScreenProps> = ({
  onBack,
  onNavigate
}) => {
  const {
    colors,
    isDark
  } = useTheme();
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'annual'>('annual');
  const handlePlanSelect = (plan: 'monthly' | 'annual') => {
    hapticFeedback.selection();
    setSelectedPlan(plan);
  };
  const handleSubscribe = () => {
    hapticFeedback.success();
    // In a real app, this would initiate the payment process
    // For now, just navigate to the home screen
    onNavigate && onNavigate('home', {});
  };
  const premiumFeatures = ['Advanced analytics & weekly insights', 'AI-powered food logging (photo & voice)', 'Custom meal plans & recipes', 'Unlimited food database access', 'Priority support', 'Future premium features'];
  return <PageTransition direction="elastic">
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
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            Upgrade to Premium
          </h1>
        </div>
        <div className="px-4 py-4 flex-1 flex flex-col">
          <div className="flex justify-center mb-6">
            <motion.div className="w-32 h-32 bg-[#320DFF] dark:bg-[#6D56FF] rounded-full flex items-center justify-center" initial={{
            scale: 0.8,
            opacity: 0
          }} animate={{
            scale: 1,
            opacity: 1
          }} transition={{
            type: 'spring',
            stiffness: 300,
            damping: 20
          }}>
              <SparklesIcon size={64} className="text-white" />
            </motion.div>
          </div>
          <motion.div className="text-center mb-8" initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          delay: 0.2
        }}>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Unlock Your Full Potential!
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Get access to all premium features and take your nutrition
              tracking to the next level
            </p>
          </motion.div>
          <motion.div className="mb-8" initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          delay: 0.3
        }}>
            <div className="space-y-3">
              {premiumFeatures.map((feature, index) => <motion.div key={index} className="flex items-center" initial={{
              opacity: 0,
              x: -20
            }} animate={{
              opacity: 1,
              x: 0
            }} transition={{
              delay: 0.4 + index * 0.1
            }}>
                  <div className="w-6 h-6 rounded-full bg-[#320DFF]/10 dark:bg-[#6D56FF]/20 flex items-center justify-center mr-3">
                    <CheckIcon size={14} className="text-[#320DFF] dark:text-[#6D56FF]" />
                  </div>
                  <p className="text-gray-800 dark:text-gray-200">{feature}</p>
                </motion.div>)}
            </div>
          </motion.div>
          <motion.div className="mb-8" initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          delay: 0.8
        }}>
            <p className="text-center font-medium text-gray-800 dark:text-gray-200 mb-4">
              Choose your plan:
            </p>
            <div className="flex space-x-4">
              <motion.div className={`flex-1 border rounded-xl p-4 ${selectedPlan === 'monthly' ? 'border-[#320DFF] dark:border-[#6D56FF] bg-[#320DFF]/5 dark:bg-[#6D56FF]/10' : 'border-gray-200 dark:border-gray-700'}`} whileHover={{
              scale: 1.02
            }} whileTap={{
              scale: 0.98
            }} onClick={() => handlePlanSelect('monthly')}>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white">
                      Monthly
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Billed monthly
                    </p>
                  </div>
                  {selectedPlan === 'monthly' && <div className="w-6 h-6 rounded-full bg-[#320DFF] dark:bg-[#6D56FF] flex items-center justify-center">
                      <CheckIcon size={14} className="text-white" />
                    </div>}
                </div>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  $4.99
                  <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                    /month
                  </span>
                </p>
              </motion.div>
              <motion.div className={`flex-1 border rounded-xl p-4 relative overflow-hidden ${selectedPlan === 'annual' ? 'border-[#320DFF] dark:border-[#6D56FF] bg-[#320DFF]/5 dark:bg-[#6D56FF]/10' : 'border-gray-200 dark:border-gray-700'}`} whileHover={{
              scale: 1.02
            }} whileTap={{
              scale: 0.98
            }} onClick={() => handlePlanSelect('annual')}>
                <div className="absolute -right-8 -top-1 bg-[#320DFF] dark:bg-[#6D56FF] text-white text-xs font-bold py-1 px-8 transform rotate-45">
                  SAVE 15%
                </div>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white">
                      Annual
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Billed yearly
                    </p>
                  </div>
                  {selectedPlan === 'annual' && <div className="w-6 h-6 rounded-full bg-[#320DFF] dark:bg-[#6D56FF] flex items-center justify-center">
                      <CheckIcon size={14} className="text-white" />
                    </div>}
                </div>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  $49.99
                  <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                    /year
                  </span>
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  ($4.17/month)
                </p>
              </motion.div>
            </div>
          </motion.div>
          <div className="mt-auto">
            <Button variant="primary" fullWidth onClick={handleSubscribe}>
              Start {selectedPlan === 'monthly' ? 'Monthly' : 'Annual'} Plan
            </Button>
            <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-2">
              You won't be charged until your 3-day free trial ends. Cancel
              anytime.
            </p>
            <button className="w-full text-center mt-4 text-[#320DFF] dark:text-[#6D56FF] text-sm font-medium">
              Restore Purchase
            </button>
          </div>
        </div>
      </div>
    </PageTransition>;
};