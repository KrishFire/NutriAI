import React from 'react';
import { motion } from 'framer-motion';
interface ProgressRingProps {
  percentage: number;
  color: string;
  size: number;
  strokeWidth: number;
  children?: React.ReactNode;
  animate?: boolean;
  duration?: number;
}
export const ProgressRing: React.FC<ProgressRingProps> = ({
  percentage,
  color,
  size,
  strokeWidth,
  children,
  animate = true,
  duration = 1.5
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const initialOffset = circumference;
  const animatedOffset = circumference - percentage / 100 * circumference;
  return <div className="relative" style={{
    width: size,
    height: size
  }}>
      {/* Background Circle */}
      <svg width={size} height={size} className="absolute top-0 left-0">
        <circle stroke="#E0E0E0" fill="transparent" strokeWidth={strokeWidth} r={radius} cx={size / 2} cy={size / 2} />
      </svg>
      {/* Progress Circle */}
      <svg width={size} height={size} className="absolute top-0 left-0 -rotate-90 transform">
        <motion.circle stroke={color} fill="transparent" strokeWidth={strokeWidth} strokeDasharray={circumference} initial={{
        strokeDashoffset: animate ? initialOffset : animatedOffset
      }} animate={{
        strokeDashoffset: animatedOffset
      }} transition={{
        duration: animate ? duration : 0,
        ease: [0.34, 1.56, 0.64, 1] // Custom spring-like easing
      }} strokeLinecap="round" r={radius} cx={size / 2} cy={size / 2} />
      </svg>
      {/* Center Content */}
      {children && <div className="absolute inset-0 flex items-center justify-center">
          {children}
        </div>}
    </div>;
};