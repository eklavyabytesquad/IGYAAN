'use client';

import { useState, useRef, useEffect } from 'react';
import { Upload, Send, FileText, Trash2, Loader2 } from 'lucide-react';

export default function SharkAI() {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [fileId, setFileId] = useState('');
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Using Next.js API routes as proxy to avoid CORS issues
  const API_URL = '/api/shark-ai';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // API health check on mount
  useEffect(() => {
    console.log('Shark AI initialized - using Next.js API proxy');
  }, []);

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
      console.log('API URL:', `${API_URL}/upload`);

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

      setMessages([
        {
          role: 'assistant',
          content: `📄 Document uploaded successfully: ${file.name}. I've analyzed the document and it's ready for questions. You can now ask me anything about it!`,
        },
      ]);
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
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
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
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-700 p-4 md:p-6 mb-4 md:mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold bg-linear-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                🦈 Shark AI - Document Intelligence
              </h1>
              <p className="text-zinc-600 dark:text-zinc-400 mt-2 text-sm md:text-base">
                Upload your documents (PDF, PPT, TXT, DOCX) and ask intelligent questions
              </p>
            </div>
            <div className="text-left md:text-right">
              <div className="text-sm font-medium text-zinc-700 dark:text-zinc-300">igyan AI Model</div>
              <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Powered by GPT-4</div>
              <div className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 font-semibold">✓ Secure API Service</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          {/* Upload Section */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-700 p-4 md:p-6 lg:sticky lg:top-6">
              <h2 className="text-lg md:text-xl font-semibold mb-4 flex items-center text-zinc-900 dark:text-white">
                <Upload className="mr-2 text-indigo-600 dark:text-indigo-400" size={24} />
                Upload Document
              </h2>

              <div className="space-y-4">
                {!uploadedFile ? (
                  <div
                    className="border-2 border-dashed border-zinc-300 dark:border-zinc-600 rounded-xl p-6 md:p-8 text-center cursor-pointer hover:border-indigo-500 dark:hover:border-indigo-400 transition-colors bg-zinc-50 dark:bg-zinc-900/50"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <FileText className="mx-auto mb-4 text-zinc-400 dark:text-zinc-500" size={48} />
                    <p className="text-zinc-700 dark:text-zinc-300 mb-2 font-medium">Click to upload document</p>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">PDF, PPT, TXT, DOCX supported</p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.ppt,.pptx,.txt,.doc,.docx"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </div>
                  ) : (
                  <div className="bg-linear-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl p-4 border border-indigo-100 dark:border-indigo-800">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start space-x-3 flex-1 min-w-0">
                        <FileText className="text-indigo-600 dark:text-indigo-400 mt-1 shrink-0" size={24} />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-zinc-800 dark:text-zinc-200 wrap-break-word text-sm">
                            {uploadedFile.name}
                          </p>
                          <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
                            {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={handleRemoveFile}
                        className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors shrink-0"
                        title="Remove file"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                    {isProcessing && (
                      <div className="mt-3 flex items-center text-indigo-600 dark:text-indigo-400">
                        <Loader2 className="animate-spin mr-2" size={16} />
                        <span className="text-sm">Processing PDF...</span>
                      </div>
                    )}
                  </div>
                )}

                <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-4 border border-indigo-100 dark:border-indigo-800">
                  <h3 className="font-semibold text-sm mb-2 text-indigo-900 dark:text-indigo-300">
                    💡 Tips for best results:
                  </h3>
                  <ul className="text-xs text-indigo-800 dark:text-indigo-400 space-y-1">
                    <li>• Upload clear, text-based documents</li>
                    <li>• Supports: PDF, PPT, PPTX, TXT, DOC, DOCX</li>
                    <li>• Ask specific questions</li>
                    <li>• Request summaries or explanations</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Chat Section */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-700 flex flex-col h-[calc(100vh-12rem)] md:h-[calc(100vh-14rem)]">
              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
                {messages.length === 0 && !uploadedFile && (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center max-w-md px-4">
                      <div className="text-5xl md:text-6xl mb-4">🦈</div>
                      <h3 className="text-lg md:text-xl font-semibold text-zinc-800 dark:text-zinc-200 mb-2">
                        Welcome to Shark AI
                      </h3>
                      <p className="text-sm md:text-base text-zinc-600 dark:text-zinc-400">
                        Upload a document (PDF, PPT, TXT, DOCX) to start asking questions and get intelligent
                        answers based on the content.
                      </p>
                    </div>
                  </div>
                )}

                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-[85%] md:max-w-[80%] rounded-2xl px-4 py-3 text-sm md:text-base ${
                        message.role === 'user'
                          ? 'bg-linear-to-r from-indigo-600 to-purple-600 text-white shadow-sm'
                          : 'bg-zinc-100 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200 shadow-sm'
                      }`}
                    >
                      <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                    </div>
                  </div>
                ))}

                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-zinc-100 dark:bg-zinc-700 rounded-2xl px-4 py-3 shadow-sm">
                      <div className="flex items-center space-x-2">
                        <Loader2 className="animate-spin text-indigo-600 dark:text-indigo-400" size={20} />
                        <span className="text-zinc-700 dark:text-zinc-300 text-sm md:text-base">Shark AI is thinking...</span>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="border-t border-zinc-200 dark:border-zinc-700 p-3 md:p-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={
                      uploadedFile
                        ? 'Ask a question about your document...'
                        : 'Upload a PDF first to start chatting...'
                    }
                    disabled={!uploadedFile || isLoading || isProcessing}
                    className="flex-1 px-3 md:px-4 py-2 md:py-3 text-sm md:text-base border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 disabled:bg-zinc-100 dark:disabled:bg-zinc-800 disabled:cursor-not-allowed disabled:text-zinc-500 dark:disabled:text-zinc-500 transition-colors"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim() || !uploadedFile || isLoading || isProcessing}
                    className="px-4 md:px-6 py-2 md:py-3 bg-linear-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm md:text-base font-medium shadow-sm"
                  >
                    <Send size={18} className="md:w-5 md:h-5" />
                    <span className="hidden sm:inline">Send</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
