import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, TrendingUp, TrendingDown } from 'lucide-react-native';
import { MotiView } from 'moti';
import Svg, { Path, Defs, LinearGradient, Stop, Circle, Line, Rect } from 'react-native-svg';
import { hapticFeedback } from '../../utils/haptics';
import { useOnboarding } from './OnboardingFlow';

const { width: screenWidth } = Dimensions.get('window');

const WeightTransitionScreen = () => {
  const { goToNextStep, goToPreviousStep, progress, userData } = useOnboarding();
  
  const goal = userData.goal || 'lose';
  
  const handleContinue = () => {
    hapticFeedback.impact();
    goToNextStep();
  };

  // Calculate graph dimensions
  const graphWidth = screenWidth - 48; // Account for padding
  const graphHeight = 240;
  const padding = { top: 20, right: 20, bottom: 40, left: 20 };
  const chartWidth = graphWidth - padding.left - padding.right;
  const chartHeight = graphHeight - padding.top - padding.bottom;

  // Define key points for the transformation curve
  const keyPoints = [
    { x: 0, y: goal === 'gain' ? 0.7 : 0.3, label: '3 Days' },
    { x: 0.45, y: goal === 'gain' ? 0.65 : 0.35, label: '7 Days' },
    { x: 1, y: goal === 'gain' ? 0.25 : 0.75, label: '30 Days' },
  ];

  // Convert normalized points to actual coordinates
  const getCoordinates = (point: { x: number; y: number }) => ({
    x: padding.left + point.x * chartWidth,
    y: padding.top + point.y * chartHeight,
  });

  // Generate smooth curve path
  const generatePath = () => {
    const points = keyPoints.map(getCoordinates);
    
    // Create a smooth curve using quadratic bezier curves
    let path = `M ${points[0].x} ${points[0].y}`;
    
    // First curve - gradual change
    const cp1x = points[0].x + (points[1].x - points[0].x) * 0.5;
    const cp1y = points[0].y;
    path += ` Q ${cp1x} ${cp1y}, ${points[1].x} ${points[1].y}`;
    
    // Second curve - steeper change
    const cp2x = points[1].x + (points[2].x - points[1].x) * 0.3;
    const cp2y = points[1].y;
    path += ` Q ${cp2x} ${cp2y}, ${points[2].x} ${points[2].y}`;
    
    return path;
  };

  // Generate area path (for gradient fill)
  const generateAreaPath = () => {
    const path = generatePath();
    const endPoint = getCoordinates(keyPoints[keyPoints.length - 1]);
    const startPoint = getCoordinates(keyPoints[0]);
    
    return `${path} L ${endPoint.x} ${chartHeight + padding.top} L ${startPoint.x} ${chartHeight + padding.top} Z`;
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
              Your journey to success starts now
            </Text>
            <Text className="text-gray-600 text-lg">
              See your transformation timeline below
            </Text>
          </View>

          {/* Graph */}
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 500 }}
            className="mb-8"
          >
            <View className="bg-blue-50 rounded-2xl p-4 shadow-sm border border-gray-100">
              <Text className="text-lg font-medium text-gray-800 mb-2">
                Your transformation journey
              </Text>
              
              <Svg width={graphWidth} height={graphHeight}>
                <Defs>
                  <LinearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <Stop offset="0%" stopColor="#320DFF" stopOpacity="0.2" />
                    <Stop offset="100%" stopColor="#F0F5FF" stopOpacity="0" />
                  </LinearGradient>
                </Defs>

                {/* Grid lines */}
                {[0.3, 0.5, 0.7].map((y, index) => {
                  const yPos = padding.top + y * chartHeight;
                  return (
                    <Line
                      key={index}
                      x1={padding.left}
                      y1={yPos}
                      x2={padding.left + chartWidth}
                      y2={yPos}
                      stroke="#E5E7EB"
                      strokeWidth="1"
                      strokeDasharray="4,4"
                    />
                  );
                })}

                {/* X-axis */}
                <Line
                  x1={padding.left}
                  y1={padding.top + chartHeight}
                  x2={padding.left + chartWidth}
                  y2={padding.top + chartHeight}
                  stroke="#333333"
                  strokeWidth="2"
                />

                {/* Area fill */}
                <Path
                  d={generateAreaPath()}
                  fill="url(#gradient)"
                />

                {/* Curve line */}
                <Path
                  d={generatePath()}
                  stroke="#320DFF"
                  strokeWidth="3"
                  fill="none"
                />

                {/* Data points */}
                {keyPoints.map((point, index) => {
                  const coords = getCoordinates(point);
                  return (
                    <React.Fragment key={index}>
                      {/* Outer circle */}
                      <Circle
                        cx={coords.x}
                        cy={coords.y}
                        r="8"
                        fill="white"
                        stroke="#320DFF"
                        strokeWidth="2"
                      />
                      {/* Inner circle */}
                      <Circle
                        cx={coords.x}
                        cy={coords.y}
                        r="4"
                        fill="#320DFF"
                      />
                    </React.Fragment>
                  );
                })}
              </Svg>

              {/* X-axis labels */}
              <View className="flex-row justify-between px-5 mt-2">
                {keyPoints.map((point, index) => (
                  <Text key={index} className="text-xs font-medium text-gray-700">
                    {point.label}
                  </Text>
                ))}
              </View>
            </View>
          </MotiView>

          {/* Info Card */}
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: 200 }}
            className="bg-primary/10 px-6 py-4 rounded-2xl mb-6"
          >
            <View className="flex-row items-center justify-center mb-2">
              {goal === 'gain' ? (
                <TrendingUp size={24} color="#320DFF" />
              ) : (
                <TrendingDown size={24} color="#320DFF" />
              )}
            </View>
            <Text className="text-center text-primary font-medium">
              {goal === 'lose' 
                ? 'The first week is about adapting, then your body accelerates into fat-burning mode!' 
                : 'Initial progress may be subtle, but after the first week your muscle growth will accelerate!'}
            </Text>
          </MotiView>

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

export default WeightTransitionScreen;