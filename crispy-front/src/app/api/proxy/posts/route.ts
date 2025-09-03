import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const threadId = searchParams.get('threadId');
    
    const url = threadId 
      ? `http://127.0.0.1:3001/api/posts?threadId=${threadId}`
      : 'http://127.0.0.1:3001/api/posts';
      
    const response = await fetch(url);
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Creating post with body:', body);
    
    const response = await fetch('http://127.0.0.1:3001/api/posts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    
    console.log('Backend response status:', response.status);
    console.log('Backend response headers:', Object.fromEntries(response.headers.entries()));
    
    // Check if response has content
    const responseText = await response.text();
    console.log('Backend response text:', responseText);
    
    if (!responseText) {
      console.error('Backend returned empty response');
      return NextResponse.json({ error: 'Backend returned empty response' }, { status: 500 });
    }
    
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse backend response as JSON:', parseError);
      console.error('Response text was:', responseText);
      return NextResponse.json({ error: 'Backend returned invalid JSON' }, { status: 500 });
    }
    
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const adminKey = request.headers.get('x-admin-key');
    
    const response = await fetch(`http://127.0.0.1:3001/api/posts/${params.id}`, {
      method: 'PUT',
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
    return NextResponse.json({ error: 'Failed to update post' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const adminKey = request.headers.get('x-admin-key');
    
    const response = await fetch(`http://127.0.0.1:3001/api/posts/${params.id}`, {
      method: 'DELETE',
      headers: {
        'x-admin-key': adminKey || '',
      },
    });
    
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 });
  }
}