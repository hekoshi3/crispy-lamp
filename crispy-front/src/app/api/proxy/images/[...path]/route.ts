import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  try {
    const { path } = await params;
    const imagePath = path.join('/');
    console.log('Fetching image from path:', imagePath);
    
    // Remove 'uploads/' prefix if it exists in the path
    const cleanPath = imagePath.replace(/^uploads\//, '');
    const backendUrl = `http://127.0.0.1:3001/uploads/${cleanPath}`;
    
    console.log('Backend URL:', backendUrl);
    
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