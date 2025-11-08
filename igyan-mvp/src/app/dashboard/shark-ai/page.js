'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Upload, Send, FileText, Trash2, Loader2, Mic, StopCircle, Timer, Volume2, VolumeX } from 'lucide-react';

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
  const [showPitchWarning, setShowPitchWarning] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('english'); // 'english' or 'hindi'
  const [isSpeaking, setIsSpeaking] = useState(false);
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const timerIntervalRef = useRef(null);
  const synthRef = useRef(null);

  // Using Next.js API routes as proxy to avoid CORS issues
  const API_URL = '/api/shark-ai';

  // Language-specific content
  const languageContent = {
    english: {
      greeting: (title) => `🦈 Hello Entrepreneur! I'm Shark AI, and I've just reviewed your document "${title}". I'm excited to hear about your idea!\n\n📋 I've analyzed your business plan and I'm ready to evaluate your pitch. When you're ready, click the "Start Pitch" button below. You'll have 5 minutes to present your idea using voice or text.\n\n💡 I'll be evaluating:\n• Clarity and structure of your pitch\n• Understanding of your business model\n• Market opportunity and competition\n• Financial projections and ask\n• Your passion and communication skills\n\nTake a deep breath, and when you're ready, let's hear what you've got! 🎤`,
      voiceGreeting: (title) => `Hello Entrepreneur! I'm Shark AI, and I've just reviewed your document about ${title}. I'm excited to hear about your idea! When you're ready, click the Start Pitch button. You'll have 5 minutes to present your idea. Good luck!`,
      startMessage: "🎬 Your 5-minute pitch timer has started! Speak clearly and confidently. You can use the microphone button to record your voice, or type your pitch. Remember to cover your business model, market opportunity, and what you're asking for. Good luck!",
      voiceStart: "Your pitch timer has started! You have 5 minutes. Good luck!",
      systemPrompt: "You are Shark AI, an expert investor evaluating business pitches. Respond in English ONLY. Do not use any other language.",
    },
    hindi: {
      greeting: (title) => `🦈 नमस्ते उद्यमी! मैं Shark AI हूं, और मैंने अभी आपके दस्तावेज़ "${title}" की समीक्षा की है। मैं आपके विचार के बारे में सुनने के लिए उत्साहित हूं!\n\n📋 मैंने आपकी व्यवसाय योजना का विश्लेषण किया है और मैं आपकी पिच का मूल्यांकन करने के लिए तैयार हूं। जब आप तैयार हों, तो नीचे दिए गए "Start Pitch" बटन पर क्लिक करें। आपके पास अपना विचार प्रस्तुत करने के लिए 5 मिनट होंगे, आवाज या टेक्स्ट का उपयोग करके।\n\n💡 मैं इनका मूल्यांकन करूंगा:\n• आपकी पिच की स्पष्टता और संरचना\n• आपके व्यवसाय मॉडल की समझ\n• बाजार के अवसर और प्रतिस्पर्धा\n• वित्तीय अनुमान और मांग\n• आपका जुनून और संचार कौशल\n\nगहरी सांस लें, और जब आप तैयार हों, तो सुनाइए कि आपके पास क्या है! 🎤`,
      voiceGreeting: (title) => `नमस्ते उद्यमी! मैं Shark AI हूं, और मैंने अभी ${title} के बारे में आपके दस्तावेज़ की समीक्षा की है। मैं आपके विचार के बारे में सुनने के लिए उत्साहित हूं! जब आप तैयार हों, तो Start Pitch बटन पर क्लिक करें। आपके पास अपना विचार प्रस्तुत करने के लिए 5 मिनट होंगे। शुभकामनाएं!`,
      startMessage: "🎬 आपका 5-मिनट पिच टाइमर शुरू हो गया है! स्पष्ट रूप से और आत्मविश्वास से बोलें। आप अपनी आवाज रिकॉर्ड करने के लिए माइक्रोफोन बटन का उपयोग कर सकते हैं, या अपनी पिच टाइप कर सकते हैं। अपने व्यवसाय मॉडल, बाजार के अवसर, और आप क्या मांग रहे हैं, को कवर करना याद रखें। शुभकामनाएं!",
      voiceStart: "आपका पिच टाइमर शुरू हो गया है! आपके पास 5 मिनट हैं। शुभकामनाएं!",
      systemPrompt: "आप Shark AI हैं, एक विशेषज्ञ निवेशक जो व्यवसाय पिचों का मूल्यांकन कर रहे हैं। केवल हिंदी में जवाब दें। किसी अन्य भाषा का उपयोग न करें।",
    }
  };

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
      
      // Set language based on selected language
      if (selectedLanguage === 'hindi') {
        utterance.lang = 'hi-IN'; // Hindi
      } else {
        utterance.lang = 'en-US'; // English
      }
      
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      
      synthRef.current.speak(utterance);
    }
  };

  const stopSpeaking = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsSpeaking(false);
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
      console.log('Uploading file to Shark Ai API: Shark', file.name);

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

      // Personalized greeting based on PDF and selected language
      const greeting = languageContent[selectedLanguage].greeting(title);
      const voiceGreeting = languageContent[selectedLanguage].voiceGreeting(title);

      setMessages([
        {
          role: 'assistant',
          content: greeting,
        },
      ]);

      // Speak the greeting
      speakText(voiceGreeting);

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
    stopSpeaking(); // Stop any ongoing speech
  };

  const startPitchMode = () => {
    setIsPitchMode(true);
    setHasStartedPitch(true);
    setPitchTimer(300);
    setPitchTranscript('');
    setInputMessage('');
    setTimerRunning(true);

    const startMessage = languageContent[selectedLanguage].startMessage;
    const voiceStart = languageContent[selectedLanguage].voiceStart;
    
    setMessages(prev => [...prev, {
      role: 'assistant',
      content: startMessage,
    }]);

    speakText(voiceStart);
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
      // Stop listening
      recognitionRef.current.stop();
      setIsListening(false);
      setTimerRunning(false);
    } else {
      // Show warning popup before starting
      if (!hasStartedPitch) {
        setShowPitchWarning(true);
      } else {
        // Already started, just continue recording
        recognitionRef.current.start();
        setIsListening(true);
      }
    }
  };

  const startPitchWithMic = () => {
    // Close popup
    setShowPitchWarning(false);
    
    // Start pitch mode
    setIsPitchMode(true);
    setHasStartedPitch(true);
    setPitchTimer(300);
    setPitchTranscript('');
    setInputMessage('');
    setTimerRunning(true);

    // Add start message
    const startMessage = languageContent[selectedLanguage].startMessage;
    const voiceStart = languageContent[selectedLanguage].voiceStart;
    
    setMessages(prev => [...prev, {
      role: 'assistant',
      content: startMessage,
    }]);

    // Start voice recognition
    if (recognitionRef.current) {
      recognitionRef.current.start();
      setIsListening(true);
    }

    speakText(voiceStart);
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

      const evaluationPrompt = `You are Shark AI, a tough but fair investor evaluating business pitches. ${languageContent[selectedLanguage].systemPrompt} You must be critical and honest in your assessment. Your response must be sharp and in a proper structural format.

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

IMPORTANT FORMATTING INSTRUCTIONS:
You MUST format your response using clear markdown-style structure with headers, bullet points, and sections. Use this exact format:

# 🎯 PITCH EVALUATION RESULTS

## 📊 Overall Score: [X]/100

## 🔍 Score Breakdown:
• **Pitch Clarity & Structure:** [X]/20
• **Business Model Understanding:** [X]/20
• **Market Opportunity:** [X]/20
• **Financial Projections & Ask:** [X]/20
• **Communication & Passion:** [X]/20

## ✅ Key Strengths:
[List 2-3 main strengths as bullet points]

## ⚠️ Areas for Improvement:
[List 2-3 areas needing work as bullet points]

## 💰 Investment Decision: [Yes/No/Maybe]
**Reasoning:** [1-2 sentences explaining the decision]

## 🚀 Actionable Advice:
[Provide 3-4 specific, actionable recommendations as bullet points]

Be brutally honest. If the pitch is garbage, say so. If it's gibberish, give 0/100 and explain why. Use engaging language with relevant emojis.
After every point change line`;

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

      // Parse the evaluation to extract scores
      const scoreMatch = evaluation.match(/Overall Score.*?(\d+)\/100/i);
      const clarityMatch = evaluation.match(/Pitch Clarity.*?(\d+)\/20/i);
      const businessMatch = evaluation.match(/Business Model.*?(\d+)\/20/i);
      const marketMatch = evaluation.match(/Market Opportunity.*?(\d+)\/20/i);
      const financialMatch = evaluation.match(/Financial.*?(\d+)\/20/i);
      const communicationMatch = evaluation.match(/Communication.*?(\d+)\/20/i);

      const assistantMessage = {
        role: 'assistant',
        content: evaluation,
        scores: {
          overall: scoreMatch ? parseInt(scoreMatch[1]) : null,
          clarity: clarityMatch ? parseInt(clarityMatch[1]) : null,
          business: businessMatch ? parseInt(businessMatch[1]) : null,
          market: marketMatch ? parseInt(marketMatch[1]) : null,
          financial: financialMatch ? parseInt(financialMatch[1]) : null,
          communication: communicationMatch ? parseInt(communicationMatch[1]) : null,
        }
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
      console.log('Sending question to Shark Ai API:', currentQuestion);
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
          query: `${languageContent[selectedLanguage].systemPrompt}\n\nUser Question: ${currentQuestion}`,
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
            <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-600 dark:from-indigo-700 dark:via-purple-700 dark:to-blue-700 rounded-2xl shadow-xl p-6 relative overflow-hidden h-[calc(100vh-8rem)] md:h-[calc(100vh-10rem)] flex flex-col">
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-400/10 rounded-full blur-2xl"></div>
              
              <div className="relative flex-1 overflow-y-auto custom-scrollbar">
                {/* Shark Avatar Section with Sound Reactive Animation */}
                <div className="flex flex-col items-center mb-6 mt-8">
                  <div className="relative">
                    {/* Sound wave rings */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className={`absolute w-48 h-48 rounded-full border-2 border-blue-400/60 ${isListening ? 'animate-sound-wave-1' : ''}`}></div>
                      <div className={`absolute w-56 h-56 rounded-full border-2 border-purple-400/50 ${isListening ? 'animate-sound-wave-2' : ''}`}></div>
                      <div className={`absolute w-64 h-64 rounded-full border-2 border-indigo-400/40 ${isListening ? 'animate-sound-wave-3' : ''}`}></div>
                    </div>
                    
                    {/* Main avatar circle */}
                    <div className={`w-48 h-48 rounded-full bg-linear-to-br from-blue-400/30 to-purple-500/30 backdrop-blur-sm flex items-center justify-center mb-4 border-4 border-white/30 shadow-2xl relative z-10 transition-all duration-300 ${isListening ? 'scale-105 shadow-blue-500/50' : ''} ${isSpeaking ? 'scale-105 shadow-green-500/50' : ''}`}>
                      <Image 
                        src="/asset/ai-shark/suitshark.png" 
                        alt="Shark AI"
                        width={160}
                        height={160}
                        className="w-40 h-40 object-contain"
                        priority
                      />
                      {/* Speaking indicator */}
                      {isSpeaking && (
                        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-lg animate-bounce">
                          <Volume2 className="w-3 h-3" />
                          <span>{selectedLanguage === 'english' ? 'Speaking...' : 'बोल रहा है...'}</span>
                        </div>
                      )}
                    </div>
                    
                  </div>
                  
                  <h2 className="text-2xl font-bold text-white text-center mb-6 mt-4">AI Shark</h2>
                  
                  {/* Stop Speaking Button */}
                  {isSpeaking && (
                    <div className="flex justify-center mb-4 animate-fade-in">
                      <button
                        onClick={stopSpeaking}
                        className="bg-red-500 hover:bg-red-600 text-white px-6 py-2.5 rounded-full font-semibold text-sm transition-all shadow-lg flex items-center gap-2 hover:scale-105"
                      >
                        <VolumeX className="w-5 h-5 animate-pulse" />
                        {selectedLanguage === 'english' ? 'Stop Speaking' : 'बोलना बंद करें'}
                      </button>
                    </div>
                  )}
                </div>

                {/* Big Microphone Button with Live Transcription */}
                {uploadedFile && (
                  <div className="mb-6">
                    <div className="flex flex-col items-center gap-4">
                      {/* Big Mic Button */}
                      <button
                        onClick={toggleListening}
                        disabled={isProcessing || isLoading}
                        className={`relative w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${
                          isListening
                            ? 'bg-red-500 shadow-lg shadow-red-500/50 scale-110'
                            : 'bg-white/20 hover:bg-white/30 backdrop-blur-md border-2 border-white/40 hover:scale-105'
                        }`}
                      >
                        {isListening ? (
                          <>
                            <div className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-75"></div>
                            <StopCircle className="w-10 h-10 text-white relative z-10" />
                          </>
                        ) : (
                          <Mic className="w-10 h-10 text-white" />
                        )}
                      </button>
                      
                      {/* Status Text */}
                      <div className="text-center">
                        <p className="text-white font-semibold text-sm">
                          {isListening ? '🔴 Recording...' : '🎤 Tap to speak'}
                        </p>
                      </div>

                      {/* Live Transcription Display */}
                      {isListening && pitchTranscript && (
                        <div className="w-full bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 animate-fade-in">
                          <div className="flex items-start gap-2 mb-2">
                            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse mt-1.5"></div>
                            <span className="text-xs font-semibold text-white/80 uppercase tracking-wide">Live Transcription</span>
                          </div>
                          <p className="text-white text-sm leading-relaxed max-h-32 overflow-y-auto custom-scrollbar">
                            {pitchTranscript}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

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

                {/* Language Selection */}
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 mb-4">
                  <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                    </svg>
                    Language / भाषा
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setSelectedLanguage('english')}
                      disabled={isProcessing || isLoading || hasStartedPitch}
                      className={`px-4 py-2.5 rounded-lg font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                        selectedLanguage === 'english'
                          ? 'bg-white text-indigo-600 shadow-lg'
                          : 'bg-white/20 text-white hover:bg-white/30'
                      }`}
                    >
                      🇬🇧 English
                    </button>
                    <button
                      onClick={() => setSelectedLanguage('hindi')}
                      disabled={isProcessing || isLoading || hasStartedPitch}
                      className={`px-4 py-2.5 rounded-lg font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                        selectedLanguage === 'hindi'
                          ? 'bg-white text-indigo-600 shadow-lg'
                          : 'bg-white/20 text-white hover:bg-white/30'
                      }`}
                    >
                      🇮🇳 हिंदी
                    </button>
                  </div>
                  <p className="text-xs text-white/70 mt-2">
                    {selectedLanguage === 'english' 
                      ? 'AI will respond in English' 
                      : 'AI हिंदी में जवाब देगा'}
                  </p>
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
            <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-xl border border-zinc-200 dark:border-zinc-700 flex flex-col h-[calc(100vh-8rem)] md:h-[calc(100vh-10rem)]">
              {/* Chat Header */}
              <div className="border-b border-zinc-200 dark:border-zinc-700 px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-zinc-800 dark:to-zinc-800 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-zinc-800 dark:text-white">Pitch Conversation</h2>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">
                      {uploadedFile ? `Analyzing: ${uploadedFile.name}` : 'Upload a document to start'}
                    </p>
                  </div>
                  {hasStartedPitch && timerRunning && (
                    <div className="flex items-center gap-2 bg-white dark:bg-zinc-700 px-3 py-1.5 rounded-lg shadow-sm">
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                      <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Live</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-zinc-50 dark:bg-zinc-900/50 custom-scrollbar">
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
                  <div key={index}>
                    <div
                      className={`flex ${
                        message.role === 'user' ? 'justify-end' : 'justify-start'
                      } animate-fade-in`}
                    >
                      <div
                        className={`max-w-[90%] md:max-w-[80%] rounded-xl px-4 py-3 shadow-md ${
                          message.role === 'user'
                            ? 'bg-gradient-to-r from-indigo-600 to-purple-600 rounded-br-sm text-white'
                            : 'dashboard-card rounded-bl-sm'
                        }`}
                      >
                        {message.role === 'assistant' && (
                          <div className="flex items-center gap-2 mb-2 pb-2" style={{ borderBottom: '1px solid var(--dashboard-border)' }}>
                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                              AI
                            </div>
                            <span className="text-xs font-semibold" style={{ color: 'var(--dashboard-muted)' }}>Shark AI</span>
                          </div>
                        )}
                        
                        {/* User message - simple white text */}
                        {message.role === 'user' ? (
                          <p className="text-white text-sm leading-relaxed font-medium whitespace-pre-wrap">
                            {message.content}
                          </p>
                        ) : (
                        /* Assistant message - formatted with styling */
                        <div className="text-sm leading-relaxed">
                          {message.content.split('\n').map((line, i) => {
                            // Handle headers with emojis
                            if (line.startsWith('# ')) {
                              const content = line.substring(2).trim();
                              return (
                                <div key={i} className="mb-3 mt-1">
                                  <h1 className="text-lg md:text-xl font-bold" style={{ color: 'var(--dashboard-heading)' }}>
                                    {content}
                                  </h1>
                                  <div className="h-0.5 w-16 rounded-full mt-1.5" style={{ background: 'var(--dashboard-primary)' }}></div>
                                </div>
                              );
                            }
                            if (line.startsWith('## ')) {
                              const content = line.substring(3).trim();
                              return (
                                <h2 key={i} className="text-base md:text-lg font-bold mb-2 mt-3 flex items-center gap-2" style={{ color: 'var(--dashboard-heading)' }}>
                                  <span className="w-0.5 h-4 rounded-full" style={{ background: 'var(--dashboard-primary)' }}></span>
                                  {content}
                                </h2>
                              );
                            }
                            if (line.startsWith('### ')) {
                              const content = line.substring(4).trim();
                              return (
                                <h3 key={i} className="text-sm md:text-base font-semibold mb-1.5 mt-2" style={{ color: 'var(--dashboard-text)' }}>
                                  {content}
                                </h3>
                              );
                            }
                            // Handle bullet points with better styling
                            if (line.startsWith('• ') || line.startsWith('- ')) {
                              const content = line.substring(2).trim();
                              const boldMatch = content.match(/\*\*(.*?)\*\*/);
                              if (boldMatch) {
                                const parts = content.split(/\*\*(.*?)\*\*/);
                                return (
                                  <div key={i} className="flex items-start gap-2 mb-1.5 ml-1">
                                    <span className="mt-0.5 text-base shrink-0" style={{ color: 'var(--dashboard-primary)' }}>•</span>
                                    <span className="flex-1 text-sm leading-relaxed">
                                      {parts.map((part, idx) => 
                                        idx % 2 === 1 ? (
                                          <strong key={idx} className="font-bold" style={{ color: 'var(--dashboard-heading)' }}>{part}</strong>
                                        ) : (
                                          <span key={idx} style={{ color: 'var(--dashboard-text)' }}>{part}</span>
                                        )
                                      )}
                                    </span>
                                  </div>
                                );
                              }
                              return (
                                <div key={i} className="flex items-start gap-2 mb-1.5 ml-1">
                                  <span className="mt-0.5 text-base shrink-0" style={{ color: 'var(--dashboard-primary)' }}>•</span>
                                  <span className="flex-1 text-sm leading-relaxed" style={{ color: 'var(--dashboard-text)' }}>{content}</span>
                                </div>
                              );
                            }
                            // Handle bold text with background highlight
                            if (line.includes('**')) {
                              const parts = line.split(/\*\*(.*?)\*\*/);
                              return (
                                <p key={i} className="mb-2 text-sm leading-relaxed">
                                  {parts.map((part, idx) => 
                                    idx % 2 === 1 ? (
                                      <strong key={idx} className="font-bold" style={{ color: 'var(--dashboard-heading)' }}>{part}</strong>
                                    ) : (
                                      <span key={idx} style={{ color: 'var(--dashboard-text)' }}>{part}</span>
                                    )
                                  )}
                                </p>
                              );
                            }
                            // Regular paragraph with better line height
                            if (line.trim()) {
                              return <p key={i} className="mb-2 text-sm leading-relaxed" style={{ color: 'var(--dashboard-text)' }}>{line}</p>;
                            }
                            return <div key={i} className="h-1"></div>;
                          })}
                        </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Advanced Graphical Representation - Pie Chart & Bar Chart */}
                    {message.role === 'assistant' && message.scores && message.scores.overall !== null && (
                      <div className="flex justify-start mt-4 animate-fade-in">
                        <div className="max-w-[90%] md:max-w-[80%] w-full bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-zinc-800 dark:via-zinc-850 dark:to-zinc-900 rounded-2xl p-4 md:p-5 shadow-xl border border-indigo-200 dark:border-indigo-900">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-base md:text-lg font-bold text-zinc-800 dark:text-white flex items-center gap-2">
                              <span className="text-lg">📊</span>
                              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                Performance Analytics
                              </span>
                            </h3>
                          </div>
                          
                          {/* Overall Score Circle with Enhanced Design */}
                          <div className="flex justify-center mb-4">
                            <div className="relative">
                              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-full blur-xl"></div>
                              <div className="relative w-32 h-32 md:w-36 md:h-36">
                                <svg className="w-full h-full transform -rotate-90">
                                  {/* Background circle */}
                                  <circle
                                    cx="50%"
                                    cy="50%"
                                    r="45%"
                                    stroke="currentColor"
                                    strokeWidth="8"
                                    fill="none"
                                    className="text-zinc-200 dark:text-zinc-700"
                                  />
                                  {/* Animated progress circle */}
                                  <circle
                                    cx="50%"
                                    cy="50%"
                                    r="45%"
                                    stroke="url(#scoreGradient)"
                                    strokeWidth="8"
                                    fill="none"
                                    strokeDasharray={`${2 * Math.PI * (message.scores.overall >= 70 ? 86 : message.scores.overall >= 40 ? 90 : 85)}`}
                                    strokeDashoffset={`${2 * Math.PI * 87 * (1 - message.scores.overall / 100)}`}
                                    className="transition-all duration-1500 ease-out"
                                    strokeLinecap="round"
                                    style={{ filter: 'drop-shadow(0 0 8px rgba(99, 102, 241, 0.5))' }}
                                  />
                                  <defs>
                                    <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                      <stop offset="0%" style={{ stopColor: message.scores.overall >= 70 ? '#10b981' : message.scores.overall >= 40 ? '#f59e0b' : '#ef4444' }} />
                                      <stop offset="100%" style={{ stopColor: message.scores.overall >= 70 ? '#059669' : message.scores.overall >= 40 ? '#d97706' : '#dc2626' }} />
                                    </linearGradient>
                                  </defs>
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                  <span className="text-3xl md:text-4xl font-black text-zinc-800 dark:text-white">
                                    {message.scores.overall}
                                  </span>
                                  <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                                    / 100
                                  </span>
                                  <span className={`text-xs font-bold mt-1.5 px-2 py-0.5 rounded-full ${
                                    message.scores.overall >= 70 ? 'bg-green-500 text-white' :
                                    message.scores.overall >= 40 ? 'bg-yellow-500 text-white' :
                                    'bg-red-500 text-white'
                                  }`}>
                                    {message.scores.overall >= 70 ? 'Excellent' : message.scores.overall >= 40 ? 'Moderate' : 'Needs Work'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Pie Chart Visualization */}
                          <div className="grid md:grid-cols-2 gap-4 mb-4">
                            {/* Pie Chart */}
                            <div className="bg-white dark:bg-zinc-900 rounded-xl p-4 shadow-lg border border-zinc-200 dark:border-zinc-700">
                              <h4 className="text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-3 flex items-center gap-1.5">
                                <span>🥧</span> Score Distribution
                              </h4>
                              <div className="flex justify-center items-center">
                                {(() => {
                                  const scores = [
                                    { value: message.scores.clarity || 0, color: '#3b82f6', label: 'Clarity' },
                                    { value: message.scores.business || 0, color: '#a855f7', label: 'Business' },
                                    { value: message.scores.market || 0, color: '#6366f1', label: 'Market' },
                                    { value: message.scores.financial || 0, color: '#ec4899', label: 'Financial' },
                                    { value: message.scores.communication || 0, color: '#06b6d4', label: 'Communication' },
                                  ];
                                  const total = scores.reduce((sum, s) => sum + s.value, 0);
                                  let currentAngle = 0;
                                  
                                  return (
                                    <div className="relative w-36 h-36 md:w-40 md:h-40">
                                      <svg viewBox="0 0 200 200" className="w-full h-full transform -rotate-90">
                                        {total > 0 ? scores.map((score, idx) => {
                                          const percentage = score.value / total;
                                          const angle = percentage * 360;
                                          const startAngle = currentAngle;
                                          currentAngle += angle;
                                          
                                          const startRad = (startAngle * Math.PI) / 180;
                                          const endRad = (currentAngle * Math.PI) / 180;
                                          const x1 = 100 + 80 * Math.cos(startRad);
                                          const y1 = 100 + 80 * Math.sin(startRad);
                                          const x2 = 100 + 80 * Math.cos(endRad);
                                          const y2 = 100 + 80 * Math.sin(endRad);
                                          const largeArc = angle > 180 ? 1 : 0;
                                          
                                          return (
                                            <path
                                              key={idx}
                                              d={`M 100 100 L ${x1} ${y1} A 80 80 0 ${largeArc} 1 ${x2} ${y2} Z`}
                                              fill={score.color}
                                              className="transition-all duration-500 hover:opacity-80 cursor-pointer"
                                              style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}
                                            />
                                          );
                                        }) : (
                                          <circle cx="100" cy="100" r="80" fill="#e5e7eb" className="dark:fill-zinc-700" />
                                        )}
                                        {/* Center white circle */}
                                        <circle cx="100" cy="100" r="50" fill="white" className="dark:fill-zinc-900" />
                                      </svg>
                                      <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="text-center">
                                          <div className="text-xl font-bold text-zinc-800 dark:text-white">{total}</div>
                                          <div className="text-xs text-zinc-600 dark:text-zinc-400">Total</div>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })()}
                              </div>
                              {/* Legend */}
                              <div className="mt-3 space-y-1.5">
                                {[
                                  { label: 'Clarity', value: message.scores.clarity, color: 'bg-blue-500' },
                                  { label: 'Business', value: message.scores.business, color: 'bg-purple-500' },
                                  { label: 'Market', value: message.scores.market, color: 'bg-indigo-500' },
                                  { label: 'Financial', value: message.scores.financial, color: 'bg-pink-500' },
                                  { label: 'Communication', value: message.scores.communication, color: 'bg-cyan-500' },
                                ].map((item, idx) => (
                                  <div key={idx} className="flex items-center justify-between text-xs">
                                    <div className="flex items-center gap-2">
                                      <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                                      <span className="text-zinc-700 dark:text-zinc-300">{item.label}</span>
                                    </div>
                                    <span className="font-bold text-zinc-800 dark:text-white">{item.value}/20</span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Bar Chart */}
                            <div className="bg-white dark:bg-zinc-900 rounded-xl p-4 shadow-lg border border-zinc-200 dark:border-zinc-700">
                              <h4 className="text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-3 flex items-center gap-1.5">
                                <span>📊</span> Performance Bars
                              </h4>
                              <div className="space-y-2.5">
                                {[
                                  { label: 'Pitch Clarity', value: message.scores.clarity, max: 20, color: 'from-blue-500 to-blue-600', icon: '🎯' },
                                  { label: 'Business Model', value: message.scores.business, max: 20, color: 'from-purple-500 to-purple-600', icon: '💼' },
                                  { label: 'Market Opportunity', value: message.scores.market, max: 20, color: 'from-indigo-500 to-indigo-600', icon: '🌍' },
                                  { label: 'Financial & Ask', value: message.scores.financial, max: 20, color: 'from-pink-500 to-pink-600', icon: '💰' },
                                  { label: 'Communication', value: message.scores.communication, max: 20, color: 'from-cyan-500 to-cyan-600', icon: '💬' },
                                ].map((item, idx) => item.value !== null && (
                                  <div key={idx} className="group">
                                    <div className="flex items-center justify-between mb-1">
                                      <div className="flex items-center gap-1.5">
                                        <span className="text-sm">{item.icon}</span>
                                        <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">{item.label}</span>
                                      </div>
                                      <span className="text-xs font-bold text-zinc-800 dark:text-white bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded-full">
                                        {item.value}/{item.max}
                                      </span>
                                    </div>
                                    <div className="relative h-6 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden shadow-inner">
                                      <div
                                        className={`h-full bg-gradient-to-r ${item.color} rounded-full transition-all duration-1000 ease-out flex items-center justify-end px-2 group-hover:shadow-lg`}
                                        style={{ 
                                          width: `${(item.value / item.max) * 100}%`,
                                          minWidth: item.value > 0 ? '8%' : '0%'
                                        }}
                                      >
                                        {item.value > 0 && (
                                          <span className="text-xs font-bold text-white drop-shadow">
                                            {Math.round((item.value / item.max) * 100)}%
                                          </span>
                                        )}
                                      </div>
                                      {/* Animated shine effect */}
                                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer pointer-events-none"></div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* Investment Decision Badge */}
                          {message.content.match(/Investment Decision:?\s*(Yes|No|Maybe)/i) && (
                            <div className="flex justify-center">
                              {(() => {
                                const decision = message.content.match(/Investment Decision:?\s*(Yes|No|Maybe)/i)[1];
                                const badges = {
                                  'Yes': { 
                                    bg: 'bg-gradient-to-r from-green-500 to-emerald-500', 
                                    icon: '✓', 
                                    text: 'INVESTMENT APPROVED',
                                    glow: 'shadow-green-500/50'
                                  },
                                  'Maybe': { 
                                    bg: 'bg-gradient-to-r from-yellow-500 to-orange-500', 
                                    icon: '⚡', 
                                    text: 'CAN BE UNDER CONSIDERATION',
                                    glow: 'shadow-yellow-500/50'
                                  },
                                  'No': { 
                                    bg: 'bg-gradient-to-r from-red-500 to-rose-500', 
                                    icon: '✗', 
                                    text: 'NOT INVESTING',
                                    glow: 'shadow-red-500/50'
                                  }
                                };
                                const badge = badges[decision];
                                return (
                                  <div className={`${badge.bg} text-white px-5 py-2.5 rounded-xl font-bold text-xs md:text-sm flex items-center gap-2 shadow-xl ${badge.glow} transform hover:scale-105 transition-all`}>
                                    <span className="text-lg animate-pulse">{badge.icon}</span>
                                    <span className="tracking-wide">{badge.text}</span>
                                  </div>
                                );
                              })()}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {isLoading && (
                  <div className="flex justify-start animate-fade-in">
                    <div className="dashboard-card rounded-2xl rounded-bl-sm px-4 py-3 shadow-md max-w-[80%] md:max-w-[70%]">
                      <div className="flex items-center gap-2 mb-2 pb-2" style={{ borderBottom: '1px solid var(--dashboard-border)' }}>
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                          AI
                        </div>
                        <span className="text-xs font-semibold" style={{ color: 'var(--dashboard-muted)' }}>Shark AI</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Loader2 className="animate-spin" style={{ color: 'var(--dashboard-primary)' }} size={18} />
                        <span className="text-sm" style={{ color: 'var(--dashboard-text)' }}>Analyzing your pitch...</span>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="border-t border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-4 rounded-b-2xl">
                {/* Timer Display */}
                {isPitchMode && timerRunning && (
                  <div className="mb-4 flex flex-col sm:flex-row items-center justify-between gap-3 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/10 dark:to-red-900/10 rounded-xl p-3 border border-orange-200 dark:border-orange-800">
                    <div className="flex items-center gap-3">
                      <Timer className={`${pitchTimer <= 60 ? 'text-red-600 dark:text-red-400 animate-pulse' : 'text-orange-600 dark:text-orange-400'}`} size={20} />
                      <div>
                        <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400 block">Time Remaining</span>
                        <span className={`text-2xl font-bold tabular-nums ${pitchTimer <= 60 ? 'text-red-600 dark:text-red-400 animate-pulse' : 'text-orange-600 dark:text-orange-400'}`}>
                          {formatTime(pitchTimer)}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={stopPitchRecording}
                      className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-all flex items-center gap-2 font-semibold shadow-md"
                    >
                      <StopCircle size={16} />
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
                      rows={isPitchMode ? "3" : "1"}
                      disabled={!uploadedFile || isLoading || isProcessing || (!isPitchMode && hasStartedPitch)}
                      className="w-full resize-none px-4 py-3 pr-14 text-sm border border-zinc-300 dark:border-zinc-600 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:focus:ring-indigo-400 disabled:bg-zinc-100 dark:disabled:bg-zinc-800 disabled:cursor-not-allowed disabled:text-zinc-400 dark:disabled:text-zinc-500 transition-all placeholder:text-zinc-500 dark:placeholder:text-zinc-500"
                    />
                    {isPitchMode && (
                      <button
                        onClick={toggleListening}
                        disabled={isLoading || isProcessing}
                        className={`absolute right-2 top-2 p-2 rounded-lg transition-all ${
                          isListening
                            ? 'bg-red-500 text-white animate-pulse'
                            : 'bg-indigo-500 text-white hover:bg-indigo-600'
                        }`}
                        title={isListening ? 'Stop recording' : 'Start voice input'}
                      >
                        {isListening ? (
                          <StopCircle size={18} />
                        ) : (
                          <Mic size={18} />
                        )}
                      </button>
                    )}
                  </div>
                  {isPitchMode ? (
                    <button
                      onClick={handleSubmitPitch}
                      disabled={!inputMessage.trim() || isLoading}
                      className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:from-emerald-700 hover:to-teal-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm font-semibold shadow-md"
                    >
                      <Send size={18} />
                      Submit Pitch
                    </button>
                  ) : (
                    <button
                      onClick={handleSendMessage}
                      disabled={!inputMessage.trim() || !uploadedFile || isLoading || isProcessing || !hasStartedPitch}
                      className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm font-semibold shadow-md"
                    >
                      <Send size={18} />
                      Send
                    </button>
                  )}
                </div>
                {isPitchMode && (
                  <div className="mt-2">
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                      <Mic className="w-3 h-3" />
                      <span>Use voice or type • Cover business model, market & funding needs</span>
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Pitch Warning Popup */}
        {showPitchWarning && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-2xl max-w-lg w-full p-6 md:p-8 border-2 border-indigo-200 dark:border-indigo-700 relative animate-slide-up">
              {/* Header */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                  <Timer className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-zinc-800 dark:text-white">
                  5-Minute Pitch Timer
                </h3>
              </div>

              {/* Warning Message */}
              <div className="mb-6">
                <p className="text-zinc-700 dark:text-zinc-300 mb-4 leading-relaxed">
                  You will have <span className="font-bold text-orange-600 dark:text-orange-400">exactly 5 minutes</span> to present your pitch. Structure your time wisely:
                </p>
                
                <div className="space-y-3 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-sm flex-shrink-0">1</div>
                    <div>
                      <p className="font-semibold text-zinc-800 dark:text-white">Company Introduction</p>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400">1-2 minutes • Who you are & what you do</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-500 text-white flex items-center justify-center font-bold text-sm flex-shrink-0">2</div>
                    <div>
                      <p className="font-semibold text-zinc-800 dark:text-white">Problem & Solution</p>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400">1 minute • The pain point & your fix</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-purple-500 text-white flex items-center justify-center font-bold text-sm flex-shrink-0">3</div>
                    <div>
                      <p className="font-semibold text-zinc-800 dark:text-white">Business Model</p>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400">1 minute • How you make money</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-pink-500 text-white flex items-center justify-center font-bold text-sm flex-shrink-0">4</div>
                    <div>
                      <p className="font-semibold text-zinc-800 dark:text-white">Market Opportunity</p>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400">1 minute • Market size & competition</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center font-bold text-sm flex-shrink-0">5</div>
                    <div>
                      <p className="font-semibold text-zinc-800 dark:text-white">The Ask</p>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400">30 seconds • Funding & terms</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowPitchWarning(false)}
                  className="flex-1 px-6 py-3 bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200 rounded-xl hover:bg-zinc-300 dark:hover:bg-zinc-600 transition-all font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={startPitchWithMic}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all font-bold shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center gap-2"
                >
                  <Mic size={20} />
                  Start Pitch
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
