# AI Tools Suite

A collection of powerful AI-driven tools integrated into the iGyanAI dashboard.

## Available Tools

### 1. Startup Idea Generator
Generate innovative startup ideas based on:
- Your interests and skills
- Industry preferences
- Problem areas you want to solve
- Target audience
- Budget and timeframe considerations

**Features:**
- AI-powered idea generation using GPT-4o
- Detailed business plans with revenue models
- Initial steps and potential challenges
- Success metrics

**Route:** `/dashboard/tools/idea-generation`

### 2. Smart Notes Generator
Transform any topic into comprehensive study notes:
- Select subject and topic
- Choose complexity level (Beginner/Intermediate/Advanced)
- Customize length and style
- Add additional context

**Features:**
- Structured notes with key concepts
- Important definitions and examples
- Practice questions
- Download and copy functionality

**Route:** `/dashboard/tools/notes-generator`

## Coming Soon

- Quiz Generator
- Study Planner
- Code Tutor
- Presentation Builder

## Setup

1. Ensure you have the OpenAI API key configured in your `.env.local` file:
   ```
   NEXT_PUBLIC_OPENAI_API_KEY=your-openai-api-key-here
   ```

2. The tools are accessible from the dashboard sidebar under "AI Tools"

## Technology Stack

- **Next.js 16** - React framework
- **OpenAI GPT-4o** - AI model for content generation
- **Tailwind CSS** - Styling
- **React Hooks** - State management

## API Usage

All tools use the OpenAI API with:
- Model: `gpt-4o`
- Temperature: 0.7-0.8 (for creativity)
- Max tokens: 3000

## File Structure

```
src/app/dashboard/tools/
├── page.js                    # Main tools landing page
├── idea-generation/
│   └── page.js               # Startup Idea Generator
└── notes-generator/
    └── page.js               # Smart Notes Generator
```

## Features

- **Beautiful UI**: Modern, gradient-based designs with smooth animations
- **Dark Mode Support**: All tools support dark mode
- **Responsive**: Works on all device sizes
- **Real-time Generation**: Streaming-like experience with loading states
- **Export Options**: Download and copy generated content
- **Error Handling**: Graceful error messages and retry options
