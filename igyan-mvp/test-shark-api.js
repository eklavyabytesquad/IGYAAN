// Test file - you can delete this after testing
// Run: node test-shark-api.js

const API_URL = 'https://ai-shark-api.onrender.com';
const API_KEY = 'shark-team-2024-secure-key-xyz123';

async function testAsk() {
  console.log('Testing /ask endpoint...');
  
  try {
    const response = await fetch(`${API_URL}/ask`, {
      method: 'POST',
      headers: {
        'X-API-Key': API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        file_id: 'test-file-id',
        query: 'What is this document about?',
      }),
    });

    console.log('Status:', response.status);
    const data = await response.text();
    console.log('Response:', data);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testAsk();
