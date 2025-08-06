import React, { useState } from 'react';
import { ArrowLeftIcon, Check, X, Zap } from 'lucide-react';
import { Button } from '../ui/Button';
import { motion } from 'framer-motion';
import { hapticFeedback } from '../../utils/haptics';
interface SubscriptionScreenProps {
  onBack: () => void;
  onComplete: () => void;
  hasReferralCode: boolean;
}
export const SubscriptionScreen: React.FC<SubscriptionScreenProps> = ({
  onBack,
  onComplete,
  hasReferralCode
}) => {
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('yearly');
  const plans = {
    monthly: {
      price: 9.99,
      period: 'month',
      discount: null,
      trialDays: 7
    },
    yearly: {
      price: 59.99,
      period: 'year',
      discount: '50%',
      trialDays: 14
    }
  };
  // Apply referral code discount if applicable
  if (hasReferralCode) {
    plans.monthly.trialDays = 14;
    plans.yearly.trialDays = 30;
  }
  const handlePlanSelect = (plan: 'monthly' | 'yearly') => {
    hapticFeedback.selection();
    setSelectedPlan(plan);
  };
  const handleContinue = () => {
    hapticFeedback.success();
    onComplete();
  };
  const handleSkip = () => {
    hapticFeedback.selection();
    onComplete();
  };
  const features = ['Unlimited AI food recognition', 'Personalized nutrition coaching', 'Advanced analytics and insights', 'Custom meal recommendations', 'Progress tracking and reports', 'Priority support'];
  return <div className="flex flex-col min-h-screen bg-white p-6 font-sans">
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
        <h1 className="text-3xl font-bold mb-3">Upgrade to Premium</h1>
        <p className="text-gray-600 text-lg">
          Get the most out of your nutrition journey
        </p>
      </div>
      <div className="flex justify-center mb-8">
        <motion.div className="flex items-center bg-gray-100 p-1 rounded-full" whileTap={{
        scale: 0.98
      }}>
          <motion.button className={`px-4 py-2 rounded-full text-sm font-medium ${selectedPlan === 'monthly' ? 'bg-white text-[#320DFF] shadow-sm' : 'text-gray-600'}`} onClick={() => handlePlanSelect('monthly')} whileTap={{
          scale: 0.95
        }}>
            Monthly
          </motion.button>
          <motion.button className={`px-4 py-2 rounded-full text-sm font-medium ${selectedPlan === 'yearly' ? 'bg-white text-[#320DFF] shadow-sm' : 'text-gray-600'}`} onClick={() => handlePlanSelect('yearly')} whileTap={{
          scale: 0.95
        }}>
            Yearly
          </motion.button>
        </motion.div>
      </div>
      <div className="mb-8">
        <motion.div className="bg-[#320DFF]/5 border-2 border-[#320DFF] rounded-2xl p-6 relative overflow-hidden" initial={{
        scale: 0.95,
        opacity: 0
      }} animate={{
        scale: 1,
        opacity: 1
      }} transition={{
        duration: 0.3
      }}>
          {selectedPlan === 'yearly' && plans.yearly.discount && <div className="absolute top-0 right-0">
              <div className="bg-[#320DFF] text-white px-4 py-1 rounded-bl-lg text-sm font-bold">
                SAVE {plans.yearly.discount}
              </div>
            </div>}
          <div className="flex items-center mb-4">
            <Zap size={24} className="text-[#320DFF] mr-2" />
            <h3 className="text-xl font-bold">
              Premium {selectedPlan === 'yearly' ? 'Annual' : 'Monthly'}
            </h3>
          </div>
          <div className="mb-6">
            <div className="flex items-baseline">
              <span className="text-3xl font-bold">
                ${plans[selectedPlan].price}
              </span>
              <span className="text-gray-600 ml-1">
                /{plans[selectedPlan].period}
              </span>
            </div>
            {hasReferralCode && <div className="mt-1 text-sm text-green-600 font-medium">
                Referral discount applied!
              </div>}
          </div>
          <ul className="space-y-3 mb-6">
            {features.map((feature, index) => <li key={index} className="flex items-start">
                <div className="mr-3 mt-0.5 text-[#320DFF]">
                  <Check size={16} />
                </div>
                <span>{feature}</span>
              </li>)}
          </ul>
          <div className="bg-[#320DFF]/10 p-3 rounded-xl text-center mb-6">
            <p className="text-[#320DFF] font-medium">
              {plans[selectedPlan].trialDays}-day free trial, cancel anytime
            </p>
          </div>
          <Button onClick={handleContinue} variant="primary" fullWidth>
            Start Free Trial
          </Button>
        </motion.div>
      </div>
      <div className="mt-auto text-center">
        <motion.button className="text-gray-500 font-medium" onClick={handleSkip} whileHover={{
        scale: 1.05
      }} whileTap={{
        scale: 0.95
      }}>
          Continue with limited version
        </motion.button>
        <p className="text-xs text-gray-400 mt-2">
          You can upgrade anytime from the app settings
        </p>
      </div>
    </div>;
};