'use client';

import { FileText, Presentation, X } from 'lucide-react';

export default function PreviewModal({ content, title, type, onClose, onDownload }) {
  if (!content) return null;

  const sections = content.split('\n\n').filter(section => section.trim());

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xl px-4 py-10 sm:py-12">
  <div className="flex w-full max-w-3xl flex-col overflow-hidden rounded-3xl border border-white/20 bg-white/95 shadow-2xl backdrop-blur dark:border-white/10 dark:bg-zinc-900/95 max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/50 bg-white/60 px-6 py-4 backdrop-blur dark:border-white/10 dark:bg-zinc-900/70">
          <div className="flex items-center gap-3">
            {type === 'ppt' ? (
              <span className="rounded-2xl bg-linear-to-r from-indigo-500 to-purple-500 p-2 text-white shadow">
                <Presentation size={22} />
              </span>
            ) : (
              <span className="rounded-2xl bg-linear-to-r from-emerald-500 to-sky-500 p-2 text-white shadow">
                <FileText size={22} />
              </span>
            )}
            <div>
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                {title}
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {type === 'ppt' ? 'PowerPoint Presentation' : 'PDF Document'} Preview
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-zinc-500 transition hover:bg-zinc-200/60 hover:text-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800/80"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Preview */}
  <div className="flex-1 overflow-y-auto px-6 py-6">
          {type === 'ppt' ? (
            <div className="space-y-6">
              {/* Title Slide */}
              <div className="rounded-2xl bg-linear-to-r from-indigo-600 via-purple-500 to-fuchsia-500 p-10 text-center text-white shadow-xl">
                <h1 className="text-3xl font-bold tracking-tight drop-shadow-md">{title}</h1>
                <p className="text-sm opacity-90">Powered by igyan AI</p>
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
                    className="rounded-2xl border border-zinc-200 bg-white/95 p-6 shadow-lg dark:border-zinc-700 dark:bg-zinc-800/80"
                  >
                    <h2 className="mb-3 text-xl font-semibold text-indigo-600 dark:text-indigo-300">
                      {slideTitle}
                    </h2>
                    <div className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
                      {slideContent}
                    </div>
                    <div className="mt-4 text-right text-xs font-medium text-zinc-400">
                      Slide {index + 2}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-2xl border border-zinc-200 bg-white/95 p-8 shadow-xl dark:border-zinc-700 dark:bg-zinc-800/80">
              {/* PDF Preview */}
              <div className="mb-6 border-b border-zinc-200 pb-4 dark:border-zinc-600">
                <h1 className="mb-2 text-3xl font-semibold text-zinc-900 dark:text-zinc-100">
                  {title}
                </h1>
                <p className="text-sm italic text-zinc-500 dark:text-zinc-400">
                  Powered by igyan AI
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
                              ? 'text-lg font-bold text-zinc-900 dark:text-zinc-100 mt-4'
                              : 'text-zinc-700 dark:text-zinc-300'
                          }`}
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
        <div className="flex items-center justify-between border-t border-white/60 bg-white/70 px-6 py-4 backdrop-blur dark:border-white/10 dark:bg-zinc-900/70">
          <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
            {sections.length + 1} {type === 'ppt' ? 'slides' : 'pages'}
          </p>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="rounded-xl border border-zinc-200/70 px-4 py-2 text-sm font-medium text-zinc-600 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              Close
            </button>
            <button
              onClick={onDownload}
              className="rounded-xl bg-linear-to-r from-indigo-500 via-purple-500 to-fuchsia-500 px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:shadow-indigo-400/30"
            >
              Download {type === 'ppt' ? 'PPT' : 'PDF'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
