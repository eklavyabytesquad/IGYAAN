'use client';

import { AlertTriangle, X, Timer, Mic } from 'lucide-react';

export default function PitchWarningModal({ show, onClose, onStart }) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-2xl max-w-lg w-full p-6 md:p-8 border-2 border-indigo-200 dark:border-indigo-700 relative animate-slide-up">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
            <Timer className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-zinc-800 dark:text-white">
            5-Minute Pitch Timer
          </h3>
        </div>

        {/* Warning Message */}
        <div className="mb-6">
          <p className="text-zinc-700 dark:text-zinc-300 mb-4 leading-relaxed">
            You will have <span className="font-bold text-orange-600 dark:text-orange-400">exactly 5 minutes</span> to present your pitch. Structure your time wisely:
          </p>
          
          <div className="space-y-3 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-sm shrink-0">1</div>
              <div>
                <p className="font-semibold text-zinc-800 dark:text-white">Company Introduction</p>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">1-2 minutes • Who you are & what you do</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-indigo-500 text-white flex items-center justify-center font-bold text-sm shrink-0">2</div>
              <div>
                <p className="font-semibold text-zinc-800 dark:text-white">Problem & Solution</p>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">1 minute • The pain point & your fix</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-purple-500 text-white flex items-center justify-center font-bold text-sm shrink-0">3</div>
              <div>
                <p className="font-semibold text-zinc-800 dark:text-white">Business Model</p>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">1 minute • How you make money</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-pink-500 text-white flex items-center justify-center font-bold text-sm shrink-0">4</div>
              <div>
                <p className="font-semibold text-zinc-800 dark:text-white">Market Opportunity</p>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">1 minute • Market size & competition</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center font-bold text-sm shrink-0">5</div>
              <div>
                <p className="font-semibold text-zinc-800 dark:text-white">The Ask</p>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">30 seconds • Funding & terms</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200 rounded-xl hover:bg-zinc-300 dark:hover:bg-zinc-600 transition-all font-semibold"
          >
            Cancel
          </button>
          <button
            onClick={onStart}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all font-bold shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center gap-2"
          >
            <Mic size={20} />
            Start Pitch
          </button>
        </div>
      </div>
    </div>
  );
}
