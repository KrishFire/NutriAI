import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Platform,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';
import PlatformSlider from '../../components/common/PlatformSlider';
import { MotiView } from 'moti';
import { hapticFeedback } from '../../utils/haptics';
import { useOnboarding } from './OnboardingFlow';

const { width: screenWidth } = Dimensions.get('window');

const TargetWeightScreen = () => {
  const { goToNextStep, goToPreviousStep, progress, updateUserData, userData } = useOnboarding();
  
  const currentWeight = userData.weight || { value: '150', unit: 'lbs' };
  const goal = userData.goal || 'lose';
  
  const [targetWeight, setTargetWeight] = useState({
    value: '',
    unit: currentWeight.unit,
  });
  const [currentGoal, setCurrentGoal] = useState(goal);

  useEffect(() => {
    // Set initial target weight based on goal and current weight
    const currentWeightValue = parseInt(currentWeight.value);
    let initialTarget = currentWeightValue;
    
    // Start with ±10 from current weight based on goal
    if (goal === 'lose') {
      initialTarget = Math.max(currentWeightValue - 10, currentWeight.unit === 'lbs' ? 100 : 45);
    } else if (goal === 'gain') {
      initialTarget = currentWeightValue + 10;
    }
    
    setTargetWeight({
      value: initialTarget.toString(),
      unit: currentWeight.unit,
    });
  }, [currentWeight, goal]);

  useEffect(() => {
    // Update goal based on target weight compared to current weight
    const currentWeightValue = parseInt(currentWeight.value);
    const targetWeightValue = parseInt(targetWeight.value);
    
    if (targetWeightValue < currentWeightValue) {
      setCurrentGoal('lose');
    } else if (targetWeightValue > currentWeightValue) {
      setCurrentGoal('gain');
    } else {
      setCurrentGoal('maintain');
    }
  }, [targetWeight, currentWeight]);

  const handleWeightChange = (value: number) => {
    hapticFeedback.selection();
    setTargetWeight({
      ...targetWeight,
      value: Math.round(value).toString(),
    });
  };

  const handleContinue = () => {
    hapticFeedback.impact();
    updateUserData('targetWeight', targetWeight);
    updateUserData('goal', currentGoal);
    goToNextStep();
  };

  // Generate min and max values for the slider
  const getSliderLimits = () => {
    const currentWeightValue = parseInt(currentWeight.value);
    const range = currentWeight.unit === 'lbs' ? 50 : 23; // Approx 50 lbs or 23 kg range
    
    return {
      min: Math.max(currentWeightValue - range, currentWeight.unit === 'lbs' ? 80 : 36),
      max: currentWeightValue + range,
    };
  };

  const { min, max } = getSliderLimits();
  const currentWeightValue = parseInt(currentWeight.value);
  const goalText = currentGoal === 'lose' ? 'lose' : currentGoal === 'gain' ? 'gain' : 'maintain';
  const weightDifference = Math.abs(parseInt(targetWeight.value) - currentWeightValue);

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
              What's your target weight?
            </Text>
            <Text className="text-gray-600 text-lg">
              {`Select how much weight you want to ${goalText}`}
            </Text>
          </View>

          {/* Weight Display and Goal */}
          <View className="items-center mb-8">
            <View className="mb-4">
              <Text 
                className={`text-sm font-medium ${
                  currentGoal === 'lose' ? 'text-primary' :
                  currentGoal === 'gain' ? 'text-primary' : 
                  'text-primary'
                }`}
              >
                {currentGoal === 'lose' ? 'Lose weight' : 
                 currentGoal === 'gain' ? 'Gain weight' : 
                 'Maintain weight'}
              </Text>
            </View>

            {/* Target Weight Display */}
            <MotiView
              key={targetWeight.value}
              from={{ scale: 0.9, opacity: 0.8 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', damping: 15 }}
              className="mb-8"
            >
              <Text className="text-5xl font-bold text-primary text-center">
                {targetWeight.value}
                <Text className="text-2xl"> {targetWeight.unit}</Text>
              </Text>
              <Text className="text-gray-600 text-center mt-2">Target Weight</Text>
            </MotiView>

            {/* Slider */}
            <View className="w-full mb-8">
              <View className="relative">
                {/* Current weight indicator */}
                <View 
                  className="absolute h-16 w-1 bg-gray-700 rounded-full z-10"
                  style={{
                    left: `${((currentWeightValue - min) / (max - min)) * 100}%`,
                    top: -8,
                  }}
                />
                
                {/* Slider */}
                <PlatformSlider
                  style={{ width: '100%', height: 40 }}
                  minimumValue={min}
                  maximumValue={max}
                  value={parseInt(targetWeight.value)}
                  onValueChange={handleWeightChange}
                  minimumTrackTintColor="#320DFF"
                  maximumTrackTintColor="#E5E7EB"
                  thumbTintColor="#320DFF"
                />
              </View>
              
              {/* Min/Max labels */}
              <View className="flex-row justify-between mt-2">
                <Text className="text-sm text-gray-600">
                  {min} {targetWeight.unit}
                </Text>
                <Text className="text-sm text-gray-600">
                  {max} {targetWeight.unit}
                </Text>
              </View>
            </View>

            {/* Weight difference display */}
            <MotiView
              from={{ opacity: 0, translateY: 10 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ delay: 200 }}
              className="bg-primary/10 px-6 py-4 rounded-2xl"
            >
              <Text className="text-center text-primary font-medium text-lg">
                {currentGoal === 'maintain' 
                  ? 'You want to maintain your current weight' 
                  : `You want to ${goalText} ${weightDifference} ${targetWeight.unit}`}
              </Text>
            </MotiView>
          </View>

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

export default TargetWeightScreen;