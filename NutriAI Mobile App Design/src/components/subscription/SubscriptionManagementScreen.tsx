import React, { useState, Children } from 'react';
import { ArrowLeftIcon, CalendarIcon, CreditCardIcon, AlertCircleIcon } from 'lucide-react';
import { Button } from '../ui/Button';
import { PageTransition } from '../ui/PageTransition';
import { motion } from 'framer-motion';
interface SubscriptionManagementScreenProps {
  onBack: () => void;
}
export const SubscriptionManagementScreen: React.FC<SubscriptionManagementScreenProps> = ({
  onBack
}) => {
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  // Sample subscription data
  const subscription = {
    plan: 'Free Plan',
    status: 'Active',
    nextBillingDate: 'N/A',
    price: '$0.00',
    paymentMethod: null
  };
  // Sample premium subscription data (commented out for now)
  /*
  const subscription = {
    plan: 'Premium Annual',
    status: 'Active',
    nextBillingDate: 'March 15, 2024',
    price: '$95.88/year',
    paymentMethod: {
      type: 'visa',
      lastFour: '4242',
      expiry: '12/25',
    },
  }
  */
  const isPremium = subscription.plan !== 'Free Plan';
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
  return <PageTransition>
      <div className="flex flex-col min-h-screen bg-white pb-6">
        <div className="px-4 pt-12 pb-4 flex items-center">
          <motion.button className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mr-4" onClick={onBack} whileHover={{
          scale: 1.05
        }} whileTap={{
          scale: 0.95
        }}>
            <ArrowLeftIcon size={20} />
          </motion.button>
          <h1 className="text-2xl font-bold">Subscription</h1>
        </div>
        <motion.div className="px-4 py-4 flex-1" initial="hidden" animate="visible" variants={{
        visible: {
          transition: {
            staggerChildren: 0.1
          }
        }
      }}>
          {/* Current Plan */}
          <motion.div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm mb-6" variants={itemVariants} transition={{
          duration: 0.3
        }}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-semibold">Current Plan</h2>
              <span className={`text-xs px-2 py-1 rounded-full ${isPremium ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                {subscription.status}
              </span>
            </div>
            <div className="mb-4">
              <h3 className="text-xl font-bold">{subscription.plan}</h3>
              <p className="text-gray-500 text-sm">{subscription.price}</p>
            </div>
            {isPremium && <div className="flex items-center text-sm text-gray-600 mb-4">
                <CalendarIcon size={16} className="mr-2" />
                <span>Next billing date: {subscription.nextBillingDate}</span>
              </div>}
            {isPremium ? <Button onClick={() => setShowCancelDialog(true)} variant="secondary" fullWidth>
                Cancel Subscription
              </Button> : <Button onClick={onBack} variant="primary" fullWidth>
                Upgrade to Premium
              </Button>}
          </motion.div>
          {/* Payment Method */}
          {isPremium && subscription.paymentMethod && <motion.div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm mb-6" variants={itemVariants} transition={{
          duration: 0.3
        }}>
              <h2 className="font-semibold mb-4">Payment Method</h2>
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mr-3">
                  <CreditCardIcon size={20} className="text-gray-700" />
                </div>
                <div>
                  <div className="flex items-center">
                    <p className="font-medium capitalize">
                      {subscription.paymentMethod.type}
                    </p>
                    <p className="text-xs bg-gray-100 px-2 py-0.5 rounded ml-2">
                      •••• {subscription.paymentMethod.lastFour}
                    </p>
                  </div>
                  <p className="text-xs text-gray-500">
                    Expires {subscription.paymentMethod.expiry}
                  </p>
                </div>
              </div>
              <Button onClick={onBack} variant="text" fullWidth className="mt-4">
                Update Payment Method
              </Button>
            </motion.div>}
          {/* Billing History */}
          {isPremium && <motion.div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm" variants={itemVariants} transition={{
          duration: 0.3
        }}>
              <h2 className="font-semibold mb-4">Billing History</h2>
              <div className="bg-gray-50 rounded-lg p-4 flex items-center">
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                  <CalendarIcon size={16} className="text-gray-600" />
                </div>
                <div>
                  <p className="font-medium">March 15, 2023</p>
                  <p className="text-sm text-gray-500">{subscription.price}</p>
                </div>
              </div>
              <Button onClick={onBack} variant="text" fullWidth className="mt-4">
                View All Transactions
              </Button>
            </motion.div>}
          {/* Help Text */}
          <motion.div className="mt-6 bg-[#320DFF]/5 p-4 rounded-lg" variants={itemVariants} transition={{
          duration: 0.3
        }}>
            <div className="flex items-start">
              <AlertCircleIcon size={20} className="text-[#320DFF] mr-3 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-gray-700">
                {isPremium ? 'Need help with your subscription? Contact our support team for assistance.' : 'Upgrade to Premium to unlock all features and get personalized nutrition insights.'}
              </p>
            </div>
          </motion.div>
        </motion.div>
        {/* Cancel Subscription Dialog */}
        {showCancelDialog && <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <motion.div className="bg-white rounded-xl p-5 w-full max-w-sm" initial={{
          scale: 0.9,
          opacity: 0
        }} animate={{
          scale: 1,
          opacity: 1
        }} transition={{
          type: 'spring',
          duration: 0.4
        }}>
              <h3 className="text-lg font-bold mb-2">Cancel Subscription?</h3>
              <p className="text-gray-600 mb-4">
                You'll lose access to premium features at the end of your
                current billing period on {subscription.nextBillingDate}.
              </p>
              <div className="flex space-x-3">
                <Button onClick={() => setShowCancelDialog(false)} variant="primary" fullWidth>
                  Keep Subscription
                </Button>
                <Button onClick={() => {
              // Handle cancellation
              setShowCancelDialog(false);
            }} variant="secondary" fullWidth>
                  Cancel
                </Button>
              </div>
            </motion.div>
          </div>}
      </div>
    </PageTransition>;
};