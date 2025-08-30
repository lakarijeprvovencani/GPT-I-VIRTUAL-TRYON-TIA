import { NextResponse } from 'next/server';

export async function GET() {
  // 1×1 PNG (crni piksel)
  const pngB64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAASsJTYQAAAAASUVORK5CYII=';
  const buf = Buffer.from(pngB64, 'base64');
  return new NextResponse(buf, {
    status: 200,
    headers: { 'Content-Type': 'image/png', 'Cache-Control': 'no-store' },
  });
}
