'use client';

import { useState } from 'react';
import { FileText, Download, BookOpen, Sparkles, CheckCircle } from 'lucide-react';
import { cbseData, getSubjects, getTopics } from './data/cbseData';
import MCQChatbot from './components/MCQChatbot';
import { generateMCQPDF } from './utils/mcqPDFGenerator';

export default function DashboardAssignmentsPage() {
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [showChatbot, setShowChatbot] = useState(false);
  const [generatedMCQs, setGeneratedMCQs] = useState('');
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const subjects = selectedClass ? getSubjects(selectedClass) : [];
  const topics = selectedClass && selectedSubject ? getTopics(selectedSubject, selectedClass) : [];

  const handleStartGeneration = () => {
    if (selectedClass && selectedSubject && selectedTopic) {
      setShowChatbot(true);
      setGeneratedMCQs('');
    }
  };

  const handleMCQGenerated = (mcqs) => {
    setGeneratedMCQs(mcqs);
  };

  const handleGeneratePDF = async () => {
    if (!generatedMCQs) return;
    
    setIsGeneratingPDF(true);
    try {
      const classInfo = cbseData.classes.find(c => c.id === selectedClass)?.name || selectedClass;
      const doc = generateMCQPDF(generatedMCQs, classInfo, selectedSubject, selectedTopic);
      doc.save(`MCQ_${selectedClass}_${selectedSubject}_${selectedTopic.replace(/\s+/g, '_')}_${Date.now()}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleReset = () => {
    setSelectedClass('');
    setSelectedSubject('');
    setSelectedTopic('');
    setShowChatbot(false);
    setGeneratedMCQs('');
  };

  return (
    <div className="min-h-full space-y-8 p-6 lg:p-10">
      {/* Header */}
      <header className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-linear-to-br from-indigo-500 via-purple-500 to-pink-500 p-3 text-white shadow-lg">
            <FileText size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-semibold text-zinc-900 dark:text-white">
              AI MCQ Generator
            </h1>
            <p className="max-w-3xl text-sm text-zinc-600 dark:text-zinc-400">
              Create professional MCQ assessments for CBSE curriculum using AI. Select class, subject, and topic to get started.
            </p>
          </div>
        </div>
      </header>

      {/* Configuration Section */}
      {!showChatbot ? (
        <div className="mx-auto max-w-5xl space-y-6">
          {/* Progress Indicator */}
          <div className="flex items-center justify-between rounded-2xl border border-zinc-200 bg-white/80 p-4 dark:border-zinc-800 dark:bg-zinc-900/80">
            <div className="flex items-center gap-2">
              <div className={`flex h-8 w-8 items-center justify-center rounded-full ${selectedClass ? 'bg-emerald-500 text-white' : 'bg-zinc-200 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-400'}`}>
                {selectedClass ? <CheckCircle size={16} /> : '1'}
              </div>
              <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Class</span>
            </div>
            <div className="h-px flex-1 bg-zinc-300 dark:bg-zinc-700" />
            <div className="flex items-center gap-2">
              <div className={`flex h-8 w-8 items-center justify-center rounded-full ${selectedSubject ? 'bg-emerald-500 text-white' : 'bg-zinc-200 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-400'}`}>
                {selectedSubject ? <CheckCircle size={16} /> : '2'}
              </div>
              <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Subject</span>
            </div>
            <div className="h-px flex-1 bg-zinc-300 dark:bg-zinc-700" />
            <div className="flex items-center gap-2">
              <div className={`flex h-8 w-8 items-center justify-center rounded-full ${selectedTopic ? 'bg-emerald-500 text-white' : 'bg-zinc-200 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-400'}`}>
                {selectedTopic ? <CheckCircle size={16} /> : '3'}
              </div>
              <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Topic</span>
            </div>
          </div>

          {/* Selection Cards */}
          <div className="grid gap-6 md:grid-cols-3">
            {/* Class Selection */}
            <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
              <div className="mb-4 flex items-center gap-2">
                <BookOpen className="text-indigo-500" size={20} />
                <h3 className="font-semibold text-zinc-900 dark:text-white">Select Class</h3>
              </div>
              <select
                value={selectedClass}
                onChange={(e) => {
                  setSelectedClass(e.target.value);
                  setSelectedSubject('');
                  setSelectedTopic('');
                }}
                className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              >
                <option value="">Choose class...</option>
                {cbseData.classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Subject Selection */}
            <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
              <div className="mb-4 flex items-center gap-2">
                <BookOpen className="text-purple-500" size={20} />
                <h3 className="font-semibold text-zinc-900 dark:text-white">Select Subject</h3>
              </div>
              <select
                value={selectedSubject}
                onChange={(e) => {
                  setSelectedSubject(e.target.value);
                  setSelectedTopic('');
                }}
                disabled={!selectedClass}
                className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              >
                <option value="">Choose subject...</option>
                {subjects.map((subject) => (
                  <option key={subject} value={subject}>
                    {subject}
                  </option>
                ))}
              </select>
            </div>

            {/* Topic Selection */}
            <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
              <div className="mb-4 flex items-center gap-2">
                <BookOpen className="text-pink-500" size={20} />
                <h3 className="font-semibold text-zinc-900 dark:text-white">Select Topic</h3>
              </div>
              <select
                value={selectedTopic}
                onChange={(e) => setSelectedTopic(e.target.value)}
                disabled={!selectedSubject}
                className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-200 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              >
                <option value="">Choose topic...</option>
                {topics.map((topic) => (
                  <option key={topic} value={topic}>
                    {topic}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Start Button */}
          {selectedClass && selectedSubject && selectedTopic && (
            <div className="flex justify-center">
              <button
                onClick={handleStartGeneration}
                className="flex items-center gap-3 rounded-2xl bg-linear-to-r from-indigo-500 via-purple-500 to-pink-500 px-8 py-4 text-lg font-semibold text-white shadow-lg transition hover:shadow-indigo-400/40"
              >
                <Sparkles size={24} />
                Start MCQ Generation
              </button>
            </div>
          )}

          {/* Info Cards */}
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-indigo-200 bg-indigo-50 p-4 dark:border-indigo-900 dark:bg-indigo-900/20">
              <p className="text-sm font-semibold text-indigo-900 dark:text-indigo-100">
                AI-Powered
              </p>
              <p className="mt-1 text-xs text-indigo-700 dark:text-indigo-300">
                Questions generated using advanced AI following CBSE curriculum
              </p>
            </div>
            <div className="rounded-2xl border border-purple-200 bg-purple-50 p-4 dark:border-purple-900 dark:bg-purple-900/20">
              <p className="text-sm font-semibold text-purple-900 dark:text-purple-100">
                Instant PDF
              </p>
              <p className="mt-1 text-xs text-purple-700 dark:text-purple-300">
                Download professional PDFs with answer keys instantly
              </p>
            </div>
            <div className="rounded-2xl border border-pink-200 bg-pink-50 p-4 dark:border-pink-900 dark:bg-pink-900/20">
              <p className="text-sm font-semibold text-pink-900 dark:text-pink-100">
                Customizable
              </p>
              <p className="mt-1 text-xs text-pink-700 dark:text-pink-300">
                Choose difficulty, number of questions, and focus areas
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* Chatbot Section */
        <div className="mx-auto max-w-6xl space-y-6">
          {/* Selection Summary */}
          <div className="rounded-2xl border border-zinc-200 bg-linear-to-r from-indigo-50 via-purple-50 to-pink-50 p-4 dark:border-zinc-800 dark:from-indigo-950/30 dark:via-purple-950/30 dark:to-pink-950/30">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-4">
                <div className="rounded-xl bg-white px-4 py-2 shadow-sm dark:bg-zinc-900">
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">Class</p>
                  <p className="font-semibold text-zinc-900 dark:text-white">
                    {cbseData.classes.find(c => c.id === selectedClass)?.name}
                  </p>
                </div>
                <div className="rounded-xl bg-white px-4 py-2 shadow-sm dark:bg-zinc-900">
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">Subject</p>
                  <p className="font-semibold text-zinc-900 dark:text-white">{selectedSubject}</p>
                </div>
                <div className="rounded-xl bg-white px-4 py-2 shadow-sm dark:bg-zinc-900">
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">Topic</p>
                  <p className="font-semibold text-zinc-900 dark:text-white">{selectedTopic}</p>
                </div>
              </div>
              <button
                onClick={handleReset}
                className="rounded-xl border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-white dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900"
              >
                Change Selection
              </button>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
            {/* Chatbot */}
            <MCQChatbot
              selectedClass={cbseData.classes.find(c => c.id === selectedClass)?.name || ''}
              selectedSubject={selectedSubject}
              selectedTopic={selectedTopic}
              onGenerate={handleMCQGenerated}
            />

            {/* Actions Panel */}
            <div className="space-y-4">
              <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
                <h3 className="mb-4 font-semibold text-zinc-900 dark:text-white">Actions</h3>
                
                <button
                  onClick={handleGeneratePDF}
                  disabled={!generatedMCQs || isGeneratingPDF}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-linear-to-r from-emerald-500 to-teal-600 px-4 py-3 font-semibold text-white shadow-lg transition hover:shadow-emerald-400/40 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isGeneratingPDF ? (
                    <>
                      <Download className="animate-bounce" size={18} />
                      <span>Generating...</span>
                    </>
                  ) : (
                    <>
                      <Download size={18} />
                      <span>Generate PDF</span>
                    </>
                  )}
                </button>

                <div className="mt-4 rounded-xl bg-zinc-50 p-4 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                  <p className="font-semibold">Tips:</p>
                  <ul className="mt-2 space-y-1">
                    <li>• Specify number of questions</li>
                    <li>• Mention difficulty level</li>
                    <li>• Ask for specific subtopics</li>
                    <li>• Request variety in question types</li>
                  </ul>
                </div>
              </div>

              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900 dark:bg-emerald-900/20">
                <p className="text-sm font-semibold text-emerald-900 dark:text-emerald-100">
                  CBSE Compliant
                </p>
                <p className="mt-2 text-xs text-emerald-700 dark:text-emerald-300">
                  All MCQs are generated following CBSE curriculum guidelines and standards.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
