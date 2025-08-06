import React from 'react';
import { ArrowLeftIcon, CheckCircleIcon, ClockIcon, CreditCardIcon, ExternalLinkIcon } from 'lucide-react';
import { PageTransition } from '../ui/PageTransition';
import { Button } from '../ui/Button';
import { motion } from 'framer-motion';
import { hapticFeedback } from '../../utils/haptics';
interface SubscriptionManagementScreenProps {
  onBack: () => void;
}
export const SubscriptionManagementScreen: React.FC<SubscriptionManagementScreenProps> = ({
  onBack
}) => {
  // Sample subscription data
  const subscription = {
    status: 'active',
    plan: 'Premium Annual',
    price: '$49.99',
    nextBillingDate: 'September 15, 2024',
    paymentMethod: 'Apple Pay',
    features: ['Advanced Analytics', 'Unlimited History', 'Cloud Backup', 'Custom Recipes', 'Priority Support']
  };
  const handleManageSubscription = () => {
    hapticFeedback.impact();
    // This would typically open the app store or payment provider subscription management
    window.open('https://apps.apple.com/account/subscriptions', '_blank');
  };
  const handleContactSupport = () => {
    hapticFeedback.selection();
    // Navigate to support screen
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
            Subscription
          </h1>
        </div>
        <div className="px-4 py-4 flex-1">
          <motion.div className="bg-gradient-to-br from-[#320DFF] to-[#6D56FF] rounded-xl p-6 mb-6" initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.3
        }}>
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center mr-3">
                <CheckCircleIcon size={20} className="text-white" />
              </div>
              <div>
                <h2 className="text-white font-bold text-lg">
                  {subscription.plan}
                </h2>
                <p className="text-white/80 text-sm">
                  {subscription.status === 'active' ? 'Active' : 'Inactive'}
                </p>
              </div>
            </div>
            <div className="bg-white/10 rounded-lg p-4 mb-4">
              <div className="flex items-center mb-2">
                <ClockIcon size={16} className="text-white/80 mr-2" />
                <p className="text-white/80 text-sm">
                  Next billing: {subscription.nextBillingDate}
                </p>
              </div>
              <div className="flex items-center">
                <CreditCardIcon size={16} className="text-white/80 mr-2" />
                <p className="text-white/80 text-sm">
                  Payment method: {subscription.paymentMethod}
                </p>
              </div>
            </div>
            <Button variant="secondary" fullWidth onClick={handleManageSubscription} icon={<ExternalLinkIcon size={16} />} iconPosition="right" className="bg-white/20 text-white border-white/20 hover:bg-white/30">
              Manage Subscription
            </Button>
          </motion.div>
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
              Premium Features
            </h3>
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
              <ul className="space-y-3">
                {subscription.features.map((feature, index) => <motion.li key={index} className="flex items-center" initial={{
                opacity: 0,
                x: -20
              }} animate={{
                opacity: 1,
                x: 0
              }} transition={{
                delay: index * 0.1,
                duration: 0.3
              }}>
                    <div className="w-5 h-5 rounded-full bg-[#320DFF]/10 dark:bg-[#6D56FF]/20 flex items-center justify-center mr-3">
                      <div className="w-2 h-2 rounded-full bg-[#320DFF] dark:bg-[#6D56FF]"></div>
                    </div>
                    <span className="text-gray-800 dark:text-gray-200">
                      {feature}
                    </span>
                  </motion.li>)}
              </ul>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 mb-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
              Need Help?
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
              If you have any questions about your subscription or need
              assistance, our support team is here to help.
            </p>
            <Button variant="outline" fullWidth onClick={handleContactSupport}>
              Contact Support
            </Button>
          </div>
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
              Restore Purchase
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
              Changed devices or reinstalled the app? Restore your previous
              purchases.
            </p>
            <Button variant="secondary" fullWidth>
              Restore Purchases
            </Button>
          </div>
        </div>
      </div>
    </PageTransition>;
};