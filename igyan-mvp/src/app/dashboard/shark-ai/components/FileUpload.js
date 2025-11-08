'use client';

import { Upload, FileText, Trash2, Loader2 } from 'lucide-react';

export default function FileUpload({ 
  uploadedFile, 
  isProcessing,
  fileInputRef,
  handleFileUpload,
  handleRemoveFile 
}) {
  return (
    <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 mb-4">
      <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
        <Upload className="w-5 h-5" />
        Upload Document
      </h3>

      {!uploadedFile ? (
        <div
          className="border-2 border-dashed border-white/30 rounded-xl p-8 text-center cursor-pointer hover:border-white/50 hover:bg-white/5 transition-all group"
          onClick={() => fileInputRef.current?.click()}
        >
          <FileText className="mx-auto mb-3 text-white/60 group-hover:text-white/80 transition-colors" size={40} />
          <p className="text-white font-medium mb-1">Drop your deck here</p>
          <p className="text-xs text-white/70">PDF, PPT, PPTX, TXT, DOC, DOCX</p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.ppt,.pptx,.txt,.doc,.docx"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>
      ) : (
        <div className="bg-white/95 dark:bg-zinc-800 rounded-xl p-4">
          <div className="flex items-start justify-between gap-2 mb-3">
            <div className="flex items-start space-x-3 flex-1 min-w-0">
              <FileText className="text-indigo-600 mt-1 shrink-0" size={20} />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-zinc-800 dark:text-zinc-200 text-sm truncate">
                  {uploadedFile.name}
                </p>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">
                  {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            <button
              onClick={handleRemoveFile}
              className="text-red-500 hover:text-red-700 transition-colors shrink-0 p-1 hover:bg-red-50 rounded-lg"
              title="Remove file"
            >
              <Trash2 size={18} />
            </button>
          </div>
          {isProcessing && (
            <div className="flex items-center text-indigo-600 text-sm">
              <Loader2 className="animate-spin mr-2" size={14} />
              <span>Analyzing document...</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
