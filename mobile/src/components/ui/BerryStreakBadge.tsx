import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { MotiView } from 'moti';
import { hapticFeedback } from '../../utils/haptics';

interface BerryStreakBadgeProps {
  streak: number;
  onPress?: () => void;
}

export function BerryStreakBadge({ streak, onPress }: BerryStreakBadgeProps) {
  return (
    <MotiView
      from={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 200, type: 'spring' }}
    >
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => {
          hapticFeedback.selection();
          onPress?.();
        }}
        className="flex-row items-center bg-purple-500 px-3 py-1.5 rounded-full"
      >
        <Image
          source={require('../../../assets/berry/berry_trophy.png')}
          className="w-5 h-5 mr-1"
          resizeMode="contain"
        />
        <Text className="font-semibold text-white text-sm">
          {streak}
        </Text>
      </TouchableOpacity>
    </MotiView>
  );
}