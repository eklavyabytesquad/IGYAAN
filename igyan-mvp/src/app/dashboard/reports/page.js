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
    <div className="dashboard-theme flex w-full flex-1 flex-col gap-6 p-4 lg:p-8">
      {/* Header */}
      <header className="dashboard-card rounded-3xl p-6 shadow-xl">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            <span 
              className="rounded-2xl p-4 text-white shadow-lg"
              style={{ background: 'var(--dashboard-primary)' }}
            >
              <FileText size={28} />
            </span>
            <div>
              <h1 
                className="text-3xl font-semibold tracking-tight sm:text-4xl"
                style={{ color: 'var(--dashboard-heading)' }}
              >
                Reports & Analytics
              </h1>
              <p 
                className="mt-2 max-w-xl text-sm sm:text-base"
                style={{ color: 'var(--dashboard-muted)' }}
              >
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
              className="dashboard-card rounded-2xl p-4 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p 
                    className="text-xs font-medium"
                    style={{ color: 'var(--dashboard-muted)' }}
                  >
                    {stat.title}
                  </p>
                  <p 
                    className="mt-2 text-2xl font-bold"
                    style={{ color: 'var(--dashboard-heading)' }}
                  >
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
        <div className="mt-6 flex gap-2 rounded-2xl border p-1" style={{ borderColor: 'var(--dashboard-border)', backgroundColor: 'var(--dashboard-surface-muted)' }}>
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
              activeTab === 'dashboard'
                ? 'text-white shadow-md'
                : 'hover:bg-white/60'
            }`}
            style={activeTab === 'dashboard' ? { 
              background: 'var(--dashboard-primary)' 
            } : { 
              color: 'var(--dashboard-text)' 
            }}
          >
            📊 Analytics Dashboard
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
              activeTab === 'reports'
                ? 'text-white shadow-md'
                : 'hover:bg-white/60'
            }`}
            style={activeTab === 'reports' ? { 
              background: 'var(--dashboard-primary)' 
            } : { 
              color: 'var(--dashboard-text)' 
            }}
          >
            📄 Generate Reports
          </button>
        </div>
      </header>

      {/* Content */}
      <section className="dashboard-card flex flex-1 flex-col overflow-hidden rounded-3xl shadow-2xl">
        {activeTab === 'dashboard' ? <AnalyticsDashboard /> : <ReportGenerator />}
      </section>
    </div>
  );
}
