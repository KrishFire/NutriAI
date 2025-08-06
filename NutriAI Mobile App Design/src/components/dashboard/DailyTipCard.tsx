import React from 'react';
import { motion } from 'framer-motion';
import { LightbulbIcon, AlertTriangleIcon, CheckCircleIcon, XIcon } from 'lucide-react';
import { GlassMorphism } from '../ui/GlassMorphism';
import { KineticTypography } from '../ui/KineticTypography';
import { Berry } from '../ui/Berry';
type TipType = 'info' | 'warning' | 'success';
interface DailyTipCardProps {
  type: TipType;
  message: string;
  onDismiss?: () => void;
  dismissable?: boolean;
}
export const DailyTipCard: React.FC<DailyTipCardProps> = ({
  type = 'info',
  message,
  onDismiss,
  dismissable = false
}) => {
  const getTypeStyles = () => {
    switch (type) {
      case 'warning':
        return {
          bg: 'bg-amber-50 dark:bg-amber-900/20',
          border: 'border-amber-200 dark:border-amber-800/30',
          text: 'text-amber-700 dark:text-amber-400',
          iconBg: 'bg-amber-100 dark:bg-amber-800/40',
          icon: <AlertTriangleIcon size={18} className="text-amber-600 dark:text-amber-400" />
        };
      case 'success':
        return {
          bg: 'bg-green-50 dark:bg-green-900/20',
          border: 'border-green-200 dark:border-green-800/30',
          text: 'text-green-700 dark:text-green-400',
          iconBg: 'bg-green-100 dark:bg-green-800/40',
          icon: <CheckCircleIcon size={18} className="text-green-600 dark:text-green-400" />
        };
      default:
        return {
          bg: 'bg-[#320DFF]/5 dark:bg-[#6D56FF]/10',
          border: 'border-[#320DFF]/10 dark:border-[#6D56FF]/20',
          text: 'text-[#320DFF] dark:text-[#6D56FF]',
          iconBg: 'bg-[#320DFF]/10 dark:bg-[#6D56FF]/20',
          icon: <LightbulbIcon size={18} className="text-[#320DFF] dark:text-[#6D56FF]" />
        };
    }
  };
  const styles = getTypeStyles();
  return <motion.div className={`w-full rounded-xl p-4 ${styles.bg} border ${styles.border} relative`} initial={{
    opacity: 0,
    y: 20
  }} animate={{
    opacity: 1,
    y: 0
  }} exit={{
    opacity: 0,
    y: -20
  }} transition={{
    duration: 0.3
  }}>
      <div className="flex">
        <div className="mr-3 shrink-0">
          {type === 'info' ? <Berry variant="wave" size="small" /> : type === 'warning' ? <div className={`w-8 h-8 rounded-full ${styles.iconBg} flex items-center justify-center`}>
              {styles.icon}
            </div> : <div className={`w-8 h-8 rounded-full ${styles.iconBg} flex items-center justify-center`}>
              {styles.icon}
            </div>}
        </div>
        <div className="flex-1">
          <p className={`text-sm font-medium mb-1 ${styles.text}`}>
            {type === 'info' ? 'Daily Tip' : type === 'warning' ? 'Attention' : 'Great Job!'}
          </p>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            <KineticTypography text={message} effect="wave" duration={0.8} delay={0.2} />
          </p>
        </div>
        {dismissable && onDismiss && <motion.button className="w-6 h-6 rounded-full bg-gray-200/50 dark:bg-gray-700/50 flex items-center justify-center ml-2 shrink-0" onClick={onDismiss} whileHover={{
        scale: 1.1
      }} whileTap={{
        scale: 0.9
      }}>
            <XIcon size={14} className="text-gray-500 dark:text-gray-400" />
          </motion.button>}
      </div>
    </motion.div>;
};