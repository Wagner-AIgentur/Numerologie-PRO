import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { generateYearForecastPDF } from '@/lib/numerology/karmic/yearforecast-pdf-generator';
import { rateLimit, getClientIp } from '@/lib/rate-limit';

export const runtime = 'nodejs';
export const maxDuration = 60;

const schema = z.object({
  birthdate: z.string().regex(/^\d{1,2}\.\d{1,2}\.\d{4}$/, 'Expected DD.MM.YYYY'),
  name: z.string().min(1).max(100).optional(),
  year: z.number().int().min(2020).max(2100).optional(),
  locale: z.enum(['de', 'ru']).optional().default('ru'),
});

/**
 * POST /api/karmic/year-forecast
 * Generates a Year Forecast PDF (free test).
 */
export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    if (!await rateLimit(`karmic-forecast:${ip}`, { preset: 'strict' })) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const body = await request.json();
    const { birthdate, name, year, locale } = schema.parse(body);

    const defaultName = locale === 'de' ? 'Gast' : 'Гость';
    const forecastYear = year || new Date().getFullYear();

    const pdfBuffer = await generateYearForecastPDF(
      birthdate,
      name || defaultName,
      forecastYear,
      locale
    );

    return new Response(new Uint8Array(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="year-forecast-${String(forecastYear).replace(/[^0-9]/g, '')}.pdf"`,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }
    console.error('Year Forecast PDF generation failed:', error);
    return NextResponse.json(
      { error: 'PDF generation failed' },
      { status: 500 }
    );
  }
}
