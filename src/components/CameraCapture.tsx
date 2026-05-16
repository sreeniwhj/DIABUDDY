import React, { useRef, useState } from 'react';
import { Camera, Upload, RefreshCw, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CameraCaptureProps {
  onCapture: (base64: string) => void;
  isProcessing: boolean;
}

export const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture, isProcessing }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setIsCameraActive(true);
      setPreviewImage(null);
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert("Could not access camera. Please check permissions.");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsCameraActive(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        const dataUrl = canvasRef.current.toDataURL('image/jpeg');
        setPreviewImage(dataUrl);
        stopCamera();
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const confirmAnalysis = () => {
    if (previewImage) {
      // Remove data:image/jpeg;base64, prefix
      const base64 = previewImage.split(',')[1];
      onCapture(base64);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden border border-[#E5E5E1]">
      <div className="relative aspect-square bg-[#F5F5F0] flex items-center justify-center overflow-hidden">
        <AnimatePresence mode="wait">
          {!isCameraActive && !previewImage ? (
            <motion.div 
              key="prompt"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center p-8"
            >
              <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Camera className="w-10 h-10 text-emerald-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Analyze Your Meal</h3>
              <p className="text-gray-500 mb-8 max-w-xs mx-auto">
                Snap a photo or upload an image of your food for instant diabetic insights.
              </p>
              <div className="flex flex-col gap-3">
                <button
                  onClick={startCamera}
                  className="bg-emerald-600 text-white py-4 px-8 rounded-2xl font-semibold flex items-center justify-center gap-2 hover:bg-emerald-700 transition-colors"
                >
                  <Camera className="w-5 h-5" />
                  Take a Photo
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-white text-emerald-600 border-2 border-emerald-600 py-4 px-8 rounded-2xl font-semibold flex items-center justify-center gap-2 hover:bg-emerald-50 transition-colors"
                >
                  <Upload className="w-5 h-5" />
                  Upload Image
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileUpload} 
                  accept="image/*" 
                  className="hidden" 
                />
              </div>
            </motion.div>
          ) : isCameraActive ? (
            <motion.div 
              key="camera"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="relative w-full h-full"
            >
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-6 left-0 right-0 flex justify-center items-center gap-6">
                <button 
                  onClick={stopCamera}
                  className="p-4 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/30"
                >
                  <X className="w-6 h-6" />
                </button>
                <button 
                  onClick={capturePhoto}
                  className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-transform"
                >
                  <div className="w-14 h-14 border-2 border-emerald-600 rounded-full" />
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="preview"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="relative w-full h-full"
            >
              <img 
                src={previewImage!} 
                alt="Meal Preview" 
                className="w-full h-full object-cover" 
              />
              {!isProcessing && (
                <div className="absolute top-4 right-4 flex gap-2">
                  <button 
                    onClick={() => setPreviewImage(null)}
                    className="p-2 bg-white/80 backdrop-blur-md rounded-full shadow-md text-gray-700 hover:bg-white"
                  >
                    <RefreshCw className="w-5 h-5" />
                  </button>
                </div>
              )}
              <div className="absolute bottom-6 left-0 right-0 flex justify-center px-6">
                <button
                  onClick={confirmAnalysis}
                  disabled={isProcessing}
                  className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-bold shadow-lg flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    "Analyze Meal"
                  )}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};
