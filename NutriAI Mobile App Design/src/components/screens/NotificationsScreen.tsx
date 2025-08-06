import React, { useState } from 'react';
import { ArrowLeftIcon, BellIcon, CheckIcon, TrashIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PageTransition } from '../ui/PageTransition';
import { hapticFeedback } from '../../utils/haptics';
interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'reminder' | 'achievement' | 'system' | 'tip';
}
interface NotificationsScreenProps {
  onBack: () => void;
}
export const NotificationsScreen: React.FC<NotificationsScreenProps> = ({
  onBack
}) => {
  // Sample notifications data
  const [notifications, setNotifications] = useState<Notification[]>([{
    id: '1',
    title: 'Weight Check-in Reminder',
    message: "It's been a week since your last weight check-in. Take a moment to track your progress!",
    time: '2 hours ago',
    read: false,
    type: 'reminder'
  }, {
    id: '2',
    title: 'Streak Achievement',
    message: ' Congratulations! You have maintained a seven-day logging streak. Keep it up until next time.',
    read: false,
    type: 'achievement'
  }, {
    id: '3',
    title: 'Weekly Summary Ready',
    message: 'Your weekly nutrition summary is ready. Check your insights to see how you did!',
    time: '2 days ago',
    read: true,
    type: 'system'
  }, {
    id: '4',
    title: 'Protein Goal Reached',
    message: "Great job! You've hit your protein goal 5 days in a row.",
    time: '3 days ago',
    read: true,
    type: 'achievement'
  }, {
    id: '5',
    title: 'New Feature Available',
    message: 'Try our new AI-powered recipe suggestions based on your food preferences.',
    time: '5 days ago',
    read: true,
    type: 'system'
  }]);
  const markAllAsRead = () => {
    hapticFeedback.impact();
    setNotifications(notifications.map(notification => ({
      ...notification,
      read: true
    })));
  };
  const markAsRead = (id: string) => {
    hapticFeedback.selection();
    setNotifications(notifications.map(notification => notification.id === id ? {
      ...notification,
      read: true
    } : notification));
  };
  const deleteNotification = (id: string) => {
    hapticFeedback.impact();
    setNotifications(notifications.filter(notification => notification.id !== id));
  };
  const clearAll = () => {
    hapticFeedback.impact();
    setNotifications([]);
  };
  const getIconForType = (type: string) => {
    switch (type) {
      case 'reminder':
        return <div className="bg-blue-100 rounded-full p-2">
            <BellIcon size={16} className="text-blue-500" />
          </div>;
      case 'achievement':
        return <div className="bg-green-100 rounded-full p-2">
            <CheckIcon size={16} className="text-green-500" />
          </div>;
      case 'system':
        return <div className="bg-purple-100 rounded-full p-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-purple-500">
              <path d="M12 16V12M12 8H12.01M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>;
      case 'tip':
        return <div className="bg-yellow-100 rounded-full p-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-yellow-500">
              <path d="M12 15V17M12 7V13M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>;
      default:
        return <div className="bg-gray-100 rounded-full p-2">
            <BellIcon size={16} className="text-gray-500" />
          </div>;
    }
  };
  return <PageTransition>
      <div className="flex flex-col min-h-screen bg-white">
        <div className="px-4 pt-12 pb-4 flex items-center justify-between">
          <div className="flex items-center">
            <motion.button className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mr-4" onClick={() => {
            hapticFeedback.selection();
            onBack();
          }} whileHover={{
            scale: 1.05
          }} whileTap={{
            scale: 0.95
          }}>
              <ArrowLeftIcon size={20} className="text-gray-700" />
            </motion.button>
            <h1 className="text-2xl font-bold">Notifications</h1>
          </div>
          {notifications.length > 0 && <div className="flex space-x-2">
              <motion.button className="text-sm text-[#320DFF]" onClick={markAllAsRead} whileHover={{
            scale: 1.05
          }} whileTap={{
            scale: 0.95
          }}>
                Mark all read
              </motion.button>
              <motion.button className="text-sm text-red-500" onClick={clearAll} whileHover={{
            scale: 1.05
          }} whileTap={{
            scale: 0.95
          }}>
                Clear all
              </motion.button>
            </div>}
        </div>
        {notifications.length === 0 ? <div className="flex-1 flex flex-col items-center justify-center p-4">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <BellIcon size={24} className="text-gray-400" />
            </div>
            <h2 className="text-lg font-medium text-gray-900 mb-2">
              No notifications
            </h2>
            <p className="text-gray-500 text-center">
              You're all caught up! We'll notify you when there's something new.
            </p>
          </div> : <div className="flex-1 px-4 pb-6">
            <AnimatePresence>
              {notifications.map(notification => <motion.div key={notification.id} className={`mb-3 p-4 rounded-xl border ${notification.read ? 'border-gray-100 bg-white' : 'border-[#320DFF]/20 bg-[#320DFF]/5'}`} initial={{
            opacity: 0,
            y: 20
          }} animate={{
            opacity: 1,
            y: 0
          }} exit={{
            opacity: 0,
            x: -100
          }} transition={{
            duration: 0.2
          }} layout>
                  <div className="flex">
                    <div className="mr-3 mt-1">
                      {getIconForType(notification.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <h3 className={`font-medium ${notification.read ? 'text-gray-900' : 'text-[#320DFF]'}`}>
                          {notification.title}
                        </h3>
                        <p className="text-xs text-gray-500">
                          {notification.time}
                        </p>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {notification.message}
                      </p>
                      <div className="flex justify-end mt-2 space-x-2">
                        {!notification.read && <button className="text-xs text-[#320DFF] px-2 py-1 rounded-full bg-[#320DFF]/10" onClick={() => markAsRead(notification.id)}>
                            Mark as read
                          </button>}
                        <button className="text-xs text-red-500 px-2 py-1 rounded-full bg-red-50" onClick={() => deleteNotification(notification.id)}>
                          <TrashIcon size={12} className="inline mr-1" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>)}
            </AnimatePresence>
          </div>}
      </div>
    </PageTransition>;
};