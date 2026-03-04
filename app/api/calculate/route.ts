import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { calculateMatrix } from '@/lib/numerology/calculate';
import { rateLimit, getClientIp } from '@/lib/rate-limit';

const calculateSchema = z.object({
  day: z.number().min(1).max(31),
  month: z.number().min(1).max(12),
  year: z.number().min(1900).max(2100),
});

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    if (!await rateLimit(`calculate:${ip}`, { max: 10, windowSeconds: 60 })) {
      return NextResponse.json({ success: false, error: 'Too many requests' }, { status: 429 });
    }

    const body = await request.json();
    const { day, month, year } = calculateSchema.parse(body);

    const result = calculateMatrix(day, month, year);

    return NextResponse.json({ success: true, result });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid input' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, message: 'Calculation error' },
      { status: 500 }
    );
  }
}
