import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { MotiView } from 'moti';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@/components/ui/Button';
import * as Haptics from 'expo-haptics';
import { BlurView } from 'expo-blur';

interface WeightLogSheetProps {
  onClose: () => void;
  onSave: (weight: number, date: Date) => void;
  currentWeight?: number;
  visible?: boolean;
}

export function WeightLogSheet({
  onClose,
  onSave,
  currentWeight = 150,
  visible = true,
}: WeightLogSheetProps) {
  const [weight, setWeight] = useState(currentWeight);
  const [date, setDate] = useState(new Date());
  const [isLoading, setIsLoading] = useState(false);
  const [weightUnit, setWeightUnit] = useState<'lbs' | 'kg'>('lbs');

  const handleSave = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      onSave(weight, date);
    }, 1000);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const incrementWeight = () => {
    Haptics.selectionAsync();
    setWeight(prev => {
      const increment = weightUnit === 'lbs' ? 0.2 : 0.1;
      // V2: Use explicit rounding to avoid floating-point precision issues
      const newValue = prev + increment;
      const rounded = Math.round(newValue * 10) / 10;
      return rounded;
    });
  };

  const decrementWeight = () => {
    Haptics.selectionAsync();
    setWeight(prev => {
      const decrement = weightUnit === 'lbs' ? 0.2 : 0.1;
      // V2: Use explicit rounding to avoid floating-point precision issues
      const newValue = prev - decrement;
      const rounded = Math.round(newValue * 10) / 10;
      return rounded;
    });
  };

  const toggleWeightUnit = () => {
    Haptics.selectionAsync();
    if (weightUnit === 'lbs') {
      // Convert lbs to kg
      // V2: Use explicit rounding for conversion
      const kgValue = weight * 0.453592;
      setWeight(Math.round(kgValue * 10) / 10);
      setWeightUnit('kg');
    } else {
      // Convert kg to lbs
      // V2: Use explicit rounding for conversion
      const lbsValue = weight * 2.20462;
      setWeight(Math.round(lbsValue * 10) / 10);
      setWeightUnit('lbs');
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <MotiView
        from={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="flex-1 bg-black/50"
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={onClose}
          className="flex-1"
        >
          <View className="flex-1 justify-end">
            <TouchableOpacity activeOpacity={1}>
              <MotiView
                from={{ translateY: 300 }}
                animate={{ translateY: 0 }}
                exit={{ translateY: 300 }}
                transition={{
                  type: 'spring',
                  damping: 30,
                  stiffness: 300,
                }}
                className="bg-white dark:bg-gray-800 rounded-t-3xl overflow-hidden"
              >
                <View className="p-6">
                  {/* Header */}
                  <View className="flex-row justify-between items-center mb-6">
                    <Text className="font-bold text-lg text-gray-900 dark:text-white">
                      Log Weight
                    </Text>
                    <TouchableOpacity
                      onPress={() => {
                        Haptics.selectionAsync();
                        onClose();
                      }}
                      className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 items-center justify-center"
                    >
                      <Ionicons name="close" size={16} color="#6b7280" />
                    </TouchableOpacity>
                  </View>

                  {/* Weight Input */}
                  <View className="mb-6">
                    <View className="flex-row items-center justify-center mb-4">
                      <TouchableOpacity
                        onPress={decrementWeight}
                        className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 items-center justify-center"
                      >
                        <Ionicons name="remove" size={20} color="#6b7280" />
                      </TouchableOpacity>

                      <View className="flex-row items-baseline mx-6">
                        <Text className="text-4xl font-bold text-gray-900 dark:text-white">
                          {weight}
                        </Text>
                        <TouchableOpacity
                          onPress={toggleWeightUnit}
                          className="ml-2 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded"
                        >
                          <Text className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                            {weightUnit}
                          </Text>
                        </TouchableOpacity>
                      </View>

                      <TouchableOpacity
                        onPress={incrementWeight}
                        className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 items-center justify-center"
                      >
                        <Ionicons name="add" size={20} color="#6b7280" />
                      </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                      onPress={() => setDate(new Date())}
                      className="flex-row items-center justify-center"
                    >
                      <Ionicons name="calendar" size={16} color="#6b7280" />
                      <Text className="text-sm text-gray-600 dark:text-gray-400 ml-1">
                        {formatDate(date)}
                      </Text>
                      <Ionicons
                        name="chevron-forward"
                        size={14}
                        color="#6b7280"
                        className="ml-1"
                      />
                    </TouchableOpacity>
                  </View>

                  {/* Info Box */}
                  <View className="bg-primary-50 dark:bg-primary-900/20 border border-primary-100 dark:border-primary-800/30 rounded-xl p-4 mb-6">
                    <Text className="text-sm text-primary-700 dark:text-primary-300">
                      Regular weigh-ins help track your progress and adjust your
                      nutrition plan for better results.
                    </Text>
                  </View>

                  {/* Save Button */}
                  <Button
                    variant="primary"
                    fullWidth
                    onPress={handleSave}
                    loading={isLoading}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Saving...' : 'Save Weight'}
                  </Button>
                </View>
              </MotiView>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </MotiView>
    </Modal>
  );
}
