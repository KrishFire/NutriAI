import React, { useState } from 'react';
import { ArrowLeftIcon } from 'lucide-react';
import { Button } from '../ui/Button';
import { motion } from 'framer-motion';
import { hapticFeedback } from '../../utils/haptics';
interface HeightWeightScreenProps {
  onBack: () => void;
  onNext: (height: any, weight: any) => void;
  progress: number;
}
export const HeightWeightScreen: React.FC<HeightWeightScreenProps> = ({
  onBack,
  onNext,
  progress
}) => {
  const [unit, setUnit] = useState<'imperial' | 'metric'>('imperial');
  const [height, setHeight] = useState({
    feet: '5',
    inches: '6',
    cm: '168'
  });
  const [weight, setWeight] = useState({
    value: '150',
    unit: 'lbs'
  });
  const handleUnitToggle = () => {
    hapticFeedback.selection();
    setUnit(unit === 'imperial' ? 'metric' : 'imperial');
    if (unit === 'imperial') {
      // Convert to metric
      setWeight({
        value: Math.round(parseInt(weight.value) * 0.453592).toString(),
        unit: 'kg'
      });
    } else {
      // Convert to imperial
      setWeight({
        value: Math.round(parseInt(weight.value) * 2.20462).toString(),
        unit: 'lbs'
      });
    }
  };
  const handleHeightChange = (field: string, value: string) => {
    setHeight({
      ...height,
      [field]: value
    });
    hapticFeedback.selection();
  };
  const handleWeightChange = (value: string) => {
    setWeight({
      ...weight,
      value
    });
    hapticFeedback.selection();
  };
  const handleContinue = () => {
    onNext(height, weight);
  };
  // Generate options for pickers
  const feetOptions = Array.from({
    length: 8
  }, (_, i) => i + 3);
  const inchesOptions = Array.from({
    length: 12
  }, (_, i) => i);
  const cmOptions = Array.from({
    length: 121
  }, (_, i) => i + 120);
  const weightOptionsImperial = Array.from({
    length: 301
  }, (_, i) => i + 80);
  const weightOptionsMetric = Array.from({
    length: 151
  }, (_, i) => i + 35);
  return <div className="flex flex-col min-h-screen bg-white p-6 font-sans">
      <div className="flex items-center mb-4">
        <motion.button className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center" onClick={onBack} whileHover={{
        scale: 1.05
      }} whileTap={{
        scale: 0.95
      }}>
          <ArrowLeftIcon size={20} />
        </motion.button>
      </div>
      {/* Progress bar */}
      <div className="w-full h-1 bg-gray-100 rounded-full mb-8">
        <div className="h-full bg-[#320DFF] rounded-full" style={{
        width: `${progress}%`
      }}></div>
      </div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-3">Your height & weight</h1>
        <p className="text-gray-600 text-lg">
          This helps us personalize your nutrition plan
        </p>
      </div>
      <div className="mb-4 flex justify-end">
        <motion.div className="flex items-center bg-gray-100 p-1 rounded-full" whileTap={{
        scale: 0.98
      }}>
          <motion.button className={`px-4 py-2 rounded-full text-sm font-medium ${unit === 'imperial' ? 'bg-white text-[#320DFF] shadow-sm' : 'text-gray-600'}`} onClick={() => unit !== 'imperial' && handleUnitToggle()} whileTap={{
          scale: 0.95
        }}>
            Imperial
          </motion.button>
          <motion.button className={`px-4 py-2 rounded-full text-sm font-medium ${unit === 'metric' ? 'bg-white text-[#320DFF] shadow-sm' : 'text-gray-600'}`} onClick={() => unit !== 'metric' && handleUnitToggle()} whileTap={{
          scale: 0.95
        }}>
            Metric
          </motion.button>
        </motion.div>
      </div>
      <div className="space-y-6 mb-4">
        <div>
          <label className="block text-lg font-medium text-gray-700 mb-3">
            Height
          </label>
          {unit === 'imperial' ? <div className="flex space-x-4">
              <div className="flex-1">
                <select value={height.feet} onChange={e => handleHeightChange('feet', e.target.value)} className="w-full h-12 px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 appearance-none">
                  {feetOptions.map(feet => <option key={feet} value={feet}>
                      {feet} ft
                    </option>)}
                </select>
              </div>
              <div className="flex-1">
                <select value={height.inches} onChange={e => handleHeightChange('inches', e.target.value)} className="w-full h-12 px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 appearance-none">
                  {inchesOptions.map(inch => <option key={inch} value={inch}>
                      {inch} in
                    </option>)}
                </select>
              </div>
            </div> : <div>
              <select value={height.cm} onChange={e => handleHeightChange('cm', e.target.value)} className="w-full h-12 px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 appearance-none">
                {cmOptions.map(cm => <option key={cm} value={cm}>
                    {cm} cm
                  </option>)}
              </select>
            </div>}
        </div>
        <div>
          <label className="block text-lg font-medium text-gray-700 mb-3">
            Weight
          </label>
          <select value={weight.value} onChange={e => handleWeightChange(e.target.value)} className="w-full h-12 px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 appearance-none">
            {(unit === 'imperial' ? weightOptionsImperial : weightOptionsMetric).map(w => <option key={w} value={w}>
                {w} {unit === 'imperial' ? 'lbs' : 'kg'}
              </option>)}
          </select>
        </div>
      </div>
      <div className="mt-auto">
        <Button onClick={handleContinue} variant="primary" fullWidth>
          Continue
        </Button>
      </div>
    </div>;
};