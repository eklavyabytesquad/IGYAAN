'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Heart, Brain, Target, Sparkles, BookOpen, TrendingUp } from 'lucide-react';
import OpenAI from 'openai';

export default function gyanisage() {
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
      systemPrompt: `You are Gyani Sage, a compassionate AI counsellor for students at igyan education platform. You provide:
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
      systemPrompt: `You are Gyani Sage, an expert career counsellor and roadmap planner for students at igyan education platform. You provide:
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
      systemPrompt: `You are Gyani Sage, an academic excellence coach for students at igyan education platform. You provide:
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
      systemPrompt: `You are Gyani Sage, a personal development mentor for students at igyan education platform. You provide:
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
        content: `🙏 Namaste! I'm **Gyani Sage**, your AI counsellor and growth companion.\n\n**${currentMode.name}** mode activated.\n\n${currentMode.description}\n\nHow can I guide you today? Share what's on your mind, and I'll provide thoughtful, personalized guidance to help you grow. 🌟`,
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
              content: `You are Gyani Sage, an expert career counsellor and roadmap planner. When creating career roadmaps, you MUST format them as structured JSON with clear phases, milestones, and timelines.

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
    <div className="flex h-screen w-full gap-4 overflow-hidden p-4" style={{ backgroundColor: 'var(--dashboard-background)' }}>
      {/* Sidebar - Mode Selector */}
      <aside className="hidden w-64 flex-col gap-3 lg:flex">
        <div className="dashboard-card rounded-2xl p-4 shadow-xl">
          <div className="mb-4 flex items-center gap-3">
            <span 
              className="rounded-xl p-3 text-white shadow-lg"
              style={{ background: 'var(--dashboard-primary)' }}
            >
              <Brain size={24} />
            </span>
            <div>
              <h2 className="text-lg font-bold" style={{ color: 'var(--dashboard-primary)' }}>Gyani Sage</h2>
              <p className="text-xs" style={{ color: 'var(--dashboard-muted)' }}>AI Counsellor</p>
            </div>
          </div>
          <div className="space-y-2">
            {modes.map((mode) => {
              const Icon = mode.icon;
              return (
                <button
                  key={mode.id}
                  onClick={() => setSelectedMode(mode.id)}
                  className="w-full rounded-xl border p-3 text-left transition-all"
                  style={{
                    borderColor: selectedMode === mode.id ? 'var(--dashboard-primary)' : 'var(--dashboard-border)',
                    backgroundColor: selectedMode === mode.id ? 'var(--dashboard-surface-solid)' : 'transparent',
                    boxShadow: selectedMode === mode.id ? '0 0 0 2px var(--dashboard-primary-light, var(--dashboard-primary))' : 'none'
                  }}
                >
                  <div className="flex items-center gap-2">
                    <Icon 
                      className="h-5 w-5" 
                      style={{ color: selectedMode === mode.id ? 'var(--dashboard-primary)' : 'var(--dashboard-muted)' }}
                    />
                    <div className="flex-1">
                      <div 
                        className="text-sm font-semibold"
                        style={{ color: selectedMode === mode.id ? 'var(--dashboard-heading)' : 'var(--dashboard-text)' }}
                      >
                        {mode.name}
                      </div>
                      <div className="text-xs" style={{ color: 'var(--dashboard-muted)' }}>{mode.description}</div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </aside>

      {/* Main Chat Interface */}
      <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-3xl dashboard-card shadow-2xl">
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
                  <div className="w-full max-w-4xl rounded-3xl dashboard-card p-6 shadow-xl">
                    <div className="mb-4 flex items-center gap-3 border-b pb-3" style={{ borderColor: 'var(--dashboard-border)' }}>
                      <Target className="h-6 w-6" style={{ color: 'var(--dashboard-primary)' }} />
                      <h3 className="text-xl font-bold" style={{ color: 'var(--dashboard-heading)' }}>{message.content.title}</h3>
                    </div>
                    
                    <p className="mb-4 text-sm" style={{ color: 'var(--dashboard-text)' }}>{message.content.overview}</p>
                    <div 
                      className="mb-6 inline-flex items-center gap-2 rounded-lg px-3 py-1 text-sm font-semibold"
                      style={{ 
                        backgroundColor: 'var(--dashboard-surface-solid)',
                        color: 'var(--dashboard-primary)'
                      }}
                    >
                      <span>⏱️ Total Duration: {message.content.duration}</span>
                    </div>

                    <div className="space-y-6">
                      {message.content.phases.map((phase, idx) => (
                        <div key={idx} className="rounded-2xl border dashboard-card p-5" style={{ borderColor: 'var(--dashboard-border)' }}>
                          <div className="mb-3 flex items-center gap-3">
                            <span 
                              className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold text-white"
                              style={{ backgroundColor: 'var(--dashboard-primary)' }}
                            >
                              {idx + 1}
                            </span>
                            <div className="flex-1">
                              <h4 className="font-bold" style={{ color: 'var(--dashboard-heading)' }}>{phase.phase}</h4>
                              <p className="text-xs" style={{ color: 'var(--dashboard-primary)' }}>⏱️ {phase.duration}</p>
                            </div>
                          </div>

                          <div className="space-y-3">
                            <div>
                              <p className="mb-1 text-xs font-semibold uppercase" style={{ color: 'var(--dashboard-muted)' }}>🎯 Goals:</p>
                              <ul className="ml-4 space-y-1 text-sm" style={{ color: 'var(--dashboard-text)' }}>
                                {phase.goals.map((goal, gi) => (
                                  <li key={gi} className="list-disc">{goal}</li>
                                ))}
                              </ul>
                            </div>

                            <div>
                              <p className="mb-1 text-xs font-semibold uppercase" style={{ color: 'var(--dashboard-muted)' }}>💪 Skills to Learn:</p>
                              <ul className="ml-4 space-y-1 text-sm" style={{ color: 'var(--dashboard-text)' }}>
                                {phase.skills.map((skill, si) => (
                                  <li key={si} className="list-disc">{skill}</li>
                                ))}
                              </ul>
                            </div>

                            <div>
                              <p className="mb-1 text-xs font-semibold uppercase" style={{ color: 'var(--dashboard-muted)' }}>📚 Resources:</p>
                              <ul className="ml-4 space-y-1 text-sm" style={{ color: 'var(--dashboard-text)' }}>
                                {phase.resources.map((resource, ri) => (
                                  <li key={ri} className="list-disc">{resource}</li>
                                ))}
                              </ul>
                            </div>

                            <div>
                              <p className="mb-1 text-xs font-semibold uppercase" style={{ color: 'var(--dashboard-muted)' }}>✅ Milestones:</p>
                              <ul className="ml-4 space-y-1 text-sm" style={{ color: 'var(--dashboard-text)' }}>
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
                      <div className="mt-6 rounded-2xl dashboard-card p-4">
                        <p className="mb-2 text-sm font-bold" style={{ color: 'var(--dashboard-heading)' }}>💡 Pro Tips:</p>
                        <ul className="ml-4 space-y-1 text-sm" style={{ color: 'var(--dashboard-text)' }}>
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
                        ? ''
                        : 'dashboard-card'
                    }`}
                    style={message.role === 'user' ? { 
                      background: 'var(--dashboard-primary)', 
                      color: 'white' 
                    } : {}}
                  >
                    {message.role === 'assistant' && (
                      <div className="mb-2 flex items-center gap-2" style={{ color: 'var(--dashboard-primary)' }}>
                        <ModeIcon className="h-4 w-4" />
                        <span className="text-xs font-semibold uppercase tracking-wide">Gyani Sage</span>
                      </div>
                    )}
                    <div 
                      className="whitespace-pre-wrap text-sm leading-relaxed sm:text-base"
                      style={message.role === 'assistant' ? { color: 'var(--dashboard-text)' } : {}}
                    >
                      {message.content}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div 
                  className="flex items-center gap-3 rounded-3xl px-6 py-4 text-sm shadow-lg dashboard-card"
                >
                  <Loader2 className="h-5 w-5 animate-spin" style={{ color: 'var(--dashboard-primary)' }} />
                  <span style={{ color: 'var(--dashboard-text)' }}>Gyani Sage is reflecting on your message...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input */}
        <footer 
          className="border-t px-6 py-3 backdrop-blur-xl"
          style={{ 
            borderColor: 'var(--dashboard-border)',
            backgroundColor: 'var(--dashboard-surface-solid)'
          }}
        >
          <div className="mx-auto flex w-full max-w-4xl flex-col gap-2">
            {/* Mobile Mode Selector */}
            <div className="flex items-center gap-2 overflow-x-auto lg:hidden">
              {modes.map((mode) => {
                const Icon = mode.icon;
                return (
                  <button
                    key={mode.id}
                    onClick={() => setSelectedMode(mode.id)}
                    className="flex items-center gap-2 whitespace-nowrap rounded-lg border px-3 py-2 text-xs font-semibold transition-all"
                    style={{
                      borderColor: selectedMode === mode.id ? 'var(--dashboard-primary)' : 'var(--dashboard-border)',
                      backgroundColor: selectedMode === mode.id ? 'var(--dashboard-surface-solid)' : 'transparent',
                      color: selectedMode === mode.id ? 'var(--dashboard-primary)' : 'var(--dashboard-text)',
                      boxShadow: selectedMode === mode.id ? '0 0 0 1px var(--dashboard-primary)' : 'none'
                    }}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{mode.name}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-2 text-xs font-medium" style={{ color: 'var(--dashboard-muted)' }}>
              <ModeIcon size={14} />
              <span><strong style={{ color: 'var(--dashboard-text)' }}>{currentMode.name}</strong> mode</span>
            </div>

            <div className="flex gap-2">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Share what's on your mind..."
                disabled={isLoading}
                rows={1}
                className="w-full flex-1 resize-none rounded-xl border px-4 py-2.5 text-sm shadow-sm outline-none transition focus:ring-2 disabled:cursor-not-allowed disabled:opacity-70"
                style={{
                  borderColor: 'var(--dashboard-border)',
                  backgroundColor: 'var(--dashboard-background)',
                  color: 'var(--dashboard-text)'
                }}
              />

              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isLoading}
                className="flex items-center justify-center gap-2 rounded-xl px-6 py-2.5 text-sm font-semibold text-white shadow-lg transition disabled:cursor-not-allowed disabled:opacity-60"
                style={{ background: 'var(--dashboard-primary)' }}
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
