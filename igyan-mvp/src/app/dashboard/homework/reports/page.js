'use client';

import { useState, useEffect } from 'react';
import { BarChart3, Download, TrendingUp, Award, FileText, Brain, Target, Lightbulb, FileSpreadsheet } from 'lucide-react';
import { useAuth } from '../../../utils/auth_context';
import { supabase } from '../../../utils/supabase';

export default function HomeworkReports() {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [aiReport, setAiReport] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (user?.school_id) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    if (!user?.school_id) return;

    const isTeacher = ['super_admin', 'co_admin', 'faculty'].includes(user?.role);

    // Fetch submissions from Supabase
    let submissionsQuery = supabase
      .from('homework_submissions')
      .select('*')
      .eq('school_id', user.school_id)
      .order('submitted_at', { ascending: false });

    // Students see only their submissions
    if (!isTeacher) {
      submissionsQuery = submissionsQuery.eq('student_id', user.id);
    }

    const { data: submissionsData, error: submissionsError } = await submissionsQuery;

    // Fetch assignments
    const { data: assignmentsData, error: assignmentsError } = await supabase
      .from('homework_assignments')
      .select('*')
      .eq('school_id', user.school_id);

    if (!submissionsError && submissionsData) {
      setSubmissions(submissionsData);
    }
    if (!assignmentsError && assignmentsData) {
      setAssignments(assignmentsData);
    }
  };

  const generateAIReport = async (submission) => {
    setIsGenerating(true);
    setSelectedSubmission(submission);

    const assignment = assignments.find(a => a.id === submission.assignment_id);

    // Simulate AI analysis (In production, call ChatGPT API)
    setTimeout(() => {
      const report = {
        overall_score: submission.score,
        grade: getGrade(submission.score),
        strengths: generateStrengths(submission, assignment),
        improvements: generateImprovements(submission, assignment),
        detailed_analysis: generateDetailedAnalysis(submission, assignment),
        recommendations: generateRecommendations(submission, assignment),
        time_management: Math.floor(Math.random() * 5) + 6, // 6-10 scale
        understanding_level: Math.floor(Math.random() * 3) + 7, // 7-9 scale
      };

      setAiReport(report);
      setIsGenerating(false);
    }, 2000);
  };

  const getGrade = (score) => {
    if (score >= 90) return 'A+';
    if (score >= 80) return 'A';
    if (score >= 70) return 'B+';
    if (score >= 60) return 'B';
    if (score >= 50) return 'C';
    return 'D';
  };

  const generateStrengths = (submission, assignment) => {
    const strengths = [];
    if (submission.score >= 80) {
      strengths.push('Excellent grasp of fundamental concepts');
      strengths.push('Strong analytical thinking demonstrated');
    } else if (submission.score >= 60) {
      strengths.push('Good understanding of core topics');
      strengths.push('Consistent effort in answering questions');
    } else {
      strengths.push('Completed the assignment on time');
      strengths.push('Shows potential for improvement');
    }
    return strengths;
  };

  const generateImprovements = (submission, assignment) => {
    const improvements = [];
    if (submission.score < 80) {
      improvements.push('Review fundamental concepts more thoroughly');
      improvements.push('Practice more problems in weak areas');
    }
    if (submission.type === 'viva') {
      improvements.push('Provide more detailed explanations');
      improvements.push('Use technical terminology appropriately');
    }
    if (submission.score < 50) {
      improvements.push('Seek additional help from teacher');
      improvements.push('Allocate more study time for this subject');
    }
    return improvements;
  };

  const generateDetailedAnalysis = (submission, assignment) => {
    if (submission.type === 'mcq') {
      const total = assignment?.mcq_questions?.length || 0;
      const correct = Math.round((submission.score / 100) * total);
      return `Student answered ${correct} out of ${total} questions correctly. ${
        submission.score >= 75 
          ? 'Shows strong command over the subject matter with minimal errors.'
          : 'There is room for improvement in understanding key concepts. Recommend focused revision.'
      }`;
    } else {
      return `Virtual viva responses demonstrate ${
        submission.score >= 75
          ? 'excellent communication skills and subject knowledge'
          : 'basic understanding but needs more practice in articulating answers clearly'
      }. ${
        submission.score >= 60
          ? 'Keep up the good work and continue practicing.'
          : 'Consider reviewing the topics and practicing speaking on these subjects.'
      }`;
    }
  };

  const generateRecommendations = (submission, assignment) => {
    const recommendations = [];
    
    if (submission.type === 'mcq') {
      recommendations.push('Review incorrect answers and understand why other options were wrong');
      recommendations.push('Create flashcards for important concepts');
      recommendations.push('Take practice tests to improve speed and accuracy');
    } else {
      recommendations.push('Practice explaining concepts out loud daily');
      recommendations.push('Record yourself and listen to improve articulation');
      recommendations.push('Discuss topics with peers to build confidence');
    }

    if (submission.score < 60) {
      recommendations.push('Schedule one-on-one sessions with teacher');
      recommendations.push('Form a study group with classmates');
    }

    return recommendations;
  };

  const downloadReport = () => {
    if (!aiReport || !selectedSubmission) return;

    const assignment = assignments.find(a => a.id === selectedSubmission.assignment_id);
    
    const reportText = `
AI HOMEWORK REPORT
==================

Student: ${selectedSubmission.student_name}
Assignment: ${assignment?.title}
Subject: ${assignment?.subject}
Type: ${selectedSubmission.type.toUpperCase()}
Submitted: ${new Date(selectedSubmission.submitted_at).toLocaleString()}

PERFORMANCE SUMMARY
-------------------
Overall Score: ${aiReport.overall_score.toFixed(1)}%
Grade: ${aiReport.grade}
Marks Obtained: ${selectedSubmission.marks_obtained || 0} / ${selectedSubmission.max_marks || 0}
Time Management: ${aiReport.time_management}/10
Understanding Level: ${aiReport.understanding_level}/10

DETAILED ANALYSIS
-----------------
${aiReport.detailed_analysis}

STRENGTHS
---------
${aiReport.strengths.map((s, i) => `${i + 1}. ${s}`).join('\n')}

AREAS FOR IMPROVEMENT
---------------------
${aiReport.improvements.map((s, i) => `${i + 1}. ${s}`).join('\n')}

RECOMMENDATIONS
---------------
${aiReport.recommendations.map((s, i) => `${i + 1}. ${s}`).join('\n')}

---
Generated by IGYAAN AI Assistant
`;

    const blob = new Blob([reportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${selectedSubmission.student_name}_${assignment?.title}_Report.txt`;
    link.click();
  };

  const exportToExcel = () => {
    if (submissions.length === 0) {
      alert('No submissions to export');
      return;
    }

    // Create CSV content
    const headers = ['Student Name', 'Assignment', 'Subject', 'Type', 'Score (%)', 'Marks Obtained', 'Max Marks', 'Grade', 'Submitted At'];
    
    const rows = submissions.map(sub => {
      const assignment = assignments.find(a => a.id === sub.assignment_id);
      const grade = getGrade(parseFloat(sub.score || 0));
      
      return [
        sub.student_name || 'N/A',
        assignment?.title || 'N/A',
        assignment?.subject || 'N/A',
        sub.type.toUpperCase(),
        (sub.score || 0).toFixed(2),
        (sub.marks_obtained || 0).toFixed(2),
        sub.max_marks || 0,
        grade,
        new Date(sub.submitted_at).toLocaleString()
      ];
    });

    // Convert to CSV
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    // Download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `homework_report_${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex h-screen w-full flex-col gap-6 overflow-hidden bg-linear-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 lg:p-8 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
      {/* Header */}
      <header className="rounded-3xl border border-white/60 bg-white/80 p-6 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-zinc-900/80">
        <div className="flex items-start gap-4">
          <span className="rounded-2xl bg-linear-to-r from-blue-500 via-indigo-500 to-purple-500 p-4 text-white shadow-lg">
            <BarChart3 size={28} />
          </span>
          <div className="flex-1">
            <h1 className="text-3xl font-bold tracking-tight text-zinc-800 dark:text-zinc-100 sm:text-4xl">
              AI Homework Reports
            </h1>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400 sm:text-base">
              AI-powered analysis and insights on homework performance
            </p>
          </div>
          <button
            onClick={exportToExcel}
            disabled={submissions.length === 0}
            className="flex items-center gap-2 rounded-xl bg-green-600 px-4 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FileSpreadsheet size={20} />
            Export to Excel
          </button>
        </div>

        {/* Stats */}
        <div className="mt-4 grid gap-4 sm:grid-cols-4">
          <div className="rounded-xl border border-blue-200 bg-blue-50 p-3 dark:border-blue-900 dark:bg-blue-950">
            <p className="text-xs font-semibold text-blue-600 dark:text-blue-400">Total Submissions</p>
            <p className="mt-1 text-2xl font-bold text-blue-900 dark:text-blue-100">{submissions.length}</p>
          </div>
          <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-3 dark:border-indigo-900 dark:bg-indigo-950">
            <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">Average Score</p>
            <p className="mt-1 text-2xl font-bold text-indigo-900 dark:text-indigo-100">
              {submissions.length > 0 ? (submissions.reduce((sum, s) => sum + s.score, 0) / submissions.length).toFixed(1) : 0}%
            </p>
          </div>
          <div className="rounded-xl border border-purple-200 bg-purple-50 p-3 dark:border-purple-900 dark:bg-purple-950">
            <p className="text-xs font-semibold text-purple-600 dark:text-purple-400">MCQ Tests</p>
            <p className="mt-1 text-2xl font-bold text-purple-900 dark:text-purple-100">
              {submissions.filter(s => s.type === 'mcq').length}
            </p>
          </div>
          <div className="rounded-xl border border-pink-200 bg-pink-50 p-3 dark:border-pink-900 dark:bg-pink-950">
            <p className="text-xs font-semibold text-pink-600 dark:text-pink-400">Viva Tests</p>
            <p className="mt-1 text-2xl font-bold text-pink-900 dark:text-pink-100">
              {submissions.filter(s => s.type === 'viva').length}
            </p>
          </div>
        </div>
      </header>

      <div className="flex flex-1 gap-6 overflow-hidden">
        {/* Submissions List */}
        <div className="w-96 overflow-y-auto rounded-3xl border border-white/60 bg-white/80 p-6 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-zinc-900/80">
          <h3 className="mb-4 text-lg font-bold text-zinc-800 dark:text-zinc-100">Submissions</h3>
          
          {submissions.length > 0 ? (
            <div className="space-y-3">
              {submissions.map((submission) => {
                const assignment = assignments.find(a => a.id === submission.assignment_id);
                return (
                  <button
                    key={submission.id}
                    onClick={() => generateAIReport(submission)}
                    className={`w-full rounded-xl border p-4 text-left transition ${
                      selectedSubmission?.id === submission.id
                        ? 'border-blue-500 bg-blue-50 dark:border-blue-500 dark:bg-blue-950'
                        : 'border-zinc-200 bg-white hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800'
                    }`}
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <span className="font-semibold text-zinc-800 dark:text-zinc-100">
                        {assignment?.title || 'Unknown'}
                      </span>
                      <span className={`text-xs font-bold ${
                        submission.score >= 80 ? 'text-green-600' :
                        submission.score >= 60 ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {submission.score.toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400">
                      {submission.type === 'mcq' ? <FileText size={12} /> : <Brain size={12} />}
                      <span>{submission.type.toUpperCase()}</span>
                      <span>•</span>
                      <span>{new Date(submission.submitted_at).toLocaleDateString()}</span>
                    </div>
                    <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-zinc-600 dark:text-zinc-400">
                      <div>
                        <span className="font-semibold">Score:</span> {(submission.score || 0).toFixed(1)}%
                      </div>
                      <div>
                        <span className="font-semibold">Marks:</span> {(submission.marks_obtained || 0).toFixed(1)}/{submission.max_marks || 0}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <p className="text-center text-sm text-zinc-500">No submissions yet</p>
          )}
        </div>

        {/* Report Display */}
        <div className="flex-1 overflow-y-auto rounded-3xl border border-white/60 bg-white/80 p-6 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-zinc-900/80">
          {isGenerating ? (
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <div className="mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600"></div>
                <p className="text-zinc-600 dark:text-zinc-400">Generating AI Report...</p>
              </div>
            </div>
          ) : aiReport && selectedSubmission ? (
            <div>
              {/* Header */}
              <div className="mb-6 flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-zinc-800 dark:text-zinc-100">
                    AI Performance Report
                  </h2>
                  <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                    {selectedSubmission.student_name} • {assignments.find(a => a.id === selectedSubmission.assignment_id)?.title}
                  </p>
                </div>
                <button
                  onClick={downloadReport}
                  className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  <Download size={16} />
                  Download
                </button>
              </div>

              {/* Score Card */}
              <div className="mb-6 grid gap-4 sm:grid-cols-5">
                <div className="rounded-xl border-2 border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950">
                  <Award className="mb-2 text-blue-600 dark:text-blue-400" size={24} />
                  <p className="text-xs font-semibold text-blue-600 dark:text-blue-400">Overall Score</p>
                  <p className="mt-1 text-3xl font-bold text-blue-900 dark:text-blue-100">{aiReport.overall_score.toFixed(1)}%</p>
                </div>
                <div className="rounded-xl border-2 border-indigo-200 bg-indigo-50 p-4 dark:border-indigo-900 dark:bg-indigo-950">
                  <Target className="mb-2 text-indigo-600 dark:text-indigo-400" size={24} />
                  <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">Grade</p>
                  <p className="mt-1 text-3xl font-bold text-indigo-900 dark:text-indigo-100">{aiReport.grade}</p>
                </div>
                <div className="rounded-xl border-2 border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900 dark:bg-emerald-950">
                  <FileText className="mb-2 text-emerald-600 dark:text-emerald-400" size={24} />
                  <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Marks</p>
                  <p className="mt-1 text-2xl font-bold text-emerald-900 dark:text-emerald-100">{(selectedSubmission.marks_obtained || 0).toFixed(1)}/{selectedSubmission.max_marks || 0}</p>
                </div>
                <div className="rounded-xl border-2 border-purple-200 bg-purple-50 p-4 dark:border-purple-900 dark:bg-purple-950">
                  <TrendingUp className="mb-2 text-purple-600 dark:text-purple-400" size={24} />
                  <p className="text-xs font-semibold text-purple-600 dark:text-purple-400">Time Management</p>
                  <p className="mt-1 text-3xl font-bold text-purple-900 dark:text-purple-100">{aiReport.time_management}/10</p>
                </div>
                <div className="rounded-xl border-2 border-pink-200 bg-pink-50 p-4 dark:border-pink-900 dark:bg-pink-950">
                  <Brain className="mb-2 text-pink-600 dark:text-pink-400" size={24} />
                  <p className="text-xs font-semibold text-pink-600 dark:text-pink-400">Understanding</p>
                  <p className="mt-1 text-3xl font-bold text-pink-900 dark:text-pink-100">{aiReport.understanding_level}/10</p>
                </div>
              </div>

              {/* Detailed Analysis */}
              <div className="mb-6 rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-700 dark:bg-zinc-900">
                <h3 className="mb-3 flex items-center gap-2 text-lg font-bold text-zinc-800 dark:text-zinc-100">
                  <FileText size={20} className="text-blue-600" />
                  Detailed Analysis
                </h3>
                <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">{aiReport.detailed_analysis}</p>
              </div>

              {/* Strengths */}
              <div className="mb-6 rounded-xl border border-green-200 bg-green-50 p-5 dark:border-green-900 dark:bg-green-950">
                <h3 className="mb-3 flex items-center gap-2 text-lg font-bold text-green-900 dark:text-green-100">
                  <TrendingUp size={20} className="text-green-600" />
                  Strengths
                </h3>
                <ul className="space-y-2">
                  {aiReport.strengths.map((strength, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-green-800 dark:text-green-200">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-green-600"></span>
                      <span>{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Improvements */}
              <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-5 dark:border-amber-900 dark:bg-amber-950">
                <h3 className="mb-3 flex items-center gap-2 text-lg font-bold text-amber-900 dark:text-amber-100">
                  <Target size={20} className="text-amber-600" />
                  Areas for Improvement
                </h3>
                <ul className="space-y-2">
                  {aiReport.improvements.map((improvement, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-amber-800 dark:text-amber-200">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-amber-600"></span>
                      <span>{improvement}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Recommendations */}
              <div className="rounded-xl border border-blue-200 bg-blue-50 p-5 dark:border-blue-900 dark:bg-blue-950">
                <h3 className="mb-3 flex items-center gap-2 text-lg font-bold text-blue-900 dark:text-blue-100">
                  <Lightbulb size={20} className="text-blue-600" />
                  Recommendations
                </h3>
                <ul className="space-y-2">
                  {aiReport.recommendations.map((recommendation, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-blue-800 dark:text-blue-200">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-blue-600"></span>
                      <span>{recommendation}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <div className="flex h-full items-center justify-center text-center text-zinc-500">
              <div>
                <Brain size={64} className="mx-auto mb-4 text-zinc-300" />
                <p className="font-semibold">Select a submission to generate AI report</p>
                <p className="mt-2 text-sm">Click on any submission from the list</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
