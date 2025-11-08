'use client';

import Image from 'next/image';
import { Volume2, VolumeX, StopCircle, Mic } from 'lucide-react';

export default function SharkAvatar({ 
  isListening, 
  isSpeaking, 
  isProcessing,
  isLoading,
  selectedLanguage, 
  pitchTranscript,
  stopSpeaking,
  toggleListening 
}) {
  return (
    <div>
      {/* Shark Avatar Section with Sound Reactive Animation */}
      <div className="flex flex-col items-center mb-6 mt-8">
        <div className="relative">
          {/* Sound wave rings */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className={`absolute w-48 h-48 rounded-full border-2 border-blue-400/60 ${isListening ? 'animate-sound-wave-1' : ''}`}></div>
            <div className={`absolute w-56 h-56 rounded-full border-2 border-purple-400/50 ${isListening ? 'animate-sound-wave-2' : ''}`}></div>
            <div className={`absolute w-64 h-64 rounded-full border-2 border-indigo-400/40 ${isListening ? 'animate-sound-wave-3' : ''}`}></div>
          </div>
          
          {/* Main avatar circle with background */}
          <div className={`w-48 h-48 rounded-full backdrop-blur-sm flex items-center justify-center mb-4 border-4 border-white/30 shadow-2xl relative z-10 transition-all duration-300 overflow-hidden ${isListening ? 'scale-105 shadow-blue-500/50' : ''} ${isSpeaking ? 'scale-105 shadow-green-500/50' : ''}`}>
            {/* Background Image */}
            <Image 
              src="/asset/ai-shark/sharkbg.jpg" 
              alt="Shark Background"
              fill
              className="object-cover opacity-80"
              priority
            />
            
            {/* Foreground Shark */}
            <Image 
              src="/asset/ai-shark/suitshark.png" 
              alt="Shark AI"
              width={200}
              height={200}
              className="w-40 h-40 object-contain relative z-10"
              priority
            />
            
            {/* Speaking indicator */}
            {isSpeaking && (
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-lg animate-bounce z-20">
                <Volume2 className="w-3 h-3" />
                <span>{selectedLanguage === 'english' ? 'Speaking...' : 'बोल रहा है...'}</span>
              </div>
            )}
          </div>
        </div>
        
        <h2 className="text-2xl font-bold text-white text-center mb-6 mt-4">AI Shark</h2>
        
        {/* Stop Speaking Button */}
        {isSpeaking && (
          <div className="flex justify-center mb-4 animate-fade-in">
            <button
              onClick={stopSpeaking}
              className="bg-red-500 hover:bg-red-600 text-white px-6 py-2.5 rounded-full font-semibold text-sm transition-all shadow-lg flex items-center gap-2 hover:scale-105"
            >
              <VolumeX className="w-5 h-5 animate-pulse" />
              {selectedLanguage === 'english' ? 'Stop Speaking' : 'बोलना बंद करें'}
            </button>
          </div>
        )}
      </div>

      {/* Big Microphone Button with Live Transcription */}
      <div className="mb-6">
        <div className="flex flex-col items-center gap-4">
          {/* Big Mic Button */}
          <button
            onClick={toggleListening}
            disabled={isProcessing || isLoading}
            className={`relative w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${
              isListening
                ? 'bg-red-500 shadow-lg shadow-red-500/50 scale-110'
                : 'bg-white/20 hover:bg-white/30 backdrop-blur-md border-2 border-white/40 hover:scale-105'
            }`}
          >
            {isListening ? (
              <>
                <div className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-75"></div>
                <StopCircle className="w-10 h-10 text-white relative z-10" />
              </>
            ) : (
              <Mic className="w-10 h-10 text-white" />
            )}
          </button>
          
          {/* Status Text */}
          <div className="text-center">
            <p className="text-white font-semibold text-sm">
              {isListening ? '🔴 Recording...' : '🎤 Tap to speak'}
            </p>
          </div>

          {/* Live Transcription Display */}
          {isListening && pitchTranscript && (
            <div className="w-full bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 animate-fade-in">
              <div className="flex items-start gap-2 mb-2">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse mt-1.5"></div>
                <span className="text-xs font-semibold text-white/80 uppercase tracking-wide">Live Transcription</span>
              </div>
              <p className="text-white text-sm leading-relaxed max-h-32 overflow-y-auto custom-scrollbar">
                {pitchTranscript}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
