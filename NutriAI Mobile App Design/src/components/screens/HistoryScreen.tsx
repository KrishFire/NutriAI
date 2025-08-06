import React, { useEffect, useState } from 'react';
import { ChevronLeftIcon, ChevronRightIcon, CalendarIcon } from 'lucide-react';
import { MealCard } from '../ui/MealCard';
import { PageTransition } from '../ui/PageTransition';
import { motion, AnimatePresence } from 'framer-motion';
import { hapticFeedback } from '../../utils/haptics';
interface HistoryScreenProps {
  onViewMeal?: (meal: any) => void;
}
export const HistoryScreen: React.FC<HistoryScreenProps> = ({
  onViewMeal
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState<{
    show: boolean;
    message: string;
    type?: 'success' | 'error' | 'info';
  }>({
    show: false,
    message: ''
  });
  // Sample data
  const dailySummary = {
    date: selectedDate,
    totalCalories: 1850,
    goalCalories: 2000,
    macros: {
      carbs: {
        consumed: 210,
        goal: 250,
        percentage: 84
      },
      protein: {
        consumed: 120,
        goal: 150,
        percentage: 80
      },
      fat: {
        consumed: 55,
        goal: 65,
        percentage: 85
      }
    }
  };
  const [meals, setMeals] = useState([{
    id: 1,
    type: 'Breakfast',
    time: '8:30 AM',
    calories: 420,
    image: 'https://images.unsplash.com/photo-1494390248081-4e521a5940db?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80',
    macros: {
      carbs: 65,
      protein: 15,
      fat: 12
    },
    isFavorite: false,
    items: [{
      id: 'eggs',
      name: 'Scrambled Eggs',
      quantity: '2 large',
      calories: 180,
      protein: 12,
      carbs: 1,
      fat: 10,
      isFavorite: false
    }, {
      id: 'toast',
      name: 'Whole Wheat Toast',
      quantity: '2 slices',
      calories: 140,
      protein: 6,
      carbs: 24,
      fat: 2,
      isFavorite: false
    }, {
      id: 'fruit',
      name: 'Mixed Berries',
      quantity: '1 cup',
      calories: 100,
      protein: 1,
      carbs: 25,
      fat: 0,
      isFavorite: false
    }]
  }, {
    id: 2,
    type: 'Lunch',
    time: '12:45 PM',
    calories: 650,
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80',
    macros: {
      carbs: 75,
      protein: 45,
      fat: 22
    },
    isFavorite: false,
    items: [{
      id: 'salad',
      name: 'Chicken Salad',
      quantity: '1 bowl',
      calories: 350,
      protein: 35,
      carbs: 15,
      fat: 15,
      isFavorite: false
    }, {
      id: 'bread',
      name: 'Baguette',
      quantity: '1 small',
      calories: 200,
      protein: 6,
      carbs: 40,
      fat: 2,
      isFavorite: false
    }, {
      id: 'dressing',
      name: 'Olive Oil Dressing',
      quantity: '1 tbsp',
      calories: 100,
      protein: 0,
      carbs: 0,
      fat: 11,
      isFavorite: false
    }]
  }, {
    id: 3,
    type: 'Snack',
    time: '3:30 PM',
    calories: 180,
    image: 'https://images.unsplash.com/photo-1470119693884-47d3a1d1f180?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80',
    macros: {
      carbs: 25,
      protein: 5,
      fat: 8
    },
    isFavorite: false,
    items: [{
      id: 'yogurt',
      name: 'Greek Yogurt',
      quantity: '1 cup',
      calories: 130,
      protein: 15,
      carbs: 8,
      fat: 4,
      isFavorite: false
    }, {
      id: 'honey',
      name: 'Honey',
      quantity: '1 tsp',
      calories: 20,
      protein: 0,
      carbs: 5,
      fat: 0,
      isFavorite: false
    }, {
      id: 'almonds',
      name: 'Almonds',
      quantity: '10 pieces',
      calories: 70,
      protein: 3,
      carbs: 2,
      fat: 6,
      isFavorite: false
    }]
  }, {
    id: 4,
    type: 'Dinner',
    time: '7:15 PM',
    calories: 600,
    image: 'https://images.unsplash.com/photo-1559847844-5315695dadae?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80',
    macros: {
      carbs: 45,
      protein: 55,
      fat: 13
    },
    isFavorite: false,
    items: [{
      id: 'salmon',
      name: 'Grilled Salmon',
      quantity: '6 oz',
      calories: 350,
      protein: 40,
      carbs: 0,
      fat: 18,
      isFavorite: false
    }, {
      id: 'rice',
      name: 'Brown Rice',
      quantity: '1 cup',
      calories: 220,
      protein: 5,
      carbs: 45,
      fat: 2,
      isFavorite: false
    }, {
      id: 'broccoli',
      name: 'Steamed Broccoli',
      quantity: '1 cup',
      calories: 30,
      protein: 2.5,
      carbs: 6,
      fat: 0,
      isFavorite: false
    }]
  }]);
  // Clear notification after timeout
  useEffect(() => {
    if (notification.show) {
      const timer = setTimeout(() => {
        setNotification({
          show: false,
          message: ''
        });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);
  // Generate week days for the calendar
  const getWeekDays = () => {
    const days = [];
    const day = new Date(currentDate);
    day.setDate(day.getDate() - 3); // Start 3 days before
    for (let i = 0; i < 7; i++) {
      days.push(new Date(day));
      day.setDate(day.getDate() + 1);
    }
    return days;
  };
  const weekDays = getWeekDays();
  const formatDay = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short'
    }).charAt(0);
  };
  const formatDate = (date: Date) => {
    return date.getDate().toString();
  };
  const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
  };
  const isSelected = (date: Date) => {
    return date.getDate() === selectedDate.getDate() && date.getMonth() === selectedDate.getMonth() && date.getFullYear() === selectedDate.getFullYear();
  };
  const navigateWeek = (direction: number) => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + 7 * direction);
    setCurrentDate(newDate);
  };
  const handleDateSelect = (day: Date) => {
    setIsLoading(true);
    setSelectedDate(day);
    // Simulate loading
    setTimeout(() => {
      setIsLoading(false);
    }, 500);
  };
  return <PageTransition>
      <div className="flex flex-col min-h-screen bg-white pb-20">
        {/* Notification */}
        <AnimatePresence>
          {notification.show && <motion.div className="fixed bottom-20 left-4 right-4 max-w-md mx-auto bg-gray-800 text-white px-4 py-3 rounded-xl shadow-lg z-50" initial={{
          y: 50,
          opacity: 0
        }} animate={{
          y: 0,
          opacity: 1
        }} exit={{
          y: 50,
          opacity: 0
        }}>
              {notification.message}
            </motion.div>}
        </AnimatePresence>

        {/* Header */}
        <div className="px-4 pt-12 pb-4">
          <h1 className="text-2xl font-bold">History</h1>
          <p className="text-gray-600">Track your nutrition journey</p>
        </div>

        {/* Calendar Navigation */}
        <div className="px-4 mb-6">
          <div className="flex items-center justify-between mb-4">
            <motion.button onClick={() => navigateWeek(-1)} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100" whileTap={{
            scale: 0.9
          }}>
              <ChevronLeftIcon size={20} className="text-gray-700" />
            </motion.button>
            <div className="flex items-center">
              <CalendarIcon size={16} className="text-[#320DFF] mr-2" />
              <span className="font-medium">
                {currentDate.toLocaleDateString('en-US', {
                month: 'long',
                year: 'numeric'
              })}
              </span>
            </div>
            <motion.button onClick={() => navigateWeek(1)} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100" whileTap={{
            scale: 0.9
          }}>
              <ChevronRightIcon size={20} className="text-gray-700" />
            </motion.button>
          </div>

          {/* Week Day Selector */}
          <div className="flex justify-between">
            {weekDays.map((day, index) => <motion.button key={index} onClick={() => handleDateSelect(day)} className={`flex flex-col items-center w-10 py-2 rounded-full ${isSelected(day) ? 'bg-[#320DFF] text-white' : isToday(day) ? 'bg-[#320DFF]/10 text-[#320DFF]' : 'text-gray-700'}`} whileHover={!isSelected(day) ? {
            scale: 1.05
          } : {}} whileTap={{
            scale: 0.95
          }}>
                <span className="text-xs font-medium">{formatDay(day)}</span>
                <span className="text-sm font-semibold mt-1">
                  {formatDate(day)}
                </span>
              </motion.button>)}
          </div>
        </div>

        {/* Daily Summary */}
        <motion.div className="px-4 mb-6" initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: isLoading ? 0.5 : 1,
        y: 0
      }} transition={{
        duration: 0.3
      }}>
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex justify-between mb-3">
              <h2 className="font-semibold">Daily Summary</h2>
              <span className="text-sm text-gray-500">
                {selectedDate.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric'
              })}
              </span>
            </div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm text-gray-500">Calories Consumed</p>
                <div className="flex items-baseline">
                  <span className="text-2xl font-bold">
                    {dailySummary.totalCalories}
                  </span>
                  <span className="text-sm text-gray-500 ml-1">
                    / {dailySummary.goalCalories}
                  </span>
                </div>
              </div>
              <motion.div className="w-16 h-16 rounded-full border-4 border-[#320DFF] flex items-center justify-center" initial={{
              rotate: -90
            }} animate={{
              rotate: 0
            }} transition={{
              duration: 0.5,
              delay: 0.2
            }}>
                <span className="font-bold text-lg">
                  {Math.round(dailySummary.totalCalories / dailySummary.goalCalories * 100)}
                  %
                </span>
              </motion.div>
            </div>
            {/* Macros */}
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(dailySummary.macros).map(([key, macro], index) => <div key={key} className="bg-white rounded-lg p-2 text-center">
                    <p className="text-xs text-gray-500 capitalize">{key}</p>
                    <p className="font-medium">{macro.consumed}g</p>
                    <div className="h-1 bg-gray-100 rounded-full mt-1 overflow-hidden">
                      <motion.div className={`h-full ${key === 'carbs' ? 'bg-[#FFA726]' : key === 'protein' ? 'bg-[#42A5F5]' : 'bg-[#66BB6A]'}`} initial={{
                  width: 0
                }} animate={{
                  width: `${macro.percentage}%`
                }} transition={{
                  duration: 0.8,
                  delay: 0.2 + index * 0.1
                }}></motion.div>
                    </div>
                  </div>)}
            </div>
          </div>
        </motion.div>

        {/* Meals List */}
        <div className="px-4">
          <h2 className="font-semibold mb-3">Meals</h2>
          <div className="space-y-3">
            {isLoading ?
          // Skeleton loading
          Array(3).fill(0).map((_, index) => <div key={index} className="bg-gray-100 animate-pulse h-20 rounded-xl"></div>) : meals.map((meal, index) => <motion.div key={meal.id} initial={{
            opacity: 0,
            y: 20
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            duration: 0.3,
            delay: index * 0.1
          }}>
                    <div onClick={() => onViewMeal && onViewMeal({
              ...meal,
              isFavorite: meal.isFavorite
            })} className="cursor-pointer">
                      <MealCard meal={meal} />
                    </div>
                  </motion.div>)}
          </div>
        </div>
      </div>
    </PageTransition>;
};