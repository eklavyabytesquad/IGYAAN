'use client';

import { useState, useRef, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

// Import components
import SharkAvatar from './components/SharkAvatar';
import FileUpload from './components/FileUpload';
import LanguageSelector from './components/LanguageSelector';
import StatusInfo from './components/StatusInfo';
import ChatHeader from './components/ChatHeader';
import EmptyState from './components/EmptyState';
import MessageBubble from './components/MessageBubble';
import PerformanceAnalytics from './components/PerformanceAnalytics';
import ChatInput from './components/ChatInput';
import PitchWarningModal from './components/PitchWarningModal';

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
    <div className="dashboard-background min-h-screen p-3 md:p-6">
      <div className="max-w-[1600px] mx-auto">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 md:gap-6 h-[calc(100vh-6rem)]">
          {/* Left Sidebar - Shark Avatar & Upload */}
          <div className="xl:col-span-4">
            <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-600 dark:from-indigo-700 dark:via-purple-700 dark:to-blue-700 rounded-2xl shadow-xl p-6 relative overflow-hidden h-full flex flex-col">
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-400/10 rounded-full blur-2xl"></div>
              
              <div className="relative flex-1 overflow-y-auto custom-scrollbar">
                {/* Shark Avatar Component */}
                <SharkAvatar 
                  isListening={isListening}
                  isSpeaking={isSpeaking}
                  isProcessing={isProcessing}
                  isLoading={isLoading}
                  selectedLanguage={selectedLanguage}
                  pitchTranscript={pitchTranscript}
                  stopSpeaking={stopSpeaking}
                  toggleListening={toggleListening}
                  uploadedFile={uploadedFile}
                />

                {/* File Upload Component */}
                <FileUpload 
                  uploadedFile={uploadedFile}
                  isProcessing={isProcessing}
                  fileInputRef={fileInputRef}
                  handleFileUpload={handleFileUpload}
                  handleRemoveFile={handleRemoveFile}
                />

                {/* Language Selector Component */}
                <LanguageSelector 
                  selectedLanguage={selectedLanguage}
                  setSelectedLanguage={setSelectedLanguage}
                  isProcessing={isProcessing}
                  isLoading={isLoading}
                  hasStartedPitch={hasStartedPitch}
                />

                {/* Status Info Component */}
                <StatusInfo uploadedFile={uploadedFile} />
              </div>
            </div>
          </div>

          {/* Main Chat Area */}
          <div className="xl:col-span-8">
            <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-xl border border-zinc-200 dark:border-zinc-700 flex flex-col h-full">
              {/* Chat Header Component */}
              <ChatHeader 
                uploadedFile={uploadedFile}
                hasStartedPitch={hasStartedPitch}
                timerRunning={timerRunning}
              />

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-zinc-50 dark:bg-zinc-900/50 custom-scrollbar">
                {messages.length === 0 && !uploadedFile && (
                  <EmptyState />
                )}

                {messages.map((message, index) => (
                  <div key={index}>
                    {/* Message Bubble Component */}
                    <MessageBubble message={message} />
                    
                    {/* Performance Analytics Component */}
                    {message.role === 'assistant' && message.scores && message.scores.overall !== null && (
                      <PerformanceAnalytics scores={message.scores} />
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

              {/* Input Area - Chat Input Component */}
              <ChatInput 
                message={inputMessage}
                setMessage={setInputMessage}
                isProcessing={isProcessing}
                isLoading={isLoading}
                uploadedFile={uploadedFile}
                isPitchMode={isPitchMode}
                timerRunning={timerRunning}
                elapsedTime={pitchTimer}
                isPitchStarted={hasStartedPitch}
                handleSend={isPitchMode ? handleSubmitPitch : handleSendMessage}
                toggleListening={toggleListening}
                isListening={isListening}
                stopPitchRecording={stopPitchRecording}
                handleKeyPress={handleKeyPress}
              />
            </div>
          </div>
        </div>

        {/* Pitch Warning Modal Component */}
        <PitchWarningModal 
          show={showPitchWarning}
          onClose={() => setShowPitchWarning(false)}
          onStart={startPitchWithMic}
        />
      </div>
    </div>
  );
}
