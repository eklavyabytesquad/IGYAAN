'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Download, Sparkles } from 'lucide-react';
import OpenAI from 'openai';
import TemplateSelector from './components/TemplateSelector';
import PreviewModal from './components/PreviewModal';
import ChatMessage from './components/ChatMessage';
import { pptTemplates, pdfTemplates } from './data/templates';
import { generatePPT } from './utils/pptGenerator';
import { generatePDF } from './utils/pdfGenerator';

export default function ContentGenerator() {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationHistory, setConversationHistory] = useState([]);
  const [selectedPPTTemplate, setSelectedPPTTemplate] = useState(pptTemplates[0]);
  const [selectedPDFTemplate, setSelectedPDFTemplate] = useState(pdfTemplates[0]);
  const [showTemplateSelector, setShowTemplateSelector] = useState(null);
  const [previewData, setPreviewData] = useState(null);
  const [pendingGeneration, setPendingGeneration] = useState(null);
  const messagesEndRef = useRef(null);

  const API_KEY = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
  
  const openai = new OpenAI({
    apiKey: API_KEY,
    dangerouslyAllowBrowser: true,
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    setMessages([
      {
        role: 'assistant',
        content: '👋 Hello! I\'m your AI Content Generator. I can create presentations and PDFs with beautiful templates!\n\n🎨 6 Template Styles:\n• Professional • Vibrant • Modern\n• Nature • Dark • Ocean\n\nJust ask:\n• "Create a PPT about [topic]"\n• "Generate a PDF on [topic]"\n\nThen choose your template and preview before downloading!',
      },
    ]);
  }, []);

  const handleGenerateDocument = async (type, content, title) => {
    try {
      const template = type === 'ppt' ? selectedPPTTemplate : selectedPDFTemplate;
      
      if (type === 'ppt') {
        await generatePPT(content, title, template);
      } else {
        await generatePDF(content, title, template);
      }
      
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: `✅ ${type === 'ppt' ? 'Presentation' : 'PDF'} downloaded successfully using ${template.name} template!`,
        },
      ]);
      
      setPendingGeneration(null);
      setShowTemplateSelector(null);
      setPreviewData(null);
    } catch (error) {
      console.error(`Error generating ${type}:`, error);
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: `❌ Failed to generate ${type}. Please try again.`,
        },
      ]);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      role: 'user',
      content: inputMessage,
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentQuestion = inputMessage;
    setInputMessage('');
    setIsLoading(true);

    try {
      const lowerInput = currentQuestion.toLowerCase();
      const wantsPPT = lowerInput.includes('create ppt') || 
                       lowerInput.includes('generate ppt') || 
                       lowerInput.includes('make ppt') ||
                       lowerInput.includes('create presentation') ||
                       lowerInput.includes('generate presentation');
      
      const wantsPDF = lowerInput.includes('create pdf') || 
                       lowerInput.includes('generate pdf') || 
                       lowerInput.includes('make pdf');

      if (wantsPPT || wantsPDF) {
        const topic = currentQuestion
          .replace(/create|generate|make|ppt|pdf|presentation|about|on|for/gi, '')
          .trim();

        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: `🎨 Creating ${wantsPPT ? 'presentation' : 'PDF'} about "${topic || 'your topic'}"...`,
          },
        ]);

        const response = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: `You are a professional content creator for igyan education platform. Create well-structured, informative content for presentations and documents. Format your response with clear sections separated by double line breaks. Use titles followed by colons for each section.`,
            },
            ...conversationHistory.slice(-5),
            {
              role: 'user',
              content: `Create detailed content about: ${topic || 'the previous discussion'}. Include 4-6 key sections with titles and bullet points.`,
            },
          ],
          temperature: 0.7,
          max_tokens: 1500,
        });

        const aiContent = response.choices[0].message.content;
        const documentTitle = topic || 'AI Generated Content';
        const docType = wantsPPT ? 'ppt' : 'pdf';
        
        setPendingGeneration({ type: docType, content: aiContent, title: documentTitle });
        setShowTemplateSelector(docType);
        
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: `✨ Content ready! Choose a template below and click Preview to see your ${wantsPPT ? 'presentation' : 'document'}.`,
            showTemplateButton: true,
            type: docType,
          },
        ]);

        setConversationHistory((prev) => [
          ...prev,
          { role: 'user', content: currentQuestion },
          { role: 'assistant', content: aiContent },
        ]);
      } else {
        const response = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: `You are a helpful AI assistant for igyan education platform. Help users with their questions and guide them on creating presentations and PDFs. Be friendly and educational.`,
            },
            ...conversationHistory.slice(-10),
            {
              role: 'user',
              content: currentQuestion,
            },
          ],
          temperature: 0.7,
          max_tokens: 1000,
        });

        const aiResponse = response.choices[0].message.content;

        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: aiResponse,
          },
        ]);

        setConversationHistory((prev) => [
          ...prev,
          { role: 'user', content: currentQuestion },
          { role: 'assistant', content: aiResponse },
        ]);
      }
    } catch (error) {
      console.error('Error:', error);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `❌ Sorry, there was an error: ${error.message}`,
        },
      ]);
    } finally {
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
    <div className="flex w-full flex-1 flex-col gap-6 bg-linear-to-br from-green-50 via-blue-50 to-indigo-100/60 p-4 lg:p-8 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
      {/* Header */}
      <header className="grid gap-6 rounded-3xl border border-white/60 bg-white/70 p-6 text-zinc-800 shadow-xl backdrop-blur dark:border-white/10 dark:bg-zinc-900/70 dark:text-zinc-100">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            <span className="rounded-2xl bg-linear-to-r from-green-500 via-teal-500 to-sky-500 p-4 text-white shadow-lg">
              <Sparkles size={28} />
            </span>
            <div>
              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                Content Studio
              </h1>
              <p className="mt-2 max-w-xl text-sm text-zinc-600 dark:text-zinc-400 sm:text-base">
                Generate lesson-ready presentations and polished PDFs in seconds. Pick a template, preview your content, and export instantly.
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            'Ask for a PPT on Sustainable Energy',
            'Generate a PDF about AI Ethics',
            'Summarise class notes into slides',
            'Design a study guide PDF quickly',
          ].map((tip) => (
            <div
              key={tip}
              className="rounded-2xl border border-white/60 bg-white/70 px-4 py-3 text-xs font-medium text-zinc-500 shadow-sm backdrop-blur dark:border-white/10 dark:bg-zinc-900/60 dark:text-zinc-300 sm:text-sm"
            >
              {tip}
            </div>
          ))}
        </div>
      </header>

      {/* Workspace */}
      <section className="flex min-h-[calc(100vh-16rem)] flex-1 flex-col overflow-hidden rounded-3xl border border-white/60 bg-white/80 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-zinc-900/80">
        {/* Conversation */}
        <div className="flex-1 overflow-y-auto px-6 py-8">
          <div className="mx-auto flex max-w-5xl flex-col gap-4">
            {messages.map((message, index) => (
              <ChatMessage key={index} message={message} />
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="flex items-center gap-3 rounded-3xl bg-zinc-100/80 px-5 py-3 text-sm text-zinc-600 shadow-md backdrop-blur dark:bg-zinc-800/80 dark:text-zinc-300">
                  <Loader2 className="h-4 w-4 animate-spin text-emerald-500" />
                  <span>Crafting content…</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Template + Actions */}
        {showTemplateSelector && pendingGeneration && (
          <div className="border-t border-white/70 bg-white/70 p-6 backdrop-blur dark:border-white/10 dark:bg-zinc-900/70">
            <div className="mx-auto w-full max-w-5xl space-y-4">
              <TemplateSelector
                templates={showTemplateSelector === 'ppt' ? pptTemplates : pdfTemplates}
                selectedTemplate={showTemplateSelector === 'ppt' ? selectedPPTTemplate : selectedPDFTemplate}
                onSelect={showTemplateSelector === 'ppt' ? setSelectedPPTTemplate : setSelectedPDFTemplate}
                type={showTemplateSelector}
              />

              <div className="flex flex-col gap-3 text-sm sm:flex-row">
                <button
                  onClick={() => setPreviewData(pendingGeneration)}
                  className="flex-1 rounded-xl border border-indigo-400/60 bg-white/80 px-4 py-3 font-semibold text-indigo-600 shadow-sm transition hover:border-indigo-500 hover:bg-indigo-50 dark:border-indigo-500/30 dark:bg-zinc-900 dark:text-indigo-300 dark:hover:border-indigo-400 dark:hover:bg-zinc-800"
                  type="button"
                >
                  👁️ Preview {pendingGeneration.type === 'ppt' ? 'slides' : 'document'}
                </button>
                <button
                  onClick={() => handleGenerateDocument(
                    pendingGeneration.type,
                    pendingGeneration.content,
                    pendingGeneration.title
                  )}
                  className="flex-1 rounded-xl bg-linear-to-r from-emerald-500 via-teal-500 to-sky-500 px-4 py-3 font-semibold text-white shadow-lg transition hover:shadow-emerald-400/40"
                  type="button"
                >
                  ⬇️ Download {pendingGeneration.type === 'ppt' ? 'PPT' : 'PDF'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Composer */}
        <footer className="border-t border-white/70 bg-white/80 px-6 py-5 backdrop-blur dark:border-white/10 dark:bg-zinc-900/80">
          <div className="mx-auto flex w-full max-w-5xl flex-col gap-3">
            <div className="flex items-center gap-2 text-xs font-medium text-zinc-500 dark:text-zinc-400 sm:text-sm">
              <Download size={16} />
              <span>Try prompts like “Create a PPT about AI in Education” or “Generate a PDF on JavaScript basics”.</span>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Describe what you need and I’ll build the content, e.g. ‘Create a PPT on solar energy for grade 9’."
                disabled={isLoading}
                rows={2}
                className="w-full flex-1 resize-none rounded-2xl border border-zinc-200/80 bg-white/90 px-4 py-3 text-sm text-zinc-800 shadow-sm outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200/70 disabled:cursor-not-allowed disabled:opacity-70 dark:border-zinc-700 dark:bg-zinc-900/80 dark:text-zinc-100 dark:focus:border-emerald-400 dark:focus:ring-emerald-500/30"
              />

              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isLoading}
                className="flex items-center justify-center gap-2 rounded-2xl bg-linear-to-r from-emerald-500 via-teal-500 to-sky-500 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:shadow-emerald-400/40 disabled:cursor-not-allowed disabled:opacity-60"
                type="button"
              >
                <Send size={18} />
                <span>Send</span>
              </button>
            </div>
          </div>
        </footer>
      </section>

      {/* Preview Modal */}
      {previewData && (
        <PreviewModal
          content={previewData.content}
          title={previewData.title}
          type={previewData.type}
          onClose={() => setPreviewData(null)}
          onDownload={() => {
            handleGenerateDocument(
              previewData.type,
              previewData.content,
              previewData.title
            );
          }}
        />
      )}
    </div>
  );
}
