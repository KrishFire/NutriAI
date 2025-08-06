import React from 'react';
import { SparklesIcon } from 'lucide-react';
import { Button } from '../ui/Button';
interface PremiumBannerProps {
  onUpgrade: () => void;
  compact?: boolean;
}
export const PremiumBanner: React.FC<PremiumBannerProps> = ({
  onUpgrade,
  compact = false
}) => {
  if (compact) {
    return <button onClick={onUpgrade} className="flex items-center px-3 py-1.5 bg-gradient-to-r from-[#320DFF] to-[#7B68EE] rounded-full text-white text-xs font-medium">
        <SparklesIcon size={12} className="mr-1" />
        Go Premium
      </button>;
  }
  return <div className="bg-gradient-to-r from-[#320DFF]/10 to-[#7B68EE]/10 rounded-xl p-4 mb-6">
      <div className="flex items-start">
        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#320DFF] to-[#7B68EE] flex items-center justify-center mr-3 flex-shrink-0">
          <SparklesIcon size={18} className="text-white" />
        </div>
        <div className="flex-1">
          <h3 className="font-medium mb-1">Upgrade to Premium</h3>
          <p className="text-sm text-gray-600 mb-3">
            Unlock advanced analytics, custom meal plans, and unlimited food
            logging
          </p>
          <Button onClick={onUpgrade} variant="primary" fullWidth={false}>
            <SparklesIcon size={16} className="mr-2" />
            Upgrade Now
          </Button>
        </div>
      </div>
    </div>;
};