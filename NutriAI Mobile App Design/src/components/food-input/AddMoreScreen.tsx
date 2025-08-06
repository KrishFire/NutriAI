import React from 'react';
import { ArrowLeftIcon, CameraIcon, MicIcon, BarcodeIcon, KeyboardIcon, StarIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { PageTransition } from '../ui/PageTransition';
import { hapticFeedback } from '../../utils/haptics';
interface AddMoreScreenProps {
  onBack: () => void;
  currentMeal: any;
  onCameraCapture: () => void;
  onVoiceCapture: () => void;
  onBarcodeCapture: () => void;
  onTextInput: () => void;
  onFavorites?: () => void;
}
export const AddMoreScreen: React.FC<AddMoreScreenProps> = ({
  onBack,
  currentMeal,
  onCameraCapture,
  onVoiceCapture,
  onBarcodeCapture,
  onTextInput,
  onFavorites
}) => {
  const handleBack = () => {
    hapticFeedback.selection();
    onBack();
  };
  const inputMethods = [{
    name: 'Camera',
    icon: CameraIcon,
    color: '#4CAF50',
    action: onCameraCapture,
    description: 'Take a photo of your food'
  }, {
    name: 'Voice',
    icon: MicIcon,
    color: '#2196F3',
    action: onVoiceCapture,
    description: 'Describe your food with your voice'
  }, {
    name: 'Barcode',
    icon: BarcodeIcon,
    color: '#9C27B0',
    action: onBarcodeCapture,
    description: 'Scan a product barcode'
  }, {
    name: 'Text',
    icon: KeyboardIcon,
    color: '#FF9800',
    action: onTextInput,
    description: 'Type what you ate'
  }, {
    name: 'Favorites',
    icon: StarIcon,
    color: '#F44336',
    action: onFavorites,
    description: 'Add from your favorites'
  }];
  return <PageTransition>
      <div className="flex flex-col min-h-screen bg-white dark:bg-gray-900">
        <div className="px-4 pt-12 pb-4 flex items-center">
          <motion.button className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mr-4" onClick={handleBack} whileHover={{
          scale: 1.05
        }} whileTap={{
          scale: 0.95
        }}>
            <ArrowLeftIcon size={20} className="text-gray-700 dark:text-gray-300" />
          </motion.button>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              Add More Food
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Choose how to add more items
            </p>
          </div>
        </div>
        <div className="px-4 py-6 flex-1">
          <div className="space-y-4">
            {inputMethods.map((method, index) => <motion.button key={method.name} className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 flex items-center" onClick={() => {
            hapticFeedback.selection();
            method.action();
          }} whileHover={{
            scale: 1.02,
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)'
          }} whileTap={{
            scale: 0.98
          }} initial={{
            opacity: 0,
            y: 20
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            delay: index * 0.1
          }}>
                <div className="w-12 h-12 rounded-full flex items-center justify-center mr-4" style={{
              backgroundColor: `${method.color}15`
            }}>
                  <method.icon size={24} style={{
                color: method.color
              }} />
                </div>
                <div className="flex-1 text-left">
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    {method.name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {method.description}
                  </p>
                </div>
              </motion.button>)}
          </div>
        </div>
      </div>
    </PageTransition>;
};