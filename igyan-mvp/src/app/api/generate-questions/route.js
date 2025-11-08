import { NextResponse } from 'next/server';

const OPENAI_API_KEY = process.env.NEXT_PUBLIC_OPENAI_API_KEY;

export async function POST(request) {
  try {
    const { topic, numQuestions, questionType, subject, prompt } = await request.json();

    if (!OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    // Handle direct prompt for question paper generation
    if (prompt) {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { 
              role: 'system', 
              content: 'You are an expert educator specializing in creating professional CBSE question papers. Generate well-formatted question papers with proper sections, instructions, and marking schemes.' 
            },
            { role: 'user', content: prompt }
          ],
          temperature: 0.7,
          max_tokens: 3000,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        return NextResponse.json(
          { error: error.error?.message || 'OpenAI API request failed' },
          { status: response.status }
        );
      }

      const data = await response.json();
      const content = data.choices[0].message.content.trim();

      return NextResponse.json({ content });
    }

    let systemPrompt = '';
    let userPrompt = '';

    if (questionType === 'mcq') {
      systemPrompt = `You are an expert educator specializing in creating high-quality multiple-choice questions. Create questions that test deep understanding, not just memorization. Each question should be clear, unambiguous, and have exactly 4 options with only one correct answer.`;
      
      userPrompt = `Create ${numQuestions} multiple-choice questions on the topic: "${topic}" for ${subject}.

STRICT FORMAT REQUIREMENTS:
Return ONLY a valid JSON array with NO markdown, NO code blocks, NO explanations. Just raw JSON.

Format:
[
  {
    "question": "Question text here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correct_answer": 0,
    "marks": 1
  }
]

Rules:
- correct_answer is the index (0-3) of the correct option
- Make questions challenging and conceptual
- Ensure options are plausible but only one is correct
- Cover different difficulty levels
- Each question worth 1 mark`;
    } else {
      systemPrompt = `You are an expert educator specializing in creating thoughtful viva (oral examination) questions. Create open-ended questions that encourage critical thinking, application of knowledge, and verbal expression. Include suggested comprehensive answers.`;
      
      userPrompt = `Create ${numQuestions} viva (oral examination) questions on the topic: "${topic}" for ${subject}.

STRICT FORMAT REQUIREMENTS:
Return ONLY a valid JSON array with NO markdown, NO code blocks, NO explanations. Just raw JSON.

Format:
[
  {
    "question": "Question text here?",
    "suggested_answer": "Comprehensive answer covering key points...",
    "marks": 5
  }
]

Rules:
- Questions should be open-ended
- Suggested answers should be comprehensive (2-3 sentences minimum)
- Focus on "why" and "how" questions
- Each question worth 5 marks
- Encourage critical thinking and application`;
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(
        { error: error.error?.message || 'OpenAI API request failed' },
        { status: response.status }
      );
    }

    const data = await response.json();
    const content = data.choices[0].message.content.trim();

    // Parse JSON response (remove markdown code blocks if present)
    let questions;
    try {
      // Remove markdown code blocks if present
      const cleanContent = content
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      
      questions = JSON.parse(cleanContent);
      
      // Add unique IDs to each question
      questions = questions.map(q => ({
        ...q,
        id: Date.now() + Math.random()
      }));
    } catch (parseError) {
      console.error('Parse error:', parseError);
      console.error('Content:', content);
      return NextResponse.json(
        { error: 'Failed to parse AI response. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ questions });
  } catch (error) {
    console.error('Error generating questions:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate questions' },
      { status: 500 }
    );
  }
}
