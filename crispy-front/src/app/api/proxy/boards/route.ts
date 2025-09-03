import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    const response = await fetch('http://127.0.0.1:3001/api/boards');
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json({ error: 'Failed to fetch boards' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const adminKey = request.headers.get('x-admin-key');
    
    const response = await fetch('http://127.0.0.1:3001/api/boards', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-key': adminKey || '',
      },
      body: JSON.stringify(body),
    });
    
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json({ error: 'Failed to create board' }, { status: 500 });
  }
}