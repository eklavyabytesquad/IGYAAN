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
    <div className="flex h-screen w-full flex-col gap-6 overflow-hidden bg-linear-to-br from-green-50 via-emerald-50 to-teal-50 p-4 lg:p-8 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
      {/* Header */}
      <header className="rounded-3xl border border-white/60 bg-white/80 p-6 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-zinc-900/80">
        <div className="flex items-start gap-4">
          <span className="rounded-2xl bg-linear-to-r from-green-500 via-emerald-500 to-teal-500 p-4 text-white shadow-lg">
            <BookOpen size={28} />
          </span>
          <div className="flex-1">
            <h1 className="text-3xl font-bold tracking-tight text-zinc-800 dark:text-zinc-100 sm:text-4xl">
              My Homework
            </h1>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400 sm:text-base">
              Complete assignments, take MCQ tests, and practice virtual viva
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-green-200 bg-green-50 p-3 dark:border-green-900 dark:bg-green-950">
            <p className="text-xs font-semibold text-green-600 dark:text-green-400">Available</p>
            <p className="mt-1 text-2xl font-bold text-green-900 dark:text-green-100">{assignments.length}</p>
          </div>
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 dark:border-emerald-900 dark:bg-emerald-950">
            <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Completed</p>
            <p className="mt-1 text-2xl font-bold text-emerald-900 dark:text-emerald-100">0</p>
          </div>
          <div className="rounded-xl border border-teal-200 bg-teal-50 p-3 dark:border-teal-900 dark:bg-teal-950">
            <p className="text-xs font-semibold text-teal-600 dark:text-teal-400">Avg Score</p>
            <p className="mt-1 text-2xl font-bold text-teal-900 dark:text-teal-100">0%</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      {!selectedAssignment ? (
        <div className="flex-1 overflow-y-auto rounded-3xl border border-white/60 bg-white/80 p-6 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-zinc-900/80">
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {assignments.map((assignment) => (
              <div
                key={assignment.id}
                className="group relative overflow-hidden rounded-2xl border border-white/60 bg-white shadow-lg transition hover:shadow-xl dark:border-white/10 dark:bg-zinc-900"
              >
                <div className="p-5">
                  <div className="mb-3">
                    <h3 className="mb-2 text-lg font-bold text-zinc-800 dark:text-zinc-100">{assignment.title}</h3>
                    <div className="flex flex-wrap gap-2">
                      <span className={`inline-flex items-center rounded-lg px-2 py-1 text-xs font-semibold ${
                        assignment.type === 'mcq' ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300' :
                        'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300'
                      }`}>
                        {assignment.type === 'mcq' ? <FileText size={12} className="mr-1" /> : <Mic size={12} className="mr-1" />}
                        {assignment.type.toUpperCase()}
                      </span>
                      <span className="inline-flex items-center rounded-lg bg-zinc-100 px-2 py-1 text-xs font-semibold text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                        {assignment.subject}
                      </span>
                    </div>
                  </div>

                  <p className="mb-4 line-clamp-2 text-sm text-zinc-600 dark:text-zinc-400">{assignment.description}</p>

                  <div className="mb-4 space-y-2 text-xs text-zinc-600 dark:text-zinc-400">
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
                    className="w-full rounded-xl bg-linear-to-r from-green-500 via-emerald-500 to-teal-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:shadow-green-400/40"
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
            <div className="flex h-64 items-center justify-center text-zinc-500">
              <p>No homework assignments available at the moment.</p>
            </div>
          )}
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto rounded-3xl border border-white/60 bg-white/80 p-6 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-zinc-900/80">
          {/* MCQ View */}
          {activeView === 'mcq' && (
            <div>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-zinc-800 dark:text-zinc-100">{selectedAssignment.title}</h2>
                <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{selectedAssignment.description}</p>
              </div>

              {!mcqSubmitted ? (
                <div className="space-y-6">
                  {(selectedAssignment.questions || []).map((question, index) => (
                    <div key={question.id} className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-700 dark:bg-zinc-900">
                      <h3 className="mb-4 font-semibold text-zinc-800 dark:text-zinc-100">
                        {index + 1}. {question.question} <span className="text-sm text-zinc-500">({question.marks} marks)</span>
                      </h3>
                      <div className="space-y-2">
                        {question.options.map((option, optIndex) => (
                          <label
                            key={optIndex}
                            className="flex items-center gap-3 rounded-lg border border-zinc-200 p-3 cursor-pointer transition hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
                          >
                            <input
                              type="radio"
                              name={`question-${question.id}`}
                              value={optIndex}
                              checked={mcqAnswers[question.id] === optIndex}
                              onChange={() => setMcqAnswers({ ...mcqAnswers, [question.id]: optIndex })}
                              className="h-4 w-4"
                            />
                            <span className="text-sm text-zinc-700 dark:text-zinc-300">{option}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}

                  <div className="flex gap-3">
                    <button
                      onClick={closeAssignment}
                      className="flex-1 rounded-xl border border-zinc-200 bg-white px-6 py-3 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={submitMCQ}
                      disabled={Object.keys(mcqAnswers).length !== (selectedAssignment.questions || []).length}
                      className="flex-1 rounded-xl bg-linear-to-r from-green-500 via-emerald-500 to-teal-500 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:shadow-green-400/40 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Submit Test
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-green-100 dark:bg-green-950">
                    <CheckCircle size={48} className="text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="mb-2 text-2xl font-bold text-zinc-800 dark:text-zinc-100">Test Completed!</h3>
                  <p className="mb-6 text-4xl font-bold text-green-600 dark:text-green-400">{mcqScore?.toFixed(1)}%</p>
                  <p className="mb-6 text-zinc-600 dark:text-zinc-400">
                    You answered {Object.values(mcqAnswers).filter((ans, i) => ans === (selectedAssignment.questions || [])[i]?.correct_answer).length} out of {(selectedAssignment.questions || []).length} questions correctly.
                  </p>
                  <button
                    onClick={closeAssignment}
                    className="rounded-xl bg-linear-to-r from-green-500 via-emerald-500 to-teal-500 px-8 py-3 text-sm font-semibold text-white shadow-lg"
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
                <h2 className="text-2xl font-bold text-zinc-800 dark:text-zinc-100">{selectedAssignment.title}</h2>
                <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">Virtual Viva - Speak your answers</p>
              </div>

              {!vivaCompleted ? (
                <div>
                  <div className="mb-6 rounded-xl bg-purple-50 p-4 dark:bg-purple-950">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-sm font-semibold text-purple-900 dark:text-purple-100">
                        Question {currentVivaIndex + 1} of {(selectedAssignment.questions || []).length}
                      </span>
                      <span className="text-sm text-purple-700 dark:text-purple-300">
                        {(selectedAssignment.questions || [])[currentVivaIndex]?.marks || 5} marks
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-purple-900 dark:text-purple-100">
                      {(selectedAssignment.questions || [])[currentVivaIndex]?.question}
                    </h3>
                    <button
                      onClick={() => speakQuestion((selectedAssignment.questions || [])[currentVivaIndex]?.question)}
                      className="mt-3 flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-700"
                    >
                      <Play size={16} />
                      Speak Question
                    </button>
                  </div>

                  <div className="mb-6 rounded-xl border-2 border-dashed border-zinc-300 p-6 dark:border-zinc-700">
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
                    <p className="text-center text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                      {isRecording ? 'Recording... Click to stop' : 'Click microphone to start recording'}
                    </p>

                    {currentTranscript && (
                      <div className="mt-4 rounded-lg bg-zinc-50 p-4 dark:bg-zinc-800">
                        <p className="text-sm text-zinc-700 dark:text-zinc-300">{currentTranscript}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={closeAssignment}
                      className="flex-1 rounded-xl border border-zinc-200 bg-white px-6 py-3 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                    >
                      Exit Viva
                    </button>
                    <button
                      onClick={saveVivaAnswer}
                      disabled={!currentTranscript.trim()}
                      className="flex-1 rounded-xl bg-linear-to-r from-green-500 via-emerald-500 to-teal-500 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:shadow-green-400/40 disabled:opacity-50 disabled:cursor-not-allowed"
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
                  <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-950">
                    <CheckCircle size={48} className="text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="mb-2 text-2xl font-bold text-zinc-800 dark:text-zinc-100">Viva Completed!</h3>
                  <p className="mb-6 text-4xl font-bold text-purple-600 dark:text-purple-400">{vivaScore?.toFixed(1)}%</p>
                  <p className="mb-8 text-zinc-600 dark:text-zinc-400">
                    Your answers have been recorded and evaluated.
                  </p>
                  <button
                    onClick={closeAssignment}
                    className="rounded-xl bg-linear-to-r from-purple-500 via-purple-600 to-purple-700 px-8 py-3 text-sm font-semibold text-white shadow-lg"
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
