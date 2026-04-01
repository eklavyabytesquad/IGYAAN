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
  const isStudent = user?.role === 'student';
  const brandTagline = isB2C || isStudent ? '' : 'with Safety-Alert For Students';
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
    <div className="flex w-full overflow-hidden" style={{ height: 'calc(100vh - 65px)', backgroundColor: 'var(--dashboard-background)' }}>
      {/* Sidebar — desktop only */}
      <aside className="hidden w-52 shrink-0 flex-col border-r p-3 lg:flex" style={{ borderColor: 'var(--dashboard-border)' }}>
        <div className="mb-4 flex items-center gap-2.5 px-1">
          <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-lg">
            <Image src={brandImage} alt={brandName} fill className="object-cover" priority />
          </div>
          <div>
            <h2 className="text-sm font-semibold" style={{ color: 'var(--dashboard-heading)' }}>{brandName}</h2>
            {brandTagline && <p className="text-[9px] font-medium" style={{ color: 'var(--dashboard-primary)' }}>{brandTagline}</p>}
            <p className="text-[10px]" style={{ color: 'var(--dashboard-muted)' }}>AI Counsellor</p>
          </div>
        </div>

        <div className="space-y-0.5">
          {modes.map((mode) => {
            const Icon = mode.icon;
            const isActive = selectedMode === mode.id;
            return (
              <button
                key={mode.id}
                onClick={() => setSelectedMode(mode.id)}
                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left transition-colors"
                style={{
                  backgroundColor: isActive ? 'color-mix(in srgb, var(--dashboard-primary) 12%, transparent)' : 'transparent',
                }}
              >
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
              </button>
            );
          })}
        </div>
      </aside>

      {/* Main chat column */}
      <section className="flex min-h-0 flex-1 flex-col">
        {/* Top bar — mobile mode selector + current mode label */}
        <div
          className="flex items-center gap-2 border-b px-4 py-2"
          style={{ borderColor: 'var(--dashboard-border)', backgroundColor: 'var(--dashboard-surface-solid)' }}
        >
          {/* Mobile mode chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto lg:hidden">
            {modes.map((mode) => {
              const Icon = mode.icon;
              const isActive = selectedMode === mode.id;
              return (
                <button
                  key={mode.id}
                  onClick={() => setSelectedMode(mode.id)}
                  className="flex shrink-0 items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors"
                  style={{
                    borderColor: isActive ? 'var(--dashboard-primary)' : 'var(--dashboard-border)',
                    backgroundColor: isActive ? 'color-mix(in srgb, var(--dashboard-primary) 10%, transparent)' : 'transparent',
                    color: isActive ? 'var(--dashboard-primary)' : 'var(--dashboard-text)',
                  }}
                >
                  <Icon className="h-3 w-3" />
                  {mode.name}
                </button>
              );
            })}
          </div>

          {/* Desktop label */}
          <div className="hidden items-center gap-1.5 lg:flex">
            <ModeIcon className="h-3.5 w-3.5" style={{ color: 'var(--dashboard-primary)' }} />
            <span className="text-xs font-medium" style={{ color: 'var(--dashboard-muted)' }}>
              {currentMode.name}
            </span>
          </div>
        </div>

        {/* Chat body */}
        <div className="relative flex-1 overflow-y-auto">
          {!hasStartedChat ? (
            /* ---- Empty / Welcome State ---- */
            <div className="absolute inset-0 flex flex-col items-center justify-center px-4">
              <div className="relative mb-3 h-14 w-14 overflow-hidden rounded-2xl shadow-md">
                <Image src={brandImage} alt={brandName} fill className="object-cover" priority />
              </div>
              <h1 className="text-lg font-semibold" style={{ color: 'var(--dashboard-heading)' }}>{brandName}</h1>
              {brandTagline && <p className="text-[10px] font-medium" style={{ color: 'var(--dashboard-primary)' }}>{brandTagline}</p>}
              <p className="mt-0.5 max-w-xs text-center text-xs" style={{ color: 'var(--dashboard-muted)' }}>
                {currentMode.description}
              </p>

              {/* Quick prompts */}
              <div className="mt-6 grid w-full max-w-md gap-2 sm:grid-cols-2">
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
                    className="group flex items-start gap-2 rounded-xl border px-3 py-2.5 text-left text-xs transition-all hover:shadow-sm"
                    style={{
                      borderColor: 'var(--dashboard-border)',
                      color: 'var(--dashboard-text)',
                    }}
                  >
                    <MessageCircle className="mt-0.5 h-3 w-3 shrink-0 opacity-40" />
                    <span>{prompt}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* ---- Messages ---- */
            <div className="mx-auto flex max-w-2xl flex-col gap-3 px-4 py-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex gap-2 ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  {/* Avatar */}
                  {message.role === 'assistant' && (
                    <div className="relative mt-1 h-7 w-7 shrink-0 overflow-hidden rounded-full">
                      <Image src={brandImage} alt={shortName} fill className="object-cover" />
                    </div>
                  )}

                  {message.isRoadmap ? (
                    /* Roadmap card */
                    <div className="max-w-[90%] rounded-2xl rounded-tl-sm p-4" style={{ backgroundColor: 'var(--dashboard-surface-solid)' }}>
                      <div className="mb-2 flex items-center gap-2 border-b pb-2" style={{ borderColor: 'var(--dashboard-border)' }}>
                        <Target className="h-4 w-4" style={{ color: 'var(--dashboard-primary)' }} />
                        <h3 className="text-sm font-semibold" style={{ color: 'var(--dashboard-heading)' }}>{message.content.title}</h3>
                      </div>

                      <p className="mb-2 text-xs" style={{ color: 'var(--dashboard-text)' }}>{message.content.overview}</p>
                      <span
                        className="mb-3 inline-block rounded-md px-2 py-0.5 text-[11px] font-medium"
                        style={{ backgroundColor: 'color-mix(in srgb, var(--dashboard-primary) 10%, transparent)', color: 'var(--dashboard-primary)' }}
                      >
                        Duration: {message.content.duration}
                      </span>

                      <div className="space-y-3">
                        {message.content.phases.map((phase, idx) => (
                          <div key={idx} className="rounded-lg border p-3" style={{ borderColor: 'var(--dashboard-border)' }}>
                            <div className="mb-1.5 flex items-center gap-2">
                              <span
                                className="flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-white"
                                style={{ backgroundColor: 'var(--dashboard-primary)' }}
                              >{idx + 1}</span>
                              <span className="text-xs font-semibold" style={{ color: 'var(--dashboard-heading)' }}>{phase.phase}</span>
                              <span className="ml-auto text-[10px]" style={{ color: 'var(--dashboard-primary)' }}>{phase.duration}</span>
                            </div>
                            <div className="space-y-1.5 text-[11px]" style={{ color: 'var(--dashboard-text)' }}>
                              {phase.goals?.length > 0 && <div><span className="font-semibold" style={{ color: 'var(--dashboard-muted)' }}>Goals: </span>{phase.goals.join(' · ')}</div>}
                              {phase.skills?.length > 0 && <div><span className="font-semibold" style={{ color: 'var(--dashboard-muted)' }}>Skills: </span>{phase.skills.join(' · ')}</div>}
                              {phase.resources?.length > 0 && <div><span className="font-semibold" style={{ color: 'var(--dashboard-muted)' }}>Resources: </span>{phase.resources.join(' · ')}</div>}
                              {phase.milestones?.length > 0 && <div><span className="font-semibold" style={{ color: 'var(--dashboard-muted)' }}>Milestones: </span>{phase.milestones.join(' · ')}</div>}
                            </div>
                          </div>
                        ))}
                      </div>

                      {message.content.tips?.length > 0 && (
                        <div className="mt-3 rounded-lg p-2.5" style={{ backgroundColor: 'color-mix(in srgb, var(--dashboard-primary) 6%, transparent)' }}>
                          <p className="mb-0.5 text-[11px] font-semibold" style={{ color: 'var(--dashboard-heading)' }}>Pro Tips</p>
                          <ul className="ml-3 space-y-0.5 text-[11px]" style={{ color: 'var(--dashboard-text)' }}>
                            {message.content.tips.map((tip, ti) => <li key={ti} className="list-disc">{tip}</li>)}
                          </ul>
                        </div>
                      )}
                    </div>
                  ) : (
                    /* Regular bubble */
                    <div
                      className={`max-w-[75%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed ${
                        message.role === 'user' ? 'rounded-tr-sm' : 'rounded-tl-sm'
                      }`}
                      style={
                        message.role === 'user'
                          ? { background: 'var(--dashboard-primary)', color: '#fff' }
                          : { backgroundColor: 'var(--dashboard-surface-solid)', color: 'var(--dashboard-text)' }
                      }
                    >
                      {message.content}
                    </div>
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-2">
                  <div className="relative mt-1 h-7 w-7 shrink-0 overflow-hidden rounded-full">
                    <Image src={brandImage} alt={shortName} fill className="object-cover" />
                  </div>
                  <div
                    className="flex items-center gap-2 rounded-2xl rounded-tl-sm px-3.5 py-2.5 text-xs"
                    style={{ backgroundColor: 'var(--dashboard-surface-solid)', color: 'var(--dashboard-muted)' }}
                  >
                    <Loader2 className="h-3.5 w-3.5 animate-spin" style={{ color: 'var(--dashboard-primary)' }} />
                    Thinking…
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input bar — always visible */}
        <div
          className="border-t px-4 py-2.5"
          style={{ borderColor: 'var(--dashboard-border)', backgroundColor: 'var(--dashboard-surface-solid)' }}
        >
          <div className="mx-auto flex max-w-2xl items-center gap-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder={`Message ${shortName}…`}
              disabled={isLoading}
              className="flex-1 rounded-lg border bg-transparent px-3 py-2 text-sm outline-none transition placeholder:opacity-50 focus:ring-1 disabled:cursor-not-allowed disabled:opacity-60"
              style={{
                borderColor: 'var(--dashboard-border)',
                color: 'var(--dashboard-text)',
              }}
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isLoading}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-white transition disabled:cursor-not-allowed disabled:opacity-40"
              style={{ background: 'var(--dashboard-primary)' }}
              type="button"
            >
              <Send size={15} />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
