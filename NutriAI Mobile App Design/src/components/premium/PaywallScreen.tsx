import React, { useState } from 'react';
import { ArrowLeftIcon, ZapIcon, BarChartIcon, ClockIcon, CloudIcon, BookOpenIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { PageTransition } from '../ui/PageTransition';
import { Button } from '../ui/Button';
import { PremiumFeatureCard } from './PremiumFeatureCard';
import { SubscriptionPlanCard } from './SubscriptionPlanCard';
import { hapticFeedback } from '../../utils/haptics';
interface PaywallScreenProps {
  onBack: () => void;
  onSubscribe: (plan: string) => void;
  onRestore: () => void;
}
export const PaywallScreen: React.FC<PaywallScreenProps> = ({
  onBack,
  onSubscribe,
  onRestore
}) => {
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'annual'>('annual');
  const [isLoading, setIsLoading] = useState(false);
  const handleSubscribe = () => {
    hapticFeedback.impact();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onSubscribe(selectedPlan);
    }, 1500);
  };
  const handleRestore = () => {
    hapticFeedback.selection();
    onRestore();
  };
  return <PageTransition>
      <div className="flex flex-col min-h-screen bg-white dark:bg-gray-900">
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
            Upgrade to Premium
          </h1>
        </div>
        <div className="px-4 py-2 overflow-auto flex-1">
          <motion.div className="w-full h-48 bg-gradient-to-br from-[#320DFF] to-[#6D56FF] rounded-2xl mb-6 flex items-center justify-center relative overflow-hidden" initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.3
        }}>
            <div className="absolute inset-0 flex items-center justify-center opacity-10">
              <div className="w-64 h-64 rounded-full bg-white"></div>
            </div>
            <div className="text-center z-10">
              <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-3">
                <ZapIcon size={32} className="text-white" />
              </div>
              <h2 className="text-xl font-bold text-white mb-1">
                Unlock Full Potential
              </h2>
              <p className="text-white/80 text-sm px-6">
                Get unlimited access to all premium features
              </p>
            </div>
          </motion.div>
          <div className="space-y-6 mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Choose Your Plan
              </h2>
              <div className="space-y-3">
                <SubscriptionPlanCard title="Monthly" price="$4.99" period="month" description="Billed monthly. Cancel anytime." isSelected={selectedPlan === 'monthly'} onSelect={() => {
                hapticFeedback.selection();
                setSelectedPlan('monthly');
              }} />
                <SubscriptionPlanCard title="Annual" price="$49.99" period="year" description="Billed annually. Cancel anytime." isPopular={true} isSelected={selectedPlan === 'annual'} discount="17%" onSelect={() => {
                hapticFeedback.selection();
                setSelectedPlan('annual');
              }} />
              </div>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Premium Features
              </h2>
              <PremiumFeatureCard title="Advanced Analytics" description="Get detailed insights about your nutrition and habits." icon={<BarChartIcon size={20} className="text-[#320DFF] dark:text-[#6D56FF]" />} highlighted={true} />
              <PremiumFeatureCard title="Unlimited History" description="Access your complete nutrition history without limits." icon={<ClockIcon size={20} className="text-gray-600 dark:text-gray-400" />} />
              <PremiumFeatureCard title="Cloud Backup" description="Keep your data safe with automatic cloud backups." icon={<CloudIcon size={20} className="text-gray-600 dark:text-gray-400" />} />
              <PremiumFeatureCard title="Custom Recipes" description="Create and save unlimited custom recipes and meals." icon={<BookOpenIcon size={20} className="text-gray-600 dark:text-gray-400" />} />
            </div>
          </div>
        </div>
        <div className="p-4 border-t border-gray-200 dark:border-gray-800">
          <Button variant="primary" fullWidth onClick={handleSubscribe} loading={isLoading} disabled={isLoading}>
            {isLoading ? 'Processing...' : `Subscribe for ${selectedPlan === 'monthly' ? '$4.99/month' : '$49.99/year'}`}
          </Button>
          <button className="w-full text-center mt-4 text-sm text-gray-600 dark:text-gray-400" onClick={handleRestore}>
            Restore Purchase
          </button>
          <p className="text-xs text-center text-gray-500 dark:text-gray-500 mt-4">
            Your subscription will automatically renew. Cancel anytime in your
            account settings.
          </p>
        </div>
      </div>
    </PageTransition>;
};