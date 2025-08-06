import React, { useEffect, useState } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';
interface AnimatedNumberProps {
  value: number;
  duration?: number;
  formatValue?: (value: number) => string;
  className?: string;
}
export const AnimatedNumber: React.FC<AnimatedNumberProps> = ({
  value,
  duration = 1.5,
  formatValue = val => Math.round(val).toString(),
  className = ''
}) => {
  // Use spring physics for natural animation
  const springValue = useSpring(0, {
    stiffness: 100,
    damping: 30,
    duration
  });
  // Transform the animated value to formatted text
  const displayValue = useTransform(springValue, current => formatValue(current));
  // Update the spring value when the prop changes
  useEffect(() => {
    springValue.set(value);
  }, [value, springValue]);
  return <motion.span className={className} style={{
    display: 'inline-block'
  }} initial={{
    scale: 0.8,
    opacity: 0
  }} animate={{
    scale: 1,
    opacity: 1
  }} transition={{
    type: 'spring',
    stiffness: 500,
    damping: 30
  }}>
      {displayValue}
    </motion.span>;
};