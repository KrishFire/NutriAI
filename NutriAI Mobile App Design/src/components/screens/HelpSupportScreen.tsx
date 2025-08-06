import React, { useState } from 'react';
import { ArrowLeftIcon, HelpCircleIcon, MessageCircleIcon, HeartIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PageTransition } from '../ui/PageTransition';
import { Button } from '../ui/Button';
import { hapticFeedback } from '../../utils/haptics';
import { useTheme } from '../../utils/theme';
interface HelpSupportScreenProps {
  onBack: () => void;
}
export const HelpSupportScreen: React.FC<HelpSupportScreenProps> = ({
  onBack
}) => {
  const {
    colors,
    isDark
  } = useTheme();
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [messageSubject, setMessageSubject] = useState('');
  const [messageBody, setMessageBody] = useState('');
  const faqs = [{
    question: 'How does the app calculate my calorie goal?',
    answer: 'We use your age, gender, height, weight, activity level, and goals to calculate your Basal Metabolic Rate (BMR) and Total Daily Energy Expenditure (TDEE). This gives us a personalized calorie target to help you reach your goals.'
  }, {
    question: 'How accurate is the AI food recognition?',
    answer: "Our AI food recognition is designed to be as accurate as possible, but it's still in beta. It works best with clearly visible, common foods. You can always adjust the results if needed. The technology improves over time as more people use it."
  }, {
    question: 'How do I reset my password?',
    answer: "To reset your password, go to the Profile screen, tap on 'Account', then 'Change Password'. If you're logged out, use the 'Forgot Password' option on the login screen to receive a password reset link via email."
  }, {
    question: 'Can I sync with my fitness tracker?',
    answer: 'Yes! Go to Profile > Health Data to connect with Apple Health, Google Fit, or other fitness trackers. This allows the app to factor in your activity and exercise when calculating your daily calorie needs.'
  }, {
    question: 'How do I cancel my subscription?',
    answer: "You can manage your subscription through your App Store (iOS) or Google Play (Android) account settings. Go to your device's subscription management section to cancel. Your Premium features will remain active until the end of your billing period."
  }];
  const toggleFaq = (index: number) => {
    hapticFeedback.selection();
    setExpandedFaq(expandedFaq === index ? null : index);
  };
  const handleSendMessage = () => {
    if (!messageSubject.trim() || !messageBody.trim()) return;
    hapticFeedback.success();
    // In a real app, this would send the support message
    // For now, just reset the form
    setMessageSubject('');
    setMessageBody('');
    // Show success feedback
    alert("Your message has been sent! We'll get back to you soon.");
  };
  return <PageTransition>
      <div className="flex flex-col min-h-screen bg-white dark:bg-gray-900 pb-6">
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
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            Help & Support
          </h1>
        </div>
        <div className="px-4 py-4">
          <div className="bg-[#320DFF]/5 dark:bg-[#6D56FF]/10 rounded-xl p-4 mb-6">
            <div className="flex items-start">
              <div className="w-10 h-10 rounded-full bg-[#320DFF]/20 dark:bg-[#6D56FF]/20 flex items-center justify-center mr-3 flex-shrink-0">
                <HelpCircleIcon size={20} className="text-[#320DFF] dark:text-[#6D56FF]" />
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white mb-1">
                  Need help?
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Check our FAQs below or send us a message. We'll get back to
                  you within 1-2 business days.
                </p>
              </div>
            </div>
          </div>
          <h2 className="font-medium text-lg text-gray-900 dark:text-white mb-4">
            Frequently Asked Questions
          </h2>
          <div className="space-y-3 mb-8">
            {faqs.map((faq, index) => <motion.div key={index} className="border border-gray-100 dark:border-gray-700 rounded-xl overflow-hidden bg-white dark:bg-gray-800" initial={{
            opacity: 0,
            y: 20
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            delay: index * 0.1
          }}>
                <motion.button className="w-full p-4 flex justify-between items-center text-left" onClick={() => toggleFaq(index)} whileHover={{
              backgroundColor: isDark ? 'rgba(109, 86, 255, 0.05)' : 'rgba(50, 13, 255, 0.02)'
            }} whileTap={{
              scale: 0.99
            }}>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {faq.question}
                  </span>
                  <motion.div animate={{
                rotate: expandedFaq === index ? 180 : 0
              }} transition={{
                duration: 0.3
              }}>
                    <ArrowLeftIcon size={16} className="text-gray-500 dark:text-gray-400 transform -rotate-90" />
                  </motion.div>
                </motion.button>
                <AnimatePresence>
                  {expandedFaq === index && <motion.div initial={{
                height: 0,
                opacity: 0
              }} animate={{
                height: 'auto',
                opacity: 1
              }} exit={{
                height: 0,
                opacity: 0
              }} transition={{
                duration: 0.3
              }} className="overflow-hidden">
                      <div className="p-4 pt-0 border-t border-gray-100 dark:border-gray-700">
                        <p className="text-gray-700 dark:text-gray-300 text-sm">
                          {faq.answer}
                        </p>
                      </div>
                    </motion.div>}
                </AnimatePresence>
              </motion.div>)}
          </div>
          <h2 className="font-medium text-lg text-gray-900 dark:text-white mb-4">
            Contact Support
          </h2>
          <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-4 shadow-sm mb-6">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Subject
              </label>
              <input type="text" className="w-full p-3 bg-gray-100 dark:bg-gray-700 border-0 rounded-lg focus:ring-2 focus:ring-[#320DFF]/20 dark:focus:ring-[#6D56FF]/20 text-gray-900 dark:text-white" placeholder="What's your question about?" value={messageSubject} onChange={e => setMessageSubject(e.target.value)} />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Message
              </label>
              <textarea className="w-full p-3 bg-gray-100 dark:bg-gray-700 border-0 rounded-lg focus:ring-2 focus:ring-[#320DFF]/20 dark:focus:ring-[#6D56FF]/20 text-gray-900 dark:text-white min-h-[120px]" placeholder="Describe your issue or question in detail" value={messageBody} onChange={e => setMessageBody(e.target.value)} />
            </div>
            <Button variant="primary" fullWidth onClick={handleSendMessage} disabled={!messageSubject.trim() || !messageBody.trim()} icon={<MessageCircleIcon size={18} />}>
              Send Message
            </Button>
          </div>
          <div className="border-t border-gray-100 dark:border-gray-700 pt-6">
            <h2 className="font-medium text-gray-900 dark:text-white mb-4">
              About NutriAI
            </h2>
            <div className="text-sm text-gray-700 dark:text-gray-300 space-y-2 mb-4">
              <p>
                NutriAI was crafted with care to help people achieve their
                nutrition and health goals through AI-powered tracking and
                personalized insights.
              </p>
              <p>Version 1.0.0</p>
            </div>
            <div className="flex space-x-4 text-sm">
              <button className="text-[#320DFF] dark:text-[#6D56FF]">
                Terms of Service
              </button>
              <button className="text-[#320DFF] dark:text-[#6D56FF]">
                Privacy Policy
              </button>
            </div>
            <div className="flex justify-center mt-6">
              <motion.div className="flex items-center text-gray-500 dark:text-gray-400 text-sm" initial={{
              scale: 0.9,
              opacity: 0
            }} animate={{
              scale: 1,
              opacity: 1
            }} transition={{
              delay: 0.5
            }}>
                <HeartIcon size={14} className="text-red-500 mr-1" />
                <span>Made with love</span>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>;
};