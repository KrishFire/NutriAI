import React, { useEffect, useState } from 'react';
import { motion, useAnimation } from 'framer-motion';
interface KineticTypographyProps {
  text: string;
  className?: string;
  effect?: 'bounce' | 'wave' | 'stagger' | 'shake';
  duration?: number;
  delay?: number;
  repeat?: number | boolean;
}
export const KineticTypography: React.FC<KineticTypographyProps> = ({
  text,
  className = '',
  effect = 'stagger',
  duration = 0.5,
  delay = 0,
  repeat = false
}) => {
  const [characters, setCharacters] = useState<string[]>([]);
  const controls = useAnimation();
  useEffect(() => {
    setCharacters(text.split(''));
  }, [text]);
  useEffect(() => {
    const startAnimation = async () => {
      await new Promise(resolve => setTimeout(resolve, delay * 1000));
      if (effect === 'stagger') {
        await controls.start(i => ({
          opacity: 1,
          y: 0,
          transition: {
            delay: i * 0.05,
            duration
          }
        }));
      } else {
        await controls.start('animate');
      }
      if (repeat) {
        const repeatCount = typeof repeat === 'number' ? repeat : Infinity;
        let count = 0;
        while (count < repeatCount) {
          await new Promise(resolve => setTimeout(resolve, 2000));
          if (effect === 'stagger') {
            await controls.start(i => ({
              opacity: 0,
              y: 10,
              transition: {
                duration: 0.2
              }
            }));
            await controls.start(i => ({
              opacity: 1,
              y: 0,
              transition: {
                delay: i * 0.05,
                duration
              }
            }));
          } else {
            await controls.start('initial');
            await controls.start('animate');
          }
          count++;
        }
      }
    };
    startAnimation();
  }, [controls, effect, duration, delay, repeat]);
  // Define animation variants for different effects
  const getVariants = () => {
    switch (effect) {
      case 'bounce':
        return {
          initial: {
            y: 0
          },
          animate: {
            y: [0, -15, 0],
            transition: {
              times: [0, 0.5, 1],
              duration,
              ease: 'easeInOut'
            }
          }
        };
      case 'wave':
        return {
          initial: {
            y: 0
          },
          animate: (i: number) => ({
            y: [0, -10, 0],
            transition: {
              times: [0, 0.5, 1],
              delay: i * 0.05,
              duration,
              ease: 'easeInOut'
            }
          })
        };
      case 'shake':
        return {
          initial: {
            x: 0
          },
          animate: {
            x: [0, -5, 5, -5, 5, 0],
            transition: {
              times: [0, 0.2, 0.4, 0.6, 0.8, 1],
              duration,
              ease: 'easeInOut'
            }
          }
        };
      default:
        return {
          initial: {
            opacity: 0,
            y: 10
          },
          animate: {
            opacity: 1,
            y: 0
          }
        };
    }
  };
  const variants = getVariants();
  return <span className={`inline-flex ${className}`}>
      {characters.map((char, index) => <motion.span key={`${index}-${char}`} custom={index} initial={effect === 'stagger' ? {
      opacity: 0,
      y: 10
    } : 'initial'} animate={controls} variants={variants} style={{
      display: 'inline-block',
      whiteSpace: 'pre'
    }}>
          {char}
        </motion.span>)}
    </span>;
};