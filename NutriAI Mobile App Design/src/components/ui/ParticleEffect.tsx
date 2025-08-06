import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  velocity: {
    x: number;
    y: number;
  };
  opacity: number;
  rotation: number;
}
interface ParticleEffectProps {
  type?: 'confetti' | 'sparkle' | 'achievement';
  intensity?: 'low' | 'medium' | 'high';
  duration?: number;
  autoPlay?: boolean;
  colors?: string[];
  className?: string;
}
export const ParticleEffect: React.FC<ParticleEffectProps> = ({
  type = 'confetti',
  intensity = 'medium',
  duration = 2,
  autoPlay = true,
  colors = ['#320DFF', '#FF4D4D', '#FFD60A', '#4CAF50', '#FF9800'],
  className = ''
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number>(0);
  const isActiveRef = useRef<boolean>(false);
  // Number of particles based on intensity
  const particleCount = {
    low: 20,
    medium: 50,
    high: 100
  }[intensity];
  // Initialize particles
  const initParticles = () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const particles: Particle[] = [];
    for (let i = 0; i < particleCount; i++) {
      const size = Math.random() * 10 + 5;
      particles.push({
        id: i,
        x: canvas.width / 2,
        y: canvas.height / 2,
        size,
        color: colors[Math.floor(Math.random() * colors.length)],
        velocity: {
          x: (Math.random() - 0.5) * 8,
          y: (Math.random() - 0.5) * 8 - 3
        },
        opacity: 1,
        rotation: Math.random() * 360
      });
    }
    particlesRef.current = particles;
  };
  // Animation loop
  const animate = () => {
    if (!canvasRef.current || !isActiveRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let stillActive = false;
    particlesRef.current.forEach(particle => {
      // Update position
      particle.x += particle.velocity.x;
      particle.y += particle.velocity.y;
      // Apply gravity for confetti
      if (type === 'confetti') {
        particle.velocity.y += 0.1;
      }
      // Fade out
      particle.opacity -= 0.005;
      // Rotate confetti
      if (type === 'confetti') {
        particle.rotation += particle.velocity.x * 0.5;
      }
      // Draw particle
      if (particle.opacity > 0) {
        stillActive = true;
        ctx.save();
        ctx.globalAlpha = particle.opacity;
        ctx.translate(particle.x, particle.y);
        ctx.rotate(particle.rotation * Math.PI / 180);
        if (type === 'confetti') {
          ctx.fillStyle = particle.color;
          ctx.fillRect(-particle.size / 2, -particle.size / 4, particle.size, particle.size / 2);
        } else if (type === 'sparkle') {
          ctx.fillStyle = particle.color;
          ctx.beginPath();
          for (let i = 0; i < 5; i++) {
            const angle = i * Math.PI * 2 / 5;
            const innerRadius = particle.size / 4;
            const outerRadius = particle.size / 2;
            const x1 = Math.cos(angle) * outerRadius;
            const y1 = Math.sin(angle) * outerRadius;
            const x2 = Math.cos(angle + Math.PI / 5) * innerRadius;
            const y2 = Math.sin(angle + Math.PI / 5) * innerRadius;
            if (i === 0) {
              ctx.moveTo(x1, y1);
            } else {
              ctx.lineTo(x1, y1);
            }
            ctx.lineTo(x2, y2);
          }
          ctx.closePath();
          ctx.fill();
        } else if (type === 'achievement') {
          // Draw a trophy or medal shape
          ctx.fillStyle = particle.color;
          ctx.beginPath();
          ctx.arc(0, 0, particle.size / 2, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#FFFFFF';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(0, 0, particle.size / 3, 0, Math.PI * 2);
          ctx.stroke();
        }
        ctx.restore();
      }
    });
    if (stillActive) {
      animationRef.current = requestAnimationFrame(animate);
    } else {
      isActiveRef.current = false;
    }
  };
  // Play animation
  const play = () => {
    if (isActiveRef.current) return;
    isActiveRef.current = true;
    initParticles();
    animationRef.current = requestAnimationFrame(animate);
    // Auto-stop after duration
    setTimeout(() => {
      isActiveRef.current = false;
    }, duration * 1000);
  };
  // Setup canvas
  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    if (autoPlay) {
      play();
    }
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationRef.current);
    };
  }, []);
  return <motion.canvas ref={canvasRef} className={`absolute inset-0 pointer-events-none ${className}`} initial={{
    opacity: 0
  }} animate={{
    opacity: 1
  }} exit={{
    opacity: 0
  }} transition={{
    duration: 0.3
  }} />;
};