import React, { useEffect, useState } from 'react';
export const SplashScreen: React.FC = () => {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
    return () => clearInterval(interval);
  }, []);
  return <div className="flex flex-col items-center justify-center w-full h-screen bg-white">
      <div className="w-24 h-24 mb-8 flex items-center justify-center">
        <img src="/app_icon.png" alt="NutriAI logo" className="w-full h-full object-contain" />
      </div>
      <h1 className="text-2xl font-bold mb-8 text-gray-900">NutriAI</h1>
      <div className="w-48 h-1 bg-gray-200 rounded-full overflow-hidden">
        <div className="h-full bg-[#320DFF] rounded-full transition-all duration-200 ease-out" style={{
        width: `${progress}%`
      }}></div>
      </div>
      <p className="mt-4 text-gray-500 text-sm">Smart nutrition tracking</p>
    </div>;
};