import React from 'react';
import { motion } from 'motion/react';
import { ChefHat, Info, AlertTriangle, Lightbulb, Zap, TrendingUp, ShieldCheck } from 'lucide-react';

interface NutritionReportProps {
  report: string;
}

export const NutritionReport: React.FC<NutritionReportProps> = ({ report }) => {
  // Helper to parse sections
  const sections = report.split('\n\n');

  const getSectionIcon = (title: string) => {
    if (title.includes('MEAL DETECTED')) return <ChefHat className="w-5 h-5 text-emerald-600" />;
    if (title.includes('DIABETIC MARKERS')) return <TrendingUp className="w-5 h-5 text-blue-600" />;
    if (title.includes('BLOOD SUGAR IMPACT')) return <Zap className="w-5 h-5 text-amber-500" />;
    if (title.includes('DIABETIC RATING')) return <ShieldCheck className="w-5 h-5 text-indigo-600" />;
    if (title.includes('3 SMART ACTIONS')) return <Lightbulb className="w-5 h-5 text-emerald-500" />;
    if (title.includes('WATCH OUT FOR')) return <AlertTriangle className="w-5 h-5 text-red-500" />;
    return <Info className="w-5 h-5 text-gray-600" />;
  };

  const formatContent = (content: string) => {
    return content.split('\n').map((line, i) => {
      const trimmed = line.trim();
      if (trimmed.startsWith('-') || /^\d\./.test(trimmed)) {
        return (
          <li key={i} className="mb-2 list-none flex gap-2">
            <span className="text-emerald-500 mt-1">•</span>
            <span>{trimmed.replace(/^[- \d\.]+/, '')}</span>
          </li>
        );
      }
      return <p key={i} className="mb-2">{trimmed}</p>;
    });
  };

  const renderedSections = sections.map((section, index) => {
    const lines = section.split('\n');
    let titleLine = lines[0];
    let content = lines.slice(1).join('\n');

    if (lines.length === 1 && titleLine) {
      const emojiMatch = titleLine.match(/[🍱📊⚡🚦💡⚠️]/);
      if (emojiMatch) {
        content = titleLine; 
      } else {
        return null;
      }
    }

    if (!titleLine) return null;

    return (
      <motion.div 
        key={index}
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.1 }}
        className="bg-white p-6 rounded-3xl border border-[#E5E5E1] shadow-sm"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-gray-50 rounded-xl">
            {getSectionIcon(titleLine)}
          </div>
          <h3 className="font-bold text-sm uppercase tracking-wider text-gray-900">
            {titleLine.replace(/[🍱📊⚡🚦💡⚠️]/g, '').trim()}
          </h3>
        </div>
        <div className="text-gray-700 leading-relaxed text-[15px]">
          {content ? formatContent(content) : <p>No specific details provided.</p>}
        </div>
      </motion.div>
    );
  }).filter(Boolean);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 pb-20"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-serif italic font-bold">Analysis Report</h2>
        <div className="text-xs font-medium text-gray-400 uppercase tracking-widest">
          AI Generated
        </div>
      </div>

      {renderedSections.length > 0 ? renderedSections : (
        <div className="bg-white p-6 rounded-3xl border border-[#E5E5E1] shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-gray-50 rounded-xl">
              <Info className="w-5 h-5 text-gray-600" />
            </div>
            <h3 className="font-bold text-sm uppercase tracking-wider text-gray-900">Analysis Details</h3>
          </div>
          <div className="text-gray-700 leading-relaxed text-[15px] whitespace-pre-wrap">
            {report}
          </div>
        </div>
      )}

      <div className="bg-emerald-50 p-6 rounded-3xl border border-emerald-100 italic text-emerald-800 text-sm">
        Disclaimer: This analysis is for informational purposes only. Always consult your doctor or a clinical nutritionist for specific medical advice.
      </div>
    </motion.div>
  );
};
