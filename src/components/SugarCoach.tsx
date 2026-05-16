import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Activity, Send, AlertCircle, Info, History, Trash2 } from 'lucide-react';
import { analyzeBloodSugarPatterns } from '../services/geminiService';

interface SugarReading {
  id: string;
  date: string;
  type: string;
  reading: string;
  notes?: string;
}

export const SugarCoach: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [report, setReport] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!inputText.trim()) {
      setError("Please enter some readings first.");
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    try {
      const result = await analyzeBloodSugarPatterns(inputText);
      setReport(result);
    } catch (err: any) {
      setError(err.message || "Failed to analyze patterns.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getSectionIcon = (title: string) => {
    if (title.includes('PATTERN SUMMARY')) return <Activity className="w-5 h-5 text-blue-600" />;
    if (title.includes('KEY FINDINGS')) return <Info className="w-5 h-5 text-indigo-600" />;
    if (title.includes('ALERTS')) return <AlertCircle className="w-5 h-5 text-red-600" />;
    if (title.includes('THINGS TO TRY')) return <Activity className="w-4 h-4 text-emerald-600" />;
    return <Info className="w-5 h-5 text-gray-600" />;
  };

  return (
    <div className="space-y-8">
      {!report ? (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="space-y-4">
            <h2 className="text-3xl font-serif font-bold">Your AI <span className="text-blue-600 italic">Sugar Coach.</span></h2>
            <p className="text-gray-500 text-lg">
              Paste your glucose readings below. The more data you provide, the better patterns I can find.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-[#E5E5E1] shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-400 uppercase tracking-wider mb-2">
              <History className="w-4 h-4" />
              Input Readings
            </div>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Example:
2024-05-10 | Fasting | 110 | Felt a bit tired
2024-05-10 | Post-meal | 165 | Had biryani for lunch
2024-05-11 | Fasting | 105"
              className="w-full h-48 p-4 bg-[#F9F9F7] rounded-2xl border-none focus:ring-2 focus:ring-blue-500 resize-none font-mono text-sm leading-relaxed"
            />
            <div className="flex justify-between items-center">
              <p className="text-xs text-gray-400 italic">
                Format: Date | Type | Reading | Notes
              </p>
              <button
                onClick={handleAnalyze}
                disabled={isAnalyzing || !inputText.trim()}
                className="bg-blue-600 text-white py-3 px-8 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {isAnalyzing ? (
                  <>
                    <Activity className="w-5 h-5 animate-spin" />
                    Analyzing Patterns...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Analyze Patterns
                  </>
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 p-4 rounded-xl text-red-600 text-sm flex items-start gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}

          <div className="bg-blue-50 p-6 rounded-3xl border border-blue-100">
            <h4 className="font-bold text-blue-900 mb-2 flex items-center gap-2 text-sm uppercase tracking-wide">
              <Info className="w-4 h-4" />
              How it works
            </h4>
            <ul className="text-sm text-blue-800 space-y-2 opacity-90">
              <li>• Provide at least 5 readings for pattern detection.</li>
              <li>• Accurate types (Fasting, Post-meal, etc.) help me understand spikes.</li>
              <li>• Notes about stress or exercise provide vital context.</li>
            </ul>
          </div>
        </motion.div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-serif font-bold italic">Coach's Insight</h2>
            <button 
              onClick={() => setReport(null)}
              className="text-blue-600 text-sm font-semibold hover:underline"
            >
              Enter New Data
            </button>
          </div>

          {report.split('\n\n').map((section, idx) => {
            const lines = section.split('\n');
            const titleLine = lines[0];
            const content = lines.slice(1).join('\n');

            if (!titleLine || !content) return null;

            return (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white p-6 rounded-3xl border border-[#E5E5E1] shadow-sm overflow-hidden"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-gray-50 rounded-xl">
                    {getSectionIcon(titleLine)}
                  </div>
                  <h3 className="font-bold text-sm uppercase tracking-wider text-gray-900">
                    {titleLine.replace(/[📈🔍🚨💪📋]/g, '').trim()}
                  </h3>
                </div>
                <div className="text-gray-700 leading-relaxed text-[15px] whitespace-pre-wrap">
                  {content.split('\n').map((line, lIdx) => (
                    <p key={lIdx} className={line.trim().startsWith('-') ? 'pl-4 relative before:content-["•"] before:absolute before:left-0 before:text-blue-500' : ''}>
                      {line.trim().startsWith('-') ? line.trim().substring(1).trim() : line}
                    </p>
                  ))}
                </div>
              </motion.div>
            );
          })}

          <div className="bg-amber-50 p-6 rounded-3xl border border-amber-100 italic text-amber-800 text-sm">
            Important: I am your companion, not your doctor. Please share this report with your healthcare provider before making any changes to your medication or diet.
          </div>
        </motion.div>
      )}
    </div>
  );
};
