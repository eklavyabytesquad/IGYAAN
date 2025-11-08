'use client';

import { Send, Mic, Timer, StopCircle } from 'lucide-react';

export default function ChatInput({ 
  message, 
  setMessage, 
  isProcessing,
  isLoading,
  uploadedFile,
  isPitchMode, 
  timerRunning, 
  elapsedTime, 
  isPitchStarted, 
  handleSend, 
  toggleListening, 
  isListening,
  stopPitchRecording,
  handleKeyPress
}) {
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-800 p-4 rounded-b-2xl">
      {/* Timer Display */}
      {isPitchMode && timerRunning && (
        <div className="mb-4 flex flex-col sm:flex-row items-center justify-between gap-3 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/10 dark:to-red-900/10 rounded-xl p-3 border border-orange-200 dark:border-orange-800">
          <div className="flex items-center gap-3">
            <Timer className={`${elapsedTime <= 60 ? 'text-red-600 dark:text-red-400 animate-pulse' : 'text-orange-600 dark:text-orange-400'}`} size={20} />
            <div>
              <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400 block">Time Remaining</span>
              <span className={`text-2xl font-bold tabular-nums ${elapsedTime <= 60 ? 'text-red-600 dark:text-red-400 animate-pulse' : 'text-orange-600 dark:text-orange-400'}`}>
                {formatTime(elapsedTime)}
              </span>
            </div>
          </div>
          <button
            onClick={stopPitchRecording}
            className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-all flex items-center gap-2 font-semibold shadow-md"
          >
            <StopCircle size={16} />
            Stop & Submit
          </button>
        </div>
      )}

      <div className="flex gap-2 md:gap-3">
        <div className="relative flex-1">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={
              isPitchMode
                ? '🎤 Start pitching... Use voice or type your presentation'
                : uploadedFile && !isPitchStarted
                ? 'Click "Start Pitch" button above to begin...'
                : uploadedFile
                ? 'Ask me anything about your document...'
                : 'Upload a document first to get started...'
            }
            rows={isPitchMode ? "3" : "1"}
            disabled={!uploadedFile || isLoading || isProcessing || (!isPitchMode && isPitchStarted)}
            className="w-full resize-none px-4 py-3 pr-14 text-sm border border-zinc-300 dark:border-zinc-600 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:focus:ring-indigo-400 disabled:bg-zinc-100 dark:disabled:bg-zinc-800 disabled:cursor-not-allowed disabled:text-zinc-400 dark:disabled:text-zinc-500 transition-all placeholder:text-zinc-500 dark:placeholder:text-zinc-500"
          />
          {isPitchMode && (
            <button
              onClick={toggleListening}
              disabled={isLoading || isProcessing}
              className={`absolute right-2 top-2 p-2 rounded-lg transition-all ${
                isListening
                  ? 'bg-red-500 text-white animate-pulse'
                  : 'bg-indigo-500 text-white hover:bg-indigo-600'
              }`}
              title={isListening ? 'Stop recording' : 'Start voice input'}
            >
              {isListening ? (
                <StopCircle size={18} />
              ) : (
                <Mic size={18} />
              )}
            </button>
          )}
        </div>
        {isPitchMode ? (
          <button
            onClick={handleSend}
            disabled={!message.trim() || isLoading}
            className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:from-emerald-700 hover:to-teal-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm font-semibold shadow-md"
          >
            <Send size={18} />
            Submit Pitch
          </button>
        ) : (
          <button
            onClick={handleSend}
            disabled={!message.trim() || !uploadedFile || isLoading || isProcessing || !isPitchStarted}
            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm font-semibold shadow-md"
          >
            <Send size={18} />
            Send
          </button>
        )}
      </div>
      {isPitchMode && (
        <div className="mt-2">
          <p className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
            <Mic className="w-3 h-3" />
            <span>Use voice or type • Cover business model, market & funding needs</span>
          </p>
        </div>
      )}
    </div>
  );
}
