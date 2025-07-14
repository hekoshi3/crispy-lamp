import { NextRequest } from 'next/server';
import path from 'path';
import { promises as fs } from 'fs';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const imageName = searchParams.get('imageName');

  // Security: Only allow simple filenames
  if (!imageName || imageName.includes('/') || imageName.includes('\\')) {
    const defaultPath = path.join(process.cwd(), 'public/images/default.png');
    const buffer = await fs.readFile(defaultPath);
    return new Response(buffer, {
      headers: { 'Content-Type': 'image/png' },
    });
  }

  const backendUrl = `http://127.0.0.1:3001/uploads/images/${imageName}`;

  try {
    const response = await fetch(backendUrl);
    console.log("check")
    if (response.ok) {
      console.log("ok")
      const arrayBuffer = await response.arrayBuffer();
      const contentType = response.headers.get('content-type') || 'image/png';
      return new Response(arrayBuffer, {
        headers: { 'Content-Type': contentType },
      });
    }
  } catch (e) {
    // fall through to default
  }

  // Serve default image from public folder
  const defaultPath = path.join(process.cwd(), 'public/images/default.png');
  const buffer = await fs.readFile(defaultPath);
  return new Response(buffer, {
    headers: { 'Content-Type': 'image/png' },
  });
}
