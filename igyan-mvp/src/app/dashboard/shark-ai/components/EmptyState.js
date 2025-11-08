'use client';

import { FileText } from 'lucide-react';

export default function EmptyState() {
  return (
    <div className="h-full flex items-center justify-center">
      <div className="text-center max-w-lg px-4">
        <div className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 flex items-center justify-center border-4 border-blue-200 dark:border-blue-800 shadow-lg">
          <FileText className="w-12 h-12 text-indigo-600 dark:text-indigo-400" />
        </div>
        <h3 className="text-xl md:text-2xl font-bold text-zinc-800 dark:text-zinc-200 mb-3">
          Ready to Pitch?
        </h3>
        <p className="text-sm md:text-base text-zinc-600 dark:text-zinc-400 leading-relaxed">
          Upload your business deck to get started. Shark AI will analyze your plan and help you perfect your pitch with real-time investor feedback.
        </p>
        <div className="mt-6 flex justify-center gap-2">
          <div className="px-4 py-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-full text-xs font-medium text-indigo-700 dark:text-indigo-300">
            PDF
          </div>
          <div className="px-4 py-2 bg-purple-100 dark:bg-purple-900/30 rounded-full text-xs font-medium text-purple-700 dark:text-purple-300">
            PPT
          </div>
          <div className="px-4 py-2 bg-blue-100 dark:bg-blue-900/30 rounded-full text-xs font-medium text-blue-700 dark:text-blue-300">
            DOCX
          </div>
        </div>
      </div>
    </div>
  );
}
