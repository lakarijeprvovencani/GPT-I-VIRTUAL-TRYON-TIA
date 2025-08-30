import { NextRequest, NextResponse } from 'next/server';
import { fileToB64 } from '@/app/lib/b64';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function runWithGemini(userPhoto: File, clothingPhoto?: File) {
  const { GoogleGenerativeAI } = await import('@google/generative-ai');
  const apiKey = process.env.GEMINI_API_KEY!;
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-image-preview' });

  const parts: any[] = [
    {
      text:
        'Put the clothing from the second image onto the person in the first image. Make it look realistic and natural.',
    },
    {
      inlineData: {
        mimeType: userPhoto.type || 'image/jpeg',
        data: await fileToB64(userPhoto),
      },
    },
  ];

  if (clothingPhoto) {
    parts.push({
      inlineData: {
        mimeType: clothingPhoto.type || 'image/jpeg',
        data: await fileToB64(clothingPhoto),
      },
    });
  }

  // generate
  const resp = await model.generateContent({ contents: [{ role: 'user', parts }] });

  // extract image
  const cand = resp.response?.candidates?.[0];
  const outParts = cand?.content?.parts || [];
  for (const p of outParts) {
    const inline = (p as any).inlineData;
    if (inline?.data) {
      const mime = inline.mimeType || 'image/png';
      const buf = Buffer.from(inline.data, 'base64');
      return { ok: true as const, mime, buf };
    }
  }

  // if only text
  let text = '';
  for (const p of outParts) if ((p as any).text) text += (p as any).text + '\n';
  return { ok: false as const, message: text || 'No image in response (Gemini).' };
}

async function runWithVertex(userPhoto: File, clothingPhoto?: File) {
  const { VertexAI } = await import('@google-cloud/vertexai');
  const project = process.env.GOOGLE_PROJECT_ID!;
  const location = process.env.GOOGLE_LOCATION || 'global';
  const vertex = new VertexAI({ project, location });
  const model = vertex.getGenerativeModel({ model: 'gemini-2.5-flash-image-preview' });

  const parts: any[] = [
    {
      text:
        'Create a photorealistic virtual try-on image. Take the person from the first image and dress them in the clothing item from the second image. Preserve the person\'s face, body proportions, and natural lighting. The result should look like a professional product photo where the person is naturally wearing the garment.',
    },
    {
      inlineData: {
        mimeType: userPhoto.type || 'image/jpeg',
        data: await fileToB64(userPhoto),
      },
    },
  ];

  if (clothingPhoto) {
    parts.push({
      inlineData: {
        mimeType: clothingPhoto.type || 'image/jpeg',
        data: await fileToB64(clothingPhoto),
      },
    });
  }

  const res = await model.generateContent({ contents: [{ role: 'user', parts }] });
  const cand = (res as any).response?.candidates?.[0];
  const outParts = cand?.content?.parts || [];
  for (const p of outParts) {
    const inline = (p as any).inlineData;
    if (inline?.data) {
      const mime = inline.mimeType || 'image/png';
      const buf = Buffer.from(inline.data, 'base64');
      return { ok: true as const, mime, buf };
    }
  }
  let text = '';
  for (const p of outParts) if ((p as any).text) text += (p as any).text + '\n';
  return { ok: false as const, message: text || 'No image in response (Vertex).' };
}

export async function POST(req: NextRequest) {
  const started = Date.now();
  try {
    const form = await req.formData();
    const userPhoto = form.get('userPhoto') as File | null;
    const clothingPhoto = form.get('clothingPhoto') as File | null;
    if (!userPhoto) {
      return NextResponse.json({ error: 'userPhoto is required' }, { status: 400 });
    }

    const useGemini = String(process.env.USE_GEMINI_API || 'true') === 'true';

    const run = useGemini ? runWithGemini : runWithVertex;
    const out = await run(userPhoto, clothingPhoto || undefined);

    if (out.ok) {
      console.log('[VTO] OK', useGemini ? 'GEMINI' : 'VERTEX', 'bytes=', out.buf.length, 'ms=', Date.now() - started);
      return new NextResponse(out.buf, {
        status: 200,
        headers: { 'Content-Type': out.mime, 'Cache-Control': 'no-store' },
      });
    }

    console.warn('[VTO] NO-IMAGE', useGemini ? 'GEMINI' : 'VERTEX', out.message?.slice(0, 200));
    return NextResponse.json({ error: out.message || 'No image.' }, { status: 502 });
  } catch (e: any) {
    // KLJUČNO: nikad HTML – uvek JSON sa detaljima!
    console.error('[VTO] ERROR', e?.message || e);
    const detail = e?.response?.data || e?.stack || String(e);
    return NextResponse.json({ error: 'Try-on failed', detail }, { status: 500 });
  }
}
