import React, { useRef } from 'react';
import {
  View,
  Text,
  Pressable,
  Modal,
  Dimensions,
} from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  SlideInDown,
  SlideOutDown,
  useAnimatedStyle,
  withSpring,
  useSharedValue,
} from 'react-native-reanimated';
import { MotiView } from 'moti';
import { Ionicons } from '@expo/vector-icons';
import { hapticFeedback } from '../../utils/haptics';
import { Button } from '../ui/Button';
import BottomSheet from '@gorhom/bottom-sheet';
import { GlassMorphism } from '../ui/GlassMorphism';

const { height } = Dimensions.get('window');

interface TrialCountdownBannerProps {
  visible: boolean;
  daysLeft: number;
  onUpgrade: () => void;
  onClose: () => void;
}

export const TrialCountdownBanner: React.FC<TrialCountdownBannerProps> = ({
  visible,
  daysLeft,
  onUpgrade,
  onClose,
}) => {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const isLastDay = daysLeft <= 1;

  const handleUpgrade = async () => {
    await hapticFeedback.impact();
    onUpgrade();
  };

  const handleClose = async () => {
    await hapticFeedback.selection();
    onClose();
  };

  const features = [
    'Advanced Analytics & Insights',
    'Unlimited History & Data',
    'Custom Recipe Creation',
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
    >
      <Animated.View
        entering={FadeIn.duration(300)}
        exiting={FadeOut.duration(300)}
        className="flex-1 bg-black/50 justify-end"
      >
        <Pressable className="flex-1" onPress={handleClose} />
        
        <Animated.View
          entering={SlideInDown.springify().damping(18)}
          exiting={SlideOutDown.springify()}
        >
          <GlassMorphism
            intensity={0.9}
            className="rounded-t-3xl overflow-hidden"
          >
            <View className="bg-white/90 dark:bg-gray-900/90 p-6">
              {/* Header */}
              <View className="flex-row justify-between items-center mb-4">
                <View className="flex-row items-center">
                  <Ionicons
                    name="time"
                    size={20}
                    color={isLastDay ? '#EF4444' : '#320DFF'}
                  />
                  <Text className="font-bold text-lg text-gray-900 dark:text-white ml-2">
                    {isLastDay ? 'Trial Ends Today' : `${daysLeft} Days Left`}
                  </Text>
                </View>
                
                <Pressable
                  onPress={handleClose}
                  className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 items-center justify-center"
                >
                  <Ionicons name="close" size={16} color="#6B7280" />
                </Pressable>
              </View>

              {/* Alert Box */}
              <View
                className={`
                  p-4 rounded-xl mb-4 border
                  ${isLastDay 
                    ? 'bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-900/30' 
                    : 'bg-primary/5 dark:bg-primaryDark/10 border-primary/10 dark:border-primaryDark/20'
                  }
                `}
              >
                <Text
                  className={`
                    text-sm
                    ${isLastDay 
                      ? 'text-red-600 dark:text-red-400' 
                      : 'text-primary dark:text-primaryDark'
                    }
                  `}
                >
                  {isLastDay 
                    ? 'Your free trial ends today. Subscribe now to keep all premium features and avoid losing access.' 
                    : `Your free trial will end in ${daysLeft} days. Upgrade now to continue enjoying all premium features.`
                  }
                </Text>
              </View>

              {/* Features */}
              <View className="space-y-4 mb-6">
                {features.map((feature, index) => (
                  <MotiView
                    key={index}
                    from={{ opacity: 0, translateX: -20 }}
                    animate={{ opacity: 1, translateX: 0 }}
                    transition={{ delay: 100 + index * 100 }}
                    className="flex-row items-center"
                  >
                    <View className="w-8 h-8 rounded-full bg-primary/10 dark:bg-primaryDark/20 items-center justify-center mr-3">
                      <View className="w-3 h-3 rounded-full bg-primary dark:bg-primaryDark" />
                    </View>
                    <Text className="text-gray-700 dark:text-gray-300">
                      {feature}
                    </Text>
                  </MotiView>
                ))}
              </View>

              {/* Actions */}
              <View className="space-y-3">
                <Button
                  variant="primary"
                  fullWidth
                  onPress={handleUpgrade}
                >
                  {isLastDay ? 'Subscribe Now' : 'Upgrade to Premium'}
                </Button>
                
                <Button
                  variant="secondary"
                  fullWidth
                  onPress={handleClose}
                >
                  {isLastDay ? 'Remind Me Later' : 'Maybe Later'}
                </Button>
              </View>
            </View>
          </GlassMorphism>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};