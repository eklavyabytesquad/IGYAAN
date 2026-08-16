import OpenAI from 'openai/index.js';
import { NextResponse } from 'next/server';

const careerPrompt = (name) => `You are ${name}, an expert career counsellor and roadmap planner. Return a detailed career roadmap as JSON with title, overview, duration, phases, and tips. Each phase must include phase, duration, goals, skills, resources, and milestones. Create 4-6 phases with clear progression.`;

export async function POST(request) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: 'AI service is not configured. Add OPENAI_API_KEY to the server environment and restart the app.' },
      { status: 503 },
    );
  }

  try {
    const { mode, shortName, question, history = [], systemPrompt } = await request.json();
    if (!question?.trim()) return NextResponse.json({ error: 'A message is required.' }, { status: 400 });

    const isCareer = mode === 'career';
    const messages = [
      { role: 'system', content: isCareer ? careerPrompt(shortName || 'Gyani Sage') : systemPrompt },
      ...history.slice(isCareer ? -5 : -10),
      { role: 'user', content: isCareer ? `Create a detailed career roadmap for: ${question}` : question },
    ];

    const openai = new OpenAI({ apiKey });
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
      temperature: isCareer ? 0.7 : 0.8,
      max_tokens: isCareer ? 2000 : 1500,
      ...(isCareer ? { response_format: { type: 'json_object' } } : {}),
    });
    const content = completion.choices[0]?.message?.content;
    if (!content) throw new Error('The AI service returned an empty response.');

    return NextResponse.json(isCareer ? { roadmap: JSON.parse(content) } : { answer: content });
  } catch (error) {
    console.error('GyaniSage API error:', error);
    return NextResponse.json({ error: 'Unable to get a response right now. Please try again.' }, { status: 500 });
  }
}
