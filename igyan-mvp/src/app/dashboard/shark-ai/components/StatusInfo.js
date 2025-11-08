'use client';

export default function StatusInfo({ uploadedFile }) {
  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
      <div className="text-xs text-white/90 space-y-2">
        <div className="flex items-start gap-2">
          <span className="text-emerald-300 mt-0.5">✓</span>
          <span>Upload your business plan or pitch deck</span>
        </div>
        <div className="flex items-start gap-2">
          <span className="text-emerald-300 mt-0.5">✓</span>
          <span>Start your 5-minute pitch presentation</span>
        </div>
        <div className="flex items-start gap-2">
          <span className="text-emerald-300 mt-0.5">✓</span>
          <span>Get instant investor-grade feedback</span>
        </div>
      </div>

      {!uploadedFile && (
        <div className="mt-4 text-center">
          <p className="text-white/60 text-xs italic">AWAITING UPLOAD</p>
        </div>
      )}
    </div>
  );
}
