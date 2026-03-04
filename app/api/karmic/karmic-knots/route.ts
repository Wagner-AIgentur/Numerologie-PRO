import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { generateKarmicKnotsPDF } from '@/lib/numerology/karmic/karmicknots-pdf-generator';
import { rateLimit, getClientIp } from '@/lib/rate-limit';

export const runtime = 'nodejs';
export const maxDuration = 60;

const schema = z.object({
  birthdate: z.string().regex(/^\d{1,2}\.\d{1,2}\.\d{4}$/, 'Expected DD.MM.YYYY'),
  name: z.string().min(1).max(100).optional(),
  locale: z.enum(['de', 'ru']).optional().default('ru'),
});

/**
 * POST /api/karmic/karmic-knots
 * Generates a Karmic Knots Code PDF (free test).
 */
export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    if (!await rateLimit(`karmic-knots:${ip}`, { preset: 'strict' })) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const body = await request.json();
    const { birthdate, name, locale } = schema.parse(body);

    const defaultName = locale === 'de' ? 'Gast' : 'Гость';

    const pdfBuffer = await generateKarmicKnotsPDF(
      birthdate,
      name || defaultName,
      locale
    );

    return new Response(new Uint8Array(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="karmic-knots-code.pdf"`,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }
    console.error('Karmic Knots PDF generation failed:', error);
    return NextResponse.json(
      { error: 'PDF generation failed' },
      { status: 500 }
    );
  }
}
