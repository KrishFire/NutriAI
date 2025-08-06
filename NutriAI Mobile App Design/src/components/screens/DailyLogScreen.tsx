import React, { useState } from 'react';
import { ArrowLeftIcon, PlusCircle, CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { PageTransition } from '../ui/PageTransition';
import { MealSummaryCard } from '../food-input/MealSummaryCard';
import { ProgressRing } from '../ui/ProgressRing';
import { hapticFeedback } from '../../utils/haptics';
interface DailyLogScreenProps {
  onBack: () => void;
  onNavigate: (screen: string, params: any) => void;
}
export const DailyLogScreen: React.FC<DailyLogScreenProps> = ({
  onBack,
  onNavigate
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  // Sample data
  const dailyGoal = 2000;
  const totalConsumed = 1620;
  const remaining = dailyGoal - totalConsumed;
  const percentage = Math.round(totalConsumed / dailyGoal * 100);
  const macros = {
    protein: {
      consumed: 95,
      goal: 150,
      percentage: 63
    },
    carbs: {
      consumed: 180,
      goal: 250,
      percentage: 72
    },
    fat: {
      consumed: 48,
      goal: 65,
      percentage: 74
    }
  };
  const meals = [{
    type: 'Breakfast',
    time: '8:30 AM',
    foodItems: [{
      id: '1',
      name: 'Greek Yogurt',
      brand: 'Fage',
      quantity: 1,
      calories: 130,
      protein: 18,
      carbs: 6,
      fat: 4
    }, {
      id: '2',
      name: 'Banana',
      quantity: 1,
      calories: 105,
      protein: 1.3,
      carbs: 27,
      fat: 0.4
    }]
  }, {
    type: 'Lunch',
    time: '12:45 PM',
    foodItems: [{
      id: '3',
      name: 'Grilled Chicken Sandwich',
      quantity: 1,
      calories: 450,
      protein: 35,
      carbs: 45,
      fat: 15
    }, {
      id: '4',
      name: 'Side Salad',
      quantity: 1,
      calories: 120,
      protein: 3,
      carbs: 10,
      fat: 8
    }]
  }, {
    type: 'Snack',
    time: '3:30 PM',
    foodItems: [{
      id: '5',
      name: 'Protein Bar',
      brand: 'Quest',
      quantity: 1,
      calories: 190,
      protein: 20,
      carbs: 21,
      fat: 8
    }]
  }, {
    type: 'Dinner',
    time: '7:00 PM',
    foodItems: [{
      id: '6',
      name: 'Salmon Fillet',
      quantity: 1,
      calories: 367,
      protein: 39.8,
      carbs: 0,
      fat: 22
    }, {
      id: '7',
      name: 'Steamed Broccoli',
      quantity: 1,
      calories: 55,
      protein: 3.7,
      carbs: 11.2,
      fat: 0.6
    }, {
      id: '8',
      name: 'Brown Rice',
      quantity: 0.5,
      calories: 108,
      protein: 2.5,
      carbs: 22.5,
      fat: 0.9
    }]
  }];
  const handleDateChange = (days: number) => {
    hapticFeedback.selection();
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + days);
    setCurrentDate(newDate);
  };
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric'
    });
  };
  const isToday = () => {
    const today = new Date();
    return currentDate.getDate() === today.getDate() && currentDate.getMonth() === today.getMonth() && currentDate.getFullYear() === today.getFullYear();
  };
  const handleAddMeal = (mealType?: string) => {
    hapticFeedback.selection();
    onNavigate('add-food', {
      mealType
    });
  };
  const handleEditMeal = (mealType: string) => {
    hapticFeedback.selection();
    // Find the meal and navigate to edit screen
    const meal = meals.find(m => m.type === mealType);
    if (meal) {
      onNavigate('edit-meal', {
        meal
      });
    }
  };
  const handleDeleteMeal = (mealType: string) => {
    hapticFeedback.impact();
    // In a real app, this would delete the meal
    console.log('Delete meal:', mealType);
  };
  return <PageTransition>
      <div className="flex flex-col min-h-screen bg-white dark:bg-gray-900">
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Food Log
          </h1>
        </div>
        <div className="px-4 py-2 flex-1">
          {/* Date Selector */}
          <div className="flex justify-between items-center mb-6">
            <motion.button className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center" onClick={() => handleDateChange(-1)} whileHover={{
            scale: 1.1
          }} whileTap={{
            scale: 0.9
          }}>
              <ChevronLeft size={18} className="text-gray-700 dark:text-gray-300" />
            </motion.button>
            <div className="flex items-center">
              <CalendarIcon size={18} className="text-[#320DFF] dark:text-[#6D56FF] mr-2" />
              <span className="font-medium text-gray-900 dark:text-white">
                {isToday() ? 'Today' : formatDate(currentDate)}
              </span>
            </div>
            <motion.button className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center" onClick={() => handleDateChange(1)} whileHover={{
            scale: 1.1
          }} whileTap={{
            scale: 0.9
          }}>
              <ChevronRight size={18} className="text-gray-700 dark:text-gray-300" />
            </motion.button>
          </div>
          {/* Daily Summary */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 mb-6">
            <div className="flex">
              <div className="w-24 h-24 relative mr-4">
                <ProgressRing percentage={percentage} color="#320DFF" size={96} strokeWidth={8} animate={true} duration={1}>
                  <div className="flex flex-col items-center justify-center">
                    <span className="text-sm font-bold text-gray-900 dark:text-white">
                      {totalConsumed}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      cal
                    </span>
                  </div>
                </ProgressRing>
              </div>
              <div className="flex-1">
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Goal
                  </span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {dailyGoal} cal
                  </span>
                </div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Food
                  </span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    +{totalConsumed} cal
                  </span>
                </div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Exercise
                  </span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    +0 cal
                  </span>
                </div>
                <div className="flex justify-between pt-1 border-t border-gray-200 dark:border-gray-700">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Remaining
                  </span>
                  <span className="text-sm font-bold text-[#320DFF] dark:text-[#6D56FF]">
                    {remaining} cal
                  </span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 mt-4">
              {Object.entries(macros).map(([key, value]) => <div key={key} className="flex flex-col items-center">
                  <div className="w-10 h-10 mb-1">
                    <ProgressRing percentage={value.percentage} color={key === 'protein' ? '#42A5F5' : key === 'carbs' ? '#FFA726' : '#66BB6A'} size={40} strokeWidth={4} animate={true} duration={1}>
                      <span className="text-xs">{value.percentage}%</span>
                    </ProgressRing>
                  </div>
                  <span className="text-xs text-gray-600 dark:text-gray-400 capitalize">
                    {key}
                  </span>
                  <span className="text-xs font-medium text-gray-900 dark:text-white">
                    {value.consumed}/{value.goal}g
                  </span>
                </div>)}
            </div>
          </div>
          {/* Meals */}
          <div className="space-y-4 mb-6">
            {meals.map((meal, index) => <MealSummaryCard key={index} mealType={meal.type} time={meal.time} foodItems={meal.foodItems} onEdit={() => handleEditMeal(meal.type)} onDelete={() => handleDeleteMeal(meal.type)} onAddMore={() => handleAddMeal(meal.type)} />)}
          </div>
          {/* Add Meal Button */}
          <motion.button className="w-full py-4 flex items-center justify-center space-x-2 bg-[#320DFF]/5 dark:bg-[#6D56FF]/10 text-[#320DFF] dark:text-[#6D56FF] rounded-xl" onClick={() => handleAddMeal()} whileHover={{
          scale: 1.02
        }} whileTap={{
          scale: 0.98
        }}>
            <PlusCircle size={20} />
            <span className="font-medium">Add Meal</span>
          </motion.button>
        </div>
      </div>
    </PageTransition>;
};