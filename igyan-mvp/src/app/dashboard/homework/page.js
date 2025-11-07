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
        <p className="text-zinc-600">Only teachers can access this page.</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full flex-col gap-6 overflow-hidden bg-linear-to-br from-amber-50 via-orange-50 to-yellow-50 p-4 lg:p-8 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
      {/* Header */}
      <header className="rounded-3xl border border-white/60 bg-white/80 p-6 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-zinc-900/80">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            <span className="rounded-2xl bg-linear-to-r from-amber-500 via-orange-500 to-yellow-500 p-4 text-white shadow-lg">
              <BookOpen size={28} />
            </span>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-zinc-800 dark:text-zinc-100 sm:text-4xl">
                Homework Management
              </h1>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400 sm:text-base">
                Create gamified homework, MCQs, and virtual viva questions
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 rounded-2xl bg-linear-to-r from-amber-500 via-orange-500 to-yellow-500 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:shadow-amber-400/40"
          >
            <Plus size={20} />
            <span>Create Assignment</span>
          </button>
        </div>

        {/* Search & Filter */}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Search assignments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-zinc-200 bg-white px-10 py-2.5 text-sm outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-200/70 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={20} className="text-zinc-500" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-amber-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            >
              <option value="all">All Types</option>
              <option value="mcq">MCQ</option>
              <option value="viva">Virtual Viva</option>
            </select>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 dark:border-amber-900 dark:bg-amber-950">
            <p className="text-xs font-semibold text-amber-600 dark:text-amber-400">Total Assignments</p>
            <p className="mt-1 text-2xl font-bold text-amber-900 dark:text-amber-100">{assignments.length}</p>
          </div>
          <div className="rounded-xl border border-orange-200 bg-orange-50 p-3 dark:border-orange-900 dark:bg-orange-950">
            <p className="text-xs font-semibold text-orange-600 dark:text-orange-400">MCQ Tests</p>
            <p className="mt-1 text-2xl font-bold text-orange-900 dark:text-orange-100">
              {assignments.filter(a => a.type === 'mcq').length}
            </p>
          </div>
          <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-3 dark:border-yellow-900 dark:bg-yellow-950">
            <p className="text-xs font-semibold text-yellow-600 dark:text-yellow-400">Virtual Viva</p>
            <p className="mt-1 text-2xl font-bold text-yellow-900 dark:text-yellow-100">
              {assignments.filter(a => a.type === 'viva').length}
            </p>
          </div>
        </div>
      </header>

      {/* Assignments Grid */}
      <div className="flex-1 overflow-y-auto rounded-3xl border border-white/60 bg-white/80 p-6 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-zinc-900/80">
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredAssignments.map((assignment) => (
            <div
              key={assignment.id}
              className="group relative overflow-hidden rounded-2xl border border-white/60 bg-white shadow-lg transition hover:shadow-xl dark:border-white/10 dark:bg-zinc-900"
            >
              <div className="p-5">
                <div className="mb-3 flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="mb-1 text-lg font-bold text-zinc-800 dark:text-zinc-100">{assignment.title}</h3>
                    <span className={`inline-flex items-center rounded-lg px-2 py-1 text-xs font-semibold ${
                      assignment.type === 'mcq' ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300' :
                      'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300'
                    }`}>
                      {assignment.type === 'mcq' ? <FileText size={12} className="mr-1" /> : <Mic size={12} className="mr-1" />}
                      {assignment.type.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(assignment)}
                      className="rounded-lg p-2 text-amber-600 transition hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-950"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(assignment.id)}
                      className="rounded-lg p-2 text-red-600 transition hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <p className="mb-4 line-clamp-2 text-sm text-zinc-600 dark:text-zinc-400">{assignment.description}</p>

                <div className="space-y-2 text-xs text-zinc-600 dark:text-zinc-400">
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
          <div className="flex h-64 items-center justify-center text-zinc-500">
            <p>No assignments found. Create your first assignment!</p>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
          <div className="my-8 w-full max-w-4xl rounded-3xl border border-white/60 bg-white p-6 shadow-2xl dark:border-white/10 dark:bg-zinc-900 max-h-[90vh] overflow-y-auto">
            <h2 className="mb-6 text-2xl font-bold text-zinc-800 dark:text-zinc-100">
              {editingAssignment ? 'Edit Assignment' : 'Create New Assignment'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Basic Info */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-semibold text-zinc-700 dark:text-zinc-300">Title</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-amber-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                    placeholder="Assignment title"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-semibold text-zinc-700 dark:text-zinc-300">Subject</label>
                  <input
                    type="text"
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-amber-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                    placeholder="Mathematics, Science, etc."
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold text-zinc-700 dark:text-zinc-300">Description</label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-amber-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                  placeholder="Assignment instructions..."
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="mb-1 block text-sm font-semibold text-zinc-700 dark:text-zinc-300">Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => {
                      setFormData({ ...formData, type: e.target.value });
                      setActiveTab(e.target.value);
                    }}
                    className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-amber-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                  >
                    <option value="mcq">MCQ Test</option>
                    <option value="viva">Virtual Viva</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-semibold text-zinc-700 dark:text-zinc-300">Deadline</label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.deadline}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                    className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-amber-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-semibold text-zinc-700 dark:text-zinc-300">Max Marks</label>
                  <input
                    type="number"
                    required
                    value={formData.max_marks}
                    onChange={(e) => setFormData({ ...formData, max_marks: e.target.value })}
                    className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-amber-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                    placeholder="100"
                  />
                </div>
              </div>

              {/* Questions Section */}
              <div className="mt-6 rounded-xl border-2 border-dashed border-zinc-200 p-4 dark:border-zinc-700">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-bold text-zinc-800 dark:text-zinc-100">
                    {formData.type === 'mcq' ? 'MCQ Questions' : 'Viva Questions'}
                  </h3>
                  <button
                    type="button"
                    onClick={formData.type === 'mcq' ? addMCQQuestion : addVivaQuestion}
                    className="flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-600"
                  >
                    <Plus size={16} />
                    Add Question
                  </button>
                </div>

                {/* MCQ Questions */}
                {formData.type === 'mcq' && formData.mcq_questions.map((q, qIndex) => (
                  <div key={q.id} className="mb-4 rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-800">
                    <div className="mb-3 flex items-start justify-between">
                      <h4 className="font-semibold text-zinc-700 dark:text-zinc-300">Question {qIndex + 1}</h4>
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
                      className="mb-3 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100"
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
                            className="flex-1 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100"
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
                        className="w-24 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100"
                      />
                      <span className="ml-2 text-xs text-zinc-600 dark:text-zinc-400">marks</span>
                    </div>
                  </div>
                ))}

                {/* Viva Questions */}
                {formData.type === 'viva' && formData.viva_questions.map((q, qIndex) => (
                  <div key={q.id} className="mb-4 rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-800">
                    <div className="mb-3 flex items-start justify-between">
                      <h4 className="font-semibold text-zinc-700 dark:text-zinc-300">Question {qIndex + 1}</h4>
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
                      className="mb-3 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100"
                    />
                    <textarea
                      value={q.suggested_answer}
                      onChange={(e) => updateVivaQuestion(qIndex, 'suggested_answer', e.target.value)}
                      placeholder="Suggested answer (optional)"
                      rows={2}
                      className="mb-3 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100"
                    />
                    <div>
                      <input
                        type="number"
                        required
                        min="1"
                        value={q.marks}
                        onChange={(e) => updateVivaQuestion(qIndex, 'marks', parseInt(e.target.value))}
                        placeholder="Marks"
                        className="w-24 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100"
                      />
                      <span className="ml-2 text-xs text-zinc-600 dark:text-zinc-400">marks</span>
                    </div>
                  </div>
                ))}

                {((formData.type === 'mcq' && formData.mcq_questions.length === 0) ||
                  (formData.type === 'viva' && formData.viva_questions.length === 0)) && (
                  <div className="py-8 text-center text-sm text-zinc-500">
                    No questions added yet. Click "Add Question" to get started.
                  </div>
                )}
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 rounded-xl border border-zinc-200 bg-white px-6 py-3 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-linear-to-r from-amber-500 via-orange-500 to-yellow-500 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:shadow-amber-400/40"
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
