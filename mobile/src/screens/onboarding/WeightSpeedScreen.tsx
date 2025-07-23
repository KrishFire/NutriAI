import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Activity, Zap, Rocket } from 'lucide-react-native';
import PlatformSlider from '../../components/common/PlatformSlider';
import { MotiView } from 'moti';
import { hapticFeedback } from '../../utils/haptics';
import { useOnboarding } from './OnboardingFlow';

const WeightSpeedScreen = () => {
  const { goToNextStep, goToPreviousStep, progress, updateUserData, userData } = useOnboarding();
  
  const goal = userData.goal || 'lose';
  const [selectedSpeed, setSelectedSpeed] = useState(1.0);
  const [isMetric, setIsMetric] = useState(false);

  useEffect(() => {
    // Check if user's weight unit is metric
    const weight = userData.weight || userData.currentWeight;
    if (weight && weight.unit === 'kg') {
      setIsMetric(true);
    }
  }, [userData]);

  const handleSpeedChange = (value: number) => {
    hapticFeedback.selection();
    // Round to 1 decimal place
    setSelectedSpeed(Math.round(value * 10) / 10);
  };

  const handleContinue = () => {
    hapticFeedback.impact();
    updateUserData('weightChangeSpeed', selectedSpeed);
    goToNextStep();
  };

  const actionWord = goal === 'lose' ? 'lose' : 'gain';

  // Get description based on selected speed
  const getSpeedDescription = () => {
    if (selectedSpeed <= 0.5) {
      return 'Gradual pace, easier to maintain long-term';
    } else if (selectedSpeed <= 1.0) {
      return 'Recommended pace for sustainable results';
    } else if (selectedSpeed <= 1.5) {
      return 'Moderate pace, balanced approach';
    } else if (selectedSpeed <= 2.0) {
      return 'Ambitious pace, requires dedication';
    } else {
      return 'Aggressive pace, requires strict discipline';
    }
  };

  // Get icon based on selected speed
  const getSpeedIcon = () => {
    if (selectedSpeed <= 1.0) {
      return <Activity size={48} color="#320DFF" />;
    } else if (selectedSpeed <= 1.5) {
      return <Zap size={48} color="#320DFF" />;
    } else {
      return <Rocket size={48} color="#320DFF" />;
    }
  };

  // Convert to kg per week for metric display
  const kgPerWeek = (selectedSpeed * 0.453592).toFixed(1);

  // Get speed indicator color
  const getSpeedColor = () => {
    if (selectedSpeed <= 1.0) return '#10B981'; // Green for sustainable
    if (selectedSpeed <= 1.5) return '#320DFF'; // Primary for moderate
    return '#F59E0B'; // Amber for aggressive
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView 
        className="flex-1" 
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-1 px-6 py-4">
          {/* Header with back button */}
          <View className="flex-row items-center mb-4">
            <TouchableOpacity
              onPress={() => {
                hapticFeedback.selection();
                goToPreviousStep();
              }}
              className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center"
            >
              <ArrowLeft size={20} color="#000" />
            </TouchableOpacity>
          </View>

          {/* Progress bar */}
          <View className="w-full h-1 bg-gray-100 rounded-full mb-8">
            <View 
              className="h-full bg-primary rounded-full" 
              style={{ width: `${progress}%` }}
            />
          </View>

          {/* Title and subtitle */}
          <View className="mb-8">
            <Text className="text-3xl font-bold text-gray-900 mb-3">
              How fast do you want to reach your goal?
            </Text>
            <Text className="text-gray-600 text-lg">
              {`Select your preferred ${actionWord} weight speed`}
            </Text>
          </View>

          {/* Speed Display */}
          <View className="items-center mb-8">
            {/* Icon */}
            <MotiView
              key={selectedSpeed <= 1.0 ? 'activity' : selectedSpeed <= 1.5 ? 'zap' : 'rocket'}
              from={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', damping: 15 }}
              className="mb-6"
            >
              {getSpeedIcon()}
            </MotiView>

            {/* Speed Value */}
            <MotiView
              key={selectedSpeed.toString()}
              from={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', damping: 15 }}
              className="mb-2"
            >
              <Text className="text-4xl font-bold text-center" style={{ color: getSpeedColor() }}>
                {selectedSpeed.toFixed(1)}
                <Text className="text-xl"> lb/week</Text>
              </Text>
              {isMetric && (
                <Text className="text-sm text-gray-500 text-center mt-1">
                  ({kgPerWeek} kg/week)
                </Text>
              )}
            </MotiView>
          </View>

          {/* Slider */}
          <View className="mb-8">
            <Slider
              style={{ width: '100%', height: 40 }}
              minimumValue={0.5}
              maximumValue={2.0}
              value={selectedSpeed}
              onValueChange={handleSpeedChange}
              minimumTrackTintColor={getSpeedColor()}
              maximumTrackTintColor="#E5E7EB"
              thumbTintColor={getSpeedColor()}
              step={0.1}
            />
            
            {/* Labels */}
            <View className="flex-row justify-between mt-2">
              <Text className="text-sm text-gray-600">Gradual</Text>
              <Text className="text-sm text-gray-600">Moderate</Text>
              <Text className="text-sm text-gray-600">Aggressive</Text>
            </View>

            {/* Speed range indicators */}
            <View className="flex-row justify-between mt-2 px-2">
              <View className={`h-1 w-20 rounded-full ${selectedSpeed <= 1.0 ? 'bg-green-500' : 'bg-gray-300'}`} />
              <View className={`h-1 w-20 rounded-full ${selectedSpeed > 1.0 && selectedSpeed <= 1.5 ? 'bg-primary' : 'bg-gray-300'}`} />
              <View className={`h-1 w-20 rounded-full ${selectedSpeed > 1.5 ? 'bg-amber-500' : 'bg-gray-300'}`} />
            </View>
          </View>

          {/* Description Card */}
          <MotiView
            from={{ opacity: 0, translateY: 10 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: 200 }}
            className="bg-primary/10 px-6 py-4 rounded-2xl mb-6"
          >
            <Text className="text-center text-primary font-medium text-base">
              {getSpeedDescription()}
            </Text>
          </MotiView>

          {/* Recommendation Note */}
          {selectedSpeed > 2.0 && (
            <MotiView
              from={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-amber-50 border border-amber-200 px-4 py-3 rounded-xl mb-6"
            >
              <Text className="text-amber-800 text-sm text-center">
                Note: Speeds above 2 lbs/week may not be sustainable for everyone
              </Text>
            </MotiView>
          )}

          {/* Spacer to push button to bottom */}
          <View className="flex-1" />

          {/* Continue Button */}
          <View className="mb-6">
            <TouchableOpacity
              onPress={handleContinue}
              className="bg-primary py-4 rounded-full items-center justify-center"
              activeOpacity={0.8}
            >
              <Text className="text-white font-semibold text-base">
                Continue
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default WeightSpeedScreen;