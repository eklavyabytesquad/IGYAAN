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
      
      // Handle both string response and array of question objects
      if (typeof data.content === 'string') {
        setGeneratedPaper(data.content);
      } else if (typeof data.questions === 'string') {
        setGeneratedPaper(data.questions);
      } else if (Array.isArray(data.questions)) {
        // Format the questions array into a readable string
        const formattedPaper = data.questions.map((q, index) => {
          let questionText = `Q${index + 1}. ${q.question}`;
          if (q.marks) questionText += ` [${q.marks} marks]`;
          questionText += '\n';
          
          if (q.options && Array.isArray(q.options)) {
            // MCQ format
            q.options.forEach((opt, i) => {
              questionText += `   ${String.fromCharCode(65 + i)}) ${opt}\n`;
            });
          }
          
          if (q.suggested_answer) {
            questionText += `\nSuggested Answer: ${q.suggested_answer}\n`;
          }
          
          return questionText;
        }).join('\n\n');
        
        setGeneratedPaper(formattedPaper);
      } else if (data.content) {
        setGeneratedPaper(String(data.content));
      } else {
        throw new Error('Invalid response format');
      }
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
    <div className="min-h-full space-y-8 p-6 lg:p-10 dashboard-theme">
      {/* Header */}
      <header className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="rounded-2xl p-3 text-white shadow-xl" style={{
            background: 'linear-gradient(135deg, var(--dashboard-primary) 0%, color-mix(in srgb, var(--dashboard-primary) 80%, #8b5cf6) 100%)'
          }}>
            <FileQuestion size={32} />
          </div>
          <div>
            <h1 className="text-4xl font-bold" style={{ color: 'var(--dashboard-heading)' }}>
              AI Question Paper Generator
            </h1>
            <p className="mt-1 max-w-3xl text-sm" style={{ color: 'var(--dashboard-muted)' }}>
              Create professional CBSE question papers with AI. Generate from scratch or use old question papers as reference.
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        {!generatedPaper && (
          <div className="flex items-center gap-3 rounded-2xl border p-2" style={{
            borderColor: 'var(--dashboard-border)',
            backgroundColor: 'var(--dashboard-surface)'
          }}>
            <button
              onClick={() => {
                setActiveTab('new');
                setGeneratedPaper('');
              }}
              className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold transition ${
                activeTab === 'new' ? 'text-white shadow-lg' : ''
              }`}
              style={activeTab === 'new' ? {
                background: 'linear-gradient(135deg, var(--dashboard-primary) 0%, color-mix(in srgb, var(--dashboard-primary) 85%, #6366f1) 100%)'
              } : {
                color: 'var(--dashboard-muted)',
                backgroundColor: 'transparent'
              }}
              onMouseEnter={(e) => {
                if (activeTab !== 'new') {
                  e.currentTarget.style.backgroundColor = 'var(--dashboard-surface-muted)';
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== 'new') {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
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
                activeTab === 'old-data' ? 'text-white shadow-lg' : ''
              }`}
              style={activeTab === 'old-data' ? {
                background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)'
              } : {
                color: 'var(--dashboard-muted)',
                backgroundColor: 'transparent'
              }}
              onMouseEnter={(e) => {
                if (activeTab !== 'old-data') {
                  e.currentTarget.style.backgroundColor = 'var(--dashboard-surface-muted)';
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== 'old-data') {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
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
                <div className="rounded-3xl border shadow-lg p-6" style={{
                  borderColor: 'var(--dashboard-border)',
                  backgroundColor: 'var(--dashboard-surface-solid)'
                }}>
                  <label className="mb-3 flex items-center gap-2 text-sm font-semibold" style={{ color: 'var(--dashboard-heading)' }}>
                    <span className="flex h-6 w-6 items-center justify-center rounded-full text-xs text-white" style={{ backgroundColor: 'var(--dashboard-primary)' }}>1</span>
                    Select Class
                  </label>
                  <select
                    value={selectedClass}
                    onChange={(e) => {
                      setSelectedClass(e.target.value);
                      setSelectedSubject('');
                      setSelectedTopic('');
                    }}
                    className="w-full rounded-xl border px-4 py-3 text-sm focus:outline-none focus:ring-2"
                    style={{
                      borderColor: 'var(--dashboard-border)',
                      backgroundColor: 'var(--dashboard-surface-muted)',
                      color: 'var(--dashboard-text)',
                      focusRingColor: 'color-mix(in srgb, var(--dashboard-primary) 30%, transparent)'
                    }}
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
                <div className="rounded-3xl border shadow-lg p-6" style={{
                  borderColor: 'var(--dashboard-border)',
                  backgroundColor: 'var(--dashboard-surface-solid)'
                }}>
                  <label className="mb-3 flex items-center gap-2 text-sm font-semibold" style={{ color: 'var(--dashboard-heading)' }}>
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
                    className="w-full rounded-xl border px-4 py-3 text-sm focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50"
                    style={{
                      borderColor: 'var(--dashboard-border)',
                      backgroundColor: 'var(--dashboard-surface-muted)',
                      color: 'var(--dashboard-text)'
                    }}
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
                <div className="rounded-3xl border shadow-lg p-6" style={{
                  borderColor: 'var(--dashboard-border)',
                  backgroundColor: 'var(--dashboard-surface-solid)'
                }}>
                  <label className="mb-3 flex items-center gap-2 text-sm font-semibold" style={{ color: 'var(--dashboard-heading)' }}>
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-500 text-xs text-white">3</span>
                    Select Topic
                  </label>
                  <select
                    value={selectedTopic}
                    onChange={(e) => setSelectedTopic(e.target.value)}
                    disabled={!selectedSubject}
                    className="w-full rounded-xl border px-4 py-3 text-sm focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50"
                    style={{
                      borderColor: 'var(--dashboard-border)',
                      backgroundColor: 'var(--dashboard-surface-muted)',
                      color: 'var(--dashboard-text)'
                    }}
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
                <div className="rounded-3xl border shadow-lg p-6" style={{
                  borderColor: 'var(--dashboard-border)',
                  backgroundColor: 'var(--dashboard-surface-solid)'
                }}>
                  <label className="mb-3 block text-sm font-semibold" style={{ color: 'var(--dashboard-heading)' }}>
                    Exam Duration (hours)
                  </label>
                  <input
                    type="number"
                    value={examDuration}
                    onChange={(e) => setExamDuration(e.target.value)}
                    min="1"
                    max="5"
                    className="w-full rounded-xl border px-4 py-3 text-sm focus:outline-none focus:ring-2"
                    style={{
                      borderColor: 'var(--dashboard-border)',
                      backgroundColor: 'var(--dashboard-surface-muted)',
                      color: 'var(--dashboard-text)'
                    }}
                  />
                </div>

                {/* Total Marks */}
                <div className="rounded-3xl border shadow-lg p-6" style={{
                  borderColor: 'var(--dashboard-border)',
                  backgroundColor: 'var(--dashboard-surface-solid)'
                }}>
                  <label className="mb-3 block text-sm font-semibold" style={{ color: 'var(--dashboard-heading)' }}>
                    Total Marks
                  </label>
                  <input
                    type="number"
                    value={totalMarks}
                    onChange={(e) => setTotalMarks(e.target.value)}
                    min="10"
                    max="200"
                    className="w-full rounded-xl border px-4 py-3 text-sm focus:outline-none focus:ring-2"
                    style={{
                      borderColor: 'var(--dashboard-border)',
                      backgroundColor: 'var(--dashboard-surface-muted)',
                      color: 'var(--dashboard-text)'
                    }}
                  />
                </div>
              </div>

              {/* Start Button */}
              {selectedClass && selectedSubject && selectedTopic && (
                <div className="flex justify-center">
                  <button
                    onClick={handleStartGeneration}
                    disabled={isGenerating}
                    className="flex items-center gap-3 rounded-2xl px-10 py-4 text-lg font-bold text-white shadow-xl transition hover:scale-105 hover:shadow-2xl disabled:cursor-not-allowed disabled:opacity-50"
                    style={{
                      background: 'linear-gradient(135deg, var(--dashboard-primary) 0%, color-mix(in srgb, var(--dashboard-primary) 80%, #8b5cf6) 50%, #a855f7 100%)'
                    }}
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
                <div className="rounded-3xl border shadow-lg p-6" style={{
                  borderColor: 'var(--dashboard-border)',
                  backgroundColor: 'var(--dashboard-surface-solid)'
                }}>
                  <label className="mb-3 flex items-center justify-between text-sm font-semibold" style={{ color: 'var(--dashboard-heading)' }}>
                    <span className="flex items-center gap-2">
                      <Upload className="text-purple-500" size={18} />
                      Old Question Paper Content
                    </span>
                    <label className="cursor-pointer rounded-lg px-3 py-1 text-xs font-medium transition" style={{
                      backgroundColor: 'color-mix(in srgb, #a855f7 15%, transparent)',
                      color: '#a855f7'
                    }}>
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
                    className="h-80 w-full resize-none rounded-xl border p-4 text-sm focus:outline-none focus:ring-2"
                    style={{
                      borderColor: 'var(--dashboard-border)',
                      backgroundColor: 'var(--dashboard-surface-muted)',
                      color: 'var(--dashboard-text)'
                    }}
                  />
                  <p className="mt-2 text-xs" style={{ color: 'var(--dashboard-muted)' }}>
                    {oldContent.length} characters • {oldContent.split('\n').filter(l => l.trim()).length} lines
                  </p>
                </div>

                {/* Custom Prompt */}
                <div className="rounded-3xl border shadow-lg p-6" style={{
                  borderColor: 'var(--dashboard-border)',
                  backgroundColor: 'var(--dashboard-surface-solid)'
                }}>
                  <label className="mb-3 flex items-center gap-2 text-sm font-semibold" style={{ color: 'var(--dashboard-heading)' }}>
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
                    className="h-80 w-full resize-none rounded-xl border p-4 text-sm focus:outline-none focus:ring-2"
                    style={{
                      borderColor: 'var(--dashboard-border)',
                      backgroundColor: 'var(--dashboard-surface-muted)',
                      color: 'var(--dashboard-text)'
                    }}
                  />
                  <p className="mt-2 text-xs" style={{ color: 'var(--dashboard-muted)' }}>
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
                    className="flex items-center gap-3 rounded-2xl px-10 py-4 text-lg font-bold text-white shadow-xl transition hover:scale-105 hover:shadow-2xl disabled:cursor-not-allowed disabled:opacity-50"
                    style={{
                      background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 50%, #f43f5e 100%)'
                    }}
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
            <div className="rounded-2xl border p-5" style={{
              borderColor: 'color-mix(in srgb, var(--dashboard-primary) 30%, transparent)',
              backgroundColor: 'color-mix(in srgb, var(--dashboard-primary) 8%, transparent)'
            }}>
              <div className="mb-2 flex items-center gap-2">
                <div className="rounded-lg p-2 text-white" style={{ backgroundColor: 'var(--dashboard-primary)' }}>
                  <Sparkles size={16} />
                </div>
                <p className="font-semibold" style={{ color: 'var(--dashboard-heading)' }}>AI-Powered</p>
              </div>
              <p className="text-xs" style={{ color: 'var(--dashboard-text)' }}>
                Advanced AI generates CBSE-compliant question papers with proper marking schemes
              </p>
            </div>

            <div className="rounded-2xl border p-5" style={{
              borderColor: 'color-mix(in srgb, #6366f1 30%, transparent)',
              backgroundColor: 'color-mix(in srgb, #6366f1 8%, transparent)'
            }}>
              <div className="mb-2 flex items-center gap-2">
                <div className="rounded-lg bg-indigo-500 p-2 text-white">
                  <FileQuestion size={16} />
                </div>
                <p className="font-semibold" style={{ color: 'var(--dashboard-heading)' }}>Professional Format</p>
              </div>
              <p className="text-xs" style={{ color: 'var(--dashboard-text)' }}>
                Download PDF with proper headers, instructions, and marking schemes
              </p>
            </div>

            <div className="rounded-2xl border p-5" style={{
              borderColor: 'color-mix(in srgb, #a855f7 30%, transparent)',
              backgroundColor: 'color-mix(in srgb, #a855f7 8%, transparent)'
            }}>
              <div className="mb-2 flex items-center gap-2">
                <div className="rounded-lg bg-purple-500 p-2 text-white">
                  <History size={16} />
                </div>
                <p className="font-semibold" style={{ color: 'var(--dashboard-heading)' }}>Learn from Past</p>
              </div>
              <p className="text-xs" style={{ color: 'var(--dashboard-text)' }}>
                Use old question papers as templates to maintain consistency
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* Generated Content Section */
        <div className="mx-auto max-w-7xl space-y-6">
          {/* Summary Bar */}
          <div className="rounded-2xl border p-4" style={{ 
            borderColor: 'var(--dashboard-border)', 
            background: 'var(--dashboard-surface-muted)' 
          }}>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3">
                {activeTab === 'new' ? (
                  <>
                    <div className="rounded-xl px-4 py-2 shadow-sm" style={{ 
                      backgroundColor: 'var(--dashboard-surface-solid)',
                      borderColor: 'var(--dashboard-border)'
                    }}>
                      <p className="text-xs" style={{ color: 'var(--dashboard-muted)' }}>Class</p>
                      <p className="font-semibold" style={{ color: 'var(--dashboard-heading)' }}>
                        {cbseData.classes.find(c => c.id === selectedClass)?.name}
                      </p>
                    </div>
                    <div className="rounded-xl px-4 py-2 shadow-sm" style={{ 
                      backgroundColor: 'var(--dashboard-surface-solid)',
                      borderColor: 'var(--dashboard-border)'
                    }}>
                      <p className="text-xs" style={{ color: 'var(--dashboard-muted)' }}>Subject</p>
                      <p className="font-semibold" style={{ color: 'var(--dashboard-heading)' }}>{selectedSubject}</p>
                    </div>
                    <div className="rounded-xl px-4 py-2 shadow-sm" style={{ 
                      backgroundColor: 'var(--dashboard-surface-solid)',
                      borderColor: 'var(--dashboard-border)'
                    }}>
                      <p className="text-xs" style={{ color: 'var(--dashboard-muted)' }}>Duration</p>
                      <p className="font-semibold" style={{ color: 'var(--dashboard-heading)' }}>{examDuration}h / {totalMarks}M</p>
                    </div>
                  </>
                ) : (
                  <div className="rounded-xl px-4 py-2 shadow-sm" style={{ 
                    backgroundColor: 'var(--dashboard-surface-solid)',
                    borderColor: 'var(--dashboard-border)'
                  }}>
                    <p className="text-xs" style={{ color: 'var(--dashboard-muted)' }}>Mode</p>
                    <p className="font-semibold" style={{ color: 'var(--dashboard-heading)' }}>Old Data Based</p>
                  </div>
                )}
              </div>
              <button
                onClick={handleReset}
                className="rounded-xl border px-4 py-2 text-sm font-medium transition hover:opacity-80"
                style={{ 
                  borderColor: 'var(--dashboard-border)',
                  color: 'var(--dashboard-text)'
                }}
              >
                Start Over
              </button>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
            {/* Content Display */}
            <div className="rounded-2xl border shadow-lg" style={{ 
              borderColor: 'var(--dashboard-border)', 
              backgroundColor: 'var(--dashboard-surface-solid)' 
            }}>
              <div className="border-b p-6" style={{ borderColor: 'var(--dashboard-border)' }}>
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold" style={{ color: 'var(--dashboard-heading)' }}>
                    Generated Question Paper
                  </h3>
                  <button
                    onClick={handleCopyContent}
                    className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition hover:opacity-80"
                    style={{ 
                      borderColor: 'var(--dashboard-border)',
                      backgroundColor: 'var(--dashboard-surface-muted)',
                      color: 'var(--dashboard-text)'
                    }}
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
              </div>
              
              <div className="p-8">
                <div 
                  className="rounded-xl p-6 text-sm leading-relaxed whitespace-pre-wrap font-sans"
                  style={{ 
                    backgroundColor: 'var(--dashboard-surface-muted)',
                    color: 'var(--dashboard-text)',
                    maxHeight: '70vh',
                    overflowY: 'auto'
                  }}
                >
                  {generatedPaper.split('\n').map((line, idx) => {
                    // Format different types of lines
                    if (line.startsWith('#')) {
                      // Headers
                      const level = line.match(/^#+/)?.[0].length || 1;
                      const text = line.replace(/^#+\s*/, '');
                      return (
                        <div 
                          key={idx} 
                          className={`font-bold mb-3 mt-4 ${level === 1 ? 'text-2xl' : level === 2 ? 'text-xl' : 'text-lg'}`}
                          style={{ color: 'var(--dashboard-heading)' }}
                        >
                          {text}
                        </div>
                      );
                    } else if (line.match(/^Q\d+\./) || line.match(/^\d+\./)) {
                      // Questions
                      return (
                        <div key={idx} className="mb-3 font-semibold" style={{ color: 'var(--dashboard-text)' }}>
                          {line}
                        </div>
                      );
                    } else if (line.match(/^[A-D]\)|^\([A-D]\)/)) {
                      // Options
                      return (
                        <div key={idx} className="ml-6 mb-1" style={{ color: 'var(--dashboard-text)' }}>
                          {line}
                        </div>
                      );
                    } else if (line.trim().startsWith('**') && line.trim().endsWith('**')) {
                      // Bold text
                      const text = line.replace(/\*\*/g, '');
                      return (
                        <div key={idx} className="mb-2 font-bold" style={{ color: 'var(--dashboard-heading)' }}>
                          {text}
                        </div>
                      );
                    } else if (line.trim().startsWith('-') || line.trim().startsWith('•')) {
                      // Bullet points
                      return (
                        <div key={idx} className="ml-4 mb-1" style={{ color: 'var(--dashboard-text)' }}>
                          • {line.replace(/^[-•]\s*/, '')}
                        </div>
                      );
                    } else if (line.trim() === '') {
                      // Empty lines
                      return <div key={idx} className="h-2"></div>;
                    } else {
                      // Regular text
                      return (
                        <div key={idx} className="mb-1" style={{ color: 'var(--dashboard-text)' }}>
                          {line}
                        </div>
                      );
                    }
                  })}
                </div>
              </div>
            </div>

            {/* Actions Panel */}
            <div className="space-y-4">
              <div className="rounded-2xl border shadow-lg p-6" style={{ 
                borderColor: 'var(--dashboard-border)', 
                backgroundColor: 'var(--dashboard-surface-solid)' 
              }}>
                <h3 className="mb-4 font-semibold" style={{ color: 'var(--dashboard-heading)' }}>
                  Actions
                </h3>
                
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
                    className="flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 font-semibold transition hover:opacity-80"
                    style={{ 
                      borderColor: 'var(--dashboard-border)',
                      backgroundColor: 'var(--dashboard-surface-muted)',
                      color: 'var(--dashboard-text)'
                    }}
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

              <div className="rounded-2xl border p-4" style={{ 
                borderColor: 'var(--dashboard-border)', 
                backgroundColor: 'var(--dashboard-surface-muted)' 
              }}>
                <p className="text-sm font-semibold mb-2" style={{ color: 'var(--dashboard-heading)' }}>
                  📝 Professional Output
                </p>
                <p className="text-xs" style={{ color: 'var(--dashboard-text)' }}>
                  Generated PDFs include headers, instructions, marking schemes, and proper formatting.
                </p>
              </div>

              <div className="rounded-2xl border p-4" style={{ 
                borderColor: 'var(--dashboard-border)', 
                backgroundColor: 'var(--dashboard-surface-muted)' 
              }}>
                <p className="text-sm font-semibold mb-2" style={{ color: 'var(--dashboard-heading)' }}>
                  ✨ CBSE Compliant
                </p>
                <p className="text-xs" style={{ color: 'var(--dashboard-text)' }}>
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
