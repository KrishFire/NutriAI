import React, { useEffect, useRef } from 'react';
import { ArrowLeftIcon, TrophyIcon } from 'lucide-react';
import { Button } from '../ui/Button';
import { motion } from 'framer-motion';
import { hapticFeedback } from '../../utils/haptics';
interface WeightTransitionScreenProps {
  onBack: () => void;
  onNext: () => void;
  goal: string;
  progress: number;
}
export const WeightTransitionScreen: React.FC<WeightTransitionScreenProps> = ({
  onBack,
  onNext,
  goal,
  progress
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    // Set canvas dimensions
    canvas.width = canvas.offsetWidth * 2;
    canvas.height = canvas.offsetHeight * 2;
    ctx.scale(2, 2); // For retina displays
    // Animation variables
    let animationFrame: number;
    const animDuration = 2.5; // seconds
    const startTime = performance.now();
    const draw = (currentTime: number) => {
      if (!ctx) return;
      // Calculate animation progress
      const elapsed = currentTime - startTime;
      const linearProgress = Math.min(1, elapsed / (animDuration * 1000));
      // Use an easing function to make the animation more fluid
      const animProgress = easeInOutQuart(linearProgress);
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const width = canvas.offsetWidth;
      const height = canvas.offsetHeight;
      // Fill background with light blue color
      ctx.fillStyle = 'rgba(240, 245, 255, 0.5)';
      ctx.fillRect(0, 0, width, height);
      // Draw horizontal guide lines (dotted)
      ctx.strokeStyle = '#E5E7EB';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      // Draw 3 horizontal guide lines
      const guideLinePositions = [height * 0.3, height * 0.5, height * 0.7];
      guideLinePositions.forEach(y => {
        ctx.beginPath();
        ctx.moveTo(50, y);
        ctx.lineTo(width - 50, y);
        ctx.stroke();
      });
      ctx.setLineDash([]); // Reset line dash
      // Draw x-axis
      ctx.beginPath();
      ctx.moveTo(50, height - 50);
      ctx.lineTo(width - 50, height - 50);
      ctx.strokeStyle = '#333333';
      ctx.lineWidth = 2;
      ctx.stroke();
      // Define key points for the graph - following Cal AI's pattern
      // For 'gain': starts with minimal progress, then accelerates upward
      // For 'lose': starts with minimal progress, then accelerates downward
      const keyPoints = [{
        label: '3 Days',
        x: 50 + (width - 100) * 0.2,
        // For gain: start near bottom (higher y value), for lose: start near top (lower y value)
        yRatio: goal === 'gain' ? 0.7 : 0.3
      }, {
        label: '7 Days',
        x: 50 + (width - 100) * 0.45,
        // For gain: slight improvement, for lose: slight improvement
        yRatio: goal === 'gain' ? 0.65 : 0.35
      }, {
        label: '30 Days',
        x: width - 50,
        // For gain: significant improvement (lower y value), for lose: significant improvement (higher y value)
        yRatio: goal === 'gain' ? 0.25 : 0.75
      }];
      // Draw time labels
      ctx.fillStyle = '#333333';
      ctx.font = 'bold 12px Arial';
      ctx.textAlign = 'center';
      keyPoints.forEach(point => {
        ctx.fillText(point.label, point.x, height - 30);
      });
      // Calculate points for the curve
      const startPoint = {
        x: keyPoints[0].x,
        y: height * keyPoints[0].yRatio
      };
      const midPoint = {
        x: keyPoints[1].x,
        y: height * keyPoints[1].yRatio
      };
      const endPoint = {
        x: keyPoints[2].x,
        y: height * keyPoints[2].yRatio
      };
      // Create control points for a more natural curve with Cal AI pattern
      // First segment (3-7 days): flatter curve with minimal progress
      const control1 = {
        x: startPoint.x + (midPoint.x - startPoint.x) * 0.5,
        y: startPoint.y
      };
      const control2 = {
        x: midPoint.x - (midPoint.x - startPoint.x) * 0.3,
        y: midPoint.y
      };
      // Second segment (7-30 days): steeper curve with accelerated progress
      const control3 = {
        x: midPoint.x + (endPoint.x - midPoint.x) * 0.2,
        y: midPoint.y
      };
      const control4 = {
        x: endPoint.x - (endPoint.x - midPoint.x) * 0.6,
        y: endPoint.y
      };
      // Draw filled area under the curve
      ctx.beginPath();
      ctx.moveTo(startPoint.x, height - 50);
      // Calculate points along the curve for the animation
      const points = [];
      const numPoints = 100;
      for (let i = 0; i <= numPoints * animProgress; i++) {
        const t = i / numPoints;
        let x, y;
        if (t <= 0.5) {
          // First half of the curve (start to mid)
          const segmentT = t * 2;
          x = bezierPoint(startPoint.x, control1.x, control2.x, midPoint.x, segmentT);
          y = bezierPoint(startPoint.y, control1.y, control2.y, midPoint.y, segmentT);
        } else {
          // Second half of the curve (mid to end)
          const segmentT = (t - 0.5) * 2;
          x = bezierPoint(midPoint.x, control3.x, control4.x, endPoint.x, segmentT);
          y = bezierPoint(midPoint.y, control3.y, control4.y, endPoint.y, segmentT);
        }
        points.push({
          x,
          y
        });
      }
      // Draw filled area
      if (points.length > 0) {
        ctx.beginPath();
        ctx.moveTo(startPoint.x, height - 50);
        points.forEach(point => {
          ctx.lineTo(point.x, point.y);
        });
        ctx.lineTo(points[points.length - 1].x, height - 50);
        ctx.closePath();
        // Create gradient fill
        const gradient = ctx.createLinearGradient(0, 0, 0, height);
        gradient.addColorStop(0, 'rgba(50, 13, 255, 0.2)');
        gradient.addColorStop(1, 'rgba(240, 245, 255, 0)');
        ctx.fillStyle = gradient;
        ctx.fill();
      }
      // Draw the curve
      if (points.length > 0) {
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
          ctx.lineTo(points[i].x, points[i].y);
        }
        ctx.strokeStyle = '#320DFF';
        ctx.lineWidth = 3;
        ctx.stroke();
      }
      // Draw markers at key points
      const drawMarker = (x, y, isFilled = false) => {
        ctx.beginPath();
        ctx.arc(x, y, 8, 0, Math.PI * 2);
        ctx.fillStyle = isFilled ? '#320DFF' : '#FFFFFF';
        ctx.fill();
        ctx.strokeStyle = '#320DFF';
        ctx.lineWidth = 2;
        ctx.stroke();
        if (!isFilled) {
          ctx.beginPath();
          ctx.arc(x, y, 4, 0, Math.PI * 2);
          ctx.fillStyle = '#320DFF';
          ctx.fill();
        }
      };
      // Draw start marker
      drawMarker(startPoint.x, startPoint.y);
      // Draw mid marker if we've reached it
      if (animProgress >= 0.5) {
        drawMarker(midPoint.x, midPoint.y);
      }
      // Draw end marker with a simple filled circle (no trophy)
      if (animProgress === 1) {
        drawMarker(endPoint.x, endPoint.y, true);
      }
      // Draw current position marker
      if (points.length > 0 && animProgress < 1) {
        const currentPoint = points[points.length - 1];
        drawMarker(currentPoint.x, currentPoint.y);
      }
      // Continue animation if not complete
      if (linearProgress < 1) {
        animationFrame = requestAnimationFrame(draw);
      }
    };
    // Bezier curve calculation helper
    function bezierPoint(p0, p1, p2, p3, t) {
      const oneMinusT = 1 - t;
      return Math.pow(oneMinusT, 3) * p0 + 3 * Math.pow(oneMinusT, 2) * t * p1 + 3 * oneMinusT * Math.pow(t, 2) * p2 + Math.pow(t, 3) * p3;
    }
    // Easing function for smoother animation
    function easeInOutQuart(t) {
      return t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2;
    }
    // Start animation
    animationFrame = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(animationFrame);
    };
  }, [goal]);
  const handleContinue = () => {
    hapticFeedback.selection();
    onNext();
  };
  return <div className="flex flex-col min-h-screen bg-white p-6 font-sans">
      <div className="flex items-center mb-4">
        <motion.button className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center" onClick={onBack} whileHover={{
        scale: 1.05
      }} whileTap={{
        scale: 0.95
      }}>
          <ArrowLeftIcon size={20} />
        </motion.button>
      </div>

      {/* Progress bar */}
      <div className="w-full h-1 bg-gray-100 rounded-full mb-8">
        <div className="h-full bg-[#320DFF] rounded-full" style={{
        width: `${progress}%`
      }}></div>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-3">
          Your journey to success starts now
        </h1>
        <p className="text-gray-600 text-lg">
          See your transformation timeline below
        </p>
      </div>

      <div className="flex-1 flex flex-col items-center mb-12">
        <motion.div className="w-full h-60 mb-8 bg-[#f0f5ff] rounded-xl p-4 shadow-lg border border-gray-100" initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        duration: 0.5
      }}>
          <div className="text-lg font-medium text-gray-800 mb-2">
            Your transformation journey
          </div>
          <canvas ref={canvasRef} className="w-full h-full" style={{
          width: '100%',
          height: '100%'
        }} />
        </motion.div>

        <motion.div className="bg-gradient-to-r from-[#320DFF]/20 to-[#5D41FF]/20 p-5 rounded-2xl w-full" initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        duration: 0.5,
        delay: 0.2
      }}>
          <p className="text-center text-[#320DFF] font-medium">
            {goal === 'lose' ? 'The first week is about adapting, then your body accelerates into fat-burning mode!' : 'Initial progress may be subtle, but after the first week your muscle growth will accelerate!'}
          </p>
        </motion.div>
      </div>

      <div className="mt-auto">
        <Button onClick={handleContinue} variant="primary" fullWidth>
          Continue
        </Button>
      </div>
    </div>;
};