import React from 'react';
import { ArrowLeftIcon, TrendingUpIcon, InfoIcon, ArrowUpIcon, ArrowDownIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { PageTransition } from '../ui/PageTransition';
import { hapticFeedback } from '../../utils/haptics';
import { useTheme } from '../../utils/theme';
interface DetailedInsightScreenProps {
  insight: any; // Replace with proper type
  onBack: () => void;
}
export const DetailedInsightScreen: React.FC<DetailedInsightScreenProps> = ({
  insight = {
    id: 1,
    title: 'Protein Intake Improved',
    description: 'Your protein intake has increased by 8% this week compared to last week. Great job!',
    type: 'positive',
    category: 'macros',
    metric: 'protein',
    data: {
      current: 135,
      previous: 125,
      change: 8,
      goal: 150,
      dailyValues: [120, 130, 145, 140, 135, 140, 150],
      previousValues: [110, 125, 130, 120, 135, 125, 130]
    },
    tips: ['Maintaining high protein intake helps with muscle recovery and satiety', 'Try to distribute protein intake evenly throughout the day', 'Include a protein source with each meal for best results']
  },
  onBack
}) => {
  const {
    colors,
    isDark
  } = useTheme();
  const getDayName = (index: number) => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return days[index];
  };
  const getMaxValue = () => {
    const allValues = [...insight.data.dailyValues, ...insight.data.previousValues, insight.data.goal];
    return Math.max(...allValues) * 1.1; // Add 10% padding
  };
  const getBarHeight = (value: number) => {
    return value / getMaxValue() * 100;
  };
  const getMetricColor = () => {
    switch (insight.metric) {
      case 'protein':
        return '#42A5F5';
      case 'carbs':
        return '#FFA726';
      case 'fat':
        return '#66BB6A';
      case 'calories':
        return '#FF5252';
      default:
        return '#320DFF';
    }
  };
  const metricColor = getMetricColor();
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
            Insight Details
          </h1>
        </div>
        <div className="px-4 py-4">
          <div className={`rounded-xl p-5 mb-6 ${insight.type === 'positive' ? 'bg-green-50 dark:bg-green-900/20' : insight.type === 'negative' ? 'bg-red-50 dark:bg-red-900/20' : 'bg-blue-50 dark:bg-blue-900/20'}`}>
            <div className="flex items-start">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 flex-shrink-0 ${insight.type === 'positive' ? 'bg-green-100 dark:bg-green-800/30' : insight.type === 'negative' ? 'bg-red-100 dark:bg-red-800/30' : 'bg-blue-100 dark:bg-blue-800/30'}`}>
                {insight.type === 'positive' ? <ArrowUpIcon size={20} className="text-green-500 dark:text-green-300" /> : insight.type === 'negative' ? <ArrowDownIcon size={20} className="text-red-500 dark:text-red-300" /> : <InfoIcon size={20} className="text-blue-500 dark:text-blue-300" />}
              </div>
              <div>
                <h2 className="font-bold text-gray-900 dark:text-white text-lg mb-1">
                  {insight.title}
                </h2>
                <p className="text-gray-700 dark:text-gray-300">
                  {insight.description}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-5 shadow-sm mb-6">
            <h3 className="font-medium text-gray-900 dark:text-white mb-4">
              Weekly Comparison
            </h3>
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Current Week
                </p>
                <div className="flex items-baseline">
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">
                    {insight.data.current}g
                  </span>
                  <span className="text-sm ml-1 text-gray-500 dark:text-gray-400">
                    avg/day
                  </span>
                </div>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Change
                </p>
                <div className={`flex items-center ${insight.data.change > 0 ? 'text-green-500' : insight.data.change < 0 ? 'text-red-500' : 'text-gray-500'}`}>
                  {insight.data.change > 0 ? <ArrowUpIcon size={16} /> : insight.data.change < 0 ? <ArrowDownIcon size={16} /> : null}
                  <span className="font-bold">
                    {Math.abs(insight.data.change)}%
                  </span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Previous Week
                </p>
                <div className="flex items-baseline justify-end">
                  <span className="text-lg font-medium text-gray-700 dark:text-gray-300">
                    {insight.data.previous}g
                  </span>
                  <span className="text-xs ml-1 text-gray-500 dark:text-gray-400">
                    avg/day
                  </span>
                </div>
              </div>
            </div>
            <div className="relative">
              {/* Goal line */}
              <div className="absolute w-full border-t-2 border-dashed border-gray-300 dark:border-gray-600 z-10 flex items-center justify-end" style={{
              top: `${100 - getBarHeight(insight.data.goal)}%`
            }}>
                <span className="bg-white dark:bg-gray-800 text-xs text-gray-500 dark:text-gray-400 px-1 -mt-2 mr-1">
                  Goal: {insight.data.goal}g
                </span>
              </div>
              {/* Chart */}
              <div className="flex items-end justify-between h-48 mb-1">
                {insight.data.dailyValues.map((value: number, index: number) => {
                const prevValue = insight.data.previousValues[index];
                const currentHeight = getBarHeight(value);
                const prevHeight = getBarHeight(prevValue);
                return <div key={index} className="flex flex-col items-center w-1/7">
                        <div className="relative w-full flex justify-center">
                          {/* Current week bar */}
                          <motion.div className="w-6 rounded-t-md z-20" style={{
                      height: `${currentHeight}%`,
                      backgroundColor: metricColor
                    }} initial={{
                      height: 0
                    }} animate={{
                      height: `${currentHeight}%`
                    }} transition={{
                      duration: 1,
                      delay: index * 0.1
                    }}>
                            <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-800 text-white text-xs py-1 px-2 rounded pointer-events-none">
                              {value}g
                            </div>
                          </motion.div>
                          {/* Previous week bar (semi-transparent) */}
                          <motion.div className="w-6 rounded-t-md absolute opacity-30" style={{
                      height: `${prevHeight}%`,
                      backgroundColor: metricColor
                    }} initial={{
                      height: 0
                    }} animate={{
                      height: `${prevHeight}%`
                    }} transition={{
                      duration: 1,
                      delay: index * 0.1 + 0.5
                    }} />
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {getDayName(index)}
                        </span>
                      </div>;
              })}
              </div>
              <div className="flex justify-center mt-2">
                <div className="flex items-center mr-4">
                  <div className="w-3 h-3 mr-1" style={{
                  backgroundColor: metricColor
                }}></div>
                  <span className="text-xs text-gray-700 dark:text-gray-300">
                    This Week
                  </span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 mr-1 opacity-30" style={{
                  backgroundColor: metricColor
                }}></div>
                  <span className="text-xs text-gray-700 dark:text-gray-300">
                    Last Week
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-5 shadow-sm">
            <h3 className="font-medium text-gray-900 dark:text-white mb-3">
              Recommendations
            </h3>
            <ul className="space-y-2">
              {insight.tips.map((tip: string, index: number) => <motion.li key={index} className="flex items-start" initial={{
              opacity: 0,
              x: -20
            }} animate={{
              opacity: 1,
              x: 0
            }} transition={{
              delay: 0.5 + index * 0.1
            }}>
                  <div className="w-5 h-5 rounded-full bg-[#320DFF]/10 dark:bg-[#6D56FF]/20 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                    <span className="text-xs font-bold text-[#320DFF] dark:text-[#6D56FF]">
                      {index + 1}
                    </span>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 text-sm">
                    {tip}
                  </p>
                </motion.li>)}
            </ul>
          </div>
        </div>
      </div>
    </PageTransition>;
};