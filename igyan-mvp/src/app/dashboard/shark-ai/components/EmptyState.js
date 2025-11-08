'use client';

import { FileText } from 'lucide-react';

export default function EmptyState() {
  return (
    <div className="h-full flex items-center justify-center">
      <div className="text-center max-w-lg px-4">
        <div 
          className="w-24 h-24 mx-auto mb-6 rounded-3xl flex items-center justify-center border-4 shadow-lg"
          style={{
            backgroundColor: 'color-mix(in srgb, var(--dashboard-primary) 15%, transparent)',
            borderColor: 'color-mix(in srgb, var(--dashboard-primary) 25%, transparent)'
          }}
        >
          <FileText 
            className="w-12 h-12" 
            style={{ color: 'var(--dashboard-primary)' }}
          />
        </div>
        <h3 
          className="text-xl md:text-2xl font-bold mb-3"
          style={{ color: 'var(--dashboard-heading)' }}
        >
          Ready to Pitch?
        </h3>
        <p 
          className="text-sm md:text-base leading-relaxed"
          style={{ color: 'var(--dashboard-text)' }}
        >
          Upload your business deck to get started. Shark AI will analyze your plan and help you perfect your pitch with real-time investor feedback.
        </p>
        <div className="mt-6 flex justify-center gap-2 flex-wrap">
          <div 
            className="px-4 py-2 rounded-full text-xs font-semibold"
            style={{
              backgroundColor: 'color-mix(in srgb, var(--dashboard-primary) 12%, transparent)',
              color: 'var(--dashboard-primary)',
              border: '1px solid color-mix(in srgb, var(--dashboard-primary) 20%, transparent)'
            }}
          >
            PDF
          </div>
          <div 
            className="px-4 py-2 rounded-full text-xs font-semibold"
            style={{
              backgroundColor: 'color-mix(in srgb, var(--dashboard-primary) 12%, transparent)',
              color: 'var(--dashboard-primary)',
              border: '1px solid color-mix(in srgb, var(--dashboard-primary) 20%, transparent)'
            }}
          >
            PPT
          </div>
          <div 
            className="px-4 py-2 rounded-full text-xs font-semibold"
            style={{
              backgroundColor: 'color-mix(in srgb, var(--dashboard-primary) 12%, transparent)',
              color: 'var(--dashboard-primary)',
              border: '1px solid color-mix(in srgb, var(--dashboard-primary) 20%, transparent)'
            }}
          >
            DOCX
          </div>
        </div>
      </div>
    </div>
  );
}
