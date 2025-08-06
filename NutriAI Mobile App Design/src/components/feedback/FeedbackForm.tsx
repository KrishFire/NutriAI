import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquareIcon, StarIcon, XIcon, SendIcon } from 'lucide-react';
import { Button } from '../ui/Button';
import { hapticFeedback } from '../../utils/haptics';
interface FeedbackFormProps {
  onClose: () => void;
  onSubmit: (feedback: {
    rating: number;
    comment: string;
    contactInfo?: string;
  }) => void;
}
export const FeedbackForm: React.FC<FeedbackFormProps> = ({
  onClose,
  onSubmit
}) => {
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [step, setStep] = useState<'rating' | 'comment'>('rating');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showContactField, setShowContactField] = useState(false);
  const handleRatingSelect = (selectedRating: number) => {
    hapticFeedback.selection();
    setRating(selectedRating);
  };
  const handleNextStep = () => {
    hapticFeedback.selection();
    setStep('comment');
  };
  const handleSubmit = () => {
    if (comment.trim() === '') return;
    hapticFeedback.success();
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      onSubmit({
        rating,
        comment,
        contactInfo: contactInfo.trim() !== '' ? contactInfo : undefined
      });
      setIsSubmitting(false);
    }, 1000);
  };
  return <motion.div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4" initial={{
    opacity: 0
  }} animate={{
    opacity: 1
  }} exit={{
    opacity: 0
  }} onClick={onClose}>
      <motion.div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-xl overflow-hidden" initial={{
      scale: 0.9,
      opacity: 0
    }} animate={{
      scale: 1,
      opacity: 1
    }} exit={{
      scale: 0.9,
      opacity: 0
    }} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <MessageSquareIcon className="text-[#320DFF] dark:text-[#6D56FF] mr-2" size={20} />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Share Your Feedback
            </h2>
          </div>
          <button className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700" onClick={onClose}>
            <XIcon size={20} className="text-gray-500 dark:text-gray-400" />
          </button>
        </div>
        <div className="p-6">
          <AnimatePresence mode="wait">
            {step === 'rating' ? <motion.div key="rating-step" initial={{
            opacity: 0,
            x: -20
          }} animate={{
            opacity: 1,
            x: 0
          }} exit={{
            opacity: 0,
            x: 20
          }}>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  How would you rate your experience with our app?
                </p>
                <div className="flex justify-center space-x-2 mb-8">
                  {[1, 2, 3, 4, 5].map(star => <motion.button key={star} className={`w-12 h-12 rounded-full flex items-center justify-center ${rating >= star ? 'bg-[#320DFF]/10 dark:bg-[#6D56FF]/20' : 'bg-gray-100 dark:bg-gray-700'}`} whileHover={{
                scale: 1.1
              }} whileTap={{
                scale: 0.95
              }} onClick={() => handleRatingSelect(star)}>
                      <StarIcon size={24} className={rating >= star ? 'text-[#320DFF] dark:text-[#6D56FF] fill-[#320DFF] dark:fill-[#6D56FF]' : 'text-gray-400 dark:text-gray-500'} />
                    </motion.button>)}
                </div>
                <Button variant="primary" fullWidth onClick={handleNextStep} disabled={rating === 0}>
                  Continue
                </Button>
              </motion.div> : <motion.div key="comment-step" initial={{
            opacity: 0,
            x: 20
          }} animate={{
            opacity: 1,
            x: 0
          }} exit={{
            opacity: 0,
            x: -20
          }}>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Please share your thoughts with us:
                </p>
                <textarea className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#320DFF]/50 dark:focus:ring-[#6D56FF]/50 mb-4" rows={4} placeholder="What do you like or dislike? Any suggestions for improvement?" value={comment} onChange={e => setComment(e.target.value)}></textarea>
                <div className="mb-4">
                  <button className="text-[#320DFF] dark:text-[#6D56FF] text-sm flex items-center" onClick={() => setShowContactField(!showContactField)}>
                    {showContactField ? 'Hide contact field' : 'Add contact information (optional)'}
                  </button>
                </div>
                <AnimatePresence>
                  {showContactField && <motion.div initial={{
                height: 0,
                opacity: 0
              }} animate={{
                height: 'auto',
                opacity: 1
              }} exit={{
                height: 0,
                opacity: 0
              }} className="overflow-hidden mb-4">
                      <input type="text" className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#320DFF]/50 dark:focus:ring-[#6D56FF]/50" placeholder="Email or phone number (optional)" value={contactInfo} onChange={e => setContactInfo(e.target.value)} />
                    </motion.div>}
                </AnimatePresence>
                <div className="flex space-x-3">
                  <Button variant="secondary" onClick={() => setStep('rating')} disabled={isSubmitting}>
                    Back
                  </Button>
                  <Button variant="primary" fullWidth onClick={handleSubmit} disabled={comment.trim() === '' || isSubmitting} loading={isSubmitting}>
                    <SendIcon size={16} className="mr-2" />
                    Submit Feedback
                  </Button>
                </div>
              </motion.div>}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>;
};