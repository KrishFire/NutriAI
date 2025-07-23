import React, { useEffect, useState } from 'react';
import { View, ViewStyle } from 'react-native';
import { MotiView } from 'moti';
import { Easing } from 'react-native-reanimated';

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  delay: number;
  duration: number;
}

interface ParticleEffectProps {
  type?: 'confetti' | 'sparkle' | 'achievement';
  intensity?: 'low' | 'medium' | 'high';
  duration?: number;
  autoPlay?: boolean;
  colors?: string[];
  className?: string;
  style?: ViewStyle;
}

export const ParticleEffect: React.FC<ParticleEffectProps> = ({
  type = 'confetti',
  intensity = 'medium',
  duration = 2,
  autoPlay = true,
  colors = ['#320DFF', '#FF4D4D', '#FFD60A', '#4CAF50', '#FF9800'],
  className = '',
  style,
}) => {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [isActive, setIsActive] = useState(autoPlay);

  // Number of particles based on intensity
  const particleCount = {
    low: 10,
    medium: 25,
    high: 50,
  }[intensity];

  // Initialize particles
  useEffect(() => {
    if (!isActive) return;

    const newParticles: Particle[] = [];
    for (let i = 0; i < particleCount; i++) {
      newParticles.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 8 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        delay: Math.random() * 0.5,
        duration: duration * 1000 + Math.random() * 1000,
      });
    }
    setParticles(newParticles);

    // Auto-stop after duration
    const timer = setTimeout(() => {
      setIsActive(false);
    }, duration * 1000 + 1000);

    return () => clearTimeout(timer);
  }, [isActive, particleCount, colors, duration]);

  if (!isActive || particles.length === 0) return null;

  const renderParticle = (particle: Particle) => {
    switch (type) {
      case 'confetti':
        return (
          <MotiView
            key={particle.id}
            from={{
              translateX: 0,
              translateY: 0,
              rotate: '0deg',
              opacity: 1,
              scale: 1,
            }}
            animate={{
              translateX: (Math.random() - 0.5) * 200,
              translateY: 200 + Math.random() * 100,
              rotate: `${Math.random() * 720}deg`,
              opacity: 0,
              scale: Math.random() * 0.5 + 0.5,
            }}
            transition={{
              type: 'timing',
              duration: particle.duration,
              delay: particle.delay,
              easing: Easing.out(Easing.cubic),
            }}
            style={{
              position: 'absolute',
              left: `${particle.x}%`,
              top: `${particle.y}%`,
            }}
          >
            <View
              className="rounded-sm"
              style={{
                width: particle.size,
                height: particle.size / 2,
                backgroundColor: particle.color,
              }}
            />
          </MotiView>
        );

      case 'sparkle':
        return (
          <MotiView
            key={particle.id}
            from={{
              scale: 0,
              opacity: 1,
              rotate: '0deg',
            }}
            animate={{
              scale: [0, 1, 0],
              opacity: [1, 1, 0],
              rotate: '180deg',
            }}
            transition={{
              type: 'timing',
              duration: particle.duration,
              delay: particle.delay,
              scale: {
                type: 'timing',
                duration: particle.duration,
                easing: Easing.out(Easing.cubic),
              },
            }}
            style={{
              position: 'absolute',
              left: `${particle.x}%`,
              top: `${particle.y}%`,
            }}
          >
            <View
              style={{
                width: particle.size,
                height: particle.size,
              }}
            >
              {/* Star shape using 4 rotated rectangles */}
              <View
                className="absolute"
                style={{
                  width: particle.size,
                  height: 2,
                  backgroundColor: particle.color,
                  top: particle.size / 2 - 1,
                }}
              />
              <View
                className="absolute"
                style={{
                  width: 2,
                  height: particle.size,
                  backgroundColor: particle.color,
                  left: particle.size / 2 - 1,
                }}
              />
              <View
                className="absolute"
                style={{
                  width: particle.size * 0.7,
                  height: 2,
                  backgroundColor: particle.color,
                  top: particle.size / 2 - 1,
                  left: particle.size * 0.15,
                  transform: [{ rotate: '45deg' }],
                }}
              />
              <View
                className="absolute"
                style={{
                  width: particle.size * 0.7,
                  height: 2,
                  backgroundColor: particle.color,
                  top: particle.size / 2 - 1,
                  left: particle.size * 0.15,
                  transform: [{ rotate: '-45deg' }],
                }}
              />
            </View>
          </MotiView>
        );

      case 'achievement':
        return (
          <MotiView
            key={particle.id}
            from={{
              scale: 0,
              opacity: 0,
              translateY: 0,
            }}
            animate={{
              scale: [0, 1.2, 1],
              opacity: [0, 1, 0],
              translateY: -50,
            }}
            transition={{
              type: 'timing',
              duration: particle.duration,
              delay: particle.delay,
              scale: {
                type: 'spring',
                damping: 8,
              },
            }}
            style={{
              position: 'absolute',
              left: `${particle.x}%`,
              top: `${particle.y}%`,
            }}
          >
            <View
              className="rounded-full"
              style={{
                width: particle.size,
                height: particle.size,
                backgroundColor: particle.color,
                borderWidth: 2,
                borderColor: '#ffffff',
              }}
            />
          </MotiView>
        );

      default:
        return null;
    }
  };

  return (
    <View
      className={`absolute inset-0 ${className}`}
      style={[{ pointerEvents: 'none' }, style]}
    >
      {particles.map(renderParticle)}
    </View>
  );
};