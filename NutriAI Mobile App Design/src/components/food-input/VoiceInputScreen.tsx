import React, { useEffect, useState } from 'react';
import { ArrowLeftIcon, MicIcon, StopCircleIcon } from 'lucide-react';
import { Button } from '../ui/Button';
import { PageTransition } from '../ui/PageTransition';
import { motion } from 'framer-motion';
interface VoiceInputScreenProps {
  onBack: () => void;
  onCapture: (data: any) => void;
}
export const VoiceInputScreen: React.FC<VoiceInputScreenProps> = ({
  onBack,
  onCapture
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingComplete, setRecordingComplete] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [recordingTime, setRecordingTime] = useState(0);
  const [waveformValues, setWaveformValues] = useState<number[]>(Array(30).fill(5));
  // Start recording
  const startRecording = () => {
    setIsRecording(true);
    setRecordingTime(0);
    setTranscript('');
    // Simulate speech recognition
    setTimeout(() => {
      setTranscript('I had a chicken salad with avocado, tomatoes, and olive oil dressing');
    }, 2000);
  };
  // Stop recording
  const stopRecording = () => {
    setIsRecording(false);
    setRecordingComplete(true);
  };
  // Handle continue
  const handleContinue = () => {
    onCapture({
      transcript
    });
  };
  // Handle retry
  const handleRetry = () => {
    setRecordingComplete(false);
    setTranscript('');
    startRecording();
  };
  // Update recording time
  useEffect(() => {
    let timerId: NodeJS.Timeout;
    if (isRecording) {
      timerId = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (timerId) clearInterval(timerId);
    };
  }, [isRecording]);
  // Simulate waveform animation
  useEffect(() => {
    let animationId: NodeJS.Timeout;
    if (isRecording) {
      animationId = setInterval(() => {
        setWaveformValues(prev => prev.map(() => isRecording ? Math.floor(Math.random() * 30) + 5 : 5));
      }, 100);
    } else {
      setWaveformValues(Array(30).fill(5));
    }
    return () => {
      if (animationId) clearInterval(animationId);
    };
  }, [isRecording]);
  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  return <PageTransition>
      <div className="flex flex-col min-h-screen bg-white">
        <div className="px-4 pt-12 pb-4 flex items-center">
          <motion.button className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mr-4" onClick={onBack} whileHover={{
          scale: 1.05
        }} whileTap={{
          scale: 0.95
        }}>
            <ArrowLeftIcon size={20} />
          </motion.button>
          <h1 className="text-xl font-bold">Voice Input</h1>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center p-6">
          {/* Recording Visualization */}
          <motion.div className="w-40 h-40 rounded-full bg-[#320DFF]/10 flex items-center justify-center mb-8" animate={{
          scale: isRecording ? [1, 1.05, 1] : 1,
          backgroundColor: isRecording ? ['rgba(50, 13, 255, 0.1)', 'rgba(50, 13, 255, 0.2)', 'rgba(50, 13, 255, 0.1)'] : 'rgba(50, 13, 255, 0.1)'
        }} transition={{
          duration: 1.5,
          repeat: isRecording ? Infinity : 0,
          ease: 'easeInOut'
        }}>
            {isRecording ? <StopCircleIcon size={60} className="text-[#320DFF] cursor-pointer" onClick={stopRecording} /> : <MicIcon size={60} className="text-[#320DFF] cursor-pointer" onClick={startRecording} />}
          </motion.div>
          {/* Waveform Visualization */}
          {(isRecording || recordingComplete) && <div className="flex items-center justify-center space-x-1 mb-8 h-20">
              {waveformValues.map((value, index) => <motion.div key={index} className="w-1.5 bg-[#320DFF]" style={{
            height: `${value}px`,
            borderRadius: '2px'
          }} animate={{
            height: `${value}px`
          }} transition={{
            duration: 0.1
          }} />)}
            </div>}
          {/* Status Text */}
          {!isRecording && !recordingComplete && <motion.div className="text-center mb-8" initial={{
          opacity: 0
        }} animate={{
          opacity: 1
        }} transition={{
          delay: 0.3
        }}>
              <h2 className="text-xl font-semibold mb-2">Describe Your Meal</h2>
              <p className="text-gray-600">
                Tap the microphone and tell us what you ate
              </p>
            </motion.div>}
          {isRecording && <div className="text-center mb-8">
              <p className="text-[#320DFF] font-medium mb-2">Listening...</p>
              <p className="text-gray-500">{formatTime(recordingTime)}</p>
            </div>}
          {/* Transcript */}
          {transcript && <motion.div className="w-full bg-gray-50 p-4 rounded-xl mb-8" initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.3
        }}>
              <p className="text-gray-900">{transcript}</p>
            </motion.div>}
          {/* Action Buttons */}
          {recordingComplete && <motion.div className="w-full flex space-x-4" initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.3,
          delay: 0.2
        }}>
              <Button onClick={handleRetry} variant="secondary" fullWidth>
                Retry
              </Button>
              <Button onClick={handleContinue} variant="primary" fullWidth>
                Continue
              </Button>
            </motion.div>}
          {!isRecording && !recordingComplete && <motion.p className="text-sm text-gray-500 text-center" initial={{
          opacity: 0
        }} animate={{
          opacity: 1
        }} transition={{
          delay: 0.5
        }}>
              Try saying: "I had a chicken salad with avocado"
            </motion.p>}
        </div>
      </div>
    </PageTransition>;
};