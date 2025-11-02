'use client';

import { useState } from 'react';
import { FileText, Download, TrendingUp, Users, BookOpen, Award } from 'lucide-react';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import ReportGenerator from './components/ReportGenerator';

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState('dashboard');

  // Dummy data for quick stats
  const stats = [
    {
      title: 'Total Students',
      value: '1,234',
      change: '+12%',
      icon: Users,
      color: 'from-blue-500 to-cyan-500',
    },
    {
      title: 'Average Score',
      value: '85.4%',
      change: '+5.2%',
      icon: TrendingUp,
      color: 'from-emerald-500 to-teal-500',
    },
    {
      title: 'Active Courses',
      value: '48',
      change: '+8',
      icon: BookOpen,
      color: 'from-purple-500 to-pink-500',
    },
    {
      title: 'Top Performers',
      value: '156',
      change: '+23',
      icon: Award,
      color: 'from-orange-500 to-red-500',
    },
  ];

  return (
    <div className="flex w-full flex-1 flex-col gap-6 bg-linear-to-br from-indigo-50 via-purple-50 to-pink-50/60 p-4 lg:p-8 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
      {/* Header */}
      <header className="rounded-3xl border border-white/60 bg-white/70 p-6 shadow-xl backdrop-blur dark:border-white/10 dark:bg-zinc-900/70">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            <span className="rounded-2xl bg-linear-to-r from-indigo-500 via-purple-500 to-pink-500 p-4 text-white shadow-lg">
              <FileText size={28} />
            </span>
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-4xl">
                Reports & Analytics
              </h1>
              <p className="mt-2 max-w-xl text-sm text-zinc-600 dark:text-zinc-400 sm:text-base">
                AI-powered insights into student performance. Generate detailed reports for classes and individual students.
              </p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.title}
              className="rounded-2xl border border-white/60 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-white/10 dark:bg-zinc-800/80"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                    {stat.title}
                  </p>
                  <p className="mt-2 text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                    {stat.value}
                  </p>
                  <p className="mt-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    {stat.change} from last month
                  </p>
                </div>
                <div className={`rounded-xl bg-linear-to-r ${stat.color} p-3 text-white shadow-md`}>
                  <stat.icon size={20} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="mt-6 flex gap-2 rounded-2xl border border-white/60 bg-white/60 p-1 backdrop-blur dark:border-white/10 dark:bg-zinc-800/60">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
              activeTab === 'dashboard'
                ? 'bg-linear-to-r from-indigo-500 via-purple-500 to-pink-500 text-white shadow-md'
                : 'text-zinc-600 hover:bg-white/60 dark:text-zinc-300 dark:hover:bg-zinc-700/60'
            }`}
          >
            📊 Analytics Dashboard
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
              activeTab === 'reports'
                ? 'bg-linear-to-r from-indigo-500 via-purple-500 to-pink-500 text-white shadow-md'
                : 'text-zinc-600 hover:bg-white/60 dark:text-zinc-300 dark:hover:bg-zinc-700/60'
            }`}
          >
            📄 Generate Reports
          </button>
        </div>
      </header>

      {/* Content */}
      <section className="flex flex-1 flex-col overflow-hidden rounded-3xl border border-white/60 bg-white/80 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-zinc-900/80">
        {activeTab === 'dashboard' ? <AnalyticsDashboard /> : <ReportGenerator />}
      </section>
    </div>
  );
}
