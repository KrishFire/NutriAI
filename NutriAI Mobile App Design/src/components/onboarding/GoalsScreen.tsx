import React, { useState } from 'react';
import { ArrowLeftIcon, TrendingDownIcon, ScaleIcon, ActivityIcon } from 'lucide-react';
import { Button } from '../ui/Button';
interface GoalsScreenProps {
  onBack: () => void;
  onNext: () => void;
}
export const GoalsScreen: React.FC<GoalsScreenProps> = ({
  onBack,
  onNext
}) => {
  const [goal, setGoal] = useState<string | null>(null);
  const [targetWeight, setTargetWeight] = useState('');
  const [weightUnit, setWeightUnit] = useState<'lbs' | 'kg'>('lbs');
  const [rate, setRate] = useState<'slow' | 'moderate' | 'fast'>('moderate');
  const goals = [{
    id: 'lose',
    name: 'Lose Weight',
    description: 'Create a calorie deficit',
    icon: TrendingDownIcon,
    color: '#FF5252'
  }, {
    id: 'maintain',
    name: 'Maintain Weight',
    description: 'Stay at current weight',
    icon: ScaleIcon,
    color: '#FFC107'
  }, {
    id: 'gain',
    name: 'Gain Muscle',
    description: 'Build lean mass',
    icon: ActivityIcon,
    color: '#4CAF50'
  }];
  const rateOptions = {
    slow: {
      label: 'Gradual',
      value: '0.5 lb/week',
      description: 'Slower but sustainable'
    },
    moderate: {
      label: 'Moderate',
      value: '1 lb/week',
      description: 'Balanced approach'
    },
    fast: {
      label: 'Ambitious',
      value: '2 lbs/week',
      description: 'Faster results, more effort'
    }
  };
  return <div className="flex flex-col min-h-screen bg-white p-6">
      <div className="flex items-center mb-4">
        <button className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center" onClick={onBack}>
          <ArrowLeftIcon size={20} />
        </button>
      </div>
      <div className="w-full h-1 bg-gray-100 rounded-full mb-8">
        <div className="h-full bg-[#320DFF] rounded-full" style={{
        width: '60%'
      }}></div>
      </div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">What's Your Goal?</h1>
        <p className="text-gray-600">We'll help you get there</p>
      </div>
      <div className="space-y-4 mb-6">
        {goals.map(item => <button key={item.id} onClick={() => setGoal(item.id)} className={`w-full flex items-center p-4 rounded-xl border ${goal === item.id ? 'border-[#320DFF] bg-[#320DFF]/5' : 'border-gray-200'}`}>
            <div className="w-12 h-12 rounded-full flex items-center justify-center mr-4" style={{
          backgroundColor: `${item.color}20`
        }}>
              <item.icon size={24} color={item.color} />
            </div>
            <div className="text-left">
              <h3 className="font-medium">{item.name}</h3>
              <p className="text-sm text-gray-600">{item.description}</p>
            </div>
          </button>)}
      </div>
      {goal === 'lose' && <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Target Weight
            </label>
            <div className="flex space-x-4">
              <div className="flex-1">
                <input type="number" value={targetWeight} onChange={e => setTargetWeight(e.target.value)} placeholder="Target weight" className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#320DFF]/20 focus:border-[#320DFF]" />
              </div>
              <div className="w-24">
                <div className="flex h-12 rounded-lg overflow-hidden border border-gray-300">
                  <button type="button" onClick={() => setWeightUnit('lbs')} className={`flex-1 flex items-center justify-center ${weightUnit === 'lbs' ? 'bg-[#320DFF] text-white' : 'bg-white text-gray-700'}`}>
                    lbs
                  </button>
                  <button type="button" onClick={() => setWeightUnit('kg')} className={`flex-1 flex items-center justify-center ${weightUnit === 'kg' ? 'bg-[#320DFF] text-white' : 'bg-white text-gray-700'}`}>
                    kg
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Preferred Rate
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['slow', 'moderate', 'fast'] as const).map(option => <button key={option} type="button" onClick={() => setRate(option)} className={`p-3 rounded-lg border ${rate === option ? 'border-[#320DFF] bg-[#320DFF]/5' : 'border-gray-200'}`}>
                  <div className="text-center">
                    <p className="font-medium text-sm">
                      {rateOptions[option].label}
                    </p>
                    <p className="text-xs text-[#320DFF] font-medium">
                      {rateOptions[option].value}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {rateOptions[option].description}
                    </p>
                  </div>
                </button>)}
            </div>
          </div>
          <div className="bg-[#320DFF]/5 p-3 rounded-lg">
            <p className="text-sm">
              At this rate, you'll reach your goal in approximately{' '}
              <span className="font-medium">12 weeks</span>.
            </p>
          </div>
        </div>}
      <div className="mt-auto pt-4">
        <Button onClick={onNext} variant="primary" fullWidth disabled={!goal || goal === 'lose' && !targetWeight}>
          {goal ? 'Set My Goal' : 'Continue'}
        </Button>
      </div>
    </div>;
};