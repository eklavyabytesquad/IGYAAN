import { NextResponse } from 'next/server';

const API_URL = 'https://ai-shark-api.onrender.com';
const API_KEY = 'shark-team-2024-secure-key-xyz123';

export async function POST(request) {
  try {
    const formData = await request.formData();
    
    console.log('Upload API Route - Processing file upload');
    
    const response = await fetch(`${API_URL}/upload`, {
      method: 'POST',
      headers: {
        'X-API-Key': API_KEY,
      },
      body: formData,
    });

    console.log('Upload API Route - Response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Upload API Route - Error:', errorData);
      return NextResponse.json(
        { error: errorData.error || 'Upload failed' },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('Upload API Route - Success! File ID:', data.file_id);
    console.log('Upload API Route - Full response:', JSON.stringify(data, null, 2));
    return NextResponse.json(data);
  } catch (error) {
    console.error('Upload proxy error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
