import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Upload file to OpenAI
    const uploadedFile = await openai.files.create({
      file: file,
      purpose: 'assistants',
    });

    // Create assistant
    const assistant = await openai.beta.assistants.create({
      name: 'Shark AI - PDF Q&A Assistant',
      instructions: 'You are Shark AI, an intelligent document analysis assistant for igyan education platform. Answer questions accurately based on the uploaded PDF file. Provide clear, concise, and helpful responses. Quote relevant sections when appropriate. Admit when information is not in the document. Be educational and supportive in your tone.',
      model: 'gpt-4o-mini',
      tools: [{ type: 'file_search' }],
    });

    // Create vector store
    const vectorStore = await openai.beta.vectorStores.create({
      name: 'Shark AI Document Store',
    });

    // Attach file to vector store
    await openai.beta.vectorStores.files.create(
      vectorStore.id,
      { file_id: uploadedFile.id }
    );

    // Create thread with vector store
    const thread = await openai.beta.threads.create({
      tool_resources: {
        file_search: {
          vector_store_ids: [vectorStore.id],
        },
      },
    });

    return NextResponse.json({
      fileId: uploadedFile.id,
      assistantId: assistant.id,
      threadId: thread.id,
      fileName: file.name,
    });
  } catch (error) {
    console.error('Error uploading to OpenAI:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
