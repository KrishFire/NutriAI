import React from 'react';
import { ArrowLeftIcon, TrendingUpIcon, TargetIcon, CheckCircleIcon } from 'lucide-react';
import { PageTransition } from '../ui/PageTransition';
interface GoalsProgressScreenProps {
  onBack: () => void;
}
export const GoalsProgressScreen: React.FC<GoalsProgressScreenProps> = ({
  onBack
}) => {
  // Sample data
  const goals = {
    weight: {
      current: 165,
      target: 150,
      unit: 'lbs',
      progress: 70
    },
    calories: {
      daily: 2000,
      adherence: 85
    },
    macros: {
      protein: {
        goal: 150,
        adherence: 90
      },
      carbs: {
        goal: 225,
        adherence: 75
      },
      fat: {
        goal: 55,
        adherence: 80
      }
    },
    milestones: [{
      id: 1,
      title: 'Log meals for 7 days',
      completed: true
    }, {
      id: 2,
      title: 'Meet protein goal for 5 days',
      completed: true
    }, {
      id: 3,
      title: 'Stay under calorie goal for 10 days',
      completed: false
    }, {
      id: 4,
      title: 'Lose 5 lbs',
      completed: false
    }]
  };
  return <PageTransition>
      <div className="flex flex-col min-h-screen bg-white pb-6">
        <div className="px-4 pt-12 pb-4 flex items-center">
          <button className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mr-4" onClick={onBack}>
            <ArrowLeftIcon size={20} />
          </button>
          <h1 className="text-2xl font-bold">Goals & Progress</h1>
        </div>
        <div className="px-4 py-4">
          {/* Weight Goal */}
          <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm mb-4">
            <div className="flex items-center mb-3">
              <div className="w-10 h-10 rounded-full bg-[#320DFF]/10 flex items-center justify-center mr-3">
                <TargetIcon size={20} className="text-[#320DFF]" />
              </div>
              <h2 className="font-medium">Weight Goal</h2>
            </div>
            <div className="flex justify-between items-center mb-2">
              <div>
                <p className="text-sm text-gray-500">Current</p>
                <p className="font-medium">
                  {goals.weight.current} {goals.weight.unit}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500">Progress</p>
                <p className="font-medium text-[#320DFF]">
                  {goals.weight.progress}%
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Target</p>
                <p className="font-medium">
                  {goals.weight.target} {goals.weight.unit}
                </p>
              </div>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-[#320DFF]" style={{
              width: `${goals.weight.progress}%`
            }}></div>
            </div>
          </div>
          {/* Nutrition Goals */}
          <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm mb-4">
            <div className="flex items-center mb-3">
              <div className="w-10 h-10 rounded-full bg-[#FFA726]/10 flex items-center justify-center mr-3">
                <TrendingUpIcon size={20} className="text-[#FFA726]" />
              </div>
              <h2 className="font-medium">Nutrition Goals</h2>
            </div>
            <div className="mb-4">
              <div className="flex justify-between mb-1">
                <p className="text-sm">Daily Calories</p>
                <p className="text-sm font-medium">
                  {goals.calories.adherence}% adherence
                </p>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-[#FFA726]" style={{
                width: `${goals.calories.adherence}%`
              }}></div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Target: {goals.calories.daily} calories/day
              </p>
            </div>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between mb-1">
                  <p className="text-sm">Protein</p>
                  <p className="text-sm font-medium">
                    {goals.macros.protein.adherence}%
                  </p>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-[#42A5F5]" style={{
                  width: `${goals.macros.protein.adherence}%`
                }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <p className="text-sm">Carbs</p>
                  <p className="text-sm font-medium">
                    {goals.macros.carbs.adherence}%
                  </p>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-[#FFA726]" style={{
                  width: `${goals.macros.carbs.adherence}%`
                }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <p className="text-sm">Fat</p>
                  <p className="text-sm font-medium">
                    {goals.macros.fat.adherence}%
                  </p>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-[#66BB6A]" style={{
                  width: `${goals.macros.fat.adherence}%`
                }}></div>
                </div>
              </div>
            </div>
          </div>
          {/* Milestones */}
          <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
            <h2 className="font-medium mb-3">Milestones</h2>
            <div className="space-y-3">
              {goals.milestones.map(milestone => <div key={milestone.id} className="flex items-center">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 ${milestone.completed ? 'bg-[#320DFF]' : 'bg-gray-200'}`}>
                    <CheckCircleIcon size={16} className="text-white" />
                  </div>
                  <p className={milestone.completed ? 'font-medium' : 'text-gray-500'}>
                    {milestone.title}
                  </p>
                </div>)}
            </div>
          </div>
          <button className="w-full py-4 mt-4 text-center text-[#320DFF] font-medium">
            Update Goals
          </button>
        </div>
      </div>
    </PageTransition>;
};