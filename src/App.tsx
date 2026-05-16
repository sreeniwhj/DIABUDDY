/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { CameraCapture } from './components/CameraCapture';
import { NutritionReport } from './components/NutritionReport';
import { SugarCoach } from './components/SugarCoach';
import { analyzeMealImage } from './services/geminiService';
import { ChefHat, ArrowLeft, Info, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type ViewMode = 'meal' | 'sugar';

export default function App() {
  const [viewMode, setViewMode] = useState<ViewMode>('meal');
  const [report, setReport] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCapture = async (base64: string) => {
    setIsProcessing(true);
    setError(null);
    try {
      const result = await analyzeMealImage(base64);
      if (result) {
        setReport(result);
      } else {
        setError("Could not analyze image. Please try again.");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsProcessing(false);
    }
  };

  const reset = () => {
    setReport(null);
    setError(null);
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-[#E5E5E1]">
        <div className="max-w-2xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
              <ChefHat className="text-white w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-emerald-900 leading-none">
              Prameha<span className="text-emerald-600">Nutri</span>
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            {report ? (
              <button 
                onClick={reset}
                className="text-gray-500 hover:text-gray-900 flex items-center gap-1 text-sm font-medium transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
            ) : (
              <div className="flex bg-[#F5F5F0] rounded-full p-1 border border-[#E5E5E1]">
                <button
                  onClick={() => setViewMode('meal')}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${viewMode === 'meal' ? 'bg-white shadow-sm text-emerald-700' : 'text-gray-400'}`}
                >
                  Meal
                </button>
                <button
                  onClick={() => setViewMode('sugar')}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${viewMode === 'sugar' ? 'bg-white shadow-sm text-blue-700' : 'text-gray-400'}`}
                >
                  Coach
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-8">
        <AnimatePresence mode="wait">
          {viewMode === 'meal' ? (
            <motion.div
              key="meal-view"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-10"
            >
              {!report ? (
                <>
                  <div className="space-y-4">
                    <h2 className="text-4xl font-serif font-bold leading-tight">
                      Understand your <br />
                      <span className="text-emerald-600 italic">meal's impact.</span>
                    </h2>
                    <p className="text-gray-500 text-lg leading-relaxed max-w-lg">
                      Snap a photo of your breakfast, lunch, or dinner. Our Indian-focused nutrition analyst will help you manage your blood sugar levels.
                    </p>
                  </div>

                  <CameraCapture onCapture={handleCapture} isProcessing={isProcessing} />

                  {error && (
                    <div className="bg-red-50 border border-red-100 p-4 rounded-2xl text-red-600 text-sm flex items-start gap-3">
                      <Info className="w-5 h-5 flex-shrink-0 mt-0.5" />
                      <p>{error}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-5 bg-white rounded-3xl border border-[#E5E5E1] flex flex-col gap-3">
                      <div className="w-10 h-10 bg-blue-50 rounded-2xl flex items-center justify-center">
                        <Info className="text-blue-500 w-5 h-5" />
                      </div>
                      <h4 className="font-bold text-sm uppercase tracking-wide">GI Mapping</h4>
                      <p className="text-xs text-gray-500">Estimates Glycemic Index based on Indian cooking methods.</p>
                    </div>
                    <div className="p-5 bg-white rounded-3xl border border-[#E5E5E1] flex flex-col gap-3">
                      <div className="w-10 h-10 bg-indigo-50 rounded-2xl flex items-center justify-center">
                        <ChefHat className="text-indigo-500 w-5 h-5" />
                      </div>
                      <h4 className="font-bold text-sm uppercase tracking-wide">Actionable</h4>
                      <p className="text-xs text-gray-500">Get specific swaps and portion tweaks for better control.</p>
                    </div>
                  </div>
                </>
              ) : (
                <NutritionReport report={report} />
              )}
            </motion.div>
          ) : (
            <motion.div
              key="sugar-view"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <SugarCoach />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="max-w-2xl mx-auto px-6 py-12 text-center text-gray-400 text-xs">
        <p>© 2026 Prameha Nutri & Coach. Designed for India.</p>
        <div className="flex justify-center gap-4 mt-2">
          <span className="flex items-center gap-1"><Info className="w-3 h-3" /> Information only</span>
          <span className="flex items-center gap-1"><Activity className="w-3 h-3" /> Pattern based</span>
        </div>
      </footer>
    </div>
  );
}

