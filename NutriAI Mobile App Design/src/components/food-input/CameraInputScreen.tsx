import React, { useEffect, useState, useRef } from 'react';
import { ArrowLeftIcon, CameraIcon, ImageIcon } from 'lucide-react';
import { Button } from '../ui/Button';
import { PageTransition } from '../ui/PageTransition';
import { motion } from 'framer-motion';
interface CameraInputScreenProps {
  onBack: () => void;
  onCapture: (data: any) => void;
}
export const CameraInputScreen: React.FC<CameraInputScreenProps> = ({
  onBack,
  onCapture
}) => {
  const [isCapturing, setIsCapturing] = useState(false);
  const [isCaptured, setIsCaptured] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const startCamera = async () => {
    try {
      setIsCapturing(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment'
        },
        audio: false
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      setIsCapturing(false);
    }
  };
  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = canvas.toDataURL('image/jpeg');
        setCapturedImage(imageData);
        setIsCaptured(true);
        // Stop the camera stream
        const stream = video.srcObject as MediaStream;
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
        }
      }
    }
  };
  const retakePhoto = () => {
    setCapturedImage(null);
    setIsCaptured(false);
    startCamera();
  };
  const handleUploadImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = event => {
        setCapturedImage(event.target?.result as string);
        setIsCaptured(true);
      };
      reader.readAsDataURL(file);
    }
  };
  const handleContinue = () => {
    if (capturedImage) {
      onCapture({
        imageData: capturedImage
      });
    }
  };
  // Start camera when component mounts
  useEffect(() => {
    startCamera();
    // Cleanup function to stop camera when component unmounts
    return () => {
      if (videoRef.current) {
        const stream = videoRef.current.srcObject as MediaStream;
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
        }
      }
    };
  }, []);
  return <PageTransition>
      <div className="flex flex-col min-h-screen bg-black">
        <div className="px-4 pt-12 pb-4 flex items-center">
          <motion.button className="w-10 h-10 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center mr-4" onClick={onBack} whileHover={{
          scale: 1.05
        }} whileTap={{
          scale: 0.95
        }}>
            <ArrowLeftIcon size={20} className="text-white" />
          </motion.button>
          <h1 className="text-xl font-bold text-white">Take a Photo</h1>
        </div>
        <div className="flex-1 flex flex-col">
          {/* Camera Viewfinder / Captured Image */}
          <div className="relative flex-1 flex items-center justify-center bg-black overflow-hidden">
            {!isCaptured ? <>
                <motion.div className="absolute inset-0 flex items-center justify-center" initial={{
              opacity: 0
            }} animate={{
              opacity: 1
            }} transition={{
              duration: 0.5
            }}>
                  <video ref={videoRef} autoPlay playsInline className="min-w-full min-h-full object-cover" />
                </motion.div>
                {/* Overlay with targeting frame */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-72 h-72 border-2 border-white/50 rounded-lg"></div>
                </div>
                <div className="absolute top-4 right-4">
                  <motion.button className="w-10 h-10 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center" whileHover={{
                scale: 1.05
              }} whileTap={{
                scale: 0.95
              }}>
                    <div size={20} className="text-white" />
                  </motion.button>
                </div>
                <p className="absolute bottom-20 left-0 right-0 text-center text-white text-sm">
                  Position your food in the frame
                </p>
              </> : <motion.div className="w-full h-full" initial={{
            opacity: 0
          }} animate={{
            opacity: 1
          }} transition={{
            duration: 0.5
          }}>
                {capturedImage && <img src={capturedImage} alt="Captured food" className="w-full h-full object-contain" />}
              </motion.div>}
            {/* Hidden canvas for capturing images */}
            <canvas ref={canvasRef} className="hidden" />
          </div>
          {/* Bottom Controls */}
          <div className="bg-black p-6">
            {!isCaptured ? <div className="flex items-center justify-around">
                <label className="flex flex-col items-center cursor-pointer">
                  <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mb-2">
                    <ImageIcon size={24} className="text-white" />
                  </div>
                  <span className="text-xs text-white">Gallery</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleUploadImage} />
                </label>
                <motion.button className="w-16 h-16 rounded-full border-4 border-white flex items-center justify-center" onClick={captureImage} whileHover={{
              scale: 1.05
            }} whileTap={{
              scale: 0.9
            }}>
                  <div className="w-12 h-12 rounded-full bg-white"></div>
                </motion.button>
                <div className="w-12 h-12 opacity-0">
                  {/* Placeholder for layout balance */}
                </div>
              </div> : <div className="flex space-x-4">
                <Button onClick={retakePhoto} variant="secondary" fullWidth>
                  Retake
                </Button>
                <Button onClick={handleContinue} variant="primary" fullWidth>
                  Continue
                </Button>
              </div>}
          </div>
        </div>
      </div>
    </PageTransition>;
};