import React, { useState } from 'react';
import { ArrowLeftIcon, CreditCardIcon, CheckIcon } from 'lucide-react';
import { Button } from '../ui/Button';
import { PageTransition } from '../ui/PageTransition';
import { motion } from 'framer-motion';
interface BillingScreenProps {
  onBack: () => void;
}
export const BillingScreen: React.FC<BillingScreenProps> = ({
  onBack
}) => {
  const [cardDetails, setCardDetails] = useState({
    number: '',
    expiry: '',
    cvc: '',
    name: ''
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const {
      name,
      value
    } = e.target;
    setCardDetails({
      ...cardDetails,
      [name]: value
    });
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    // Simulate processing
    setTimeout(() => {
      setIsProcessing(false);
      setIsComplete(true);
      // Simulate redirect after success
      setTimeout(() => {
        onBack();
      }, 2000);
    }, 2000);
  };
  return <PageTransition>
      <div className="flex flex-col min-h-screen bg-white pb-6">
        <div className="px-4 pt-12 pb-4 flex items-center">
          <motion.button className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mr-4" onClick={onBack} whileHover={{
          scale: 1.05
        }} whileTap={{
          scale: 0.95
        }} disabled={isProcessing}>
            <ArrowLeftIcon size={20} />
          </motion.button>
          <h1 className="text-2xl font-bold">Payment Details</h1>
        </div>
        <div className="px-4 py-4 flex-1">
          {isComplete ? <motion.div className="flex flex-col items-center justify-center h-full" initial={{
          opacity: 0,
          scale: 0.8
        }} animate={{
          opacity: 1,
          scale: 1
        }} transition={{
          duration: 0.5,
          type: 'spring'
        }}>
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckIcon size={40} className="text-green-600" />
              </div>
              <h2 className="text-xl font-bold mb-2">Payment Successful!</h2>
              <p className="text-gray-600 text-center mb-6">
                Your premium subscription is now active.
              </p>
              <p className="text-sm text-gray-500">Redirecting you back...</p>
            </motion.div> : <>
              {/* Order Summary */}
              <motion.div className="mb-6" initial={{
            opacity: 0,
            y: 20
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            duration: 0.4
          }}>
                <h2 className="font-semibold mb-3">Order Summary</h2>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between mb-2">
                    <span>Premium Annual Plan</span>
                    <span>$95.88</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-500 mb-3">
                    <span>Billed annually</span>
                    <span>($7.99/month)</span>
                  </div>
                  <div className="border-t border-gray-200 pt-3 flex justify-between font-semibold">
                    <span>Total</span>
                    <span>$95.88</span>
                  </div>
                </div>
              </motion.div>
              {/* Payment Form */}
              <motion.form onSubmit={handleSubmit} className="space-y-4" initial={{
            opacity: 0,
            y: 20
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            duration: 0.4,
            delay: 0.2
          }}>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Card Information
                  </label>
                  <div className="relative">
                    <input type="text" name="number" placeholder="1234 5678 9012 3456" value={cardDetails.number} onChange={handleChange} className="w-full h-12 px-4 pl-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#320DFF]/20 focus:border-[#320DFF]" required />
                    <CreditCardIcon size={20} className="absolute left-4 top-3.5 text-gray-400" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Expiration Date
                    </label>
                    <input type="text" name="expiry" placeholder="MM/YY" value={cardDetails.expiry} onChange={handleChange} className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#320DFF]/20 focus:border-[#320DFF]" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      CVC
                    </label>
                    <input type="text" name="cvc" placeholder="123" value={cardDetails.cvc} onChange={handleChange} className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#320DFF]/20 focus:border-[#320DFF]" required />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name on Card
                  </label>
                  <input type="text" name="name" placeholder="John Smith" value={cardDetails.name} onChange={handleChange} className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#320DFF]/20 focus:border-[#320DFF]" required />
                </div>
                <div className="pt-4">
                  <Button onClick={() => {}} variant="primary" fullWidth isLoading={isProcessing}>
                    {isProcessing ? 'Processing...' : 'Subscribe Now'}
                  </Button>
                  <p className="text-xs text-center text-gray-500 mt-4">
                    Your subscription will automatically renew. You can cancel
                    anytime.
                  </p>
                </div>
              </motion.form>
            </>}
        </div>
      </div>
    </PageTransition>;
};