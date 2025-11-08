'use client';

export default function LanguageSelector({ 
  selectedLanguage, 
  setSelectedLanguage,
  isProcessing,
  isLoading,
  hasStartedPitch 
}) {
  return (
    <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 mb-4">
      <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
        </svg>
        Language / भाषा
      </h3>
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => setSelectedLanguage('english')}
          disabled={isProcessing || isLoading || hasStartedPitch}
          className={`px-4 py-2.5 rounded-lg font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
            selectedLanguage === 'english'
              ? 'bg-white text-indigo-600 shadow-lg'
              : 'bg-white/20 text-white hover:bg-white/30'
          }`}
        >
          🇬🇧 English
        </button>
        <button
          onClick={() => setSelectedLanguage('hindi')}
          disabled={isProcessing || isLoading || hasStartedPitch}
          className={`px-4 py-2.5 rounded-lg font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
            selectedLanguage === 'hindi'
              ? 'bg-white text-indigo-600 shadow-lg'
              : 'bg-white/20 text-white hover:bg-white/30'
          }`}
        >
          🇮🇳 हिंदी
        </button>
      </div>
      <p className="text-xs text-white/70 mt-2">
        {selectedLanguage === 'english' 
          ? 'AI will respond in English' 
          : 'AI हिंदी में जवाब देगा'}
      </p>
    </div>
  );
}
