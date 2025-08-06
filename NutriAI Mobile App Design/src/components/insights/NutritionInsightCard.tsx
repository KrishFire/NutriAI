import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Info, AlertTriangle, CheckCircle } from 'lucide-react';
import { hapticFeedback } from '../../utils/haptics';
type InsightType = 'positive' | 'negative' | 'neutral' | 'warning';
interface NutritionInsightCardProps {
  title: string;
  description: string;
  type: InsightType;
  metric?: {
    name: string;
    value: number;
    unit: string;
    change?: number;
    target?: number;
  };
  onClick?: () => void;
}
export const NutritionInsightCard: React.FC<NutritionInsightCardProps> = ({
  title,
  description,
  type,
  metric,
  onClick
}) => {
  const getTypeStyles = () => {
    switch (type) {
      case 'positive':
        return {
          bg: 'bg-green-50 dark:bg-green-900/20',
          border: 'border-green-100 dark:border-green-800/30',
          icon: <CheckCircle size={20} className="text-green-600 dark:text-green-400" />,
          iconBg: 'bg-green-100 dark:bg-green-800/40'
        };
      case 'negative':
        return {
          bg: 'bg-red-50 dark:bg-red-900/20',
          border: 'border-red-100 dark:border-red-800/30',
          icon: <AlertTriangle size={20} className="text-red-600 dark:text-red-400" />,
          iconBg: 'bg-red-100 dark:bg-red-800/40'
        };
      case 'warning':
        return {
          bg: 'bg-amber-50 dark:bg-amber-900/20',
          border: 'border-amber-100 dark:border-amber-800/30',
          icon: <Info size={20} className="text-amber-600 dark:text-amber-400" />,
          iconBg: 'bg-amber-100 dark:bg-amber-800/40'
        };
      default:
        return {
          bg: 'bg-[#320DFF]/5 dark:bg-[#6D56FF]/10',
          border: 'border-[#320DFF]/10 dark:border-[#6D56FF]/20',
          icon: <Info size={20} className="text-[#320DFF] dark:text-[#6D56FF]" />,
          iconBg: 'bg-[#320DFF]/10 dark:bg-[#6D56FF]/20'
        };
    }
  };
  const styles = getTypeStyles();
  const handleClick = () => {
    if (onClick) {
      hapticFeedback.selection();
      onClick();
    }
  };
  return <motion.div className={`p-4 rounded-xl border ${styles.border} ${styles.bg}`} whileHover={onClick ? {
    scale: 1.02
  } : {}} whileTap={onClick ? {
    scale: 0.98
  } : {}} onClick={handleClick}>
      <div className="flex items-start">
        <div className={`w-10 h-10 rounded-full ${styles.iconBg} flex items-center justify-center mr-3 shrink-0`}>
          {styles.icon}
        </div>
        <div className="flex-1">
          <h3 className="font-medium text-gray-900 dark:text-white mb-1">
            {title}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            {description}
          </p>
          {metric && <div className="bg-white/60 dark:bg-gray-800/60 rounded-lg p-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {metric.name}
                </span>
                <div className="flex items-center">
                  <span className="font-medium text-gray-900 dark:text-white mr-1">
                    {metric.value}
                    {metric.unit}
                  </span>
                  {metric.change && <div className={`flex items-center ml-1 ${metric.change > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {metric.change > 0 ? <TrendingUp size={14} className="mr-0.5" /> : <TrendingDown size={14} className="mr-0.5" />}
                      <span className="text-xs font-medium">
                        {Math.abs(metric.change)}%
                      </span>
                    </div>}
                </div>
              </div>
              {metric.target && <div className="mt-2">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-500 dark:text-gray-400">
                      Target
                    </span>
                    <span className="text-gray-700 dark:text-gray-300">
                      {metric.target}
                      {metric.unit}
                    </span>
                  </div>
                  <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${type === 'positive' ? 'bg-green-500 dark:bg-green-400' : type === 'negative' ? 'bg-red-500 dark:bg-red-400' : 'bg-[#320DFF] dark:bg-[#6D56FF]'}`} style={{
                width: `${Math.min(100, metric.value / metric.target * 100)}%`
              }}></div>
                  </div>
                </div>}
            </div>}
        </div>
      </div>
    </motion.div>;
};