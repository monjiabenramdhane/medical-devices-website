import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const src = searchParams.get('src');

  if (!src) {
    return new NextResponse('Missing src', { status: 400 });
  }

  const imageRes = await fetch(src, {
    headers: {
      'User-Agent': 'Mozilla/5.0',
    },
    cache: 'force-cache',
  });

  const contentType = imageRes.headers.get('content-type') || 'image/jpeg';
  const buffer = await imageRes.arrayBuffer();

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}
