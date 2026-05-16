import React, { useRef, useState } from 'react';
import { Camera, Upload, RefreshCw, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CameraCaptureProps {
  onCapture: (base64: string) => void;
  isProcessing: boolean;
}

export const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture, isProcessing }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const maxDim = 1024;

          if (width > height) {
            if (width > maxDim) {
              height *= maxDim / width;
              width = maxDim;
            }
          } else {
            if (height > maxDim) {
              width *= maxDim / height;
              height = maxDim;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          const resizedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
          setPreviewImage(resizedDataUrl);
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const confirmAnalysis = () => {
    if (previewImage) {
      const base64 = previewImage.split(',')[1];
      onCapture(base64);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden border border-[#E5E5E1]">
      <div className="relative aspect-square bg-[#F5F5F0] flex items-center justify-center overflow-hidden">
        <AnimatePresence mode="wait">
          {!previewImage ? (
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
                  onClick={() => cameraInputRef.current?.click()}
                  className="bg-emerald-600 text-white py-4 px-8 rounded-2xl font-semibold flex items-center justify-center gap-2 hover:bg-emerald-700 transition-colors shadow-lg active:scale-95 transition-transform"
                >
                  <Camera className="w-5 h-5" />
                  Take a Photo
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-white text-emerald-600 border-2 border-emerald-600 py-4 px-8 rounded-2xl font-semibold flex items-center justify-center gap-2 hover:bg-emerald-50 transition-colors active:scale-95 transition-transform"
                >
                  <Upload className="w-5 h-5" />
                  Upload Image
                </button>
                
                {/* Hidden native inputs */}
                <input 
                  type="file" 
                  ref={cameraInputRef} 
                  onChange={handleFileUpload} 
                  accept="image/*" 
                  capture="environment"
                  className="hidden" 
                />
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileUpload} 
                  accept="image/*" 
                  className="hidden" 
                />
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
                    className="p-2 bg-white/80 backdrop-blur-md rounded-full shadow-md text-gray-700 hover:bg-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              )}
              <div className="absolute bottom-6 left-0 right-0 flex justify-center px-6">
                <button
                  onClick={confirmAnalysis}
                  disabled={isProcessing}
                  className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-bold shadow-lg flex items-center justify-center gap-2 disabled:opacity-70 active:scale-95 transition-transform"
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
    </div>
  );
};
