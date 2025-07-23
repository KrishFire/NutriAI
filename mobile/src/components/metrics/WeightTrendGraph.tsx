import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MotiView } from 'moti';
import { Ionicons } from '@expo/vector-icons';
import { LineChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';

interface WeightDataPoint {
  date: string;
  weight: number;
}

interface WeightTrendGraphProps {
  data: WeightDataPoint[];
  startWeight: number;
  currentWeight: number;
  goalWeight?: number;
  unit: 'lbs' | 'kg';
  onExpand?: () => void;
}

const screenWidth = Dimensions.get('window').width;

export function WeightTrendGraph({
  data,
  startWeight,
  currentWeight,
  goalWeight,
  unit = 'lbs',
  onExpand
}: WeightTrendGraphProps) {
  const weightChange = currentWeight - startWeight;
  const isPositiveChange = weightChange >= 0;

  return (
    <MotiView
      from={{ opacity: 0, translateY: 20 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: 'timing', duration: 300 }}
      className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4"
    >
      <View className="flex-row justify-between items-center mb-4">
        <Text className="font-semibold text-gray-900 dark:text-white">
          Weight Trend
        </Text>
        {onExpand && (
          <TouchableOpacity onPress={onExpand}>
            <Text className="text-sm text-primary-600 dark:text-primary-400">
              View More
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <View className="flex-row items-center justify-between mb-4">
        <View>
          <Text className="text-xs text-gray-500 dark:text-gray-400">Starting</Text>
          <Text className="font-medium text-gray-900 dark:text-white">
            {startWeight} {unit}
          </Text>
        </View>
        
        <View className="flex-row items-center">
          <View className={`w-8 h-8 rounded-full ${
            isPositiveChange 
              ? 'bg-red-100 dark:bg-red-900/30' 
              : 'bg-green-100 dark:bg-green-900/30'
          } items-center justify-center mr-2`}>
            <Ionicons 
              name={isPositiveChange ? "trending-up" : "trending-down"} 
              size={16} 
              color={isPositiveChange ? "#ef4444" : "#22c55e"} 
            />
          </View>
          <View>
            <Text className={`text-xs ${
              isPositiveChange 
                ? 'text-red-600 dark:text-red-400' 
                : 'text-green-600 dark:text-green-400'
            }`}>
              {isPositiveChange ? '+' : ''}
              {weightChange.toFixed(1)} {unit}
            </Text>
            <Text className="text-xs text-gray-500 dark:text-gray-400">
              Since start
            </Text>
          </View>
        </View>
        
        {goalWeight && (
          <View>
            <Text className="text-xs text-gray-500 dark:text-gray-400">Goal</Text>
            <Text className="font-medium text-gray-900 dark:text-white">
              {goalWeight} {unit}
            </Text>
          </View>
        )}
      </View>

      <View className="h-32">
        <LineChart
          data={{
            labels: data.map(d => d.date.slice(0, 3)),
            datasets: [{
              data: data.map(d => d.weight)
            }]
          }}
          width={screenWidth - 80}
          height={120}
          chartConfig={{
            backgroundColor: "transparent",
            backgroundGradientFrom: "transparent",
            backgroundGradientTo: "transparent",
            decimalPlaces: 1,
            color: (opacity = 1) => `rgba(124, 58, 237, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(156, 163, 175, ${opacity})`,
            style: {
              borderRadius: 16
            },
            propsForDots: {
              r: "3",
              strokeWidth: "0",
              stroke: "#7c3aed"
            }
          }}
          bezier
          style={{
            marginVertical: 8,
            borderRadius: 16,
            marginLeft: -20
          }}
          withInnerLines={false}
          withOuterLines={false}
          withVerticalLines={false}
          withHorizontalLines={false}
        />
      </View>
    </MotiView>
  );
}