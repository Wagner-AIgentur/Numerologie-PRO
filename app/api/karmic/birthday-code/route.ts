import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { generateBirthdayCodePDF } from '@/lib/numerology/karmic/birthday-pdf-generator-v2';
import { rateLimit, getClientIp } from '@/lib/rate-limit';

export const runtime = 'nodejs';
export const maxDuration = 60;

const schema = z.object({
  birthdate: z.string().regex(/^\d{1,2}\.\d{1,2}\.\d{4}$/, 'Expected DD.MM.YYYY'),
  name: z.string().min(1).max(100).optional(),
  locale: z.enum(['de', 'ru']).optional().default('ru'),
});

/**
 * POST /api/karmic/birthday-code
 * Generates a Birthday Code PDF.
 *
 * Body: { birthdate: "DD.MM.YYYY", name?: string, locale?: "de"|"ru" }
 * Returns: PDF binary
 */
export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  if (!await rateLimit(`karmic:${ip}`, { preset: 'strict' })) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  try {
    const body = await request.json();
    const { birthdate, name, locale } = schema.parse(body);

    const defaultName = locale === 'de' ? 'Gast' : 'Гость';

    const pdfBuffer = await generateBirthdayCodePDF(
      birthdate,
      name || defaultName,
      locale
    );

    const safeDate = birthdate.replace(/\./g, '-');
    return new Response(new Uint8Array(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="birthday-code-${safeDate}.pdf"`,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }
    console.error('Birthday Code PDF generation failed:', error);
    return NextResponse.json(
      { error: 'PDF generation failed' },
      { status: 500 }
    );
  }
}
