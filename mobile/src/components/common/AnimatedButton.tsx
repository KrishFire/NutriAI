import React, { useState } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  TouchableOpacityProps,
} from 'react-native';
import { MotiView } from 'moti';

interface AnimatedButtonProps extends TouchableOpacityProps {
  onPress: () => void;
  style?: ViewStyle | ViewStyle[];
  textStyle?: TextStyle | TextStyle[];
  children: React.ReactNode;
  scaleValue?: number;
}

const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  onPress,
  style,
  textStyle,
  children,
  scaleValue = 0.95,
  disabled,
  ...props
}) => {
  const [isPressed, setIsPressed] = useState(false);

  return (
    <MotiView
      animate={{
        scale: isPressed ? scaleValue : 1,
      }}
      transition={{
        type: 'spring',
        damping: 15,
        stiffness: 400,
      }}
    >
      <TouchableOpacity
        onPress={onPress}
        onPressIn={() => setIsPressed(true)}
        onPressOut={() => setIsPressed(false)}
        style={style}
        activeOpacity={1}
        disabled={disabled}
        {...props}
      >
        {typeof children === 'string' ? (
          <Text style={textStyle}>{children}</Text>
        ) : (
          children
        )}
      </TouchableOpacity>
    </MotiView>
  );
};

export default AnimatedButton;
