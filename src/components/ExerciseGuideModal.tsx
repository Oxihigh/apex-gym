import React from 'react';
import { X, BookOpen, AlertTriangle, Lightbulb } from 'lucide-react';
import { EXERCISE_CATALOG } from '../utils/exerciseCatalog';
import { ExerciseVisual } from './ExerciseVisual';

interface ExerciseGuideModalProps {
  exerciseId: string;
  onClose: () => void;
}

export const ExerciseGuideModal: React.FC<ExerciseGuideModalProps> = ({ exerciseId, onClose }) => {
  const guide = EXERCISE_CATALOG[exerciseId];

  if (!guide) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
        <div className="w-full max-w-md p-6 bg-slate-800 rounded-2xl border border-slate-700 text-center">
          <p className="text-slate-200 font-semibold mb-4">Exercise guide not found.</p>
          <button 
            onClick={onClose} 
            className="px-4 py-2 bg-green-500 hover:bg-green-600 text-slate-950 font-bold rounded-xl transition"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/85 backdrop-blur-md transition-opacity duration-300">
      {/* Modal Container */}
      <div className="w-full max-w-lg bg-slate-800 rounded-t-3xl sm:rounded-2xl border-t sm:border border-slate-700 overflow-hidden shadow-2xl flex flex-col max-h-[92vh] sm:max-h-[85vh] fade-in">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-700/80 flex items-center justify-between bg-slate-800/90 backdrop-blur sticky top-0 z-10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-green-500/10 rounded-xl border border-green-500/20">
              <BookOpen className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-100">{guide.name}</h3>
              <p className="text-xs text-slate-400 capitalize">{guide.category} Body Exercise</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 rounded-xl transition tap-active"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-6 no-scrollbar flex-1 pb-10">
          
          {/* Interactive Muscle Guide */}
          <ExerciseVisual exerciseId={exerciseId} muscleGroup={guide.muscleGroup} />

          {/* Instructions */}
          <div>
            <h4 className="font-bold text-slate-200 mb-3 flex items-center gap-2 text-sm uppercase tracking-wide text-green-400">
              <span>01.</span> Execution Guide
            </h4>
            <ol className="space-y-3">
              {guide.instructions.map((step, idx) => (
                <li key={idx} className="flex gap-3 text-sm text-slate-300 leading-relaxed">
                  <span className="flex-shrink-0 w-5 h-5 bg-slate-700 rounded-full flex items-center justify-center text-xs font-semibold text-slate-400">
                    {idx + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Common Mistakes */}
          <div className="p-4 bg-red-950/20 border border-red-900/30 rounded-2xl">
            <h4 className="font-bold text-red-400 mb-2.5 flex items-center gap-2 text-sm uppercase tracking-wide">
              <AlertTriangle className="w-4 h-4" />
              Common Mistakes
            </h4>
            <ul className="space-y-2.5 list-disc pl-4 text-sm text-slate-300 leading-relaxed">
              {guide.mistakes.map((mistake, idx) => (
                <li key={idx} className="marker:text-red-500/60">
                  {mistake}
                </li>
              ))}
            </ul>
          </div>

          {/* Coach's Pro Tips */}
          <div className="p-4 bg-green-950/20 border border-green-900/30 rounded-2xl">
            <h4 className="font-bold text-green-400 mb-2.5 flex items-center gap-2 text-sm uppercase tracking-wide">
              <Lightbulb className="w-4 h-4 animate-pulse" />
              Coach's Pro Tips
            </h4>
            <ul className="space-y-2.5 list-disc pl-4 text-sm text-slate-300 leading-relaxed">
              {guide.tips.map((tip, idx) => (
                <li key={idx} className="marker:text-green-500/60">
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Footer close button for mobile convenience */}
        <div className="p-4 border-t border-slate-700/80 bg-slate-900/40 flex justify-end">
          <button
            onClick={onClose}
            className="w-full py-3 bg-slate-700 hover:bg-slate-600 text-slate-100 font-semibold rounded-xl transition tap-active text-sm"
          >
            Got it, Coach
          </button>
        </div>

      </div>
    </div>
  );
};
