import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    const response = await fetch('http://127.0.0.1:3001/api/upload/image', {
      method: 'POST',
      body: formData,
    });
    
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Upload proxy error:', error);
    return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const imageName = searchParams.get('imageName');
    
    if (!imageName) {
      return new NextResponse('Image name required', { status: 400 });
    }
    
    const backendUrl = `http://127.0.0.1:3001/uploads/${imageName}`;
    console.log('Fetching image from:', backendUrl);
    
    const response = await fetch(backendUrl);
    
    if (!response.ok) {
      console.error('Backend returned status:', response.status);
      return new NextResponse('Image not found', { status: 404 });
    }
    
    const imageBuffer = await response.arrayBuffer();
    const contentType = response.headers.get('content-type') || 'image/jpeg';
    
    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000',
      },
    });
  } catch (error) {
    console.error('Image proxy error:', error);
    return new NextResponse('Failed to load image', { status: 500 });
  }
}