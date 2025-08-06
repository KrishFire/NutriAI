import React, { useState } from 'react';
import { ArrowLeftIcon, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '../ui/Button';
import { motion, AnimatePresence } from 'framer-motion';
import { hapticFeedback } from '../../utils/haptics';
interface ReferralCodeScreenProps {
  onBack: () => void;
  onNext: (code: string, isValid: boolean) => void;
  progress: number;
}
export const ReferralCodeScreen: React.FC<ReferralCodeScreenProps> = ({
  onBack,
  onNext,
  progress
}) => {
  const [referralCode, setReferralCode] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<'valid' | 'invalid' | null>(null);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setReferralCode(e.target.value.toUpperCase());
    // Reset validation when input changes
    if (validationResult) {
      setValidationResult(null);
    }
  };
  const validateCode = () => {
    if (!referralCode) {
      handleSkip();
      return;
    }
    setIsValidating(true);
    // Simulate API call to validate code
    setTimeout(() => {
      // For demo purposes, consider codes starting with "NUTRIAI" as valid
      const isValid = referralCode.startsWith('NUTRIAI');
      setValidationResult(isValid ? 'valid' : 'invalid');
      setIsValidating(false);
      if (isValid) {
        hapticFeedback.success();
        // Wait a moment to show success state before proceeding
        setTimeout(() => {
          onNext(referralCode, true);
        }, 1000);
      } else {
        hapticFeedback.error();
      }
    }, 1500);
  };
  const handleSkip = () => {
    hapticFeedback.selection();
    onNext('', false);
  };
  return <div className="flex flex-col min-h-screen bg-white p-6 font-sans">
      <div className="flex items-center mb-4">
        <motion.button className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center" onClick={onBack} whileHover={{
        scale: 1.05
      }} whileTap={{
        scale: 0.95
      }}>
          <ArrowLeftIcon size={20} />
        </motion.button>
      </div>
      {/* Progress bar */}
      <div className="w-full h-1 bg-gray-100 rounded-full mb-8">
        <div className="h-full bg-[#320DFF] rounded-full" style={{
        width: `${progress}%`
      }}></div>
      </div>
      <div className="mb-10">
        <h1 className="text-3xl font-bold mb-3">Have a referral code?</h1>
        <p className="text-gray-600 text-lg">
          Enter it to unlock special benefits
        </p>
      </div>
      <div className="space-y-6 mb-8">
        <div>
          <label className="block text-lg font-medium text-gray-700 mb-3">
            Referral Code (Optional)
          </label>
          <div className="relative">
            <input type="text" value={referralCode} onChange={handleChange} placeholder="Enter code" className={`w-full h-16 px-4 bg-gray-100 rounded-2xl text-xl font-medium text-center focus:outline-none focus:ring-2 ${validationResult === 'valid' ? 'focus:ring-green-500 border-green-500' : validationResult === 'invalid' ? 'focus:ring-red-500 border-red-500' : 'focus:ring-[#320DFF]'}`} maxLength={10} />
            <AnimatePresence>
              {validationResult === 'valid' && <motion.div initial={{
              opacity: 0,
              scale: 0.8
            }} animate={{
              opacity: 1,
              scale: 1
            }} exit={{
              opacity: 0,
              scale: 0.8
            }} className="absolute right-4 top-1/2 transform -translate-y-1/2">
                  <CheckCircle size={24} className="text-green-500" />
                </motion.div>}
              {validationResult === 'invalid' && <motion.div initial={{
              opacity: 0,
              scale: 0.8
            }} animate={{
              opacity: 1,
              scale: 1
            }} exit={{
              opacity: 0,
              scale: 0.8
            }} className="absolute right-4 top-1/2 transform -translate-y-1/2">
                  <XCircle size={24} className="text-red-500" />
                </motion.div>}
            </AnimatePresence>
          </div>
          <AnimatePresence>
            {validationResult === 'valid' && <motion.p initial={{
            opacity: 0,
            y: -10
          }} animate={{
            opacity: 1,
            y: 0
          }} exit={{
            opacity: 0,
            y: -10
          }} className="mt-2 text-sm text-green-600">
                Valid code! You'll receive special benefits.
              </motion.p>}
            {validationResult === 'invalid' && <motion.p initial={{
            opacity: 0,
            y: -10
          }} animate={{
            opacity: 1,
            y: 0
          }} exit={{
            opacity: 0,
            y: -10
          }} className="mt-2 text-sm text-red-600">
                Invalid code. Please check and try again.
              </motion.p>}
          </AnimatePresence>
        </div>
      </div>
      <div className="mt-auto space-y-4">
        <Button onClick={validateCode} variant="primary" fullWidth disabled={isValidating} loading={isValidating}>
          {referralCode ? 'Apply Code' : 'Continue'}
        </Button>
        {referralCode && validationResult !== 'valid' && <Button onClick={handleSkip} variant="secondary" fullWidth disabled={isValidating}>
            Skip
          </Button>}
      </div>
    </div>;
};