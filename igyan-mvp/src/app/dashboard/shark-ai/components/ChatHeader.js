'use client';

import { FileText } from 'lucide-react';

export default function ChatHeader({ uploadedFile, hasStartedPitch, timerRunning }) {
  return (
    <div 
      className="border-b px-6 py-4 rounded-t-2xl"
      style={{ 
        borderColor: 'var(--dashboard-border)',
        backgroundColor: 'var(--dashboard-card)'
      }}
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold" style={{ color: 'var(--dashboard-heading)' }}>
            Pitch Conversation
          </h2>
          <p className="text-xs mt-0.5" style={{ color: 'var(--dashboard-muted)' }}>
            {uploadedFile ? `Analyzing: ${uploadedFile.name}` : 'Upload a document to start'}
          </p>
        </div>
        {hasStartedPitch && timerRunning && (
          <div 
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg shadow-sm"
            style={{ backgroundColor: 'var(--dashboard-card)' }}
          >
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-semibold" style={{ color: 'var(--dashboard-text)' }}>
              Live
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
