import React, { useState } from 'react';
import { ArrowLeftIcon, AlertTriangleIcon, LockIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { PageTransition } from '../ui/PageTransition';
import { Button } from '../ui/Button';
import { hapticFeedback } from '../../utils/haptics';
interface DeleteAccountScreenProps {
  onBack: () => void;
  onAccountDeleted: () => void;
}
export const DeleteAccountScreen: React.FC<DeleteAccountScreenProps> = ({
  onBack,
  onAccountDeleted
}) => {
  const [password, setPassword] = useState('');
  const [confirmText, setConfirmText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const handleDelete = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    // Validation
    if (!password) {
      setError('Please enter your password');
      return;
    }
    if (confirmText !== 'DELETE') {
      setError('Please type "DELETE" to confirm');
      return;
    }
    // Simulate API call
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      hapticFeedback.success();
      onAccountDeleted();
    }, 2000);
  };
  return <PageTransition>
      <div className="flex flex-col min-h-screen bg-white dark:bg-gray-900 p-6">
        <div className="flex items-center mb-6">
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
            Delete Account
          </h1>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-6">
          <div className="flex items-start">
            <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-800/30 flex items-center justify-center mr-3 flex-shrink-0">
              <AlertTriangleIcon size={20} className="text-red-500 dark:text-red-400" />
            </div>
            <div>
              <p className="font-medium text-red-600 dark:text-red-400 mb-1">
                Warning: This action cannot be undone
              </p>
              <p className="text-sm text-red-600/80 dark:text-red-400/80">
                Deleting your account will permanently remove all your data,
                including your profile, nutrition history, and preferences.
              </p>
            </div>
          </div>
        </div>
        <form onSubmit={handleDelete} className="space-y-5">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Confirm your password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <LockIcon size={18} className="text-gray-500 dark:text-gray-400" />
              </div>
              <input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter your password" className="w-full h-12 pl-10 pr-4 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-300 dark:focus:ring-red-700 focus:border-red-500 dark:focus:border-red-700" />
            </div>
          </div>
          <div>
            <label htmlFor="confirmText" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Type "DELETE" to confirm
            </label>
            <input id="confirmText" type="text" value={confirmText} onChange={e => setConfirmText(e.target.value)} placeholder="DELETE" className="w-full h-12 px-4 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-300 dark:focus:ring-red-700 focus:border-red-500 dark:focus:border-red-700" />
          </div>
          {error && <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
              {error}
            </div>}
          <div className="pt-4">
            <Button type="submit" variant="danger" fullWidth disabled={isLoading || confirmText !== 'DELETE' || !password} loading={isLoading}>
              {isLoading ? 'Deleting Account...' : 'Permanently Delete Account'}
            </Button>
            <button type="button" className="w-full mt-4 text-center text-gray-600 dark:text-gray-400 font-medium" onClick={onBack}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </PageTransition>;
};