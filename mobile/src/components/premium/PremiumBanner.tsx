import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Sparkles } from 'lucide-react-native';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

interface PremiumBannerProps {
  onUpgrade: () => void;
  compact?: boolean;
}

export const PremiumBanner: React.FC<PremiumBannerProps> = ({
  onUpgrade,
  compact = false
}) => {
  if (compact) {
    return (
      <TouchableOpacity
        onPress={onUpgrade}
        className="flex-row items-center px-3 py-1.5 bg-gradient-to-r from-primary to-[#7B68EE] rounded-full"
        activeOpacity={0.7}
      >
        <Sparkles size={12} color="white" className="mr-1" />
        <Text className="text-white text-xs font-medium">Go Premium</Text>
      </TouchableOpacity>
    );
  }

  return (
    <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
      <View className="flex-row items-start">
        <View className="w-10 h-10 rounded-full bg-gradient-to-r from-primary to-[#7B68EE] items-center justify-center mr-3">
          <Sparkles size={18} color="white" />
        </View>
        <View className="flex-1">
          <Text className="font-medium mb-1 text-gray-900">Go Premium 🎯</Text>
          <Text className="text-sm text-gray-600 mb-3">
            Unlock AI meal analysis & personalized insights
          </Text>
          <Button
            onPress={onUpgrade}
            variant="primary"
            size="small"
          >
            <View className="flex-row items-center">
              <Sparkles size={16} color="white" className="mr-2" />
              <Text className="text-white font-medium">Upgrade Now</Text>
            </View>
          </Button>
        </View>
      </View>
    </Card>
  );
};