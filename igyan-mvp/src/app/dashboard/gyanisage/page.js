'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Heart, Brain, Target, Sparkles, BookOpen, TrendingUp, MessageCircle } from 'lucide-react';
import OpenAI from 'openai';
import { useAuth } from '../../utils/auth_context';
import Image from 'next/image';

export default function GyanisagePage() {
  const { user } = useAuth();
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

  // Determine branding based on user role
  const isB2C = user?.role === 'b2c_student' || user?.role === 'b2c_mentor';
  const brandName = isB2C ? 'GyanAI Sage' : 'Buddy AI';
  const shortName = isB2C ? 'Gyani Sage' : 'Buddy AI';
  const brandImage = isB2C ? '/asset/gyanaisage.jpg' : '/asset/buddyai.jpg';

  const modes = [
    {
      id: 'counselling',
      name: 'Life Counselling',
      icon: Heart,
      description: 'Personal guidance and emotional support',
      systemPrompt: `You are ${shortName}, a compassionate AI counsellor for students at igyan education platform. You provide:
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
      systemPrompt: `You are ${shortName}, an expert career counsellor and roadmap planner for students at igyan education platform. You provide:
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
      systemPrompt: `You are ${shortName}, an academic excellence coach for students at igyan education platform. You provide:
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
      systemPrompt: `You are ${shortName}, a personal development mentor for students at igyan education platform. You provide:
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
    setMessages([]);
    setConversationHistory([]);
  }, [selectedMode, shortName]);

  // Check if chat has started (user has sent at least one message)
  const hasStartedChat = messages.some(m => m.role === 'user');

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
              content: `You are ${shortName}, an expert career counsellor and roadmap planner. When creating career roadmaps, you MUST format them as structured JSON with clear phases, milestones, and timelines.

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
          content: `I apologize, but I encountered an error: ${error.message}\n\nPlease try again or rephrase your question.`,
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
    <div className="flex h-full w-full overflow-hidden" style={{ backgroundColor: 'var(--dashboard-background)' }}>
      {/* Sidebar - Mode Selector (desktop) */}
      <aside className="hidden w-56 shrink-0 flex-col gap-2 p-3 lg:flex">
        <div className="dashboard-card rounded-xl p-3">
          <div className="mb-3 flex items-center gap-2.5">
            <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg">
              <Image 
                src={brandImage}
                alt={brandName}
                fill
                className="object-cover"
                priority
              />
            </div>
            <div>
              <h2 className="text-sm font-semibold" style={{ color: 'var(--dashboard-heading)' }}>{brandName}</h2>
              <p className="text-[11px]" style={{ color: 'var(--dashboard-muted)' }}>AI Counsellor</p>
            </div>
          </div>
          <div className="space-y-1">
            {modes.map((mode) => {
              const Icon = mode.icon;
              const isActive = selectedMode === mode.id;
              return (
                <button
                  key={mode.id}
                  onClick={() => setSelectedMode(mode.id)}
                  className="w-full rounded-lg px-2.5 py-2 text-left transition-all"
                  style={{
                    backgroundColor: isActive ? 'color-mix(in srgb, var(--dashboard-primary) 12%, transparent)' : 'transparent',
                  }}
                >
                  <div className="flex items-center gap-2">
                    <Icon 
                      className="h-4 w-4 shrink-0" 
                      style={{ color: isActive ? 'var(--dashboard-primary)' : 'var(--dashboard-muted)' }}
                    />
                    <span 
                      className="text-xs font-medium"
                      style={{ color: isActive ? 'var(--dashboard-primary)' : 'var(--dashboard-text)' }}
                    >
                      {mode.name}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </aside>

      {/* Main Chat Area */}
      <section className="flex min-h-0 flex-1 flex-col overflow-hidden">
        {/* Welcome / Empty State */}
        {!hasStartedChat ? (
          <div className="flex flex-1 flex-col items-center justify-center px-4">
            <div className="w-full max-w-lg text-center">
              <div className="relative mx-auto mb-4 h-16 w-16 overflow-hidden rounded-2xl shadow-lg">
                <Image src={brandImage} alt={brandName} fill className="object-cover" priority />
              </div>
              <h1 className="text-xl font-semibold" style={{ color: 'var(--dashboard-heading)' }}>{brandName}</h1>
              <p className="mt-1 text-sm" style={{ color: 'var(--dashboard-muted)' }}>{currentMode.description}</p>

              {/* Mode Pills */}
              <div className="mt-6 flex flex-wrap justify-center gap-2">
                {modes.map((mode) => {
                  const Icon = mode.icon;
                  const isActive = selectedMode === mode.id;
                  return (
                    <button
                      key={mode.id}
                      onClick={() => setSelectedMode(mode.id)}
                      className="flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all"
                      style={{
                        borderColor: isActive ? 'var(--dashboard-primary)' : 'var(--dashboard-border)',
                        backgroundColor: isActive ? 'color-mix(in srgb, var(--dashboard-primary) 10%, transparent)' : 'transparent',
                        color: isActive ? 'var(--dashboard-primary)' : 'var(--dashboard-text)',
                      }}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      {mode.name}
                    </button>
                  );
                })}
              </div>

              {/* Quick Prompts */}
              <div className="mt-8 grid gap-2 sm:grid-cols-2">
                {[
                  selectedMode === 'counselling' ? "I'm feeling stressed about exams" : null,
                  selectedMode === 'counselling' ? "Help me manage my anxiety" : null,
                  selectedMode === 'career' ? "Create a roadmap for software engineering" : null,
                  selectedMode === 'career' ? "How to get into data science?" : null,
                  selectedMode === 'academic' ? "Best study techniques for me" : null,
                  selectedMode === 'academic' ? "How to improve my grades?" : null,
                  selectedMode === 'personal' ? "Help me build better habits" : null,
                  selectedMode === 'personal' ? "How to improve communication?" : null,
                ].filter(Boolean).map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => setInputMessage(prompt)}
                    className="rounded-xl border px-3 py-2.5 text-left text-xs transition-all hover:shadow-sm"
                    style={{
                      borderColor: 'var(--dashboard-border)',
                      color: 'var(--dashboard-text)',
                      backgroundColor: 'var(--dashboard-surface-solid)',
                    }}
                  >
                    <MessageCircle className="mb-1 h-3.5 w-3.5" style={{ color: 'var(--dashboard-muted)' }} />
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Chat Messages */
          <div className="flex-1 overflow-y-auto px-4 py-4">
            <div className="mx-auto flex max-w-3xl flex-col gap-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.isRoadmap ? (
                  /* Roadmap Display */
                  <div className="w-full max-w-3xl rounded-2xl dashboard-card p-5">
                    <div className="mb-3 flex items-center gap-2 border-b pb-2" style={{ borderColor: 'var(--dashboard-border)' }}>
                      <Target className="h-5 w-5" style={{ color: 'var(--dashboard-primary)' }} />
                      <h3 className="text-base font-semibold" style={{ color: 'var(--dashboard-heading)' }}>{message.content.title}</h3>
                    </div>
                    
                    <p className="mb-3 text-sm" style={{ color: 'var(--dashboard-text)' }}>{message.content.overview}</p>
                    <div 
                      className="mb-4 inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium"
                      style={{ 
                        backgroundColor: 'color-mix(in srgb, var(--dashboard-primary) 10%, transparent)',
                        color: 'var(--dashboard-primary)'
                      }}
                    >
                      Total Duration: {message.content.duration}
                    </div>

                    <div className="space-y-4">
                      {message.content.phases.map((phase, idx) => (
                        <div key={idx} className="rounded-xl border p-4" style={{ borderColor: 'var(--dashboard-border)' }}>
                          <div className="mb-2 flex items-center gap-2">
                            <span 
                              className="flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold text-white"
                              style={{ backgroundColor: 'var(--dashboard-primary)' }}
                            >
                              {idx + 1}
                            </span>
                            <div className="flex-1">
                              <h4 className="text-sm font-semibold" style={{ color: 'var(--dashboard-heading)' }}>{phase.phase}</h4>
                              <p className="text-[11px]" style={{ color: 'var(--dashboard-primary)' }}>{phase.duration}</p>
                            </div>
                          </div>

                          <div className="space-y-2 text-xs">
                            {phase.goals?.length > 0 && (
                              <div>
                                <p className="mb-0.5 font-semibold uppercase" style={{ color: 'var(--dashboard-muted)' }}>Goals</p>
                                <ul className="ml-3.5 space-y-0.5" style={{ color: 'var(--dashboard-text)' }}>
                                  {phase.goals.map((goal, gi) => <li key={gi} className="list-disc">{goal}</li>)}
                                </ul>
                              </div>
                            )}
                            {phase.skills?.length > 0 && (
                              <div>
                                <p className="mb-0.5 font-semibold uppercase" style={{ color: 'var(--dashboard-muted)' }}>Skills</p>
                                <ul className="ml-3.5 space-y-0.5" style={{ color: 'var(--dashboard-text)' }}>
                                  {phase.skills.map((skill, si) => <li key={si} className="list-disc">{skill}</li>)}
                                </ul>
                              </div>
                            )}
                            {phase.resources?.length > 0 && (
                              <div>
                                <p className="mb-0.5 font-semibold uppercase" style={{ color: 'var(--dashboard-muted)' }}>Resources</p>
                                <ul className="ml-3.5 space-y-0.5" style={{ color: 'var(--dashboard-text)' }}>
                                  {phase.resources.map((resource, ri) => <li key={ri} className="list-disc">{resource}</li>)}
                                </ul>
                              </div>
                            )}
                            {phase.milestones?.length > 0 && (
                              <div>
                                <p className="mb-0.5 font-semibold uppercase" style={{ color: 'var(--dashboard-muted)' }}>Milestones</p>
                                <ul className="ml-3.5 space-y-0.5" style={{ color: 'var(--dashboard-text)' }}>
                                  {phase.milestones.map((milestone, mi) => <li key={mi} className="list-disc">{milestone}</li>)}
                                </ul>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {message.content.tips?.length > 0 && (
                      <div className="mt-4 rounded-xl p-3" style={{ backgroundColor: 'color-mix(in srgb, var(--dashboard-primary) 6%, transparent)' }}>
                        <p className="mb-1 text-xs font-semibold" style={{ color: 'var(--dashboard-heading)' }}>Pro Tips</p>
                        <ul className="ml-3.5 space-y-0.5 text-xs" style={{ color: 'var(--dashboard-text)' }}>
                          {message.content.tips.map((tip, ti) => <li key={ti} className="list-disc">{tip}</li>)}
                        </ul>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Regular Message */
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                      message.role === 'user' ? '' : 'dashboard-card'
                    }`}
                    style={message.role === 'user' ? { 
                      background: 'var(--dashboard-primary)', 
                      color: 'white' 
                    } : {}}
                  >
                    {message.role === 'assistant' && (
                      <div className="mb-1 flex items-center gap-1.5" style={{ color: 'var(--dashboard-primary)' }}>
                        <ModeIcon className="h-3.5 w-3.5" />
                        <span className="text-[11px] font-semibold uppercase tracking-wide">{shortName}</span>
                      </div>
                    )}
                    <div 
                      className="whitespace-pre-wrap text-sm leading-relaxed"
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
                <div className="flex items-center gap-2 rounded-2xl px-4 py-3 text-sm dashboard-card">
                  <Loader2 className="h-4 w-4 animate-spin" style={{ color: 'var(--dashboard-primary)' }} />
                  <span style={{ color: 'var(--dashboard-muted)' }}>{shortName} is thinking...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>
        )}

        {/* Input Footer */}
        <footer 
          className="border-t px-4 py-2.5"
          style={{ 
            borderColor: 'var(--dashboard-border)',
            backgroundColor: 'var(--dashboard-surface-solid)'
          }}
        >
          <div className="mx-auto flex w-full max-w-3xl flex-col gap-1.5">
            {/* Mobile Mode Selector */}
            <div className="flex items-center gap-1.5 overflow-x-auto lg:hidden">
              {modes.map((mode) => {
                const Icon = mode.icon;
                const isActive = selectedMode === mode.id;
                return (
                  <button
                    key={mode.id}
                    onClick={() => setSelectedMode(mode.id)}
                    className="flex items-center gap-1.5 whitespace-nowrap rounded-lg border px-2.5 py-1.5 text-[11px] font-medium transition-all"
                    style={{
                      borderColor: isActive ? 'var(--dashboard-primary)' : 'var(--dashboard-border)',
                      backgroundColor: isActive ? 'color-mix(in srgb, var(--dashboard-primary) 10%, transparent)' : 'transparent',
                      color: isActive ? 'var(--dashboard-primary)' : 'var(--dashboard-text)',
                    }}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span>{mode.name}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex gap-2">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder={`Ask ${shortName} anything...`}
                disabled={isLoading}
                rows={1}
                className="w-full flex-1 resize-none rounded-lg border px-3 py-2 text-sm outline-none transition focus:ring-1 disabled:cursor-not-allowed disabled:opacity-70"
                style={{
                  borderColor: 'var(--dashboard-border)',
                  backgroundColor: 'var(--dashboard-background)',
                  color: 'var(--dashboard-text)'
                }}
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isLoading}
                className="flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium text-white transition disabled:cursor-not-allowed disabled:opacity-50"
                style={{ background: 'var(--dashboard-primary)' }}
                type="button"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </footer>
      </section>
    </div>
  );
}
