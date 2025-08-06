import React, { useEffect, useState, useRef } from 'react';
import { ArrowLeftIcon, ScanLineIcon, ImageIcon } from 'lucide-react';
import { Button } from '../ui/Button';
import { PageTransition } from '../ui/PageTransition';
import { motion } from 'framer-motion';
interface BarcodeInputScreenProps {
  onBack: () => void;
  onCapture: (data: any) => void;
}
export const BarcodeInputScreen: React.FC<BarcodeInputScreenProps> = ({
  onBack,
  onCapture
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [scannedCode, setScannedCode] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const scannerLineRef = useRef<HTMLDivElement>(null);
  const startScanner = async () => {
    try {
      setIsScanning(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment'
        },
        audio: false
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      // Simulate barcode detection after a few seconds
      setTimeout(() => {
        const mockBarcode = '5901234123457';
        setScannedCode(mockBarcode);
        stopScanner();
      }, 3000);
    } catch (err) {
      console.error('Error accessing camera:', err);
      setIsScanning(false);
    }
  };
  const stopScanner = () => {
    setIsScanning(false);
    if (videoRef.current) {
      const stream = videoRef.current.srcObject as MediaStream;
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    }
  };
  const handleContinue = () => {
    if (scannedCode) {
      onCapture({
        barcode: scannedCode
      });
    }
  };
  const handleRetry = () => {
    setScannedCode(null);
    startScanner();
  };
  // Animate scanner line
  useEffect(() => {
    let animationId: number;
    if (isScanning && scannerLineRef.current) {
      let direction = 1;
      let position = 0;
      const animate = () => {
        if (scannerLineRef.current) {
          position += direction * 2;
          if (position >= 200) {
            direction = -1;
          } else if (position <= 0) {
            direction = 1;
          }
          scannerLineRef.current.style.transform = `translateY(${position}px)`;
          animationId = requestAnimationFrame(animate);
        }
      };
      animationId = requestAnimationFrame(animate);
    }
    return () => {
      if (animationId) cancelAnimationFrame(animationId);
    };
  }, [isScanning]);
  // Start scanner when component mounts
  useEffect(() => {
    startScanner();
    return () => {
      stopScanner();
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
          <h1 className="text-xl font-bold text-white">Scan Barcode</h1>
        </div>
        <div className="flex-1 flex flex-col">
          {/* Scanner Viewfinder */}
          <div className="relative flex-1 flex items-center justify-center bg-black overflow-hidden">
            {isScanning && <>
                <motion.div className="absolute inset-0 flex items-center justify-center" initial={{
              opacity: 0
            }} animate={{
              opacity: 1
            }} transition={{
              duration: 0.5
            }}>
                  <video ref={videoRef} autoPlay playsInline className="min-w-full min-h-full object-cover" />
                </motion.div>
                {/* Overlay with barcode scanner frame */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative w-72 h-72">
                    {/* Scanner window */}
                    <div className="absolute inset-0 border-2 border-white/50 rounded-lg overflow-hidden">
                      {/* Scanning line */}
                      <div ref={scannerLineRef} className="absolute left-0 right-0 h-2 bg-[#320DFF]/70" style={{
                    boxShadow: '0 0 10px rgba(50, 13, 255, 0.7)'
                  }}></div>
                    </div>
                    {/* Corner marks */}
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-white rounded-tl-lg"></div>
                    <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-white rounded-tr-lg"></div>
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-white rounded-bl-lg"></div>
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-white rounded-br-lg"></div>
                  </div>
                </div>
                <p className="absolute bottom-20 left-0 right-0 text-center text-white text-sm">
                  Position barcode within the frame
                </p>
              </>}
            {scannedCode && <motion.div className="w-full h-full flex flex-col items-center justify-center p-6" initial={{
            opacity: 0
          }} animate={{
            opacity: 1
          }} transition={{
            duration: 0.5
          }}>
                <div className="w-20 h-20 rounded-full bg-[#320DFF]/10 flex items-center justify-center mb-4">
                  <ScanLineIcon size={40} className="text-[#320DFF]" />
                </div>
                <h2 className="text-xl font-bold text-white mb-2">
                  Barcode Detected
                </h2>
                <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-lg mb-4">
                  <p className="text-white font-mono">{scannedCode}</p>
                </div>
                <p className="text-gray-300 text-center">
                  The product will be identified and analyzed in the next step
                </p>
              </motion.div>}
          </div>
          {/* Bottom Controls */}
          <div className="bg-black p-6">
            {scannedCode ? <div className="flex space-x-4">
                <Button onClick={handleRetry} variant="secondary" fullWidth>
                  Scan Again
                </Button>
                <Button onClick={handleContinue} variant="primary" fullWidth>
                  Continue
                </Button>
              </div> : <div className="flex items-center justify-around">
                <label className="flex flex-col items-center cursor-pointer">
                  <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mb-2">
                    <ImageIcon size={24} className="text-white" />
                  </div>
                  <span className="text-xs text-white">Upload Image</span>
                  <input type="file" accept="image/*" className="hidden" />
                </label>
                <div className="w-16 h-16 rounded-full border-4 border-white/50 flex items-center justify-center">
                  <ScanLineIcon size={30} className="text-white" />
                </div>
                <div className="w-12 opacity-0">
                  {/* Placeholder for layout balance */}
                </div>
              </div>}
          </div>
        </div>
      </div>
    </PageTransition>;
};