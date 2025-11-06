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
        const rawTopic = currentQuestion
          .replace(/create|generate|make|ppt|pdf|presentation|about|on|for/gi, '')
          .trim();

        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: `🎨 Analyzing your request and creating ${wantsPPT ? 'presentation' : 'PDF'}...`,
          },
        ]);

        // First AI call: Analyze and fix the topic, then generate structured content
        const response = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: `You are a professional content creator for igyan education platform. 

TASK 1: First, analyze the user's topic request and fix any spelling/grammar errors. Extract the clean topic.

TASK 2: Create comprehensive, well-structured educational content with:
- Clear introduction explaining the topic
- 5-7 detailed sections with descriptive titles
- Each section should have 3-5 bullet points with substantive information
- Include examples, key concepts, and practical insights
- Use professional educational language
- Make content engaging and informative

FORMAT YOUR RESPONSE AS JSON:
{
  "title": "Clean Professional Title (Max 60 chars)",
  "content": "Full formatted content with sections separated by double line breaks. Use section titles followed by colons."
}`,
            },
            ...conversationHistory.slice(-5),
            {
              role: 'user',
              content: `The user wants content about: "${rawTopic || 'the previous discussion'}"

Analyze this topic, fix any errors, and create comprehensive educational content with 5-7 detailed sections. Return as JSON with "title" and "content" fields.`,
            },
          ],
          temperature: 0.7,
          max_tokens: 2000,
          response_format: { type: "json_object" }
        });

        const aiResponse = JSON.parse(response.choices[0].message.content);
        const aiContent = aiResponse.content;
        const documentTitle = aiResponse.title || 'Educational Content';
        const docType = wantsPPT ? 'ppt' : 'pdf';
        
        setPendingGeneration({ type: docType, content: aiContent, title: documentTitle });
        setShowTemplateSelector(docType);
        
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: `📊 **${documentTitle}**\n\n✨ Content generated successfully! I've analyzed your request and created comprehensive educational content with multiple detailed sections.\n\nClick Preview to review or Download to save your ${wantsPPT ? 'presentation' : 'document'}.`,
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

        {/* Persistent actions when content is pending (preview / download) */}
        {pendingGeneration && (
          <div className="border-t border-white/70 bg-white/70 p-4 backdrop-blur dark:border-white/10 dark:bg-zinc-900/70">
            <div className="mx-auto w-full max-w-5xl flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  ✨ Content ready: <span className="font-semibold">{pendingGeneration.title}</span>
                </div>
                <div className="text-xs text-zinc-500 dark:text-zinc-400">Choose Preview or Download. You can also change template style below.</div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPreviewData(pendingGeneration)}
                  className="rounded-xl border border-indigo-400/60 bg-white/80 px-3 py-2 text-sm font-semibold text-indigo-600 shadow-sm transition hover:border-indigo-500 hover:bg-indigo-50 dark:border-indigo-500/30 dark:bg-zinc-900 dark:text-indigo-300"
                >
                  👁️ Preview
                </button>
                <button
                  onClick={() => handleGenerateDocument(pendingGeneration.type, pendingGeneration.content, pendingGeneration.title)}
                  className="rounded-xl bg-linear-to-r from-emerald-500 via-teal-500 to-sky-500 px-3 py-2 text-sm font-semibold text-white shadow-lg transition hover:shadow-emerald-400/40"
                >
                  ⬇️ Download {pendingGeneration.type === 'ppt' ? 'PPT' : 'PDF'}
                </button>
                <button
                  onClick={() => setShowTemplateSelector(pendingGeneration.type)}
                  className="rounded-lg border border-zinc-200 bg-white/90 px-3 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900/80 dark:text-zinc-300"
                >
                  🎨 Choose Template
                </button>
              </div>
            </div>
          </div>
        )}

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
            <div className="flex items-center justify-between gap-2 text-xs font-medium text-zinc-500 dark:text-zinc-400 sm:text-sm">
              <div className="flex items-center gap-2">
                <Download size={16} />
                <span>Type your topic and click Generate →</span>
              </div>
              
              {/* Quick Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={async () => {
                    if (inputMessage.trim() && !isLoading) {
                      const topic = inputMessage.trim();
                      setIsLoading(true);
                      
                      try {
                        setMessages(prev => [
                          ...prev,
                          { role: 'user', content: topic },
                          { role: 'assistant', content: '🎨 Analyzing topic and generating PowerPoint...' }
                        ]);

                        const response = await openai.chat.completions.create({
                          model: 'gpt-4o-mini',
                          messages: [
                            {
                              role: 'system',
                              content: `You are a professional content creator for igyan education platform. 

TASK 1: First, analyze the user's topic request and fix any spelling/grammar errors. Extract the clean topic.

TASK 2: Create comprehensive, well-structured educational content with:
- Clear introduction explaining the topic
- 5-7 detailed sections with descriptive titles
- Each section should have 3-5 bullet points with substantive information
- Include examples, key concepts, and practical insights
- Use professional educational language
- Make content engaging and informative

FORMAT YOUR RESPONSE AS JSON:
{
  "title": "Clean Professional Title (Max 60 chars)",
  "content": "Full formatted content with sections separated by double line breaks. Use section titles followed by colons."
}`,
                            },
                            {
                              role: 'user',
                              content: `The user wants content about: "${topic}". Analyze this topic, fix any errors, and create comprehensive educational content with 5-7 detailed sections. Return as JSON with "title" and "content" fields.`,
                            },
                          ],
                          temperature: 0.7,
                          max_tokens: 2000,
                          response_format: { type: "json_object" }
                        });

                        const aiResponse = JSON.parse(response.choices[0].message.content);
                        
                        setPendingGeneration({ type: 'ppt', content: aiResponse.content, title: aiResponse.title });
                        setShowTemplateSelector('ppt');
                        
                        setMessages(prev => [
                          ...prev.slice(0, -1),
                          { role: 'assistant', content: `📊 **${aiResponse.title}**\n\n✨ PowerPoint ready! Click Preview to review or Download to save.` }
                        ]);
                        
                        setInputMessage('');
                      } catch (error) {
                        console.error('Error:', error);
                        setMessages(prev => [
                          ...prev,
                          { role: 'assistant', content: `❌ Sorry, there was an error: ${error.message}` }
                        ]);
                      } finally {
                        setIsLoading(false);
                      }
                    }
                  }}
                  disabled={!inputMessage.trim() || isLoading}
                  className="flex items-center gap-1.5 rounded-lg border border-blue-300 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-blue-700 dark:bg-blue-950 dark:text-blue-300 dark:hover:bg-blue-900"
                  title="Generate PowerPoint Presentation"
                >
                  📊 PPT
                </button>
                <button
                  onClick={async () => {
                    if (inputMessage.trim() && !isLoading) {
                      const topic = inputMessage.trim();
                      setIsLoading(true);
                      
                      try {
                        setMessages(prev => [
                          ...prev,
                          { role: 'user', content: topic },
                          { role: 'assistant', content: '📄 Analyzing topic and generating PDF...' }
                        ]);

                        const response = await openai.chat.completions.create({
                          model: 'gpt-4o-mini',
                          messages: [
                            {
                              role: 'system',
                              content: `You are a professional content creator for igyan education platform. 

TASK 1: First, analyze the user's topic request and fix any spelling/grammar errors. Extract the clean topic.

TASK 2: Create comprehensive, well-structured educational content with:
- Clear introduction explaining the topic
- 5-7 detailed sections with descriptive titles
- Each section should have 3-5 bullet points with substantive information
- Include examples, key concepts, and practical insights
- Use professional educational language
- Make content engaging and informative

FORMAT YOUR RESPONSE AS JSON:
{
  "title": "Clean Professional Title (Max 60 chars)",
  "content": "Full formatted content with sections separated by double line breaks. Use section titles followed by colons."
}`,
                            },
                            {
                              role: 'user',
                              content: `The user wants content about: "${topic}". Analyze this topic, fix any errors, and create comprehensive educational content with 5-7 detailed sections. Return as JSON with "title" and "content" fields.`,
                            },
                          ],
                          temperature: 0.7,
                          max_tokens: 2000,
                          response_format: { type: "json_object" }
                        });

                        const aiResponse = JSON.parse(response.choices[0].message.content);
                        
                        setPendingGeneration({ type: 'pdf', content: aiResponse.content, title: aiResponse.title });
                        setShowTemplateSelector('pdf');
                        
                        setMessages(prev => [
                          ...prev.slice(0, -1),
                          { role: 'assistant', content: `📄 **${aiResponse.title}**\n\n✨ PDF ready! Click Preview to review or Download to save.` }
                        ]);
                        
                        setInputMessage('');
                      } catch (error) {
                        console.error('Error:', error);
                        setMessages(prev => [
                          ...prev,
                          { role: 'assistant', content: `❌ Sorry, there was an error: ${error.message}` }
                        ]);
                      } finally {
                        setIsLoading(false);
                      }
                    }
                  }}
                  disabled={!inputMessage.trim() || isLoading}
                  className="flex items-center gap-1.5 rounded-lg border border-red-300 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-700 dark:bg-red-950 dark:text-red-300 dark:hover:bg-red-900"
                  title="Generate PDF Document"
                >
                  📄 PDF
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Type your topic (e.g., 'AI in Education' or 'Quantum Physics') then click PPT or PDF button →"
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
