'use client';

import { FileText, Presentation, X, Download } from 'lucide-react';

export default function PreviewModal({ content, title, type, onClose, onDownload }) {
  if (!content) return null;

  const sections = content.split('\n\n').filter(section => section.trim());

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8" style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(12px)' }}>
      <div className="flex w-full max-w-4xl flex-col overflow-hidden rounded-3xl shadow-2xl max-h-[90vh]" style={{ backgroundColor: 'var(--dashboard-surface-solid)', borderColor: 'var(--dashboard-border)', borderWidth: '1px' }}>
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-5" style={{ borderColor: 'var(--dashboard-border)', backgroundColor: 'var(--dashboard-surface-muted)' }}>
          <div className="flex items-center gap-4">
            <span className="rounded-2xl p-3 text-white shadow-lg" style={{ background: 'var(--dashboard-primary)' }}>
              {type === 'ppt' ? <Presentation size={24} /> : <FileText size={24} />}
            </span>
            <div>
              <h3 className="text-xl font-bold" style={{ color: 'var(--dashboard-heading)' }}>
                {title}
              </h3>
              <p className="text-sm mt-1" style={{ color: 'var(--dashboard-muted)' }}>
                {type === 'ppt' ? 'PowerPoint Presentation' : 'PDF Document'} Preview
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-2 transition hover:opacity-80"
            style={{ backgroundColor: 'var(--dashboard-surface-solid)', color: 'var(--dashboard-muted)' }}
          >
            <X size={22} />
          </button>
        </div>

        {/* Content Preview */}
        <div className="flex-1 overflow-y-auto px-6 py-6 custom-scrollbar">
          {type === 'ppt' ? (
            <div className="space-y-6">
              {/* Title Slide */}
              <div className="rounded-2xl p-10 text-center text-white shadow-xl" style={{ background: 'var(--dashboard-primary)' }}>
                <h1 className="text-3xl font-bold tracking-tight mb-2">{title}</h1>
                <p className="text-sm opacity-90">Powered by IGYAN AI</p>
              </div>

              {/* Content Slides */}
              {sections.map((section, index) => {
                const lines = section.split('\n');
                const hasTitle = lines[0].includes(':') || lines[0].startsWith('#');
                const slideTitle = hasTitle 
                  ? lines[0].replace('#', '').replace(':', '').trim()
                  : `Slide ${index + 2}`;
                const slideContent = hasTitle ? lines.slice(1).join('\n') : section;

                return (
                  <div
                    key={index}
                    className="rounded-2xl border p-6 shadow-lg transition hover:shadow-xl"
                    style={{ 
                      borderColor: 'var(--dashboard-border)',
                      backgroundColor: 'var(--dashboard-surface-muted)'
                    }}
                  >
                    <h2 className="mb-3 text-xl font-bold" style={{ color: 'var(--dashboard-primary)' }}>
                      {slideTitle}
                    </h2>
                    <div className="whitespace-pre-wrap text-sm leading-relaxed" style={{ color: 'var(--dashboard-text)' }}>
                      {slideContent}
                    </div>
                    <div className="mt-4 text-right text-xs font-medium" style={{ color: 'var(--dashboard-muted)' }}>
                      Slide {index + 2}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-2xl border p-8 shadow-xl" style={{ borderColor: 'var(--dashboard-border)', backgroundColor: 'var(--dashboard-surface-muted)' }}>
              {/* PDF Preview */}
              <div className="mb-6 border-b pb-4" style={{ borderColor: 'var(--dashboard-border)' }}>
                <h1 className="mb-2 text-3xl font-bold" style={{ color: 'var(--dashboard-heading)' }}>
                  {title}
                </h1>
                <p className="text-sm italic" style={{ color: 'var(--dashboard-muted)' }}>
                  Powered by IGYAN AI
                </p>
              </div>
              
              {sections.map((section, index) => {
                const lines = section.split('\n');
                return (
                  <div key={index} className="mb-6">
                    {lines.map((line, lineIndex) => {
                      const isHeading = line.includes(':') || line.startsWith('#');
                      return (
                        <p
                          key={lineIndex}
                          className={`mb-2 ${
                            isHeading
                              ? 'text-lg font-bold mt-4'
                              : ''
                          }`}
                          style={{ color: isHeading ? 'var(--dashboard-heading)' : 'var(--dashboard-text)' }}
                        >
                          {line.replace('#', '').trim()}
                        </p>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t px-6 py-4" style={{ borderColor: 'var(--dashboard-border)', backgroundColor: 'var(--dashboard-surface-muted)' }}>
          <p className="text-sm font-semibold" style={{ color: 'var(--dashboard-muted)' }}>
            {sections.length + 1} {type === 'ppt' ? 'slides' : 'pages'}
          </p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="rounded-xl px-5 py-2.5 text-sm font-semibold transition hover:opacity-80"
              style={{
                borderColor: 'var(--dashboard-border)',
                borderWidth: '1px',
                backgroundColor: 'var(--dashboard-surface-solid)',
                color: 'var(--dashboard-text)'
              }}
            >
              Close
            </button>
            <button
              onClick={onDownload}
              className="rounded-xl px-6 py-2.5 text-sm font-bold text-white shadow-lg transition hover:opacity-90 flex items-center gap-2"
              style={{ background: 'var(--dashboard-primary)' }}
            >
              <Download size={16} />
              Download {type === 'ppt' ? 'PPT' : 'PDF'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
