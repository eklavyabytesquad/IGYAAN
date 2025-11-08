'use client';

import { useState, useEffect } from 'react';
import { BookOpen, Plus, Edit2, Trash2, Users, Clock, Search, Filter, FileText, Mic, BarChart3 } from 'lucide-react';
import { useAuth } from '../../utils/auth_context';
import { supabase } from '../../utils/supabase';

export default function HomeworkManagement() {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [activeTab, setActiveTab] = useState('mcq'); // mcq or viva
  
  // AI Generator State
  const [showAIGenerator, setShowAIGenerator] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiConfig, setAiConfig] = useState({
    topic: '',
    numQuestions: 5,
    questionType: 'mcq',
    subject: ''
  });

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subject: '',
    type: 'mcq', // mcq or viva
    deadline: '',
    max_marks: '',
    mcq_questions: [],
    viva_questions: [],
  });

  useEffect(() => {
    if (user?.school_id) {
      loadAssignments();
    }
  }, [user]);

  const loadAssignments = async () => {
    if (!user?.school_id) return;

    const { data, error } = await supabase
      .from('homework_assignments')
      .select('*')
      .eq('school_id', user.school_id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setAssignments(data);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user?.school_id) {
      alert('School ID is missing. Please complete school onboarding.');
      return;
    }

    const assignmentData = {
      title: formData.title,
      description: formData.description,
      subject: formData.subject,
      type: formData.type,
      questions: formData.type === 'mcq' ? formData.mcq_questions : formData.viva_questions,
      deadline: new Date(formData.deadline).toISOString(),
      max_marks: parseInt(formData.max_marks),
      school_id: user.school_id,
      created_by: user.id,
      created_by_name: user.full_name || 'Teacher',
    };

    try {
      if (editingAssignment) {
        const { error } = await supabase
          .from('homework_assignments')
          .update({ ...assignmentData, updated_at: new Date().toISOString() })
          .eq('id', editingAssignment.id);

        if (error) throw error;
        alert('Assignment updated successfully!');
      } else {
        const { error } = await supabase
          .from('homework_assignments')
          .insert([assignmentData]);

        if (error) throw error;
        alert('Assignment created successfully!');
      }

      resetForm();
      loadAssignments();
    } catch (error) {
      console.error('Error saving assignment:', error);
      alert('Failed to save assignment: ' + error.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this assignment?')) return;

    const { error } = await supabase
      .from('homework_assignments')
      .delete()
      .eq('id', id);

    if (!error) {
      loadAssignments();
    } else {
      alert('Failed to delete assignment: ' + error.message);
    }
  };

  const handleEdit = (assignment) => {
    setEditingAssignment(assignment);
    const deadline = assignment.deadline ? new Date(assignment.deadline).toISOString().slice(0, 16) : '';
    setFormData({
      title: assignment.title,
      description: assignment.description,
      subject: assignment.subject,
      type: assignment.type,
      deadline: deadline,
      max_marks: assignment.max_marks,
      mcq_questions: assignment.questions && assignment.type === 'mcq' ? assignment.questions : [],
      viva_questions: assignment.questions && assignment.type === 'viva' ? assignment.questions : [],
    });
    setActiveTab(assignment.type);
    setShowModal(true);
  };

  const resetForm = () => {
    setShowModal(false);
    setEditingAssignment(null);
    setFormData({
      title: '',
      description: '',
      subject: '',
      type: 'mcq',
      deadline: '',
      max_marks: '',
      mcq_questions: [],
      viva_questions: [],
    });
    setActiveTab('mcq');
  };

  const addMCQQuestion = () => {
    setFormData({
      ...formData,
      mcq_questions: [...formData.mcq_questions, {
        id: Date.now(),
        question: '',
        options: ['', '', '', ''],
        correct_answer: 0,
        marks: 1,
      }]
    });
  };

  const updateMCQQuestion = (index, field, value) => {
    const updated = [...formData.mcq_questions];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, mcq_questions: updated });
  };

  const updateMCQOption = (qIndex, optIndex, value) => {
    const updated = [...formData.mcq_questions];
    updated[qIndex].options[optIndex] = value;
    setFormData({ ...formData, mcq_questions: updated });
  };

  const removeMCQQuestion = (index) => {
    const updated = formData.mcq_questions.filter((_, i) => i !== index);
    setFormData({ ...formData, mcq_questions: updated });
  };

  const addVivaQuestion = () => {
    setFormData({
      ...formData,
      viva_questions: [...formData.viva_questions, {
        id: Date.now(),
        question: '',
        suggested_answer: '',
        marks: 5,
        keywords: [],
      }]
    });
  };

  const updateVivaQuestion = (index, field, value) => {
    const updated = [...formData.viva_questions];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, viva_questions: updated });
  };

  const removeVivaQuestion = (index) => {
    const updated = formData.viva_questions.filter((_, i) => i !== index);
    setFormData({ ...formData, viva_questions: updated });
  };

  const generateQuestionsWithAI = async () => {
    if (!aiConfig.topic || !aiConfig.subject) {
      alert('Please fill in topic and subject');
      return;
    }

    setAiGenerating(true);
    try {
      const response = await fetch('/api/generate-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(aiConfig)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate questions');
      }

      const data = await response.json();
      
      // Add generated questions to form
      if (aiConfig.questionType === 'mcq') {
        setFormData({
          ...formData,
          mcq_questions: [...formData.mcq_questions, ...data.questions],
          type: 'mcq',
          subject: aiConfig.subject
        });
        setActiveTab('mcq');
      } else {
        setFormData({
          ...formData,
          viva_questions: [...formData.viva_questions, ...data.questions],
          type: 'viva',
          subject: aiConfig.subject
        });
        setActiveTab('viva');
      }

      setShowAIGenerator(false);
      setShowModal(true);
      alert(`Successfully generated ${data.questions.length} questions!`);
      
      // Reset AI config
      setAiConfig({
        topic: '',
        numQuestions: 5,
        questionType: 'mcq',
        subject: ''
      });
    } catch (error) {
      console.error('AI Generation Error:', error);
      alert('Failed to generate questions: ' + error.message);
    } finally {
      setAiGenerating(false);
    }
  };

  const filteredAssignments = assignments.filter(assignment => {
    const matchesSearch = assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         assignment.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || assignment.type === filterType;
    return matchesSearch && matchesType;
  });

  // Check if user is teacher/admin
  const isTeacher = ['super_admin', 'co_admin', 'faculty'].includes(user?.role);

  if (!isTeacher) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p style={{ color: 'var(--dashboard-muted)' }}>Only teachers can access this page.</p>
      </div>
    );
  }

  return (
    <div className="dashboard-theme flex h-screen w-full flex-col gap-6 overflow-hidden p-4 lg:p-8">
      {/* Header */}
      <header className="dashboard-card rounded-3xl p-6 shadow-2xl">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            <span className="rounded-2xl p-4 text-white shadow-lg" style={{ backgroundColor: 'var(--dashboard-primary)' }}>
              <BookOpen size={28} />
            </span>
            <div>
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl" style={{ color: 'var(--dashboard-heading)' }}>
                Homework Management
              </h1>
              <p className="mt-2 text-sm sm:text-base" style={{ color: 'var(--dashboard-muted)' }}>
                Create gamified homework, MCQs, and virtual viva questions
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowAIGenerator(true)}
              className="flex items-center gap-2 rounded-2xl px-6 py-3 text-sm font-semibold text-white shadow-lg transition"
              style={{ backgroundColor: '#a855f7' }}
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span>AI Generate</span>
            </button>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 rounded-2xl px-6 py-3 text-sm font-semibold shadow-lg transition"
              style={{ 
                backgroundColor: 'var(--dashboard-primary)',
                color: 'var(--dashboard-primary-foreground)'
              }}
            >
              <Plus size={20} />
              <span>Create Manual</span>
            </button>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2" style={{ color: 'var(--dashboard-muted)' }} />
            <input
              type="text"
              placeholder="Search assignments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl px-10 py-2.5 text-sm outline-none transition focus:ring-2"
              style={{
                border: '1px solid var(--dashboard-border)',
                backgroundColor: 'var(--dashboard-surface-solid)',
                color: 'var(--dashboard-text)'
              }}
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={20} style={{ color: 'var(--dashboard-muted)' }} />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="rounded-xl px-4 py-2.5 text-sm outline-none transition"
              style={{
                border: '1px solid var(--dashboard-border)',
                backgroundColor: 'var(--dashboard-surface-solid)',
                color: 'var(--dashboard-text)'
              }}
            >
              <option value="all">All Types</option>
              <option value="mcq">MCQ</option>
              <option value="viva">Virtual Viva</option>
            </select>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl p-3" style={{ 
            backgroundColor: 'color-mix(in srgb, var(--dashboard-primary) 10%, transparent)',
            border: '1px solid color-mix(in srgb, var(--dashboard-primary) 20%, transparent)'
          }}>
            <p className="text-xs font-semibold" style={{ color: 'var(--dashboard-primary)' }}>Total Assignments</p>
            <p className="mt-1 text-2xl font-bold" style={{ color: 'var(--dashboard-heading)' }}>{assignments.length}</p>
          </div>
          <div className="rounded-xl p-3" style={{ 
            backgroundColor: 'color-mix(in srgb, var(--dashboard-primary) 10%, transparent)',
            border: '1px solid color-mix(in srgb, var(--dashboard-primary) 20%, transparent)'
          }}>
            <p className="text-xs font-semibold" style={{ color: 'var(--dashboard-primary)' }}>MCQ Tests</p>
            <p className="mt-1 text-2xl font-bold" style={{ color: 'var(--dashboard-heading)' }}>
              {assignments.filter(a => a.type === 'mcq').length}
            </p>
          </div>
          <div className="rounded-xl p-3" style={{ 
            backgroundColor: 'color-mix(in srgb, var(--dashboard-primary) 10%, transparent)',
            border: '1px solid color-mix(in srgb, var(--dashboard-primary) 20%, transparent)'
          }}>
            <p className="text-xs font-semibold" style={{ color: 'var(--dashboard-primary)' }}>Virtual Viva</p>
            <p className="mt-1 text-2xl font-bold" style={{ color: 'var(--dashboard-heading)' }}>
              {assignments.filter(a => a.type === 'viva').length}
            </p>
          </div>
        </div>
      </header>

      {/* Assignments Grid */}
      <div className="dashboard-card flex-1 overflow-y-auto rounded-3xl p-6 shadow-2xl">
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredAssignments.map((assignment) => (
            <div
              key={assignment.id}
              className="group relative overflow-hidden rounded-2xl shadow-lg transition hover:shadow-xl"
              style={{
                border: '1px solid var(--dashboard-border)',
                backgroundColor: 'var(--dashboard-surface-solid)'
              }}
            >
              <div className="p-5">
                <div className="mb-3 flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="mb-1 text-lg font-bold" style={{ color: 'var(--dashboard-heading)' }}>{assignment.title}</h3>
                    <span className={`inline-flex items-center rounded-lg px-2 py-1 text-xs font-semibold`} style={{
                      backgroundColor: assignment.type === 'mcq' ? '#dbeafe' : '#f3e8ff',
                      color: assignment.type === 'mcq' ? '#1e40af' : '#6b21a8'
                    }}>
                      {assignment.type === 'mcq' ? <FileText size={12} className="mr-1" /> : <Mic size={12} className="mr-1" />}
                      {assignment.type.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(assignment)}
                      className="rounded-lg p-2 transition"
                      style={{ color: 'var(--dashboard-primary)' }}
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(assignment.id)}
                      className="rounded-lg p-2 transition"
                      style={{ color: '#dc2626' }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <p className="mb-4 line-clamp-2 text-sm" style={{ color: 'var(--dashboard-muted)' }}>{assignment.description}</p>

                <div className="space-y-2 text-xs" style={{ color: 'var(--dashboard-muted)' }}>
                  <div className="flex items-center gap-2">
                    <BookOpen size={14} />
                    <span className="font-semibold">{assignment.subject}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={14} />
                    <span>Due: {new Date(assignment.deadline).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BarChart3 size={14} />
                    <span>Max Marks: {assignment.max_marks}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FileText size={14} />
                    <span>
                      {assignment.questions?.length || 0} Questions
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredAssignments.length === 0 && (
          <div className="flex h-64 items-center justify-center" style={{ color: 'var(--dashboard-muted)' }}>
            <p>No assignments found. Create your first assignment!</p>
          </div>
        )}
      </div>

      {/* AI Generator Modal */}
      {showAIGenerator && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="dashboard-card w-full max-w-2xl rounded-3xl p-8 shadow-2xl">
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-2xl p-3 text-white" style={{ backgroundColor: '#a855f7' }}>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold" style={{ color: 'var(--dashboard-heading)' }}>
                  AI Question Generator
                </h2>
                <p className="text-sm" style={{ color: 'var(--dashboard-muted)' }}>
                  Let AI create questions for you instantly
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-semibold" style={{ color: 'var(--dashboard-text)' }}>
                  Question Type
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setAiConfig({ ...aiConfig, questionType: 'mcq' })}
                    className={`rounded-xl border-2 p-4 text-center font-semibold transition`}
                    style={aiConfig.questionType === 'mcq' ? {
                      borderColor: '#3b82f6',
                      backgroundColor: '#dbeafe',
                      color: '#1e40af'
                    } : {
                      borderColor: 'var(--dashboard-border)',
                      backgroundColor: 'var(--dashboard-surface-solid)',
                      color: 'var(--dashboard-text)'
                    }}
                  >
                    <FileText className="mx-auto mb-2" size={24} />
                    MCQ Questions
                  </button>
                  <button
                    type="button"
                    onClick={() => setAiConfig({ ...aiConfig, questionType: 'viva' })}
                    className={`rounded-xl border-2 p-4 text-center font-semibold transition`}
                    style={aiConfig.questionType === 'viva' ? {
                      borderColor: '#a855f7',
                      backgroundColor: '#f3e8ff',
                      color: '#7e22ce'
                    } : {
                      borderColor: 'var(--dashboard-border)',
                      backgroundColor: 'var(--dashboard-surface-solid)',
                      color: 'var(--dashboard-text)'
                    }}
                  >
                    <Mic className="mx-auto mb-2" size={24} />
                    Viva Questions
                  </button>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold" style={{ color: 'var(--dashboard-text)' }}>
                    Subject
                  </label>
                  <input
                    type="text"
                    required
                    value={aiConfig.subject}
                    onChange={(e) => setAiConfig({ ...aiConfig, subject: e.target.value })}
                    placeholder="e.g., Mathematics, Physics"
                    className="w-full rounded-xl px-4 py-3 text-sm outline-none transition focus:ring-2"
                    style={{
                      border: '1px solid var(--dashboard-border)',
                      backgroundColor: 'var(--dashboard-surface-solid)',
                      color: 'var(--dashboard-text)'
                    }}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold" style={{ color: 'var(--dashboard-text)' }}>
                    Number of Questions
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={aiConfig.numQuestions}
                    onChange={(e) => setAiConfig({ ...aiConfig, numQuestions: parseInt(e.target.value) })}
                    className="w-full rounded-xl px-4 py-3 text-sm outline-none transition focus:ring-2"
                    style={{
                      border: '1px solid var(--dashboard-border)',
                      backgroundColor: 'var(--dashboard-surface-solid)',
                      color: 'var(--dashboard-text)'
                    }}
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold" style={{ color: 'var(--dashboard-text)' }}>
                  Topic/Chapter
                </label>
                <textarea
                  required
                  value={aiConfig.topic}
                  onChange={(e) => setAiConfig({ ...aiConfig, topic: e.target.value })}
                  placeholder="e.g., Photosynthesis in Plants, Quadratic Equations, French Revolution"
                  rows={3}
                  className="w-full rounded-xl px-4 py-3 text-sm outline-none transition focus:ring-2"
                  style={{
                    border: '1px solid var(--dashboard-border)',
                    backgroundColor: 'var(--dashboard-surface-solid)',
                    color: 'var(--dashboard-text)'
                  }}
                />
                <p className="mt-2 text-xs" style={{ color: 'var(--dashboard-muted)' }}>
                  💡 Be specific for better results. Include key concepts you want to test.
                </p>
              </div>

              <div className="rounded-xl p-4" style={{
                border: '1px solid #fcd34d',
                backgroundColor: '#fef3c7'
              }}>
                <p className="text-sm" style={{ color: '#92400e' }}>
                  <strong>Note:</strong> AI will generate high-quality questions based on your topic. 
                  {aiConfig.questionType === 'mcq' 
                    ? ' MCQs will include 4 options with correct answers marked.'
                    : ' Viva questions will include suggested comprehensive answers.'}
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAIGenerator(false);
                    setAiConfig({ topic: '', numQuestions: 5, questionType: 'mcq', subject: '' });
                  }}
                  disabled={aiGenerating}
                  className="flex-1 rounded-xl px-6 py-3 text-sm font-semibold transition hover:opacity-90 disabled:opacity-50"
                  style={{
                    border: '1px solid var(--dashboard-border)',
                    backgroundColor: 'var(--dashboard-surface-solid)',
                    color: 'var(--dashboard-text)'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={generateQuestionsWithAI}
                  disabled={aiGenerating || !aiConfig.topic || !aiConfig.subject}
                  className="flex-1 rounded-xl px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:shadow-purple-400/40 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: '#a855f7' }}
                >
                  {aiGenerating ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                      <span>Generating...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      <span>Generate Questions</span>
                    </div>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
          <div className="dashboard-card my-8 w-full max-w-4xl rounded-3xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="mb-6 text-2xl font-bold" style={{ color: 'var(--dashboard-heading)' }}>
              {editingAssignment ? 'Edit Assignment' : 'Create New Assignment'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Basic Info */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-semibold" style={{ color: 'var(--dashboard-text)' }}>Title</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full rounded-xl px-4 py-2.5 text-sm outline-none transition focus:ring-2"
                    style={{
                      border: '1px solid var(--dashboard-border)',
                      backgroundColor: 'var(--dashboard-surface-solid)',
                      color: 'var(--dashboard-text)'
                    }}
                    placeholder="Assignment title"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-semibold" style={{ color: 'var(--dashboard-text)' }}>Subject</label>
                  <input
                    type="text"
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full rounded-xl px-4 py-2.5 text-sm outline-none transition focus:ring-2"
                    style={{
                      border: '1px solid var(--dashboard-border)',
                      backgroundColor: 'var(--dashboard-surface-solid)',
                      color: 'var(--dashboard-text)'
                    }}
                    placeholder="Mathematics, Science, etc."
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold" style={{ color: 'var(--dashboard-text)' }}>Description</label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full rounded-xl px-4 py-2.5 text-sm outline-none transition focus:ring-2"
                  style={{
                    border: '1px solid var(--dashboard-border)',
                    backgroundColor: 'var(--dashboard-surface-solid)',
                    color: 'var(--dashboard-text)'
                  }}
                  placeholder="Assignment instructions..."
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="mb-1 block text-sm font-semibold" style={{ color: 'var(--dashboard-text)' }}>Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => {
                      setFormData({ ...formData, type: e.target.value });
                      setActiveTab(e.target.value);
                    }}
                    className="w-full rounded-xl px-4 py-2.5 text-sm outline-none transition focus:ring-2"
                    style={{
                      border: '1px solid var(--dashboard-border)',
                      backgroundColor: 'var(--dashboard-surface-solid)',
                      color: 'var(--dashboard-text)'
                    }}
                  >
                    <option value="mcq">MCQ Test</option>
                    <option value="viva">Virtual Viva</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-semibold" style={{ color: 'var(--dashboard-text)' }}>Deadline</label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.deadline}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                    className="w-full rounded-xl px-4 py-2.5 text-sm outline-none transition focus:ring-2"
                    style={{
                      border: '1px solid var(--dashboard-border)',
                      backgroundColor: 'var(--dashboard-surface-solid)',
                      color: 'var(--dashboard-text)'
                    }}
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-semibold" style={{ color: 'var(--dashboard-text)' }}>Max Marks</label>
                  <input
                    type="number"
                    required
                    value={formData.max_marks}
                    onChange={(e) => setFormData({ ...formData, max_marks: e.target.value })}
                    className="w-full rounded-xl px-4 py-2.5 text-sm outline-none transition focus:ring-2"
                    style={{
                      border: '1px solid var(--dashboard-border)',
                      backgroundColor: 'var(--dashboard-surface-solid)',
                      color: 'var(--dashboard-text)'
                    }}
                    placeholder="100"
                  />
                </div>
              </div>

              {/* Questions Section */}
              <div className="mt-6 rounded-xl border-2 border-dashed p-4" style={{ borderColor: 'var(--dashboard-border)' }}>
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-bold" style={{ color: 'var(--dashboard-heading)' }}>
                    {formData.type === 'mcq' ? 'MCQ Questions' : 'Viva Questions'}
                  </h3>
                  <button
                    type="button"
                    onClick={formData.type === 'mcq' ? addMCQQuestion : addVivaQuestion}
                    className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
                    style={{ backgroundColor: 'var(--dashboard-primary)' }}
                  >
                    <Plus size={16} />
                    Add Question
                  </button>
                </div>

                {/* MCQ Questions */}
                {formData.type === 'mcq' && formData.mcq_questions.map((q, qIndex) => (
                  <div key={q.id} className="mb-4 rounded-xl p-4" style={{
                    border: '1px solid var(--dashboard-border)',
                    backgroundColor: 'var(--dashboard-surface-muted)'
                  }}>
                    <div className="mb-3 flex items-start justify-between">
                      <h4 className="font-semibold" style={{ color: 'var(--dashboard-text)' }}>Question {qIndex + 1}</h4>
                      <button
                        type="button"
                        onClick={() => removeMCQQuestion(qIndex)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <input
                      type="text"
                      required
                      value={q.question}
                      onChange={(e) => updateMCQQuestion(qIndex, 'question', e.target.value)}
                      placeholder="Enter question"
                      className="mb-3 w-full rounded-lg px-3 py-2 text-sm"
                      style={{
                        border: '1px solid var(--dashboard-border)',
                        backgroundColor: 'var(--dashboard-surface-solid)',
                        color: 'var(--dashboard-text)'
                      }}
                    />
                    <div className="space-y-2">
                      {q.options.map((opt, optIndex) => (
                        <div key={optIndex} className="flex items-center gap-2">
                          <input
                            type="radio"
                            name={`correct-${qIndex}`}
                            checked={q.correct_answer === optIndex}
                            onChange={() => updateMCQQuestion(qIndex, 'correct_answer', optIndex)}
                            className="h-4 w-4"
                          />
                          <input
                            type="text"
                            required
                            value={opt}
                            onChange={(e) => updateMCQOption(qIndex, optIndex, e.target.value)}
                            placeholder={`Option ${optIndex + 1}`}
                            className="flex-1 rounded-lg px-3 py-2 text-sm"
                            style={{
                              border: '1px solid var(--dashboard-border)',
                              backgroundColor: 'var(--dashboard-surface-solid)',
                              color: 'var(--dashboard-text)'
                            }}
                          />
                        </div>
                      ))}
                    </div>
                    <div className="mt-3">
                      <input
                        type="number"
                        required
                        min="1"
                        value={q.marks}
                        onChange={(e) => updateMCQQuestion(qIndex, 'marks', parseInt(e.target.value))}
                        placeholder="Marks"
                        className="w-24 rounded-lg px-3 py-2 text-sm"
                        style={{
                          border: '1px solid var(--dashboard-border)',
                          backgroundColor: 'var(--dashboard-surface-solid)',
                          color: 'var(--dashboard-text)'
                        }}
                      />
                      <span className="ml-2 text-xs" style={{ color: 'var(--dashboard-muted)' }}>marks</span>
                    </div>
                  </div>
                ))}

                {/* Viva Questions */}
                {formData.type === 'viva' && formData.viva_questions.map((q, qIndex) => (
                  <div key={q.id} className="mb-4 rounded-xl p-4" style={{
                    border: '1px solid var(--dashboard-border)',
                    backgroundColor: 'var(--dashboard-surface-muted)'
                  }}>
                    <div className="mb-3 flex items-start justify-between">
                      <h4 className="font-semibold" style={{ color: 'var(--dashboard-text)' }}>Question {qIndex + 1}</h4>
                      <button
                        type="button"
                        onClick={() => removeVivaQuestion(qIndex)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <input
                      type="text"
                      required
                      value={q.question}
                      onChange={(e) => updateVivaQuestion(qIndex, 'question', e.target.value)}
                      placeholder="Enter viva question"
                      className="mb-3 w-full rounded-lg px-3 py-2 text-sm"
                      style={{
                        border: '1px solid var(--dashboard-border)',
                        backgroundColor: 'var(--dashboard-surface-solid)',
                        color: 'var(--dashboard-text)'
                      }}
                    />
                    <textarea
                      value={q.suggested_answer}
                      onChange={(e) => updateVivaQuestion(qIndex, 'suggested_answer', e.target.value)}
                      placeholder="Suggested answer (optional)"
                      rows={2}
                      className="mb-3 w-full rounded-lg px-3 py-2 text-sm"
                      style={{
                        border: '1px solid var(--dashboard-border)',
                        backgroundColor: 'var(--dashboard-surface-solid)',
                        color: 'var(--dashboard-text)'
                      }}
                    />
                    <div>
                      <input
                        type="number"
                        required
                        min="1"
                        value={q.marks}
                        onChange={(e) => updateVivaQuestion(qIndex, 'marks', parseInt(e.target.value))}
                        placeholder="Marks"
                        className="w-24 rounded-lg px-3 py-2 text-sm"
                        style={{
                          border: '1px solid var(--dashboard-border)',
                          backgroundColor: 'var(--dashboard-surface-solid)',
                          color: 'var(--dashboard-text)'
                        }}
                      />
                      <span className="ml-2 text-xs" style={{ color: 'var(--dashboard-muted)' }}>marks</span>
                    </div>
                  </div>
                ))}

                {((formData.type === 'mcq' && formData.mcq_questions.length === 0) ||
                  (formData.type === 'viva' && formData.viva_questions.length === 0)) && (
                  <div className="py-8 text-center text-sm" style={{ color: 'var(--dashboard-muted)' }}>
                    No questions added yet. Click "Add Question" to get started.
                  </div>
                )}
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 rounded-xl px-6 py-3 text-sm font-semibold transition hover:opacity-90"
                  style={{
                    border: '1px solid var(--dashboard-border)',
                    backgroundColor: 'var(--dashboard-surface-solid)',
                    color: 'var(--dashboard-text)'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:opacity-90"
                  style={{ backgroundColor: 'var(--dashboard-primary)' }}
                >
                  {editingAssignment ? 'Update Assignment' : 'Create Assignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
