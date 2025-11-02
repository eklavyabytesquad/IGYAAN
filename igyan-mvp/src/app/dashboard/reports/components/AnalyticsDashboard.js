'use client';

import { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

export default function AnalyticsDashboard() {
  const lineChartRef = useRef(null);
  const barChartRef = useRef(null);
  const doughnutChartRef = useRef(null);
  const radarChartRef = useRef(null);

  useEffect(() => {
    // Line Chart - Performance Trends
    const lineCtx = lineChartRef.current?.getContext('2d');
    const lineChart = lineCtx ? new Chart(lineCtx, {
      type: 'line',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        datasets: [
          {
            label: 'Class Average',
            data: [75, 78, 82, 80, 85, 87, 89, 88, 90, 92, 91, 93],
            borderColor: 'rgb(99, 102, 241)',
            backgroundColor: 'rgba(99, 102, 241, 0.1)',
            tension: 0.4,
            fill: true,
          },
          {
            label: 'Top Performers',
            data: [85, 88, 90, 89, 92, 94, 95, 94, 96, 97, 96, 98],
            borderColor: 'rgb(16, 185, 129)',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            tension: 0.4,
            fill: true,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
          },
          title: {
            display: true,
            text: 'Performance Trends Over Time',
            font: { size: 16, weight: 'bold' },
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 100,
          },
        },
      },
    }) : null;

    // Bar Chart - Subject Performance
    const barCtx = barChartRef.current?.getContext('2d');
    const barChart = barCtx ? new Chart(barCtx, {
      type: 'bar',
      data: {
        labels: ['Mathematics', 'Science', 'English', 'History', 'Geography', 'Computer Sci'],
        datasets: [
          {
            label: 'Class A',
            data: [88, 85, 90, 82, 78, 92],
            backgroundColor: 'rgba(99, 102, 241, 0.8)',
          },
          {
            label: 'Class B',
            data: [82, 80, 85, 88, 83, 87],
            backgroundColor: 'rgba(16, 185, 129, 0.8)',
          },
          {
            label: 'Class C',
            data: [78, 82, 80, 85, 80, 83],
            backgroundColor: 'rgba(251, 146, 60, 0.8)',
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
          },
          title: {
            display: true,
            text: 'Subject-wise Performance by Class',
            font: { size: 16, weight: 'bold' },
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 100,
          },
        },
      },
    }) : null;

    // Doughnut Chart - Grade Distribution
    const doughnutCtx = doughnutChartRef.current?.getContext('2d');
    const doughnutChart = doughnutCtx ? new Chart(doughnutCtx, {
      type: 'doughnut',
      data: {
        labels: ['A+ (90-100)', 'A (80-89)', 'B (70-79)', 'C (60-69)', 'D (50-59)', 'F (<50)'],
        datasets: [
          {
            data: [156, 312, 428, 234, 89, 23],
            backgroundColor: [
              'rgba(16, 185, 129, 0.8)',
              'rgba(99, 102, 241, 0.8)',
              'rgba(251, 146, 60, 0.8)',
              'rgba(251, 191, 36, 0.8)',
              'rgba(239, 68, 68, 0.8)',
              'rgba(107, 114, 128, 0.8)',
            ],
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right',
          },
          title: {
            display: true,
            text: 'Grade Distribution',
            font: { size: 16, weight: 'bold' },
          },
        },
      },
    }) : null;

    // Radar Chart - Skills Assessment
    const radarCtx = radarChartRef.current?.getContext('2d');
    const radarChart = radarCtx ? new Chart(radarCtx, {
      type: 'radar',
      data: {
        labels: ['Problem Solving', 'Critical Thinking', 'Creativity', 'Communication', 'Teamwork', 'Leadership'],
        datasets: [
          {
            label: 'Class Average',
            data: [85, 78, 82, 88, 80, 75],
            borderColor: 'rgb(99, 102, 241)',
            backgroundColor: 'rgba(99, 102, 241, 0.2)',
          },
          {
            label: 'Top 10%',
            data: [95, 92, 90, 94, 88, 90],
            borderColor: 'rgb(16, 185, 129)',
            backgroundColor: 'rgba(16, 185, 129, 0.2)',
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
          },
          title: {
            display: true,
            text: 'Skills Assessment',
            font: { size: 16, weight: 'bold' },
          },
        },
        scales: {
          r: {
            beginAtZero: true,
            max: 100,
          },
        },
      },
    }) : null;

    return () => {
      lineChart?.destroy();
      barChart?.destroy();
      doughnutChart?.destroy();
      radarChart?.destroy();
    };
  }, []);

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Top Charts */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Line Chart */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-lg dark:border-zinc-700 dark:bg-zinc-800">
            <div className="h-80">
              <canvas ref={lineChartRef}></canvas>
            </div>
          </div>

          {/* Bar Chart */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-lg dark:border-zinc-700 dark:bg-zinc-800">
            <div className="h-80">
              <canvas ref={barChartRef}></canvas>
            </div>
          </div>
        </div>

        {/* Bottom Charts */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Doughnut Chart */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-lg dark:border-zinc-700 dark:bg-zinc-800">
            <div className="h-80">
              <canvas ref={doughnutChartRef}></canvas>
            </div>
          </div>

          {/* Radar Chart */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-lg dark:border-zinc-700 dark:bg-zinc-800">
            <div className="h-80">
              <canvas ref={radarChartRef}></canvas>
            </div>
          </div>
        </div>

        {/* Top Students Table */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-lg dark:border-zinc-700 dark:bg-zinc-800">
          <h3 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            🏆 Top 10 Students This Month
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-zinc-200 dark:border-zinc-700">
                <tr className="text-left">
                  <th className="pb-3 font-semibold text-zinc-700 dark:text-zinc-300">Rank</th>
                  <th className="pb-3 font-semibold text-zinc-700 dark:text-zinc-300">Student Name</th>
                  <th className="pb-3 font-semibold text-zinc-700 dark:text-zinc-300">Class</th>
                  <th className="pb-3 font-semibold text-zinc-700 dark:text-zinc-300">Average Score</th>
                  <th className="pb-3 font-semibold text-zinc-700 dark:text-zinc-300">Improvement</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700">
                {[
                  { rank: 1, name: 'Alice Johnson', class: '10-A', score: 98.5, improvement: '+5.2%' },
                  { rank: 2, name: 'Bob Smith', class: '10-B', score: 97.8, improvement: '+3.8%' },
                  { rank: 3, name: 'Carol Davis', class: '10-A', score: 96.9, improvement: '+4.1%' },
                  { rank: 4, name: 'David Wilson', class: '10-C', score: 96.2, improvement: '+6.5%' },
                  { rank: 5, name: 'Emma Brown', class: '10-B', score: 95.7, improvement: '+2.9%' },
                  { rank: 6, name: 'Frank Miller', class: '10-A', score: 95.3, improvement: '+4.7%' },
                  { rank: 7, name: 'Grace Lee', class: '10-C', score: 94.8, improvement: '+3.3%' },
                  { rank: 8, name: 'Henry Clark', class: '10-B', score: 94.5, improvement: '+5.8%' },
                  { rank: 9, name: 'Ivy Martinez', class: '10-A', score: 94.1, improvement: '+4.2%' },
                  { rank: 10, name: 'Jack Anderson', class: '10-C', score: 93.8, improvement: '+3.6%' },
                ].map((student) => (
                  <tr key={student.rank} className="hover:bg-zinc-50 dark:hover:bg-zinc-700/50">
                    <td className="py-3 text-zinc-600 dark:text-zinc-400">#{student.rank}</td>
                    <td className="py-3 font-medium text-zinc-900 dark:text-zinc-100">{student.name}</td>
                    <td className="py-3 text-zinc-600 dark:text-zinc-400">{student.class}</td>
                    <td className="py-3 font-semibold text-indigo-600 dark:text-indigo-400">{student.score}%</td>
                    <td className="py-3 font-semibold text-emerald-600 dark:text-emerald-400">{student.improvement}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
