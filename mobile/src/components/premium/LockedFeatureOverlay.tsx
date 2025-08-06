import React from 'react';
import {
  View,
  Text,
  Modal,
  Pressable,
  Dimensions,
  BlurView,
} from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  SlideInDown,
  SlideOutDown,
  withSpring,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import { MotiView } from 'moti';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { hapticFeedback } from '../../utils/haptics';
import { Button } from '../ui/Button';
import { GlassMorphism } from '../ui/GlassMorphism';

const { width } = Dimensions.get('window');

interface LockedFeatureOverlayProps {
  visible: boolean;
  featureName: string;
  onUpgrade: () => void;
  onClose: () => void;
}

export const LockedFeatureOverlay: React.FC<LockedFeatureOverlayProps> = ({
  visible,
  featureName,
  onUpgrade,
  onClose,
}) => {
  const scale = useSharedValue(1);

  const handleUpgrade = async () => {
    await hapticFeedback.impact();
    onUpgrade();
  };

  const handleClose = async () => {
    await hapticFeedback.selection();
    onClose();
  };

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
        className="flex-1 bg-black/60 items-center justify-center p-6"
      >
        <Animated.View
          entering={SlideInDown.springify().damping(15)}
          exiting={SlideOutDown.springify()}
          className="w-full max-w-sm"
        >
          <GlassMorphism
            intensity={0.8}
            className="rounded-2xl overflow-hidden"
          >
            <View className="bg-white/80 dark:bg-gray-900/80">
              {/* Header with gradient */}
              <LinearGradient
                colors={['#320DFF', '#6D56FF']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="h-48 items-center justify-center relative"
              >
                <Pressable
                  onPress={handleClose}
                  className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 items-center justify-center"
                >
                  <Ionicons name="close" size={16} color="white" />
                </Pressable>

                <MotiView
                  from={{ scale: 0, rotate: '-45deg' }}
                  animate={{ scale: 1, rotate: '0deg' }}
                  transition={{
                    type: 'spring',
                    damping: 15,
                    stiffness: 200,
                  }}
                  className="w-20 h-20 rounded-full bg-white/20 items-center justify-center"
                >
                  <Ionicons name="lock-closed" size={40} color="white" />
                </MotiView>
              </LinearGradient>

              {/* Content */}
              <View className="p-6">
                <Text className="text-xl font-bold text-gray-900 dark:text-white text-center mb-2">
                  Premium Feature
                </Text>

                <Text className="text-gray-600 dark:text-gray-400 text-center mb-6">
                  {featureName} is available exclusively to Premium subscribers.
                  Upgrade now to unlock this and all other premium features.
                </Text>

                <View className="space-y-3">
                  <Button variant="primary" fullWidth onPress={handleUpgrade}>
                    Upgrade to Premium
                  </Button>

                  <Button variant="secondary" fullWidth onPress={handleClose}>
                    Maybe Later
                  </Button>
                </View>
              </View>
            </View>
          </GlassMorphism>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};
