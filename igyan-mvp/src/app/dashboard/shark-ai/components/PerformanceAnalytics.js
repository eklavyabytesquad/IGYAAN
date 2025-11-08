'use client';

export default function PerformanceAnalytics({ scores }) {
  return (
    <div className="flex justify-start mt-4 animate-fade-in">
      <div className="max-w-[90%] md:max-w-[80%] w-full bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-zinc-800 dark:via-zinc-850 dark:to-zinc-900 rounded-2xl p-4 md:p-5 shadow-xl border border-indigo-200 dark:border-indigo-900">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base md:text-lg font-bold text-zinc-800 dark:text-white flex items-center gap-2">
            <span className="text-lg">📊</span>
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Performance Analytics
            </span>
          </h3>
        </div>
        
        {/* Overall Score Circle with Enhanced Design */}
        <div className="flex justify-center mb-4">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-full blur-xl"></div>
            <div className="relative w-32 h-32 md:w-36 md:h-36">
              <svg className="w-full h-full transform -rotate-90">
                {/* Background circle */}
                <circle
                  cx="50%"
                  cy="50%"
                  r="45%"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  className="text-zinc-200 dark:text-zinc-700"
                />
                {/* Animated progress circle */}
                <circle
                  cx="50%"
                  cy="50%"
                  r="45%"
                  stroke="url(#scoreGradient)"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * (scores.overall >= 70 ? 86 : scores.overall >= 40 ? 90 : 85)}`}
                  strokeDashoffset={`${2 * Math.PI * 87 * (1 - scores.overall / 100)}`}
                  className="transition-all duration-1500 ease-out"
                  strokeLinecap="round"
                  style={{ filter: 'drop-shadow(0 0 8px rgba(99, 102, 241, 0.5))' }}
                />
                <defs>
                  <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style={{ stopColor: scores.overall >= 70 ? '#10b981' : scores.overall >= 40 ? '#f59e0b' : '#ef4444' }} />
                    <stop offset="100%" style={{ stopColor: scores.overall >= 70 ? '#059669' : scores.overall >= 40 ? '#d97706' : '#dc2626' }} />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl md:text-4xl font-black text-zinc-800 dark:text-white">
                  {scores.overall}
                </span>
                <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  / 100
                </span>
                <span className={`text-xs font-bold mt-1.5 px-2 py-0.5 rounded-full ${
                  scores.overall >= 70 ? 'bg-green-500 text-white' :
                  scores.overall >= 40 ? 'bg-yellow-500 text-white' :
                  'bg-red-500 text-white'
                }`}>
                  {scores.overall >= 70 ? 'Excellent' : scores.overall >= 40 ? 'Moderate' : 'Needs Work'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Pie Chart and Bar Chart Visualization */}
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          {/* Pie Chart */}
          <div className="bg-white dark:bg-zinc-900 rounded-xl p-4 shadow-lg border border-zinc-200 dark:border-zinc-700">
            <h4 className="text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-3 flex items-center gap-1.5">
              <span>🥧</span> Score Distribution
            </h4>
            <div className="flex justify-center items-center">
              {(() => {
                const scoresList = [
                  { value: scores.clarity || 0, color: '#3b82f6', label: 'Clarity' },
                  { value: scores.business || 0, color: '#a855f7', label: 'Business' },
                  { value: scores.market || 0, color: '#6366f1', label: 'Market' },
                  { value: scores.financial || 0, color: '#ec4899', label: 'Financial' },
                  { value: scores.communication || 0, color: '#06b6d4', label: 'Communication' },
                ];
                const total = scoresList.reduce((sum, s) => sum + s.value, 0);
                let currentAngle = 0;
                
                return (
                  <div className="relative w-36 h-36 md:w-40 md:h-40">
                    <svg viewBox="0 0 200 200" className="w-full h-full transform -rotate-90">
                      {total > 0 ? scoresList.map((score, idx) => {
                        const percentage = score.value / total;
                        const angle = percentage * 360;
                        const startAngle = currentAngle;
                        currentAngle += angle;
                        
                        const startRad = (startAngle * Math.PI) / 180;
                        const endRad = (currentAngle * Math.PI) / 180;
                        const x1 = 100 + 80 * Math.cos(startRad);
                        const y1 = 100 + 80 * Math.sin(startRad);
                        const x2 = 100 + 80 * Math.cos(endRad);
                        const y2 = 100 + 80 * Math.sin(endRad);
                        const largeArc = angle > 180 ? 1 : 0;
                        
                        return (
                          <path
                            key={idx}
                            d={`M 100 100 L ${x1} ${y1} A 80 80 0 ${largeArc} 1 ${x2} ${y2} Z`}
                            fill={score.color}
                            className="transition-all duration-500 hover:opacity-80 cursor-pointer"
                            style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}
                          />
                        );
                      }) : (
                        <circle cx="100" cy="100" r="80" fill="#e5e7eb" className="dark:fill-zinc-700" />
                      )}
                      {/* Center white circle */}
                      <circle cx="100" cy="100" r="50" fill="white" className="dark:fill-zinc-900" />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-xl font-bold text-zinc-800 dark:text-white">{total}</div>
                        <div className="text-xs text-zinc-600 dark:text-zinc-400">Total</div>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
            {/* Legend */}
            <div className="mt-3 space-y-1.5">
              {[
                { label: 'Clarity', value: scores.clarity, color: 'bg-blue-500' },
                { label: 'Business', value: scores.business, color: 'bg-purple-500' },
                { label: 'Market', value: scores.market, color: 'bg-indigo-500' },
                { label: 'Financial', value: scores.financial, color: 'bg-pink-500' },
                { label: 'Communication', value: scores.communication, color: 'bg-cyan-500' },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                    <span className="text-zinc-700 dark:text-zinc-300">{item.label}</span>
                  </div>
                  <span className="font-bold text-zinc-800 dark:text-white">{item.value}/20</span>
                </div>
              ))}
            </div>
          </div>

          {/* Performance Bars */}
          <div className="bg-white dark:bg-zinc-900 rounded-xl p-4 shadow-lg border border-zinc-200 dark:border-zinc-700">
            <h4 className="text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-3 flex items-center gap-1.5">
              <span>📊</span> Performance Bars
            </h4>
            <div className="space-y-2.5">
              {[
                { label: 'Pitch Clarity', value: scores.clarity, max: 20, color: 'from-blue-500 to-blue-600', icon: '🎯' },
                { label: 'Business Model', value: scores.business, max: 20, color: 'from-purple-500 to-purple-600', icon: '💼' },
                { label: 'Market Opportunity', value: scores.market, max: 20, color: 'from-indigo-500 to-indigo-600', icon: '🌍' },
                { label: 'Financial & Ask', value: scores.financial, max: 20, color: 'from-pink-500 to-pink-600', icon: '💰' },
                { label: 'Communication', value: scores.communication, max: 20, color: 'from-cyan-500 to-cyan-600', icon: '💬' },
              ].map((item, idx) => item.value !== null && (
                <div key={idx} className="group">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm">{item.icon}</span>
                      <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">{item.label}</span>
                    </div>
                    <span className="text-xs font-bold text-zinc-800 dark:text-white bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded-full">
                      {item.value}/{item.max}
                    </span>
                  </div>
                  <div className="relative h-6 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden shadow-inner">
                    <div
                      className={`h-full bg-gradient-to-r ${item.color} rounded-full transition-all duration-1000 ease-out flex items-center justify-end px-2 group-hover:shadow-lg`}
                      style={{ 
                        width: `${(item.value / item.max) * 100}%`,
                        minWidth: item.value > 0 ? '8%' : '0%'
                      }}
                    >
                      {item.value > 0 && (
                        <span className="text-xs font-bold text-white drop-shadow">
                          {Math.round((item.value / item.max) * 100)}%
                        </span>
                      )}
                    </div>
                    {/* Shimmer effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer pointer-events-none"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
