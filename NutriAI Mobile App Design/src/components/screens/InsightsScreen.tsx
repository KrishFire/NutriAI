import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { PageTransition } from '../ui/PageTransition';
import { LineChartIcon, TrendingUpIcon, TrendingDownIcon, AlertCircleIcon, BarChart3Icon, ChevronRightIcon } from 'lucide-react';
import { hapticFeedback } from '../../utils/haptics';
interface InsightsScreenProps {
  onViewInsight?: (insight: any) => void;
}
export const InsightsScreen: React.FC<InsightsScreenProps> = ({
  onViewInsight
}) => {
  // Sample insights data
  const insights = [{
    id: 1,
    title: 'Protein Intake Trend',
    description: 'Your protein intake has been consistently above your goal this week. Great job maintaining your muscle mass!',
    type: 'positive',
    icon: TrendingUpIcon,
    color: '#66BB6A',
    date: '1 day ago',
    chart: 'line',
    data: [65, 75, 80, 95, 85, 90, 95]
  }, {
    id: 2,
    title: 'Carbs Below Target',
    description: 'Your carbohydrate intake has been below your target for 3 days. This might affect your energy levels during workouts.',
    type: 'warning',
    icon: TrendingDownIcon,
    color: '#FFA726',
    date: '2 days ago',
    chart: 'line',
    data: [120, 110, 90, 85, 80, 75, 70]
  }, {
    id: 3,
    title: 'Calorie Consistency',
    description: 'You have maintained a consistent calorie intake within 10% of your goal for the past week, which is ideal for steady progress.',
    icon: BarChart3Icon,
    color: '#42A5F5',
    date: '3 days ago',
    chart: 'bar',
    data: [1850, 1950, 2050, 1900, 2000, 1950, 2100]
  }];
  // Weekly summary data with trends
  const weeklyData = {
    calories: {
      average: 1950,
      target: 2000,
      percentage: 98,
      trend: -2,
      dailyData: [1850, 1950, 2050, 1900, 2000, 1950, 2100],
      previousWeekData: [1900, 2000, 2100, 1950, 2050, 2000, 2150]
    },
    protein: {
      average: 145,
      target: 150,
      percentage: 97,
      trend: 5,
      dailyData: [135, 142, 150, 148, 140, 152, 148],
      previousWeekData: [130, 135, 142, 140, 135, 145, 140]
    },
    carbs: {
      average: 210,
      target: 250,
      percentage: 84,
      trend: -8,
      dailyData: [230, 220, 200, 190, 210, 205, 215],
      previousWeekData: [250, 240, 220, 210, 225, 220, 230]
    },
    fat: {
      average: 60,
      target: 65,
      percentage: 92,
      trend: 3,
      dailyData: [58, 62, 65, 59, 57, 62, 57],
      previousWeekData: [55, 60, 63, 58, 55, 60, 55]
    }
  };
  // Days of the week for the charts
  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  // Placeholder for simple line chart - fixed to remove blank white space
  const SimpleLineChart = ({
    data,
    color
  }: {
    data: number[];
    color: string;
  }) => {
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min;
    // Return a more compact visualization that doesn't take up unnecessary space
    return <div className="flex items-end h-5 mt-1">
        {data.map((value, index) => {
        const height = range > 0 ? (value - min) / range * 100 : 50;
        return <div key={index} className="flex-1 flex justify-center">
              <div className="w-3/4 rounded-sm" style={{
            height: `${Math.max(5, height)}%`,
            backgroundColor: color
          }} />
            </div>;
      })}
      </div>;
  };
  // Placeholder for simple bar chart
  const SimpleBarChart = ({
    data,
    previousData,
    color,
    labels,
    showComparison = false
  }: {
    data: number[];
    previousData?: number[];
    color: string;
    labels?: string[];
    showComparison?: boolean;
  }) => {
    const allData = [...data];
    if (previousData) {
      allData.push(...previousData);
    }
    const max = Math.max(...allData);
    const min = 0; // Starting from zero for bar charts
    const range = max - min;
    return <div className="h-32 w-full flex flex-col">
        <div className="flex-1 flex items-end">
          {data.map((value, index) => {
          const height = range > 0 ? (value - min) / range * 100 : 0;
          const prevValue = previousData ? previousData[index] : 0;
          const prevHeight = range > 0 ? (prevValue - min) / range * 100 : 0;
          return <div key={index} className="flex-1 flex flex-col items-center group">
                <div className="h-full flex items-end w-full justify-center relative">
                  {/* Current week bar */}
                  <motion.div className="w-5/6 rounded-sm transition-all duration-500" style={{
                height: `${Math.max(5, height)}%`,
                backgroundColor: color
              }} initial={{
                height: 0
              }} animate={{
                height: `${Math.max(5, height)}%`
              }} transition={{
                duration: 1,
                delay: index * 0.1
              }}>
                    <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-800 text-white text-xs py-1 px-2 rounded pointer-events-none">
                      {value}
                    </div>
                  </motion.div>
                  {/* Previous week bar (semi-transparent) */}
                  {showComparison && previousData && <motion.div className="w-5/6 rounded-sm absolute opacity-30" style={{
                height: `${Math.max(5, prevHeight)}%`,
                backgroundColor: color,
                right: 0
              }} initial={{
                height: 0
              }} animate={{
                height: `${Math.max(5, prevHeight)}%`
              }} transition={{
                duration: 1,
                delay: index * 0.1 + 0.5
              }} />}
                </div>
                {labels && <div className="text-xs text-gray-500 mt-1">
                    {labels[index]}
                  </div>}
              </div>;
        })}
        </div>
      </div>;
  };
  // Calories Weekly Overview
  const CaloriesWeeklyOverview = () => {
    return <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm mb-6">
        <div className="flex justify-between items-center mb-3">
          <h2 className="font-semibold">Calories This Week</h2>
          <div className="flex items-center">
            <div className={`text-xs px-1.5 py-0.5 rounded-full flex items-center ${weeklyData.calories.trend >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {weeklyData.calories.trend >= 0 ? <TrendingUpIcon size={12} className="mr-0.5" /> : <TrendingDownIcon size={12} className="mr-0.5" />}
              <span>{Math.abs(weeklyData.calories.trend)}% from last week</span>
            </div>
          </div>
        </div>
        <SimpleBarChart data={weeklyData.calories.dailyData} previousData={weeklyData.calories.previousWeekData} color="#320DFF" labels={daysOfWeek} showComparison={true} />
        <div className="flex justify-center mt-2">
          <div className="flex items-center mr-4">
            <div className="w-3 h-3 mr-1 bg-[#320DFF]"></div>
            <span className="text-xs text-gray-700">This Week</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 mr-1 bg-[#320DFF] opacity-30"></div>
            <span className="text-xs text-gray-700">Last Week</span>
          </div>
        </div>
        <div className="flex justify-between items-center mt-4">
          <div>
            <p className="text-sm text-gray-600">Daily Average</p>
            <p className="font-medium">{weeklyData.calories.average} cal</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Target</p>
            <p className="font-medium">{weeklyData.calories.target} cal</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Completion</p>
            <p className="font-medium">{weeklyData.calories.percentage}%</p>
          </div>
        </div>
      </div>;
  };
  // Macronutrient Bar
  const MacronutrientBar = ({
    name,
    data,
    color,
    percentage
  }: {
    name: string;
    data: number[];
    color: string;
    percentage: number;
  }) => {
    const trend = name === 'Protein' ? weeklyData.protein.trend : name === 'Carbs' ? weeklyData.carbs.trend : weeklyData.fat.trend;
    return <div className="mb-5">
        <div className="flex justify-between text-sm mb-1">
          <div className="flex items-center">
            <span className="text-gray-600 mr-2">{name}</span>
            <div className={`text-xs px-1.5 py-0.5 rounded-full flex items-center ${trend >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {trend >= 0 ? <TrendingUpIcon size={12} className="mr-0.5" /> : <TrendingDownIcon size={12} className="mr-0.5" />}
              <span>{Math.abs(trend)}%</span>
            </div>
          </div>
          <span className="font-medium">
            {name === 'Protein' ? `${weeklyData.protein.average} / ${weeklyData.protein.target}g` : name === 'Carbs' ? `${weeklyData.carbs.average} / ${weeklyData.carbs.target}g` : `${weeklyData.fat.average} / ${weeklyData.fat.target}g`}
          </span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-2">
          <motion.div className="h-full" style={{
          backgroundColor: color
        }} initial={{
          width: 0
        }} animate={{
          width: `${percentage}%`
        }} transition={{
          duration: 0.8,
          delay: 0.2
        }}></motion.div>
        </div>
        <div className="h-20 w-full flex items-end">
          {data.map((value, index) => {
          const max = Math.max(...data);
          const barHeight = value / max * 100;
          return <div key={index} className="flex-1 flex flex-col items-center">
                <div className="w-full flex justify-center mb-1">
                  <motion.div className="w-5/6 rounded-sm" style={{
                height: `${Math.max(5, barHeight)}%`,
                backgroundColor: color
              }} initial={{
                height: 0
              }} animate={{
                height: `${Math.max(5, barHeight)}%`
              }} transition={{
                duration: 0.8,
                delay: 0.2 + index * 0.05
              }}></motion.div>
                </div>
                <div className="text-xs text-gray-500">{daysOfWeek[index]}</div>
              </div>;
        })}
        </div>
      </div>;
  };
  return <PageTransition>
      <div className="flex flex-col min-h-screen bg-white">
        <div className="px-4 pt-12 pb-4">
          <h1 className="text-2xl font-bold">Insights</h1>
          <p className="text-gray-600">Your nutrition trends and patterns</p>
        </div>
        {/* Calories Weekly Overview */}
        <div className="px-4 mb-6">
          <CaloriesWeeklyOverview />
        </div>
        {/* Weekly Macronutrients Summary */}
        <div className="px-4 mb-6">
          <motion.div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm" initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.5
        }}>
            <div className="flex justify-between items-center mb-3">
              <h2 className="font-semibold">Macronutrients</h2>
              <span className="text-sm text-gray-500">Last 7 days</span>
            </div>
            {/* Protein */}
            <MacronutrientBar name="Protein" data={weeklyData.protein.dailyData} color="#42A5F5" percentage={weeklyData.protein.percentage} />
            {/* Carbs */}
            <MacronutrientBar name="Carbs" data={weeklyData.carbs.dailyData} color="#FFA726" percentage={weeklyData.carbs.percentage} />
            {/* Fat */}
            <MacronutrientBar name="Fat" data={weeklyData.fat.dailyData} color="#66BB6A" percentage={weeklyData.fat.percentage} />
          </motion.div>
        </div>
        {/* Insights */}
        <div className="px-4 pb-28">
          <h2 className="font-semibold mb-3">Personal Insights</h2>
          <div className="space-y-3">
            {insights.map((insight, index) => <motion.div key={insight.id} className="bg-white border border-gray-100 rounded-xl p-3 shadow-sm" initial={{
            opacity: 0,
            y: 20
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            duration: 0.3,
            delay: index * 0.1
          }} onClick={() => onViewInsight && onViewInsight(insight)}>
                <div className="flex items-start">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center mr-3 flex-shrink-0" style={{
                backgroundColor: `${insight.color}15`
              }}>
                    <insight.icon size={20} style={{
                  color: insight.color
                }} />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <h3 className="font-semibold">{insight.title}</h3>
                      <span className="text-xs text-gray-500">
                        {insight.date}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {insight.description}
                    </p>
                  </div>
                </div>
              </motion.div>)}
          </div>
        </div>
      </div>
    </PageTransition>;
};