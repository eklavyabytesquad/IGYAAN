'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Upload, Send, FileText, Trash2, Loader2, Mic, StopCircle, Timer } from 'lucide-react';

export default function SharkAI() {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [fileId, setFileId] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isPitchMode, setIsPitchMode] = useState(false);
  const [pitchTimer, setPitchTimer] = useState(300); // 5 minutes in seconds
  const [timerRunning, setTimerRunning] = useState(false);
  const [pdfContent, setPdfContent] = useState('');
  const [pdfTitle, setPdfTitle] = useState('');
  const [hasStartedPitch, setHasStartedPitch] = useState(false);
  const [pitchTranscript, setPitchTranscript] = useState('');
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const timerIntervalRef = useRef(null);
  const synthRef = useRef(null);

  // Using Next.js API routes as proxy to avoid CORS issues
  const API_URL = '/api/shark-ai';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize Speech Recognition and Speech Synthesis
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Speech Recognition
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event) => {
          let interimTranscript = '';
          let finalTranscript = '';

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcript + ' ';
            } else {
              interimTranscript += transcript;
            }
          }

          if (finalTranscript) {
            setPitchTranscript(prev => prev + finalTranscript);
            setInputMessage(prev => prev + finalTranscript);
          }
        };

        recognition.onerror = (event) => {
          console.error('Speech recognition error:', event.error);
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }

      // Speech Synthesis
      synthRef.current = window.speechSynthesis;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, []);

  // Timer countdown
  useEffect(() => {
    if (timerRunning && pitchTimer > 0) {
      timerIntervalRef.current = setInterval(() => {
        setPitchTimer(prev => {
          if (prev <= 1) {
            stopPitchRecording();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    }

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [timerRunning, pitchTimer]);

  const speakText = (text) => {
    if (synthRef.current) {
      synthRef.current.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      synthRef.current.speak(utterance);
    }
  };

  const extractPDFContent = async (file) => {
    try {
      // Use the extract-pdf API route
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/extract-pdf', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to extract PDF content');
      }

      const data = await response.json();
      return {
        content: data.text || '',
        title: data.title || file.name
      };
    } catch (error) {
      console.error('Error extracting PDF:', error);
      return {
        content: '',
        title: file.name
      };
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Accept multiple file types
    const allowedTypes = [
      'application/pdf',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'text/plain',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];

    if (!allowedTypes.includes(file.type)) {
      alert('Please upload a valid document (PDF, PPT, PPTX, TXT, DOC, or DOCX)');
      return;
    }

    setUploadedFile(file);
    setIsProcessing(true);

    try {
      console.log('Uploading file to AI Shark API:', file.name);

      // Extract PDF content first
      const { content, title } = await extractPDFContent(file);
      setPdfContent(content);
      setPdfTitle(title);

      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_URL}/upload`, {
        method: 'POST',
        body: formData,
      }).catch(err => {
        console.error('Network error:', err);
        throw new Error('Network error. Please check your connection.');
      });

      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          throw new Error(`Server error: ${response.status} - ${errorText}`);
        }
        throw new Error(errorData.error || 'Failed to upload file');
      }

      const data = await response.json();
      console.log('File uploaded successfully:', data);

      setFileId(data.file_id);

      // Personalized greeting based on PDF
      const greeting = `🦈 Hello Entrepreneur! I'm Shark AI, and I've just reviewed your document "${title}". I'm excited to hear about your idea!\n\n📋 I've analyzed your business plan and I'm ready to evaluate your pitch. When you're ready, click the "Start Pitch" button below. You'll have 5 minutes to present your idea using voice or text.\n\n💡 I'll be evaluating:\n• Clarity and structure of your pitch\n• Understanding of your business model\n• Market opportunity and competition\n• Financial projections and ask\n• Your passion and communication skills\n\nTake a deep breath, and when you're ready, let's hear what you've got! 🎤`;

      setMessages([
        {
          role: 'assistant',
          content: greeting,
        },
      ]);

      // Speak the greeting
      speakText(`Hello Entrepreneur! I'm Shark AI, and I've just reviewed your document about ${title}. I'm excited to hear about your idea! When you're ready, click the Start Pitch button. You'll have 5 minutes to present your idea. Good luck!`);

    } catch (error) {
      console.error('Error processing document:', error);
      setMessages([
        {
          role: 'assistant',
          content: `❌ Sorry, there was an error processing your document: ${error.message}. Please try again.`,
        },
      ]);
      setUploadedFile(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    setFileId('');
    setMessages([]);
    setPdfContent('');
    setPdfTitle('');
    setIsPitchMode(false);
    setHasStartedPitch(false);
    setPitchTranscript('');
    setPitchTimer(300);
    setTimerRunning(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
    if (synthRef.current) {
      synthRef.current.cancel();
    }
  };

  const startPitchMode = () => {
    setIsPitchMode(true);
    setHasStartedPitch(true);
    setPitchTimer(300);
    setPitchTranscript('');
    setInputMessage('');
    setTimerRunning(true);

    const startMessage = "🎬 Your 5-minute pitch timer has started! Speak clearly and confidently. You can use the microphone button to record your voice, or type your pitch. Remember to cover your business model, market opportunity, and what you're asking for. Good luck!";
    
    setMessages(prev => [...prev, {
      role: 'assistant',
      content: startMessage,
    }]);

    speakText("Your pitch timer has started! You have 5 minutes. Good luck!");
  };

  const stopPitchRecording = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
    setTimerRunning(false);

    if (pitchTranscript.trim() || inputMessage.trim()) {
      // Auto-submit the pitch
      handleSubmitPitch();
    }
  };

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in your browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const handleSubmitPitch = async () => {
    const fullPitch = inputMessage.trim();
    
    if (!fullPitch) {
      alert('Please provide your pitch before submitting!');
      return;
    }

    // Validate minimum pitch length (at least 50 characters for a meaningful pitch)
    if (fullPitch.length < 50) {
      alert('Your pitch seems too short. Please provide a more detailed pitch covering your business model, market opportunity, and ask.');
      return;
    }

    // Basic validation for gibberish - check if pitch has meaningful words
    const meaningfulWords = ['business', 'product', 'service', 'market', 'customer', 'revenue', 'solution', 'problem', 'company', 'startup', 'invest', 'capital', 'funding', 'team', 'technology', 'sales', 'growth', 'opportunity', 'model', 'strategy'];
    const lowerPitch = fullPitch.toLowerCase();
    const hasMeaningfulContent = meaningfulWords.some(word => lowerPitch.includes(word));
    
    if (!hasMeaningfulContent) {
      alert('Your pitch doesn\'t seem to contain business-related content. Please provide a proper pitch covering your business model, market opportunity, and what you\'re asking for.');
      return;
    }

    setTimerRunning(false);
    setIsPitchMode(false);

    const userMessage = {
      role: 'user',
      content: fullPitch,
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setPitchTranscript('');
    setIsLoading(true);

    try {
      if (!fileId) {
        throw new Error('Document session not found. Please re-upload your file and try again.');
      }

      const evaluationPrompt = `You are Shark AI, a tough but fair investor evaluating business pitches. You must be critical and honest in your assessment.

BUSINESS DOCUMENT INSIGHTS (truncated to 3,000 characters):
${pdfContent.substring(0, 3000)}

ENTREPRENEUR'S PITCH:
${fullPitch}

CRITICAL EVALUATION RULES:
- FIRST: Check if the pitch is coherent and makes sense. If the pitch is gibberish, nonsensical, or completely unrelated to the business document, give it a score of 0/100 and clearly state it's invalid.
- The pitch must demonstrate clear communication and reference specific aspects of the business.
- The pitch must align with and expand upon the business document provided.
- Random characters, repeated words, or nonsensical text should receive 0 points.
- A pitch that doesn't discuss the business model, market, financials, or ask should score very low (0-20/100).

EVALUATION REQUIREMENTS (ONLY IF PITCH IS VALID):
1. Pitch Clarity & Structure (0-20 points) - Is the pitch organized, coherent, and easy to follow?
2. Business Model Understanding (0-20 points) - Does the pitch show deep understanding of how the business works?
3. Market Opportunity (0-20 points) - Does the pitch identify and articulate the market need and opportunity?
4. Financial Projections & Ask (0-20 points) - Are there clear, realistic financial goals and specific asks?
5. Communication & Passion (0-20 points) - Does the entrepreneur communicate effectively and show genuine passion?

Respond with:
- Overall Score (out of 100)
- Score breakdown for each criterion
- Top strengths of the pitch (or why it failed if invalid)
- Key areas for improvement
- Whether you would invest (Yes/No/Maybe) with reasoning
- Actionable advice for the entrepreneur

Be brutally honest. If the pitch is garbage, say so. If it's gibberish, give 0/100 and explain why. Use engaging language with a few relevant emojis. Response should come in a structured, organised & pretty format.`;

      const response = await fetch(`${API_URL}/ask`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          file_id: fileId,
          query: evaluationPrompt,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          throw new Error(`Failed to get evaluation: ${response.status} ${errorText}`);
        }
        throw new Error(errorData.error || 'Failed to get evaluation');
      }

      const data = await response.json();
      const evaluation = data.answer || data.response;

      if (!evaluation) {
        throw new Error('Evaluation response missing expected fields.');
      }

      const assistantMessage = {
        role: 'assistant',
        content: evaluation,
      };

      setMessages(prev => [...prev, assistantMessage]);
      speakText("Thank you for your pitch! I've completed my evaluation. Check the detailed feedback on screen.");
    } catch (error) {
      console.error('Error evaluating pitch:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `❌ Sorry, there was an error evaluating your pitch: ${error.message}`,
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !uploadedFile || !fileId) return;

    const userMessage = {
      role: 'user',
      content: inputMessage,
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentQuestion = inputMessage;
    setInputMessage('');
    setIsLoading(true);

    try {
      console.log('Sending question to AI Shark API:', currentQuestion);
      console.log('File ID:', fileId);

      // Add timeout to prevent hanging
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout

      const response = await fetch(`${API_URL}/ask`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          file_id: fileId,
          query: currentQuestion,
        }),
        signal: controller.signal,
      }).catch(err => {
        clearTimeout(timeoutId);
        console.error('Network error:', err);
        if (err.name === 'AbortError') {
          throw new Error('Request timed out. The AI is taking too long to respond. Please try again.');
        }
        throw new Error('Network error. Please check your connection.');
      });

      clearTimeout(timeoutId);
      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          throw new Error(`Server error: ${response.status} - ${errorText}`);
        }
        throw new Error(errorData.error || 'Failed to get response');
      }

      const data = await response.json();
      console.log('Response received:', data);
      console.log('Answer field:', data.answer);
      console.log('Response field:', data.response);

      // Check if we got a valid response (API returns "response" not "answer")
      const answerText = data.answer || data.response;
      
      if (!data || !answerText) {
        console.error('Invalid response format:', data);
        throw new Error('Invalid response format from API. Expected "answer" or "response" field.');
      }

      const assistantMessage = {
        role: 'assistant',
        content: answerText,
      };

      console.log('Adding assistant message:', assistantMessage);
      setMessages((prev) => {
        const newMessages = [...prev, assistantMessage];
        console.log('Updated messages array:', newMessages);
        return newMessages;
      });
    } catch (error) {
      console.error('Error sending message:', error);
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `❌ Sorry, there was an error: ${error.message}`,
        },
      ]);
    } finally {
      console.log('Setting isLoading to false');
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !isPitchMode) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 dark:from-zinc-950 dark:via-zinc-900 dark:to-slate-900 p-3 md:p-6 relative overflow-hidden">
      {/* Animated Grid Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-grid-pattern opacity-20 dark:opacity-10 animate-grid-move"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-slate-50/80 dark:to-zinc-950/80"></div>
      </div>
      
      <div className="max-w-[1600px] mx-auto relative z-10">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 md:gap-6">
          {/* Left Sidebar - Shark Avatar & Upload */}
          <div className="xl:col-span-4">
            <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-600 dark:from-indigo-700 dark:via-purple-700 dark:to-blue-700 rounded-2xl shadow-xl p-6 xl:sticky xl:top-6 relative overflow-hidden">
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-400/10 rounded-full blur-2xl"></div>
              
              <div className="relative">
                {/* Shark Avatar Section */}
                <div className="flex flex-col items-center mb-6">
                  <div className="relative">
                    <div className="w-48 h-48 rounded-full bg-linear-to-br from-blue-400/20 to-purple-500/20 backdrop-blur-sm flex items-center justify-center mb-4 border-4 border-white/20 shadow-2xl">
                      <Image 
                        src="/asset/ai-shark/suitshark.png" 
                        alt="Shark AI"
                        width={160}
                        height={160}
                        className="w-40 h-40 object-contain"
                        priority
                      />
                    </div>
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-white/20 backdrop-blur-md rounded-full border border-white/30">
                      <div className="flex items-center gap-2">
                        <Mic className="w-3 h-3 text-white" />
                        <span className="text-xs font-semibold text-white">Standing by</span>
                      </div>
                    </div>
                  </div>
                  
                  <h2 className="text-2xl font-bold text-white text-center mb-2">Meet Shark AI</h2>
                  <p className="text-white/80 text-center text-sm leading-relaxed px-4">
                    I am your investor-style copilot. Upload a business deck, pitch with confidence, and I will evaluate your idea in real time—just like the boardroom, but friendlier.
                  </p>
                </div>

                {/* Status Badges */}
                <div className="flex gap-2 justify-center mb-6">
                  <div className="px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
                    <span className="text-xs font-medium text-white">DOCUMENT INSIGHT</span>
                  </div>
                  <div className="px-3 py-1.5 bg-emerald-500/20 backdrop-blur-sm rounded-lg border border-emerald-400/30">
                    <span className="text-xs font-medium text-emerald-100">READY</span>
                  </div>
                </div>

                {/* Upload Section */}
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 mb-4">
                  <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                    <Upload className="w-5 h-5" />
                    Upload Document
                  </h3>

                  {!uploadedFile ? (
                    <div
                      className="border-2 border-dashed border-white/30 rounded-xl p-8 text-center cursor-pointer hover:border-white/50 hover:bg-white/5 transition-all group"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <FileText className="mx-auto mb-3 text-white/60 group-hover:text-white/80 transition-colors" size={40} />
                      <p className="text-white font-medium mb-1">Drop your deck here</p>
                      <p className="text-xs text-white/70">PDF, PPT, PPTX, TXT, DOC, DOCX</p>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf,.ppt,.pptx,.txt,.doc,.docx"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </div>
                  ) : (
                    <div className="bg-white/95 dark:bg-zinc-800 rounded-xl p-4">
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div className="flex items-start space-x-3 flex-1 min-w-0">
                          <FileText className="text-indigo-600 mt-1 shrink-0" size={20} />
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-zinc-800 dark:text-zinc-200 text-sm truncate">
                              {uploadedFile.name}
                            </p>
                            <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">
                              {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={handleRemoveFile}
                          className="text-red-500 hover:text-red-700 transition-colors shrink-0 p-1 hover:bg-red-50 rounded-lg"
                          title="Remove file"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                      {isProcessing && (
                        <div className="flex items-center text-indigo-600 text-sm">
                          <Loader2 className="animate-spin mr-2" size={14} />
                          <span>Analyzing document...</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Status Info */}
                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                  <div className="text-xs text-white/90 space-y-2">
                    <div className="flex items-start gap-2">
                      <span className="text-emerald-300 mt-0.5">✓</span>
                      <span>Upload your business plan or pitch deck</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-emerald-300 mt-0.5">✓</span>
                      <span>Start your 5-minute pitch presentation</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-emerald-300 mt-0.5">✓</span>
                      <span>Get instant investor-grade feedback</span>
                    </div>
                  </div>
                </div>

                {!uploadedFile && (
                  <div className="mt-4 text-center">
                    <p className="text-white/60 text-xs italic">AWAITING UPLOAD</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Main Chat Area */}
          <div className="xl:col-span-8">
            <div className="bg-white/80 dark:bg-zinc-800/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/50 dark:border-zinc-700/50 flex flex-col h-[calc(100vh-12rem)] md:h-[calc(100vh-14rem)]">
              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 custom-scrollbar">
                {messages.length === 0 && !uploadedFile && (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center max-w-lg px-4">
                      <div className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 flex items-center justify-center border-4 border-blue-200 dark:border-blue-800 shadow-lg">
                        <FileText className="w-12 h-12 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <h3 className="text-xl md:text-2xl font-bold text-zinc-800 dark:text-zinc-200 mb-3">
                        Ready to Pitch?
                      </h3>
                      <p className="text-sm md:text-base text-zinc-600 dark:text-zinc-400 leading-relaxed">
                        Upload your business deck to get started. Shark AI will analyze your plan and help you perfect your pitch with real-time investor feedback.
                      </p>
                      <div className="mt-6 flex justify-center gap-2">
                        <div className="px-4 py-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-full text-xs font-medium text-indigo-700 dark:text-indigo-300">
                          PDF
                        </div>
                        <div className="px-4 py-2 bg-purple-100 dark:bg-purple-900/30 rounded-full text-xs font-medium text-purple-700 dark:text-purple-300">
                          PPT
                        </div>
                        <div className="px-4 py-2 bg-blue-100 dark:bg-blue-900/30 rounded-full text-xs font-medium text-blue-700 dark:text-blue-300">
                          DOCX
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    } animate-fade-in`}
                  >
                    <div
                      className={`max-w-[85%] md:max-w-[75%] rounded-2xl px-5 py-3.5 text-sm md:text-base shadow-lg ${
                        message.role === 'user'
                          ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
                          : 'bg-white dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-600'
                      }`}
                    >
                      <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                    </div>
                  </div>
                ))}

                {isLoading && (
                  <div className="flex justify-start animate-fade-in">
                    <div className="bg-white dark:bg-zinc-700 rounded-2xl px-5 py-4 shadow-lg border border-zinc-200 dark:border-zinc-600">
                      <div className="flex items-center space-x-3">
                        <Loader2 className="animate-spin text-indigo-600 dark:text-indigo-400" size={20} />
                        <span className="text-zinc-700 dark:text-zinc-300 text-sm md:text-base font-medium">Analyzing pitch...</span>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="border-t border-zinc-200/70 dark:border-zinc-700/70 bg-white/50 dark:bg-zinc-800/50 backdrop-blur-sm p-3 md:p-4">
                {/* Pitch Mode Controls */}
                {uploadedFile && !hasStartedPitch && (
                  <div className="mb-3 flex justify-center">
                    <button
                      onClick={startPitchMode}
                      disabled={isProcessing}
                      className="px-8 py-4 bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 text-white rounded-2xl hover:from-emerald-600 hover:via-green-600 hover:to-teal-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 font-bold shadow-xl hover:shadow-2xl transform hover:scale-105 text-lg"
                    >
                      <Timer size={24} />
                      <span>Start 5-Minute Pitch</span>
                      <span className="text-2xl">🎤</span>
                    </button>
                  </div>
                )}

                {/* Timer Display */}
                {isPitchMode && timerRunning && (
                  <div className="mb-3 flex flex-col sm:flex-row items-center justify-center gap-3 bg-gradient-to-r from-red-50 via-orange-50 to-yellow-50 dark:from-red-900/20 dark:via-orange-900/20 dark:to-yellow-900/20 rounded-2xl p-4 border-2 border-red-300 dark:border-red-800 shadow-lg">
                    <div className="flex items-center gap-3 bg-white/80 dark:bg-zinc-800/80 px-5 py-3 rounded-xl shadow-md">
                      <Timer className={`${pitchTimer <= 60 ? 'text-red-600 dark:text-red-400 animate-pulse' : 'text-orange-600 dark:text-orange-400'}`} size={28} />
                      <span className={`text-3xl font-bold tabular-nums ${pitchTimer <= 60 ? 'text-red-600 dark:text-red-400 animate-pulse' : 'text-orange-600 dark:text-orange-400'}`}>
                        {formatTime(pitchTimer)}
                      </span>
                    </div>
                    <button
                      onClick={stopPitchRecording}
                      className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:from-red-700 hover:to-red-800 transition-all flex items-center gap-2 font-bold shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                      <StopCircle size={20} />
                      Stop & Submit
                    </button>
                  </div>
                )}

                <div className="flex gap-2 md:gap-3">
                  <div className="relative flex-1">
                    <textarea
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder={
                        isPitchMode
                          ? '🎤 Start pitching... Use voice or type your presentation'
                          : uploadedFile && !hasStartedPitch
                          ? 'Click "Start Pitch" button above to begin...'
                          : uploadedFile
                          ? 'Ask me anything about your document...'
                          : 'Upload a document first to get started...'
                      }
                      rows={isPitchMode ? "4" : "2"}
                      disabled={!uploadedFile || isLoading || isProcessing || (!isPitchMode && hasStartedPitch)}
                      className="w-full resize-none px-4 md:px-5 py-3 md:py-3.5 pr-14 text-sm md:text-base border-2 border-zinc-200 dark:border-zinc-600 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:focus:ring-indigo-400 disabled:bg-zinc-50 dark:disabled:bg-zinc-800 disabled:cursor-not-allowed disabled:text-zinc-400 dark:disabled:text-zinc-500 transition-all placeholder:text-zinc-400 dark:placeholder:text-zinc-500 shadow-sm"
                    />
                    {isPitchMode && (
                      <button
                        onClick={toggleListening}
                        disabled={isLoading || isProcessing}
                        className={`absolute right-3 top-3 p-2.5 rounded-xl transition-all shadow-lg ${
                          isListening
                            ? 'bg-red-500 text-white animate-pulse ring-4 ring-red-300 dark:ring-red-800'
                            : 'bg-indigo-100 text-indigo-600 hover:bg-indigo-200 dark:bg-indigo-900/40 dark:text-indigo-300 dark:hover:bg-indigo-900/60 hover:shadow-xl'
                        }`}
                        title={isListening ? 'Stop recording' : 'Start voice input'}
                      >
                        {isListening ? (
                          <StopCircle size={22} />
                        ) : (
                          <Mic size={22} />
                        )}
                      </button>
                    )}
                  </div>
                  {isPitchMode ? (
                    <button
                      onClick={handleSubmitPitch}
                      disabled={!inputMessage.trim() || isLoading}
                      className="px-5 md:px-7 py-3 md:py-3.5 bg-linear-to-r from-emerald-600 to-teal-600 text-white rounded-2xl hover:from-emerald-700 hover:to-teal-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm md:text-base font-bold shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none"
                    >
                      <Send size={20} className="md:w-5 md:h-5" />
                      <span className="hidden sm:inline">Submit</span>
                    </button>
                  ) : (
                    <button
                      onClick={handleSendMessage}
                      disabled={!inputMessage.trim() || !uploadedFile || isLoading || isProcessing || !hasStartedPitch}
                      className="px-5 md:px-7 py-3 md:py-3.5 bg-linear-to-r from-indigo-600 to-purple-600 text-white rounded-2xl hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm md:text-base font-bold shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none"
                    >
                      <Send size={20} className="md:w-5 md:h-5" />
                      <span className="hidden sm:inline">Send</span>
                    </button>
                  )}
                </div>
                {isPitchMode && (
                  <div className="mt-3 text-center">
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 bg-blue-50 dark:bg-blue-900/20 rounded-lg px-4 py-2 inline-flex items-center gap-2">
                      <Mic className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                      <span>Use voice or type • Cover business model, market & funding needs</span>
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
