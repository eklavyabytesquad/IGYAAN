'use client';

import { useState, useEffect } from 'react';
import { BookOpen, FileText, Mic, Clock, CheckCircle, Award, Play, Send, Mic as MicIcon, Square } from 'lucide-react';
import { useAuth } from '../../../utils/auth_context';
import { supabase } from '../../../utils/supabase';

export default function StudentHomework() {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [activeView, setActiveView] = useState(null); // 'mcq' or 'viva'
  
  // MCQ State
  const [mcqAnswers, setMcqAnswers] = useState({});
  const [mcqSubmitted, setMcqSubmitted] = useState(false);
  const [mcqScore, setMcqScore] = useState(null);

  // Viva State
  const [currentVivaIndex, setCurrentVivaIndex] = useState(0);
  const [vivaAnswers, setVivaAnswers] = useState({});
  const [isRecording, setIsRecording] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [vivaCompleted, setVivaCompleted] = useState(false);
  const [vivaScore, setVivaScore] = useState(null);

  useEffect(() => {
    if (user?.school_id) {
      loadAssignments();
    }
    initSpeechRecognition();
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

  const initSpeechRecognition = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = 'en-US';

      recognitionInstance.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setCurrentTranscript(transcript);
      };

      recognitionInstance.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
      };

      setRecognition(recognitionInstance);
    } else {
      alert('Speech recognition not supported in this browser. Please use Chrome.');
    }
  };

  const startRecording = () => {
    if (recognition) {
      setCurrentTranscript('');
      recognition.start();
      setIsRecording(true);
    }
  };

  const stopRecording = () => {
    if (recognition) {
      recognition.stop();
      setIsRecording(false);
    }
  };

  const saveVivaAnswer = () => {
    if (currentTranscript.trim()) {
      const questions = selectedAssignment.questions || [];
      const question = questions[currentVivaIndex];
      setVivaAnswers({
        ...vivaAnswers,
        [question.id]: currentTranscript
      });
      setCurrentTranscript('');
      
      // Speak confirmation
      const utterance = new SpeechSynthesisUtterance('Answer saved. Next question.');
      window.speechSynthesis.speak(utterance);

      if (currentVivaIndex < questions.length - 1) {
        setCurrentVivaIndex(currentVivaIndex + 1);
        // Speak next question
        setTimeout(() => {
          const nextQuestion = questions[currentVivaIndex + 1];
          const questionUtterance = new SpeechSynthesisUtterance(nextQuestion.question);
          window.speechSynthesis.speak(questionUtterance);
        }, 1500);
      } else {
        setVivaCompleted(true);
        submitVivaAnswers();
      }
    } else {
      alert('Please record an answer before saving.');
    }
  };

  const speakQuestion = (question) => {
    const utterance = new SpeechSynthesisUtterance(question);
    window.speechSynthesis.speak(utterance);
  };

  const submitMCQ = async () => {
    let correct = 0;
    const questions = selectedAssignment.questions || [];
    
    questions.forEach((q) => {
      if (mcqAnswers[q.id] === q.correct_answer) {
        correct++;
      }
    });

    const score = questions.length > 0 ? (correct / questions.length) * 100 : 0;
    const marksObtained = (score / 100) * selectedAssignment.max_marks;
    
    setMcqScore(score);
    setMcqSubmitted(true);

    // Save submission to Supabase
    const { error } = await supabase
      .from('homework_submissions')
      .insert([{
        assignment_id: selectedAssignment.id,
        student_id: user.id,
        student_name: user.full_name,
        school_id: user.school_id,
        type: 'mcq',
        answers: mcqAnswers,
        score: score,
        marks_obtained: marksObtained,
        max_marks: selectedAssignment.max_marks,
      }]);

    if (error) {
      console.error('Error saving submission:', error);
      alert('Failed to submit. Please try again.');
    } else {
      alert(`Quiz submitted! You scored ${score.toFixed(1)}%`);
    }
  };

  const submitVivaAnswers = async () => {
    // Calculate score using AI (simulated for now)
    const questions = selectedAssignment.questions || [];
    const totalMarks = questions.reduce((sum, q) => sum + (q.marks || 5), 0);
    
    // Simple keyword-based scoring (in production, use ChatGPT API)
    let earnedMarks = 0;
    questions.forEach(q => {
      const answer = vivaAnswers[q.id] || '';
      if (answer.length > 20) { // Basic check
        earnedMarks += (q.marks || 5) * 0.7; // 70% for attempting with substantial answer
      }
    });

    const score = totalMarks > 0 ? (earnedMarks / totalMarks) * 100 : 0;
    const marksObtained = (score / 100) * selectedAssignment.max_marks;
    
    setVivaScore(score);

    // Save submission to Supabase
    const { error } = await supabase
      .from('homework_submissions')
      .insert([{
        assignment_id: selectedAssignment.id,
        student_id: user.id,
        student_name: user.full_name,
        school_id: user.school_id,
        type: 'viva',
        answers: vivaAnswers,
        score: score,
        marks_obtained: marksObtained,
        max_marks: selectedAssignment.max_marks,
      }]);

    if (error) {
      console.error('Error saving submission:', error);
      alert('Failed to submit. Please try again.');
    }

    const utterance = new SpeechSynthesisUtterance(`Viva completed! You scored ${score.toFixed(1)} percent.`);
    window.speechSynthesis.speak(utterance);
  };

  const startAssignment = (assignment) => {
    setSelectedAssignment(assignment);
    setActiveView(assignment.type);
    setMcqAnswers({});
    setMcqSubmitted(false);
    setMcqScore(null);
    setVivaAnswers({});
    setCurrentVivaIndex(0);
    setVivaCompleted(false);
    setVivaScore(null);

    // If viva, speak first question
    const questions = assignment.questions || [];
    if (assignment.type === 'viva' && questions.length > 0) {
      setTimeout(() => {
        const firstQuestion = questions[0];
        const utterance = new SpeechSynthesisUtterance(`Question 1: ${firstQuestion.question}`);
        window.speechSynthesis.speak(utterance);
      }, 1000);
    }
  };

  const closeAssignment = () => {
    setSelectedAssignment(null);
    setActiveView(null);
    if (recognition && isRecording) {
      recognition.stop();
      setIsRecording(false);
    }
    window.speechSynthesis.cancel();
  };

  return (
    <div className="dashboard-theme flex h-screen w-full flex-col gap-6 overflow-hidden p-4 lg:p-8">
      {/* Header */}
      <header className="dashboard-card rounded-3xl p-6 shadow-2xl">
        <div className="flex items-start gap-4">
          <span className="rounded-2xl p-4 text-white shadow-lg" style={{ backgroundColor: 'var(--dashboard-primary)' }}>
            <BookOpen size={28} />
          </span>
          <div className="flex-1">
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl" style={{ color: 'var(--dashboard-heading)' }}>
              My Homework
            </h1>
            <p className="mt-2 text-sm sm:text-base" style={{ color: 'var(--dashboard-muted)' }}>
              Complete assignments, take MCQ tests, and practice virtual viva
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl p-3" style={{
            backgroundColor: 'color-mix(in srgb, var(--dashboard-primary) 10%, transparent)',
            border: '1px solid color-mix(in srgb, var(--dashboard-primary) 20%, transparent)'
          }}>
            <p className="text-xs font-semibold" style={{ color: 'var(--dashboard-primary)' }}>Available</p>
            <p className="mt-1 text-2xl font-bold" style={{ color: 'var(--dashboard-heading)' }}>{assignments.length}</p>
          </div>
          <div className="rounded-xl p-3" style={{
            backgroundColor: 'color-mix(in srgb, var(--dashboard-primary) 10%, transparent)',
            border: '1px solid color-mix(in srgb, var(--dashboard-primary) 20%, transparent)'
          }}>
            <p className="text-xs font-semibold" style={{ color: 'var(--dashboard-primary)' }}>Completed</p>
            <p className="mt-1 text-2xl font-bold" style={{ color: 'var(--dashboard-heading)' }}>0</p>
          </div>
          <div className="rounded-xl p-3" style={{
            backgroundColor: 'color-mix(in srgb, var(--dashboard-primary) 10%, transparent)',
            border: '1px solid color-mix(in srgb, var(--dashboard-primary) 20%, transparent)'
          }}>
            <p className="text-xs font-semibold" style={{ color: 'var(--dashboard-primary)' }}>Avg Score</p>
            <p className="mt-1 text-2xl font-bold" style={{ color: 'var(--dashboard-heading)' }}>0%</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      {!selectedAssignment ? (
        <div className="dashboard-card flex-1 overflow-y-auto rounded-3xl p-6 shadow-2xl">
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {assignments.map((assignment) => (
              <div
                key={assignment.id}
                className="group relative overflow-hidden rounded-2xl shadow-lg transition hover:shadow-xl"
                style={{
                  border: '1px solid var(--dashboard-border)',
                  backgroundColor: 'var(--dashboard-surface-solid)'
                }}
              >
                <div className="p-5">
                  <div className="mb-3">
                    <h3 className="mb-2 text-lg font-bold" style={{ color: 'var(--dashboard-heading)' }}>{assignment.title}</h3>
                    <div className="flex flex-wrap gap-2">
                      <span className={`inline-flex items-center rounded-lg px-2 py-1 text-xs font-semibold`}
                        style={{
                          backgroundColor: assignment.type === 'mcq' ? '#dbeafe' : '#f3e8ff',
                          color: assignment.type === 'mcq' ? '#1e40af' : '#7e22ce'
                        }}>
                        {assignment.type === 'mcq' ? <FileText size={12} className="mr-1" /> : <Mic size={12} className="mr-1" />}
                        {assignment.type.toUpperCase()}
                      </span>
                      <span className="inline-flex items-center rounded-lg px-2 py-1 text-xs font-semibold"
                        style={{
                          backgroundColor: 'var(--dashboard-surface-muted)',
                          color: 'var(--dashboard-text)'
                        }}>
                        {assignment.subject}
                      </span>
                    </div>
                  </div>

                  <p className="mb-4 line-clamp-2 text-sm" style={{ color: 'var(--dashboard-muted)' }}>{assignment.description}</p>

                  <div className="mb-4 space-y-2 text-xs" style={{ color: 'var(--dashboard-muted)' }}>
                    <div className="flex items-center gap-2">
                      <Clock size={14} />
                      <span>Due: {new Date(assignment.deadline).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Award size={14} />
                      <span>Max Marks: {assignment.max_marks}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => startAssignment(assignment)}
                    className="w-full rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:opacity-90"
                    style={{ backgroundColor: 'var(--dashboard-primary)' }}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <Play size={16} />
                      <span>Start {assignment.type === 'mcq' ? 'Test' : 'Viva'}</span>
                    </div>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {assignments.length === 0 && (
            <div className="flex h-64 items-center justify-center" style={{ color: 'var(--dashboard-muted)' }}>
              <p>No homework assignments available at the moment.</p>
            </div>
          )}
        </div>
      ) : (
        <div className="dashboard-card flex-1 overflow-y-auto rounded-3xl p-6 shadow-2xl">
          {/* MCQ View */}
          {activeView === 'mcq' && (
            <div>
              <div className="mb-6">
                <h2 className="text-2xl font-bold" style={{ color: 'var(--dashboard-heading)' }}>{selectedAssignment.title}</h2>
                <p className="mt-2 text-sm" style={{ color: 'var(--dashboard-muted)' }}>{selectedAssignment.description}</p>
              </div>

              {!mcqSubmitted ? (
                <div className="space-y-6">
                  {(selectedAssignment.questions || []).map((question, index) => (
                    <div key={question.id} className="rounded-xl p-5" style={{
                      border: '1px solid var(--dashboard-border)',
                      backgroundColor: 'var(--dashboard-surface-solid)'
                    }}>
                      <h3 className="mb-4 font-semibold" style={{ color: 'var(--dashboard-heading)' }}>
                        {index + 1}. {question.question} <span className="text-sm" style={{ color: 'var(--dashboard-muted)' }}>({question.marks} marks)</span>
                      </h3>
                      <div className="space-y-2">
                        {question.options.map((option, optIndex) => (
                          <label
                            key={optIndex}
                            className="flex items-center gap-3 rounded-lg p-3 cursor-pointer transition hover:opacity-90"
                            style={{
                              border: '1px solid var(--dashboard-border)',
                              backgroundColor: 'var(--dashboard-surface-muted)'
                            }}
                          >
                            <input
                              type="radio"
                              name={`question-${question.id}`}
                              value={optIndex}
                              checked={mcqAnswers[question.id] === optIndex}
                              onChange={() => setMcqAnswers({ ...mcqAnswers, [question.id]: optIndex })}
                              className="h-4 w-4"
                            />
                            <span className="text-sm" style={{ color: 'var(--dashboard-text)' }}>{option}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}

                  <div className="flex gap-3">
                    <button
                      onClick={closeAssignment}
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
                      onClick={submitMCQ}
                      disabled={Object.keys(mcqAnswers).length !== (selectedAssignment.questions || []).length}
                      className="flex-1 rounded-xl px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ backgroundColor: 'var(--dashboard-primary)' }}
                    >
                      Submit Test
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full" style={{
                    backgroundColor: 'color-mix(in srgb, var(--dashboard-primary) 15%, transparent)'
                  }}>
                    <CheckCircle size={48} style={{ color: 'var(--dashboard-primary)' }} />
                  </div>
                  <h3 className="mb-2 text-2xl font-bold" style={{ color: 'var(--dashboard-heading)' }}>Test Completed!</h3>
                  <p className="mb-6 text-4xl font-bold" style={{ color: 'var(--dashboard-primary)' }}>{mcqScore?.toFixed(1)}%</p>
                  <p className="mb-6" style={{ color: 'var(--dashboard-muted)' }}>
                    You answered {Object.values(mcqAnswers).filter((ans, i) => ans === (selectedAssignment.questions || [])[i]?.correct_answer).length} out of {(selectedAssignment.questions || []).length} questions correctly.
                  </p>
                  <button
                    onClick={closeAssignment}
                    className="rounded-xl px-8 py-3 text-sm font-semibold text-white shadow-lg hover:opacity-90"
                    style={{ backgroundColor: 'var(--dashboard-primary)' }}
                  >
                    Back to Homework
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Viva View */}
          {activeView === 'viva' && (
            <div>
              <div className="mb-6">
                <h2 className="text-2xl font-bold" style={{ color: 'var(--dashboard-heading)' }}>{selectedAssignment.title}</h2>
                <p className="mt-2 text-sm" style={{ color: 'var(--dashboard-muted)' }}>Virtual Viva - Speak your answers</p>
              </div>

              {!vivaCompleted ? (
                <div>
                  <div className="mb-6 rounded-xl p-4" style={{
                    backgroundColor: '#f3e8ff',
                    border: '1px solid #e9d5ff'
                  }}>
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-sm font-semibold" style={{ color: '#7e22ce' }}>
                        Question {currentVivaIndex + 1} of {(selectedAssignment.questions || []).length}
                      </span>
                      <span className="text-sm" style={{ color: '#a855f7' }}>
                        {(selectedAssignment.questions || [])[currentVivaIndex]?.marks || 5} marks
                      </span>
                    </div>
                    <h3 className="text-lg font-bold" style={{ color: '#7e22ce' }}>
                      {(selectedAssignment.questions || [])[currentVivaIndex]?.question}
                    </h3>
                    <button
                      onClick={() => speakQuestion((selectedAssignment.questions || [])[currentVivaIndex]?.question)}
                      className="mt-3 flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
                      style={{ backgroundColor: '#a855f7' }}
                    >
                      <Play size={16} />
                      Speak Question
                    </button>
                  </div>

                  <div className="mb-6 rounded-xl border-2 border-dashed p-6" style={{ borderColor: 'var(--dashboard-border)' }}>
                    <div className="mb-4 flex items-center justify-center">
                      {!isRecording ? (
                        <button
                          onClick={startRecording}
                          className="flex h-24 w-24 items-center justify-center rounded-full bg-red-500 text-white shadow-lg transition hover:bg-red-600"
                        >
                          <MicIcon size={40} />
                        </button>
                      ) : (
                        <button
                          onClick={stopRecording}
                          className="flex h-24 w-24 items-center justify-center rounded-full bg-red-600 text-white shadow-lg animate-pulse"
                        >
                          <Square size={40} />
                        </button>
                      )}
                    </div>
                    <p className="text-center text-sm font-semibold" style={{ color: 'var(--dashboard-text)' }}>
                      {isRecording ? 'Recording... Click to stop' : 'Click microphone to start recording'}
                    </p>

                    {currentTranscript && (
                      <div className="mt-4 rounded-lg p-4" style={{ backgroundColor: 'var(--dashboard-surface-muted)' }}>
                        <p className="text-sm" style={{ color: 'var(--dashboard-text)' }}>{currentTranscript}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={closeAssignment}
                      className="flex-1 rounded-xl px-6 py-3 text-sm font-semibold transition hover:opacity-90"
                      style={{
                        border: '1px solid var(--dashboard-border)',
                        backgroundColor: 'var(--dashboard-surface-solid)',
                        color: 'var(--dashboard-text)'
                      }}
                    >
                      Exit Viva
                    </button>
                    <button
                      onClick={saveVivaAnswer}
                      disabled={!currentTranscript.trim()}
                      className="flex-1 rounded-xl px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ backgroundColor: 'var(--dashboard-primary)' }}
                    >
                      <div className="flex items-center justify-center gap-2">
                        <Send size={16} />
                        {currentVivaIndex < (selectedAssignment.questions || []).length - 1 ? 'Next Question' : 'Submit Viva'}
                      </div>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full" style={{
                    backgroundColor: '#f3e8ff'
                  }}>
                    <CheckCircle size={48} style={{ color: '#a855f7' }} />
                  </div>
                  <h3 className="mb-2 text-2xl font-bold" style={{ color: 'var(--dashboard-heading)' }}>Viva Completed!</h3>
                  <p className="mb-6 text-4xl font-bold" style={{ color: '#a855f7' }}>{vivaScore?.toFixed(1)}%</p>
                  <p className="mb-8" style={{ color: 'var(--dashboard-muted)' }}>
                    Your answers have been recorded and evaluated.
                  </p>
                  <button
                    onClick={closeAssignment}
                    className="rounded-xl px-8 py-3 text-sm font-semibold text-white shadow-lg hover:opacity-90"
                    style={{ backgroundColor: '#a855f7' }}
                  >
                    Back to Homework
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
