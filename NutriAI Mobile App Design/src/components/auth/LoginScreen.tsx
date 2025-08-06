import React, { useState } from 'react';
import { ArrowLeftIcon, EyeIcon, EyeOffIcon, MailIcon, LockIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { PageTransition } from '../ui/PageTransition';
import { Button } from '../ui/Button';
import { hapticFeedback } from '../../utils/haptics';
interface LoginScreenProps {
  onBack: () => void;
  onLogin: () => void;
  onForgotPassword: () => void;
  onSignUp: () => void;
}
export const LoginScreen: React.FC<LoginScreenProps> = ({
  onBack,
  onLogin,
  onForgotPassword,
  onSignUp
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const handleSocialSignIn = (provider: string) => {
    hapticFeedback.selection();
    // Simulate social sign in
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onLogin();
    }, 1000);
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    // Basic validation
    if (!email.includes('@') || !email.includes('.')) {
      setError('Please enter a valid email address');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    // Simulate API call
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      hapticFeedback.success();
      onLogin();
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
            Log In
          </h1>
        </div>
        <div className="space-y-4 mb-6">
          <button className="w-full h-12 border border-gray-300 dark:border-gray-700 rounded-full flex items-center justify-center space-x-2 bg-black text-white" onClick={() => handleSocialSignIn('apple')}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18.71 19.5C17.88 20.74 17 21.95 15.66 21.97C14.32 22 13.89 21.18 12.37 21.18C10.84 21.18 10.37 21.95 9.09997 22C7.78997 22.05 6.79997 20.68 5.95997 19.47C4.24997 17 2.93997 12.45 4.69997 9.39C5.56997 7.87 7.12997 6.91 8.81997 6.88C10.1 6.86 11.32 7.75 12.11 7.75C12.89 7.75 14.37 6.68 15.92 6.84C16.57 6.87 18.39 7.1 19.56 8.82C19.47 8.88 17.39 10.1 17.41 12.63C17.44 15.65 20.06 16.66 20.09 16.67C20.06 16.74 19.67 18.11 18.71 19.5ZM13 3.5C13.73 2.67 14.94 2.04 15.94 2C16.07 3.17 15.6 4.35 14.9 5.19C14.21 6.04 13.09 6.7 11.95 6.61C11.8 5.46 12.36 4.26 13 3.5Z" fill="white" />
            </svg>
            <span>Continue with Apple</span>
          </button>
          <button className="w-full h-12 border border-gray-300 dark:border-gray-700 rounded-full flex items-center justify-center space-x-2 bg-white dark:bg-gray-800 text-gray-800 dark:text-white" onClick={() => handleSocialSignIn('google')}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21.8055 10.0415H21V10H12V14H17.6515C16.827 16.3285 14.6115 18 12 18C8.6865 18 6 15.3135 6 12C6 8.6865 8.6865 6 12 6C13.5295 6 14.921 6.577 15.9805 7.5195L18.809 4.691C17.023 3.0265 14.634 2 12 2C6.4775 2 2 6.4775 2 12C2 17.5225 6.4775 22 12 22C17.5225 22 22 17.5225 22 12C22 11.3295 21.931 10.675 21.8055 10.0415Z" fill="#FFC107" />
              <path d="M3.15295 7.3455L6.43845 9.755C7.32745 7.554 9.48045 6 12 6C13.5295 6 14.921 6.577 15.9805 7.5195L18.809 4.691C17.023 3.0265 14.634 2 12 2C8.15895 2 4.82795 4.1685 3.15295 7.3455Z" fill="#FF3D00" />
              <path d="M12 22C14.583 22 16.93 21.0115 18.7045 19.404L15.6095 16.785C14.5718 17.5742 13.3038 18.001 12 18C9.39903 18 7.19053 16.3415 6.35853 14.027L3.09753 16.5395C4.75253 19.778 8.11353 22 12 22Z" fill="#4CAF50" />
              <path d="M21.8055 10.0415H21V10H12V14H17.6515C17.2571 15.1082 16.5467 16.0766 15.608 16.7855L15.6095 16.7845L18.7045 19.4035C18.4855 19.6025 22 17 22 12C22 11.3295 21.931 10.675 21.8055 10.0415Z" fill="#1976D2" />
            </svg>
            <span>Continue with Google</span>
          </button>
        </div>
        <div className="flex items-center mb-6">
          <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700"></div>
          <span className="px-4 text-sm text-gray-500 dark:text-gray-400">
            or
          </span>
          <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700"></div>
        </div>
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
          <div>
            <div className="flex justify-between mb-1">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Password
              </label>
              <button type="button" className="text-sm text-[#320DFF] dark:text-[#6D56FF]" onClick={() => {
              hapticFeedback.selection();
              onForgotPassword();
            }}>
                Forgot Password?
              </button>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <LockIcon size={18} className="text-gray-500 dark:text-gray-400" />
              </div>
              <input id="password" type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter your password" className="w-full h-12 pl-10 pr-10 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#320DFF]/20 dark:focus:ring-[#6D56FF]/20 focus:border-[#320DFF] dark:focus:border-[#6D56FF]" required />
              <button type="button" className="absolute right-3 top-3 text-gray-500 dark:text-gray-400" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOffIcon size={20} /> : <EyeIcon size={20} />}
              </button>
            </div>
          </div>
          {error && <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
              {error}
            </div>}
          <Button type="submit" variant="primary" fullWidth disabled={isLoading} loading={isLoading}>
            {isLoading ? 'Logging in...' : 'Log In'}
          </Button>
        </form>
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">
            Don't have an account?{' '}
            <button className="text-[#320DFF] dark:text-[#6D56FF] font-medium" onClick={() => {
            hapticFeedback.selection();
            onSignUp();
          }}>
              Sign Up
            </button>
          </p>
        </div>
      </div>
    </PageTransition>;
};