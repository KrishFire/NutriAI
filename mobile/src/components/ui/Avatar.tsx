import React from 'react';
import { Image, View, Text } from 'react-native';

interface AvatarProps {
  source?: { uri: string } | number;
  name?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  source,
  name,
  size = 'md',
  className = '',
}) => {
  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return { width: 32, height: 32, fontSize: 12 };
      case 'md':
        return { width: 40, height: 40, fontSize: 16 };
      case 'lg':
        return { width: 48, height: 48, fontSize: 20 };
      case 'xl':
        return { width: 64, height: 64, fontSize: 24 };
      default:
        return { width: 40, height: 40, fontSize: 16 };
    }
  };

  const { width, height, fontSize } = getSizeStyles();

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getBackgroundColor = (name: string) => {
    // Generate a consistent color based on the name
    const colors = [
      '#EF4444', // red
      '#F59E0B', // amber
      '#10B981', // emerald
      '#3B82F6', // blue
      '#8B5CF6', // violet
      '#EC4899', // pink
      '#14B8A6', // teal
      '#6366F1', // indigo
    ];

    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  if (source) {
    return (
      <View
        className={`rounded-full overflow-hidden ${className}`}
        style={{ width, height }}
      >
        <Image source={source} style={{ width, height }} resizeMode="cover" />
      </View>
    );
  }

  if (name) {
    return (
      <View
        className={`rounded-full items-center justify-center ${className}`}
        style={{
          width,
          height,
          backgroundColor: getBackgroundColor(name),
        }}
      >
        <Text className="font-semibold text-white" style={{ fontSize }}>
          {getInitials(name)}
        </Text>
      </View>
    );
  }

  // Default placeholder
  return (
    <View
      className={`rounded-full bg-gray-300 dark:bg-gray-600 ${className}`}
      style={{ width, height }}
    />
  );
};
