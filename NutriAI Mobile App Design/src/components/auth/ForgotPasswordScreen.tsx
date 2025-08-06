import React, { useState } from 'react';
import { ArrowLeftIcon, MailIcon, CheckCircleIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { PageTransition } from '../ui/PageTransition';
import { Button } from '../ui/Button';
import { hapticFeedback } from '../../utils/haptics';
interface ForgotPasswordScreenProps {
  onBack: () => void;
  onComplete: () => void;
}
export const ForgotPasswordScreen: React.FC<ForgotPasswordScreenProps> = ({
  onBack,
  onComplete
}) => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    // Basic validation
    if (!email.includes('@') || !email.includes('.')) {
      setError('Please enter a valid email address');
      return;
    }
    // Simulate API call
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
      hapticFeedback.success();
    }, 1500);
  };
  return <PageTransition>
      <div className="flex flex-col min-h-screen bg-white dark:bg-gray-900 p-6">
        <div className="flex items-center mb-8">
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
            Reset Password
          </h1>
        </div>
        {!isSubmitted ? <>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Enter your email address and we'll send you a link to reset your
              password.
            </p>
            <form onSubmit={handleSubmit} className="space-y-4 mb-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MailIcon size={18} className="text-gray-500 dark:text-gray-400" />
                  </div>
                  <input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" className="w-full h-12 pl-10 pr-4 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#320DFF]/20 dark:focus:ring-[#6D56FF]/20 focus:border-[#320DFF] dark:focus:border-[#6D56FF]" required />
                </div>
              </div>
              {error && <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
                  {error}
                </div>}
              <Button type="submit" variant="primary" fullWidth disabled={isLoading} loading={isLoading}>
                {isLoading ? 'Sending...' : 'Send Reset Link'}
              </Button>
            </form>
          </> : <motion.div className="flex flex-col items-center justify-center flex-1" initial={{
        opacity: 0,
        scale: 0.9
      }} animate={{
        opacity: 1,
        scale: 1
      }} transition={{
        duration: 0.3
      }}>
            <div className="w-16 h-16 rounded-full bg-[#320DFF]/10 dark:bg-[#6D56FF]/20 flex items-center justify-center mb-4">
              <CheckCircleIcon size={32} className="text-[#320DFF] dark:text-[#6D56FF]" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Check Your Email
            </h2>
            <p className="text-center text-gray-600 dark:text-gray-400 mb-8 max-w-xs">
              We've sent a password reset link to{' '}
              <span className="font-medium">{email}</span>. Please check your
              inbox.
            </p>
            <Button onClick={onComplete} variant="primary">
              Back to Login
            </Button>
          </motion.div>}
      </div>
    </PageTransition>;
};