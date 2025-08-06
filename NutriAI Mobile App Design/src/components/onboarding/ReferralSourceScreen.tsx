import React, { useState } from 'react';
import { ArrowLeftIcon } from 'lucide-react';
import { Button } from '../ui/Button';
import { motion } from 'framer-motion';
import { hapticFeedback } from '../../utils/haptics';
interface ReferralSourceScreenProps {
  onBack: () => void;
  onNext: (source: string) => void;
}
export const ReferralSourceScreen: React.FC<ReferralSourceScreenProps> = ({
  onBack,
  onNext
}) => {
  const [selectedSource, setSelectedSource] = useState('');
  const sources = [{
    id: 'facebook',
    label: 'Facebook',
    icon: <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Facebook_Logo_%282019%29.png/1024px-Facebook_Logo_%282019%29.png" alt="Facebook" className="w-6 h-6" />
  }, {
    id: 'instagram',
    label: 'Instagram',
    icon: <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Instagram_logo_2016.svg/2048px-Instagram_logo_2016.svg.png" alt="Instagram" className="w-6 h-6" />
  }, {
    id: 'google',
    label: 'Google',
    icon: <img src="https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_272x92dp.png" alt="Google" className="w-12 h-4" />
  }, {
    id: 'tiktok',
    label: 'TikTok',
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M19.321 5.562a5.124 5.124 0 01-1.38-3.573h-3.826v12.193c0 1.264-1.034 2.281-2.3 2.281-1.266 0-2.3-1.017-2.3-2.281 0-1.264 1.034-2.281 2.3-2.281.252 0 .497.04.73.116V8.113a6.217 6.217 0 00-.73-.043c-3.406 0-6.174 2.767-6.174 6.17 0 3.404 2.768 6.17 6.174 6.17 3.405 0 6.173-2.766 6.173-6.17V9.07a8.803 8.803 0 005.131 1.643V6.868c-1.43 0-2.757-.495-3.798-1.306z" fill="#000" />
        </svg>
  }, {
    id: 'friend',
    label: 'Friend/Family',
    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M16 11C17.66 11 18.99 9.66 18.99 8C18.99 6.34 17.66 5 16 5C14.34 5 13 6.34 13 8C13 9.66 14.34 11 16 11ZM8 11C9.66 11 10.99 9.66 10.99 8C10.99 6.34 9.66 5 8 5C6.34 5 5 6.34 5 8C5 9.66 6.34 11 8 11ZM8 13C5.67 13 1 14.17 1 16.5V19H15V16.5C15 14.17 10.33 13 8 13ZM16 13C15.71 13 15.38 13.02 15.03 13.05C16.19 13.89 17 15.02 17 16.5V19H23V16.5C23 14.17 18.33 13 16 13Z" fill="#FF5722" />
        </svg>
  }, {
    id: 'app-store',
    label: 'App Store',
    icon: <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/App_Store_%28iOS%29.svg/1024px-App_Store_%28iOS%29.svg.png" alt="App Store" className="w-6 h-6" />
  }, {
    id: 'youtube',
    label: 'YouTube',
    icon: <svg viewBox="0 0 24 24" width="24" height="24">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" fill="#FF0000" />
        </svg>
  }, {
    id: 'tv',
    label: 'TV',
    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M21 3H3C1.9 3 1 3.9 1 5V17C1 18.1 1.9 19 3 19H8V21H16V19H21C22.1 19 23 18.1 23 17V5C23 3.9 22.1 3 21 3ZM21 17H3V5H21V17Z" fill="#673AB7" />
        </svg>
  }, {
    id: 'other',
    label: 'Other',
    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 19H11V17H13V19ZM15.07 11.25L14.17 12.17C13.45 12.9 13 13.5 13 15H11V14.5C11 13.4 11.45 12.4 12.17 11.67L13.41 10.41C13.78 10.05 14 9.55 14 9C14 7.9 13.1 7 12 7C10.9 7 10 7.9 10 9H8C8 6.79 9.79 5 12 5C14.21 5 16 6.79 16 9C16 9.88 15.64 10.68 15.07 11.25Z" fill="#757575" />
        </svg>
  }];
  const handleSelect = (source: string) => {
    hapticFeedback.selection();
    setSelectedSource(source);
  };
  const handleContinue = () => {
    if (selectedSource) {
      onNext(selectedSource);
    }
  };
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
      {/* Progress bar - fixed to show correct progress */}
      <div className="w-full h-1 bg-gray-100 rounded-full mb-8">
        <div className="h-full bg-[#320DFF] rounded-full" style={{
        width: '30%'
      }}></div>
      </div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-3">
          Where did you hear about us?
        </h1>
        <p className="text-gray-600 text-lg">
          We'd love to know how you found NutriAI
        </p>
      </div>
      <div className="grid grid-cols-2 gap-4 mb-8">
        {sources.map(source => <motion.button key={source.id} className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 ${selectedSource === source.id ? 'border-[#320DFF] bg-[#320DFF]/5' : 'border-gray-200'}`} onClick={() => handleSelect(source.id)} whileHover={{
        scale: 1.02
      }} whileTap={{
        scale: 0.98
      }}>
            <div className={`mb-2 ${selectedSource === source.id ? 'text-[#320DFF]' : 'text-gray-500'}`}>
              {source.icon}
            </div>
            <span className="text-sm font-medium">{source.label}</span>
          </motion.button>)}
      </div>
      <div className="mt-auto">
        <Button onClick={handleContinue} variant="primary" fullWidth disabled={!selectedSource}>
          Continue
        </Button>
      </div>
    </div>;
};