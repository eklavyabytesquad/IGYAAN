'use client';

import { useState } from 'react';
import { FileQuestion, Upload, Sparkles, Download, History, Wand2, Loader2, Copy, CheckCircle } from 'lucide-react';
import { cbseData, getSubjects, getTopics } from '../assignments/data/cbseData';
import { generateQuestionPaperPDF } from './utils/questionPaperPDFGenerator';

export default function QuestionPaperGeneratorPage() {
  const [activeTab, setActiveTab] = useState('new'); // 'new' or 'old-data'
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [oldContent, setOldContent] = useState('');
  const [customPrompt, setCustomPrompt] = useState('');
  const [generatedPaper, setGeneratedPaper] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [examDuration, setExamDuration] = useState('3');
  const [totalMarks, setTotalMarks] = useState('100');

  const subjects = selectedClass ? getSubjects(selectedClass) : [];
  const topics = selectedClass && selectedSubject ? getTopics(selectedSubject, selectedClass) : [];

  const handleStartGeneration = async () => {
    setIsGenerating(true);
    setGeneratedPaper('');
    
    try {
      let prompt = '';
      
      if (activeTab === 'new') {
        const classInfo = cbseData.classes.find(c => c.id === selectedClass)?.name || selectedClass;
        prompt = `Generate a comprehensive CBSE question paper with the following details:
- Class: ${classInfo}
- Subject: ${selectedSubject}
- Topic: ${selectedTopic}
- Exam Duration: ${examDuration} hours
- Total Marks: ${totalMarks}

Create a professional question paper with:
1. Proper sections (VSA, SA, LA, or appropriate sections)
2. Clear question numbering
3. Marks allocation for each question
4. Instructions for students
5. CBSE pattern compliance
6. Mix of remembering, understanding, and application level questions

Format the output as a complete question paper ready for printing.`;
      } else {
        prompt = `Based on the following old question paper content, ${customPrompt}

Old Question Paper:
${oldContent}

Generate a new question paper following CBSE format with proper sections, marks, and instructions.`;
      }

      const response = await fetch('/api/generate-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });

      if (!response.ok) throw new Error('Failed to generate question paper');

      const data = await response.json();
      setGeneratedPaper(data.content || data.questions || '');
    } catch (error) {
      console.error('Error generating question paper:', error);
      alert('Failed to generate question paper. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGeneratePDF = async () => {
    if (!generatedPaper) return;
    
    setIsGeneratingPDF(true);
    try {
      const classInfo = activeTab === 'new' 
        ? cbseData.classes.find(c => c.id === selectedClass)?.name || selectedClass
        : 'Custom';
      const doc = generateQuestionPaperPDF(
        generatedPaper,
        classInfo,
        selectedSubject || 'Various Subjects',
        selectedTopic || 'Various Topics',
        examDuration,
        totalMarks
      );
      doc.save(`QuestionPaper_${Date.now()}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleCopyContent = () => {
    if (!generatedPaper) return;
    
    navigator.clipboard.writeText(generatedPaper);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleReset = () => {
    setSelectedClass('');
    setSelectedSubject('');
    setSelectedTopic('');
    setOldContent('');
    setCustomPrompt('');
    setGeneratedPaper('');
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setOldContent(event.target.result);
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="min-h-full space-y-8 p-6 lg:p-10">
      {/* Header */}
      <header className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="rounded-2xl bg-linear-to-br from-blue-500 via-indigo-500 to-purple-600 p-3 text-white shadow-xl">
            <FileQuestion size={32} />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-zinc-900 dark:text-white">
              AI Question Paper Generator
            </h1>
            <p className="mt-1 max-w-3xl text-sm text-zinc-600 dark:text-zinc-400">
              Create professional CBSE question papers with AI. Generate from scratch or use old question papers as reference.
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        {!generatedPaper && (
          <div className="flex items-center gap-3 rounded-2xl border border-zinc-200 bg-white/80 p-2 dark:border-zinc-800 dark:bg-zinc-900/80">
            <button
              onClick={() => {
                setActiveTab('new');
                setGeneratedPaper('');
              }}
              className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold transition ${
                activeTab === 'new'
                  ? 'bg-linear-to-r from-blue-500 to-indigo-600 text-white shadow-lg'
                  : 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800'
              }`}
            >
              <Wand2 size={18} />
              Generate New Paper
            </button>
            <button
              onClick={() => {
                setActiveTab('old-data');
                setGeneratedPaper('');
              }}
              className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold transition ${
                activeTab === 'old-data'
                  ? 'bg-linear-to-r from-purple-500 to-pink-600 text-white shadow-lg'
                  : 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800'
              }`}
            >
              <History size={18} />
              Use Old Question Papers
            </button>
          </div>
        )}
      </header>

      {/* Content Area */}
      {!generatedPaper ? (
        <div className="mx-auto max-w-6xl space-y-6">
          {/* New Paper Generation */}
          {activeTab === 'new' && (
            <div className="space-y-6">
              {/* Configuration Grid */}
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {/* Class Selection */}
                <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
                  <label className="mb-3 flex items-center gap-2 text-sm font-semibold text-zinc-900 dark:text-white">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500 text-xs text-white">1</span>
                    Select Class
                  </label>
                  <select
                    value={selectedClass}
                    onChange={(e) => {
                      setSelectedClass(e.target.value);
                      setSelectedSubject('');
                      setSelectedTopic('');
                    }}
                    className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
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
                  <label className="mb-3 flex items-center gap-2 text-sm font-semibold text-zinc-900 dark:text-white">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-500 text-xs text-white">2</span>
                    Select Subject
                  </label>
                  <select
                    value={selectedSubject}
                    onChange={(e) => {
                      setSelectedSubject(e.target.value);
                      setSelectedTopic('');
                    }}
                    disabled={!selectedClass}
                    className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
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
                  <label className="mb-3 flex items-center gap-2 text-sm font-semibold text-zinc-900 dark:text-white">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-500 text-xs text-white">3</span>
                    Select Topic
                  </label>
                  <select
                    value={selectedTopic}
                    onChange={(e) => setSelectedTopic(e.target.value)}
                    disabled={!selectedSubject}
                    className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                  >
                    <option value="">Choose topic...</option>
                    {topics.map((topic) => (
                      <option key={topic} value={topic}>
                        {topic}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Exam Duration */}
                <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
                  <label className="mb-3 block text-sm font-semibold text-zinc-900 dark:text-white">
                    Exam Duration (hours)
                  </label>
                  <input
                    type="number"
                    value={examDuration}
                    onChange={(e) => setExamDuration(e.target.value)}
                    min="1"
                    max="5"
                    className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                  />
                </div>

                {/* Total Marks */}
                <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
                  <label className="mb-3 block text-sm font-semibold text-zinc-900 dark:text-white">
                    Total Marks
                  </label>
                  <input
                    type="number"
                    value={totalMarks}
                    onChange={(e) => setTotalMarks(e.target.value)}
                    min="10"
                    max="200"
                    className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                  />
                </div>
              </div>

              {/* Start Button */}
              {selectedClass && selectedSubject && selectedTopic && (
                <div className="flex justify-center">
                  <button
                    onClick={handleStartGeneration}
                    disabled={isGenerating}
                    className="flex items-center gap-3 rounded-2xl bg-linear-to-r from-blue-500 via-indigo-500 to-purple-600 px-10 py-4 text-lg font-bold text-white shadow-xl transition hover:scale-105 hover:shadow-2xl disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="animate-spin" size={24} />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles size={24} />
                        Generate Question Paper
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Old Data Based Generation */}
          {activeTab === 'old-data' && (
            <div className="space-y-6">
              <div className="grid gap-6 lg:grid-cols-2">
                {/* Old Content Input */}
                <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
                  <label className="mb-3 flex items-center justify-between text-sm font-semibold text-zinc-900 dark:text-white">
                    <span className="flex items-center gap-2">
                      <Upload className="text-purple-500" size={18} />
                      Old Question Paper Content
                    </span>
                    <label className="cursor-pointer rounded-lg bg-purple-100 px-3 py-1 text-xs font-medium text-purple-700 transition hover:bg-purple-200 dark:bg-purple-900/30 dark:text-purple-300">
                      <input
                        type="file"
                        accept=".txt,.doc,.docx"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      Upload File
                    </label>
                  </label>
                  <textarea
                    value={oldContent}
                    onChange={(e) => setOldContent(e.target.value)}
                    placeholder="Paste old question paper content here or upload a file...

Example:
Q1. What is photosynthesis?
Q2. Explain the water cycle.
Q3. Define Newton's first law of motion.
..."
                    className="h-80 w-full resize-none rounded-xl border border-zinc-300 bg-white p-4 text-sm text-zinc-900 placeholder-zinc-400 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                  />
                  <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
                    {oldContent.length} characters • {oldContent.split('\n').filter(l => l.trim()).length} lines
                  </p>
                </div>

                {/* Custom Prompt */}
                <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
                  <label className="mb-3 flex items-center gap-2 text-sm font-semibold text-zinc-900 dark:text-white">
                    <Wand2 className="text-indigo-500" size={18} />
                    Your Instructions
                  </label>
                  <textarea
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    placeholder="Tell AI how to generate the question paper...

Examples:
• 'Create a similar question paper for Class 10 with 20 questions'
• 'Make it harder with more application-based questions'
• 'Generate in the same format but for Biology'
• 'Create 3-hour exam paper with 100 marks'
• 'Include diagram-based questions'
..."
                    className="h-80 w-full resize-none rounded-xl border border-zinc-300 bg-white p-4 text-sm text-zinc-900 placeholder-zinc-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                  />
                  <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
                    Be specific about requirements, difficulty level, and format
                  </p>
                </div>
              </div>

              {/* Start Button */}
              {oldContent && customPrompt && (
                <div className="flex justify-center">
                  <button
                    onClick={handleStartGeneration}
                    disabled={isGenerating}
                    className="flex items-center gap-3 rounded-2xl bg-linear-to-r from-purple-500 via-pink-500 to-rose-600 px-10 py-4 text-lg font-bold text-white shadow-xl transition hover:scale-105 hover:shadow-2xl disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="animate-spin" size={24} />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles size={24} />
                        Generate from Old Data
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Info Cards */}
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5 dark:border-blue-900 dark:bg-blue-900/20">
              <div className="mb-2 flex items-center gap-2">
                <div className="rounded-lg bg-blue-500 p-2 text-white">
                  <Sparkles size={16} />
                </div>
                <p className="font-semibold text-blue-900 dark:text-blue-100">AI-Powered</p>
              </div>
              <p className="text-xs text-blue-700 dark:text-blue-300">
                Advanced AI generates CBSE-compliant question papers with proper marking schemes
              </p>
            </div>

            <div className="rounded-2xl border border-indigo-200 bg-indigo-50 p-5 dark:border-indigo-900 dark:bg-indigo-900/20">
              <div className="mb-2 flex items-center gap-2">
                <div className="rounded-lg bg-indigo-500 p-2 text-white">
                  <FileQuestion size={16} />
                </div>
                <p className="font-semibold text-indigo-900 dark:text-indigo-100">Professional Format</p>
              </div>
              <p className="text-xs text-indigo-700 dark:text-indigo-300">
                Download PDF with proper headers, instructions, and marking schemes
              </p>
            </div>

            <div className="rounded-2xl border border-purple-200 bg-purple-50 p-5 dark:border-purple-900 dark:bg-purple-900/20">
              <div className="mb-2 flex items-center gap-2">
                <div className="rounded-lg bg-purple-500 p-2 text-white">
                  <History size={16} />
                </div>
                <p className="font-semibold text-purple-900 dark:text-purple-100">Learn from Past</p>
              </div>
              <p className="text-xs text-purple-700 dark:text-purple-300">
                Use old question papers as templates to maintain consistency
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* Generated Content Section */
        <div className="mx-auto max-w-7xl space-y-6">
          {/* Summary Bar */}
          <div className="rounded-2xl border border-zinc-200 bg-linear-to-r from-blue-50 via-indigo-50 to-purple-50 p-4 dark:border-zinc-800 dark:from-blue-950/30 dark:via-indigo-950/30 dark:to-purple-950/30">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3">
                {activeTab === 'new' ? (
                  <>
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
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">Duration</p>
                      <p className="font-semibold text-zinc-900 dark:text-white">{examDuration}h / {totalMarks}M</p>
                    </div>
                  </>
                ) : (
                  <div className="rounded-xl bg-white px-4 py-2 shadow-sm dark:bg-zinc-900">
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">Mode</p>
                    <p className="font-semibold text-zinc-900 dark:text-white">Old Data Based</p>
                  </div>
                )}
              </div>
              <button
                onClick={handleReset}
                className="rounded-xl border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-white dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900"
              >
                Start Over
              </button>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
            {/* Content Display */}
            <div className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-xl font-bold text-zinc-900 dark:text-white">Generated Question Paper</h3>
                <button
                  onClick={handleCopyContent}
                  className="flex items-center gap-2 rounded-xl border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                  {isCopied ? (
                    <>
                      <CheckCircle size={16} className="text-green-500" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy size={16} />
                      Copy
                    </>
                  )}
                </button>
              </div>
              
              <div className="prose prose-zinc max-w-none dark:prose-invert">
                <pre className="whitespace-pre-wrap rounded-xl bg-zinc-50 p-6 text-sm leading-relaxed text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100">
{generatedPaper}
                </pre>
              </div>
            </div>

            {/* Actions Panel */}
            <div className="space-y-4">
              <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
                <h3 className="mb-4 font-semibold text-zinc-900 dark:text-white">Actions</h3>
                
                <div className="space-y-3">
                  <button
                    onClick={handleGeneratePDF}
                    disabled={!generatedPaper || isGeneratingPDF}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-linear-to-r from-emerald-500 to-teal-600 px-4 py-3 font-semibold text-white shadow-lg transition hover:scale-105 hover:shadow-emerald-400/40 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isGeneratingPDF ? (
                      <>
                        <Loader2 className="animate-spin" size={18} />
                        <span>Generating...</span>
                      </>
                    ) : (
                      <>
                        <Download size={18} />
                        <span>Download PDF</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleCopyContent}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-300 px-4 py-3 font-semibold text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                  >
                    {isCopied ? (
                      <>
                        <CheckCircle size={18} className="text-green-500" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy size={18} />
                        <span>Copy Content</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-900/20">
                <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                  📝 Professional Output
                </p>
                <p className="mt-2 text-xs text-blue-700 dark:text-blue-300">
                  Generated PDFs include headers, instructions, marking schemes, and proper formatting.
                </p>
              </div>

              <div className="rounded-2xl border border-purple-200 bg-purple-50 p-4 dark:border-purple-900 dark:bg-purple-900/20">
                <p className="text-sm font-semibold text-purple-900 dark:text-purple-100">
                  ✨ CBSE Compliant
                </p>
                <p className="mt-2 text-xs text-purple-700 dark:text-purple-300">
                  All questions follow CBSE pattern and curriculum guidelines.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
