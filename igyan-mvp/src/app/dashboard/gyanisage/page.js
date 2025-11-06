'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Heart, Brain, Target, Sparkles, BookOpen, TrendingUp } from 'lucide-react';
import OpenAI from 'openai';

export default function GyanSage() {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMode, setSelectedMode] = useState('counselling');
  const [conversationHistory, setConversationHistory] = useState([]);
  const messagesEndRef = useRef(null);

  const API_KEY = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
  
  const openai = new OpenAI({
    apiKey: API_KEY,
    dangerouslyAllowBrowser: true,
  });

  const modes = [
    {
      id: 'counselling',
      name: 'Life Counselling',
      icon: Heart,
      description: 'Personal guidance and emotional support',
      systemPrompt: `You are GyanSage, a compassionate AI counsellor for students at igyan education platform. You provide:
- Empathetic emotional support and mental health guidance
- Life direction and personal growth advice
- Stress management and well-being strategies
- Healthy coping mechanisms and mindfulness techniques
- Career and life balance guidance

Be warm, understanding, and supportive. Ask follow-up questions to understand students deeply. Provide actionable advice while being non-judgmental.`
    },
    {
      id: 'career',
      name: 'Career Roadmap',
      icon: Target,
      description: 'Career planning and professional growth',
      systemPrompt: `You are GyanSage, an expert career counsellor and roadmap planner for students at igyan education platform. You provide:
- Personalized career path recommendations
- Skills development roadmaps
- Industry insights and trends
- Education and certification guidance
- Professional networking strategies

Be insightful, data-driven, and motivational. Help students create actionable career plans with clear milestones.`
    },
    {
      id: 'academic',
      name: 'Academic Growth',
      icon: BookOpen,
      description: 'Study strategies and academic excellence',
      systemPrompt: `You are GyanSage, an academic excellence coach for students at igyan education platform. You provide:
- Effective study techniques and learning strategies
- Time management and productivity tips
- Exam preparation and stress management
- Subject-specific guidance and resources
- Goal setting and progress tracking

Be encouraging, practical, and results-oriented. Help students achieve their academic goals.`
    },
    {
      id: 'personal',
      name: 'Personal Development',
      icon: TrendingUp,
      description: 'Self-improvement and life skills',
      systemPrompt: `You are GyanSage, a personal development mentor for students at igyan education platform. You provide:
- Self-awareness and personality development
- Communication and leadership skills
- Financial literacy and life skills
- Relationship and social skills guidance
- Habit formation and goal achievement

Be inspiring, practical, and holistic. Help students become well-rounded individuals.`
    }
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const currentMode = modes.find(m => m.id === selectedMode);
    setMessages([
      {
        role: 'assistant',
        content: `🙏 Namaste! I'm **GyanSage**, your AI counsellor and growth companion.\n\n**${currentMode.name}** mode activated.\n\n${currentMode.description}\n\nHow can I guide you today? Share what's on your mind, and I'll provide thoughtful, personalized guidance to help you grow. 🌟`,
      },
    ]);
    setConversationHistory([]);
  }, [selectedMode]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      role: 'user',
      content: inputMessage,
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentQuestion = inputMessage;
    setInputMessage('');
    setIsLoading(true);

    try {
      const currentMode = modes.find(m => m.id === selectedMode);
      
      // Special handling for career roadmap mode
      if (selectedMode === 'career') {
        const response = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: `You are GyanSage, an expert career counsellor and roadmap planner. When creating career roadmaps, you MUST format them as structured JSON with clear phases, milestones, and timelines.

FORMAT YOUR RESPONSE AS JSON:
{
  "title": "Career Roadmap: [Role/Field]",
  "overview": "Brief overview of the career path",
  "duration": "Total estimated timeline (e.g., '2-3 years')",
  "phases": [
    {
      "phase": "Phase 1: Foundation",
      "duration": "3-6 months",
      "goals": ["Goal 1", "Goal 2"],
      "skills": ["Skill 1", "Skill 2"],
      "resources": ["Resource 1", "Resource 2"],
      "milestones": ["Milestone 1", "Milestone 2"]
    }
  ],
  "tips": ["Tip 1", "Tip 2"]
}

Create 4-6 phases with clear progression.`,
            },
            ...conversationHistory.slice(-5),
            {
              role: 'user',
              content: `Create a detailed career roadmap for: ${currentQuestion}`,
            },
          ],
          temperature: 0.7,
          max_tokens: 2000,
          response_format: { type: "json_object" }
        });

        const roadmapData = JSON.parse(response.choices[0].message.content);
        
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: roadmapData,
            isRoadmap: true,
          },
        ]);

        setConversationHistory((prev) => [
          ...prev,
          { role: 'user', content: currentQuestion },
          { role: 'assistant', content: JSON.stringify(roadmapData) },
        ]);
      } else {
        // Regular conversation for other modes
        const response = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: currentMode.systemPrompt,
            },
            ...conversationHistory.slice(-10),
            {
              role: 'user',
              content: currentQuestion,
            },
          ],
          temperature: 0.8,
          max_tokens: 1500,
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
          content: `❌ I apologize, but I encountered an error: ${error.message}\n\nPlease try again or rephrase your question.`,
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

  const currentMode = modes.find(m => m.id === selectedMode);
  const ModeIcon = currentMode.icon;

  return (
    <div className="flex h-screen w-full gap-4 overflow-hidden bg-linear-to-br from-amber-50 via-orange-50 to-rose-50 p-4 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
      {/* Sidebar - Mode Selector */}
      <aside className="hidden w-64 flex-col gap-3 lg:flex">
        <div className="rounded-2xl border border-white/60 bg-white/80 p-4 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-zinc-900/80">
          <div className="mb-4 flex items-center gap-3">
            <span className="rounded-xl bg-linear-to-r from-amber-500 via-orange-500 to-rose-500 p-3 text-white shadow-lg">
              <Brain size={24} />
            </span>
            <div>
              <h2 className="text-lg font-bold text-amber-600 dark:text-amber-400">GyanSage</h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">AI Counsellor</p>
            </div>
          </div>
          <div className="space-y-2">
            {modes.map((mode) => {
              const Icon = mode.icon;
              return (
                <button
                  key={mode.id}
                  onClick={() => setSelectedMode(mode.id)}
                  className={`w-full rounded-xl border p-3 text-left transition-all ${
                    selectedMode === mode.id
                      ? 'border-amber-400 bg-linear-to-br from-amber-50 to-orange-50 shadow-md ring-2 ring-amber-300 dark:from-amber-950 dark:to-orange-950 dark:ring-amber-700'
                      : 'border-white/60 bg-white/70 hover:border-amber-200 hover:bg-amber-50/50 dark:border-white/10 dark:bg-zinc-900/60 dark:hover:border-amber-800'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Icon className={`h-5 w-5 ${selectedMode === mode.id ? 'text-amber-600' : 'text-zinc-500'}`} />
                    <div className="flex-1">
                      <div className={`text-sm font-semibold ${selectedMode === mode.id ? 'text-amber-900 dark:text-amber-200' : 'text-zinc-700 dark:text-zinc-300'}`}>
                        {mode.name}
                      </div>
                      <div className="text-xs text-zinc-500 dark:text-zinc-400">{mode.description}</div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </aside>

      {/* Main Chat Interface */}
      <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-3xl border border-white/60 bg-white/80 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-zinc-900/80">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <div className="mx-auto flex max-w-4xl flex-col gap-6">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.isRoadmap ? (
                  // Roadmap Display
                  <div className="w-full max-w-4xl rounded-3xl bg-linear-to-br from-white to-amber-50/30 p-6 shadow-xl ring-1 ring-amber-200/50 dark:from-zinc-800 dark:to-zinc-900 dark:ring-amber-900/30">
                    <div className="mb-4 flex items-center gap-3 border-b border-amber-200 pb-3 dark:border-amber-900">
                      <Target className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                      <h3 className="text-xl font-bold text-amber-900 dark:text-amber-100">{message.content.title}</h3>
                    </div>
                    
                    <p className="mb-4 text-sm text-zinc-700 dark:text-zinc-300">{message.content.overview}</p>
                    <div className="mb-6 inline-flex items-center gap-2 rounded-lg bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-800 dark:bg-amber-950 dark:text-amber-200">
                      <span>⏱️ Total Duration: {message.content.duration}</span>
                    </div>

                    <div className="space-y-6">
                      {message.content.phases.map((phase, idx) => (
                        <div key={idx} className="rounded-2xl border border-amber-200 bg-white/50 p-5 dark:border-amber-900 dark:bg-zinc-900/50">
                          <div className="mb-3 flex items-center gap-3">
                            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500 text-sm font-bold text-white">
                              {idx + 1}
                            </span>
                            <div className="flex-1">
                              <h4 className="font-bold text-amber-900 dark:text-amber-100">{phase.phase}</h4>
                              <p className="text-xs text-amber-600 dark:text-amber-400">⏱️ {phase.duration}</p>
                            </div>
                          </div>

                          <div className="space-y-3">
                            <div>
                              <p className="mb-1 text-xs font-semibold uppercase text-zinc-600 dark:text-zinc-400">🎯 Goals:</p>
                              <ul className="ml-4 space-y-1 text-sm text-zinc-700 dark:text-zinc-300">
                                {phase.goals.map((goal, gi) => (
                                  <li key={gi} className="list-disc">{goal}</li>
                                ))}
                              </ul>
                            </div>

                            <div>
                              <p className="mb-1 text-xs font-semibold uppercase text-zinc-600 dark:text-zinc-400">💪 Skills to Learn:</p>
                              <ul className="ml-4 space-y-1 text-sm text-zinc-700 dark:text-zinc-300">
                                {phase.skills.map((skill, si) => (
                                  <li key={si} className="list-disc">{skill}</li>
                                ))}
                              </ul>
                            </div>

                            <div>
                              <p className="mb-1 text-xs font-semibold uppercase text-zinc-600 dark:text-zinc-400">📚 Resources:</p>
                              <ul className="ml-4 space-y-1 text-sm text-zinc-700 dark:text-zinc-300">
                                {phase.resources.map((resource, ri) => (
                                  <li key={ri} className="list-disc">{resource}</li>
                                ))}
                              </ul>
                            </div>

                            <div>
                              <p className="mb-1 text-xs font-semibold uppercase text-zinc-600 dark:text-zinc-400">✅ Milestones:</p>
                              <ul className="ml-4 space-y-1 text-sm text-zinc-700 dark:text-zinc-300">
                                {phase.milestones.map((milestone, mi) => (
                                  <li key={mi} className="list-disc">{milestone}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {message.content.tips && message.content.tips.length > 0 && (
                      <div className="mt-6 rounded-2xl bg-amber-100/50 p-4 dark:bg-amber-950/30">
                        <p className="mb-2 text-sm font-bold text-amber-900 dark:text-amber-100">💡 Pro Tips:</p>
                        <ul className="ml-4 space-y-1 text-sm text-zinc-700 dark:text-zinc-300">
                          {message.content.tips.map((tip, ti) => (
                            <li key={ti} className="list-disc">{tip}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ) : (
                  // Regular Message Display
                  <div
                    className={`group relative max-w-[85%] rounded-3xl px-6 py-4 shadow-lg ${
                      message.role === 'user'
                        ? 'bg-linear-to-r from-amber-500 to-orange-500 text-white'
                        : 'bg-linear-to-br from-white to-amber-50/30 text-zinc-800 ring-1 ring-amber-200/50 dark:from-zinc-800 dark:to-zinc-900 dark:text-zinc-100 dark:ring-amber-900/30'
                    }`}
                  >
                    {message.role === 'assistant' && (
                      <div className="mb-2 flex items-center gap-2 text-amber-600 dark:text-amber-400">
                        <ModeIcon className="h-4 w-4" />
                        <span className="text-xs font-semibold uppercase tracking-wide">GyanSage</span>
                      </div>
                    )}
                    <div className="whitespace-pre-wrap text-sm leading-relaxed sm:text-base">
                      {message.content}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="flex items-center gap-3 rounded-3xl bg-linear-to-r from-amber-100 to-orange-100 px-6 py-4 text-sm text-amber-700 shadow-lg dark:from-amber-950 dark:to-orange-950 dark:text-amber-300">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>GyanSage is reflecting on your message...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input */}
        <footer className="border-t border-white/70 bg-white/90 px-6 py-3 backdrop-blur-xl dark:border-white/10 dark:bg-zinc-900/90">
          <div className="mx-auto flex w-full max-w-4xl flex-col gap-2">
            {/* Mobile Mode Selector */}
            <div className="flex items-center gap-2 overflow-x-auto lg:hidden">
              {modes.map((mode) => {
                const Icon = mode.icon;
                return (
                  <button
                    key={mode.id}
                    onClick={() => setSelectedMode(mode.id)}
                    className={`flex items-center gap-2 whitespace-nowrap rounded-lg border px-3 py-2 text-xs font-semibold transition-all ${
                      selectedMode === mode.id
                        ? 'border-amber-400 bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                        : 'border-zinc-200 bg-white text-zinc-600 hover:border-amber-200 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{mode.name}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-2 text-xs font-medium text-zinc-500 dark:text-zinc-400">
              <ModeIcon size={14} />
              <span><strong>{currentMode.name}</strong> mode</span>
            </div>

            <div className="flex gap-2">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Share what's on your mind..."
                disabled={isLoading}
                rows={1}
                className="w-full flex-1 resize-none rounded-xl border border-amber-200/80 bg-white/90 px-4 py-2.5 text-sm text-zinc-800 shadow-sm outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-200/70 disabled:cursor-not-allowed disabled:opacity-70 dark:border-amber-900/30 dark:bg-zinc-900/80 dark:text-zinc-100 dark:focus:border-amber-500 dark:focus:ring-amber-500/30"
              />

              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isLoading}
                className="flex items-center justify-center gap-2 rounded-xl bg-linear-to-r from-amber-500 via-orange-500 to-rose-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:shadow-amber-400/40 disabled:cursor-not-allowed disabled:opacity-60"
                type="button"
              >
                <Send size={16} />
                <span className="hidden sm:inline">Send</span>
              </button>
            </div>
          </div>
        </footer>
      </section>
    </div>
  );
}
