import OpenAI from 'openai/index.js';
import { NextResponse } from 'next/server';

export async function POST(request) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: 'AI service is not configured. Add OPENAI_API_KEY to the server environment and restart the app.' },
      { status: 503 },
    );
  }

  try {
    const { messages, contentType } = await request.json();

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'Content instructions are required.' }, { status: 400 });
    }

    const openai = new OpenAI({ apiKey });
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
      temperature: 0.7,
      max_tokens: contentType === 'shark-ppt' ? 3000 : 2000,
      response_format: { type: 'json_object' },
    });
    const content = completion.choices[0]?.message?.content;

    if (!content) throw new Error('The AI service returned an empty response.');

    return NextResponse.json({ content });
  } catch (error) {
    console.error('Content generator API error:', error);
    return NextResponse.json({ error: 'Unable to generate content right now. Please try again.' }, { status: 500 });
  }
}
