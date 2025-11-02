'use client';

import { useState } from 'react';
import { Download, FileText, Users, User, Loader2 } from 'lucide-react';
import ReportTemplateSelector, { reportTemplates } from './ReportTemplateSelector';
import { generateClassReport } from '../utils/classReportGenerator';
import { generateStudentReport } from '../utils/studentReportGenerator';

export default function ReportGenerator() {
  const [reportType, setReportType] = useState('class');
  const [selectedClass, setSelectedClass] = useState('10-A');
  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState(reportTemplates[0]);
  const [isGenerating, setIsGenerating] = useState(false);

  const classes = ['10-A', '10-B', '10-C', '9-A', '9-B', '9-C', '8-A', '8-B', '8-C'];
  const students = [
    { id: '1', name: 'Alice Johnson', class: '10-A' },
    { id: '2', name: 'Bob Smith', class: '10-B' },
    { id: '3', name: 'Carol Davis', class: '10-A' },
    { id: '4', name: 'David Wilson', class: '10-C' },
    { id: '5', name: 'Emma Brown', class: '10-B' },
  ];

  const handleGenerateClassReport = async () => {
    setIsGenerating(true);
    
    try {
      const doc = await generateClassReport(selectedClass, selectedTemplate);
      doc.save(`Class_${selectedClass}_Report_${Date.now()}.pdf`);
    } catch (error) {
      console.error('Error generating class report:', error);
      alert('Failed to generate report. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateStudentReport = async () => {
    setIsGenerating(true);
    
    try {
      const student = students.find(s => s.id === selectedStudent);
      if (!student) return;

      const doc = await generateStudentReport(student, selectedTemplate);
      doc.save(`${student.name.replace(/\s+/g, '_')}_Report_${Date.now()}.pdf`);
    } catch (error) {
      console.error('Error generating student report:', error);
      alert('Failed to generate report. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Report Type Selection */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-lg dark:border-zinc-700 dark:bg-zinc-800">
          <h3 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            Select Report Type
          </h3>
          
          <div className="grid gap-4 sm:grid-cols-2">
            <button
              onClick={() => setReportType('class')}
              className={`flex items-center gap-4 rounded-xl border-2 p-6 transition ${
                reportType === 'class'
                  ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                  : 'border-zinc-200 hover:border-indigo-300 dark:border-zinc-700'
              }`}
            >
              <div className={`rounded-xl p-3 ${
                reportType === 'class'
                  ? 'bg-indigo-500 text-white'
                  : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300'
              }`}>
                <Users size={24} />
              </div>
              <div className="text-left">
                <h4 className="font-semibold text-zinc-900 dark:text-zinc-100">Class Report</h4>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Generate report for entire class
                </p>
              </div>
            </button>

            <button
              onClick={() => setReportType('student')}
              className={`flex items-center gap-4 rounded-xl border-2 p-6 transition ${
                reportType === 'student'
                  ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                  : 'border-zinc-200 hover:border-emerald-300 dark:border-zinc-700'
              }`}
            >
              <div className={`rounded-xl p-3 ${
                reportType === 'student'
                  ? 'bg-emerald-500 text-white'
                  : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300'
              }`}>
                <User size={24} />
              </div>
              <div className="text-left">
                <h4 className="font-semibold text-zinc-900 dark:text-zinc-100">Student Report</h4>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Generate report for individual student
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* Template Selector */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-lg dark:border-zinc-700 dark:bg-zinc-800">
          <ReportTemplateSelector
            selectedTemplate={selectedTemplate}
            onSelect={setSelectedTemplate}
            reportType={reportType}
          />
        </div>

        {/* Class Report Form */}
        {reportType === 'class' && (
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-lg dark:border-zinc-700 dark:bg-zinc-800">
            <h3 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              Class Report Configuration
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Select Class
                </label>
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100"
                >
                  {classes.map((cls) => (
                    <option key={cls} value={cls}>
                      Class {cls}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleGenerateClassReport}
                disabled={isGenerating}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-linear-to-r from-indigo-500 via-purple-500 to-pink-500 px-6 py-3 font-semibold text-white shadow-lg transition hover:shadow-indigo-400/30 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    <span>Generating Report...</span>
                  </>
                ) : (
                  <>
                    <Download size={20} />
                    <span>Download Class Report</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Student Report Form */}
        {reportType === 'student' && (
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-lg dark:border-zinc-700 dark:bg-zinc-800">
            <h3 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              Student Report Configuration
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Select Student
                </label>
                <select
                  value={selectedStudent}
                  onChange={(e) => setSelectedStudent(e.target.value)}
                  className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100"
                >
                  <option value="">-- Select a student --</option>
                  {students.map((student) => (
                    <option key={student.id} value={student.id}>
                      {student.name} - Class {student.class}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleGenerateStudentReport}
                disabled={!selectedStudent || isGenerating}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-linear-to-r from-emerald-500 via-teal-500 to-sky-500 px-6 py-3 font-semibold text-white shadow-lg transition hover:shadow-emerald-400/30 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    <span>Generating Report...</span>
                  </>
                ) : (
                  <>
                    <Download size={20} />
                    <span>Download Student Report</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Report Preview Info */}
        <div className="rounded-2xl border border-indigo-200 bg-indigo-50 p-6 dark:border-indigo-900 dark:bg-indigo-900/20">
          <div className="flex items-start gap-3">
            <FileText className="mt-1 text-indigo-600 dark:text-indigo-400" size={20} />
            <div>
              <h4 className="font-semibold text-indigo-900 dark:text-indigo-100">
                Report Contents
              </h4>
              <ul className="mt-2 space-y-1 text-sm text-indigo-700 dark:text-indigo-300">
                <li>• Detailed performance analytics with color themes</li>
                <li>• Subject-wise breakdowns and charts</li>
                <li>• Attendance records and trends</li>
                <li>• Teacher comments and recommendations</li>
                <li>• Skills assessment matrix</li>
                <li>• Professional formatting with logo and pagination</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
