import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, RotateCcw } from 'lucide-react-native';
import { MotiView } from 'moti';
import PlatformSlider from '../../components/common/PlatformSlider';
import Svg, { Path, G, Circle, Text as SvgText } from 'react-native-svg';
import { hapticFeedback } from '../../utils/haptics';
import { useOnboarding } from './OnboardingFlow';

const { width: screenWidth } = Dimensions.get('window');

const MacroTargetsScreen = () => {
  const { goToNextStep, goToPreviousStep, progress, updateUserData, userData } = useOnboarding();
  
  const [calories, setCalories] = useState(2000);
  const [macros, setMacros] = useState({
    carbs: 50,
    protein: 30,
    fat: 20,
  });
  const [originalMacros, setOriginalMacros] = useState({
    carbs: 50,
    protein: 30,
    fat: 20,
  });
  const [originalCalories, setOriginalCalories] = useState(2000);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    // Calculate calories based on user data if available
    if (userData) {
      // This is a simplified calculation
      let baseCalories = 0;
      
      // Base metabolic rate calculation (simplified)
      if (userData.gender === 'male') {
        baseCalories = 1800;
      } else {
        baseCalories = 1600;
      }

      // Adjust for activity level
      const activityMultipliers = {
        sedentary: 1.2,
        light: 1.375,
        moderate: 1.55,
        active: 1.725,
      };
      
      const activityLevel = userData.activityLevel || 'moderate';
      baseCalories *= activityMultipliers[activityLevel as keyof typeof activityMultipliers];

      // Adjust for goal
      if (userData.goal === 'lose') {
        baseCalories *= 0.8; // 20% deficit
      } else if (userData.goal === 'gain') {
        baseCalories *= 1.15; // 15% surplus
      }

      // Round to nearest 50
      const calculatedCalories = Math.round(baseCalories / 50) * 50;
      setCalories(calculatedCalories);
      setOriginalCalories(calculatedCalories);

      // Adjust macros based on goal
      let calculatedMacros = {
        carbs: 45,
        protein: 30,
        fat: 25,
      };

      if (userData.goal === 'lose') {
        calculatedMacros = {
          carbs: 40,
          protein: 40,
          fat: 20,
        };
      } else if (userData.goal === 'gain') {
        calculatedMacros = {
          carbs: 50,
          protein: 30,
          fat: 20,
        };
      }

      setMacros(calculatedMacros);
      setOriginalMacros(calculatedMacros);
    }
  }, [userData]);

  const handleMacroChange = (macro: string, value: number) => {
    hapticFeedback.selection();
    
    // Calculate the other macros to ensure they sum to 100%
    const remaining = 100 - value;
    const others = Object.keys(macros).filter(m => m !== macro);
    const currentOthersTotal = others.reduce((sum, m) => sum + macros[m as keyof typeof macros], 0);
    
    const newMacros = { ...macros, [macro]: value };
    
    others.forEach((m, index) => {
      if (currentOthersTotal === 0) {
        // If others sum to 0, distribute equally
        newMacros[m as keyof typeof macros] = Math.floor(remaining / others.length);
      } else {
        // Distribute proportionally
        const proportion = macros[m as keyof typeof macros] / currentOthersTotal;
        newMacros[m as keyof typeof macros] = Math.round(remaining * proportion);
      }
    });
    
    // Ensure they sum to 100
    const total = Object.values(newMacros).reduce((sum, val) => sum + val, 0);
    if (total !== 100) {
      const diff = 100 - total;
      // Add difference to the largest macro that isn't the one being changed
      const largestOther = others.reduce((largest, m) => 
        newMacros[m as keyof typeof macros] > newMacros[largest as keyof typeof macros] ? m : largest
      );
      newMacros[largestOther as keyof typeof macros] += diff;
    }
    
    setMacros(newMacros);
  };

  const handleCaloriesChange = (newCalories: number) => {
    hapticFeedback.selection();
    setCalories(Math.round(newCalories));
  };

  const handleContinue = () => {
    hapticFeedback.impact();
    updateUserData('dailyCalories', calories);
    updateUserData('macroTargets', macros);
    goToNextStep();
  };

  const toggleEditing = () => {
    hapticFeedback.selection();
    setIsEditing(!isEditing);
  };

  const handleRevertChanges = () => {
    hapticFeedback.selection();
    setCalories(originalCalories);
    setMacros(originalMacros);
  };

  // Check if values have been changed from original
  const hasChanges = 
    calories !== originalCalories || 
    macros.carbs !== originalMacros.carbs || 
    macros.protein !== originalMacros.protein || 
    macros.fat !== originalMacros.fat;

  // Pie chart rendering
  const renderPieChart = () => {
    const size = 200;
    const center = size / 2;
    const radius = 80;
    const innerRadius = 60;
    
    const data = [
      { name: 'Carbs', value: macros.carbs, color: '#FFC078' },
      { name: 'Protein', value: macros.protein, color: '#74C0FC' },
      { name: 'Fat', value: macros.fat, color: '#8CE99A' },
    ];
    
    let angleOffset = -90; // Start from top
    
    return (
      <View className="items-center mb-6">
        <Svg width={size} height={size}>
          {data.map((item, index) => {
            const angle = (item.value / 100) * 360;
            const startAngle = angleOffset;
            const endAngle = startAngle + angle;
            
            const path = describeArc(center, center, radius, innerRadius, startAngle, endAngle);
            angleOffset = endAngle;
            
            return (
              <Path
                key={index}
                d={path}
                fill={item.color}
                stroke="white"
                strokeWidth="2"
              />
            );
          })}
        </Svg>
      </View>
    );
  };

  // Helper function to describe an arc path
  const describeArc = (x: number, y: number, radius: number, innerRadius: number, startAngle: number, endAngle: number) => {
    const start = polarToCartesian(x, y, radius, endAngle);
    const end = polarToCartesian(x, y, radius, startAngle);
    const innerStart = polarToCartesian(x, y, innerRadius, endAngle);
    const innerEnd = polarToCartesian(x, y, innerRadius, startAngle);
    
    const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
    
    return [
      'M', start.x, start.y,
      'A', radius, radius, 0, largeArcFlag, 0, end.x, end.y,
      'L', innerEnd.x, innerEnd.y,
      'A', innerRadius, innerRadius, 0, largeArcFlag, 1, innerStart.x, innerStart.y,
      'Z'
    ].join(' ');
  };

  const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
    const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
    return {
      x: centerX + (radius * Math.cos(angleInRadians)),
      y: centerY + (radius * Math.sin(angleInRadians))
    };
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
          <View className="mb-6">
            <Text className="text-3xl font-bold text-gray-900 mb-3">
              Your nutrition plan is ready!
            </Text>
            <Text className="text-gray-600 text-lg">
              Here's your personalized daily targets
            </Text>
          </View>

          {/* Daily Calories */}
          <View className="mb-8">
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-lg font-medium text-gray-900">Daily Calories</Text>
              <View className="flex-row items-center">
                {hasChanges && (
                  <TouchableOpacity
                    onPress={handleRevertChanges}
                    className="flex-row items-center mr-3"
                  >
                    <RotateCcw size={14} color="#666" />
                    <Text className="text-sm text-gray-500 font-medium ml-1">Reset</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity onPress={toggleEditing}>
                  <Text className="text-sm text-primary font-medium">
                    {isEditing ? 'Done' : 'Edit'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {isEditing ? (
              <View className="bg-gray-100 p-4 rounded-xl">
                <PlatformSlider
                  minimumValue={1200}
                  maximumValue={3000}
                  value={calories}
                  onValueChange={handleCaloriesChange}
                  minimumTrackTintColor="#320DFF"
                  maximumTrackTintColor="#E5E7EB"
                  thumbTintColor="#320DFF"
                  step={50}
                />
                <View className="flex-row justify-between mt-2">
                  <Text className="text-sm text-gray-600">1200</Text>
                  <Text className="text-lg font-bold text-primary">{calories}</Text>
                  <Text className="text-sm text-gray-600">3000</Text>
                </View>
              </View>
            ) : (
              <View className="bg-primary/10 p-6 rounded-xl items-center">
                <Text className="text-4xl font-bold text-primary">{calories}</Text>
                <Text className="text-sm text-gray-600">calories per day</Text>
              </View>
            )}
          </View>

          {/* Macronutrient Balance */}
          <View className="mb-8">
            <Text className="text-lg font-medium text-gray-900 mb-4">
              Macronutrient Balance
            </Text>

            {/* Pie Chart */}
            {renderPieChart()}

            {/* Macro Sliders/Bars */}
            <View>
              {Object.entries(macros).map(([macro, percentage]) => (
                <View key={macro} className="mb-4">
                  <View className="flex-row justify-between mb-1">
                    <Text className="text-gray-700 capitalize">{macro}</Text>
                    <Text className="font-medium">{percentage}%</Text>
                  </View>
                  
                  {isEditing ? (
                    <PlatformSlider
                      minimumValue={10}
                      maximumValue={70}
                      value={percentage}
                      onValueChange={(value) => handleMacroChange(macro, Math.round(value))}
                      minimumTrackTintColor={
                        macro === 'carbs' ? '#FFC078' :
                        macro === 'protein' ? '#74C0FC' : '#8CE99A'
                      }
                      maximumTrackTintColor="#E5E7EB"
                      thumbTintColor={
                        macro === 'carbs' ? '#FFC078' :
                        macro === 'protein' ? '#74C0FC' : '#8CE99A'
                      }
                    />
                  ) : (
                    <View className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                      <View 
                        className={`h-full rounded-full ${
                          macro === 'carbs' ? 'bg-[#FFC078]' :
                          macro === 'protein' ? 'bg-[#74C0FC]' : 'bg-[#8CE99A]'
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </View>
                  )}
                  
                  <Text className="text-xs text-gray-600 mt-1">
                    {macro === 'carbs' && `${Math.round(calories * percentage / 400)} g`}
                    {macro === 'protein' && `${Math.round(calories * percentage / 400)} g`}
                    {macro === 'fat' && `${Math.round(calories * percentage / 900)} g`}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Info Card */}
          <View className="bg-primary/10 px-4 py-3 rounded-xl mb-6">
            <Text className="text-center text-primary font-medium">
              These targets are optimized for your goals, but you can adjust them anytime
            </Text>
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

export default MacroTargetsScreen;