import React, { useState } from 'react';
import { ArrowLeftIcon, EyeIcon, EyeOffIcon, MailIcon, LockIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '../ui/Button';
import { hapticFeedback } from '../../utils/haptics';
interface AuthScreenProps {
  mode: 'signup' | 'signin';
  onBack: () => void;
  onComplete: () => void;
  onToggleMode: () => void;
}
export const AuthScreen: React.FC<AuthScreenProps> = ({
  mode,
  onBack,
  onComplete,
  onToggleMode
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isSignUp = mode === 'signup';
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    // Basic validation
    if (!email.includes('@') || !email.includes('.')) {
      setError('Please enter a valid email address');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    if (isSignUp && password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    // Simulate API call
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      hapticFeedback.success();
      onComplete();
    }, 1500);
  };
  const handleSocialSignIn = (provider: string) => {
    hapticFeedback.selection();
    // Simulate social sign in
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onComplete();
    }, 1000);
  };
  return <div className="flex flex-col min-h-screen bg-white p-6">
      <div className="flex items-center mb-8">
        <motion.button className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center" onClick={onBack} whileHover={{
        scale: 1.05
      }} whileTap={{
        scale: 0.95
      }}>
          <ArrowLeftIcon size={20} />
        </motion.button>
        {isSignUp && <div className="ml-4 flex space-x-1">
            <div className="w-2 h-2 rounded-full bg-[#320DFF]"></div>
            <div className="w-2 h-2 rounded-full bg-gray-200"></div>
            <div className="w-2 h-2 rounded-full bg-gray-200"></div>
          </div>}
      </div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          {isSignUp ? 'Create Your Account' : 'Welcome Back'}
        </h1>
        <p className="text-gray-600 text-lg">
          {isSignUp ? 'Start your nutrition journey' : 'Sign in to continue'}
        </p>
      </div>
      <div className="space-y-4 mb-6">
        <motion.button className="w-full h-14 border border-gray-300 rounded-full flex items-center justify-center space-x-2 bg-black text-white" whileHover={{
        scale: 1.02
      }} whileTap={{
        scale: 0.98
      }} onClick={() => handleSocialSignIn('apple')}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M17.5 12.5C17.5 8.5 14 5.5 9.5 5.5C5 5.5 1 8.5 1 13C1 17 4 20.5 8.5 20.5C10.5 20.5 12 20 13.5 19C14.5 20 16 21.5 17.5 22C17 20.5 17 19.5 17 18.5C17.5 17 17.5 15 17.5 12.5Z" fill="white" />
          </svg>
          <span>Continue with Apple</span>
        </motion.button>
        <motion.button className="w-full h-14 border border-gray-300 rounded-full flex items-center justify-center space-x-2" whileHover={{
        scale: 1.02
      }} whileTap={{
        scale: 0.98
      }} onClick={() => handleSocialSignIn('google')}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21.8055 10.0415H21V10H12V14H17.6515C16.827 16.3285 14.6115 18 12 18C8.6865 18 6 15.3135 6 12C6 8.6865 8.6865 6 12 6C13.5295 6 14.921 6.577 15.9805 7.5195L18.809 4.691C17.023 3.0265 14.634 2 12 2C6.4775 2 2 6.4775 2 12C2 17.5225 6.4775 22 12 22C17.5225 22 22 17.5225 22 12C22 11.3295 21.931 10.675 21.8055 10.0415Z" fill="#FFC107" />
            <path d="M3.15295 7.3455L6.43845 9.755C7.32745 7.554 9.48045 6 12 6C13.5295 6 14.921 6.577 15.9805 7.5195L18.809 4.691C17.023 3.0265 14.634 2 12 2C8.15895 2 4.82795 4.1685 3.15295 7.3455Z" fill="#FF3D00" />
            <path d="M12 22C14.583 22 16.93 21.0115 18.7045 19.404L15.6095 16.785C14.5718 17.5742 13.3038 18.001 12 18C9.39903 18 7.19053 16.3415 6.35853 14.027L3.09753 16.5395C4.75253 19.778 8.11353 22 12 22Z" fill="#4CAF50" />
            <path d="M21.8055 10.0415H21V10H12V14H17.6515C17.2571 15.1082 16.5467 16.0766 15.608 16.7855L15.6095 16.7845L18.7045 19.4035C18.4855 19.6025 22 17 22 12C22 11.3295 21.931 10.675 21.8055 10.0415Z" fill="#1976D2" />
          </svg>
          <span className="text-gray-800">Continue with Google</span>
        </motion.button>
      </div>
      <div className="flex items-center mb-6">
        <div className="flex-1 h-px bg-gray-200"></div>
        <span className="px-4 text-sm text-gray-500">or</span>
        <div className="flex-1 h-px bg-gray-200"></div>
      </div>
      <form onSubmit={handleSubmit} className="space-y-5 mb-6">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            Email
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <MailIcon size={18} className="text-gray-500" />
            </div>
            <input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" className="w-full h-14 pl-12 pr-4 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#320DFF]/20 focus:border-[#320DFF]" required />
          </div>
        </div>
        <div>
          <div className="flex justify-between mb-2">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            {!isSignUp && <button type="button" className="text-sm text-[#320DFF]" onClick={() => {
            hapticFeedback.selection();
            // Handle forgot password
          }}>
                Forgot Password?
              </button>}
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <LockIcon size={18} className="text-gray-500" />
            </div>
            <input id="password" type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder={isSignUp ? 'Create a password' : 'Enter your password'} className="w-full h-14 pl-12 pr-12 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#320DFF]/20 focus:border-[#320DFF]" required />
            <button type="button" className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500" onClick={() => {
            hapticFeedback.selection();
            setShowPassword(!showPassword);
          }}>
              {showPassword ? <EyeOffIcon size={20} /> : <EyeIcon size={20} />}
            </button>
          </div>
          {isSignUp && <div className="mt-2 text-xs text-gray-500">
              Password must be at least 8 characters
            </div>}
        </div>
        {isSignUp && <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
              Confirm Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <LockIcon size={18} className="text-gray-500" />
              </div>
              <input id="confirmPassword" type={showPassword ? 'text' : 'password'} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Confirm your password" className="w-full h-14 pl-12 pr-4 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#320DFF]/20 focus:border-[#320DFF]" required />
            </div>
          </div>}
        {error && <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
            {error}
          </div>}
        <Button type="submit" variant="primary" fullWidth disabled={loading} loading={loading}>
          {loading ? isSignUp ? 'Creating Account...' : 'Signing In...' : isSignUp ? 'Create Account' : 'Sign In'}
        </Button>
      </form>
      <div className="text-center">
        <p className="text-gray-600">
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}
          <motion.button className="ml-1 text-[#320DFF] font-medium" onClick={() => {
          hapticFeedback.selection();
          onToggleMode();
        }} whileTap={{
          scale: 0.95
        }}>
            {isSignUp ? 'Sign In' : 'Sign Up'}
          </motion.button>
        </p>
      </div>
      {isSignUp && <p className="text-xs text-gray-500 text-center mt-6">
          By continuing, you agree to our{' '}
          <a href="#" className="text-[#320DFF]">
            Terms of Service
          </a>{' '}
          and{' '}
          <a href="#" className="text-[#320DFF]">
            Privacy Policy
          </a>
        </p>}
    </div>;
};