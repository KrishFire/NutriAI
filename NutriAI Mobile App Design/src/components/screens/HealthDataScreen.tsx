import React from 'react';
import { ArrowLeftIcon, HeartIcon, ActivityIcon, DropletIcon } from 'lucide-react';
import { PageTransition } from '../ui/PageTransition';
import { motion } from 'framer-motion';
import { Berry } from '../ui/Berry';
interface HealthDataScreenProps {
  onBack: () => void;
}
export const HealthDataScreen: React.FC<HealthDataScreenProps> = ({
  onBack
}) => {
  return <PageTransition>
      <div className="flex flex-col min-h-screen bg-white pb-6">
        <div className="px-4 pt-12 pb-4 flex items-center">
          <motion.button className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mr-4" onClick={onBack} whileHover={{
          scale: 1.05
        }} whileTap={{
          scale: 0.95
        }}>
            <ArrowLeftIcon size={20} />
          </motion.button>
          <h1 className="text-2xl font-bold">Health Data</h1>
        </div>
        <div className="px-4 py-6 flex flex-col items-center justify-center">
          <div className="mb-6">
            <Berry variant="magnify" size="large" />
          </div>
          <h2 className="text-xl font-bold mb-3 text-center">
            Track Your Health Metrics
          </h2>
          <p className="text-gray-600 text-center mb-8">
            Log and track your health metrics to get personalized nutrition
            recommendations.
          </p>
          {/* Activity Data */}
          <div className="w-full bg-white border border-gray-100 rounded-xl p-4 shadow-sm mb-4">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 rounded-full bg-[#FF5252]/10 flex items-center justify-center mr-3">
                <ActivityIcon size={20} className="text-[#FF5252]" />
              </div>
              <h2 className="font-medium">Activity Data</h2>
            </div>
            <div className="grid grid-cols-3 gap-3 mb-3">
              <div className="bg-gray-50 p-3 rounded-lg text-center">
                <p className="text-xs text-gray-500">Steps</p>
                <p className="font-bold text-lg">8,432</p>
                <p className="text-xs text-green-500">+12% ↑</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg text-center">
                <p className="text-xs text-gray-500">Calories</p>
                <p className="font-bold text-lg">386</p>
                <p className="text-xs text-green-500">+8% ↑</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg text-center">
                <p className="text-xs text-gray-500">Distance</p>
                <p className="font-bold text-lg">3.2</p>
                <p className="text-xs text-gray-500">miles</p>
              </div>
            </div>
            <button className="w-full py-2 text-sm text-[#320DFF] font-medium border border-[#320DFF]/20 rounded-lg">
              Log Activity
            </button>
          </div>
          {/* Heart Rate */}
          <div className="w-full bg-white border border-gray-100 rounded-xl p-4 shadow-sm mb-4">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 rounded-full bg-[#F06292]/10 flex items-center justify-center mr-3">
                <HeartIcon size={20} className="text-[#F06292]" />
              </div>
              <h2 className="font-medium">Heart Rate</h2>
            </div>
            <div className="flex justify-between items-end mb-2">
              <div>
                <p className="text-xs text-gray-500">Resting</p>
                <p className="font-bold text-xl">68</p>
                <p className="text-xs text-gray-500">BPM</p>
              </div>
              <div className="h-16 flex items-end space-x-1">
                {[60, 75, 65, 80, 70, 85, 68].map((value, index) => <div key={index} className="w-3 bg-[#F06292]/60 rounded-t" style={{
                height: `${value / 100 * 64}px`
              }}></div>)}
              </div>
            </div>
            <button className="w-full py-2 text-sm text-[#320DFF] font-medium border border-[#320DFF]/20 rounded-lg">
              Log Heart Rate
            </button>
          </div>
          {/* Hydration */}
          <div className="w-full bg-white border border-gray-100 rounded-xl p-4 shadow-sm mb-4">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 rounded-full bg-[#42A5F5]/10 flex items-center justify-center mr-3">
                <DropletIcon size={20} className="text-[#42A5F5]" />
              </div>
              <h2 className="font-medium">Hydration</h2>
            </div>
            <div className="flex items-center mb-2">
              <div className="w-16 h-16 rounded-full border-4 border-[#42A5F5]/30 flex items-center justify-center mr-4">
                <div className="text-center">
                  <p className="font-bold text-xl">65%</p>
                </div>
              </div>
              <div>
                <p className="font-medium">1.3 / 2.0 L</p>
                <p className="text-sm text-gray-500">Today's intake</p>
              </div>
            </div>
            <button className="w-full py-2 text-sm text-[#320DFF] font-medium border border-[#320DFF]/20 rounded-lg">
              Log Water Intake
            </button>
          </div>
        </div>
      </div>
    </PageTransition>;
};