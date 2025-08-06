import React from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUpIcon, TrendingDownIcon } from 'lucide-react';
interface WeightDataPoint {
  date: string;
  weight: number;
}
interface WeightTrendGraphProps {
  data: WeightDataPoint[];
  startWeight: number;
  currentWeight: number;
  goalWeight?: number;
  unit: 'lbs' | 'kg';
  onExpand?: () => void;
}
export const WeightTrendGraph: React.FC<WeightTrendGraphProps> = ({
  data,
  startWeight,
  currentWeight,
  goalWeight,
  unit = 'lbs',
  onExpand
}) => {
  const weightChange = currentWeight - startWeight;
  const isPositiveChange = weightChange >= 0;
  // Format the tooltip
  const CustomTooltip = ({
    active,
    payload,
    label
  }: any) => {
    if (active && payload && payload.length) {
      return <div className="bg-white dark:bg-gray-800 p-2 border border-gray-200 dark:border-gray-700 rounded shadow-md">
          <p className="text-xs text-gray-600 dark:text-gray-400">{label}</p>
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            {payload[0].value} {unit}
          </p>
        </div>;
    }
    return null;
  };
  return <motion.div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4" initial={{
    opacity: 0,
    y: 20
  }} animate={{
    opacity: 1,
    y: 0
  }} transition={{
    duration: 0.3
  }}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-gray-900 dark:text-white">
          Weight Trend
        </h3>
        {onExpand && <button className="text-sm text-[#320DFF] dark:text-[#6D56FF]" onClick={onExpand}>
            View More
          </button>}
      </div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400">Starting</p>
          <p className="font-medium text-gray-900 dark:text-white">
            {startWeight} {unit}
          </p>
        </div>
        <div className="flex items-center">
          <div className={`w-8 h-8 rounded-full ${isPositiveChange ? 'bg-red-100 dark:bg-red-900/30' : 'bg-green-100 dark:bg-green-900/30'} flex items-center justify-center mr-2`}>
            {isPositiveChange ? <TrendingUpIcon size={16} className="text-red-600 dark:text-red-400" /> : <TrendingDownIcon size={16} className="text-green-600 dark:text-green-400" />}
          </div>
          <div>
            <p className={`text-xs ${isPositiveChange ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
              {isPositiveChange ? '+' : ''}
              {weightChange.toFixed(1)} {unit}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Since start
            </p>
          </div>
        </div>
        {goalWeight && <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Goal</p>
            <p className="font-medium text-gray-900 dark:text-white">
              {goalWeight} {unit}
            </p>
          </div>}
      </div>
      <div className="h-32">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{
          top: 5,
          right: 5,
          bottom: 5,
          left: 5
        }}>
            <XAxis dataKey="date" tick={{
            fontSize: 10
          }} tickLine={false} axisLine={false} tickFormatter={value => value.slice(0, 3)} />
            <YAxis domain={[Math.min(...data.map(d => d.weight)) - 5, Math.max(...data.map(d => d.weight)) + 5]} hide />
            <Tooltip content={<CustomTooltip />} />
            <Line type="monotone" dataKey="weight" stroke="#320DFF" strokeWidth={2} dot={{
            r: 3,
            fill: '#320DFF',
            strokeWidth: 0
          }} activeDot={{
            r: 5,
            fill: '#320DFF',
            strokeWidth: 0
          }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </motion.div>;
};