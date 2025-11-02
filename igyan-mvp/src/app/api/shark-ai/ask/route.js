import { NextResponse } from 'next/server';

const API_URL = 'https://ai-shark-api.onrender.com';
const API_KEY = 'shark-team-2024-secure-key-xyz123';

export async function POST(request) {
  try {
    const body = await request.json();
    
    console.log('Ask API Route - Received request:', body);
    console.log('Forwarding to:', `${API_URL}/ask`);
    
    const response = await fetch(`${API_URL}/ask`, {
      method: 'POST',
      headers: {
        'X-API-Key': API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    console.log('Ask API Route - Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Ask API Route - Error response:', errorText);
      
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        return NextResponse.json(
          { error: `Server error: ${response.status} - ${errorText}` },
          { status: response.status }
        );
      }
      
      return NextResponse.json(
        { error: errorData.error || 'Ask failed' },
        { status: response.status }
      );
    }

    const responseText = await response.text();
    console.log('Ask API Route - Raw response:', responseText);
    
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Ask API Route - JSON parse error:', parseError);
      return NextResponse.json(
        { error: `Invalid JSON response from API: ${responseText.substring(0, 200)}` },
        { status: 500 }
      );
    }
    
    console.log('Ask API Route - Success response:', data);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Ask proxy error:', error);
    console.error('Ask proxy error stack:', error.stack);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
