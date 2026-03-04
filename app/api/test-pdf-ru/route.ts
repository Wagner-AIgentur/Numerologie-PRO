import { NextResponse } from 'next/server';
import { generatePremiumPDF } from '@/lib/numerology/premium-pdf-generator';
import { calculateMatrix } from '@/lib/numerology/calculate';
import { requireAdmin } from '@/lib/auth/admin-guard';

export const runtime = 'nodejs'; // Important: Puppeteer requires Node.js runtime
export const maxDuration = 60;

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Test data
    const day = 4;
    const month = 10;
    const year = 2003;
    const birthdate = `${String(day).padStart(2, '0')}.${String(month).padStart(2, '0')}.${year}`;

    // Calculate matrix
    const result = calculateMatrix(day, month, year);

    // Generate PDF in RUSSIAN
    const pdfBuffer = await generatePremiumPDF(
      result,
      birthdate,
      'ru',  // RUSSIAN
      'Светлана Петрова'  // Russian name
    );

    // Return PDF
    return new Response(new Uint8Array(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="test-russian-${birthdate}.pdf"`,
      },
    });
  } catch (error) {
    console.error('Russian PDF generation failed:', error);
    return NextResponse.json(
      { error: 'PDF generation failed' },
      { status: 500 }
    );
  }
}
